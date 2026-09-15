# Observability

Paths: anywhere that can fail, log, or call something over a network.

The test for this file: someone is holding a customer complaint and a timestamp. Can they
reach the failing line without adding logging and waiting for it to happen again?

## Errors are never swallowed

- A `catch` that logs nothing and continues is the single worst pattern here. It converts an
  outage into a silent wrong answer, which is harder to find and does more damage.
- Never return a fallback value on error where the caller cannot tell it apart from a real
  empty result. Empty and failed are different; a caller that cannot distinguish them will
  cache the failure, retry nothing, and show the user a confidently wrong screen.
- Catch to **add context and rethrow**, or to handle the error genuinely. Rethrowing a new
  error without the original discards the stack that mattered.
- Catch the specific failure you can handle. A bare catch around a block also swallows the
  typo three lines down.

## What a log line must carry

One structured event beats five printf lines that cannot be joined. Every log from a request
path carries:

- A request or trace id, propagated from the caller, so lines from one request join up
- The tenant/org and user id where there is a session
- The id of the entity acted on
- The outcome, and on failure the error type — not just its message

Log at the boundary where the outcome is known, not at every step on the way there.

## Never log

Logs reach a third party, outlive the database, and are readable by more people than
production is. Out of a log, an error message, a span attribute, or an analytics event:

- Credentials, tokens, session cookies, API keys, authorization headers
- Anything the data layer marks as personal data
- **A whole request, user, or model object.** Spreading an object logs every field it gains
  later, including the ones added because they were sensitive. Name the fields you want.

A secret in a log is a credential rotation and an incident, not a cleanup task.

## Levels mean something

`error` means a human should look. If ordinary control flow logs at error, the error log is
noise within a month and the real one is missed inside it. A 404, a validation failure, a
retry that then succeeded — those are `info` or `warn`.

## Metrics

- Labels must be a bounded set. A user id, an email, a request id, or a raw path containing
  ids creates one series per value — that is how the bill and the dashboard both break.
- Instrument the thing users feel: latency at p95 and p99, error rate, and saturation of
  whatever is scarce. An average latency hides exactly the requests worth knowing about.

## Every network call gets a timeout

Most default clients have none. A hung call with no timeout holds its connection until the
pool is exhausted, and then takes down paths that never touched that dependency. Set a
timeout, decide whether a retry is safe — only for idempotent calls, and with backoff — and
know what the code does when the dependency is simply slow rather than down.
