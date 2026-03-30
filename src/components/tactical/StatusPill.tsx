import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-sonar-accent/20 text-sonar-accent border-sonar-accent/40",
  reviewed: "bg-zinc-700/50 text-zinc-200 border-zinc-600",
  shortlisted: "border-sonar-accent text-sonar-accent bg-transparent",
  applied: "bg-sonar-info/20 text-sonar-info border-sonar-info/40",
  outreach_sent: "border-sonar-info text-sonar-info bg-transparent",
  interviewing: "bg-sonar-warning/20 text-sonar-warning border-sonar-warning/40",
  archived: "bg-zinc-800 text-zinc-500 border-zinc-700",
};

interface StatusPillProps {
  status: string;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.archived;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        style,
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
