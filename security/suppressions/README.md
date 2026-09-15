# Suppressions

Every waiver here is a decision to accept a risk. It is recorded like one.

## Required fields

```yaml
- id: <rule id or CVE>
  path: <the specific file or package>
  reason: <why this is acceptable HERE - not a restatement of the rule>
  owner: <a person, not a team>
  expires: <YYYY-MM-DD>
  ticket: <link to the work that removes the need for this>
```

## Rules

- **No expiry, no waiver.** Maximum 90 days; 30 for critical and high.
- **One finding per entry.** Never a path-level or rule-level blanket ignore - that turns the
  check off for every file written later, including ones that do not exist yet.
- **The reason is specific.** "False positive" is not a reason. "The vulnerable function is
  in the CLI entry point, which this project does not import" is.
- **Expiry is a decision, not a renewal.** If the reason still holds, the owner writes it
  again, freshly, with today's understanding.

Run `/waivers` to see what has expired, what expires soon, and what is missing an owner.

Tool-level ignore files - `.trivyignore`, `.gitleaks.toml` allowlists, Semgrep `nosemgrep`
comments - are held to the same standard and are swept by the same command.
