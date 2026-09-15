# Routing and layouts

Paths: `app/**/layout.tsx`, `page.tsx`, `template.tsx`, route groups, dynamic segments.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

## A layout does not re-render on navigation

That is the feature, and it is the source of the bug. A layout renders once for the segment
and persists while pages beneath it change.

- **Never put a per-page authorization check in a layout and consider the page protected.**
  The layout ran for the first page; the second one navigated in beneath it. Authorize in
  the page or the handler that touches the resource.
- State in a layout survives navigation. If you need it reset per page, that is `template.tsx`.
- A layout that fetches blocks everything beneath it until it resolves. Keep its data small.

## Route groups organise files, not URLs

`(marketing)` and `(app)` do not appear in the path. Two route groups can therefore define
the same URL, and the build fails late and unhelpfully when they do.

- A group is the right way to give a section its own layout - a signed-in shell versus a
  public one.
- **A group is not a security boundary.** Putting a page inside `(app)` protects nothing on
  its own; the middleware matcher and the page's own check are what protect it.

## Dynamic segments are attacker input

`params.id` arrives from the URL. It is the same class of value as a request body.

- Validate its shape before use - a UUID parser, not a cast. A segment reaching a query, a
  filesystem path, or a redirect target unvalidated is the flaw.
- Scope the query by the session as well as the id. See `data-fetching.md`.
- `generateStaticParams` decides what is pre-rendered at build. Anything user-specific must
  not be in that list.
- Catch-all segments (`[...slug]`) accept arbitrary depth. Bound what you do with them.

## Parallel and intercepting routes

- Parallel routes (`@modal`) need a `default.tsx`, or a hard navigation to a sibling route
  renders a 404 in that slot. This is the failure that only appears on refresh, never in
  development navigation.
- An intercepted route must work when loaded directly. The modal is a presentation choice;
  the underlying page is the contract, and someone will share the URL.

## Loading, error, and not-found boundaries

Every route segment that fetches gets all three, or it inherits a parent's - which is
usually too coarse to be useful.

- `loading.tsx` for the segment, and a narrower `<Suspense>` around the genuinely slow part.
- `error.tsx` is a client component and catches render errors beneath it. It does not catch
  errors in a layout at the same level - that needs the parent's boundary.
- `notFound()` for a resource that exists for someone else. Prefer it over 403 where
  confirming existence is itself a leak.

## Links and navigation

- `<Link>` over a router push for anything that is a navigation - it prefetches and it works
  without JavaScript.
- **Never build an `href` from unvalidated user input.** A `javascript:` or absolute foreign
  URL in a link is the same open-redirect class as in middleware.
- `router.refresh()` re-fetches server data without losing client state. It is usually what
  is wanted after a mutation, not a full reload.

## Tests in the same PR

- A page reachable directly by URL, not only by navigating to it - that is what catches a
  check that only ran in a layout.
- The invalid-segment case: a malformed id returns 404, not a 500 from the parser.
