# 0002. Build as a static Next.js app with progress in localStorage

Date: 2026-09-15
Status: Accepted

## Context

The app is a science quiz for children aged about 6–12 (`docs/kids-science-prd.md`). Three
constraints in the PRD decide most of the architecture:

- **No backend and no cost:** "No backend, no database" (R-1.2), and "Zero backend
  cost/complexity — fully static, deployable to Vercel as a free-tier project" (R-2.4).
- **Nothing about a child leaves the device:** "no-signup, no-tracking" (R-3.2), and "No
  third-party tracking/analytics that collects PII from kids (COPPA-conscious design)" (R-6.5).
- **Content is fixed:** 6 topics × 25 questions in `docs/topics-data.json`, edited in code
  (R-7.4).

The PRD names Next.js App Router, Tailwind and Vercel (R-4.1, R-4.2, R-4.5).
`/new-project` confirmed that choice on 2026-09-15 and scaffolded Next.js 16.3 with React 19,
TypeScript and Tailwind v4. `/plan-project` read the stack from `package.json` rather than
re-opening it.

## Decision

We will build a **fully static Next.js App Router app** with no server-side state:

- Content is imported from the JSON file at build time. Topic routes are pre-rendered for
  every topic with `generateStaticParams`. There are no route handlers, server actions,
  middleware or runtime fetches.
- Quiz state, scores, completion, streak and badges live **only in the browser's
  `localStorage`**, under the key `kids-science-progress`, with a `version` field. All
  reads and writes go through one module.
- Server Components render content. Client Components own the quiz, results, progress and
  anything that reads `localStorage`.

## Consequences

- **Easier:** no server to secure or pay for, and no personal data to protect in transit or
  at rest. It deploys to Vercel's free tier, and every page can be served from a CDN.
- **Harder:** progress is locked to one browser on one device. Clearing site data erases it,
  and a private window never keeps it. The UI must handle `localStorage` being unavailable
  (R-5.3.7).
- **Harder:** the saved data can be edited by the user and survives app upgrades, so every
  read has to be validated and migrated by `version`. Treat it as untrusted input.
- **Harder:** the success metrics in R-8.1 and R-8.3 are measured "per kid" and "per user",
  and nobody can compute those without data leaving the device. See C-4 in
  `docs/plan/OPEN-QUESTIONS.md`.
- **Expensive to change:** cross-device sync (R-9.1) means a backend, accounts, and a new
  COPPA assessment. That is a new architecture, not a feature, and would supersede this
  record.

## Alternatives considered

- **A plain React SPA with Vite:** also fully static, and slightly lighter. It lost because
  the PRD names Next.js, and the repository's Next.js rule pack is already installed and
  enforced. Routing and pre-rendering would have to be built by hand.
- **A small backend with a database (for example Postgres, or Vercel KV):** gives
  cross-device progress and real metrics. Ruled out by R-1.2 and R-2.4, and it would put
  children's data on a server, against R-3.2 and R-6.5.
- **IndexedDB instead of `localStorage`:** more capacity and asynchronous access. The whole
  progress record is a few kilobytes, and R-4.4 names `localStorage`, so the extra
  complexity buys nothing here.
- **Cookies for progress:** sent with every request for no benefit, and they look like
  tracking to parents and regulators.
