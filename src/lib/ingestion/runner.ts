import "server-only";

import { getSupabaseIngestClient } from "@/lib/db/supabaseIngest";
import { buildDedupeKey } from "@/lib/ingestion/deduper";
import { fetchAshbyJobs } from "@/lib/ingestion/fetchers/ashby";
import { fetchGreenhouseJobs } from "@/lib/ingestion/fetchers/greenhouse";
import { fetchLeverPostings } from "@/lib/ingestion/fetchers/lever";
import {
  fetchRemoteOKJobs,
  fetchRemotiveJobs,
  fetchRssFeedJobs,
} from "@/lib/ingestion/fetchers/rss";
import {
  normalizeAshbyJob,
  normalizeGreenhouseJob,
  normalizeLeverPosting,
  normalizeRssJob,
  slugToDisplayName,
} from "@/lib/ingestion/normalizer";
import { scoreJob } from "@/lib/scoring/scorer";
import type { SourceType } from "@/lib/types/database.types";
import type { NormalizedJob } from "@/lib/types/ingestion.types";

export const RSS_GTM_KEYWORDS = [
  "gtm engineer",
  "gtm systems",
  "revenue engineer",
  "revenue operations engineer",
  "revops engineer",
  "sales operations engineer",
  "sales engineer",
  "solutions engineer",
  "bizops engineer",
  "marketing operations engineer",
  "crm engineer",
  "growth engineer",
  "founding gtm",
];

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

export type PerSourceScanResult = {
  ok: boolean;
  sourceId: string;
  sourceName: string;
  sourceType: string;
  scanId?: string;
  jobsFound: number;
  jobsNew: number;
  jobsDuplicate: number;
  error?: string;
};

export type IngestionScanResult =
  | { ok: true; results: PerSourceScanResult[] }
  | { ok: false; error: string };

type SourceRow = {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  is_active: boolean;
};

async function ingestNormalizedJobs(
  supabase: ReturnType<typeof getSupabaseIngestClient>,
  source: SourceRow,
  norms: NormalizedJob[],
  dedupeSourceType: SourceType
): Promise<{ jobsFound: number; jobsNew: number; jobsDuplicate: number }> {
  let jobsNew = 0;
  let jobsDuplicate = 0;
  const jobsFound = norms.length;

  for (const norm of norms) {
    if (!norm.externalUrl.trim() || !norm.title.trim()) {
      continue;
    }

    const companyId = await resolveCompanyId(supabase, norm.companyName);
    const dedupeKey = buildDedupeKey(
      norm.title,
      norm.companyName,
      dedupeSourceType
    );

    const { data: insertedJob, error: insErr } = await supabase
      .from("jobs")
      .insert(
        jobInsertRow(norm, {
          companyId,
          sourceId: source.id,
          dedupeKey,
        })
      )
      .select("id")
      .single();

    if (insErr) {
      if (isUniqueViolation(insErr)) {
        jobsDuplicate += 1;
      } else {
        throw new Error(insErr.message);
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

  return { jobsFound, jobsNew, jobsDuplicate };
}

async function failScan(
  supabase: ReturnType<typeof getSupabaseIngestClient>,
  scanId: string,
  message: string
) {
  await supabase
    .from("scans")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: message,
    })
    .eq("id", scanId);
}

async function completeScan(
  supabase: ReturnType<typeof getSupabaseIngestClient>,
  scanId: string,
  sourceId: string,
  stats: { jobsFound: number; jobsNew: number; jobsDuplicate: number }
) {
  await supabase
    .from("scans")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      jobs_found: stats.jobsFound,
      jobs_new: stats.jobsNew,
      jobs_duplicate: stats.jobsDuplicate,
      error_message: null,
    })
    .eq("id", scanId);

  await supabase
    .from("sources")
    .update({ last_scanned_at: new Date().toISOString() })
    .eq("id", sourceId);
}

