import "server-only";

import { supabaseServer } from "@/lib/db/supabaseServer";

export type PublicJobStatus =
  | "new"
  | "reviewed"
  | "shortlisted"
  | "applied"
  | "outreach_sent"
  | "interviewing"
  | "archived";

export interface PublicJobRow {
  id: string;
  title: string;
  external_url: string;
  status: PublicJobStatus;
  discovered_at: string;
  companyName: string | null;
  sourceName: string | null;
  overallScore: number | null;
}

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function getPublicJobs(input: {
  q?: string;
  status?: string;
  minScore?: number;
  limit?: number;
}) {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
  const q = (input.q ?? "").trim();
  const status = (input.status ?? "").trim();
  const minScore = input.minScore;

  let query = supabaseServer
    .from("jobs")
    .select(
      `
        id,
        title,
        external_url,
        status,
        discovered_at,
        company:companies(name),
        source:sources(name),
        score:scores(overall_score)
      `,
      { count: "exact" }
    )
    .order("discovered_at", { ascending: false })
    .limit(limit);

  if (q) {
    // Search by title (safe + simple for MVP). Company search can be added once we introduce stable joins/views.
    query = query.ilike("title", `%${q}%`);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const result = await query;

  if (result.error) {
    return { ok: false as const, error: result.error.message };
  }

  const rows = (result.data ?? []).map((r: any) => {
    const company = asOne<{ name?: string }>(r.company);
    const source = asOne<{ name?: string }>(r.source);
    const score = asOne<{ overall_score?: number }>(r.score);

    const overallScore =
      typeof score?.overall_score === "number" ? score.overall_score : null;

    return {
      id: String(r.id),
      title: String(r.title),
      external_url: String(r.external_url),
      status: String(r.status) as PublicJobStatus,
      discovered_at: String(r.discovered_at),
      companyName: company?.name ? String(company.name) : null,
      sourceName: source?.name ? String(source.name) : null,
      overallScore,
    } satisfies PublicJobRow;
  });

  const filtered =
    typeof minScore === "number"
      ? rows.filter((r) => (r.overallScore ?? -1) >= minScore)
      : rows;

  return {
    ok: true as const,
    total: result.count ?? null,
    jobs: filtered,
  };
}

