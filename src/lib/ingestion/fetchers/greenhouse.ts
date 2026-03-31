import "server-only";

// Greenhouse public jobs API — no auth token required for public boards
// URL: https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true

export interface GreenhouseJob {
  id: number;
  title: string;
  updated_at: string; // ISO 8601
  absolute_url: string;
  location: { name: string };
  content?: string; // HTML job description (only when ?content=true)
  departments?: { name: string }[];
  offices?: { name: string }[];
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

export async function fetchGreenhouseJobs(
  boardToken: string
): Promise<GreenhouseJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs?content=true`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Greenhouse fetch failed for board "${boardToken}": ${res.status} ${res.statusText}`
    );
  }

  const data: GreenhouseResponse = await res.json();
  return data.jobs ?? [];
}
