# Caching

`revalidate`, tags, and `dynamic`. Paths: pages, layouts, route handlers, and data fetching.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

## The rule that prevents the serious bug

**Anything user-specific is dynamic, explicitly.**

The severe failure in this area is not a stale page. It is one user's data cached and served
to another. Any route that reads a session, a cookie, or a user-scoped record must be
uncacheable, and it must say so in the file rather than depending on the framework inferring
it from a call it happens to make.

If you cannot state in one sentence why a route is safe to cache, it is not.

## Make the intent explicit

Every route falls into one of three cases, and the file should say which:

- **Static** - the same for everyone, changes on deploy. Marketing pages, documentation.
- **Revalidated** - the same for everyone, changes on a known interval. Public listings,
  published content. Set the interval from how stale the data may acceptably be, not from a
  round number.
- **Dynamic** - differs per request or per user. Everything behind authentication.

Leaving it to the default means the decision was never made, and the default is not aware of
which case this is.

## Invalidation

- Prefer tags. `revalidateTag` invalidates by meaning; `revalidatePath` invalidates by
  location, and misses the other pages showing the same data.
- Tag at the fetch, invalidate at the write, in the same PR. A cache invalidated in one of the
  three places that write the data is a bug that appears only in production.
- Revalidate the narrowest thing that changed. Clearing a whole segment to be safe throws away
  the cache you built the feature for.

## Client-visible caching

- `Cache-Control` on an authenticated response must prevent shared caching. `private`, or
  `no-store` where the content is sensitive.
- A CDN in front of the app makes an incorrect header far more expensive - it serves the
  mistake to everyone, quickly.

## Checklist for any caching change

- [ ] Is this response the same for every user? If not, it is dynamic.
- [ ] Does it read a session, a cookie, or a header? Then it is dynamic.
- [ ] Every place that writes this data invalidates it.
- [ ] The interval reflects real tolerance for staleness.
- [ ] `Cache-Control` correct for authenticated responses.
