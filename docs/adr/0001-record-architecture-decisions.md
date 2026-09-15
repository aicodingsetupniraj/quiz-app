# 0001. Record architecture decisions

Date: 2026-01-01
Status: Accepted

## Context

Decisions that shape a codebase are made in conversations, pull request threads, and
channels that scroll away. The code shows what was decided; it does not show what the
alternatives were, which constraint ruled them out, or what was already known to be a cost.

Six months later nobody remembers. The decision is then either re-argued from the beginning,
or quietly reversed by someone who never saw the constraint that produced it - and reversing
it costs more than the original choice did.

This gets worse when agents write code. An agent reads the repository, not the meeting. A
constraint that lives only in someone's memory is a constraint the agent will violate, and
the violation will look reasonable in review.

## Decision

We will record architecturally significant decisions as ADRs in `docs/adr/`, numbered
sequentially, using the format described in the `adr` skill.

A decision is significant enough when it is expensive to reverse, when reasonable engineers
disagreed, or when it will look wrong to someone who does not know the constraint.

ADRs are immutable once accepted. A decision that changes gets a new ADR that supersedes the
old one; the old one stays, marked superseded.

## Consequences

**Easier:** onboarding, because the reasoning is in the repository. Reviewing a change that
contradicts an earlier decision, because there is something to point at. Agent-written code
that respects constraints, because the constraint is now readable.

**Harder:** each significant decision costs about twenty minutes of writing. That cost is
real, and it is paid by the person who has the context, for the benefit of someone who does
not yet exist on the team.

**Expensive to change:** the numbering. ADRs are cited by number, so they are never
renumbered and never deleted.

## Alternatives considered

**A wiki.** Rejected: it drifts out of sync with the code, is not reviewed alongside the
change that motivated it, and is not visible to anything reading the repository.

**Commit messages alone.** Rejected: the right granularity for a change, the wrong one for a
decision spanning many commits. Nobody searches history for reasoning.

**Nothing, as before.** Rejected: this ADR exists because that was tried.
