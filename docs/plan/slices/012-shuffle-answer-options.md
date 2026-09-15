---
id: "012"
title: Answer options appear in a new order each attempt, so tapping "B" stops working
status: blocked
milestone: M4
requirements: [R-5.2.4, R-5.2.3]
depends_on: ["003"]
risk: normal
estimate: 1d
blocked_by_question: C-2
issue: 15
---

## Goal

A kid who has learned "the answer is usually the second one" can't score that way any more,
because each question's four options are shuffled every attempt.

## Requirements

- **R-5.2.4** "Answer options within each question can optionally also be shuffled for extra variety."
- **R-5.2.3** "… keeping the quiz fresh and discouraging kids from just memorizing answer positions."

## Acceptance criteria

*Authored by the planner. Applies only if C-2 is decided as "shuffle".*

- [ ] A pure function shuffles a question's options and returns the correct answer's new index. The correct option's *text* is unchanged (Vitest)
- [ ] Over many shuffles, the correct answer lands in each of the 4 positions roughly equally, so the content file's skew toward B is gone (Vitest, statistical bound)
- [ ] Feedback and scoring use the shuffled index: answering the correct text is always marked correct (Vitest + Playwright)
- [ ] Order is fixed for the life of one attempt, so re-rendering doesn't reshuffle mid-question (Playwright)

## Notes

- **Blocked on C-2.** The PRD calls shuffling optional, but the content puts the right answer
  at B 57% of the time. The alternative to this slice is rebalancing `correctIndex` in
  `docs/topics-data.json`, which is a content change with no code.
- Rules: `.claude/rules/react/react-state.md`, `.claude/rules/testing.md`

## Out of scope

- Rewriting question content
