import type { SourceType } from "@/lib/types/database.types";
import type { LeverPosting, NormalizedJob } from "@/lib/types/ingestion.types";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugToDisplayName(slug: string): string {
  return slug
    .split(/[-_]+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function joinLocation(parts: string[]): string | null {
  const s = parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(", ");
  return s.length ? s : null;
}

function guessRemote(posting: LeverPosting, location: string | null): boolean {
  const hay = [
    location,
    posting.categories?.location,
    ...(posting.categories?.allLocations ?? []),
    ...(posting.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return hay.includes("remote");
}

function normalizeEmploymentType(
  raw: string | null | undefined
): "full-time" | "contract" | "part-time" | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (s.includes("full") && s.includes("time")) return "full-time";
  if (s.includes("part") && s.includes("time")) return "part-time";
  if (s.includes("contract")) return "contract";
  return null;
}

function buildDescriptionRaw(posting: LeverPosting): string {
  const chunks: string[] = [];
  if (posting.description) chunks.push(posting.description);
  if (posting.content?.descriptionHtml) {
    chunks.push(posting.content.descriptionHtml);
  }
  if (posting.content?.description) chunks.push(posting.content.description);
  if (posting.content?.lists?.length) {
    for (const li of posting.content.lists) {
      if (li.content) chunks.push(li.content);
    }
  }
  if (posting.lists?.length) {
    for (const li of posting.lists) {
      if (li.content) chunks.push(li.content);
    }
  }
  if (posting.additional) chunks.push(posting.additional);
  return chunks.join("\n\n").trim();
}

export function normalizeLeverPosting(
  posting: LeverPosting,
  input: {
    companyDisplayName: string;
    companySlug: string;
    sourceType: SourceType;
  }
): NormalizedJob {
  const companyName =
    input.companyDisplayName.trim() ||
    slugToDisplayName(input.companySlug);

  const location = joinLocation([
    posting.categories?.location ?? "",
    ...(posting.categories?.allLocations ?? []),
  ]);

  const externalUrl =
    posting.urls?.apply ??
    posting.urls?.show ??
    posting.hostedUrl ??
    "";

  const raw = buildDescriptionRaw(posting);
  const plain =
    posting.descriptionPlain?.trim() ||
    posting.additionalPlain?.trim() ||
    stripHtml(raw);

  const commitment = posting.categories?.commitment;

  return {
    externalId: posting.id,
    externalUrl,
    title: posting.text.trim(),
    descriptionRaw: raw.length ? raw : posting.descriptionPlain ?? "",
    descriptionPlain: plain,
    companyName,
    location,
    isRemote: guessRemote(posting, location),
    department: posting.categories?.department?.trim() ?? null,
    employmentType: normalizeEmploymentType(commitment),
    postedAt: Number.isFinite(posting.createdAt)
      ? new Date(posting.createdAt)
      : null,
    sourceType: input.sourceType,
  };
}

export { slugToDisplayName };
