import Link from "next/link";
import type { Difficulty, Topic } from "@/content";

// Full class strings, not built from the difficulty name, so Tailwind's scanner finds them.
const difficultyStyles: Record<Difficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-900",
  Medium: "bg-amber-100 text-amber-900",
  Hard: "bg-rose-100 text-rose-900",
};

type TopicCardProps = Pick<Topic, "id" | "title" | "icon" | "description" | "difficulty">;

export function TopicCard({ id, title, icon, description, difficulty }: TopicCardProps) {
  return (
    <Link
      href={`/topics/${id}`}
      className="flex h-full min-h-44 flex-col gap-3 rounded-3xl border-4 border-sky-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:border-sky-400 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span aria-hidden="true" className="text-5xl leading-none">
        {icon}
      </span>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-lg text-slate-700">{description}</p>
      <span
        className={`mt-auto self-start rounded-full px-3 py-1 text-base font-semibold ${difficultyStyles[difficulty]}`}
      >
        {difficulty}
      </span>
    </Link>
  );
}
