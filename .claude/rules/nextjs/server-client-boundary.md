# Server and client boundary

Paths: every file under `app/**`, and anything imported by one.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

The boundary is invisible in the source and absolute at runtime. Most serious App Router
bugs are a misplaced `"use client"` or an import that crossed it without anyone noticing.

## `"use client"` is a boundary, not a file setting

It marks the **entry point** of a client subtree. Every module that file imports, and
everything they import, is compiled into the browser bundle - including the module that
reads your database URL three imports down.

- **Push it down, never up.** Mark the small interactive leaf, not the page. A `"use
  client"` at the top of a route drags the whole tree into the bundle and gives up
  server rendering for the parts that never needed it.
- **A Server Component can render a Client Component. The reverse needs `children`.** Pass
  server-rendered content through as a prop rather than importing it - that is what keeps
  a heavy server tree out of the bundle.
- **Adding `"use client"` to fix an error is almost always wrong.** The error is telling
  you a hook or an event handler is in a server file. Extract that part instead.

## Guard the server-only modules

```ts
import "server-only";           // in every module that reads a secret or the database
```

That import turns a boundary crossing into a **build error** instead of a leak. Put it in
the database client, the auth module, the payment client, and anything reading a secret.
`client-only` is its mirror for modules that must never run on the server.

Without it, the failure is silent: the bundle builds, ships, and contains the key.

## What crosses the boundary is data, and it is public

Props passed from a server component to a client component are **serialized into the HTML**.
Anyone can read them in view-source.

- **Never pass a whole record across.** Pass the fields the component renders. A user row
  spread into props ships the password hash, the internal flags, and every column added
  next year.
- Functions, classes, `Date`-like custom objects, and symbols do not serialize. Only server
  actions cross as callables.
- The same applies to anything reaching a `use()` promise or a server action's return value.

## Never in a client component

- A secret, an API key, or a private hostname - the bundle is public. See `env-and-config.md`.
- A direct database or ORM import.
- An authorization decision that matters. `{isAdmin && <Panel/>}` chooses what renders; the
  endpoint behind it decides what is permitted, every time.

## Where the session is read

Read it on the server - in the layout, the page, the handler, or the action - and pass down
the narrow shape the view needs (`{ id, name, role }`). A client component that fetches the
session on mount produces a flash of the wrong UI and moves the decision to the browser,
which is not where it is enforced anyway.

## Tests in the same PR

- A test that the bundle contains no secret: grep the build output for a known server-only
  value. It is crude and it catches the whole class.
- Any component that takes props from a server parent: assert it renders from the narrow
  shape, so widening it later is a visible change.
