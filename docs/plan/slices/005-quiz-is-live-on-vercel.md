---
id: "005"
title: The quiz is live on Vercel as a static site with no outside requests
status: todo
milestone: M1
requirements: [R-2.4, R-4.2, R-6.1, R-6.4, R-6.5]
depends_on: ["004"]
risk: normal
estimate: 1d
blocked_by_question:
issue: 16
---

## Goal

A parent can open the production URL on a phone and take a quiz, and the page makes no
request to anything except its own origin.

## Requirements

- **R-2.4** "Zero backend cost/complexity — fully static, deployable to Vercel as a free-tier project."
- **R-4.2** "Hosting | Vercel"
- **R-6.1** "Fully static/client-rendered — no server-side data fetching required; can use `output: 'export'` or standard Vercel static/SSR hosting (either works since there's no backend logic)."
- **R-6.4** "Fast load: all content bundled at build time, no runtime API calls."
- **R-6.5** "No third-party tracking/analytics that collects PII from kids (COPPA-conscious design)."

## Acceptance criteria

*Authored by the planner.*

- [ ] `next build` lists every route as static (○ or ●), with no dynamic (ƒ) routes
- [ ] A Playwright test runs home → intro → quiz → results and fails on any network request to an origin other than the app's own, which proves no runtime API calls and no third-party scripts
- [ ] The Vercel project is connected to the repository, and a push to `main` produces a production deployment. **This step is done by a human in the Vercel dashboard.**
- [ ] Vercel's Node.js version is set to 24, matching `.nvmrc`
- [ ] The production URL loads and completes a quiz on a phone-sized viewport (manual check, recorded in the PR)

## Notes

- **Q-4 (static export or standard Vercel hosting) is open.** Standard Vercel hosting needs
  no configuration, so it's the no-decision path. Don't add `output: 'export'` unless Q-4
  chooses it.
- The `Deploy staging` workflow stays manual-only. Vercel's GitHub integration does the
  deploy. Don't wire Actions to Vercel here: `.github/**` is high-tier and has its own PR.
- Rules: `.claude/rules/infra.md`, `.claude/rules/release.md`,
  `.claude/rules/nextjs/env-and-config.md`, `.claude/rules/nextjs/performance.md`

## Out of scope

- Analytics of any kind (C-4); a custom domain
