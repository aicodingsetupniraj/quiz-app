# 0003. Test with Vitest for logic and Playwright for pages

Date: 2026-09-15
Status: Accepted

## Context

The scaffold has no test runner. The logic most likely to be wrong is plain TypeScript with
no framework in it:

- picking 5 of 25 questions without repeats (R-5.2.2)
- scoring and stars
- completion and attempt rules
- streak date arithmetic
- badge criteria
- the versioned `localStorage` model and its migrations

The rest is client-side behaviour in a browser: one question at a time, feedback, navigation,
the storage-unavailable notice, keyboard use and contrast (R-6.2). The repository setup
already assumes both kinds of test. `.claude/settings.json` allows `npx vitest` and
`npx playwright test`, and `security.yml` runs `npx playwright test e2e/authz`.

## Decision

We will use **Vitest** (with React Testing Library where a component needs rendering) for
unit and component tests under `npm test`. We will use **Playwright**, with `@axe-core/playwright`
for accessibility checks, for browser tests under `npm run test:e2e`, run against a
production build.

Every slice's acceptance criteria are written so they can be checked in one of these two.

## Consequences

- **Easier:** the rules with real edge cases are pure functions that run in milliseconds,
  with a fake clock for the streak. The browser behaviour is tested in a real browser, with
  real `localStorage`, including the case where it is blocked.
- **Harder:** two runners and two configs. Playwright needs browser binaries in CI.
- **Needs a config PR:** CI currently runs only `npm test`. A separate change to
  `.github/workflows/ci.yml` must add the `test:e2e` job. Workflow files are high-tier and
  go in their own PR (`.claude/rules/autonomy.md`).

## Alternatives considered

- **Jest:** needs extra transform setup for ESM and TypeScript that Vitest handles out of
  the box. Nothing here needs Jest's ecosystem.
- **Cypress:** a capable end-to-end runner, but the repository's authz job and permissions
  are already wired for Playwright. Two e2e tools would split the suite.
- **Unit tests only:** they can't see the things the PRD cares about most: the quiz
  experience on a tablet, keyboard use, and what happens when storage is blocked.
