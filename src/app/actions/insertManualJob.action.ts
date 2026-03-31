"use server";

import { randomUUID } from "node:crypto";

import { getSupabaseIngestClient } from "@/lib/db/supabaseIngest";
import { buildDedupeKey } from "@/lib/ingestion/deduper";
import { scoreJob } from "@/lib/scoring/scorer";
import type { NormalizedJob } from "@/lib/types/ingestion.types";

export type ManualJobActionState = {
  ok: boolean;
  message: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUniqueViolation(err: {
  code?: string;
  message?: string;
  details?: string;
}): boolean {
  if (err.code === "23505") return true;
  const m = `${err.message ?? ""} ${err.details ?? ""}`.toLowerCase();
  return m.includes("duplicate") || m.includes("unique");
}

export async function insertManualJobAction(
  _prevState: ManualJobActionState,
  formData: FormData,
): Promise<ManualJobActionState> {
  if (!process.env.OPS_SCAN_SECRET) {
    return {
      ok: false,
      message:
        "Server misconfiguration: set OPS_SCAN_SECRET in the environment.",
    };
  }

  const secret = String(formData.get("secret") ?? "");
  if (secret !== process.env.OPS_SCAN_SECRET) {
    return { ok: false, message: "Invalid secret." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const isRemote = formData.get("isRemote") === "on";
  const postedAtRaw = String(formData.get("postedAt") ?? "").trim();

  if (!title || !companyName || !url) {
    return {
      ok: false,
      message: "Title, company, and job URL are required.",
    };
  }

  let supabase: ReturnType<typeof getSupabaseIngestClient>;
  try {
    supabase = getSupabaseIngestClient();
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }

  const { data: sourceRow, error: srcErr } = await supabase
    .from("sources")
    .select("id")
    .eq("type", "manual")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (srcErr || !sourceRow) {
    return {
      ok: false,
      message:
        "No active manual source in `sources`. Apply migration `003` (or insert a row with type `manual`).",
    };
  }

  const sourceId = sourceRow.id as string;

  let postedAt: Date | null = null;
  if (postedAtRaw) {
    const d = new Date(postedAtRaw);
    postedAt = Number.isNaN(d.getTime()) ? null : d;
  }

  const raw = description || "";
  const plain = raw ? stripHtml(raw) : "";

  const norm: NormalizedJob = {
    externalId: `manual-${randomUUID()}`,
    externalUrl: url,
    title,
    descriptionRaw: raw,
    descriptionPlain: plain,
    companyName,
    location: location || null,
    isRemote,
    department: null,
    employmentType: null,
    postedAt,
    sourceType: "manual",
  };

  const { data: companyRow, error: cuErr } = await supabase
    .from("companies")
    .upsert({ name: companyName }, { onConflict: "name" })
    .select("id")
    .single();

  if (cuErr || !companyRow) {
    return {
      ok: false,
      message: cuErr?.message ?? "Could not upsert company.",
    };
  }

  const dedupeKey = buildDedupeKey(title, companyName, "manual");

  const { data: insertedJob, error: insErr } = await supabase
    .from("jobs")
    .insert({
      company_id: companyRow.id as string,
      source_id: sourceId,
      external_id: norm.externalId,
      external_url: norm.externalUrl,
      title: norm.title,
      description_raw: norm.descriptionRaw || null,
      description_plain: norm.descriptionPlain || null,
      location: norm.location,
      is_remote: norm.isRemote,
      department: norm.department,
      employment_type: norm.employmentType,
      posted_at: norm.postedAt ? norm.postedAt.toISOString() : null,
      dedupe_key: dedupeKey,
      status: "new",
    })
    .select("id")
    .single();

  if (insErr) {
    if (isUniqueViolation(insErr)) {
      return {
        ok: false,
        message:
          "Duplicate: a job with this title + company + manual source already exists.",
      };
    }
    return { ok: false, message: insErr.message };
  }

  const result = scoreJob(norm);
  const { error: scoreErr } = await supabase.from("scores").insert({
    job_id: insertedJob.id,
    founding_score: result.foundingScore,
    builder_score: result.builderScore,
    gtm_fit_score: result.gtmFitScore,
    noise_penalty: result.noisePenalty,
    prestige_trap_penalty: result.prestigeTrapPenalty,
    overall_score: result.overallScore,
    explanation: result.explanation,
  });

  if (scoreErr) {
    return {
      ok: false,
      message: `Job inserted but scoring failed: ${scoreErr.message}`,
    };
  }

  return {
    ok: true,
    message: `Saved manual job "${title}" at ${companyName} (id ${String(insertedJob.id).slice(0, 8)}…).`,
  };
}
