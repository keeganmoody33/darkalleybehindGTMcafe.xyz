import "server-only";

import type { LeverPosting } from "@/lib/types/ingestion.types";

/** Matches `sources.config` for Lever (`company_slug` in DB seed; `company` supported as alias). */
export interface LeverSourceConfig {
  company_slug?: string;
  company?: string;
}

export class LeverFetchError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "LeverFetchError";
  }
}

export async function fetchLeverPostings(config: LeverSourceConfig): Promise<{
  ok: true;
  postings: LeverPosting[];
} | {
  ok: false;
  error: string;
}> {
  const company = (config.company_slug ?? config.company ?? "").trim();
  if (!company) {
    return {
      ok: false,
      error: "Lever config missing `company_slug` (or `company`) slug.",
    };
  }

  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(company)}?mode=json`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      // Keep this conservative; if Lever is slow, we'll retry at a higher layer later.
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, error: `Lever fetch failed: ${res.status} ${res.statusText}` };
    }

    const json = (await res.json()) as unknown;

    if (!Array.isArray(json)) {
      return { ok: false, error: "Lever fetch returned unexpected payload (expected array)." };
    }

    return { ok: true, postings: json as LeverPosting[] };
  } catch (err) {
    return { ok: false, error: new LeverFetchError("Lever fetch threw.", err).message };
  }
}

