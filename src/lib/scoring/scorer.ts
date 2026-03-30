import { scoreBuilderDimension } from "@/lib/scoring/builder";
import { computeOverallScore } from "@/lib/scoring/composite";
import { scoreFoundingDimension } from "@/lib/scoring/founding";
import { scoreGtmFitDimension } from "@/lib/scoring/gtmFit";
import { scoreNoiseDimension } from "@/lib/scoring/noise";
import { scorePrestigeTrapDimension } from "@/lib/scoring/prestigeTrap";
import type { ScoreExplanation } from "@/lib/types/database.types";
import type { NormalizedJob } from "@/lib/types/ingestion.types";
import type { ScoreResult } from "@/lib/types/scoring.types";

export interface CompanyContext {
  inferredStage?: string | null;
  employeeCountRange?: string | null;
}

export function scoreJob(
  job: NormalizedJob,
  company?: CompanyContext,
): ScoreResult {
  const founding = scoreFoundingDimension(job, company);
  const builder = scoreBuilderDimension(job);
  const gtmFit = scoreGtmFitDimension(job);
  const noise = scoreNoiseDimension(job);
  const prestigeTrap = scorePrestigeTrapDimension(job);

  const overall = computeOverallScore({
    founding,
    builder,
    gtmFit,
    noise,
    prestigeTrap,
  });

  const explanation: ScoreExplanation = {
    founding: {
      score: founding.score,
      signals: founding.signals,
      summary: founding.summary,
    },
    builder: {
      score: builder.score,
      signals: builder.signals,
      summary: builder.summary,
    },
    gtm_fit: {
      score: gtmFit.score,
      signals: gtmFit.signals,
      summary: gtmFit.summary,
    },
    noise: {
      score: noise.score,
      signals: noise.signals,
      summary: noise.summary,
    },
    prestige_trap: {
      score: prestigeTrap.score,
      signals: prestigeTrap.signals,
      summary: prestigeTrap.summary,
    },
    overall: {
      score: overall.score,
      summary: overall.summary,
    },
  };

  return {
    foundingScore: founding.score,
    builderScore: builder.score,
    gtmFitScore: gtmFit.score,
    noisePenalty: noise.score,
    prestigeTrapPenalty: prestigeTrap.score,
    overallScore: overall.score,
    explanation,
  };
}
