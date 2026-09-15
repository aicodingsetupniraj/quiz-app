# React performance

Paths: `**/*.tsx`, `**/*.jsx`.

**React rule pack.** Delete this file in a repository that does not use React.

The rule that governs the rest: **measure first**. Almost every React app that feels slow is
slow because of what it downloads and how many times it fetches, not because of re-renders.
Optimising renders first is how a codebase acquires a hundred `useMemo` calls and the same
latency.

## Do not memoize on the way past

`memo`, `useMemo`, and `useCallback` are not free - each adds a comparison, a dependency
array to keep honest, and a line of noise. Added speculatively they cost more than they save.

Reach for them when you have measured, or in these three cases where the reason is
structural:

- A value passed to a `memo`'d child that would otherwise be a new object every render.
- A dependency of an effect that would otherwise re-run every render.
- A genuinely expensive pure computation over a large list, in a component that re-renders
  often.

**A component wrapped in `memo` whose props include an inline object or arrow function is
not memoized.** The comparison fails every time, and you have added cost for nothing. If you
memo a component, its props have to be stable - otherwise remove the `memo`.

## Fix the cause, not the symptom

- **Context re-renders everything beneath it.** A frequently changing value in a wide context
  is the most common real re-render problem. Split the context - one for identity and theme,
  another for the thing that changes - or move the state down.
- **State lives at the lowest common parent.** State hoisted to the top re-renders the tree
  on every keystroke.
- Derive during render instead of storing. A value in state that could have been computed is
  a re-render and a synchronisation bug waiting.

## Lists

- **Keys identify a row, not a position.** An index key on a list that reorders, filters, or
  deletes hands one row's state to another. That is a correctness bug that reads as a
  performance one.
- Virtualize above roughly a few hundred rows. Below that, the virtualization costs more
  than it saves.
- Never build a new array or object inside JSX in a hot list - it re-creates per row per
  render.

## What actually ships

- **A heavy dependency in a client path ships to every visitor.** Charts, editors, date
  libraries, PDF renderers: load them lazily, behind the interaction that needs them.
- `React.lazy` plus `<Suspense>` at the route or feature boundary, with a fallback the shape
  of the content.
- Import the member, not the namespace, so tree shaking can work.

## Data

- **Server state is a cache, not state.** A query library gives deduplication, cancellation,
  and revalidation; a hand-rolled `useEffect` fetch gives a waterfall and a race.
- Fetch in parallel where the calls are independent.
- The N+1 does not disappear because it is in a component - a request per row in a list is
  the same incident it is on a server.

## Measure

- Profile with the React DevTools profiler before and after. "It feels faster" is not a
  result.
- The user-facing numbers are INP and LCP at p75, not a render count.
