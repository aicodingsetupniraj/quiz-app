import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic, topics } from "@/content";
import { DifficultyBadge } from "../../_components/difficulty-badge";

// Every topic is pre-rendered at build time. Unknown ids get the 404 page instead of rendering
// at request time - which also keeps this route valid for a static export (open question Q-4).
// Note: dynamicParams is not allowed if Cache Components is ever enabled.
export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map((topic) => ({ topicId: topic.id }));
}

export async function generateMetadata({ params }: PageProps<"/topics/[topicId]">): Promise<Metadata> {
  const { topicId } = await params;
  const topic = getTopic(topicId);
  if (!topic) notFound();
  return { title: topic.title };
}

// A Server Component that passes no topic object anywhere: the questions and answers for this
// topic must not reach the client from the intro page.
export default async function TopicPage({ params }: PageProps<"/topics/[topicId]">) {
  const { topicId } = await params;
  const topic = getTopic(topicId);
  if (!topic) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-8">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-lg font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <span aria-hidden="true">←</span>
        Back to all topics
      </Link>

      <article className="mt-6 flex flex-col gap-6 rounded-3xl border-4 border-sky-200 bg-white p-6 shadow-sm sm:p-10">
        <header className="flex flex-col gap-3">
          <span aria-hidden="true" className="text-6xl leading-none">
            {topic.icon}
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">{topic.title}</h1>
          <DifficultyBadge difficulty={topic.difficulty} className="self-start" />
          <p className="text-xl text-slate-700">{topic.description}</p>
        </header>

        {topic.funFacts.length > 0 && (
          <section aria-labelledby="fun-facts-heading" className="flex flex-col gap-3">
            <h2 id="fun-facts-heading" className="text-2xl font-bold text-slate-900">
              Fun facts
            </h2>
            <ul className="flex flex-col gap-3">
              {topic.funFacts.map((fact) => (
                <li key={fact} className="rounded-2xl bg-sky-50 p-4 text-lg text-slate-800">
                  {fact}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link
          href={`/topics/${topic.id}/quiz`}
          className="self-center rounded-full bg-sky-700 px-10 py-4 text-2xl font-bold text-white shadow-md transition-colors hover:bg-sky-800 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-600 motion-reduce:transition-none"
        >
          Start Quiz
        </Link>
      </article>
    </main>
  );
}
