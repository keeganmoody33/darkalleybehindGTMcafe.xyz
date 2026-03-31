import "server-only";

import { createHash } from "node:crypto";

// RemoteOK + Remotive JSON APIs + optional generic RSS/Atom XML feeds (GTM keyword filter)

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

function stripInnerTags(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractCdataOrText(inner: string): string {
  const c = inner.match(/<!\[CDATA\[([\s\S]*?)\]\]>/i);
  if (c) return stripInnerTags(c[1] ?? "").trim();
  return stripInnerTags(inner).trim();
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(
    `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
    "i",
  );
  const m = block.match(re);
  if (!m) return "";
  return extractCdataOrText(m[1] ?? "");
}

function extractLink(block: string): string {
  const href = block.match(/<link[^>]+href=["']([^"']+)["']/i);
  if (href?.[1]) return href[1].trim();
  const t = extractTag(block, "link");
  return t.trim();
}

interface ParsedFeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function parseFeedItems(xml: string): ParsedFeedItem[] {
  const out: ParsedFeedItem[] = [];
  const itemRe = /<item[\s>][\s\S]*?<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[0];
    const title = extractTag(block, "title");
    const link =
      extractLink(block) || extractTag(block, "guid") || extractTag(block, "id");
    const pubDate =
      extractTag(block, "pubDate") ||
      extractTag(block, "dc:date") ||
      extractTag(block, "pubdate") ||
      "";
    const description =
      extractTag(block, "description") ||
      extractTag(block, "content:encoded") ||
      extractTag(block, "summary") ||
      "";
    if (title && link) {
      out.push({ title, link, pubDate, description });
    }
  }
  if (out.length > 0) return out;

  const entryRe = /<entry[\s>][\s\S]*?<\/entry>/gi;
  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[0];
    const title = extractTag(block, "title");
    const link = extractLink(block) || extractTag(block, "id");
    const pubDate =
      extractTag(block, "updated") || extractTag(block, "published") || "";
    const description =
      extractTag(block, "summary") || extractTag(block, "content") || "";
    if (title && link) {
      out.push({ title, link, pubDate, description });
    }
  }
  return out;
}

function stableFeedItemId(feedUrl: string, link: string): string {
  return createHash("sha256")
    .update(`${feedUrl}\0${link}`, "utf8")
    .digest("hex")
    .slice(0, 32);
}

const RSS_FETCH_HEADERS = {
  Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  "User-Agent":
    "GTMSonarBot/1.0 (+https://darkalleybehindthegtmcafe.xyz)",
};

/**
 * Fetch any RSS 2.0 or Atom feed; keep items whose title/description match keywords.
 * `defaultCompany` is used when the feed does not encode a company per item.
 */
export async function fetchRssFeedJobs(
  feedUrl: string,
  keywords: string[],
  defaultCompany: string,
): Promise<RssJob[]> {
  const res = await fetch(feedUrl, {
    headers: RSS_FETCH_HEADERS,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`RSS feed fetch failed (${res.status}): ${feedUrl}`);
  }
  const xml = await res.text();
  const items = parseFeedItems(xml);
  const company = defaultCompany.trim() || "RSS feed";

  return items
    .filter((i) =>
      matchesKeywords(`${i.title} ${i.description}`, keywords),
    )
    .map((i) => ({
      id: `rssfeed:${stableFeedItemId(feedUrl, i.link)}`,
      title: i.title,
      url: i.link,
      company,
      postedAt: i.pubDate.trim() || new Date().toISOString(),
      description: i.description,
      tags: [] as string[],
      isRemote: /remote/i.test(`${i.title} ${i.description}`),
    }));
}
