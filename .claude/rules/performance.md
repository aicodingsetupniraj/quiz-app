# Performance

Paths: anything that queries, loops over results, renders a list, or runs in a request path.

The failures that matter are invisible on seed data and take the site down at real volume.
They are almost always about **how many times** something runs, not how fast it is. Before
optimising anything, state the multiplier: how many times per request, and what makes that
number grow.

## The four that cause real incidents

1. **N+1.** A query or service call inside a loop over rows. Twenty locally, forty thousand
   in production. Fix with a join, a batched `IN`, or a dataloader.
2. **Unbounded results.** A query with no limit, an endpoint with no pagination. It works
   until the table grows, then returns the whole table into memory. Ask what the row count
   is in a year, not today.
3. **Blocking work in the request path.** Mail, a third-party call, a PDF, a webhook. Its
   latency *and its failure* become the user's. If the user does not need the result to
   proceed, it belongs on a queue.
4. **A missing index for a new access pattern.** Any new filter, sort, or join column
   without one is a scan that grows with the table. The index ships in the same PR as the
   query — added later, it is added after the incident.

## Also worth catching

- Independent awaits run in sequence cost the sum of their latencies for nothing. Only where
  they are genuinely independent; a dependent chain is correct as written.
- Selecting every column and returning it. Bytes are what a user on a phone actually feels.
- Repeated work in a hot path: rebuilding the same map, re-parsing config, recompiling a
  regex inside the function.

## Caching

- **Key by tenant and user, always.** A cache key missing the tenant is not a slow page, it
  is a data leak — treat it as an authorization bug.
- No cache without a decided invalidation path. "It expires eventually" is a stale-data bug
  with a delay on it.
- Cache the expensive and stable. Caching something cheap adds a failure mode and buys
  nothing.

## Budgets

Set them once, then treat a regression as a bug rather than a discussion:

- A p95 server response budget per endpoint class, and the queries a request may issue
- For a UI, a budget on the bytes shipped for the initial view

Measure at p95 and p99. An average hides exactly the requests worth knowing about — the
slowest ones are the ones users complain about, and they are invisible in the mean.

## Do not

Optimise what does not grow. A loop over five fixed items is not a finding, and reporting it
is how the real one gets ignored along with it. Measure before changing anything on
performance grounds, and say what you measured.
