# Testing

Paths: `**/*.test.tsx`, `**/*.spec.tsx`.

**React rule pack.** Delete this file in a repository that does not use React.

## Test what the user can observe

- **Render, interact, assert what appears.** Not internal state, not hook return values, not
  the number of renders. A test pinned to internals breaks on every refactor and proves nothing
  about correctness.
- **`userEvent`, not `fireEvent`.** `userEvent` performs the whole interaction - focus, key
  down, input, key up - so it catches the handler that only listens for one of them.
- Never assert on a class name or a `data-testid` when a role or a label would do. Those
  queries are also the accessibility check: **if you cannot find it by role or label, a screen
  reader cannot either.**

## Query priority

1. `getByRole` with a name - what assistive technology sees.
2. `getByLabelText` for form fields.
3. `getByText` for static content.
4. `getByTestId` - last resort, for something with no accessible representation.

- `getBy` throws when absent; `queryBy` returns null and is the one to use for **asserting
  absence**; `findBy` awaits appearance. Using `getBy` inside `waitFor` produces a confusing
  failure at the timeout instead of a clear one.
- **Assert the denied case renders nothing** - `expect(queryByRole(...)).not.toBeInTheDocument()`.
  That is what catches a panel that CSS was merely hiding.

## Async

- **`findBy` over `waitFor` plus `getBy`** - it retries the query itself and reports what it
  looked for.
- Never a bare `waitFor` with an empty body or an arbitrary timeout. Wait for the condition.
- `await` every interaction. An unawaited `userEvent` call leaves state updates pending, which
  is the real cause of most `act()` warnings - the fix is the missing `await`, not wrapping in
  `act`.
- Fake timers need `userEvent.setup({ advanceTimers })`, or clicks hang forever.

## Mocking

- **Mock the network, not the modules.** `msw` intercepts at the network layer, so your fetch
  wrapper, your serialization, and your error mapping are all still under test. Mocking the
  data module tests nothing but the mock.
- Do not mock child components to make a test simpler. That is the test telling you the
  component does too much.
- Mock the clock and randomness for determinism; assert on shape where a value is generated.

## Hooks

- Test a hook through a component that uses it, or with `renderHook` when it has no sensible
  host. A hook is an implementation detail of the components that call it - prefer testing
  those.
- **Do not assert render counts.** That is a performance question, and it belongs in the
  profiler, not in a correctness test that will break on an unrelated change.

## What every change ships with

- New behaviour: a test that fails without the change. Verify it fails.
- A bug fix: a regression test that fails against the old code.
- **A conditional render on a permission: the denied case, asserting the element is absent.**
- A form: the invalid submit shows a field-level error and sends no request - see
  `react-forms.md`.

## Where component tests stop

They render in jsdom, which has no layout, no real navigation, and no cookies. Anything that
depends on the middleware chain, a real session, or CSS-driven behaviour needs an end-to-end
test. **The authorization suite is end-to-end for exactly this reason** - a component test
that mocks the session tests the mock.
