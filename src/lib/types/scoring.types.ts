import type { ScoreExplanation, ScoreSignal } from "./database.types";

export interface DimensionScoreResult {
  score: number;
  signals: ScoreSignal[];
  summary: string;
}

export interface ScoreResult {
  foundingScore: number;
  builderScore: number;
  gtmFitScore: number;
  noisePenalty: number;
  prestigeTrapPenalty: number;
  overallScore: number;
  explanation: ScoreExplanation;
}

export interface ScoringWeights {
  founding: number;
  builder: number;
  gtmFit: number;
  noisePenalty: number;
  prestigeTrapPenalty: number;
}
