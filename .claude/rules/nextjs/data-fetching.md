# Data fetching

Paths: `app/**` pages, layouts, and the modules they call.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

`caching.md` covers what may be cached. This covers how the data is fetched and rendered.

## Fetch on the server, close to what renders it

- **Fetch in the component that needs the data**, not in a parent that passes it down five
  levels. Requests are deduplicated within a render, so two components asking for the same
  thing cost one query - the prop-drilling is the only thing you save by hoisting, and it
  is not worth the coupling.
- **`useEffect` fetching is a last resort in the App Router.** It gives up server rendering,
  adds a loading state and a waterfall, and has no cancellation unless you write it.
  Server-fetch and pass down; use a client fetch only for data that genuinely cannot exist
  until after interaction.

## Waterfalls are the default failure

Sequential `await`s that do not depend on each other cost the sum of their latencies for
nothing.

```ts
const [user, invoices] = await Promise.all([getUser(id), getInvoices(id)]);
```

- Independent fetches run in parallel. Only a genuinely dependent chain awaits in sequence.
- A layout that awaits before rendering blocks every page beneath it. Keep layout data
  minimal, or stream it.

## Streaming and Suspense

- **Wrap the slow part in `<Suspense>` with a real fallback**, so the shell renders
  immediately. A page that waits for its slowest query to show anything is the common cause
  of a "slow" App Router app that is not actually slow.
- `loading.tsx` is a Suspense boundary for the whole route segment - useful, blunt. Prefer a
  boundary around the specific slow component.
- The fallback should be the shape of the content, not a spinner in a blank page. A layout
  shift on every load is a real cost.

## Every query is scoped to the caller

A page is not more trusted than a route handler. `params.id` is attacker-controlled, and a
server component that fetches by id without the session in the `where` clause serves another
tenant's data with no error and no log line.

```ts
const doc = await db.doc.findFirst({ where: { id: params.id, orgId: session.orgId } });
if (!doc) notFound();
```

Fetch-then-check leaks through timing and through the next caller who forgets the check.

## Bound and shape the result

- Every list query has a limit. A page that renders "all" of something works until the data
  grows and then times out in production.
- Select the columns the view renders. Returning the row and picking fields in JSX still
  ships the whole row into the RSC payload.
- Watch for a query inside a `map` over rows - the N+1 is invisible on seed data and is the
  most common real performance incident.

## Tests in the same PR

- The empty case and the "belongs to someone else" case, asserted at the page level.
- For anything wrapped in Suspense, assert the fallback and the resolved state both render.
