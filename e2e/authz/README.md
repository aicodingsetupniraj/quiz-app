# Authorization tests

The slowest suite to build and the one that matters most.

Every test here asserts a **denial**. Tests that assert success belong with the feature.

## Fixtures

Three, and they are the whole design:

- **User A** - owns resources
- **User B** - a different user in a different tenant, owns their own
- **Anonymous** - no session

Sessions are created through the real login path, not injected. A test that mocks the auth
layer tests the mock.

## The matrix

Entry points down, actors across. For every route handler, server action, RPC method,
webhook, file download, and background job that accepts an ID:

| Case | Expected |
|---|---|
| Anonymous requests A's resource | 401, or redirect to sign-in |
| B requests A's resource by ID | 403 or 404 |
| B modifies A's resource | 403 or 404, **and the record is unchanged** |
| B deletes A's resource | 403 or 404, **and it still exists** |
| B lists resources | A's do not appear - assert the contents, not the count |
| Lower-privileged role calls an admin action | 403 |

**Assert the effect, not only the status.** A handler can return 403 after performing the
write. Read the record back.

Prefer 404 over 403 for another tenant's resource where the product allows it - a 403
confirms the resource exists.

## Rules

- Real HTTP against a real running app.
- Each test independent and self-seeding. A suite that depends on ordering gets disabled the
  first time it flakes, and then it protects nothing.
- **New entry point, new row, same PR.** This is the discipline the suite depends on, and it
  decays the first time it is treated as follow-up work.
- A failure here is never flaky-until-proven-otherwise. It is a vulnerability until proven
  otherwise.

Generate the suite with the `authz-test` skill. It blocks in CI.
