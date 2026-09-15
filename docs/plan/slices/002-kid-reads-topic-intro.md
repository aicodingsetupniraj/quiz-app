---
id: "002"
title: A kid opens a topic and reads its fun facts before starting
status: todo
milestone: M1
requirements: [R-5.5.2, R-5.1.3, R-6.1]
depends_on: ["001"]
risk: normal
estimate: 1d
blocked_by_question:
issue: 12
---

## Goal

Tapping a topic opens its intro page with the fun facts and a big "Start Quiz" button.

## Requirements

- **R-5.5.2** "`/topics/[topicId]` — Topic intro + "Start Quiz" button."
- **R-5.1.3** "Optional short intro/"fun facts" content shown before the quiz."
- **R-6.1** "Fully static/client-rendered — no server-side data fetching required; can use `output: 'export'` or standard Vercel static/SSR hosting (either works since there's no backend logic)."

## Acceptance criteria

*Authored by the planner.*

- [ ] `/topics/space` shows the icon, title, difficulty, description and all 4 fun facts from the content file (Playwright)
- [ ] "Start Quiz" goes to `/topics/space/quiz` and can be activated by keyboard (Playwright)
- [ ] All 6 topic pages are pre-rendered: `next build` lists them as static via `generateStaticParams`
- [ ] Loading `/topics/not-a-topic` **directly by URL** shows the not-found page, not an error (Playwright)
- [ ] A back link returns to `/` (Playwright)

## Notes

- A Server Component. Set `dynamicParams = false` so unknown IDs don't render at request
  time. That also keeps the route valid for a static export if Q-4 chooses it.
- Rules: `.claude/rules/nextjs/routing.md`, `.claude/rules/nextjs/errors.md`,
  `.claude/rules/nextjs/data-fetching.md`, `.claude/rules/react/react-accessibility.md`

## Out of scope

- Video content (G-10); per-question images (Q-3)
