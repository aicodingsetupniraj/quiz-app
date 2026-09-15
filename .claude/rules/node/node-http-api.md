# HTTP APIs

Paths: `routes/**`, `controllers/**`, `src/api/**`, Express/Fastify/Nest application setup.

**Node rule pack.** Delete this file in a repository with no HTTP service in it.

`secure-endpoint` is the order every handler follows. This is the framework-level scaffolding
around it.

## Middleware order is behaviour

The order in which middleware is registered decides what is enforced, and it is invisible at
the call site. Write it down where it is defined:

1. Request id and logger binding - so everything after can be correlated.
2. Body size limit - **before** the parser, or the parser buffers the whole payload first.
3. Security headers and CORS.
4. Rate limiting - before authentication, so an unauthenticated flood is cheap to reject.
5. Authentication.
6. Routes.
7. **The error handler, last.** In Express it must take four arguments or it is silently
   registered as ordinary middleware and never runs.

A route registered before the auth middleware is unauthenticated, and nothing will tell you.

## Async errors do not propagate by themselves

- **In Express 4, a rejected promise in a handler is an unhandled rejection**, not a 500 - the
  request hangs until it times out. Wrap handlers, use a wrapper helper, or use Express 5 /
  Fastify, which handle it.
- Every route has a path to the central error handler. A `try/catch` per route that formats
  its own response produces five error shapes and one of them leaks a stack trace.
- One error mapper: domain error to status code, in one place. `NotFoundError` to 404,
  `ForbiddenError` to 403, everything unrecognised to 500 with a correlation id and no detail.

## Validation and shape

- **Parse body, query, params, and headers you read** against a schema at the boundary, and
  hand the parsed type inward - see `node-typescript.md`.
- Reject unknown fields rather than ignoring them: a typo'd field silently doing nothing is a
  bug report about data not saving.
- **Serialize responses through an explicit schema.** Returning a database row ships every
  column added next year. Fastify's response schema does this and makes it faster; elsewhere,
  map explicitly.
- Every list endpoint is paginated from the day it exists, with a maximum page size. Adding
  pagination later is a breaking change.

## Routing and contracts

- Version at the path (`/v1`) or accept that nothing can ever be removed - see
  `api-contracts.md`. Decide deliberately, once.
- Consistent error body across the whole API: a stable machine-readable code, a human message,
  and a request id. Clients branch on the code, so it is part of the contract.
- `Content-Type` is checked, not assumed. A JSON parser that also accepts form encoding is a
  CSRF vector on a cookie-authenticated endpoint.
- Health and readiness are separate endpoints. Readiness checks dependencies; health does not,
  or a slow database restarts every pod.

## Timeouts, limits, and shutdown

- **Set `server.requestTimeout` and `headersTimeout`.** Node's defaults let a slow client hold
  a connection.
- Every outbound call gets its own timeout - see `node.md`.
- Graceful shutdown on `SIGTERM`: stop accepting, drain in flight, close the pool. Without it
  every deploy drops requests. See `node-jobs.md`.

## Tests in the same PR

- The negative authorization case per endpoint, asserting the row is unchanged afterwards.
- One test that the error handler is reachable from an async throw - that is what catches the
  four-argument mistake.
- A test that an unknown field in the body is rejected, and that a response contains only the
  declared fields.
