# Dependencies

There is no container image in this stack. That makes the lockfile essentially the entire CVE
surface, which changes how carefully a dependency change is treated.

## Adding one

**No new dependency without a stated reason in the PR.** The reason answers: what does this
do that we cannot reasonably do ourselves, and why this package.

Before adding, check in this order:

1. Does the language's standard library do it?
2. Does something already in the lockfile do it? Check before adding a second date library.
3. Is it small enough to write and own? A dependency for a function you could write in twenty
   lines is a permanent supply-chain liability in exchange for twenty lines.

Then look at the package itself: when it was last published, how many maintainers it has, how
much it pulls in transitively, and whether it runs an install script. A package with a
postinstall script executes code on every developer machine and in CI.

## The lockfile

- **Always committed.** A repository without a committed lockfile has no reproducible build
  and no meaningful CVE surface to scan.
- **`--frozen-lockfile` in CI**, always. An install allowed to resolve differently in CI than
  it did locally makes the lockfile decorative.
- **An unexplained lockfile change in a PR is a review item.** Not a nit - a review item. A
  lockfile diff with no manifest change means something resolved differently than expected,
  and that is exactly what registry substitution looks like.
- Never hand-edit a lockfile. Regenerate it.

## Versions

- Pin exactly where the lockfile is the only guard.
- One dependency change per PR where possible. A bump bundled into a feature is a bump nobody
  reviewed.
- Never cross a major version as a side effect of another change.

## Removing one

Remove the import and the manifest entry in the same change, then regenerate the lockfile. A
package left in the manifest after its last import is gone is CVE surface carried for nothing.

## Scanning

Dependency CVEs block on high. When a finding lands, use the `triage-finding` skill: fix,
waive with an expiry, or record it as a false positive with a reason. Report by
**reachability** - a high severity in a dev-only test fixture and one in the request path are
not the same finding, and treating them the same is how a team learns to ignore the scanner.
