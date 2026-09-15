# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in
this repository.

@AGENTS.md

## What this is

A static, browser-only science learning app for kids aged roughly 6–12. Kids pick a topic,
read short fun facts, and take 5-question multiple-choice quizzes drawn at random from a
25-question bank per topic. Progress, streaks, and badges persist in `localStorage` only -
no backend, no accounts, no tracking - so parents and teachers can hand it to a child with
nothing to sign up for. It is COPPA-conscious by design: nothing about the child leaves the
device. The requirements are in `docs/kids-science-prd.md`; the content is
`docs/topics-data.json`.

## Stack

- **Runtime:** Node 24, pinned in `.nvmrc` - set the identical major in Vercel's project settings
- **Language:** TypeScript, `strict`, `@/*` → `src/*`
- **Framework:** Next.js 16 (App Router, `src/app/`), React 19, Tailwind CSS v4
- **Database:** none, by design. Content is bundled JSON; progress is `localStorage`
- **Tests:** Vitest for logic (`src/**/*.test.ts`), Playwright + axe for pages (`e2e/`,
  against a production build) - ADR-0003
- **Deploy:** Vercel via its GitHub integration (not GitHub Actions). The Actions deploy
  workflows are deliberate TODOs until that is wired

## Commands

```bash
npm ci                 # install - always frozen in CI
npm run dev            # local development
npm run build          # production build (also typechecks)
npx tsc --noEmit       # types only
npm run lint           # eslint
npm test               # Vitest, once (not watch)
npm test -- src/content/content.test.ts   # a single test file
npm run test:e2e       # Playwright: builds, starts on :3100, runs e2e/
bash security/check-code.sh --list   # the code rules in force
```

First e2e run on a machine: `npx playwright install chromium`. There is no `typecheck`
script yet. CI runs `npm test` but not `test:e2e` - that job needs its own config PR.

## Architecture

- **No server logic.** No API routes, server actions, middleware, database, or runtime
  fetches. All content is imported at build time from local JSON/TS. A change that adds a
  network call or server-side state is out of scope for v1 (PRD §7) and needs a decision,
  not a PR.
- **Server Components render content; Client Components own interaction.** Topic lists and
  intros can render on the server from the bundled data. The quiz flow, results, streak, and
  progress dashboard read `localStorage` and must be client components.
- **Question selection happens in the browser at quiz start** - an unbiased Fisher–Yates
  shuffle picks `quizConfig.questionsPerAttempt` (5) of `questionsPerTopic` (25), no repeats
  within an attempt. Read those numbers from the config; never hardcode 5 or 25.
- **One module owns persistence.** All `localStorage` access goes through a single module
  that owns the key `kids-science-progress`, the schema `version`, migrations between
  versions, and the fallback when storage is unavailable or throws (private mode, quota).
  Components never touch `localStorage` directly.
- **Children are the users.** No analytics, third-party scripts, or anything that
  identifies a child. Large tap targets, readable type, keyboard navigable, good contrast.

## Conventions

The short version. The rest is in `.claude/rules/conventions.md`.

- Server components by default; `"use client"` only where state, effects, or `localStorage` require it
- Validate the shape of anything read back from `localStorage` before trusting it - it is user-editable input
- Content and config come from the data file; UI code does not embed question text or pool sizes

## Before you finish

- New behaviour ships with a test. A bug fix ships with a regression test that fails
  against the old code.
- **A new entry point ships with its negative authorization test.** This app has no users
  or server entry points, so this applies only if that ever changes.
- Run the checks above and report the real result. Do not report a green suite you did
  not see.
- A new dependency needs a stated reason in the PR.

## Risk tiers

Check `.claude/rules/autonomy.md` before starting. In short: auth, migrations, infra,
`.github/**`, `.claude/**`, and anything touching money are the high tier - plan first,
stop, and wait for a human. Everything lands as a draft PR; nothing is auto-merged.

## Review lenses

Read-only subagents, one question each. Use them **while building, not after the PR is
open**. Run them yourself when the trigger matches; do not wait to be asked.

| Change touches | Run |
|---|---|
| A new or modified endpoint, action, query, or page | `authz-reviewer` |
| More than one file, or auth / data / money | `planner`, first |
| A migration, schema file, or backfill (including the `localStorage` schema) | `migration-reviewer` |
| Anything that can fail, log, or call a network dependency | `observability-reviewer` |
| A response shape, request schema, event payload, or exported type | `api-contract-reviewer` |
| A query, a loop over results, or a list render | `perf-reviewer` |
| A lockfile or manifest | `dependency-auditor` |
| Sessions, payments, file handling, a trust boundary | `security-auditor` |
| Components, data loading, or environment variables | `rsc-boundary-checker` |
| A finished change, before the PR | `code-reviewer` |
| A production deploy, or a merge carrying a migration or flag | `release-readiness` |

