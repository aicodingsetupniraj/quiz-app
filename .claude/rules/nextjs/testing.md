# Testing the App Router

Paths: `**/*.test.tsx`, `e2e/**`, and every new route, action, or handler.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

`testing.md` covers what a test is for. This covers what is different when the thing under
test is a server component, an action, or a route.

## Pick the level that can actually fail

| Under test | Test it as |
|---|---|
| Server action | A direct call with the real schema and a fake session - it is a function |
| Route handler | A request in, a `Response` out |
| Server component | End-to-end, or extract the logic and unit test that |
| Client component | Render and interact - see `react.md` |
| Middleware + auth flow | End-to-end. Nothing else exercises the matcher |

**A server component is awkward to unit test, and that is a signal.** Move the decision into
a plain function, test that directly, and leave the component as the thin thing that calls
it. Fighting the renderer to assert a value produces a brittle test of the framework.

## The authorization tests are the ones that matter

Every new entry point - action, handler, or page - ships with the negative case in the same
PR:

- The anonymous caller is refused.
- **Another tenant's id is refused, and the record is asserted unchanged afterwards.** A 403
  returned after the write still wrote. Assert the row.
- A page is requested **directly by URL**, not only navigated to. That is what catches a
  check that lived in a layout and never ran on a direct load.

`e2e/authz/` is the blocking suite. It runs real HTTP with real sessions, because a unit
test that mocks the auth layer tests the mock.

## Mock the boundary, not the framework

- Mock the database client, the payment provider, the mail sender. Do not mock `next/*`.
- **Never mock the module under test.** A test of three mocks tests the mocks.
- Do not mock `fetch` globally to make a server component render - that is the sign the test
  belongs at the e2e level.

## What breaks in CI and not locally

- **Anything reading `process.env`** - the env schema must have test values, or the suite
  fails at import with a message about the wrong thing.
- Timezone and locale. Fix both in the test setup; a date-formatting assertion that passes
  in London and fails in CI is a day lost.
- The build itself is a test. `next build` catches the client/server boundary violations
  that no unit test will, so it runs in CI on every PR.

## Cases worth writing for this stack

- The empty state, and the one-item state - the list that renders nothing is a real bug.
- A dynamic segment that is malformed: assert 404, not a 500 from the parser.
- An action that calls `redirect()` inside a `try`: assert it actually redirects. The `catch`
  swallowing the control-flow throw is silent otherwise.
- After a mutation: assert the revalidated page shows the new value. That is what catches an
  invalidation that named the wrong tag.
