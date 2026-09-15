# TypeScript

Paths: `tsconfig*.json`, `**/*.ts`, `**/*.tsx`.

**Node rule pack.** Delete this file in a repository with no TypeScript in it.

## The compiler settings are the rules

Half of what people write as conventions is a `tsconfig` flag that enforces itself.

- **`strict: true`.** Not negotiable in new code, and ratcheted in old code. Everything below
  is implied by it and is worth knowing individually.
- `noUncheckedIndexedAccess` - `arr[0]` is `T | undefined`, because it is. This one finds real
  bugs and is the one most often left off.
- `exactOptionalPropertyTypes` - `{ a?: string }` stops accepting an explicit `undefined`.
- `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUnusedLocals`.
- `verbatimModuleSyntax` with `import type`, so type-only imports never survive into runtime
  code and cause a cycle.

**Typecheck in CI as its own step.** A bundler that strips types without checking them - esbuild,
swc, Vite - will happily ship code the compiler rejects.

## `any` is a hole, and it spreads

- **Never `any` to silence an error.** Fix the type, or use `unknown` and narrow at the use
  site - `unknown` forces the check that `any` skips.
- `as` is an assertion, not a conversion: it tells the compiler to stop checking. Reserve it
  for the boundary where you have just validated, next to the evidence.
- **`as any as X` and non-null `!` are the two shortcuts that hide the bug you are about to
  ship.** If a value is genuinely nullable, handle it.
- No `@ts-ignore`. `@ts-expect-error` with a reason, so it fails when it stops being needed.

## Types are erased, so validate the boundary

```ts
const body = CreateUserSchema.parse(await req.json());   // now the type is true
```

An `interface` describes what you hope arrived. Everything from outside the process - a
request body, an environment variable, a queue message, a third-party response, a database
row typed by hand - is `unknown` until parsed. See `node.md`.

## Model the domain in the type system

- **Branded ids**: `type UserId = string & { readonly __brand: "UserId" }`. Passing an `OrgId`
  where a `UserId` belongs becomes a compile error, for no runtime cost.
- **Discriminated unions over optional soup.** `{ status: "ok", data: T } | { status: "error",
  error: E }` beats an object with three optional fields where half the combinations are
  impossible.
- `readonly` on anything not meant to be mutated, including arrays. It is documentation the
  compiler enforces.
- Derive, do not duplicate: `z.infer<typeof Schema>`, `ReturnType`, `Awaited`, `satisfies` to
  check a literal against a type without widening it.
- `const` objects plus a union of their values, rather than a TypeScript `enum` - enums emit
  runtime code and behave surprisingly with `const`.

## Module hygiene

- Explicit return types on exported functions. Inference is fine internally; on a public
  surface an accidental widening becomes someone else's breaking change.
- Prefer type-only imports for types. A value import for a type pulls the module in at runtime.
- One barrel file per module at most. Deep barrels create cycles that only show as
  `undefined` at import time.

## Tests in the same PR

- Typecheck runs in CI against the whole project, not just changed files - a change breaks
  callers it never touched.
- Where a type encodes a rule, assert it: a `@ts-expect-error` on the misuse is a test that
  the type still rejects it.
