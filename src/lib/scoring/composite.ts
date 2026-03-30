import { WEIGHTS } from "@/lib/scoring/config";
import type { DimensionScoreResult } from "@/lib/types/scoring.types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export interface CompositeInput {
  founding: DimensionScoreResult;
  builder: DimensionScoreResult;
  gtmFit: DimensionScoreResult;
  noise: DimensionScoreResult;
  prestigeTrap: DimensionScoreResult;
}

export function computeOverallScore(input: CompositeInput): {
  score: number;
  summary: string;
} {
  const raw =
    input.founding.score * WEIGHTS.founding +
    input.builder.score * WEIGHTS.builder +
    input.gtmFit.score * WEIGHTS.gtmFit -
    input.noise.score * WEIGHTS.noisePenalty -
    input.prestigeTrap.score * WEIGHTS.prestigeTrapPenalty;

  const score = clamp(raw);

  let summary: string;
  if (score >= 80) {
    summary = "High-fit founding GTM role. Early stage, builder-oriented, strong GTM alignment.";
  } else if (score >= 60) {
    summary = "Solid match — good GTM and builder signals with moderate founding indicators.";
  } else if (score >= 40) {
    summary = "Mixed signals — some GTM relevance but weaker founding or builder fit.";
  } else if (score >= 20) {
    summary = "Low fit — limited founding, builder, or GTM alignment.";
  } else {
    summary = "Poor fit — likely noise, prestige trap, or off-target role.";
  }

  return { score, summary };
}
