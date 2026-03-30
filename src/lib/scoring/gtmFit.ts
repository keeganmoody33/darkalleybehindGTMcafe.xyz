import type { DimensionScoreResult } from "@/lib/types/scoring.types";
import type { ScoreSignal } from "@/lib/types/database.types";
import type { NormalizedJob } from "@/lib/types/ingestion.types";
import { GTM_FIT_KEYWORDS } from "@/lib/scoring/config";

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}

export function scoreGtmFitDimension(job: NormalizedJob): DimensionScoreResult {
  const signals: ScoreSignal[] = [];
  let score = 0;

  const title = job.title.toLowerCase();
  const desc = job.descriptionPlain.toLowerCase();
  const fullText = `${title} ${desc}`;

  if (hasAny(title, GTM_FIT_KEYWORDS.targetTitles)) {
    score += 30;
    signals.push({ text: "Title matches target GTM role family", impact: "+30" });
  }

  if (hasAny(desc, GTM_FIT_KEYWORDS.gtmMotions)) {
    score += 20;
    signals.push({ text: "Description mentions GTM motions (PLG, ABM, demand gen)", impact: "+20" });
  }

  if (hasAny(desc, GTM_FIT_KEYWORDS.revenueMetrics)) {
    score += 15;
    signals.push({ text: "Mentions revenue/pipeline metrics", impact: "+15" });
  }

  if (hasAny(fullText, GTM_FIT_KEYWORDS.gtmStrategy)) {
    score += 15;
    signals.push({ text: "Mentions go-to-market strategy", impact: "+15" });
  }

  if (hasAny(fullText, GTM_FIT_KEYWORDS.b2bSaas)) {
    score += 10;
    signals.push({ text: "B2B SaaS context detected", impact: "+10" });
  }

  if (hasAny(desc, GTM_FIT_KEYWORDS.gtmTools)) {
    score += 10;
    signals.push({ text: "Mentions specific GTM tools", impact: "+10" });
  }

  const negatives = GTM_FIT_KEYWORDS.negative;
  const brandKeywords = negatives.filter((kw) =>
    ["brand marketing", "brand manager", "creative director"].includes(kw)
  );
  const pmKeywords = negatives.filter((kw) =>
    ["product manager", "product management"].includes(kw)
  );
  const designKeywords = negatives.filter((kw) =>
    ["ux researcher", "ui designer"].includes(kw)
  );

  if (hasAny(fullText, brandKeywords)) {
    score -= 20;
    signals.push({ text: "Pure brand marketing role", impact: "-20" });
  }

  if (hasAny(fullText, pmKeywords)) {
    score -= 15;
    signals.push({ text: "Pure product management role", impact: "-15" });
  }

  if (hasAny(fullText, designKeywords)) {
    score -= 10;
    signals.push({ text: "Non-GTM design/research role", impact: "-10" });
  }

  score = Math.max(0, Math.min(100, score));

  const summary =
    score >= 60
      ? "Strong GTM fit — role aligns with core go-to-market functions"
      : score >= 30
        ? "Moderate GTM fit — some relevant signals but not a core GTM role"
        : "Weak GTM fit — few or no go-to-market indicators";

  return { score, signals, summary };
}
