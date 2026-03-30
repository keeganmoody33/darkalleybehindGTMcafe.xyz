"use client";

import { cn } from "@/lib/utils";

export type DashboardMode = "tactical" | "radar";

interface ModeToggleProps {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
      <button
        onClick={() => onModeChange("tactical")}
        className={cn(
          "rounded-md px-3 py-1 text-xs font-medium transition-colors",
          mode === "tactical"
            ? "bg-zinc-700 text-foreground"
            : "text-zinc-500 hover:text-zinc-300",
        )}
      >
        Tactical
      </button>
      <button
        onClick={() => onModeChange("radar")}
        className={cn(
          "rounded-md px-3 py-1 text-xs font-medium transition-colors",
          mode === "radar"
            ? "bg-zinc-700 text-foreground"
            : "text-zinc-500 hover:text-zinc-300",
        )}
      >
        Radar
      </button>
    </div>
  );
}
