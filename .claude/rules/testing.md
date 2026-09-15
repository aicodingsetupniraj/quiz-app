# Testing

Paths: `**/*.test.*`, `**/*.spec.*`, `e2e/**`.

## What a test is for

To fail when the behaviour breaks. A test that cannot fail is a cost with no benefit, and a
suite full of them is worse than no suite because it buys false confidence.

## The rules

- **Test behaviour through the public surface.** Assert what a caller can observe. Tests
  pinned to internal structure break on every refactor and prove nothing about correctness.
- **One reason to fail per test.** A test asserting six things says a feature broke; six tests
  say which part.
- **No conditionals in a test.** An `if` means the test silently checks nothing on one branch.
  Write two tests.
- **Deterministic.** Fix the clock, seed the randomness, never depend on ordering the runtime
  does not guarantee. A flaky test gets disabled, and then so does the one beside it.
- **Independent and self-seeding.** A test that depends on another having run is a suite that
  cannot be run in parallel or in isolation.
- **Do not mock the thing under test.** Mock its collaborators, and as few as possible. A test
  of three mocks tests the mocks.

## What every change ships with

- New behaviour: a test that fails without the change.
- A bug fix: a regression test that fails against the old code. Verify that, do not assume it.
- A new entry point: **the negative authz case.** User A requests user B's resource and is
  refused. This is not optional and it does not become a follow-up ticket.

## Cases that actually fail in production

- The empty case - no rows, no items, no results
- The boundary - zero, one, exactly the limit, one past it
- The error path - the dependency throws, the network fails, the input is malformed
- The concurrent case, wherever two requests can touch the same row

## The authz suite

`e2e/authz/` is a blocking gate. It runs real HTTP against a real app with real sessions,
because a unit test that mocks the auth layer tests the mock.

A failure there is never treated as flaky-until-proven-otherwise. It is treated as a
vulnerability until proven otherwise.

## Never

- Never delete, skip, or loosen a test to make CI green. Fix the cause, or quarantine it with
  a linked issue and an owner.
- Never add a sleep or a retry to hide a race. You are hiding it for the next person.
- Never assert only that something did not throw.
