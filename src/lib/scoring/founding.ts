import type { DimensionScoreResult } from "@/lib/types/scoring.types";
import type { ScoreSignal } from "@/lib/types/database.types";
import type { NormalizedJob } from "@/lib/types/ingestion.types";
import { FOUNDING_KEYWORDS } from "@/lib/scoring/config";

interface CompanyContext {
  inferredStage?: string | null;
  employeeCountRange?: string | null;
}

export function scoreFoundingDimension(
  job: NormalizedJob,
  company?: CompanyContext,
): DimensionScoreResult {
  let score = 0;
  const signals: ScoreSignal[] = [];

  const titleLower = job.title.toLowerCase();
  const descLower = job.descriptionPlain.toLowerCase();
  const stage = company?.inferredStage?.toLowerCase() ?? null;

  if (FOUNDING_KEYWORDS.titleStrong.some((kw) => titleLower.includes(kw))) {
    score += 30;
    signals.push({ text: "Title contains founding keyword", impact: "+30" });
  }

  if (FOUNDING_KEYWORDS.titleFirst.some((kw) => titleLower.includes(kw))) {
    const atEarlyStage =
      stage !== null &&
      FOUNDING_KEYWORDS.earlyStageIndicators.some((ind) => stage.includes(ind));

    if (atEarlyStage) {
      score += 20;
      signals.push({
        text: 'Title signals "first" or "head of" at early-stage company',
        impact: "+20",
      });
    }
  }

  if (FOUNDING_KEYWORDS.descriptionSignals.some((kw) => descLower.includes(kw))) {
    score += 20;
    signals.push({
      text: "Description mentions 0→1, greenfield, or build-from-scratch language",
      impact: "+20",
    });
  }

  if (
    stage !== null &&
    FOUNDING_KEYWORDS.earlyStageIndicators.some((ind) => stage.includes(ind))
  ) {
    score += 15;
    signals.push({ text: "Company is seed or Series A stage", impact: "+15" });
  }

  const smallTeamMatch = FOUNDING_KEYWORDS.smallTeamPatterns.some((pattern) =>
    pattern.test(job.descriptionPlain),
  );
  if (smallTeamMatch) {
    score += 10;
    signals.push({ text: "Small team size mentioned in description", impact: "+10" });
  }

  const ownershipSignals = ["strategy and execution", "own the strategy", "define and execute"];
  if (ownershipSignals.some((kw) => descLower.includes(kw))) {
    score += 5;
    signals.push({
      text: "Description mentions strategy + execution ownership",
      impact: "+5",
    });
  }

  const negativeTeamLarge = [
    "reports to the vp",
    "reports to the director",
    "large team",
    "established team",
    "join a team of 50",
  ];
  if (negativeTeamLarge.some((kw) => descLower.includes(kw))) {
    score -= 15;
    signals.push({ text: "Reports into a large or established team", impact: "-15" });
  }

  const negativeSupportVp = [
    "support the vp",
    "support the head",
    "assist the director",
  ];
  if (negativeSupportVp.some((kw) => descLower.includes(kw))) {
    score -= 20;
    signals.push({ text: '"Support the VP" language detected', impact: "-20" });
  }

  const lateStages = ["series-c", "series c", "series-d", "series d", "growth", "public"];
  const isLateStage =
    stage !== null && lateStages.some((ls) => stage.includes(ls));
  const hasEstablishedGtm = [
    "established gtm",
    "existing go-to-market",
    "mature sales",
  ].some((kw) => descLower.includes(kw));

  if (isLateStage && hasEstablishedGtm) {
    score -= 10;
    signals.push({
      text: "Late-stage company with established GTM motion",
      impact: "-10",
    });
  }

  score = Math.max(0, Math.min(100, score));

  let summary: string;
  if (score >= 70) {
    summary = "Strong founding signal — true 0→1 role at an early-stage company.";
  } else if (score >= 40) {
    summary = "Moderate founding indicators — some early-stage traits but not a clear founding role.";
  } else {
    summary = "Low founding indicators — appears to be a role within an established team.";
  }

  return { score, signals, summary };
}
