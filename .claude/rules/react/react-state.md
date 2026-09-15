# State

Paths: `**/*.tsx`, `**/*.jsx`, stores, context providers, hooks.

**React rule pack.** Delete this file in a repository that does not use React.

## Decide which kind of state this is

Most React bugs are state in the wrong category. There are four, and they have different
homes:

| Kind | Example | Where it belongs |
|---|---|---|
| **Server cache** | The user's invoices | A query library. Not `useState` |
| **URL state** | Filters, page, selected tab | The URL - it must survive a refresh and be shareable |
| **Local UI state** | Is this menu open | `useState`, in the component that owns it |
| **Global app state** | Theme, current user, cart | Context or a store, and there is far less of it than people assume |

**Server data is a cache, not state.** It has staleness, revalidation, and an error path that
`useState` + `useEffect` gives you none of - and no cancellation, so a fast navigation writes
a stale response over a fresh one.

## Do not store what you can derive

- **If it can be computed during render, compute it.** A `filteredItems` in state alongside
  `items` and `query` is three values that can disagree, and they will.
- **An effect that copies a prop into state guarantees a frame of stale data**, and the bug
  cannot be reproduced on demand. Derive, or key the component to reset it.
- The exception is genuinely expensive derivation over a large list - measure first, then
  `useMemo`. See `react-performance.md`.

## Where state lives

- **Lowest common parent.** State hoisted to the top re-renders the tree on every keystroke.
- **Push it down when only one subtree cares.** A modal's open state does not belong in a page.
- `useReducer` when several fields change together or the next value depends on the previous.
  A form with six `useState` calls that must stay consistent is a reducer.
- **Functional updates** (`setX(prev => ...)`) whenever the new value depends on the old, or
  two updates in one tick lose each other.

## Context

- **Context is not a state manager.** It is dependency injection, and every consumer re-renders
  when the value changes.
- Put slow-changing identity in it - the user, the theme, the locale. A frequently changing
  value in a wide context re-renders everything beneath it.
- **Split by update frequency**: one context for the value, another for the setters. Consumers
  that only dispatch then do not re-render when the value changes.
- Memoize the provider's value object, or it is a new object every render and every consumer
  re-renders regardless.
- A context with no default and no provider is a runtime error at the far end of the tree.
  Export a hook that throws a useful message instead.

## External stores

- Reach for one when state is genuinely global, updated from outside React, or shared across
  routes. Not before - a store introduced early becomes the place everything goes.
- **Select narrowly.** Subscribing to the whole store re-renders on any change; select the
  slice this component renders.
- Never keep server data in the store as the source of truth. Cache it in the query layer and
  keep the store for what the server does not own.
- **Reset on logout.** A store surviving a user change is how one user sees another's data.

## Tests in the same PR

- The state machine, not the setter: assert what the user sees after the interaction.
- The stale-response case, where a slow request resolves after a fast one and must not
  overwrite it.
- Reset-on-logout, asserted, for anything global.
