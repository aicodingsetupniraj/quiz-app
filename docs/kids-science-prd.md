# PRD: Kids Science Learning Website

## 1. Overview
A fun, browser-based science learning app for kids. Kids pick a topic, read/watch short content, answer quiz questions, and track their progress over time. No backend, no database — everything (topics, questions, answers, and user progress) lives in the frontend. Progress persists across visits using `localStorage`.

## 2. Goals
- Let kids learn science topics in short, digestible chunks.
- Reinforce learning with quizzes (multiple choice).
- Show visible progress (badges, %, streaks) to motivate continued use.
- Zero backend cost/complexity — fully static, deployable to Vercel as a free-tier project.

## 3. Target Users
- Kids ages ~6–12.
- Secondary: parents/teachers who want a no-signup, no-tracking learning tool.

## 4. Platform & Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Hosting | Vercel |
| Data | Hardcoded local JSON/TS files (no CMS, no DB) |
| Persistence | Browser `localStorage` only |
| Styling | Tailwind CSS (kid-friendly, bright, large touch targets) |
| Auth | None — anonymous, single-device, single-browser profile |

## 5. Core Features

### 5.1 Topics
- A fixed list of science topics (e.g., "Space", "Animals", "Human Body", "Plants", "Weather", "Simple Machines").
- Each topic has:
  - Title, icon/emoji, short description, difficulty level (Easy/Medium/Hard).
  - Optional short intro/"fun facts" content shown before the quiz.
  - A pool of 25 hardcoded questions (see 5.2 below for how quizzes draw from this pool).
- Data lives in a local file, e.g. `data/topics.ts` (or imported from a JSON file like `topics-data.json`), loaded directly — no fetch, no API route.
- A top-level `quizConfig` value (`questionsPerTopic: 25`, `questionsPerAttempt: 5`) documents the pool/attempt sizing so the app logic and content stay in sync if either number changes later.

### 5.2 Questions & Quizzes
- Each topic has a fixed bank of **25 hardcoded multiple-choice questions** (4 options, 1 correct), each with:
  - Question text, options, correct answer index, explanation shown after answering, optional image/emoji.
- **Randomized quiz per attempt:** every time a kid starts (or restarts) a topic's quiz, the app randomly selects **5 questions out of the 25** in that topic's pool (no repeats within the same attempt), using a client-side shuffle (e.g., Fisher–Yates) — no server/randomization backend needed since selection happens entirely in the browser at quiz-start time.
  - This means repeat attempts on the same topic will usually show a different subset of 5 questions, keeping the quiz fresh and discouraging kids from just memorizing answer positions.
  - Answer options within each question can optionally also be shuffled for extra variety.
- Quiz flow: one question at a time → select answer → immediate feedback (correct/incorrect + explanation) → "Next" → summary screen at end (score out of 5, % correct, stars/badge earned).
- Support retaking a quiz any number of times; each retake draws a fresh random set of 5 from the 25-question pool. Store best score (out of 5) and last score (out of 5) per topic.

### 5.3 Progress Tracking (localStorage)
- Persisted per browser, no login:
  - Per-topic: attempts, best score (out of 5), last score (out of 5), which question IDs were last served (optional, for variety tracking), completion status (not started / in progress / completed).
  - Global: total topics completed, total quiz attempts taken, streak (days visited in a row), badges earned.
- Data model example (JSON in localStorage key `kids-science-progress`):
```json
{
  "version": 1,
  "topics": {
    "space": { "bestScore": 5, "lastScore": 4, "attempts": 3, "completed": true }
  },
  "streak": { "lastVisitDate": "2026-09-15", "currentStreak": 4 },
  "badges": ["first-quiz", "perfect-score"]
}
```
- Scores are always out of 5 (matching `questionsPerAttempt` in the quiz config), regardless of the 25-question pool size, so scores stay easy for kids to understand and compare across attempts.
- Include a schema `version` field to allow safe migrations if the data shape changes later.
- Graceful fallback if `localStorage` is unavailable (private browsing, storage full): app still works, just doesn't persist, with a small inline notice.

### 5.4 Progress Dashboard
- A "My Progress" page showing all topics with completion state, best scores, badges earned, and current streak.
- Visual, kid-friendly (progress bars, stars, badge icons) rather than raw numbers.

### 5.5 Navigation & Pages
- `/` — Home: topic grid, greeting, streak indicator.
- `/topics/[topicId]` — Topic intro + "Start Quiz" button.
- `/topics/[topicId]/quiz` — Quiz flow.
- `/topics/[topicId]/results` — Score summary, retry / next topic buttons.
- `/progress` — Dashboard of all progress/badges.
- Optional: `/about` for parents (what data is stored — reassure: "everything stays on this device").

## 6. Non-Functional Requirements
- Fully static/client-rendered — no server-side data fetching required; can use `output: 'export'` or standard Vercel static/SSR hosting (either works since there's no backend logic).
- Accessible: large tap targets, readable fonts, good color contrast, keyboard navigable.
- Responsive: works well on tablets and phones (primary kid devices) and desktop.
- Fast load: all content bundled at build time, no runtime API calls.
- No third-party tracking/analytics that collects PII from kids (COPPA-conscious design).

## 7. Out of Scope (v1)
- User accounts, login, cross-device sync.
- Backend/database, CMS-editable content.
- Multiplayer/leaderboards across users.
- Content authoring UI (all content is edited directly in code).

## 8. Success Metrics
- % of kids completing at least one full quiz per session.
- Return visits (via streak data) as a proxy for engagement.
- Number of topics completed per active user (localStorage-derived, self-reported/anonymous — no server analytics needed for v1).

## 9. Future Considerations (Post-v1)
- Optional cloud sync via a lightweight backend if cross-device progress is needed.
- Parent/teacher export of progress (e.g., download a summary as PDF/CSV from localStorage data).
- More topics, difficulty tiers, timed challenge mode.
- Sound effects/animations for correct answers.
