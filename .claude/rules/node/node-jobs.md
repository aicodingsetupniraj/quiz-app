# Background work, queues, and shutdown

Paths: workers, queue consumers, cron handlers, stream pipelines.

**Node rule pack.** Delete this file in a repository with no background work in it.

## Work that outlives the response belongs on a queue

A promise you did not await after `res.send()` is work the process may be killed in the
middle of. Serverless makes this immediate - the runtime freezes as soon as the response is
sent - but a container restart does the same thing on a longer timescale.

- Mail, webhooks, thumbnails, exports, third-party calls: enqueue, return, process.
- **The queue is the durability boundary.** If losing the work is unacceptable, it has to be
  written down somewhere before the response goes out.

## Every consumer assumes redelivery

A queue delivers at least once. The message you are processing may be one you already
processed, and the retry may arrive while the first attempt is still running.

- **Idempotency is the consumer's job**, not the broker's. A unique constraint on a natural
  key, or a processed-ids table checked in the same transaction as the write.
- Make the effect idempotent, not just the check. "Insert if absent" is safe; "increment"
  is not.
- Retries need backoff and a cap. A poison message retried forever with no delay is an
  outage that looks like a traffic spike.
- **A dead-letter queue with nobody watching it is a silent data-loss channel.** Alert on
  depth, or do not have one.

## Bound everything

- Concurrency per worker. Unbounded parallelism turns one slow dependency into memory
  exhaustion.
- Message size, batch size, and the time a handler may run. A handler with no timeout holds
  its slot forever.
- **Never `await` inside an unbounded `for` over a large collection** without a concurrency
  limit - and never `Promise.all` over ten thousand items, which starts ten thousand calls.

## Streams, where the data is large

- **Pipe, do not buffer.** `pipeline()` from `node:stream/promises` propagates errors and
  cleans up; a chain of `.pipe()` calls leaks the source when the destination fails.
- Backpressure is the point of streams. Ignoring the return of `write()` reintroduces the
  memory problem streams exist to solve.
- Reading an uploaded file fully into memory before validating its size is the denial of
  service. Bound it at the boundary.

## Graceful shutdown, or the queue lies to you

On `SIGTERM`:

1. Stop accepting new work - close the server, pause the consumer.
2. Finish or explicitly abandon what is in flight, with a bounded wait.
3. Close the database pool and the broker connection.
4. Exit.

Without this, a deploy drops in-flight requests and nacks messages that were nearly done -
and the symptom is intermittent duplicate work after every release, which nobody connects
to the deploy.

## Scheduled work

- A cron that can overlap with itself will. Take a lock, or make the job idempotent.
- Schedule in UTC. A job scheduled in a local timezone runs twice, or not at all, on the day
  the clocks change.
- A job that silently does nothing is worse than one that fails. Log the count it processed,
  and alert when it is zero for longer than it should be.

## Tests in the same PR

- The redelivery case: process the same message twice, assert one effect.
- The failure case: assert the message is nacked or dead-lettered, not silently dropped.
- Shutdown: assert in-flight work completes or is abandoned deliberately, within the bound.
