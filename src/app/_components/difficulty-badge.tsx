import type { Difficulty } from "@/content";

// Full class strings, not built from the difficulty name, so Tailwind's scanner finds them.
const difficultyStyles: Record<Difficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-900",
  Medium: "bg-amber-100 text-amber-900",
  Hard: "bg-rose-100 text-rose-900",
};

type DifficultyBadgeProps = {
  difficulty: Difficulty;
  className?: string;
};

export function DifficultyBadge({ difficulty, className = "" }: DifficultyBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-base font-semibold ${difficultyStyles[difficulty]} ${className}`}
    >
      {difficulty}
    </span>
  );
}
