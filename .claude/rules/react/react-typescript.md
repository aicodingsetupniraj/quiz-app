# TypeScript in components

Paths: `**/*.tsx`.

**React rule pack.** Delete this file in a repository that does not use React with TypeScript.

`node-typescript.md` covers the language and the compiler settings. This is what is specific
to components.

## Props

- **A `type` or `interface` per component, named for it.** Inline prop types in the signature
  stop being readable at three fields and cannot be exported for a test or a wrapper.
- **Do not annotate with `React.FC`.** It adds an implicit `children` that most components do
  not accept, and it makes generic components awkward. Annotate the props parameter and let the
  return type be inferred.
- **`children: React.ReactNode`** only where children are genuinely accepted. Being explicit is
  the point - a component that renders `{children}` nowhere should not advertise it.
- Extend the DOM props when wrapping an element:
  `type Props = ComponentPropsWithoutRef<"button"> & { variant: Variant }`. Then `aria-*`,
  `onClick`, and `disabled` all work without listing them, and the forwarded ref is typed.

## Make impossible props impossible

- **Discriminated unions over optional soup.** A component that takes either `href` or
  `onClick` should be `({ href: string } | { onClick: () => void }) & Base`, not two optional
  fields where both-or-neither compiles.
- `type Variant = "primary" | "danger"` rather than `string`, so a typo is a compile error and
  the editor completes it.
- `readonly` arrays for props you do not mutate.
- Avoid a boolean that selects behaviour - `render(true)` is unreadable at the call site, and a
  union of literals reads at the point of use.

## Events and refs

- Type the handler from the element: `React.ChangeEvent<HTMLInputElement>`,
  `React.MouseEvent<HTMLButtonElement>`. Do not annotate the parameter when the handler is
  written inline on a DOM element - it is inferred correctly and the annotation only drifts.
- `useRef<HTMLDivElement>(null)` for a DOM ref; `useRef<T>(initial)` for a mutable box. The
  difference in whether `.current` is readonly comes from that initial value.
- `ComponentPropsWithRef` when you forward a ref, so callers get the right element type.

## Hooks

- **`useState` usually infers.** Annotate when the initial value is narrower than the real
  type: `useState<User | null>(null)`, or the state is forever `null`.
- A reducer's action type is a **discriminated union**, which is what makes the switch
  exhaustive and a missing case a compile error.
- Type a custom hook's return as a `const` tuple (`as const`) or an object. An unmarked array
  return widens to `(A | B)[]` and destructuring loses both types.
- Generic components are ordinary generic functions - `function List<T>({ items }: Props<T>)`.
  Do not reach for `any` because the type is awkward; that is the moment the type is doing
  work.

## The boundary

**Everything from outside is `unknown` until parsed** - a fetch response, `localStorage`, a URL
parameter, a third-party callback. An `interface` describing an API response is a hope, not a
check. Parse with a schema and let the type be inferred from it, so the type and the validation
cannot drift apart. See `node-typescript.md`.

## Tests in the same PR

- Where a prop type encodes a rule, a `@ts-expect-error` on the misuse is a test that the type
  still rejects it - and it fails when someone widens the type.
- The typecheck runs in CI over the whole project. A bundler that strips types without checking
  them will ship code the compiler rejects.
