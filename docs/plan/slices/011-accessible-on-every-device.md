---
id: "011"
title: Every page passes an accessibility check and works by keyboard on phone, tablet and desktop
status: todo
milestone: M4
requirements: [R-6.2, R-6.3, R-3.1, R-4.5]
depends_on: ["005", "008", "010"]
risk: normal
estimate: 2d
blocked_by_question:
issue:
---

## Goal

A kid on a tablet, a kid with only a keyboard, and a kid using a screen reader can each get
from home through a quiz to My Progress without getting stuck.

## Requirements

- **R-6.2** "Accessible: large tap targets, readable fonts, good color contrast, keyboard navigable."
- **R-6.3** "Responsive: works well on tablets and phones (primary kid devices) and desktop."
- **R-3.1** "Kids ages ~6–12."
- **R-4.5** "Styling | Tailwind CSS (kid-friendly, bright, large touch targets)"

## Acceptance criteria

*Authored by the planner. The conformance level is open (G-9); the checks below hold whatever
it decides.*

- [ ] axe reports no violations on `/`, a topic intro, the quiz (before and after answering), results, and `/progress` (Playwright + `@axe-core/playwright`)
- [ ] Every interactive element is at least 44×44 CSS px at a 375px viewport (Playwright, measured)
- [ ] A full keyboard-only run works: home → topic → answer 5 → results → retry → My Progress, with visible focus at every step (Playwright)
- [ ] No page scrolls horizontally at 375, 768 or 1280px, and the quiz fits without zooming on a 768px tablet (Playwright)
- [ ] Respects `prefers-reduced-motion` for any transitions added by earlier slices (Playwright emulation)
- [ ] Body text is at least 16px (Playwright, computed style)

## Notes

- This is a sweep, not the first time accessibility is considered. Earlier slices already
  carry their own axe checks. This slice closes gaps across pages and adds the suite that
  keeps them closed.
- **G-9 (which WCAG level) is open.** Recommendation in `OPEN-QUESTIONS.md`: 2.2 AA.
- Rules: `.claude/rules/react/react-accessibility.md`, `.claude/rules/react/react-performance.md`,
  `.claude/rules/nextjs/testing.md`

## Out of scope

- Translations and right-to-left layouts (not in the PRD)
