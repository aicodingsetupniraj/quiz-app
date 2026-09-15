# Data access

Paths: `db/**`, `prisma/**`, `drizzle/**`, repositories, migrations.

**Node rule pack.** Delete this file in a repository with no database in it.

`data-layer.md` holds the rules that apply in any language. This is the Node-specific way to
get them wrong.

## One client, constructed once

- **A `PrismaClient` or a `Pool` per module is a connection pool per module.** Construct once,
  export it, import it everywhere. In development with hot reload, cache it on `globalThis` or
  every save leaks a pool until the database refuses connections.
- Size the pool against the database's limit divided by the number of instances - not the
  default. Serverless multiplies instances, and the default per-instance pool exhausts a small
  database quickly; use the platform's pooler.
- Close it on shutdown, after the server has drained. See `node-jobs.md`.

## Queries

- **Parameterize.** A template literal into `query()` is injection - see `node.md`. Use
  placeholders, or the driver's tagged-template helper which parameterizes what it interpolates.
- **Scope by the caller in the `where`**, not after the fetch. `findFirst({ where: { id,
  orgId } })`, never `findUnique({ where: { id } })` followed by a check.
- Select the columns you need. Prisma's `select`/`drizzle`'s column list keeps a column added
  next year out of the response automatically.
- Bound every list. `findMany` with no `take` returns the table once the data grows.
- **N+1 is the default in an ORM.** A relation accessed in a `map` over rows is one query per
  row. Use `include`, a join, or a batched `in` query - and assert the query count in a test,
  because nothing else catches it before production.

## Writes

- Allowlist fields. Never spread a request body into `data` - that is how a caller sets the
  column that decides ownership.
- **`$transaction` for multi-step writes**, and keep it short. A transaction held across an
  HTTP call holds a connection for a third party's latency.
- Interactive transactions have a timeout; a long one silently rolls back and the code after it
  assumes success. Check the result.
- Concurrency: a unique constraint or an optimistic version column. A read-modify-write with no
  guard is a lost update the moment two requests land together.
- `upsert` is not atomic on every engine - under concurrency it can still raise a unique
  violation. Handle it.

## Migrations

- **Generated, committed, and reviewed** - never `db push` against anything but a scratch
  database. `migration-reviewer` reads them for a reason.
- Expand, migrate, contract. Adding a `NOT NULL` column with no default locks the table and
  fails on existing rows.
- The migration and the code that needs it are two deploys, not one. If they cannot be split,
  the change needs splitting - see `release.md`.
- Check what takes a lock at production row counts. The migration that is instant on a laptop
  is the one that takes the site down.

## Types

- **Generated types, not hand-written interfaces** for rows. A hand-written type is a promise
  that drifts silently the first time someone adds a column.
- A row is not a domain object and not a response shape. Map at the boundary, or every column
  becomes API.

## Tests in the same PR

- Against a real database in a container. A mocked ORM tests the mock, and the bugs are in the
  SQL.
- The cross-tenant read returns nothing; the cross-tenant write leaves the row unchanged.
- A query-count assertion on any endpoint that loads a collection.
- The migration runs forward against a copy with realistic volume, and its rollback is either
  run or explicitly documented as one-way.
