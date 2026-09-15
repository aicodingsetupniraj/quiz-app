# Performance

Paths: `app/**`, `next.config.*`, and anything that ships to the browser.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

The stack-neutral `performance.md` covers N+1, unbounded queries, and blocking work. This
covers what is specific to the App Router, where the biggest wins are about **what reaches
the browser at all**.

## The bundle is the budget

- **Every `"use client"` is a bundle decision.** The marked file and its whole import graph
  ship. Pushing the directive down to the interactive leaf is the single largest lever here.
- **A heavy dependency imported by a client component ships to every visitor**, whether or
  not they open the feature. Chart libraries, date libraries, editors, PDF renderers - load
  these with `next/dynamic` and no SSR where they are below the fold or behind an
  interaction.
- Import the member, not the namespace. `import { format } from "date-fns"` where the
  package supports it; a default namespace import defeats tree shaking in some packages.
- Check the analyzer before adding a dependency to a client path, not after the Lighthouse
  score drops.

## Server rendering is the fast path, when it is not blocked

- **A layout that awaits blocks every page beneath it.** Keep layout data to what the shell
  needs.
- Wrap the slow region in `<Suspense>` so the shell paints immediately. See
  `data-fetching.md` - a page that waits for its slowest query to show anything is the usual
  cause of an App Router app that feels slow but is not.
- Parallel fetches with `Promise.all`. Sequential awaits that do not depend on each other
  cost the sum of their latencies for nothing.

## Images, fonts, and scripts

- **`next/image` for anything from a CDN or the filesystem**, with `width` and `height` or
  `fill`. Unsized images are the main source of layout shift, and layout shift is what users
  actually feel.
- Set `priority` on the one image in the initial viewport, and on nothing else. Marking
  everything priority means nothing is prioritised.
- `images.remotePatterns` is an allowlist. A wildcard makes the optimizer an open proxy -
  that is a security finding as much as a performance one.
- `next/font` self-hosts and eliminates the render-blocking round trip to a font CDN.
- Third-party tags go through `next/script` with a deliberate strategy. A synchronous
  analytics tag in `<head>` blocks the first paint for every visitor.

## Runtime and region

- **Edge is not automatically faster.** It removes cold starts and moves compute close to the
  user; it also loses Node APIs and adds latency to every call back to a database that lives
  in one region. A route that talks to your database usually belongs on Node, in the
  database's region.
- Choose per route, and say why in a comment. The default is fine for most routes.

## Measure the thing users feel

- LCP, CLS, and INP on the routes that matter, at p75 - not an average, and not a synthetic
  score on a fast laptop.
- A budget for the bytes shipped on the initial view, checked in CI once it exists.
- Server timing per route at p95 and p99. The slowest requests are the ones people complain
  about, and they are invisible in the mean.

## Do not

Optimise before measuring, and do not add `memo`, `useMemo`, or `useCallback` on the way past
- see `react-performance.md`. In an App Router app the expensive things are usually the
bundle and a waterfall, not a re-render.
