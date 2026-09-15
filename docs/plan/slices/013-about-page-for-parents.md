---
id: "013"
title: A parent reads exactly what the app stores and that it never leaves the device
status: blocked
milestone: M4
requirements: [R-5.5.6, R-3.2, R-6.5, R-1.2]
depends_on: ["010"]
risk: normal
estimate: 1d
blocked_by_question: Q-1
issue:
---

## Goal

A parent opens `/about` and sees, in plain words, every piece of data the app keeps, where
it's kept, and that nothing is sent anywhere.

## Requirements

- **R-5.5.6** "Optional: `/about` for parents (what data is stored — reassure: "everything stays on this device")."
- **R-3.2** "Secondary: parents/teachers who want a no-signup, no-tracking learning tool."
- **R-6.5** "No third-party tracking/analytics that collects PII from kids (COPPA-conscious design)."
- **R-1.2** "No backend, no database — everything (topics, questions, answers, and user progress) lives in the frontend."

## Acceptance criteria

*Authored by the planner. Applies only if Q-1 puts `/about` in v1.*

- [ ] `/about` lists every field the progress model stores (per topic: status, attempts, best and last score; streak; badges) (Playwright)
- [ ] A Vitest test fails if the progress model gains a field the About page doesn't mention, so the page can't silently go out of date
- [ ] The page states that the data is kept in this browser only, is not sent anywhere, and is lost if browser data is cleared (Playwright)
- [ ] Linked from the home page footer. Static, and passes axe (Playwright + axe)

## Notes

- **Blocked on Q-1.** It depends on 010 so that the list of stored fields is final when the
  page is written.
- Whatever this page claims must stay true. 005's "no outside requests" test is what backs
  up "nothing is sent anywhere".
- Rules: `.claude/rules/security.md`, `.claude/rules/nextjs/routing.md`,
  `.claude/rules/react/react-accessibility.md`

## Out of scope

- A "delete my progress" button (not in the PRD); export (R-9.2)
