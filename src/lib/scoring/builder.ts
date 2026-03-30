import type { DimensionScoreResult } from "@/lib/types/scoring.types";
import type { ScoreSignal } from "@/lib/types/database.types";
import type { NormalizedJob } from "@/lib/types/ingestion.types";
import { BUILDER_KEYWORDS } from "@/lib/scoring/config";

export function scoreBuilderDimension(job: NormalizedJob): DimensionScoreResult {
  let score = 0;
  const signals: ScoreSignal[] = [];

  const descLower = job.descriptionPlain.toLowerCase();

  if (BUILDER_KEYWORDS.systems.some((kw) => descLower.includes(kw))) {
    score += 25;
    signals.push({
      text: "Mentions building systems, tools, or processes",
      impact: "+25",
    });
  }

  if (BUILDER_KEYWORDS.technical.some((kw) => descLower.includes(kw))) {
    score += 20;
    signals.push({
      text: "Mentions technical skills (SQL, APIs, automation)",
      impact: "+20",
    });
  }

  if (BUILDER_KEYWORDS.experimentation.some((kw) => descLower.includes(kw))) {
    score += 15;
    signals.push({
      text: "Mentions experimentation or testing frameworks",
      impact: "+15",
    });
  }

  if (BUILDER_KEYWORDS.crossFunctional.some((kw) => descLower.includes(kw))) {
    score += 15;
    signals.push({ text: "Mentions cross-functional ownership", impact: "+15" });
  }

  if (BUILDER_KEYWORDS.dataOwnership.some((kw) => descLower.includes(kw))) {
    score += 15;
    signals.push({ text: "Mentions data/analytics ownership", impact: "+15" });
  }

  if (BUILDER_KEYWORDS.automationWorkflow.some((kw) => descLower.includes(kw))) {
    score += 10;
    signals.push({ text: "Mentions automation or workflow design", impact: "+10" });
  }

  const negExecutePlaybook = ["execute the existing playbook", "follow established"];
  if (negExecutePlaybook.some((kw) => descLower.includes(kw))) {
    score -= 20;
    signals.push({
      text: '"Execute existing playbook" or "follow established" language',
      impact: "-20",
    });
  }

  const negManageLargeTeam = ["manage a team of", "manage the team", "people management"];
  if (negManageLargeTeam.some((kw) => descLower.includes(kw))) {
    score -= 15;
    signals.push({
      text: "Heavy people-management focus rather than building",
      impact: "-15",
    });
  }

  const negContentOnly = ["content writing", "copywriting only"];
  if (negContentOnly.some((kw) => descLower.includes(kw))) {
    score -= 10;
    signals.push({
      text: "Heavy emphasis on content writing only",
      impact: "-10",
    });
  }

  score = Math.max(0, Math.min(100, score));

  let summary: string;
  if (score >= 70) {
    summary = "Strong builder profile — hands-on systems thinker with technical depth.";
  } else if (score >= 40) {
    summary = "Moderate builder signals — some systems work but not a core builder role.";
  } else {
    summary = "Low builder indicators — role leans toward execution of existing playbooks.";
  }

  return { score, signals, summary };
}
