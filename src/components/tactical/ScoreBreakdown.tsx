import { cn } from "@/lib/utils";
import type { DimensionExplanation, ScoreExplanation } from "@/lib/types/database.types";

interface ScoreBreakdownProps {
  explanation: ScoreExplanation | null;
  className?: string;
}

function scoreBandColor(score: number): string {
  if (score >= 80) return "text-sonar-accent";
  if (score >= 60) return "text-emerald-300";
  if (score >= 40) return "text-zinc-300";
  if (score >= 20) return "text-zinc-400";
  return "text-zinc-500";
}

function DimensionSection({
  label,
  dimension,
  isPenalty,
}: {
  label: string;
  dimension: DimensionExplanation;
  isPenalty?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-300">{label}</span>
        <span className={cn("font-mono text-sm font-medium", scoreBandColor(isPenalty ? 100 - dimension.score : dimension.score))}>
          {dimension.score}
          {isPenalty && <span className="ml-1 text-[10px] text-zinc-500">penalty</span>}
        </span>
      </div>
      {dimension.signals.length > 0 && (
        <ul className="space-y-0.5">
          {dimension.signals.map((sig, i) => (
            <li key={i} className="flex items-start gap-2 text-xs">
              <span
                className={cn(
                  "shrink-0 font-mono",
                  sig.impact.startsWith("-")
                    ? "text-sonar-danger"
                    : "text-sonar-accent",
                )}
              >
                {sig.impact}
              </span>
              <span className="text-zinc-400">{sig.text}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs italic text-zinc-500">{dimension.summary}</p>
    </div>
  );
}

export function ScoreBreakdown({ explanation, className }: ScoreBreakdownProps) {
  if (!explanation) {
    return (
      <div className={cn("text-sm text-zinc-500", className)}>
        No score data available.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Score</span>
          <span className={cn("font-mono text-lg font-bold", scoreBandColor(explanation.overall.score))}>
            {explanation.overall.score}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">{explanation.overall.summary}</p>
      </div>

      <div className="space-y-3">
        <DimensionSection label="Founding" dimension={explanation.founding} />
        <DimensionSection label="Builder" dimension={explanation.builder} />
        <DimensionSection label="GTM Fit" dimension={explanation.gtm_fit} />
        <DimensionSection label="Noise Penalty" dimension={explanation.noise} isPenalty />
        <DimensionSection label="Prestige Trap" dimension={explanation.prestige_trap} isPenalty />
      </div>
    </div>
  );
}
