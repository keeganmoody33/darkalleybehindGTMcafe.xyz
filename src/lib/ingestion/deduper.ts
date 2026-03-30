import type { SourceType } from "@/lib/types/database.types";

/** Per docs/BACKEND_STRUCTURE.md — same role across sources is a distinct row (source_type differs). */
export function buildDedupeKey(
  title: string,
  companyName: string,
  sourceType: SourceType
): string {
  const t = title.trim().toLowerCase();
  const c = companyName.trim().toLowerCase();
  return `${t}::${c}::${sourceType}`;
}
