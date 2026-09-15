# Node services

Paths: `src/**/*.ts`, `routes/**`, `server/**`. Express, Fastify, Nest, or plain `http`.

**Node rule pack.** Delete this file in a repository with no Node service in it.

## The shell is not a function call

- **`exec` and `execSync` run a shell.** Any interpolated value is an injection. Use
  `execFile`/`spawn` with an argument array, which does not.
- If a shell is genuinely required, the arguments come from an allowlist, never from a
  request. "It is only called internally" is not a control - it is a note about today.

## Untrusted input

- **Validate at the edge with a schema** - zod, valibot, JSON Schema - and pass the parsed
  type inward. A TypeScript type is erased at runtime and proves nothing about the body.
- **Never spread a request body into a query, an update, or an object you own.**
  `{...req.body}` is how a user sets `isAdmin`, and `__proto__` in a merged body is prototype
  pollution that changes every object in the process.
- **Paths from a request get resolved and contained**: `path.resolve(base, input)`, then check
  the result still starts with `base`. Stripping `../` is not containment.
- Cap what you accept: body size, array length, page size, upload size, request timeout. An
  unbounded parameter is a denial of service with no exploit needed.

## Tokens and sessions

- **`jwt.verify` with an explicit `algorithms` allowlist.** Without it a token signed `none`,
  or signed with the public key as an HMAC secret, is accepted.
- **`jwt.decode` is not verification.** It parses. It checks nothing.
- Verify `exp`, `iss`, and `aud`. An unexpired token from another environment is still a valid
  signature.
- Cookies: `httpOnly`, `secure`, `sameSite`. Session ID rotates on privilege change.

## HTTP surface

- **CORS: an origin allowlist.** Reflecting the request origin with credentials enabled is the
  same as having no policy.
- Security headers on by default (`helmet` or equivalent). CSP is worth the argument it costs.
- **Never return a stack trace, a query, or an internal path to a client.** Log the detail with
  a correlation id; return the id.
- Rate-limit authentication, password reset, and anything that sends mail or costs money.

## Structure

- **Route → handler → service → repository, and dependencies point inward.** The handler
  parses, authorizes, calls one service function, and shapes the response.
- **`req` and `res` never travel below the handler.** A service that takes a request object
  cannot be called by a job, a CLI, or a test without faking one.
- **A handler over about twenty lines is holding domain logic.** Move it down.
- Middleware order is behaviour: auth before anything that reads a user, body limits before
  the parser, error handler last. Write the order down where it is defined.
- One place constructs the database client. Not per module.

## Async

- **No floating promises.** An unawaited rejection is an unhandled crash or, worse, a silent
  skip of the write you thought happened. Lint for it.
- `Promise.all` for independent work; a loop with `await` when order or backpressure matters.
- Every outbound call gets a timeout. Node's default is none, and one slow dependency becomes
  your outage.

## Tests in the same PR

- Every new endpoint gets a **negative authorization test**: another user's id, and the record
  is asserted unchanged afterwards. A 403 returned after the write still wrote.
- Schema rejection is tested at the boundary, with the malformed body a client actually sends.
