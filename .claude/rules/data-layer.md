# Data layer

Paths: `lib/db/**`, schema files, repositories, and anything that builds a query.

## Scope every query to the caller

The single most important rule in this file:

```
// Wrong - fetches anyone's record, then checks
const doc = await db.doc.findUnique({ where: { id } });
if (doc.orgId !== session.orgId) throw new Forbidden();

// Right - cannot return another org's record at all
const doc = await db.doc.findFirst({ where: { id, orgId: session.orgId } });
if (!doc) notFound();
```

Fetch-then-check leaks through error messages, through timing, and through every future
caller that forgets the second line. Scoping in the query cannot be forgotten.

## Queries

- Parameterized, always. No string concatenation, no template literal holding a value. Where
  an identifier genuinely must be dynamic, allowlist it against a fixed set.
- Select the columns you need. `SELECT *` ships every column added later, including the ones
  added because they were sensitive.
- Bound every list. A query with no limit is a query that returns the whole table when the
  data grows.
- Watch for N+1. One query in a loop over a hundred rows is a hundred round trips.

## Writes

- Allowlist the fields. Never spread a request body into an update - a field the schema
  happened to permit becomes a field the caller can write.
- Wrap multi-step writes in a transaction. A partial write is worse than a failed one, and
  much harder to find later.
- Use the database's constraints - unique, foreign key, check. Application-level uniqueness
  loses to concurrency.

## Schema

- Migrations are the only way the schema changes. No manual production edits, ever.
- Nullable means "genuinely optional", not "easier to add". A column nullable for convenience
  becomes a null check in fifty places.
- Index what you filter and join on. Add the index in the same PR as the query that needs it.
- Store money in minor units as an integer, or a decimal type. Never a float.
- Timestamps in UTC, with a timezone-aware column type.

## Personal data

- Know which columns hold it. That list is what the threat model and the retention policy
  both depend on.
- Never log it. Never put it in an error message or an analytics event.
- Deleting a user means deleting or anonymising their rows, and that has to work.
