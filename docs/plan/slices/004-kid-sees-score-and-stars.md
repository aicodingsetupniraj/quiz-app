---
id: "004"
title: A kid sees their score, percentage and stars, and can retry
status: todo
milestone: M1
requirements: [R-5.2.5, R-5.2.6, R-5.5.4, R-5.3.5]
depends_on: ["003"]
risk: normal
estimate: 2d
blocked_by_question:
issue:
---

## Goal

After the last question, the results page shows "4 out of 5", "80%" and 2 stars. It has a
Retry button that starts a fresh random quiz, and a button to the next topic.

## Requirements

- **R-5.2.5** "… → summary screen at end (score out of 5, % correct, stars/badge earned)." *(score, % and stars; badges come in 010)*
- **R-5.2.6** "Support retaking a quiz any number of times; each retake draws a fresh random set of 5 from the 25-question pool. Store best score (out of 5) and last score (out of 5) per topic." *(retake only; storing scores is 006)*
- **R-5.5.4** "`/topics/[topicId]/results` — Score summary, retry / next topic buttons."
- **R-5.3.5** "Scores are always out of 5 (matching `questionsPerAttempt` in the quiz config), regardless of the 25-question pool size, so scores stay easy for kids to understand and compare across attempts."

## Acceptance criteria

- [ ] **G-3:** a pure function maps score to stars: 0, 1, 2 → 1★; 3, 4 → 2★; 5 → 3★. All six values are tested (Vitest)
- [ ] Percentage = score ÷ `questionsPerAttempt`, rounded to a whole number (Vitest)
- [ ] After finishing a quiz, the results page shows the score "N out of 5", the percentage and the stars, with a text alternative for the stars (Playwright)
- [ ] "Retry" starts a new quiz for the same topic with a fresh random draw (Playwright)
- [ ] A "Next topic" button is present and navigates to another topic's intro (Playwright). **Which topic it goes to is open (G-7).** Use list order, wrapping at the end, until G-7 is decided, and note it in the PR.

## Notes

- The denominator is `questionsPerAttempt` (5 today). "Out of 5" versus the config is C-5,
  and using the config value satisfies both readings.
- **Direct load or refresh of the results page is open (G-6).** Until it's decided, with no
  just-finished attempt, send the kid to the topic intro. That loses no data and invents no
  score. Say so in the PR.
- Rules: `.claude/rules/nextjs/routing.md`, `.claude/rules/react/react-state.md`,
  `.claude/rules/react/react-accessibility.md`, `.claude/rules/testing.md`

## Out of scope

- Best or last score and "new best!" (006); badges earned (010)
