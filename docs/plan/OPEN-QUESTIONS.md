# Open questions

From `/plan-project` intake, 2026-09-15. Requirement IDs refer to `REQUIREMENTS.md`.

- **Blocking:** a slice can't be designed without the answer. Affected slices are `blocked`.
- **Decided:** answered. See the table below. Slices are written against the answer.
- **Deferrable:** can ship with the question open, or only affects later work.

Where an item has a *recommendation*, that's an input to your decision, not an answer. No slice
is built on it until you agree.

## Decided

Answered by the product owner on 2026-09-15, before slicing. Slices are written against these.

| ID | Decision |
|---|---|
| C-1 + G-4 | **A streak day counts when the app is visited.** A day is the device's local date. Visiting again the same day changes nothing; a visit on the next calendar day adds 1; a visit after missing one or more days resets the streak to 1. So the 3-Day Streak badge means three consecutive days of visits, even though its data-file wording says "visit and play". |
| C-3 + G-1 | **Three states per topic.** *Not started*: no quiz ever started. *In progress*: a quiz started but none finished. *Completed*: at least one quiz finished, at any score. Once completed, a topic stays completed. |
| G-2 | **An attempt counts only when the kid reaches the summary screen.** Leaving or refreshing mid-quiz discards that partial quiz: no attempt, no score, and the next start draws a fresh 5. (Starting still moves a topic from not started to in progress, per C-3.) |
| G-3 | **Stars from a score out of 5:** 0–2 → 1★, 3–4 → 2★, 5 → 3★. Every finished quiz earns at least one star. |

Details of each item follow, with the slices it affects.

---

## Contradictions

Two statements requiring incompatible things. Each needs one side picked.

### C-1 · What counts toward a streak: visiting, or playing? **Decided: visiting**

- R-5.3.3: "streak (days visited in a row)"
- D-badge.streak-3: "Visit and play 3 days in a row."

Under the PRD, opening the app counts. Under the badge, you have to take a quiz. The two
give different streak numbers for the same kid, and the home page, dashboard and badge all
show the streak.

**Decide:** does a day count on visit, or only when at least one quiz is finished that day?
**Slices:** 009, 010.

### C-2 · Answer shuffling is "optional", but the data makes it necessary. **Deferrable (recommend yes)**

- R-5.2.4: "Answer options within each question can optionally also be shuffled for extra variety."
- R-5.2.3: "… discouraging kids from just memorizing answer positions."
- Data: the correct answer is option **B in 57%** of questions and option **D in 1 of 150**.

Randomising *which* 5 questions appear (R-5.2.2) doesn't address this. A kid who always taps
B scores about 3/5. Without option shuffling, the goal in R-5.2.3 fails on this content.

**Decide:** shuffle options on every attempt (recommended), or rebalance `correctIndex` in the
content, or accept the skew.
**Blocks:** slice 012 (`blocked` until decided). 003 ships without shuffling either way.

### C-3 · Topic completion: a boolean or three states? **Decided: three states**

- R-5.3.2: "completion status (not started / in progress / completed)"
- R-5.3.4 example: `"completed": true`

The example model can't represent "in progress". This ties to G-1, which asks what each
state *means*.

