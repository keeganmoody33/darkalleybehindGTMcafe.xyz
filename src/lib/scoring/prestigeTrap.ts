import type { DimensionScoreResult } from "@/lib/types/scoring.types";
import type { ScoreSignal } from "@/lib/types/database.types";
import type { NormalizedJob } from "@/lib/types/ingestion.types";
import { PRESTIGE_TRAP_KEYWORDS } from "@/lib/scoring/config";

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}

const SENIOR_TITLE_MARKERS = ["head of", "vp", "vice president", "director", "founding", "chief"];
const MID_LEVEL_TITLE_MARKERS = ["manager", "coordinator", "specialist", "analyst"];

function isBigTechCompany(companyName: string): boolean {
  const name = companyName.toLowerCase();
  return PRESTIGE_TRAP_KEYWORDS.bigTech.some((co) => name.includes(co));
}

function isMidLevelTitle(title: string): boolean {
  const t = title.toLowerCase();
  if (SENIOR_TITLE_MARKERS.some((marker) => t.includes(marker))) return false;
  return MID_LEVEL_TITLE_MARKERS.some((marker) => t.includes(marker));
}

export function scorePrestigeTrapDimension(job: NormalizedJob): DimensionScoreResult {
  const signals: ScoreSignal[] = [];
  let score = 0;

  const desc = job.descriptionPlain.toLowerCase();
  const bigTech = isBigTechCompany(job.companyName);

  if (bigTech && isMidLevelTitle(job.title)) {
    score += 25;
    signals.push({ text: `BigTech (${job.companyName}) with mid-level title`, impact: "+25" });
  }

  if (hasAny(desc, PRESTIGE_TRAP_KEYWORDS.narrowScope)) {
    score += 20;
    signals.push({ text: "Large team with narrow scope indicated", impact: "+20" });
  }

  if (hasAny(desc, PRESTIGE_TRAP_KEYWORDS.processHeavy)) {
    score += 15;
    signals.push({ text: "Heavy process/compliance language", impact: "+15" });
  }

  const ownershipTerms = ["build", "own", "ownership", "autonomy", "end-to-end"];
  if (hasAny(desc, PRESTIGE_TRAP_KEYWORDS.noOwnership) && !ownershipTerms.some((t) => desc.includes(t))) {
    score += 15;
    signals.push({ text: "No mention of building or ownership", impact: "+15" });
  }

  const matureGtmIndicators = ["series d", "series e", "series f", "ipo", "public company", "post-ipo"];
  const matureOrgMarkers = ["established gtm", "mature marketing", "scaled team", "global team"];
  if (hasAny(desc, matureGtmIndicators) && hasAny(desc, matureOrgMarkers)) {
    score += 15;
    signals.push({ text: "Late-stage company with mature GTM org", impact: "+15" });
  } else if (hasAny(desc, matureGtmIndicators)) {
    score += 10;
    signals.push({ text: "Late-stage funding signal (Series D+)", impact: "+10" });
  }

  score = Math.max(0, Math.min(100, score));

  const summary =
    score >= 40
      ? "High prestige trap risk — likely a cog-in-machine role at a big name"
      : score >= 20
        ? "Moderate prestige trap signals — check for real ownership"
        : "Low prestige trap risk — role appears to offer meaningful scope";

  return { score, signals, summary };
}
