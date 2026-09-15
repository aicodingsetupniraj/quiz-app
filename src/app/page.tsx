import { topics } from "@/content";
import { TopicCard } from "./_components/topic-card";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="mb-8 text-center text-4xl font-extrabold text-foreground sm:text-5xl">
        Pick a science topic
      </h1>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <li key={topic.id}>
            <TopicCard
              id={topic.id}
              title={topic.title}
              icon={topic.icon}
              description={topic.description}
              difficulty={topic.difficulty}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
