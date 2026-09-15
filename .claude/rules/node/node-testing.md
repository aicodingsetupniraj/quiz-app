# Testing

Paths: `**/*.test.ts`, `**/*.spec.ts`, `tests/**`.

**Node rule pack.** Delete this file in a repository with no Node tests in it.

`testing.md` says what a test is for. This is the Node-specific way to keep it honest.

## Levels

| Under test | Test it as |
|---|---|
| A pure function, a mapper, a validator | Unit, no mocks at all |
| A service with one dependency | Unit, with that dependency faked at its interface |
| A route or handler | Request in, response out, against a real database |
| A repository or query | Integration, real database in a container |
| Auth, sessions, tenancy | End-to-end - nothing else exercises the middleware chain |

**A test that needs four mocks is testing the wiring.** That is a design signal: the unit has
too many collaborators, or the logic belongs one layer down where it has none.

## Mocking

- **Mock the boundary you do not own** - the HTTP client, the payment provider, the clock,
  the queue. Not the database, not the framework, and never the module under test.
- Prefer a fake implementing the interface over a mock asserting call counts. A test that
  asserts "called once with these arguments" breaks on every refactor and passes when the
  behaviour is wrong.
- For HTTP, intercept at the network layer (`msw`, `nock`) rather than replacing the client -
  that exercises your serialization and your error mapping too.
- `vi.mock` / `jest.mock` is hoisted above the imports. Getting that wrong produces a test
  that passes while mocking nothing - the most common false-green here.

## Determinism

- **Fake the clock** for anything computing "now". A test that passes at 11pm and fails at
  midnight costs a day to find.
- Seed randomness and uuids, or assert on shape rather than value.
- **No shared mutable state between tests.** Each one creates the rows it needs and cleans up,
  or runs in a transaction that rolls back. A suite that only passes in one order is broken.
- Set `TZ` and the locale in the runner config, or CI and a laptop disagree about dates.
- **No arbitrary sleeps.** Wait for the condition. A `setTimeout(500)` to "let it settle" is a
  race that will fail in CI and be marked flaky.

## Async

- Every promise is awaited or returned. A floating assertion inside an unawaited promise
  passes by not running.
- Assert rejections with the matcher (`await expect(fn()).rejects.toThrow(X)`), not a
  `try/catch` with an `expect` in it - if it does not throw, that test passes silently.
- Set an explicit timeout on tests that touch a container, and make it generous. A flaky
  timeout teaches people to rerun CI.

## Integration and containers

- A real database and a real broker in containers (`testcontainers`), not an in-memory
  substitute. SQLite standing in for Postgres passes tests your production SQL fails.
- Build the schema by running the migrations, so the migrations are tested too.
- Keep them separate from the fast suite by tag or directory - and run them in CI, not only
  on demand. A suite nobody runs is documentation.

## What ships with a change

- New behaviour: a test that fails without the change. Verify it fails, do not assume.
- A bug fix: a regression test that fails against the old code.
- **A new entry point: the negative authorization case, in the same PR**, asserting the record
  is unchanged afterwards.
- Coverage is a floor, not a goal. Full coverage of code with no assertions proves it ran.
