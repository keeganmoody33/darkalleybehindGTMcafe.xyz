"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FilterBar } from "@/components/tactical/FilterBar";
import { JobTable, type JobRow } from "@/components/tactical/JobTable";
import { DetailDrawer, type DrawerJob } from "@/components/tactical/DetailDrawer";
import { RadarCanvas } from "@/components/radar/RadarCanvas";
import { IntelPanel, type IntelData } from "@/components/radar/IntelPanel";
import { EventLog, type LogEntry } from "@/components/radar/EventLog";
import { ModeToggle, type DashboardMode } from "@/components/layout/ModeToggle";
import type { BlipData } from "@/components/radar/ContactBlip";
import type { JobWithRelations } from "@/lib/data/jobs";

interface DashboardShellProps {
  jobs: JobWithRelations[];
  total: number;
  initialFilters: Record<string, string | undefined>;
  error?: string;
}

export function DashboardShell({
  jobs,
  total,
  initialFilters,
  error,
}: DashboardShellProps) {
  const [mode, setMode] = useState<DashboardMode>("tactical");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const selectedJob = selectedJobId
    ? jobs.find((j) => j.id === selectedJobId) ?? null
    : null;

  const handleClose = useCallback(() => setSelectedJobId(null), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedJobId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tableJobs: JobRow[] = useMemo(
    () =>
      jobs.map((j) => ({
        id: j.id,
        title: j.title,
        external_url: j.external_url,
        companyName: j.companyName,
        overall_score: j.overall_score,
        founding_score: j.founding_score,
        builder_score: j.builder_score,
        gtm_fit_score: j.gtm_fit_score,
        status: j.status,
        discovered_at: j.discovered_at,
        is_remote: j.is_remote,
        location: j.location,
      })),
    [jobs],
  );

  const blips: BlipData[] = useMemo(
    () =>
      jobs
        .filter((j) => j.overall_score !== null)
        .map((j) => ({
          id: j.id,
          title: j.title,
          companyName: j.companyName,
          overallScore: j.overall_score ?? 0,
          foundingScore: j.founding_score ?? 0,
          status: j.status,
        })),
    [jobs],
  );

  const intelData: IntelData | null = selectedJob
    ? {
        id: selectedJob.id,
        title: selectedJob.title,
        external_url: selectedJob.external_url,
        companyName: selectedJob.companyName,
        location: selectedJob.location,
        is_remote: selectedJob.is_remote,
        status: selectedJob.status,
        overall_score: selectedJob.overall_score,
        founding_score: selectedJob.founding_score,
        builder_score: selectedJob.builder_score,
        gtm_fit_score: selectedJob.gtm_fit_score,
        noise_penalty: selectedJob.noise_penalty,
        prestige_trap_penalty: selectedJob.prestige_trap_penalty,
        explanation: selectedJob.explanation,
        description_plain: selectedJob.description_plain,
      }
    : null;

  const drawerJob: DrawerJob | null = selectedJob
    ? {
        id: selectedJob.id,
        title: selectedJob.title,
        external_url: selectedJob.external_url,
        companyName: selectedJob.companyName,
        location: selectedJob.location,
        is_remote: selectedJob.is_remote,
        department: selectedJob.department,
        status: selectedJob.status,
        description_plain: selectedJob.description_plain,
        outreach_angle: selectedJob.outreach_angle,
        discovered_at: selectedJob.discovered_at,
        explanation: selectedJob.explanation,
        notes: [],
        statusHistory: [],
      }
    : null;

  const eventEntries: LogEntry[] = useMemo(() => {
    const entries: LogEntry[] = [];
    const highScoreJobs = jobs.filter(
      (j) => j.overall_score !== null && j.overall_score >= 80,
    );
    for (const j of highScoreJobs.slice(0, 5)) {
      entries.push({
        id: `match-${j.id}`,
        timestamp: j.discovered_at,
        message: `High-score match: ${j.title} (${j.overall_score})`,
        type: "match",
      });
    }
    if (jobs.length > 0) {
      entries.push({
        id: "scan-summary",
        timestamp: new Date().toISOString(),
        message: `${jobs.length} contacts loaded, ${highScoreJobs.length} high-value`,
        type: "scan",
      });
    }
    return entries.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [jobs]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <ModeToggle mode={mode} onModeChange={setMode} />
        <span className="text-xs text-zinc-600">
          {jobs.length} contacts
        </span>
      </div>

      {mode === "tactical" && (
        <FilterBar initialFilters={initialFilters} />
      )}

      {error && (
        <div className="rounded-lg border border-sonar-danger/30 bg-sonar-danger/10 px-4 py-3 text-sm text-sonar-danger">
          {error}
        </div>
      )}

      {mode === "tactical" ? (
        <>
          <JobTable
            jobs={tableJobs}
            total={total}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
          />
          <DetailDrawer job={drawerJob} onClose={handleClose} />
          {selectedJobId && (
            <div
              className="fixed inset-0 z-30 bg-black/40"
              onClick={handleClose}
            />
          )}
        </>
      ) : (
        <div className="flex flex-1 gap-0 overflow-hidden rounded-xl border border-border">
          <div className="flex-1">
            <RadarCanvas
              blips={blips}
              selectedBlipId={selectedJobId}
              onSelectBlip={setSelectedJobId}
            />
          </div>
          {intelData && (
            <IntelPanel data={intelData} onClose={handleClose} />
          )}
        </div>
      )}

      {mode === "radar" && <EventLog entries={eventEntries} />}
    </div>
  );
}
