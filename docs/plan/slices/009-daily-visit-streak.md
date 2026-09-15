---
id: "009"
title: A kid who visits on consecutive days sees their streak grow
status: todo
milestone: M3
requirements: [R-5.3.3, R-5.3.4, R-5.5.1, R-5.4.1, R-2.3, R-8.2]
depends_on: ["006", "008"]
risk: normal
estimate: 2d
blocked_by_question:
issue: 20
---

## Goal

The home page greets the kid and shows "🔥 3 days". Visiting again tomorrow makes it 4, and
missing a day starts it back at 1. The dashboard shows the same number.

## Requirements

- **R-5.3.3** "Global: … streak (days visited in a row) …"
- **R-5.3.4** "`"streak": { "lastVisitDate": "2026-09-15", "currentStreak": 4 }`"
- **R-5.5.1** "`/` — Home: topic grid, greeting, streak indicator." *(greeting and streak indicator)*
- **R-5.4.1** "A "My Progress" page showing … current streak."
- **R-2.3** "Show visible progress (badges, %, streaks) to motivate continued use."
- **R-8.2** "Return visits (via streak data) as a proxy for engagement."

## Acceptance criteria

A pure `nextStreak(previous, today)` function, tested with fixed dates. **C-1/G-4:**

- [ ] First ever visit → streak 1, `lastVisitDate` = today (Vitest)
- [ ] Same local date again → unchanged (Vitest)
- [ ] Next calendar day → streak + 1 (Vitest)
- [ ] Two or more days later → streak 1 (Vitest)
- [ ] "Today" is the **device's local date**, not UTC. A visit at 23:30 and one at 00:30 local time on the next day count as consecutive (Vitest, with a fixed timezone)
- [ ] Month, year and daylight-saving boundaries are counted in calendar days, not 24-hour periods (Vitest)
- [ ] A clock set backwards (today before `lastVisitDate`) doesn't crash and doesn't increase the streak (Vitest)
- [ ] Visiting any page records the visit once per load. The home page shows the streak indicator, and `/progress` shows the same value (Playwright, with a mocked clock)
- [ ] The home page shows a greeting containing no personal data (Playwright)
- [ ] With storage blocked, the streak shows as today only, with the 006 notice (Playwright)

## Notes

- Extends the 006 model through its migration path. `version` bumps if the shape changes.
- **Greeting wording is open (G-8).** It must not ask for or store a name. That constraint
  holds whatever G-8 decides, because a name is personal data about a child (R-6.5).
- The streak only counts visits, so the data-file badge wording "Visit and play" is
  intentionally not enforced (C-1 decision).
- Rules: `.claude/rules/data-layer.md`, `.claude/rules/react/react-state.md`,
  `.claude/rules/nextjs/server-client-boundary.md`, `.claude/rules/testing.md`

## Out of scope

- The 3-Day Streak badge itself (010); a best-ever streak (not in the model)
