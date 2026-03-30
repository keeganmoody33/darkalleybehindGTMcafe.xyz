# GTM Sonar OS — Scoring Logic

## Purpose

Every job is scored across five dimensions. The scoring engine produces both a numeric score (0–100 per dimension) and a human-readable explanation for each. The goal is to help the user decide quickly whether a role is worth pursuing — not just whether it matches keywords.

## Dimensions

### 1. Founding Score (0–100)

**What it measures**: How likely this is a true founding/first-hire GTM role with real 0→1 ownership.

| Signal | Weight | Examples |
|---|---|---|
| Title contains "founding" | +30 | Founding GTM Engineer, Founding Growth |
| Title contains "first" or "head of" at early stage | +20 | First marketing hire, Head of Growth (seed) |
| Description mentions 0→1, greenfield, build from scratch | +20 | "Build our GTM motion from the ground up" |
| Company stage is seed or series A | +15 | Inferred from employee count, funding data |
| Small team size mentioned | +10 | "Join a team of 5", "employee #10-20" |
| Description mentions strategy + execution ownership | +5 | "Own the full funnel", "define and execute" |

**Negative signals** (reduce score):
- Role reports into large existing team → -15
- "Support the VP of Marketing" language → -20
- Company is series C+ with established GTM team → -10

### 2. Builder Score (0–100)

**What it measures**: How much this role requires building systems, processes, and infrastructure vs. operating existing playbooks.

| Signal | Weight | Examples |
|---|---|---|
| Mentions building systems/tools/processes | +25 | "Build our attribution system", "design the sales tech stack" |
| Mentions technical skills (SQL, APIs, automation) | +20 | "Comfortable with SQL", "integrate with our API" |
| Mentions experimentation / testing frameworks | +15 | "Design and run experiments", "A/B testing" |
| Mentions cross-functional ownership | +15 | "Work across product, engineering, and sales" |
| Mentions data/analytics ownership | +15 | "Own our analytics stack", "define KPIs" |
| Mentions automation / workflow design | +10 | "Automate outbound sequences", "build workflows" |

**Negative signals**:
- "Execute the existing playbook" → -20
- "Manage a team of 10 SDRs" → -15 (people management, not building)
- Heavy emphasis on content writing only → -10

### 3. GTM Fit Score (0–100)

**What it measures**: How well the role aligns with a GTM engineer / growth engineer profile specifically.

| Signal | Weight | Examples |
|---|---|---|
| Title is in the target title family | +30 | GTM Engineer, Growth Engineer, RevOps |
| Description mentions GTM motions | +20 | "PLG", "product-led", "sales-assisted", "demand gen" |
| Mentions revenue/pipeline metrics | +15 | "Drive pipeline", "revenue targets", "conversion" |
| Mentions go-to-market strategy | +15 | "GTM strategy", "market entry", "positioning" |
| B2B SaaS context | +10 | "B2B SaaS", "enterprise software" |
| Mentions specific GTM tools | +10 | HubSpot, Salesforce, Segment, Amplitude, etc. |

**Negative signals**:
- Pure brand marketing role → -20
- Pure product management (no GTM) → -15
- Non-tech industry (unless description is strong) → -10

### 4. Noise Penalty (0–100)

**What it measures**: How likely this posting is junk, spam, misclassified, or irrelevant. Higher = worse.

| Signal | Weight | Examples |
|---|---|---|
| Recruiting agency posting | +30 | "Our client is looking for..." |
| Suspiciously vague description | +20 | < 100 words, no specifics |
| Salary listed as "$0" or unrealistic range | +15 | |
| Duplicate company posting different titles | +10 | Same company, 5 similar roles |
| Location mismatch (non-remote, wrong geo) | +10 | |
| Stale posting (> 60 days old) | +15 | |

### 5. Prestige-Trap Penalty (0–100)

**What it measures**: How likely this role looks impressive but offers limited ownership, growth, or builder opportunity. Higher = worse.

| Signal | Weight | Examples |
|---|---|---|
| FAANG/BigTech company + mid-level title | +25 | "Marketing Manager at Google" |
| Large team, narrow scope | +20 | "Manage email channel for North America" |
| Heavy process/compliance language | +15 | "Follow established frameworks", "quarterly planning cycles" |
| No mention of building or ownership | +15 | |
| Title inflation (VP at 500+ person company) | +10 | |
| Series D+ with mature GTM org | +15 | |

## Overall Score Calculation

```
overall = (
  (founding_score × 0.30) +
  (builder_score × 0.25) +
  (gtm_fit_score × 0.25) -
  (noise_penalty × 0.10) -
  (prestige_trap_penalty × 0.10)
)
```

Clamped to 0–100.

## Explanation Format

Each dimension produces a structured explanation stored as JSONB:

```json
{
  "founding": {
    "score": 85,
    "signals": [
      { "text": "Title contains 'founding'", "impact": "+30" },
      { "text": "Company appears to be seed stage (12 employees)", "impact": "+15" },
      { "text": "Description mentions building from scratch", "impact": "+20" }
    ],
    "summary": "Strong founding signal — true 0→1 role at an early-stage company."
  },
  "builder": { ... },
  "gtm_fit": { ... },
  "noise": { ... },
  "prestige_trap": { ... },
  "overall": {
    "score": 78,
    "summary": "High-fit founding GTM role. Early stage, builder-oriented, strong GTM alignment."
  }
}
```

## Scoring Implementation Notes

- All scoring functions must be **pure functions** (input → output, no side effects).
- All scoring functions must be independently **testable** with fixture data.
- Weights are constants defined in a single config file, not scattered across scoring modules.
- The explanation text must be human-readable — written for decision-making, not debugging.
- v1 scoring is rule-based (keyword matching + heuristics). AI-assisted scoring is a v2 consideration.
