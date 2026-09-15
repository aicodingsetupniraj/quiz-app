---
id: "008"
title: A kid opens My Progress and sees every topic's progress and their totals
status: todo
milestone: M2
requirements: [R-5.4.1, R-5.4.2, R-5.5.5, R-5.3.3]
depends_on: ["006"]
risk: normal
estimate: 2d
blocked_by_question:
issue:
---

## Goal

`/progress` shows every topic's state and best stars as progress bars and stars, plus how many
topics are finished and how many quizzes the kid has taken.

## Requirements

- **R-5.4.1** "A "My Progress" page showing all topics with completion state, best scores, badges earned, and current streak." *(topics and best scores; streak comes in 009, badges in 010)*
- **R-5.4.2** "Visual, kid-friendly (progress bars, stars, badge icons) rather than raw numbers."
- **R-5.5.5** "`/progress` — Dashboard of all progress/badges."
- **R-5.3.3** "Global: total topics completed, total quiz attempts taken, streak (days visited in a row), badges earned." *(totals only)*

## Acceptance criteria

*Authored by the planner.*

- [ ] `/progress` lists all 6 topics with their completion state and best-score stars (Playwright)
- [ ] "Topics completed" shows as a progress bar out of 6, using the C-3 "completed" rule (Vitest for the count, Playwright for the display)
- [ ] "Quizzes taken" equals the sum of finished attempts across topics (G-2) (Vitest)
- [ ] With no progress, the page shows a friendly empty state that links to the topics, not zeros and broken bars (Playwright)
- [ ] Reachable from the home page. Direct load by URL works (Playwright)
- [ ] Bars and stars have text alternatives, and contrast passes axe (Playwright + axe)

## Notes

- Keep the totals as derived values computed from the stored per-topic data, not separate
  counters that can drift.
- Rules: `.claude/rules/react/react-state.md`, `.claude/rules/react/react-accessibility.md`,
  `.claude/rules/nextjs/routing.md`, `.claude/rules/testing.md`

## Out of scope

- Streak (009); badges (010); export or print (R-9.2)
