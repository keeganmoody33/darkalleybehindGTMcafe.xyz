import "server-only";

// RemoteOK + Remotive JSON APIs with GTM keyword filter

export interface RssJob {
  id: string;
  title: string;
  url: string;
  company: string;
  postedAt: string;
  description: string;
  tags: string[];
  isRemote: boolean;
}

interface RemoteOKJob {
  id: string;
  position: string;
  company: string;
  url: string;
  date: string;
  description: string;
  tags: string[];
  remote: boolean;
}

export async function fetchRemoteOKJobs(
  keywords: string[]
): Promise<RssJob[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: {
      "User-Agent":
        "GTMSonarBot/1.0 (+https://darkalleybehindthegtmcafe.xyz)",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RemoteOK fetch failed: ${res.status}`);

  const raw: (RemoteOKJob | { legal: string })[] = await res.json();
  const jobs = raw.filter((j): j is RemoteOKJob => "position" in j);

  return jobs
    .filter((j) =>
      matchesKeywords(`${j.position} ${j.tags.join(" ")}`, keywords)
    )
    .map((j) => ({
      id: `remoteok:${j.id}`,
      title: j.position,
      url: j.url,
      company: j.company,
      postedAt: j.date,
      description: j.description ?? "",
      tags: j.tags ?? [],
      isRemote: true,
    }));
}

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  tags: string[];
  description: string;
  publication_date: string;
}
interface RemotiveResponse {
  jobs: RemotiveJob[];
}

const REMOTIVE_CATEGORIES = [
  "software-dev",
  "marketing",
  "business",
  "data",
] as const;

export async function fetchRemotiveJobs(
  keywords: string[]
): Promise<RssJob[]> {
  const results: RssJob[] = [];

  for (const cat of REMOTIVE_CATEGORIES) {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?category=${cat}&limit=100`,
      { cache: "no-store" }
    );
    if (!res.ok) continue;

    const data: RemotiveResponse = await res.json();
    const filtered = (data.jobs ?? []).filter((j) =>
      matchesKeywords(`${j.title} ${j.tags.join(" ")}`, keywords)
    );

    results.push(
      ...filtered.map((j) => ({
        id: `remotive:${j.id}`,
        title: j.title,
        url: j.url,
        company: j.company_name,
        postedAt: j.publication_date,
        description: j.description ?? "",
        tags: j.tags ?? [],
        isRemote: true,
      }))
    );
  }

  return results;
}

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}
