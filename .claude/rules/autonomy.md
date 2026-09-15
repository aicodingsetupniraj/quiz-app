# Autonomy

What merges on one approval, and what stops for a second reviewer.

Rules files are guidance. The enforcement points are `permissions.allow`, branch protection,
the `protect-paths` hook, and the production environment gate. This file exists so the agent
knows which tier it is working in *before* it starts, not after a review says no.

## The tiers

| Tier | Work | Enforced by |
|---|---|---|
| Low | Formatting, docs, comments, test scaffolding, dependency bumps with no API change | `permissions.allow` plus green CI |
| Normal | Feature code, refactors, bug fixes, new tests | Draft PR, branch protection, CI |
| High | Auth, migrations, infra, `.github/**`, `.claude/**`, payments, anything handling money or personal data | `protect-paths` denies the edit outright, plus the production environment gate |

On a team, `CODEOWNERS` is what forces a second named reviewer on the high tier. This setup
does not ship one, because GitHub does not count your own approval and a solo repository with
required code-owner review blocks every PR you open - which teaches you to bypass your own
gate. Add `.github/CODEOWNERS` on the day a second reviewer exists; until then the high tier
is enforced by the hook refusing the edit and handing the decision to you.

## What the agent does at each tier

**Low** - proceed. Report what changed.

**Normal** - proceed to a draft PR. Say what you did, what you tested, and what you were
unsure about. The uncertainty is the useful part of the report.

**High** - stop before writing, and say which tier this is and why. Produce a plan first.
Implementation begins only after a human agrees the approach. This is not a formality: these
are the changes where a wrong approach is expensive to unwind after the fact.

## Hard rules

- **AI changes land as draft PRs. Never auto-merged.** Scanners gate, Claude advises, a human
  decides. This holds no matter how green the run is.
- **Never push to `main` directly.** Branch, PR, review.
- **Config changes get their own PR.** Nobody edits `settings.json`, a workflow, or a rules
  file inside a feature branch - config and code are read with different eyes, and bundling
  them hides the config change behind the feature.
- **Never use `--dangerously-skip-permissions` anywhere near production credentials.**
- **Never run a migration or a deploy against production from a session.** Those go through
  the pipeline, behind the environment gate, with a human on the release.

## Day-to-day leash

- **Plan Mode** for investigation and design - reading, tracing, proposing.
- **Accept-Edits** for bounded implementation where the plan is agreed.
- **Auto Mode** only where trust has been earned, on that kind of work, in that repo.

## When a human overrides the agent and turns out to be right

That correction becomes a line in this directory, in the same PR. One line. It is the only
mechanism that stops the same argument recurring every month, and it works only if it is done
at the moment it happens.
