# Threat model

**TEMPLATE - not yet filled in.** Run the `threat-model` skill and replace every section.
An unfilled threat model is worse than none, because it looks like the work was done.

One page. A threat model nobody rereads is a document, not a control.

---

**Last reviewed:** `YYYY-MM-DD` by `@REPLACE-ME`
**Triggered by:** `<what change prompted this pass>`

## What we hold

Concretely. Not "user data".

| Data | Where it lives | Retention |
|---|---|---|
| `<e.g. email addresses>` | `<table / service>` | `<how long>` |
| `<e.g. session tokens>` | | |
| `<e.g. uploaded documents>` | | |

## Who wants it

Real actors with real motives. Skip nation-state adversaries unless you genuinely have one -
inflated threat actors produce ignored documents.

| Actor | Motive | Capability |
|---|---|---|
| Unauthenticated visitor | | Anything reachable without a session |
| Authenticated user reaching for another tenant | | A valid session, and any ID they can guess |
| Compromised dependency | | Code execution in build or runtime |
| Departing employee | | Whatever their access has not been revoked from |

## What happens if they get it

Per data class: who is harmed, what it costs, what must be disclosed and to whom.

## Trust boundaries

Every place data crosses trust levels, and the control that exists **today**.

| Boundary | Control today |
|---|---|
| Browser to server | |
| Server to database | |
| App to third party | |
| Tenant to tenant | |

## Gaps

Ranked by consequence times reachability. Each with an owner and a date, or it is a note.

| Gap | Consequence | Owner | Target |
|---|---|---|---|
| | | `@REPLACE-ME` | `YYYY-MM-DD` |

Model what exists, not what is intended. "We plan to add rate limiting" is a gap.
