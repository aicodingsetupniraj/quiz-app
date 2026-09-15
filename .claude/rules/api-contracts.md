# API contracts

Paths: route handlers, response and request schemas, event payloads, exported types, and
anything published for another team to call.

A contract is anything a caller depends on that you cannot redeploy at the same time as your
own code. Inside one process a rename is a refactor; across a deploy boundary it is an
outage in somebody else's service.

## The asymmetry

**Adding something optional is safe. Removing or requiring something is not.**

Breaking, whatever the intent:

- Removing or renaming a response field
- Making a request field required, or tightening its validation
- Changing a field's type — including `number` to numeric string
- Making a response field nullable that was not; callers do not null-check it
- Returning a new enum value, where callers switch exhaustively
- Changing a status code, an error shape, a default value, or the default page size

Safe:

- A new optional request field
- A new response field
- Accepting a new enum value

**Removing a field is breaking even when nothing in this repository reads it.** The absence
of a caller here is not evidence about callers outside here.

## Changing one anyway

Add alongside, dual-write, move the callers you can see, announce, then remove — in a later
release, not this one. The removal is its own PR so it can be reverted on its own.

Deprecate in the open: mark it in the schema, log when it is used so you can see who still
is, and set a date. A deprecation with no date is a field you keep forever.

## Callers you cannot redeploy

Name them before changing anything: public APIs, webhook payloads, published packages, and
**mobile clients** — an old app version can be live for a year, and it does not update
because you shipped.

Events already sitting in a queue or an event store were written by the old code and will be
read by the new. Old messages do not migrate themselves; the consumer handles both shapes
until the backlog is provably drained.

## Shape

- Version the interface, or accept that you can never remove anything. Pick one deliberately.
- Every list endpoint is paginated from the day it exists. Adding pagination later is itself
  a breaking change.
- Errors are part of the contract: a stable machine-readable code, a message for humans, and
  never an internal detail — no stack traces, no SQL, no internal ids.
- Validate input at the boundary against an explicit schema, and reject what does not match
  rather than coercing it. Accepting sloppy input silently makes the real shape unknowable.
- Write is idempotent where a client can retry it. A network timeout means the caller does
  not know whether it worked, and the caller will retry.
