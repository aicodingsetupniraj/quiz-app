# Security policy

What blocks, who waives, and for how long.

Written for a single maintainer. The `owner` on a waiver is you, by name - that is not
bureaucracy, it is what makes an expiry a decision someone has to make rather than a date
that quietly passes. Add roles here when a second person arrives.

## What blocks a merge

| Category | Tool slot | Gate |
|---|---|---|
| Secret scanning | gitleaks | **block** - any finding |
| Stack code rules | `security/check-code.sh` | **block** - any `block` pattern |
| SAST | Semgrep, CodeQL | **block on high** |
| Dependency CVEs | OSV-Scanner, Trivy fs, Dependabot | **block on high** |
| IaC scanning | Checkov, Trivy config | **block on high** |
| Authz tests | `e2e/authz` | **block** - any failure |
| Supply chain | lockfile diff review | review, human judgement |
| License compliance | Syft plus policy | review |
| SBOM | Syft to CycloneDX | artifact, non-blocking |
| DAST | OWASP ZAP | nightly, non-blocking |

Tools are swappable slots. The category is what is durable - replacing Semgrep with something
else does not change that SAST blocks on high.

## Code written by an agent

An agent writes faster than anyone reviews, and it writes plausible code - which is the
problem. A flaw in confident, idiomatic, well-named code survives review that sloppy code
would not. So the controls here are deterministic where they can be, and human where they
cannot.

**One rule set, three call sites.** `security/patterns/*.patterns` holds the rules;
`security/check-code.sh` runs them. The same file, the same patterns, at:

| When | How | Can it be bypassed? |
|---|---|---|
| As a line is written | `PreToolUse` hook, on the text of that edit | Yes - a machine without the plugin, or `CODE_RULES=0` |
| At commit | `pre-commit` | Yes - `--no-verify`, or a clone with no hooks installed |
| **On the pull request** | `security.yml`, on the lines the PR adds | **No** |

That ordering is the design. The first two are feedback, fast and local. **The pull request
is the gate**, because it is the only one that runs on infrastructure the author does not
control. Any control that can be switched off by the thing it constrains is advice.

Two severities, and the split matters:

- **`block`** - a construct with no safe form: a shell interpolation, an unparameterized
  query, deserialization of untrusted input, TLS verification off, a client-side secret.
  Denies the write and fails the PR. Kept deliberately small; a false positive here is how a
  team learns to disable the gate, and a disabled gate protects nobody.
- **`warn`** - a construct that is usually wrong and sometimes right. Reported, never
  blocking. Living in a legacy codebase must not be impossible.

**Tuning is a pull request, not a flag.** `security/patterns/` is a protected path: the agent
cannot edit the rules it is being held to. A wrong pattern is fixed by a human, in a reviewed
PR, and both call sites move together the moment it merges.

**What this is not.** A pattern list is a floor of known-dangerous constructs, not a proof
that code is safe. It cannot see a missing authorization check, a wrong tenant scope, or a
race - those are what the `authz-reviewer` and `security-auditor` agents, the negative
authorization suite, and a human reading the diff are for. Anyone who reads a green
`check-code` run as "this is secure" has misread it.

**The rules the agent works under**, beyond the patterns:

- Every change lands as a **draft PR**. Nothing an agent writes merges itself, however green.
- **High-tier paths** - auth, migrations, infra, CI, the agent's own configuration - are
  denied outright by `protect-paths`, and the agent produces a plan and stops. See
  `.claude/rules/autonomy.md`.
- **Every new entry point ships a negative authorization test** in the same PR, asserting the
  record is unchanged afterwards. A 403 returned after the write still wrote.
- **A secret is never written to a file.** The `block-secrets` hook denies it; the fix is an
  environment variable, never a rephrasing.
- **An agent never waives its own finding.** A suppression needs an owner, and the owner is a
  person.

## Severity

Rate by **consequence times reachability in this codebase**, not by the tool's label.

- **Critical** - unauthenticated remote impact, credential exposure, or cross-tenant data
  access. Stops the release. Fix now.
- **High** - reachable and results in data loss, data exposure, or unauthorized action.
  Blocks the merge.
- **Medium** - real but bounded, or reachable only behind authentication. Fix within the
  sprint, or waive with an expiry inside 30 days.
- **Low** - hardening with no clear path to impact. Fix when the file is next touched.

A tool's "high" in unreachable code is not high here. A tool's "medium" in the request path
may well be. Re-rating is expected, and the reason is written down.

## The 10-minute rule

If the blocking set takes longer than ten minutes, people route around it, and a gate people
route around is not a gate. When it grows past that, move the slowest non-critical scan to
nightly. Do not drop it, and do not make it non-blocking to save time - that is the same as
dropping it, with paperwork.

## Secrets

A committed secret is compromised. Not "potentially exposed" - compromised.

1. **Rotate first.** Before the cleanup, before the postmortem, before anything.
2. Remove it from the code and read it from the environment or the secret manager.
3. Purge from history only after rotation, and only with the team informed.
4. Check the access logs for the window it was live.

Removing a key from the working tree without rotating it changes nothing, and it makes the
problem look solved. Nobody is blamed for a committed secret; not rotating one is different.

## Waivers

A waiver is a decision to accept risk, so it is recorded like one. Every field is required:

```yaml
- id: CVE-2024-12345
  path: packages/api/package-lock.json
  reason: Vulnerable function is not reachable - the CLI entry point is unused here.
  owner: your-github-handle
  expires: 2026-01-15
  ticket: PROJ-482
```

- **Maximum 90 days.** Critical and high: 30.
- **No expiry, no waiver.** A suppression file with no dates is just the list of
  vulnerabilities you have agreed to live with forever.
- **Never widen a waiver beyond the single finding.** A path-level or rule-level blanket
  ignore turns the check off for every file written afterwards, including files that do not
  exist yet.
- Expiry is a decision that came due, not an automatic renewal. If the reason still holds, it
  is written again, freshly, by the owner.

Who may waive: you, for anything - but write the reason as though explaining it to someone
else in six months, because that is who reads it. A waiver you cannot justify in writing is
a finding you have not finished thinking about.

## Reporting a vulnerability

Not in a public issue, and never with a working exploit attached - describe the class of
problem and the path to it.

If this project takes external reports, add a contact here and a response time you can
actually meet. An unanswered security address is worse than none.

## Review cadence

- Threat model: on any change to what data is held or who can reach it, not on a calendar.
- This policy: whenever a gate is added, removed, or re-tiered.
- Waivers: reviewed at expiry, and swept with `/waivers`.
