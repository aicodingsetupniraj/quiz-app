# Forms and mutations

Paths: `app/**` forms, `useActionState`, `useOptimistic`, and the actions they call.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

`server-actions.md` covers what an action must do on the server. This covers the form in
front of it and what the user sees.

## The form works without JavaScript, or you decided it does not

A `<form action={serverAction}>` submits before hydration. That is the point of the design:
the slow connection, the failed bundle, and the first paint all still work.

- **`onSubmit` with `preventDefault` throws that away.** Use it only where you genuinely need
  to, and say why.
- A submit button disabled until JavaScript loads is a form that does not work without it.
  Use `useFormStatus` for the pending state instead, inside the form.

## State and errors come back through the action

```tsx
const [state, formAction, pending] = useActionState(updateThing, { error: null });
```

- **Return errors, do not throw them.** A thrown error in an action becomes a generic
  message in production - the user learns nothing and you lose the field-level detail.
  Return a typed result and render it.
- Validation errors are per field. A single "something went wrong" for a form of eight
  fields makes the user guess.
- **The server validates regardless of what the client checked.** Client validation is a
  UX affordance. The action re-parses the whole payload against the schema.

## Redirect and revalidate

- **`redirect()` throws to unwind.** It must not be inside a `try` block that catches - the
  catch swallows the control-flow signal and the redirect silently does not happen. Call it
  after the try, or rethrow.
- Revalidate before redirecting, or the destination renders the pre-mutation data.
- **`revalidateTag` over `revalidatePath`** where tags exist - a path invalidates one
  location and misses the other pages showing the same data.

## Optimistic updates

- `useOptimistic` must have a defined **failure path**. An optimistic row that stays on
  screen after the write failed is a lie the user acts on.
- Reconcile from the server's response, not from the optimistic value. The server may have
  normalised, truncated, or renumbered what you sent.

## Idempotency and double submission

- A form can be submitted twice - double click, retry, a flaky network. **Any action that
  charges money, sends a message, or creates a record needs an idempotency key** or a unique
  constraint that makes the second attempt a no-op rather than a duplicate.
- Disable the button while pending, but never rely on it. The button is in the browser; the
  duplicate arrives at the server.

## Uploads

- Size limit enforced on the server before buffering. The client-side `accept` attribute is
  a file picker filter, not a control.
- Validate the file by content, not by extension or the client's MIME type.
- Store outside the web root, or behind a handler that authorizes the read.

## Tests in the same PR

- Submitting with JavaScript disabled reaches the action - or an explicit note that this
  form is JS-only and why.
- The invalid case renders field-level errors and **no write happened**.
- The double-submit case creates one record, not two.
