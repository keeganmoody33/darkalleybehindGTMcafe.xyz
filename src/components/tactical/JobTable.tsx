"use client";

import { cn } from "@/lib/utils";
import { ScoreBadge } from "@/components/tactical/ScoreBadge";
import { StatusPill } from "@/components/tactical/StatusPill";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export interface JobRow {
  id: string;
  title: string;
  external_url: string;
  companyName: string | null;
  overall_score: number | null;
  founding_score: number | null;
  builder_score: number | null;
  gtm_fit_score: number | null;
  status: string;
  discovered_at: string;
  is_remote: boolean;
  location: string | null;
}

interface JobTableProps {
  jobs: JobRow[];
  total: number;
  selectedJobId?: string | null;
  onSelectJob?: (jobId: string) => void;
}

function MiniScore({ value }: { value: number | null }) {
  if (value === null) return <span className="text-zinc-700">—</span>;
  return <span className="text-zinc-400">{value}</span>;
}

export function JobTable({ jobs, total, selectedJobId, onSelectJob }: JobTableProps) {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="text-xs text-zinc-400">
          <span className="text-foreground">{jobs.length}</span>
          {total > jobs.length && (
            <>
              {" "}of <span className="text-foreground">{total}</span>
            </>
          )}{" "}
          jobs
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-zinc-500">
          No jobs match your filters. Try adjusting or resetting.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border text-[11px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Company</th>
                <th className="px-3 py-2 font-medium">Score</th>
                <th className="px-3 py-2 font-medium">F</th>
                <th className="px-3 py-2 font-medium">B</th>
                <th className="px-3 py-2 font-medium">G</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Loc</th>
                <th className="px-3 py-2 font-medium">Discovered</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => {
                const isSelected = j.id === selectedJobId;
                return (
                  <tr
                    key={j.id}
                    onClick={() => onSelectJob?.(j.id)}
                    className={cn(
                      "cursor-pointer border-b border-border/50 transition-colors hover:bg-zinc-800/50",
                      isSelected && "border-l-2 border-l-sonar-accent bg-zinc-800/70",
                    )}
                  >
                    <td className="max-w-[280px] truncate px-3 py-2">
                      <a
                        href={j.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {j.title}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-zinc-400">
                      {j.companyName ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <ScoreBadge score={j.overall_score} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      <MiniScore value={j.founding_score} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      <MiniScore value={j.builder_score} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      <MiniScore value={j.gtm_fit_score} />
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill status={j.status} />
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-500">
                      {j.is_remote ? (
                        <span className="text-sonar-accent">Remote</span>
                      ) : (
                        j.location ?? "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-500">
                      {formatDate(j.discovered_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
