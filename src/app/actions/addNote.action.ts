"use server";

import { getSupabaseIngestClient } from "@/lib/db/supabaseIngest";

export async function addNoteAction(
  jobId: string,
  content: string,
): Promise<{ ok: true; noteId: string } | { ok: false; error: string }> {
  const trimmed = content.trim();
  if (!jobId) return { ok: false, error: "Missing job ID." };
  if (!trimmed) return { ok: false, error: "Note content cannot be empty." };

  let supabase: ReturnType<typeof getSupabaseIngestClient>;
  try {
    supabase = getSupabaseIngestClient();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({ job_id: jobId, content: trimmed })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to add note." };
  }

  return { ok: true, noteId: data.id as string };
}
