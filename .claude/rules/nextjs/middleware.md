# Middleware

Paths: `middleware.ts`, `src/middleware.ts`.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

One file decides what happens to every request. `protect-paths` denies the agent an edit
here outright, and the agent produces a plan and stops. This file says what the plan has to
get right.

## Middleware is a coarse net, never the authorization check

It sees a **path**, not a resource. It cannot know whether this user owns that invoice, and
a route added next month may not match the pattern anyone wrote.

- **Authorize in the handler, on the resource, every time** - even where middleware already
  rejected the anonymous case. `auth.md` and `route-handlers.md` say the same thing because
  it is the flaw that keeps recurring.
- A matcher is an optimisation, not a security boundary. Treat a bypassed matcher as a
  routing bug, not a breach - because the real check is downstream.

## The matcher is the whole blast radius

- **State it explicitly.** Without a `matcher`, middleware runs on every request including
  static assets, and that is both a latency tax on every page and a much larger surface.
- Exclude `_next/static`, `_next/image`, and the public asset paths. Include the routes you
  mean, and write the exclusions as a comment when the regex stops being readable.
- **Adding a route group or a new segment does not update the matcher.** When you add a
  protected area, the matcher change ships in the same PR or the area is unprotected.

## The edge runtime is not Node

Middleware runs on the edge runtime unless configured otherwise. No `fs`, no `net`, no most
native crypto, no database driver, and a small bundle budget.

- **Do not verify a session against the database here.** Verify a signed cookie or a JWT
  with Web Crypto, and let the handler do the authoritative lookup. A database round trip in
  middleware is a round trip on every matched request.
- Keep it small and synchronous-ish. Everything you import into middleware is on the hot
  path of every request it matches.

## Redirects and rewrites

- **Never redirect to a URL built from a request value** without validating it against an
  allowlist. `?next=https://evil.example` is an open redirect, and it is how a phishing link
  gets your domain in front of it. Allow relative paths only, and reject anything with a
  scheme or a `//` prefix.
- A rewrite keeps the URL and changes what is served. Do not rewrite an unauthenticated
  request into an authenticated area on the assumption something downstream will catch it.
- Setting a cookie on a redirect response requires setting it on the response you return -
  not on a new one.

## Headers

- Security headers set here apply everywhere, which is the good reason to use middleware.
- **Never trust an incoming header for identity.** `x-forwarded-for`, `x-real-ip`, and
  anything a client can set are inputs, not facts. If you attach a header for downstream use,
  strip the client-supplied version of it first, or a caller can forge it.

## Tests in the same PR

- The matcher: a table of paths, each asserted to be matched or not. That is the test that
  fails when someone adds a route group.
- The unauthenticated case redirects, and the authenticated case passes through untouched.
- Any redirect target derived from input: assert an absolute URL to another host is refused.
