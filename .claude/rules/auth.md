# Authentication and authorization

Paths: `middleware.ts`, `lib/auth/**`, and anywhere a session is created, read, or destroyed.

This is a high-tier path. `protect-paths` denies the agent an edit here outright, and the
agent stops for a plan before writing.

## The distinction that matters

**Authentication** is *who are you*. **Authorization** is *may you do this to this thing*.

A codebase that only checks the first has a vulnerability in every handler. Confusing them is
the most common real flaw in web applications, and it does not look like a bug when reading -
the check is right there, it just answers the wrong question.

## Sessions

- Server-side validation on every request. A value the client sends is a claim, never a fact.
- Cookies: `HttpOnly`, `Secure`, `SameSite=Lax` at minimum, scoped as narrowly as the product
  allows.
- Expiry enforced server-side. A timestamp inside a token the client holds is not enforcement.
- **Invalidate on logout, password change, email change, and role change.** A session that
  survives a password reset defeats the reset.
- Rotate the session identifier on privilege change, to close session fixation.

## Middleware is not authorization

Middleware is a coarse net. It sees a path, not a resource. It cannot know whether *this*
user owns *that* invoice, and a route added later may not match the pattern anyone wrote.

**Authorize in the handler, on the resource, every time** - even when middleware already
rejected the anonymous case.

## Passwords and tokens

- Hash with a memory-hard algorithm - argon2id or bcrypt. Never encrypt, never plain-hash.
- Reset tokens: cryptographically random, single-use, short-lived, invalidated on use.
- Compare secrets in constant time.
- Identical responses for unknown user and wrong password, or the endpoint enumerates users.
- Rate-limit login, reset, and anything that sends mail or SMS.

## Third-party identity

- Validate the token signature, the issuer, the audience, and the expiry. All four.
- Never trust an email claim as an account identifier unless the provider guarantees it is
  verified - otherwise account takeover is a signup away.
- Store the provider's stable subject identifier, not the email, as the link.

## Never

- Never write your own crypto or token format.
- Never put a role or permission in a client-readable value and trust it on return.
- Never log a token, a session ID, or a password - including in an error path.
- Never add a bypass for local development that can be switched on by an environment
  variable. It will eventually be on in an environment where it should not be.
