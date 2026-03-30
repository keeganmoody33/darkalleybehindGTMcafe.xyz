import "server-only";

import { getSupabaseIngestClient } from "@/lib/db/supabaseIngest";
import { buildDedupeKey } from "@/lib/ingestion/deduper";
import { fetchLeverPostings } from "@/lib/ingestion/fetchers/lever";
import {
  normalizeLeverPosting,
  slugToDisplayName,
} from "@/lib/ingestion/normalizer";
import { scoreJob } from "@/lib/scoring/scorer";
import type { NormalizedJob } from "@/lib/types/ingestion.types";

function getCompanySlugFromConfig(config: Record<string, unknown>): string | null {
  const v = config.company_slug ?? config.company;
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function getCompanyDisplayName(
  config: Record<string, unknown>,
  slug: string
): string {
  const cn = config.company_name;
  if (typeof cn === "string" && cn.trim()) return cn.trim();
  return slugToDisplayName(slug);
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

async function resolveCompanyId(
  supabase: ReturnType<typeof getSupabaseIngestClient>,
  name: string
): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Company name missing after normalization.");
  }

  const { data, error } = await supabase
    .from("companies")
    .upsert({ name: trimmed }, { onConflict: "name" })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

function jobInsertRow(
  norm: NormalizedJob,
  input: { companyId: string; sourceId: string; dedupeKey: string }
) {
  return {
    company_id: input.companyId,
    source_id: input.sourceId,
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
    dedupe_key: input.dedupeKey,
    status: "new" as const,
  };
}

export type LeverScanResult =
  | {
      ok: true;
      scanId: string;
      sourceId: string;
      sourceName: string;
      jobsFound: number;
      jobsNew: number;
      jobsDuplicate: number;
    }
  | { ok: false; error: string };

export async function runLeverScan(input?: {
  sourceId?: string;
}): Promise<LeverScanResult> {
  let supabase: ReturnType<typeof getSupabaseIngestClient>;
  try {
    supabase = getSupabaseIngestClient();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  let query = supabase
    .from("sources")
    .select("id, name, type, config, is_active")
    .eq("type", "lever")
    .eq("is_active", true);

  if (input?.sourceId) {
    query = query.eq("id", input.sourceId);
  }

  const { data: sources, error: srcErr } = await query
    .order("created_at", { ascending: true })
    .limit(1);

  if (srcErr) {
    return { ok: false, error: `Failed to load source: ${srcErr.message}` };
  }

  const source = sources?.[0];
  if (!source) {
    return {
      ok: false,
      error: input?.sourceId
        ? "No active Lever source found for that id."
        : "No active Lever source found. Seed `sources` or add one in Supabase.",
    };
  }

  const config = source.config as Record<string, unknown>;
  const slug = getCompanySlugFromConfig(config);
  if (!slug) {
    return {
      ok: false,
      error:
        "Lever source config must include `company_slug` (or legacy `company`).",
    };
  }

  const companyDisplay = getCompanyDisplayName(config, slug);

  const { data: scanRow, error: scanErr } = await supabase
    .from("scans")
    .insert({
      source_id: source.id,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (scanErr || !scanRow) {
    return {
      ok: false,
      error: scanErr?.message ?? "Failed to create scan record.",
    };
  }

  const scanId = scanRow.id as string;

  const failScan = async (message: string) => {
    await supabase
      .from("scans")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq("id", scanId);
  };

  try {
    const fetched = await fetchLeverPostings({
      company_slug: slug,
    });

    if (!fetched.ok) {
      await failScan(fetched.error);
      return { ok: false, error: fetched.error };
    }

    let jobsNew = 0;
    let jobsDuplicate = 0;
    const jobsFound = fetched.postings.length;

    for (const posting of fetched.postings) {
      const norm = normalizeLeverPosting(posting, {
        companyDisplayName: companyDisplay,
        companySlug: slug,
        sourceType: "lever",
      });

      if (!norm.externalUrl.trim() || !norm.title.trim()) {
        continue;
      }

      const companyId = await resolveCompanyId(supabase, norm.companyName);
      const dedupeKey = buildDedupeKey(norm.title, norm.companyName, "lever");

      const { data: insertedJob, error: insErr } = await supabase
        .from("jobs")
        .insert(
          jobInsertRow(norm, {
            companyId,
            sourceId: source.id as string,
            dedupeKey,
          })
        )
        .select("id")
        .single();

      if (insErr) {
        if (isUniqueViolation(insErr)) {
          jobsDuplicate += 1;
        } else {
          await failScan(insErr.message);
          return { ok: false, error: insErr.message };
        }
      } else {
        jobsNew += 1;

        const result = scoreJob(norm);
        await supabase.from("scores").insert({
          job_id: insertedJob.id,
          founding_score: result.foundingScore,
          builder_score: result.builderScore,
          gtm_fit_score: result.gtmFitScore,
          noise_penalty: result.noisePenalty,
          prestige_trap_penalty: result.prestigeTrapPenalty,
          overall_score: result.overallScore,
          explanation: result.explanation,
        });
      }
    }

    await supabase
      .from("scans")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        jobs_found: jobsFound,
        jobs_new: jobsNew,
        jobs_duplicate: jobsDuplicate,
        error_message: null,
      })
      .eq("id", scanId);

    await supabase
      .from("sources")
      .update({ last_scanned_at: new Date().toISOString() })
      .eq("id", source.id);

    return {
      ok: true,
      scanId,
      sourceId: source.id as string,
      sourceName: source.name as string,
      jobsFound,
      jobsNew,
      jobsDuplicate,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await failScan(message);
    return { ok: false, error: message };
  }
}
