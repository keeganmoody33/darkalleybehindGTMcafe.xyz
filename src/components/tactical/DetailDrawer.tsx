"use client";

import { useCallback, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { ScoreBreakdown } from "@/components/tactical/ScoreBreakdown";
import { updateStatusAction } from "@/app/actions/updateStatus.action";
import { addNoteAction } from "@/app/actions/addNote.action";
import type { JobStatus, Note, ScoreExplanation, StatusHistoryEntry } from "@/lib/types/database.types";

const STATUSES: JobStatus[] = [
  "new",
  "reviewed",
  "shortlisted",
  "applied",
  "outreach_sent",
  "interviewing",
  "archived",
];

export interface DrawerJob {
  id: string;
  title: string;
  external_url: string;
  companyName: string | null;
  location: string | null;
  is_remote: boolean;
  department: string | null;
  status: string;
  description_plain: string | null;
  outreach_angle: string | null;
  discovered_at: string;
  explanation: ScoreExplanation | null;
  notes: Note[];
  statusHistory: StatusHistoryEntry[];
}

interface DetailDrawerProps {
  job: DrawerJob | null;
  onClose: () => void;
}

export function DetailDrawer({ job, onClose }: DetailDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [noteText, setNoteText] = useState("");
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>("");

  if (job && currentStatus === "") {
    setCurrentStatus(job.status);
    setLocalNotes(job.notes);
  }

  const handleStatusChange = useCallback(
    (newStatus: JobStatus) => {
      if (!job) return;
      startTransition(async () => {
        const result = await updateStatusAction(job.id, newStatus);
        if (result.ok) {
          setCurrentStatus(newStatus);
        }
      });
    },
    [job],
  );

  const handleAddNote = useCallback(() => {
    if (!job || !noteText.trim()) return;
    const text = noteText.trim();
    startTransition(async () => {
      const result = await addNoteAction(job.id, text);
      if (result.ok) {
        setLocalNotes((prev) => [
          {
            id: result.noteId,
            job_id: job.id,
            content: text,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNoteText("");
      }
    });
  }, [job, noteText]);

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border bg-surface-raised shadow-2xl transition-transform duration-200",
        job ? "translate-x-0" : "translate-x-full",
      )}
    >
      {job && (
        <>
          <div className="flex items-start justify-between border-b border-border p-4">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold">{job.title}</h2>
              <p className="text-sm text-zinc-400">{job.companyName ?? "Unknown company"}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                {job.is_remote && <span className="text-sonar-accent">Remote</span>}
                {job.location && <span>{job.location}</span>}
                {job.department && <span>· {job.department}</span>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-2 shrink-0 rounded-md p-1 text-zinc-500 hover:bg-zinc-700 hover:text-foreground"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <a
              href={job.external_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center rounded-lg bg-sonar-accent px-3 text-xs font-medium text-zinc-950 hover:bg-sonar-accent/90"
            >
              View original posting →
            </a>

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Status
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={isPending}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs transition-colors",
                      (currentStatus || job.status) === s
                        ? "bg-sonar-accent/20 text-sonar-accent ring-1 ring-sonar-accent/40"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-foreground",
                      isPending && "opacity-50",
                    )}
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Score Breakdown
              </h3>
              <ScoreBreakdown explanation={job.explanation} />
            </div>

            {job.description_plain && (
              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Description
                </h3>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-zinc-300">
                  {job.description_plain}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Notes
              </h3>
              <div className="flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  placeholder="Add a note..."
                  className="h-8 flex-1 rounded-lg border border-input bg-background px-3 text-xs text-foreground placeholder:text-zinc-600"
                />
                <button
                  onClick={handleAddNote}
                  disabled={isPending || !noteText.trim()}
                  className="h-8 rounded-lg bg-zinc-700 px-3 text-xs text-foreground hover:bg-zinc-600 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
              {(localNotes.length > 0 || job.notes.length > 0) && (
                <ul className="mt-2 space-y-1.5">
                  {(localNotes.length > 0 ? localNotes : job.notes).map((n) => (
                    <li
                      key={n.id}
                      className="rounded-md border border-border bg-surface px-3 py-2 text-xs text-zinc-300"
                    >
                      <p>{n.content}</p>
                      <p className="mt-1 text-[10px] text-zinc-600">
                        {new Date(n.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
