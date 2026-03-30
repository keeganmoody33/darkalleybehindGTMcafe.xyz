"use client";

import { cn } from "@/lib/utils";
import { ScoreBadge } from "@/components/tactical/ScoreBadge";
import { StatusPill } from "@/components/tactical/StatusPill";
import type { ScoreExplanation } from "@/lib/types/database.types";

export interface IntelData {
  id: string;
  title: string;
  external_url: string;
  companyName: string | null;
  location: string | null;
  is_remote: boolean;
  status: string;
  overall_score: number | null;
  founding_score: number | null;
  builder_score: number | null;
  gtm_fit_score: number | null;
  noise_penalty: number | null;
  prestige_trap_penalty: number | null;
  explanation: ScoreExplanation | null;
  description_plain: string | null;
}

interface IntelPanelProps {
  data: IntelData | null;
  onClose: () => void;
  className?: string;
}

function DimRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono text-zinc-300">{value ?? "—"}</span>
    </div>
  );
}

export function IntelPanel({ data, onClose, className }: IntelPanelProps) {
  if (!data) return null;

  return (
    <div
      className={cn(
        "flex w-80 shrink-0 flex-col border-l border-border bg-surface-raised",
        className,
      )}
    >
      <div className="flex items-start justify-between border-b border-border p-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            Intel
          </p>
          <h3 className="mt-0.5 truncate text-sm font-semibold">{data.title}</h3>
          <p className="text-xs text-zinc-400">{data.companyName ?? "—"}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 rounded p-0.5 text-zinc-600 hover:bg-zinc-700 hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="flex items-center gap-2">
          <ScoreBadge score={data.overall_score} />
          <StatusPill status={data.status} />
          {data.is_remote && (
            <span className="text-[10px] text-sonar-accent">REMOTE</span>
          )}
        </div>

        <div className="space-y-1.5 rounded-lg border border-border bg-surface p-2">
          <DimRow label="Founding" value={data.founding_score} />
          <DimRow label="Builder" value={data.builder_score} />
          <DimRow label="GTM Fit" value={data.gtm_fit_score} />
          <DimRow label="Noise" value={data.noise_penalty} />
          <DimRow label="Prestige Trap" value={data.prestige_trap_penalty} />
        </div>

        {data.explanation?.overall?.summary && (
          <p className="text-xs italic text-zinc-500">
            {data.explanation.overall.summary}
          </p>
        )}

        {data.description_plain && (
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-widest text-zinc-600">
              Description
            </p>
            <div className="max-h-40 overflow-y-auto text-xs leading-relaxed text-zinc-400">
              {data.description_plain.slice(0, 500)}
              {data.description_plain.length > 500 && "…"}
            </div>
          </div>
        )}

        <a
          href={data.external_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-7 items-center rounded-md bg-sonar-accent px-3 text-[11px] font-medium text-zinc-950 hover:bg-sonar-accent/90"
        >
          View posting →
        </a>
      </div>
    </div>
  );
}
