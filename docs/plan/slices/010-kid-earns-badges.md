---
id: "010"
title: A kid earns badges, sees the new one on the results screen, and all of them on My Progress
status: todo
milestone: M3
requirements: [R-2.3, R-5.2.5, R-5.3.3, R-5.4.1, R-5.4.2, D-badge.first-quiz, D-badge.perfect-score, D-badge.all-topics, D-badge.streak-3, D-badge.quiz-master]
depends_on: ["004", "006", "008", "009"]
risk: normal
estimate: 2d
blocked_by_question:
issue: 21
---

## Goal

Finishing a first quiz shows "⭐ First Steps — new badge!" on the results screen. My Progress
shows all five badges, earned ones lit and the rest locked with how to earn them.

## Requirements

- **R-5.2.5** "… summary screen at end (score out of 5, % correct, stars/badge earned)." *(badge earned)*
- **R-5.3.3** "Global: … badges earned."
- **R-5.4.1** "A "My Progress" page showing … badges earned …"
- **R-5.4.2** "Visual, kid-friendly (progress bars, stars, badge icons) rather than raw numbers."
- **D-badge.first-quiz** "Complete your first quiz."
- **D-badge.perfect-score** "Get 5 out of 5 on any quiz attempt."
- **D-badge.all-topics** "Complete every topic at least once."
- **D-badge.streak-3** "Visit and play 3 days in a row."
- **D-badge.quiz-master** "Take 25 quiz attempts total across all topics."

## Acceptance criteria

A pure badge evaluator over the stored progress, with one Vitest case per badge at its exact
threshold and one just below:

- [ ] `first-quiz`: earned when finished attempts ≥ 1 (G-2: finishing, not starting)
- [ ] `perfect-score`: earned when any finished attempt scores `questionsPerAttempt` (5) (C-5)
- [ ] `all-topics`: earned when all 6 topics are *completed* (C-3: any finished quiz)
- [ ] `streak-3`: earned when the visit streak reaches 3 (C-1: visits count)
- [ ] `quiz-master`: earned at the 25th finished attempt, and not at 24
- [ ] Badges, once earned, stay earned, even if the underlying data would no longer qualify (for example, the streak later resets) (Vitest)
- [ ] Badge names, icons and criteria text come from the content file, not from code (Vitest)
- [ ] The results screen announces each badge newly earned by that attempt, and shows none when nothing new was earned (Playwright)
- [ ] `/progress` shows 5 badges: earned ones with icon and name, locked ones visibly locked with their criteria text, each with a text label (Playwright + axe)

## Notes

- Earned badge IDs are stored as in R-5.3.4 (`"badges": [...]`), through the 006 module.
- The `streak-3` criteria text reads "Visit and play" but is evaluated on visits (C-1). If
  showing that text to kids is misleading, editing the content file is a content change for
  the product owner. Don't reword it in code.
- Rules: `.claude/rules/data-layer.md`, `.claude/rules/react/react-accessibility.md`,
  `.claude/rules/react/react-state.md`, `.claude/rules/testing.md`

## Out of scope

- Sounds or animations for earning (R-9.4); new badge types
