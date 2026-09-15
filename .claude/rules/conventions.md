# Conventions

Overflow from `CLAUDE.md`. Everything here is a rule someone had to state twice.

## The governing rule

**Match the code around you.** A correct change written in a foreign idiom still costs every
future reader. When this file and the surrounding code disagree, the surrounding code wins -
then fix this file in the same PR.

## Naming

- Names say what a thing is or does, not what type it is. `users`, not `userArray`.
- Booleans read as a claim: `isActive`, `hasAccess`, `canEdit`.
- No abbreviations except ones already used across the codebase.
- Files match the convention already in that directory. Do not introduce a second one.

## Functions

- One reason to exist. A function doing two things gets two names, and one of them is wrong.
- Arguments: three or fewer, or an options object.
- Return early. Guard clauses at the top beat nesting.
- No boolean parameters that select behaviour - `render(true)` is unreadable at the call
  site. Two functions, or a named option.

## Errors

- Fail loudly at the boundary, handle deliberately inside.
- Never swallow an error to make a path quiet. An empty catch block is a decision to lose
  information, and it must be written down as one if it is really intended.
- Error messages say what failed and what the caller can do. Include the identifier.
- Do not use exceptions for control flow where the language offers something better.

## Comments

- Comment the **why**, never the what. The code says what.
- A comment explaining a workaround names the constraint and, where one exists, links the
  issue - that is what tells the next person when it can be removed.
- Delete commented-out code. Git has it.

## Structure

- Colocate: the test, the types, and the helpers live next to what they serve, until there
  are three users - then they move up.
- No file over roughly 400 lines without a reason. It usually means two things share a file.
- Imports: no deep reaching into another module's internals. If you need it, export it.

## Not negotiable

- No `any`, or its equivalent, to silence a type error. Fix the type or state why in a comment.
- No commented-out or skipped test without a linked issue.
- No stray `console.log` - use the logger.
- No new global mutable state.
