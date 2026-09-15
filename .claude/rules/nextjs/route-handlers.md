# Route handlers

Paths: `app/api/**/route.ts`.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

## Every handler, in this order

1. **Authenticate** - session checked before any effect.
2. **Validate** - parse body, query, and params against a schema. Everything in a request is
   untrusted, including headers and the path segment.
3. **Authorize** - may this caller act on this resource? Scoped in the query, not checked
   after the fetch.
4. **Act** - then return only the fields the caller needs.

## Rules

- **A dynamic segment is user input.** `params.id` is attacker-controlled. Treat it exactly as
  you would a body field.
- **Return the right status.** 400 malformed, 401 unauthenticated, 403 authenticated but not
  permitted, 404 where existence itself should not be confirmed, 409 conflict, 422 semantically
  invalid. Prefer 404 over 403 for another tenant's resource - a 403 confirms it exists.
- **Never echo the input back in an error.** It is a reflection sink and it leaks internals.
- **Set the caching behaviour deliberately.** An authenticated response accidentally cached at
  the edge serves one user's data to the next. Where a handler returns anything user-specific,
  say so explicitly rather than relying on a default.
- **CORS is not `*` on anything authenticated.** Allowlist the origins.
- **Rate-limit** anything unauthenticated, expensive, or capable of sending a message.
- **Bound the body size.** An unbounded JSON body is a denial of service with no exploit
  needed.
- **Validate the webhook signature before parsing the body**, and use the raw bytes to do it.
  A webhook is an unauthenticated public endpoint until the signature check passes.

## Never

- Never build a filesystem path or a shell command from a segment or a query parameter.
- Never proxy an arbitrary URL supplied by the caller - that is SSRF, and the cloud metadata
  endpoint is the first thing found by it.
- Never return a raw ORM object. Map to a response shape, so a column added next year does not
  ship to clients automatically.
