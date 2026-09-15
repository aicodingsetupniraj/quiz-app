# Environment and configuration

Paths: `.env*`, `next.config.*`, anything reading `process.env`.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

## `NEXT_PUBLIC_` means published

The prefix is not a convention or a hint. At build time the value is **inlined into the
JavaScript bundle** as a string literal. It is in view-source, it is in the deployed
artifact, and it stays there after you rotate the key.

- **A secret with a `NEXT_PUBLIC_` prefix is a leaked secret**, immediately, and rotating it
  is the only remedy. The `code-rules` gate blocks the obvious spellings; it cannot catch a
  key named `NEXT_PUBLIC_CONFIG`.
- Only genuinely public values earn the prefix: an analytics id, a public site URL, a
  publishable payment key that the provider documents as publishable.
- Adding the prefix to fix "undefined in the browser" is the wrong fix. The right one is to
  read it on the server and pass down what the view needs.

## Validate configuration once, at startup

```ts
// env.ts - the only module that reads process.env
export const env = EnvSchema.parse(process.env);
```

- **Parse the whole environment against a schema in one module**, and import `env` from
  there. Scattered `process.env.FOO!` reads mean a missing variable surfaces as `undefined`
  in a request at 2am rather than as a failure at boot.
- Import `server-only` in that module so a client import is a build error.
- Never default a secret in code. `process.env.SECRET ?? "dev-secret"` ships a known key to
  production the first time someone forgets to set it.

## `.env` files

- `.env.local` is gitignored and is where a developer's real values live.
- **`.env.example` is committed, with every key and no real values.** That file is the
  contract; without it a new clone fails with no indication of what is missing.
- Never commit `.env.local`, `.env.production`, or anything with a live value. The
  `block-secrets` hook denies it; the hook is not the reason not to do it.

## `next.config`

- Nothing secret in it - it is evaluated at build and parts reach the client.
- `images.remotePatterns` is an allowlist. A wildcard host turns your image optimizer into
  an open proxy that fetches whatever URL a caller supplies.
- Security headers belong here or in middleware, in one place, applied to everything.
- `ignoreBuildErrors` and `ignoreDuringBuilds` turn the type check and the lint into
  decoration. If either is on, that is a finding with an owner and a date, not a setting.

## Runtime

- Pin the Node version in `.nvmrc` **and** in the platform's own setting, identical. Two
  places, one value; that pairing is the whole parity mechanism without a container.
- `export const runtime = "edge"` changes what APIs exist at runtime, not just where it runs.
  A module that works in Node and is imported by an edge route fails at request time, not at
  build. Choose the runtime per route deliberately and test that route.

## Tests in the same PR

- The env schema rejects a missing required variable, asserted - that is the test that turns
  a 2am incident into a failed boot.
- A grep of the build output for a known server-only value, asserting it is absent.
