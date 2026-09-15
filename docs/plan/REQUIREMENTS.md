# Requirements

Extracted by `/plan-project` on 2026-09-15. Every statement is a **verbatim quote** from its
source. IDs follow the source's own structure and are never renumbered: slices, issues, and
PRs cite them.

## Sources

| Path | Kind | sha256 |
|---|---|---|
| `docs/kids-science-prd.md` | Product requirements document | `07628749ebfaf78e4a50193e4a1a8c6e730a1870f48d1d526f5885662f6c5927` |
| `docs/topics-data.json` | Content data: quiz config, 6 topics × 25 questions, 5 badge definitions | `78b51e2909635cd2365c3e09cc2ac98304f6d04b27ad25946fe88427236eac3e` |

**ID scheme:** `R-<section>.<n>` for the PRD, where `n` is the bullet or row order within
that section. `D-<key>` for the data file.

**Types:** functional · constraint · non-functional · out-of-scope

---

## PRD §1 Overview

| ID | Statement | Type |
|---|---|---|
| R-1.1 | "Kids pick a topic, read/watch short content, answer quiz questions, and track their progress over time." | functional |
| R-1.2 | "No backend, no database — everything (topics, questions, answers, and user progress) lives in the frontend." | constraint |
| R-1.3 | "Progress persists across visits using `localStorage`." | functional |

## PRD §2 Goals

| ID | Statement | Type |
|---|---|---|
| R-2.1 | "Let kids learn science topics in short, digestible chunks." | non-functional |
| R-2.2 | "Reinforce learning with quizzes (multiple choice)." | functional |
| R-2.3 | "Show visible progress (badges, %, streaks) to motivate continued use." | functional |
| R-2.4 | "Zero backend cost/complexity — fully static, deployable to Vercel as a free-tier project." | constraint |

## PRD §3 Target Users

| ID | Statement | Type |
|---|---|---|
| R-3.1 | "Kids ages ~6–12." | non-functional |
| R-3.2 | "Secondary: parents/teachers who want a no-signup, no-tracking learning tool." | constraint |

## PRD §4 Platform & Tech Stack

| ID | Statement | Type |
|---|---|---|
| R-4.1 | "Framework \| Next.js (App Router)" | constraint |
| R-4.2 | "Hosting \| Vercel" | constraint |
| R-4.3 | "Data \| Hardcoded local JSON/TS files (no CMS, no DB)" | constraint |
| R-4.4 | "Persistence \| Browser `localStorage` only" | constraint |
| R-4.5 | "Styling \| Tailwind CSS (kid-friendly, bright, large touch targets)" | constraint |
| R-4.6 | "Auth \| None — anonymous, single-device, single-browser profile" | constraint |

## PRD §5.1 Topics

| ID | Statement | Type |
|---|---|---|
| R-5.1.1 | "A fixed list of science topics (e.g., "Space", "Animals", "Human Body", "Plants", "Weather", "Simple Machines")." | functional |
| R-5.1.2 | "Each topic has: … Title, icon/emoji, short description, difficulty level (Easy/Medium/Hard)." | functional |
| R-5.1.3 | "Optional short intro/"fun facts" content shown before the quiz." | functional |
| R-5.1.4 | "A pool of 25 hardcoded questions (see 5.2 below for how quizzes draw from this pool)." | functional |
| R-5.1.5 | "Data lives in a local file, e.g. `data/topics.ts` (or imported from a JSON file like `topics-data.json`), loaded directly — no fetch, no API route." | constraint |
| R-5.1.6 | "A top-level `quizConfig` value (`questionsPerTopic: 25`, `questionsPerAttempt: 5`) documents the pool/attempt sizing so the app logic and content stay in sync if either number changes later." | constraint |

## PRD §5.2 Questions & Quizzes

