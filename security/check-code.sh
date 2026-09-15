#!/usr/bin/env bash
# The deterministic half of the code rules: one checker, one rule set, two places.
#
# The point of this file is that the check an agent hits while writing a line is the
# same check the pull request hits. Two implementations drift, and the day they do,
# the local one always turns out to be the lenient one - so there is one.
#
#   write time   hooks/code-rules.sh (PreToolUse)  - fast feedback, can be bypassed
#   PR time      .github/workflows/security.yml    - authoritative, cannot
#
# The PR run is the gate. The hook is the early warning. That order matters: a
# developer with a broken local install must not be able to land what CI would deny.
#
# What this is NOT: a proof that code is safe. It is a floor of known-dangerous
# constructs with a high-confidence pattern. Depth comes from Semgrep, the review
# agents, and a human. See security/policy.md.
#
# Usage:
#   check-code.sh --file <path> [<path>...]     scan whole files
#   check-code.sh --content <path>              scan stdin as if it were <path>
#   check-code.sh --diff <base-ref>             scan lines added since <base-ref>
#   check-code.sh --staged                      scan lines added in the index
#   check-code.sh --list                        print the active rules and exit
#
#   --packs a,b     override pack selection (default: setup-version.json, else detect)
#   --patterns <d>  override the pattern directory (default: alongside this script)
#   --warn-only     never exit non-zero on a block finding
#
# Exit: 0 clean or warnings only, 1 at least one `block` finding, 2 bad usage.
#
# Portable shell: no jq, no python, no GNU-only flags. It runs in Git Bash on Windows.

set -uo pipefail

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATTERNS_DIR="${SELF_DIR}/patterns"
MODE=""
PACKS_OVERRIDE=""
WARN_ONLY=0
ARGS=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --file|--content|--diff)   MODE="${1#--}"; shift; ARGS+=("${1:-}"); shift || true ;;
    --staged|--list)           MODE="${1#--}"; shift ;;
    --packs)                   shift; PACKS_OVERRIDE="${1:-}"; shift || true ;;
    --patterns)                shift; PATTERNS_DIR="${1:-}"; shift || true ;;
    --warn-only)               WARN_ONLY=1; shift ;;
    -h|--help)                 sed -n '2,30p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *)                         ARGS+=("$1"); shift ;;
  esac
done

[ -n "$MODE" ] || { echo "check-code.sh: no mode given (--file, --content, --diff, --staged)" >&2; exit 2; }
[ -d "$PATTERNS_DIR" ] || { echo "check-code.sh: no pattern directory at $PATTERNS_DIR" >&2; exit 2; }

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

# ---------------------------------------------------------------------------
# Which packs apply
#
# The stamp is authoritative: /setup-repo and /plan-project write the packs the
# project actually chose. Detection is the fallback for a repo that has not been
# scaffolded yet - it must never be the only answer, or a project silently loses
# rules the day someone reorganises a manifest.
# ---------------------------------------------------------------------------
packs_from_stamp() {
  local f="$ROOT/.claude/setup-version.json"
  [ -f "$f" ] || return 1
  tr -d '\n' < "$f" \
    | sed -n 's/.*"packs"[[:space:]]*:[[:space:]]*\[\([^]]*\)\].*/\1/p' \
    | tr -d '"' | tr ',' ' ' | tr -s ' '
}

