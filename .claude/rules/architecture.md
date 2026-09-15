# Architecture

How code is structured, and which patterns earn their weight. Stack-neutral; the rule pack
for your stack says what these look like in its idiom.

`conventions.md` governs a function. This file governs what sits above one.

## The governing rule

**Dependencies point inward.** Transport knows about the domain; the domain knows nothing
about transport. A domain type that imports a request object, an ORM row, or a framework
annotation has tied your business rules to the thing most likely to be replaced.

The practical test: could you call this logic from a CLI, a queue consumer, and an HTTP
handler without changing it? If not, the logic is in the wrong layer.

## The layers

| Layer | Holds | Never holds |
|---|---|---|
| Transport | Routes, controllers, components, CLI commands | Business rules, SQL |
| Service / domain | The rules, the invariants, the decisions | Request/response types, ORM sessions |
| Data | Queries, persistence, external calls | Business rules |

- **A handler that is longer than about twenty lines is usually holding domain logic.**
  Parse, authorize, call one service function, shape the response. That is the job.
- **Never let a request or response type below transport.** Once a service takes `req`, every
  caller has to fake one, and the tests get written against the framework instead of the rule.
- **Business logic never lives in** a component, a migration, a template, a test helper, or a
  database trigger. Each of those is a place nobody looks when the rule turns out to be wrong.

## When something should be a class

Default to a function. Reach for a class when **there is state with an invariant to protect** -
a connection pool, a state machine, a value object that must never be constructed invalid.

- A class with no fields is a namespace. Use a module.
- A class with only getters and setters is a record. Use whatever your language calls one.
- A class whose methods share no state is two things sharing a file.

**Construct valid or not at all.** If a type can exist in a broken state, every reader has to
check. Validate at the boundary, return the parsed type, and the invariant holds for free
everywhere after.

## Inheritance

**Composition first.** Inheritance is a permanent coupling to another class's internals, and
it is the change nobody can make later because eleven subclasses depend on the shape.

- One level. A hierarchy three deep is a design nobody can hold in their head.
- Inherit only for a genuine substitutable *is-a* where every subclass honours the base
  contract. "Shares some code with" is what a function or a component is for.
- Prefer an interface plus composition to an abstract base with implementation in it.

## Patterns worth their weight

Use one when the problem it solves is present. Naming a class after a pattern it does not
implement is worse than no pattern at all.

- **Repository** at the data boundary - so the domain does not know your ORM.
- **Adapter** at every third-party edge - one file that knows their shape, so replacing them
  is one file.
- **Strategy** where a conditional over a type is growing a branch per feature.
- **Factory** where construction has invariants or picks an implementation.

## Patterns that usually cost more than they return

- **Singleton** - global mutable state with a design-pattern name on it. Pass it in.
- **Deep abstract base hierarchies** - see above.
- **An interface with exactly one implementation and no second one planned.** Add it when the
  second arrives; that is when you learn what the interface should have been.
- **A DI container** where constructor parameters would do.
- **Event buses for local control flow** - they make the call graph unfollowable. Events are
  for genuinely decoupled consumers.

## Module boundaries

- **One public entry point per module.** Everything else is internal, and internal means
  callers may not import it - not that it is merely undocumented.
- **No cycles.** A cycle means the two modules are one module that has not admitted it.
- **Shared code moves up on the third user, not the second.** Two callers is a coincidence.
- A file over roughly 400 lines, or a directory over roughly a dozen files, is usually two
  things that should be named separately.

## Changing this

An architectural decision that was argued about gets an ADR - use the `adr` skill. The
argument is the valuable part, and it is lost within a month if only the outcome is recorded.
