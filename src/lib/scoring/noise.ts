import type { DimensionScoreResult } from "@/lib/types/scoring.types";
import type { ScoreSignal } from "@/lib/types/database.types";
import type { NormalizedJob } from "@/lib/types/ingestion.types";
import { NOISE_KEYWORDS } from "@/lib/scoring/config";

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}

function daysSincePosted(postedAt: Date | null): number | null {
  if (!postedAt) return null;
  const now = new Date();
  const diffMs = now.getTime() - postedAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function scoreNoiseDimension(job: NormalizedJob): DimensionScoreResult {
  const signals: ScoreSignal[] = [];
  let score = 0;

  const desc = job.descriptionPlain.toLowerCase();

  if (hasAny(desc, NOISE_KEYWORDS.agency)) {
    score += 30;
    signals.push({ text: "Recruiting agency posting detected", impact: "+30" });
  }

  const wordCount = job.descriptionPlain.trim().split(/\s+/).length;
  if (wordCount < 100) {
    score += 20;
    signals.push({ text: `Suspiciously vague description (${wordCount} words)`, impact: "+20" });
  }

  const specificityMarkers = [
    "you will",
    "you'll",
    "responsibilities",
    "requirements",
    "qualifications",
    "experience with",
    "years of experience",
  ];
  if (!specificityMarkers.some((marker) => desc.includes(marker))) {
    score += 15;
    signals.push({ text: "Description lacks specifics — no responsibilities or requirements", impact: "+15" });
  }

  const age = daysSincePosted(job.postedAt);
  if (age !== null && age > NOISE_KEYWORDS.staleThresholdDays) {
    score += 15;
    signals.push({ text: `Stale posting (${age} days old)`, impact: "+15" });
  }

  if (!job.isRemote && job.location) {
    const loc = job.location.toLowerCase();
    const knownHubs = [
      "san francisco", "new york", "austin", "seattle", "boston",
      "los angeles", "chicago", "denver", "remote",
    ];
    if (!knownHubs.some((hub) => loc.includes(hub))) {
      score += 10;
      signals.push({ text: `Non-remote with uncommon location: ${job.location}`, impact: "+10" });
    }
  }

  score = Math.max(0, Math.min(100, score));

  const summary =
    score >= 40
      ? "High noise — likely low-quality or irrelevant posting"
      : score >= 20
        ? "Some noise signals — worth a closer look before investing time"
        : "Low noise — posting appears legitimate and specific";

  return { score, signals, summary };
}
