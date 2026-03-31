import "server-only";

// Ashby public job board API
// URL: https://api.ashbyhq.com/posting-api/job-board/{orgId}?includeCompensation=true

export interface AshbyJob {
  id: string;
  title: string;
  publishedAt: string; // ISO 8601
  jobUrl: string;
  isRemote: boolean;
  location?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  department?: string;
  team?: string;
  employmentType?: string;
}

interface AshbyResponse {
  jobs: AshbyJob[];
  jobBoard?: {
    name: string;
  };
}

export async function fetchAshbyJobs(orgId: string): Promise<AshbyJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(orgId)}?includeCompensation=true`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Ashby fetch failed for org "${orgId}": ${res.status} ${res.statusText}`
    );
  }

  const data: AshbyResponse = await res.json();
  return data.jobs ?? [];
}
