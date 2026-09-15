---
id: "006"
title: A kid's scores and topic progress are still there next visit
status: todo
milestone: M2
requirements: [R-1.3, R-4.4, R-5.2.6, R-5.3.1, R-5.3.2, R-5.3.4, R-5.3.6, R-5.3.7]
depends_on: ["004"]
risk: high
estimate: 3d
blocked_by_question:
issue:
---

## Goal

A kid who scored 4/5 on Space yesterday comes back today and the app still knows it: attempts,
best and last score, and whether each topic is not started, in progress or completed. If the
browser blocks storage, the app still works and says it won't remember.

## Requirements

- **R-1.3** "Progress persists across visits using `localStorage`."
- **R-4.4** "Persistence | Browser `localStorage` only"
- **R-5.2.6** "… Store best score (out of 5) and last score (out of 5) per topic."
- **R-5.3.1** "Persisted per browser, no login:"
- **R-5.3.2** "Per-topic: attempts, best score (out of 5), last score (out of 5), which question IDs were last served (optional, for variety tracking), completion status (not started / in progress / completed)."
- **R-5.3.4** "Data model example (JSON in localStorage key `kids-science-progress`): …"
- **R-5.3.6** "Include a schema `version` field to allow safe migrations if the data shape changes later."
- **R-5.3.7** "Graceful fallback if `localStorage` is unavailable (private browsing, storage full): app still works, just doesn't persist, with a small inline notice."

## Acceptance criteria

- [ ] One progress module is the only code that touches `localStorage`. It reads and writes the key `kids-science-progress` with a `version` field. A grep in the test or a lint rule proves no component calls `localStorage` directly.
- [ ] **C-3/G-1:** starting a quiz on a not-started topic records it as *in progress*. Finishing a quiz records it as *completed*. A completed topic never goes back to in progress (Vitest)
- [ ] **G-2:** only finishing a quiz increments `attempts` and sets `lastScore`. `bestScore` becomes max(previous, score). Abandoning a quiz changes nothing except the not-started → in progress move above (Vitest)
- [ ] Reads are validated against a schema. Unknown fields or wrong types never crash the app (Vitest)
- [ ] A migration path exists from `version` N to the current version. A test fixture of the R-5.3.4 example shape (`"completed": true`, version 1) loads correctly into the three-state model (Vitest)
- [ ] After finishing a quiz and reloading the browser, the results for that topic show the stored best score (Playwright)
- [ ] With `localStorage` blocked, which Playwright can simulate with an init script where access throws, every page works, a quiz can be finished, and a small inline notice says progress won't be saved (Playwright)
- [ ] Storage-full (`QuotaExceededError`) on write shows the same notice and doesn't lose the in-memory result for the current screen (Vitest)

## Notes

- **High risk:** this is a versioned data model holding a child's data, with migrations.
  Get the approach agreed before writing (`.claude/rules/autonomy.md`), and run
  `migration-reviewer` on the schema and migration code.
- The stored value is user-editable and survives upgrades, so treat it as untrusted input
  (ADR-0002).
- **Unreadable or newer-version data is open (G-5).** Until it's decided, don't overwrite a
  value you can't read: run in memory with the notice, and say so in the PR.
- "Question IDs last served" (R-5.3.2, optional) isn't stored. See Q-2.
- Rules: `.claude/rules/data-layer.md`, `.claude/rules/security.md`,
  `.claude/rules/observability.md`, `.claude/rules/react/react-state.md`,
  `.claude/rules/nextjs/server-client-boundary.md`, `.claude/rules/testing.md`

## Out of scope

- Streak (009) and badges (010), which extend this model through its migration path
- Cross-device sync (R-7.1, R-9.1); export (R-9.2)
