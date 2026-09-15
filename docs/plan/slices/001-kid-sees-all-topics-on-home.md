---
id: "001"
title: A kid sees all six science topics on the home page
status: todo
milestone: M1
requirements: [R-5.1.1, R-5.1.2, R-5.1.4, R-5.1.5, R-5.1.6, R-5.5.1, R-4.3, R-4.5, R-6.3, R-6.4, D-version, D-topics, D-quizConfig]
depends_on: []
risk: normal
estimate: 2d
blocked_by_question:
issue:
---

## Goal

Opening the site shows a bright, tappable grid of the six topics from the content file. This
slice also puts the typed content module and both test runners in place.

## Requirements

- **R-5.1.1** "A fixed list of science topics (e.g., "Space", "Animals", "Human Body", "Plants", "Weather", "Simple Machines")."
- **R-5.1.2** "Each topic has: … Title, icon/emoji, short description, difficulty level (Easy/Medium/Hard)."
- **R-5.1.4** "A pool of 25 hardcoded questions (see 5.2 below for how quizzes draw from this pool)."
- **R-5.1.5** "Data lives in a local file, e.g. `data/topics.ts` (or imported from a JSON file like `topics-data.json`), loaded directly — no fetch, no API route."
- **R-5.1.6** "A top-level `quizConfig` value (`questionsPerTopic: 25`, `questionsPerAttempt: 5`) documents the pool/attempt sizing so the app logic and content stay in sync if either number changes later."
- **R-5.5.1** "`/` — Home: topic grid, greeting, streak indicator." *(topic grid only; the greeting and streak come in 009)*
- **R-4.3** "Data | Hardcoded local JSON/TS files (no CMS, no DB)"
- **R-4.5** "Styling | Tailwind CSS (kid-friendly, bright, large touch targets)"
- **R-6.3** "Responsive: works well on tablets and phones (primary kid devices) and desktop."
- **R-6.4** "Fast load: all content bundled at build time, no runtime API calls."

## Acceptance criteria

*Authored by the planner; the PRD has no criteria for this slice.*

- [ ] `npm test` runs Vitest and `npm run test:e2e` runs Playwright against a production build (ADR-0003)
- [ ] A typed content module exposes topics, questions, `quizConfig` and badges from the content file, imported at build time with no `fetch` (Vitest)
- [ ] A Vitest test checks the content: every topic has exactly `questionsPerTopic` questions, each with 4 distinct options, a valid `correctIndex`, and an explanation, and no two question IDs repeat. A broken content edit fails CI.
- [ ] `/` shows 6 topic cards, each with icon, title, short description and difficulty label (Playwright)
- [ ] Each card links to `/topics/<id>` (Playwright)
- [ ] The grid shows no horizontal scroll at 375px, 768px and 1280px wide (Playwright viewports)
- [ ] `next build` reports `/` as static (○)

## Notes

- The home page is a Server Component that reads the content module. It needs no client JS.
- **Content file location is open (Q-5).** Import `docs/topics-data.json` where it is, and
  don't copy it: two copies drift. Moving it is a separate change once Q-5 is decided.
- Adding Vitest, Testing Library, Playwright and axe needs a stated reason for each in the PR
  (see `.claude/rules/dependencies.md`).
- **CI runs `npm test` only.** Adding the `test:e2e` job to `.github/workflows/ci.yml` is
  high-tier config and goes in its **own PR**, opened alongside this one
  (`.claude/rules/autonomy.md`).
- Rules: `.claude/rules/nextjs/server-client-boundary.md`, `.claude/rules/nextjs/routing.md`,
  `.claude/rules/nextjs/testing.md`, `.claude/rules/react/react.md`,
  `.claude/rules/react/react-accessibility.md`, `.claude/rules/node/node-typescript.md`,
  `.claude/rules/testing.md`, `.claude/rules/dependencies.md`

## Out of scope

- Greeting and streak indicator (009); per-topic progress state (007)
- Moving the content file (Q-5)
