import type { ScoringWeights } from "@/lib/types/scoring.types";

export const WEIGHTS: ScoringWeights = {
  founding: 0.3,
  builder: 0.25,
  gtmFit: 0.25,
  noisePenalty: 0.1,
  prestigeTrapPenalty: 0.1,
};

export const FOUNDING_KEYWORDS = {
  titleStrong: ["founding", "founder"],
  titleFirst: ["first", "head of"],
  descriptionSignals: [
    "0 to 1",
    "0-to-1",
    "zero to one",
    "greenfield",
    "build from scratch",
    "from the ground up",
    "ground floor",
    "first hire",
    "founding team",
    "define and execute",
    "own the full funnel",
    "building the function",
  ],
  negativeTeam: [
    "reports to the vp",
    "reports to the director",
    "support the vp",
    "support the head",
    "assist the director",
    "large team",
    "established team",
    "join a team of 50",
  ],
  earlyStageIndicators: ["seed", "series a", "series-a", "pre-seed", "angel"],
  smallTeamPatterns: [
    /team of (\d{1,2})\b/i,
    /employee #?(\d{1,2})\b/i,
    /(\d{1,2})[- ]person team/i,
    /fewer than (\d{1,2}) (people|employees)/i,
  ],
};

export const BUILDER_KEYWORDS = {
  systems: [
    "build systems",
    "building systems",
    "design systems",
    "build the",
    "build our",
    "architect",
    "infrastructure",
    "tech stack",
    "attribution system",
    "tooling",
  ],
  technical: [
    "sql",
    "api",
    "apis",
    "automation",
    "python",
    "javascript",
    "data pipeline",
    "etl",
    "crm integration",
    "webhook",
  ],
  experimentation: [
    "experiment",
    "a/b test",
    "testing framework",
    "hypothesis",
    "iterate",
    "test and learn",
  ],
  crossFunctional: [
    "cross-functional",
    "cross functional",
    "work across",
    "product, engineering",
    "engineering, sales",
    "collaborate with product",
  ],
  dataOwnership: [
    "analytics stack",
    "define kpis",
    "metrics",
    "data-driven",
    "own our analytics",
    "reporting infrastructure",
    "dashboards",
  ],
  automationWorkflow: [
    "automate",
    "workflow",
    "sequences",
    "orchestration",
    "ops automation",
  ],
  negative: [
    "execute the existing playbook",
    "follow established",
    "manage a team of",
    "manage the team",
    "people management",
    "content writing",
    "copywriting only",
  ],
};

export const GTM_FIT_KEYWORDS = {
  targetTitles: [
    "gtm engineer",
    "growth engineer",
    "revops",
    "revenue operations",
    "marketing ops",
    "demand gen",
    "growth lead",
    "head of growth",
    "gtm lead",
    "vp gtm",
    "founding gtm",
  ],
  gtmMotions: [
    "plg",
    "product-led",
    "product led",
    "sales-assisted",
    "demand gen",
    "demand generation",
    "inbound",
    "outbound",
    "account-based",
    "abm",
  ],
  revenueMetrics: [
    "pipeline",
    "revenue",
    "conversion",
    "arr",
    "mrr",
    "quota",
    "bookings",
    "win rate",
    "sales cycle",
  ],
  gtmStrategy: [
    "gtm strategy",
    "go-to-market",
    "go to market",
    "market entry",
    "positioning",
    "competitive analysis",
    "ideal customer profile",
    "icp",
  ],
  b2bSaas: ["b2b saas", "b2b", "saas", "enterprise software", "vertical saas"],
  gtmTools: [
    "hubspot",
    "salesforce",
    "segment",
    "amplitude",
    "mixpanel",
    "marketo",
    "outreach",
    "salesloft",
    "gong",
    "clearbit",
    "6sense",
    "zoominfo",
  ],
  negative: [
    "brand marketing",
    "brand manager",
    "creative director",
    "product manager",
    "product management",
    "ux researcher",
    "ui designer",
  ],
};

export const NOISE_KEYWORDS = {
  agency: [
    "our client",
    "on behalf of",
    "staffing",
    "recruiting agency",
    "talent partner",
    "contract staffing",
  ],
  staleThresholdDays: 60,
};

export const PRESTIGE_TRAP_KEYWORDS = {
  bigTech: [
    "google",
    "meta",
    "amazon",
    "apple",
    "microsoft",
    "netflix",
    "salesforce",
    "oracle",
    "ibm",
    "adobe",
    "uber",
    "airbnb",
    "stripe",
    "spotify",
  ],
  processHeavy: [
    "follow established frameworks",
    "quarterly planning",
    "annual planning",
    "governance",
    "compliance",
    "standard operating procedures",
    "sop",
  ],
  narrowScope: [
    "manage email channel",
    "own one segment",
    "single region",
    "north america only",
    "apac only",
    "emea only",
  ],
  noOwnership: [
    "support the team",
    "assist with",
    "help the team",
    "coordinate with",
    "liaise between",
  ],
};

export const SCORE_BANDS = {
  hot: { min: 80, max: 100, label: "Hot" },
  warm: { min: 60, max: 79, label: "Warm" },
  cool: { min: 40, max: 59, label: "Cool" },
  cold: { min: 20, max: 39, label: "Cold" },
  noise: { min: 0, max: 19, label: "Noise" },
} as const;

export type ScoreBand = keyof typeof SCORE_BANDS;

export function getScoreBand(score: number): ScoreBand {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "cool";
  if (score >= 20) return "cold";
  return "noise";
}
