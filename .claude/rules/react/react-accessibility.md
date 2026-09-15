# Accessibility

Paths: `**/*.tsx`, `**/*.jsx`.

**React rule pack.** Delete this file in a repository that does not use React.

Accessibility is a correctness property, not a polish pass: a control a keyboard cannot reach
is broken for everyone using one, and in many markets it is a legal requirement. It is also
far cheaper to build in than to retrofit - the same argument this whole setup makes about
security.

## Use the element that already does the job

- **`<button>` for an action, `<a href>` for a destination.** A `<div onClick>` is not
  focusable, does not respond to Enter or Space, and is invisible to assistive technology.
  Adding `role`, `tabIndex`, and key handlers reimplements a button badly.
- `<a>` without `href` is not a link. If it does not navigate, it is a button.
- Native `<form>`, `<label>`, `<input>`, `<select>`, `<dialog>`, `<table>`. Every one carries
  keyboard behaviour, focus behaviour, and semantics you would otherwise write and get wrong.
- **The first rule of ARIA is not to use ARIA.** A wrong `role` is worse than none, because it
  overrides what the element actually is.

## Names, and how they are computed

- Every interactive element has an accessible name. An icon-only button needs
  `aria-label="Delete invoice"` - not "delete", which is meaningless in a list of twenty.
- **Every input has a `<label htmlFor>`.** A placeholder disappears on focus and is not a
  label.
- Images: `alt` describing the meaning, or `alt=""` when decorative. `alt="image"` is worse
  than empty.
- Headings describe structure and go in order. Do not skip a level to get a font size - that is
  what CSS is for.

## Keyboard

- **Everything reachable by mouse is reachable by keyboard**, in a sensible order. Tab through
  the feature before opening the PR; it takes a minute and catches most of this.
- **Never remove the focus outline** without replacing it with something at least as visible.
  `outline: none` with no replacement is the single most common accessibility failure in
  production.
- Focus is managed at the moments it matters: **into a dialog when it opens and back to the
  trigger when it closes**, to the first error on a failed submit, and to new content after a
  route change.
- A modal traps focus and closes on Escape. If you are writing this yourself, use a library -
  it is more subtle than it looks.
- `tabIndex={0}` to make something focusable, `-1` for programmatic focus only. **Never a
  positive `tabIndex`** - it reorders the whole page.

## Announcing change

- A region that updates without navigation needs `aria-live="polite"` - a search result count,
  a toast, a save confirmation. Without it the change is silent.
- `aria-live="assertive"` only for something genuinely urgent; it interrupts.
- Loading and error states are announced, not only shown. A spinner with no text is invisible.

## Visual

- **Contrast: 4.5:1 for body text, 3:1 for large text and UI boundaries.** Check it; do not
  judge by eye on a good monitor.
- **Never colour alone.** A red border needs an icon or a message beside it.
- Respect `prefers-reduced-motion` for anything that animates or auto-scrolls.
- The layout survives 200% zoom and a 320px viewport without horizontal scrolling.

## Tests in the same PR

- `eslint-plugin-jsx-a11y` in the lint config, failing the build. It catches the missing label
  and the `div` with a click handler for free.
- `jest-axe` on any new component: `expect(await axe(container)).toHaveNoViolations()`.
- **A keyboard-only pass on any new interactive feature**, asserted in the test where it is
  practical - tab to the control, activate with Enter, assert the result.
- Automated checks catch perhaps a third of real issues. The tab-through is the other two
  thirds.
