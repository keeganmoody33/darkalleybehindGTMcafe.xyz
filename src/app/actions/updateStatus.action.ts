"use server";

import { getSupabaseIngestClient } from "@/lib/db/supabaseIngest";
import type { JobStatus } from "@/lib/types/database.types";

const VALID_STATUSES: JobStatus[] = [
  "new",
  "reviewed",
  "shortlisted",
  "applied",
  "outreach_sent",
  "interviewing",
  "archived",
];

export async function updateStatusAction(
  jobId: string,
  newStatus: JobStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!jobId) return { ok: false, error: "Missing job ID." };
  if (!VALID_STATUSES.includes(newStatus)) {
    return { ok: false, error: `Invalid status: ${newStatus}` };
  }

  let supabase: ReturnType<typeof getSupabaseIngestClient>;
  try {
    supabase = getSupabaseIngestClient();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const { data: job, error: fetchErr } = await supabase
    .from("jobs")
    .select("status")
    .eq("id", jobId)
    .single();

  if (fetchErr || !job) {
    return { ok: false, error: fetchErr?.message ?? "Job not found." };
  }

  const fromStatus = job.status as JobStatus;
  if (fromStatus === newStatus) {
    return { ok: true };
  }

  const { error: updateErr } = await supabase
    .from("jobs")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", jobId);

  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }

  await supabase.from("status_history").insert({
    job_id: jobId,
    from_status: fromStatus,
    to_status: newStatus,
  });

  return { ok: true };
}
