# Errors and boundaries

Paths: `app/**/error.tsx`, `global-error.tsx`, `not-found.tsx`, and every action or handler
that can fail.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

## What the client is allowed to see

In production Next.js replaces a thrown server error's message with a generic string and a
digest. That is a security default, and code that works around it is the bug.

- **Never return the error object, its message, or its stack to the client.** Log it on the
  server with a correlation id and return the id. "Something went wrong (ref: 8f2a)" is
  actionable for support and leaks nothing.
- A server action's return value crosses to the browser. An error shape you build yourself
  is under your control and must carry no query, path, or internal id.
- The digest in the client boundary is the join key to the server log. Render it.

## The boundaries, and what each actually catches

| File | Catches |
|---|---|
| `error.tsx` | Render errors in that segment's children. **Not** its own layout |
| `global-error.tsx` | Errors in the root layout. Must render its own `<html>` and `<body>` |
| `not-found.tsx` | `notFound()` calls, and unmatched routes at the root |

- `error.tsx` is a client component by definition. It receives `reset()`; wire it, or the
  user's only recovery is a reload.
- **An error in a layout is caught by the parent's boundary, not its own.** A root layout
  that can throw needs `global-error.tsx` or the user sees a blank page.
- A boundary with no fallback content is worse than none - it swallows the error and renders
  nothing, and nobody can tell whether the page is loading or broken.

## Expected outcomes are not exceptions

- "Not found", "already exists", and "not permitted" are results, not failures. Return them
  as data from an action so the form can render them per field; throw only for genuinely
  exceptional conditions.
- **`notFound()` and `redirect()` throw to unwind, and a `catch` will swallow them.** Never
  call either inside a `try` whose `catch` does not rethrow - the page then renders as if
  nothing happened. This is the most common silent bug in this area.
- Prefer `notFound()` over a 403 where confirming a resource exists is itself a leak.

## Every failure is logged once, with context

- Log at the boundary where the outcome is known, not at every frame on the way out.
- Carry the request id, the user and tenant, and the entity id. See `observability.md`.
- Never log the session token, the cookie header, or the whole request object.
- An empty `catch` in a server component turns an outage into a silently wrong page. If a
  failure is genuinely ignorable, the comment says why.

## Tests in the same PR

- The failing dependency renders the boundary, and the response contains no stack trace and
  no query text.
- `reset()` recovers without a full reload.
- An action that calls `redirect()` inside a `try` is asserted to actually redirect - that
  test is what catches the swallowed control flow.