packs_detected() {
  local p=""
  if [ -f "$ROOT/package.json" ]; then
    p="$p node"
    grep -q '"next"[[:space:]]*:' "$ROOT/package.json" 2>/dev/null && p="$p nextjs react"
    grep -q '"react"[[:space:]]*:' "$ROOT/package.json" 2>/dev/null && p="$p react"
    grep -q '"@angular/core"' "$ROOT/package.json" 2>/dev/null && p="$p angular"
    grep -q '"vue"[[:space:]]*:' "$ROOT/package.json" 2>/dev/null && p="$p vue"
  fi
  [ -f "$ROOT/pyproject.toml" ] || [ -f "$ROOT/requirements.txt" ] || [ -f "$ROOT/setup.py" ] && p="$p python"
  [ -f "$ROOT/go.mod" ]    && p="$p go"
  [ -f "$ROOT/Cargo.toml" ] && p="$p rust"
  [ -f "$ROOT/pom.xml" ] || [ -f "$ROOT/build.gradle" ] || [ -f "$ROOT/build.gradle.kts" ] && p="$p java"
  ls "$ROOT"/*.csproj "$ROOT"/*.sln >/dev/null 2>&1 && p="$p dotnet"
  printf '%s' "$p"
}

if [ -n "$PACKS_OVERRIDE" ]; then
  PACKS="$(printf '%s' "$PACKS_OVERRIDE" | tr ',' ' ')"
else
  PACKS="$(packs_from_stamp || true)"
  [ -n "${PACKS// /}" ] || PACKS="$(packs_detected)"
fi

# nextjs implies the React and Node rules - an App Router project is all three, and a
# pack list that says only "nextjs" must not quietly drop the XSS and JWT rules.
case " $PACKS " in *" nextjs "*) PACKS="$PACKS react node" ;; esac

PATTERN_FILES=("$PATTERNS_DIR/core.patterns")
for pack in $PACKS; do
  case "$pack" in
    core|"") continue ;;
  esac
  f="$PATTERNS_DIR/${pack}.patterns"
  [ -f "$f" ] || continue
  case " ${PATTERN_FILES[*]} " in *" $f "*) continue ;; esac
  PATTERN_FILES+=("$f")
done

if [ "$MODE" = "list" ]; then
  printf 'packs in force: core %s\n' "$PACKS"
  for f in "${PATTERN_FILES[@]}"; do
    printf '\n%s\n' "$(basename "$f")"
    awk '/^id:/ { id = $2 } /^severity:/ { printf "  %-5s %s\n", $2, id }' "$f"
  done
  exit 0
fi

# ---------------------------------------------------------------------------
# The payload: one line per line to check, as  path <TAB> lineno <TAB> text
# ---------------------------------------------------------------------------
emit_payload() {
  case "$MODE" in
    file)
      for f in "${ARGS[@]}"; do
        [ -f "$f" ] || continue
        awk -v p="$f" '{ printf "%s\t%d\t%s\n", p, NR, $0 }' "$f"
      done
      ;;
    content)
      awk -v p="${ARGS[0]:-unknown}" '{ printf "%s\t%d\t%s\n", p, NR, $0 }'
      ;;
    diff|staged)
      local range
      if [ "$MODE" = "staged" ]; then
        git diff --cached --unified=0 --no-color --diff-filter=ACMR
      else
        range="${ARGS[0]:-HEAD~1}"
        git diff --unified=0 --no-color --diff-filter=ACMR "${range}...HEAD" 2>/dev/null \
          || git diff --unified=0 --no-color --diff-filter=ACMR "${range}"
      fi | awk '
        /^\+\+\+ /      { path = substr($0, 7); next }          # strip "+++ b/"
        /^@@ /          { split($3, a, ","); ln = a[1] + 0; if (ln < 0) ln = -ln; next }
        /^\+/           { printf "%s\t%d\t%s\n", path, ln, substr($0, 2); ln++; next }
      '
      ;;
  esac
}

# ---------------------------------------------------------------------------
# Match. Pattern blocks are key: value, blank-line separated - no delimiter to
# collide with a regex, which a pipe-separated format could not promise.
# ---------------------------------------------------------------------------
{ cat "${PATTERN_FILES[@]}"; printf '\n@@PAYLOAD@@\n'; emit_payload; } | awk -F'\n' '
  function store(   i) {
    if (r_id == "" || r_match == "") { reset(); return }
    n++
    ID[n] = r_id; SEV[n] = (r_sev == "" ? "warn" : r_sev); FILES[n] = r_files
    MATCH[n] = r_match; UNLESS[n] = r_unless; EXCL[n] = r_excl; WHY[n] = r_why
    reset()
  }
  function reset() { r_id=""; r_sev=""; r_files=""; r_match=""; r_unless=""; r_excl=""; r_why="" }

  BEGIN { phase = 1; n = 0; blocks = 0; warns = 0; reset() }

  phase == 1 && $0 == "@@PAYLOAD@@" { store(); phase = 2; next }

  phase == 1 {
    sub(/\r$/, "")
    if ($0 ~ /^[[:space:]]*#/) next
    if ($0 ~ /^[[:space:]]*$/) { store(); next }
    key = $0; sub(/:.*$/, "", key)
    val = $0; sub(/^[^:]*:[[:space:]]*/, "", val)
    # A carriage return here would make every regex unmatchable, and nothing would
    # error - the gate would simply stop finding anything. .gitattributes keeps these
    # files LF; this is the belt to that braces.
    sub(/\r$/, "", val)
    if (key == "id")        r_id = val
    else if (key == "severity") r_sev = val
    else if (key == "files")    r_files = val
    else if (key == "match")    r_match = val
    else if (key == "unless")   r_unless = val
    else if (key == "exclude")  r_excl = val
    else if (key == "why")      r_why = val
    next
  }

  phase == 2 {
    t1 = index($0, "\t"); if (t1 == 0) next
    path = substr($0, 1, t1 - 1)
    rest = substr($0, t1 + 1)
    t2 = index(rest, "\t"); if (t2 == 0) next
    lineno = substr(rest, 1, t2 - 1)
    text = substr(rest, t2 + 1)

    for (i = 1; i <= n; i++) {
      if (FILES[i] != "" && path !~ FILES[i]) continue
      if (EXCL[i]  != "" && path ~ EXCL[i])   continue
      if (text !~ MATCH[i]) continue
      if (UNLESS[i] != "" && text ~ UNLESS[i]) continue
      if (SEV[i] == "block") blocks++; else warns++
      printf "%-5s %-24s %s:%s\n        %s\n", SEV[i], ID[i], path, lineno, WHY[i]
    }
  }

  END {
    if (blocks > 0 || warns > 0)
      printf "\n%d blocking, %d advisory\n", blocks, warns
    exit (blocks > 0 ? 1 : 0)
  }
'
STATUS=$?

[ "$WARN_ONLY" = "1" ] && exit 0
exit "$STATUS"