**Decide:** the three states in R-5.3.2 (and where they're stored), or a boolean.
**Slices:** 006, 007, 008, 010.

### C-4 · Success metrics can't be measured under the privacy constraints. **Deferrable**

- R-8.1: "% of kids completing at least one full quiz per session."
- R-8.3: "Number of topics completed per active user (localStorage-derived, self-reported/anonymous — no server analytics needed for v1)."
- R-6.5: "No third-party tracking/analytics that collects PII from kids"; R-1.2 "No backend"

A percentage "of kids" or a figure "per active user" is an aggregate across devices. With no
backend and no analytics, nothing ever leaves the device, so no one can compute it.
"Self-reported" isn't described anywhere.

**Decide:** accept that v1 metrics go unmeasured; or allow cookieless, PII-free aggregate
analytics (a new third party, so it needs a privacy review); or define a manual
"self-report" route such as teacher surveys.
**Blocks:** no slice. Choosing analytics would add one, plus a privacy review.

### C-5 · "Always out of 5" versus a configurable attempt size. **Deferrable**

- R-5.3.5: "Scores are always out of 5 (matching `questionsPerAttempt` in the quiz config)"
- R-5.1.6: `quizConfig` exists "so the app logic and content stay in sync if either number changes later."

If `questionsPerAttempt` ever changes, "always 5" and "matching the config" disagree.

**Recommendation:** score out of `questionsPerAttempt`, which is 5 today and satisfies both.
**Decide:** confirm, or pin to 5.
**Slices:** 004, 010 use `questionsPerAttempt`, which satisfies both readings until decided.

---

## Gaps

Behaviour the documents assume but don't specify. If nobody decides, whoever implements it
invents the answer.

### G-1 · What makes a topic "in progress" and "completed"? **Decided (with C-3)**

R-5.3.2 names the states but not the rules. Candidates for "completed": any finished attempt,
a minimum score, or a perfect score. Candidates for "in progress": a quiz started but not
finished, or attempts made without reaching the "completed" rule. D-badge.all-topics
("Complete every topic at least once") depends on this answer.
**Slices:** 006, 007, 008, 010.

### G-2 · When does an attempt count? **Decided: finished only; restart**

Does starting a quiz count, or only finishing it? What happens when a kid leaves mid-quiz or
refreshes: do they resume, restart, or lose the attempt? This drives "attempts" (R-5.3.2),
"total quiz attempts taken" (R-5.3.3), First Steps ("Complete your first quiz") and Quiz
Master ("Take 25 quiz attempts").
**Slices:** 003, 006, 008, 010.

### G-3 · How many stars does a score earn? **Decided: 1–3 stars**

R-5.2.5 shows "stars/badge earned" on the summary, and R-5.4.2 uses stars on the dashboard.
There's no mapping from a score (0–5) to stars.
**Slices:** 004, 007, 008.

### G-4 · Streak date rules. **Decided (with C-1): local date, miss resets to 1**

What is a "day": the device's local date, presumably? What happens after a missed day: back to
1 or to 0? Is the streak shown on a visit after it has already broken? R-5.3.4 stores only
`lastVisitDate` and `currentStreak`, so a best-ever streak isn't kept.
**Slices:** 009.

### G-5 · Unreadable or newer saved data. **Deferrable**

R-5.3.6 plans for migrations. What should happen when the stored value is corrupt JSON,
edited by hand, or has a *newer* `version` than the app knows (for example after a rollback)?
Overwriting it destroys the kid's progress. Ignoring it means nothing saves.
**Slices:** 006 proceeds, and doesn't overwrite unreadable data until this is decided.

### G-6 · Results page reached directly or refreshed. **Deferrable**

`/topics/[topicId]/results` (R-5.5.4) is a URL. What does it show with no quiz just finished:
the stored last score, or a redirect to the topic intro? And an unknown `topicId` anywhere:
presumably not-found.
**Slices:** 004 proceeds, and sends the kid to the topic intro until this is decided.

### G-7 · "Next topic": which one? **Deferrable**

R-5.5.4's "next topic" button could mean the next in list order, the next not-yet-completed
topic, or something else. What happens after the last topic?
**Slices:** 004 proceeds, using list order and wrapping, until this is decided.

### G-8 · What does the home "greeting" say? **Deferrable**

R-5.5.1 says "greeting". Using the kid's name means asking for and storing it, which is
personal data about a child (R-6.5). A generic or time-of-day greeting needs nothing.
**Recommendation:** generic, no name.
**Slices:** 009. It never stores a name, whatever is decided.

### G-9 · Accessibility bar. **Deferrable**

R-6.2 lists qualities but no standard. **Recommendation:** WCAG 2.2 AA, checked with axe in
the e2e suite, with tap targets of at least 44×44 px.
**Slices:** 011.

### G-10 · "read/watch": is video in v1? **Deferrable**

R-1.1 says "read/watch short content". R-5.1.3 and the data have only text fun facts.
**Recommendation:** no video in v1 (the content has none), and record that choice.
**Slices:** none.

---

## Open questions the documents leave open

The PRD marks each of these "optional". Each needs an in-or-out decision for v1.

| ID | Question | Source | Class | Blocks |
|---|---|---|---|---|
| Q-1 | Build the `/about` page for parents in v1? | R-5.5.6 | Deferrable | 013 (`blocked`) |
| Q-2 | Track "question IDs last served" to avoid repeating a set across attempts, or pure random? | R-5.3.2 "(optional, for variety tracking)"; D-quizConfig `random-no-repeat-within-attempt` | Deferrable | nothing: pure random is what the data file specifies |
| Q-3 | Support the optional per-question image/emoji? No question uses it today. | R-5.2.1 | Deferrable | nothing |
| Q-4 | Static export (`output: 'export'`) or standard Vercel hosting? | R-6.1 "either works" | Deferrable | 005 proceeds on standard Vercel hosting, which needs no config |
| Q-5 | Is `docs/topics-data.json` the file the app imports, or does it move under `src/`? Two copies would drift. | R-5.1.5 | Deferrable | 001 imports the file where it is |
