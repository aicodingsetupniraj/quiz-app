---
id: "003"
title: A kid answers 5 random questions with instant feedback
status: todo
milestone: M1
requirements: [R-1.1, R-5.2.1, R-5.2.2, R-5.2.3, R-5.2.5, R-5.5.3, R-2.2, D-quizConfig]
depends_on: ["002"]
risk: normal
estimate: 3d
blocked_by_question:
issue:
---

## Goal

"Start Quiz" draws 5 of the topic's 25 questions at random. The kid answers one at a time,
sees right or wrong with the explanation straight away, and taps "Next" through to the end.

## Requirements

- **R-1.1** "Kids pick a topic, read/watch short content, answer quiz questions, and track their progress over time." *(answer quiz questions)*
- **R-5.2.1** "Each topic has a fixed bank of **25 hardcoded multiple-choice questions** (4 options, 1 correct), each with: … Question text, options, correct answer index, explanation shown after answering, optional image/emoji."
- **R-5.2.2** "**Randomized quiz per attempt:** every time a kid starts (or restarts) a topic's quiz, the app randomly selects **5 questions out of the 25** in that topic's pool (no repeats within the same attempt), using a client-side shuffle (e.g., Fisher–Yates) — no server/randomization backend needed since selection happens entirely in the browser at quiz-start time."
- **R-5.2.3** "This means repeat attempts on the same topic will usually show a different subset of 5 questions, keeping the quiz fresh and discouraging kids from just memorizing answer positions."
- **R-5.2.5** "Quiz flow: one question at a time → select answer → immediate feedback (correct/incorrect + explanation) → "Next" → summary screen at end (score out of 5, % correct, stars/badge earned)." *(the flow up to the summary; the summary is 004)*
- **R-5.5.3** "`/topics/[topicId]/quiz` — Quiz flow."
- **R-2.2** "Reinforce learning with quizzes (multiple choice)."

## Acceptance criteria

*Authored by the planner, from R-5.2.2 and R-5.2.5.*

- [ ] A pure selection function returns `questionsPerAttempt` questions, all from the given topic, none repeated. With an injected random source it is deterministic (Vitest)
- [ ] Over many runs with the real random source, every one of the 25 questions is selected, so there's no fixed subset (Vitest)
- [ ] The selection size comes from `quizConfig.questionsPerAttempt`, not the literal 5: changing the config in a test changes the count (Vitest)
- [ ] The quiz shows one question and its 4 options, plus progress such as "Question 2 of 5" (Playwright)
- [ ] Choosing an option locks the answers and shows correct or incorrect, marks the right option, and shows the explanation (Playwright)
- [ ] "Next" appears only after answering. After the last question it leads to the summary route (Playwright)
- [ ] The whole quiz can be completed with the keyboard alone, and feedback is announced to screen readers through a live region (Playwright + axe)
- [ ] **G-2:** reloading mid-quiz starts a fresh quiz from question 1 with a new random draw. No partial result is kept (Playwright)

## Notes

- A Client Component island inside the topic route: selection happens in the browser at quiz
  start (R-5.2.2), so the draw must not be baked in at build time. Keep selection and scoring
  as plain functions the component calls (`.claude/rules/nextjs/testing.md`: extract the
  decision, test it directly).
- Avoid a hydration mismatch: draw on mount or on start, not during server render.
- Hand the finished result to 004 through a small client-side attempt state. Persistence
  arrives in 006. Don't reach into `localStorage` here.
- **Option order is left as in the content file.** Whether to shuffle options is C-2
  (slice 012). The answer-position skew is known.
- Rules: `.claude/rules/nextjs/server-client-boundary.md`, `.claude/rules/react/react-state.md`,
  `.claude/rules/react/react-accessibility.md`, `.claude/rules/react/react-testing.md`,
  `.claude/rules/testing.md`

## Out of scope

- Shuffling answer options (012, C-2); avoiding repeats across attempts (Q-2)
- Saving anything (006); the summary screen (004)
