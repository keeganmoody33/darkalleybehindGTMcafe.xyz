"use client";

import { cn } from "@/lib/utils";

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "scan" | "match" | "status" | "error";
}

interface EventLogProps {
  entries: LogEntry[];
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  scan: "text-sonar-info",
  match: "text-sonar-accent",
  status: "text-zinc-400",
  error: "text-sonar-danger",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function EventLog({ entries, className }: EventLogProps) {
  return (
    <div
      className={cn(
        "flex h-32 flex-col border-t border-border bg-surface",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-[10px] uppercase tracking-widest text-zinc-600">
          Event Log
        </span>
        <span className="text-[10px] text-zinc-600">
          {entries.length} events
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-1 font-mono text-[11px]">
        {entries.length === 0 ? (
          <p className="py-2 text-zinc-600">No events recorded yet.</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="flex gap-2 py-0.5">
              <span className="shrink-0 text-zinc-600">
                {formatTime(e.timestamp)}
              </span>
              <span className={cn("shrink-0 w-12", TYPE_COLORS[e.type] ?? "text-zinc-500")}>
                [{e.type}]
              </span>
              <span className="text-zinc-300">{e.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