| ID | Statement | Type |
|---|---|---|
| R-5.2.1 | "Each topic has a fixed bank of **25 hardcoded multiple-choice questions** (4 options, 1 correct), each with: … Question text, options, correct answer index, explanation shown after answering, optional image/emoji." | functional |
| R-5.2.2 | "**Randomized quiz per attempt:** every time a kid starts (or restarts) a topic's quiz, the app randomly selects **5 questions out of the 25** in that topic's pool (no repeats within the same attempt), using a client-side shuffle (e.g., Fisher–Yates) — no server/randomization backend needed since selection happens entirely in the browser at quiz-start time." | functional |
| R-5.2.3 | "This means repeat attempts on the same topic will usually show a different subset of 5 questions, keeping the quiz fresh and discouraging kids from just memorizing answer positions." | non-functional |
| R-5.2.4 | "Answer options within each question can optionally also be shuffled for extra variety." | functional |
| R-5.2.5 | "Quiz flow: one question at a time → select answer → immediate feedback (correct/incorrect + explanation) → "Next" → summary screen at end (score out of 5, % correct, stars/badge earned)." | functional |
| R-5.2.6 | "Support retaking a quiz any number of times; each retake draws a fresh random set of 5 from the 25-question pool. Store best score (out of 5) and last score (out of 5) per topic." | functional |

## PRD §5.3 Progress Tracking (localStorage)

| ID | Statement | Type |
|---|---|---|
| R-5.3.1 | "Persisted per browser, no login:" | constraint |
| R-5.3.2 | "Per-topic: attempts, best score (out of 5), last score (out of 5), which question IDs were last served (optional, for variety tracking), completion status (not started / in progress / completed)." | functional |
| R-5.3.3 | "Global: total topics completed, total quiz attempts taken, streak (days visited in a row), badges earned." | functional |
| R-5.3.4 | "Data model example (JSON in localStorage key `kids-science-progress`):" `{ "version": 1, "topics": { "space": { "bestScore": 5, "lastScore": 4, "attempts": 3, "completed": true } }, "streak": { "lastVisitDate": "2026-09-15", "currentStreak": 4 }, "badges": ["first-quiz", "perfect-score"] }` | constraint |
| R-5.3.5 | "Scores are always out of 5 (matching `questionsPerAttempt` in the quiz config), regardless of the 25-question pool size, so scores stay easy for kids to understand and compare across attempts." | functional |
| R-5.3.6 | "Include a schema `version` field to allow safe migrations if the data shape changes later." | constraint |
| R-5.3.7 | "Graceful fallback if `localStorage` is unavailable (private browsing, storage full): app still works, just doesn't persist, with a small inline notice." | functional |

## PRD §5.4 Progress Dashboard

| ID | Statement | Type |
|---|---|---|
| R-5.4.1 | "A "My Progress" page showing all topics with completion state, best scores, badges earned, and current streak." | functional |
| R-5.4.2 | "Visual, kid-friendly (progress bars, stars, badge icons) rather than raw numbers." | non-functional |

## PRD §5.5 Navigation & Pages

| ID | Statement | Type |
|---|---|---|
| R-5.5.1 | "`/` — Home: topic grid, greeting, streak indicator." | functional |
| R-5.5.2 | "`/topics/[topicId]` — Topic intro + "Start Quiz" button." | functional |
| R-5.5.3 | "`/topics/[topicId]/quiz` — Quiz flow." | functional |
| R-5.5.4 | "`/topics/[topicId]/results` — Score summary, retry / next topic buttons." | functional |
| R-5.5.5 | "`/progress` — Dashboard of all progress/badges." | functional |
| R-5.5.6 | "Optional: `/about` for parents (what data is stored — reassure: "everything stays on this device")." | functional |

## PRD §6 Non-Functional Requirements

| ID | Statement | Type |
|---|---|---|
| R-6.1 | "Fully static/client-rendered — no server-side data fetching required; can use `output: 'export'` or standard Vercel static/SSR hosting (either works since there's no backend logic)." | constraint |
| R-6.2 | "Accessible: large tap targets, readable fonts, good color contrast, keyboard navigable." | non-functional |
| R-6.3 | "Responsive: works well on tablets and phones (primary kid devices) and desktop." | non-functional |
| R-6.4 | "Fast load: all content bundled at build time, no runtime API calls." | non-functional |
| R-6.5 | "No third-party tracking/analytics that collects PII from kids (COPPA-conscious design)." | constraint |

