import { cn } from "@/lib/utils";

function bandStyle(score: number): string {
  if (score >= 80) return "bg-sonar-accent/20 text-sonar-accent";
  if (score >= 60) return "bg-emerald-900/40 text-emerald-300";
  if (score >= 40) return "bg-zinc-700/60 text-zinc-200";
  if (score >= 20) return "bg-zinc-800 text-zinc-400";
  return "bg-zinc-800/50 text-zinc-500";
}

interface ScoreBadgeProps {
  score: number | null;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span
        className={cn(
          "inline-flex h-6 items-center rounded-md bg-zinc-800/50 px-2 font-mono text-xs text-zinc-600",
          className,
        )}
      >
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 font-mono text-xs font-medium",
        bandStyle(score),
        className,
      )}
    >
      {score}
    </span>
  );
}
