---
id: "007"
title: The home grid shows which topics a kid has started, finished, and their best stars
status: todo
milestone: M2
requirements: [R-2.3, R-5.3.2, R-5.4.2]
depends_on: ["006"]
risk: normal
estimate: 1d
blocked_by_question:
issue:
---

## Goal

On the home page, each topic card shows at a glance whether it's new, in progress or done,
and the best stars earned.

## Requirements

- **R-2.3** "Show visible progress (badges, %, streaks) to motivate continued use."
- **R-5.3.2** "Per-topic: … completion status (not started / in progress / completed)."
- **R-5.4.2** "Visual, kid-friendly (progress bars, stars, badge icons) rather than raw numbers."

## Acceptance criteria

*Authored by the planner.*

- [ ] Each card shows one of three visual states for not started, in progress and completed (C-3), each with a text label for screen readers (Playwright + axe)
- [ ] A completed card shows the stars for its best score, using the 004 star mapping (Playwright)
- [ ] With empty storage, all six cards show "not started" (Playwright)
- [ ] The static HTML renders without a hydration warning. The progress badge fills in on the client after mount (Playwright console check)

## Notes

- The grid stays a Server Component. Only a small client badge per card reads progress
  through the 006 module.
- Rules: `.claude/rules/nextjs/server-client-boundary.md`, `.claude/rules/react/react-performance.md`,
  `.claude/rules/react/react-accessibility.md`

## Out of scope

- The full dashboard (008); streak and greeting (009)
