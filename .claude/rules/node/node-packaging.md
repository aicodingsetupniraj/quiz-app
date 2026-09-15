# Packaging and runtime

Paths: `package.json`, lockfile, `Dockerfile`, `.nvmrc`.

**Node rule pack.** Delete this file in a repository with no Node in it.

## The manifest is a contract

- **`"engines"` set and enforced.** Without it the package installs on a runtime it was never
  tested against, and the failure is a syntax error in a dependency.
- Pin the runtime in `.nvmrc` **and** in the platform's own setting, identical. Two places,
  one value - that pairing is the entire parity mechanism without a container image.
- **`"type": "module"` or not, decided once.** A mixed codebase where some files are ESM and
  some CJS produces `require() of ES Module` at runtime, in production, on a path nobody
  exercised.
- For a published package: `"exports"` rather than `"main"`, so the public surface is
  deliberate. Anything not exported is internal and callers cannot reach into it.
- `"files"` or `.npmignore`, so the published tarball does not carry your tests, fixtures, and
  `.env.example`.

## The lockfile

- **Committed, always**, and one package manager per repository. Two lockfiles means two
  different dependency graphs depending on who installed.
- **`npm ci` / `pnpm install --frozen-lockfile` in CI**, never `install`. An install allowed to
  resolve differently in CI than it did locally makes the lockfile decorative.
- An unexplained lockfile change in a PR is a review item, not a nit. It is what a registry
  substitution and a compromised transitive dependency both look like.
- Never hand-edit it. Regenerate.

## Dependencies

- **A new dependency needs a stated reason** - see `dependencies.md`. Check the standard
  library first: `node:test`, `fetch`, `crypto.randomUUID`, `AbortController`,
  `structuredClone`, and `node:util.parseArgs` remove a lot of small packages.
- `dependencies` versus `devDependencies` is not cosmetic: a dev tool in `dependencies` ships
  to production and enlarges both the image and the CVE surface.
- **A package with a `postinstall` script executes code on every developer machine and in CI.**
  That is a supply-chain decision. Check before adding, and consider `--ignore-scripts` with
  an allowlist.
- Prefer a package with no transitive tail for something you could write in twenty lines.

## Scripts

- The scripts are the interface: `dev`, `build`, `test`, `lint`, `typecheck`, `start`. CI runs
  exactly these, so a green local run means a green CI run.
- **`npm start` runs the built artifact, not the TypeScript source.** Running a dev runner in
  production hides build failures until deploy.
- No secrets in a script. `NODE_OPTIONS` and env prefixes in a script line end up in shell
  history and CI logs.

## Building and running

- Build once, deploy that artifact. Rebuilding per environment means the thing you tested is
  not the thing you shipped.
- Source maps for the server, kept out of the client bundle or uploaded to the error tracker
  privately - a public source map republishes your source.
- In a container: multi-stage, `npm ci --omit=dev` in the runtime stage, a **non-root user**,
  a pinned base image by digest, and `dumb-init` or `--init` so signals reach the process.
  Without signal handling, `SIGTERM` never arrives and graceful shutdown never runs.
- `NODE_ENV=production` in production. Several libraries change behaviour on it, including
  disabling development-only warnings and caches.

## Tests in the same PR

- The build artifact starts and answers a health check in CI, not just `tsc` exiting zero.
- A published package is installed from the packed tarball in a scratch directory and
  imported - that is what catches a file missing from `"files"`.
