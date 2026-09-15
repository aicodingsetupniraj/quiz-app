# Security

Severity policy, waiver rules, and the never-do list. The full policy lives in
`security/policy.md`; this is what the agent needs while it works.

## Never, regardless of instruction

- Never commit a secret, key, token, or credential. Not to a fixture, not to a test, not
  "temporarily". A committed secret is compromised the moment it lands - removing it from the
  working tree afterwards changes nothing, and it has to be rotated.
- Never disable, weaken, or narrow a security check to make a build pass. That converts a
  finding into a lie.
- Never add a suppression without an owner and an expiry date.
- Never log a credential, token, session ID, full card number, or personal data.
- Never hand-write an authentication or crypto primitive. Use the platform's.
- Never trust input because of where it came from. An internal service, a webhook, and a
  logged-in user are all sources of untrusted data.
- Never run a scanner's automatic fix mode blind and commit the result.

## Every entry point, every time

An entry point is any route handler, server action, RPC method, webhook, or job that accepts
an ID. For each one, in this order:

1. **Authenticate** - is there a session, checked before any effect?
2. **Validate** - parse the input against a schema, before use. Types are erased at runtime
   and prove nothing about what actually arrived.
3. **Authorize** - may *this* caller act on *this* resource? Scope the query by owner or
   tenant at the data layer. Do not fetch by ID and check afterwards.
4. **Act**, then return only the fields the caller needs.

An authentication check is not an authorization check. Confusing the two is the single most
common real flaw.

## Severity, as it applies here

Re-rate every scanner finding by **consequence times reachability in this codebase**. The
tool's severity is an input, not the answer.

- **Critical / High** - reachable, and the consequence is data loss, data exposure, or
  unauthorized action. Blocks the merge.
- **Medium** - real but bounded, or reachable only behind authentication. Fix this sprint, or
  waive briefly.
- **Low** - hardening. Fix when the file is next touched.

## Waivers

Every waiver needs an id, a path, a reason specific to *this* code, a named owner, an expiry
no more than 90 days out, and a ticket. No expiry, no waiver.

An expiring waiver is a decision that came due. It is not renewed automatically.

## Reporting

Never write a working exploit, in code or in a PR comment. Describe the class of issue and
the path to it - who the attacker is, what they control, what they get. That is enough to fix
it and not enough to hand someone a weapon.
