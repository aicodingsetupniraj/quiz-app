# Infrastructure

Paths: `infra/**`, `.github/**`, deploy configuration.

High tier. `protect-paths` denies the agent an edit here outright, and production carries an
environment gate with a required approver on top of that.

## Everything is in the repository

- **Environment variables are defined in IaC, not clicked into a dashboard.** A value set by
  hand in a console exists in exactly one person's memory and disappears with them.
- Staging and production are defined the same way, from the same modules, differing only in
  variables. Two hand-maintained definitions drift, and they drift silently until a release.
- Never apply from a laptop. Changes go through the pipeline, which is the only place with an
  audit trail.

## Environment parity

Without a container image, staging and production match only if you make them match:

- Runtime version pinned in the repo **and** in the platform's own setting, kept identical.
  Two places, one value - check both when either changes.
- Lockfile committed, `--frozen-lockfile` everywhere.
- Same platform, same region, same managed service versions.

This is fine on a managed platform. On self-hosted VMs it is where "works on staging" starts
to drift, so check it before believing a staging result.

## Secrets

- Never in the repository, never in an IaC variable file, never in a workflow file.
- Injected from the platform's secret store or a manager, scoped to the environment.
- Short-lived and scoped where the platform supports it. A token that never expires is a
  credential you will still be carrying when the person who made it has left.
- Production credentials never exist anywhere an agent session can reach. This is the control
  that survives every other mistake, and it is worth protecting absolutely.

## CI workflows

- Pin actions to a commit SHA, not a tag. A tag can be moved; a SHA cannot.
- Minimum `permissions:` on every workflow, set explicitly at the job level.
- **Never run untrusted code with secrets in scope.** `pull_request_target` and workflows
  triggered by a fork are the specific danger - they run with write access to the base
  repository.
- The blocking set stays under ten minutes. Past that people route around it, and a gate
  people route around is not a gate. Push slow scans to nightly rather than dropping them.

## Deployments

- Staging deploys automatically from `main`.
- Production requires the GitHub environment gate and a named reviewer.
- Every deploy is revertible, and the revert path has been run at least once. An untested
  rollback is a plan you are trusting during the worst hour of the quarter.
