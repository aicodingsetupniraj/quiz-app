import Link from "next/link";
import type { Topic } from "@/content";
import { DifficultyBadge } from "./difficulty-badge";

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
      <DifficultyBadge difficulty={difficulty} className="mt-auto self-start" />
    </Link>
  );
}