## PRD §7 Out of Scope (v1)

| ID | Statement | Type |
|---|---|---|
| R-7.1 | "User accounts, login, cross-device sync." | out-of-scope |
| R-7.2 | "Backend/database, CMS-editable content." | out-of-scope |
| R-7.3 | "Multiplayer/leaderboards across users." | out-of-scope |
| R-7.4 | "Content authoring UI (all content is edited directly in code)." | out-of-scope |

## PRD §8 Success Metrics

| ID | Statement | Type |
|---|---|---|
| R-8.1 | "% of kids completing at least one full quiz per session." | non-functional |
| R-8.2 | "Return visits (via streak data) as a proxy for engagement." | non-functional |
| R-8.3 | "Number of topics completed per active user (localStorage-derived, self-reported/anonymous — no server analytics needed for v1)." | non-functional |

## PRD §9 Future Considerations (Post-v1)

All out of scope for v1. Listed so the plan can refuse them.

| ID | Statement | Type |
|---|---|---|
| R-9.1 | "Optional cloud sync via a lightweight backend if cross-device progress is needed." | out-of-scope |
| R-9.2 | "Parent/teacher export of progress (e.g., download a summary as PDF/CSV from localStorage data)." | out-of-scope |
| R-9.3 | "More topics, difficulty tiers, timed challenge mode." | out-of-scope |
| R-9.4 | "Sound effects/animations for correct answers." | out-of-scope |

---

## Data file `docs/topics-data.json`

| ID | Statement | Type |
|---|---|---|
| D-version | `"version": 2` | constraint |
| D-quizConfig | `"quizConfig": { "questionsPerTopic": 25, "questionsPerAttempt": 5, "selectionMethod": "random-no-repeat-within-attempt" }` | constraint |
| D-topics | 6 topics: `space`, `animals`, `human-body`, `plants`, `weather`, `simple-machines`. Each has `id, title, icon, difficulty, description, funFacts` (4 each) and `questions` (25 each, with `id, question, options` (4), `correctIndex, explanation`). *(Structure summarised, not quoted. Checked by script: every topic has 25 questions, every question has 4 distinct options and a valid `correctIndex`, no duplicate question IDs.)* | constraint |
| D-badge.first-quiz | `"name": "First Steps"`, `"icon": "⭐"`, `"criteria": "Complete your first quiz."` | functional |
| D-badge.perfect-score | `"name": "Perfect Score"`, `"icon": "🏆"`, `"criteria": "Get 5 out of 5 on any quiz attempt."` | functional |
| D-badge.all-topics | `"name": "Science Explorer"`, `"icon": "🔬"`, `"criteria": "Complete every topic at least once."` | functional |
| D-badge.streak-3 | `"name": "3-Day Streak"`, `"icon": "🔥"`, `"criteria": "Visit and play 3 days in a row."` | functional |
| D-badge.quiz-master | `"name": "Quiz Master"`, `"icon": "🎓"`, `"criteria": "Take 25 quiz attempts total across all topics."` | functional |

## Coverage

Every requirement is traced to a slice except these. Each is deliberately without one:

| IDs | Why no slice |
|---|---|
| R-7.1 – R-7.4, R-9.1 – R-9.4 | Out of scope for v1. A slice that implements one of these is refused. |
| R-2.1, R-4.1, R-4.6 | A goal and platform constraints. Recorded in ADR-0002 and enforced by every slice, not built by one. |
| R-8.1, R-8.3 | Can't be measured without data leaving the device. Waiting on C-4. |

### Observed in the data, not stated anywhere

- **The answer position is heavily skewed.** Across 150 questions, `correctIndex` is 0 in 30,
  **1 in 85 (57%)**, 2 in 34, and **3 in 1**. See C-2 in `OPEN-QUESTIONS.md`.
- No question has the "optional image/emoji" field that R-5.2.1 allows.
- No topic has video, although R-1.1 says "read/watch".