async function scanOneSource(
  supabase: ReturnType<typeof getSupabaseIngestClient>,
  source: SourceRow
): Promise<PerSourceScanResult> {
  const base: PerSourceScanResult = {
    ok: false,
    sourceId: source.id,
    sourceName: source.name,
    sourceType: source.type,
    jobsFound: 0,
    jobsNew: 0,
    jobsDuplicate: 0,
  };

  if (source.type === "manual") {
    return {
      ...base,
      ok: true,
      error: "Skipped — manual sources are not fetched automatically.",
    };
  }

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
      ...base,
      error: scanErr?.message ?? "Failed to create scan record.",
    };
  }

  const scanId = scanRow.id as string;
  base.scanId = scanId;

  try {
    const config = source.config ?? {};
    let norms: NormalizedJob[] = [];
    let dedupeType: SourceType;

    if (source.type === "lever") {
      dedupeType = "lever";
      const slug = getCompanySlugFromConfig(config);
      if (!slug) {
        throw new Error(
          "Lever source config must include `company_slug` (or legacy `company`)."
        );
      }
      const companyDisplay = getCompanyDisplayName(config, slug);
      const fetched = await fetchLeverPostings({ company_slug: slug });
      if (!fetched.ok) {
        throw new Error(fetched.error);
      }
      norms = fetched.postings.map((p) =>
        normalizeLeverPosting(p, {
          companyDisplayName: companyDisplay,
          companySlug: slug,
          sourceType: "lever",
        })
      );
    } else if (source.type === "greenhouse") {
      dedupeType = "greenhouse";
      const token =
        (typeof config.board_token === "string" && config.board_token.trim()
          ? config.board_token.trim()
          : null) ??
        (typeof config.company_slug === "string" && config.company_slug.trim()
          ? config.company_slug.trim()
          : null);
      if (!token) {
        throw new Error(
          "Greenhouse source config must include `board_token` or `company_slug`."
        );
      }
      const companyDisplay = getCompanyDisplayName(config, token);
      const jobs = await fetchGreenhouseJobs(token);
      norms = jobs.map((j) =>
        normalizeGreenhouseJob(j, token, companyDisplay)
      );
    } else if (source.type === "ashby") {
      dedupeType = "ashby";
      const orgId =
        (typeof config.org_id === "string" && config.org_id.trim()
          ? config.org_id.trim()
          : null) ??
        (typeof config.company_slug === "string" && config.company_slug.trim()
          ? config.company_slug.trim()
          : null);
      if (!orgId) {
        throw new Error("Ashby source config must include `org_id` (or `company_slug`).");
      }
      const companyDisplay = getCompanyDisplayName(config, orgId);
      const jobs = await fetchAshbyJobs(orgId);
      norms = jobs.map((j) => normalizeAshbyJob(j, orgId, companyDisplay));
    } else if (source.type === "rss") {
      dedupeType = "rss";
      const keywords = Array.isArray(config.keywords)
        ? (config.keywords as string[]).filter(
            (k): k is string => typeof k === "string" && k.trim().length > 0
          )
        : RSS_GTM_KEYWORDS;
      const provider =
        typeof config.provider === "string" ? config.provider.trim() : "remoteok";
      let rssJobs;
      if (provider === "remotive") {
        rssJobs = await fetchRemotiveJobs(keywords);
      } else if (provider === "rss_feed" || provider === "feed") {
        const feedUrl =
          typeof config.feed_url === "string" ? config.feed_url.trim() : "";
        if (!feedUrl) {
          throw new Error(
            'RSS source with provider "rss_feed" must set config.feed_url.',
          );
        }
        const defaultCompany =
          typeof config.company_name === "string" && config.company_name.trim()
            ? config.company_name.trim()
            : "RSS feed";
        rssJobs = await fetchRssFeedJobs(feedUrl, keywords, defaultCompany);
      } else {
        rssJobs = await fetchRemoteOKJobs(keywords);
      }
      norms = rssJobs.map((j) => normalizeRssJob(j));
    } else {
      throw new Error(`Unsupported source type: ${source.type}`);
    }

    const stats = await ingestNormalizedJobs(supabase, source, norms, dedupeType);

    await completeScan(supabase, scanId, source.id, stats);

    return {
      ...base,
      ok: true,
      jobsFound: stats.jobsFound,
      jobsNew: stats.jobsNew,
      jobsDuplicate: stats.jobsDuplicate,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await failScan(supabase, scanId, message);
    return {
      ...base,
      error: message,
    };
  }
}

export async function runIngestionScan(input?: {
  sourceId?: string;
}): Promise<IngestionScanResult> {
  let supabase: ReturnType<typeof getSupabaseIngestClient>;
  try {
    supabase = getSupabaseIngestClient();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  let query = supabase
    .from("sources")
    .select("id, name, type, config, is_active")
    .eq("is_active", true);

  if (input?.sourceId) {
    query = query.eq("id", input.sourceId);
  }

  const { data: sources, error: srcErr } = await query.order("created_at", {
    ascending: true,
  });

  if (srcErr) {
    return { ok: false, error: `Failed to load sources: ${srcErr.message}` };
  }

  if (!sources?.length) {
    return {
      ok: false,
      error: input?.sourceId
        ? "No active source found for that id."
        : "No active sources found. Seed `sources` or add rows in Supabase.",
    };
  }

  const results: PerSourceScanResult[] = [];
  for (const row of sources) {
    const source = row as SourceRow;
    const r = await scanOneSource(supabase, source);
    results.push(r);
  }

  return { ok: true, results };
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

/** @deprecated Prefer `runIngestionScan` — this alias runs all active sources when `sourceId` is omitted. */
export async function runLeverScan(input?: {
  sourceId?: string;
}): Promise<LeverScanResult> {
  const agg = await runIngestionScan(input);
  if (!agg.ok) {
    return { ok: false, error: agg.error };
  }

  if (input?.sourceId && agg.results.length === 1) {
    const r = agg.results[0];
    if (!r.ok || !r.scanId) {
      return { ok: false, error: r.error ?? "Scan failed." };
    }
    return {
      ok: true,
      scanId: r.scanId,
      sourceId: r.sourceId,
      sourceName: r.sourceName,
      jobsFound: r.jobsFound,
      jobsNew: r.jobsNew,
      jobsDuplicate: r.jobsDuplicate,
    };
  }

  const okResults = agg.results.filter((r) => r.ok && r.scanId);
  const first = okResults[0];
  const totals = agg.results.reduce(
    (acc, r) => ({
      jobsFound: acc.jobsFound + r.jobsFound,
      jobsNew: acc.jobsNew + r.jobsNew,
      jobsDuplicate: acc.jobsDuplicate + r.jobsDuplicate,
    }),
    { jobsFound: 0, jobsNew: 0, jobsDuplicate: 0 }
  );

  if (!first?.scanId) {
    const err = agg.results.find((r) => r.error)?.error ?? "All sources failed.";
    return { ok: false, error: err };
  }

  return {
    ok: true,
    scanId: first.scanId,
    sourceId: first.sourceId,
    sourceName: `${agg.results.length} sources`,
    jobsFound: totals.jobsFound,
    jobsNew: totals.jobsNew,
    jobsDuplicate: totals.jobsDuplicate,
  };
}