Several can apply to one change. Run each that does - a pass from one is not a pass from another.

## Rules

Two tiers. Everything imported here is paid on **every request in every session**, so the
always-loaded set is only what bears on nearly every change. Everything else is read when
you touch the area it governs - each file names its own paths on its first line.

### Always loaded

@.claude/rules/conventions.md
@.claude/rules/architecture.md
@.claude/rules/autonomy.md
@.claude/rules/security.md
@.claude/rules/testing.md
@.claude/rules/context.md

### Read before working in these areas

**This table is an instruction, not an index.** Open the file when the change touches the
paths, before writing - not after a review says no.

| Touching | Read |
|---|---|
| Sessions, login, tokens, `middleware.*`, `lib/auth/**` | `.claude/rules/auth.md` |
| A query, a schema, a repository, a migration - including the `localStorage` schema | `.claude/rules/data-layer.md` |
| A route handler, a response shape, a public type, an event payload | `.claude/rules/api-contracts.md` |
| Anything that can fail, log, or call a network dependency | `.claude/rules/observability.md` |
| A loop over results, a list render, anything in the request path | `.claude/rules/performance.md` |
| A manifest or lockfile | `.claude/rules/dependencies.md` |
| `infra/**`, `.github/**`, deploy configuration | `.claude/rules/infra.md` |
| A feature flag, a version, a rollout | `.claude/rules/release.md` |
| A file matching a stack pack's `Paths:` line | that pack's file, below |

### The stack packs: nextjs, react, node

Listed, not imported - read the one that governs the file you are changing. The matching
`security/patterns/<pack>.patterns` enforces each mechanically.

**Next.js**
- `.claude/rules/nextjs/server-client-boundary.md` - `app/**`, and anything it imports
- `.claude/rules/nextjs/server-actions.md` - `"use server"`, `app/**/actions.ts`
- `.claude/rules/nextjs/route-handlers.md` - `app/api/**/route.ts`
- `.claude/rules/nextjs/data-fetching.md` - pages and layouts that fetch
- `.claude/rules/nextjs/caching.md` - `revalidate`, tags, `dynamic`
- `.claude/rules/nextjs/routing.md` - layouts, route groups, dynamic segments
- `.claude/rules/nextjs/forms-and-mutations.md` - forms, `useActionState`, optimistic updates
- `.claude/rules/nextjs/middleware.md` - `middleware.ts`
- `.claude/rules/nextjs/errors.md` - `error.tsx`, `not-found.tsx`, failure paths
- `.claude/rules/nextjs/env-and-config.md` - `.env*`, `next.config.*`, `process.env`
- `.claude/rules/nextjs/performance.md` - bundle, images, streaming, runtime
- `.claude/rules/nextjs/testing.md` - tests for any of the above

**React**
- `.claude/rules/react/react.md` - `**/*.tsx`, `**/*.jsx`
- `.claude/rules/react/react-state.md` - components, stores, context providers, hooks
- `.claude/rules/react/react-accessibility.md` - `**/*.tsx`, `**/*.jsx`
- `.claude/rules/react/react-performance.md` - `**/*.tsx`, `**/*.jsx`
- `.claude/rules/react/react-forms.md` - forms, inputs, validation schemas
- `.claude/rules/react/react-typescript.md` - `**/*.tsx`
- `.claude/rules/react/react-testing.md` - `**/*.test.tsx`, `**/*.spec.tsx`

**Node**
- `.claude/rules/node/node-typescript.md` - `tsconfig*.json`, `**/*.ts`, `**/*.tsx`
- `.claude/rules/node/node-packaging.md` - `package.json`, lockfile, `.nvmrc`
- `.claude/rules/node/node-testing.md` - `**/*.test.ts`, `**/*.spec.ts`, `tests/**`
- `.claude/rules/node/node.md`, `node-http-api.md`, `node-data.md`, `node-jobs.md` - server code; none exists in v1

## The code rules are checked, not just read

`security/check-code.sh` runs `security/patterns/*.patterns` - the mechanical half of the
files above - as a line is written, on `git commit`, and on the pull request. Same script,
same patterns, three call sites.

A `block` finding has a safe form and the message names it. Fix the line; do not rewrite it
to slip past the pattern. If a pattern is genuinely wrong here, that is a change to
`security/patterns/` in its own PR - and it is a protected path, so a human makes it.
