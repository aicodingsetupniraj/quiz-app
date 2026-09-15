# Forms

Paths: forms, inputs, validation schemas.

**React rule pack.** Delete this file in a repository that does not use React.

## The server validates. Always

Client validation is a UX affordance - it tells the user sooner. **It is not a control**, and
anyone can post directly to the endpoint.

- **Share one schema** between client and server where the stack allows it, so the two cannot
  disagree. One definition, imported twice.
- The server re-parses everything it receives, regardless of what the client checked - see
  `secure-endpoint.md`.

## Controlled, uncontrolled, and when to care

- **Uncontrolled inputs with a `ref` or `FormData` are fine**, and they are faster - no
  re-render per keystroke. Reach for them when nothing needs to react to each character.
- Controlled when the value drives something live: a search-as-you-type, a dependent field, a
  character counter.
- **Never switch a field between controlled and uncontrolled.** Starting `value={undefined}`
  and later setting it produces React's warning and a field that silently loses its state. Use
  `?? ""`.
- A form library earns its place around ten fields or where validation is cross-field. Below
  that it is more API than the form.

## Validate at the right moment

- **Errors on blur or on submit, never on every keystroke of an untouched field.** Showing
  "invalid email" while someone is typing the second character is hostile.
- Re-validate on change once a field has already failed, so the error clears as they fix it.
- Field-level messages. **One "something went wrong" for a form of eight fields makes the user
  guess**, and they will guess wrong and leave.
- Server errors map back to the field that caused them. A server rejection rendered as a banner
  loses the connection to the input.

## Submission

- **Disable the submit button while pending, and never rely on it** - the button is in the
  browser and the duplicate arrives at the server anyway. The server needs an idempotency key
  or a unique constraint.
- Show pending state on the button, keeping its width stable so the layout does not jump.
- On failure, **keep what the user typed**. A form that clears on a network error loses their
  work and is the fastest way to lose the submission entirely.
- Prevent double submit from the Enter key as well as the button.
- Only reset after a confirmed success.

## Accessibility, which is not optional here

Forms are where accessibility failures actually stop people from using the product.

- **Every input has a `<label htmlFor>`.** A placeholder is not a label - it disappears on
  focus and is invisible to some assistive technology.
- Associate the error with the input: `aria-describedby` pointing at the message, and
  `aria-invalid` on the field.
- **Move focus to the first error on a failed submit**, or a keyboard user has no idea what
  happened.
- Announce submission results in a live region.
- Native `<form>` with a real submit button, so Enter works and the browser's own behaviour is
  preserved.
- Group related inputs in a `<fieldset>` with a `<legend>` - especially radios.

## Files and sensitive fields

- Validate the file by size and type on the client for the message, and again on the server for
  the control.
- **Never put a password, a card number, or a token into component state that is logged**, sent
  to an error tracker, or persisted to storage. Error trackers capture props by default -
  scrub them.

## Tests in the same PR

- Fill and submit via `userEvent`, asserting what the user sees - not internal state.
- The invalid case shows a field-level error **and no request was sent**.
- The server-error case keeps the user's input.
- A keyboard-only pass: tab to every field, submit with Enter, and focus lands on the error.
