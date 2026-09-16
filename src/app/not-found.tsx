import Link from "next/link";

// Catches unmatched routes at the root, which includes an unknown /topics/<id>: that route sets
// dynamicParams = false, so an id with no prerendered page never reaches the page component.
// Without this file Next serves its own bare 404 and logs an internal NoFallbackError for what
// is ordinary control flow - and a child gets a developer's error page instead of a way back.
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-8">
      <span aria-hidden="true" className="text-7xl leading-none">
        🔭
      </span>
      <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">
        We couldn&apos;t find that page
      </h1>
      <p className="text-xl text-slate-700">
        It might have moved, or the address might have a typo in it.
      </p>
      <Link
        href="/"
        className="rounded-full bg-sky-700 px-10 py-4 text-2xl font-bold text-white shadow-md transition-colors hover:bg-sky-800 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-600 motion-reduce:transition-none"
      >
        Pick a topic
      </Link>
    </main>
  );
}
