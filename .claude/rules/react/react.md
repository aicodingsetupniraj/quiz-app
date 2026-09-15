# React

Paths: `**/*.tsx`, `**/*.jsx`.

**React rule pack.** Delete this file in a repository that does not use React. In a Next.js
App Router project the `nextjs/` pack governs `app/**` and takes precedence where they differ.

## Everything in a component reaches the browser

The bundle is public. Anyone can read it, and minification is not a control.

- **No secret in a component, a hook, or anything they import.** API keys, signing keys,
  internal hostnames, the admin allowlist - all of it ships.
- **A variable prefixed for the client is a public variable.** `NEXT_PUBLIC_`, `VITE_`,
  `REACT_APP_` mean "publish this". Read anything else on the server and pass down what the
  view needs.
- **A hidden element is not an authorization control.** `{isAdmin && <Panel/>}` decides what
  renders, never what is permitted. The endpoint behind it authorizes, every time, or the
  check does not exist.

## XSS

- **`dangerouslySetInnerHTML` takes sanitized HTML or nothing.** Sanitize on the server, with
  a library, against an allowlist. There is no safe way to pass through user HTML.
- **`href` and `src` from user data are an injection point** - `javascript:` and `data:` URIs
  execute. Validate the scheme against an allowlist before it reaches an attribute.
- Never build a component from a string and render it. Never pass user data to `eval`, `new
  Function`, or a `<script>` body.

## State

Most React bugs are state that did not need to exist.

- **Derive, do not synchronise.** If a value can be computed during render, compute it. An
  effect that copies a prop into state guarantees a frame of stale data and a class of bug
  that cannot be reproduced.
- **Server data is a cache, not state.** Use a query library. Hand-rolled
  `useEffect` + `setState` fetching re-fetches on every render path nobody predicted, and has
  no cancellation.
- **Context is for identity, theme, and locale** - things that rarely change. Putting a
  frequently-changing value in context re-renders the whole tree beneath it.
- Lift state to the lowest common parent, not to the top.

## Effects

- An effect is for **synchronising with something outside React**: a subscription, a timer, an
  imperative API. Anything else is probably a derived value or an event handler.
- **Every effect that starts something cleans it up.** Return the teardown; abort the request.
  A component that unmounts mid-flight otherwise sets state on nothing and leaks.
- **The dependency array is not a tuning knob.** Removing a dependency to stop a loop hides
  the loop. Fix what changes identity every render instead - `useCallback`, `useMemo`, or
  moving the value out of the component.

## Structure

- **A component renders. A hook holds logic.** When a component grows a second reason to
  change, extract the logic into a hook, not into a bigger component.
- **Extract a custom hook when stateful logic is reused**, not to make a long component
  shorter. A hook that has one caller and hides ten lines has only moved them.
- **Props down, events up.** A child that reaches into a parent's state, or mutates a prop, is
  a bug waiting for the second caller.
- **Keys identify a row, not a position.** An array index as a key on a list that reorders,
  filters, or deletes will hand one row's state to another.
- One component per file, named for what it renders.

## Tests in the same PR

- Test through the user's path - render, interact, assert what appears. Not internal state.
- **Assert the denied case renders nothing**, not that it is hidden. `toBeInTheDocument` is
  what catches a panel that CSS was hiding.
- A `useEffect` with a fetch gets a test for the aborted case, or it will leak in production.
