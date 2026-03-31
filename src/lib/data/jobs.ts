import "server-only";

import { supabaseServer } from "@/lib/db/supabaseServer";
import type {
  Note,
  ScoreExplanation,
  StatusHistoryEntry,
} from "@/lib/types/database.types";

export interface JobWithRelations {
  id: string;
  title: string;
  external_url: string;
  description_plain: string | null;
  location: string | null;
  is_remote: boolean;
  department: string | null;
  employment_type: string | null;
  posted_at: string | null;
  discovered_at: string;
  status: string;
  outreach_angle: string | null;
  dedupe_key: string;
  companyName: string | null;
  sourceName: string | null;
  overall_score: number | null;
  founding_score: number | null;
  builder_score: number | null;
  gtm_fit_score: number | null;
  noise_penalty: number | null;
  prestige_trap_penalty: number | null;
  explanation: ScoreExplanation | null;
}

export interface DashboardFilters {
  q?: string;
  status?: string | string[];
  minScore?: number;
  maxScore?: number;
  isRemote?: boolean;
  /** Only jobs first seen by Sonar within this many days (`discovered_at`). Omit or `null` = no cutoff. */
  discoveredWithinDays?: number | null;
  sortBy?: "score" | "date" | "title";
  sortDir?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

type DashboardResult =
  | { ok: true; jobs: JobWithRelations[]; total: number }
  | { ok: false; error: string };

function mapRow(row: Record<string, unknown>): JobWithRelations {
  const companies = row.companies as { name: string } | null;
  const sources = row.sources as { name: string } | null;
  const scores = row.scores as Record<string, unknown>[] | null;
  const score = scores?.[0] ?? null;

  return {
    id: row.id as string,
    title: row.title as string,
    external_url: row.external_url as string,
    description_plain: row.description_plain as string | null,
    location: row.location as string | null,
    is_remote: row.is_remote as boolean,
    department: row.department as string | null,
    employment_type: row.employment_type as string | null,
    posted_at: row.posted_at as string | null,
    discovered_at: row.discovered_at as string,
    status: row.status as string,
    outreach_angle: row.outreach_angle as string | null,
    dedupe_key: row.dedupe_key as string,
    companyName: companies?.name ?? null,
    sourceName: sources?.name ?? null,
    overall_score: (score?.overall_score as number) ?? null,
    founding_score: (score?.founding_score as number) ?? null,
    builder_score: (score?.builder_score as number) ?? null,
    gtm_fit_score: (score?.gtm_fit_score as number) ?? null,
    noise_penalty: (score?.noise_penalty as number) ?? null,
    prestige_trap_penalty: (score?.prestige_trap_penalty as number) ?? null,
    explanation: (score?.explanation as ScoreExplanation) ?? null,
  };
}

export async function getDashboardJobs(
  filters: DashboardFilters = {},
): Promise<DashboardResult> {
  const {
    q,
    status,
    minScore,
    maxScore,
    isRemote,
    discoveredWithinDays,
    sortBy = "score",
    sortDir = "desc",
    limit = 50,
    offset = 0,
  } = filters;

  let query = supabaseServer
    .from("jobs")
    .select(
      "*, companies(name), sources(name), scores(founding_score, builder_score, gtm_fit_score, noise_penalty, prestige_trap_penalty, overall_score, explanation)",
      { count: "exact" },
    );

  if (
    typeof discoveredWithinDays === "number" &&
    discoveredWithinDays > 0 &&
    Number.isFinite(discoveredWithinDays)
  ) {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - discoveredWithinDays);
    query = query.gte("discovered_at", cutoff.toISOString());
  }

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
    if (statuses.length === 1) {
      query = query.eq("status", statuses[0]);
    } else {
      query = query.in("status", statuses);
    }
  }

  if (isRemote !== undefined) {
    query = query.eq("is_remote", isRemote);
  }

  query = query.range(offset, offset + limit - 1);

  switch (sortBy) {
    case "date":
      query = query.order("discovered_at", { ascending: sortDir === "asc" });
      break;
    case "title":
      query = query.order("title", { ascending: sortDir === "asc" });
      break;
    case "score":
    default:
      query = query.order("discovered_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query;

  if (error) {
    return { ok: false, error: error.message };
  }

  let jobs = (data ?? []).map((row) =>
    mapRow(row as unknown as Record<string, unknown>),
  );

  if (sortBy === "score") {
    jobs.sort((a, b) => {
      const aScore = a.overall_score ?? -1;
      const bScore = b.overall_score ?? -1;
      return sortDir === "asc" ? aScore - bScore : bScore - aScore;
    });
  }

  if (minScore !== undefined) {
    jobs = jobs.filter((j) => (j.overall_score ?? 0) >= minScore);
  }
  if (maxScore !== undefined) {
    jobs = jobs.filter((j) => (j.overall_score ?? 0) <= maxScore);
  }

  return { ok: true, jobs, total: count ?? jobs.length };
}

export interface JobDetail extends JobWithRelations {
  description_raw: string | null;
  company_id: string;
  notes: Note[];
  statusHistory: StatusHistoryEntry[];
}

export async function getJobDetail(
  jobId: string,
): Promise<JobDetail | null> {
  const { data: row, error } = await supabaseServer
    .from("jobs")
    .select(
      "*, companies(name), sources(name), scores(founding_score, builder_score, gtm_fit_score, noise_penalty, prestige_trap_penalty, overall_score, explanation)",
    )
    .eq("id", jobId)
    .single();

  if (error || !row) return null;

  const base = mapRow(row as unknown as Record<string, unknown>);

  const { data: notes } = await supabaseServer
    .from("notes")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  const { data: history } = await supabaseServer
    .from("status_history")
    .select("*")
    .eq("job_id", jobId)
    .order("changed_at", { ascending: false });

  return {
    ...base,
    description_raw: (row as Record<string, unknown>).description_raw as string | null,
    company_id: (row as Record<string, unknown>).company_id as string,
    notes: (notes ?? []) as Note[],
    statusHistory: (history ?? []) as StatusHistoryEntry[],
  };
}
