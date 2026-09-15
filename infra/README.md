# Infrastructure

Infrastructure as code. Staging and production are defined here, the same way, differing
only in variables.

**This directory is a placeholder.** `/setup-repo` cannot fill it in - the platform differs
per project. Replace this file with real IaC, and update `deploy-staging.yml` and
`deploy-prod.yml`, whose deploy steps ship as TODOs for the same reason.

## Why it lives in the repository

Without a container image, staging and production match only if you make them match:

- Runtime version pinned in the repo **and** in the platform's own setting, kept identical
- Lockfile committed, `--frozen-lockfile` everywhere
- **Environment variables defined here, not clicked into a dashboard.** A value set by hand in
  a console exists in one person's memory and leaves when they do
- Same platform, same region, same managed service versions

On a managed platform this is straightforward. On self-hosted VMs it is exactly where "works
on staging" begins to drift.

## Structure

```
infra/
├── modules/          # shared definitions
├── staging/          # variables only - same modules
└── production/       # variables only - same modules
```

Two hand-maintained definitions drift, and they drift silently until a release. One set of
modules with two variable files cannot.

## Rules

- **Never apply from a laptop.** Changes go through the pipeline, which is the only place
  with an audit trail.
- Production applies behind the GitHub environment gate with a required reviewer.
- No secrets here - not in a variable file, not in a default. Inject from the platform's
  secret store.
- IaC scanning blocks on high. Checkov and Trivy config run in `security.yml`.
- Every change is revertible, and the revert has been run at least once. An untested rollback
  is a plan you are trusting during the worst hour of the quarter.
