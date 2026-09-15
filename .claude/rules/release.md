# Releasing

Paths: feature flags, version files, anything shipped behind a rollout.

`infra.md` covers how a deploy runs. This covers what has to be true about the change before
it goes out, and what happens when it is wrong.

The governing question: **if this is wrong, how fast can it be undone, and by whom?** A
release whose rollback is "roll forward quickly" has no rollback.

## Order the deploy

Schema first, then code — the expand step goes out and is confirmed before the code that
depends on it. Code deployed against a schema that has not arrived breaks the moment it
runs.

**If a migration and the code that needs it must ship together, there is no safe order and
the change needs splitting.** Splitting it is the work; shipping it together is the incident.

## Behind a flag, default off

- New user-facing behaviour ships disabled and is turned on separately. Deploying and
  releasing are then two events, and the second one is reversible in seconds.
- **The flag exists before the code that reads it.** Code reading a flag that is not there
  takes the default, and the default is usually the wrong one.
- A flag you have to deploy to change is not a mitigation. It must be switchable by someone
  on call, without a build.
- Every flag is temporary. When it is permanently on, removing it is a task with an owner,
  not a comment. Long-lived flags multiply the number of live code paths until nobody knows
  which combination is actually in production.

## Know the way back, per part

- **Code** — is a revert enough?
- **Schema** — reversible without data loss? If not, the rollback is a restore, and recovery
  goes from minutes to hours. Say so before shipping, not during.
- **Config and secrets** — is the previous value written down anywhere, or does reverting
  mean somebody remembering it?
- **Data written by the new code** — after a revert, the old code reads rows written in the
  new shape. It has to cope, or the revert is not one.

## Before it goes out

- CI green on the commit actually being deployed, not an earlier one.
- Everything that has to happen outside the deploy is listed, in order, with an owner:
  a secret set in the platform, a worker running, a webhook registered, a flag created.
- There is a signal that would show this going wrong, and someone is looking at it. A deploy
  with no way to tell whether it worked is one a customer tells you about.

## After it goes out

Watch the two or three signals that would move if this were wrong, for a stated period.
Then say it is done. An unwatched deploy is not finished; it is just unobserved.

Anything unrelated riding along in the release is a finding — it is the change nobody
reviewed for this deploy.
