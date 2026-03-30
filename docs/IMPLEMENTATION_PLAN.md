# GTM Sonar OS — Implementation Plan

## Guiding Principle

Build the tactical brain before the pretty radar face. Get ingestion, scoring, and a usable table working before touching SVG sweep lines.

---

## Phase 0 — Project Foundation (COMPLETE)

**Goal**: Initialize repo structure, create canonical docs, lock v1 scope.

**Steps**:
1. Create `/docs` with all canonical documents.
2. Create `.cursor/rules/` with operating guardrails.
3. Create `progress.txt` and `lessons.md` logging templates.
4. Create `README.md`.
5. Resolve v1 unknowns and encode decisions in docs.

**Acceptance criteria**:
- [x] All docs listed in discovery.txt exist with substantive content.
- [x] Rules exist and match guardrails from discovery.txt.
- [x] Progress logging works (progress.txt populated).
- [x] v1 scope is written down in PRD.md.

---

## Phase 1 — Project Scaffold + Data Model

**Goal**: Stand up the Next.js project, connect Supabase, apply the schema, and verify the data model works end-to-end.

**Steps**:

### 1.1 Initialize Next.js project
- `npx create-next-app@latest` with App Router, TypeScript, Tailwind CSS, ESLint.
- Configure `src/` directory structure per BACKEND_STRUCTURE.md and FRONTEND_GUIDELINES.md.
- Install and initialize shadcn/ui (`npx shadcn@latest init`).
- Configure dark mode as default.
- Add Geist font via `next/font`.

### 1.2 Initialize Supabase
- Install `@supabase/supabase-js`.
- Create Supabase project (or configure local dev stack).
- Create `src/lib/db/supabase.ts` client singleton.
- Add `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (gitignored).

### 1.3 Apply database schema
- Write SQL migration for all tables defined in BACKEND_STRUCTURE.md:
  `companies`, `sources`, `scans`, `jobs`, `scores`, `notes`, `status_history`.
- Apply indexes.
- Seed one test source and one test company.

### 1.4 Define TypeScript types
- Create `src/lib/types/` with interfaces for all entities: `Job`, `Company`, `Source`, `Scan`, `Score`, `Note`, `StatusHistoryEntry`.
- Create `NormalizedJob` and `ScoreResult` types per INGESTION_SOURCES.md and SCORING_LOGIC.md.

### 1.5 Verify
- Run `npm run dev` — app loads with dark background.
- Query Supabase from a test Server Component — data returns.
- TypeScript compiles with no errors.

**Acceptance criteria**:
- [x] Next.js app runs locally with dark theme and Geist font.
- [x] Supabase is connected and schema is applied (all 7 tables exist).
- [x] TypeScript types match the schema exactly.
- [x] shadcn/ui is initialized and a test component renders.
- [x] `.env.local` is gitignored.
- [x] `TECH_STACK.md` reflects installed packages (keep in sync on dependency changes).
- [x] `ADR.md` updated when architecture decisions change (ongoing).

**Files to create/modify**:
- `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- `src/app/layout.tsx`, `src/app/page.tsx`
- `src/lib/db/supabase.ts`
- `src/lib/types/*.ts`
- `supabase/migrations/001_initial_schema.sql`
- `.env.local` (gitignored)
- `.gitignore`

---

## Phase 2 — Ingestion Foundation

**Goal**: Implement one ATS adapter (Lever), normalize raw postings, deduplicate, persist. Verify with a real scan.

**Steps**:

### 2.1 Lever fetcher
- Create `src/lib/ingestion/fetchers/lever.ts`.
- Fetch from `https://api.lever.co/v0/postings/{company}?mode=json`.
- Return typed raw response.
- Handle HTTP errors, timeouts, empty responses.

### 2.2 Normalizer
- Create `src/lib/ingestion/normalizer.ts`.
- Transform Lever raw response into `NormalizedJob[]`.
- Strip HTML from description to produce `descriptionPlain`.
- Detect remote from location string.
- Parse `postedAt` from Lever's `createdAt` field.

### 2.3 Deduper
- Create `src/lib/ingestion/deduper.ts`.
- Generate `dedupe_key` per BACKEND_STRUCTURE.md strategy.
- INSERT with ON CONFLICT DO NOTHING.
- Return counts: new, duplicate, errored.

### 2.4 Company resolution
- On ingest, extract company name from source config or API response.
- UPSERT into `companies` table (create if not exists, match on name).
- Link `jobs.company_id` to resolved company.

### 2.5 Scan runner
- Create `src/lib/ingestion/runner.ts`.
- Orchestrate: create scan record (pending) → fetch → normalize → dedupe → update scan record (completed/failed with stats).
- Log each step to console.

### 2.6 Manual trigger endpoint
- Create Server Action `src/app/actions/triggerScan.action.ts`.
- Create a minimal test page with a "Scan now" button that triggers the action.

### 2.7 Verify
- Add 2–3 real Lever company slugs to `sources` table.
- Trigger a scan.
- Confirm jobs appear in `jobs` table with correct normalization.
- Trigger a second scan — confirm no duplicates are created.
- Confirm `scans` table has accurate stats.

**Acceptance criteria**:
- [x] A manual scan fetches jobs from Lever, normalizes, deduplicates, and persists them.
- [x] Re-running the scan does not produce duplicate records.
- [x] `scans` table records: jobs_found, jobs_new, jobs_duplicate, status, timing.
- [x] Failures are caught, logged, and recorded in the scan record.
- [x] `companies` are auto-created from ingested data.
- [x] All ingestion code uses explicit TypeScript types.
- [x] `TECH_STACK.md` / `DATA_FLOW.md` kept aligned with implementation.

**Files to create/modify**:
- `src/lib/ingestion/types.ts`
- `src/lib/ingestion/fetchers/lever.ts`
- `src/lib/ingestion/normalizer.ts`
- `src/lib/ingestion/deduper.ts`
- `src/lib/ingestion/runner.ts`
- `src/lib/utils/text.ts`
- `src/app/actions/triggerScan.action.ts`

---

## Phase 3 — Scoring Engine

**Goal**: Implement the 5-dimension scoring engine with explanations. Verify with real ingested data.

**Steps**:

### 3.1 Scoring config
- Create `src/lib/scoring/config.ts` with all weights and thresholds from SCORING_LOGIC.md.
- Export as typed constants.

### 3.2 Individual score functions
- Create `src/lib/scoring/founding.ts` — founding score with signal detection and explanation.
- Create `src/lib/scoring/builder.ts` — builder score.
- Create `src/lib/scoring/gtmFit.ts` — GTM fit score.
- Create `src/lib/scoring/noise.ts` and `src/lib/scoring/prestigeTrap.ts` — penalty dimensions (as shipped; replaces a single `penalties.ts` file).
- Each function is pure: takes `NormalizedJob` (+ optional company context for founding), returns `DimensionScoreResult`.

### 3.3 Composite scorer
- Create `src/lib/scoring/composite.ts` — applies weights from config, clamps to 0–100.
- Create `src/lib/scoring/scorer.ts` — orchestrates all dimensions, returns full `ScoreResult` with explanation JSONB.

### 3.4 Integrate with ingestion
- Update `src/lib/ingestion/runner.ts` to call scorer after normalization/deduplication.
- Persist `scores` record linked to each new job.

### 3.5 Verify
- Run a scan with scoring enabled.
- Inspect `scores` table — all 5 dimensions populated, overall score computed.
- Spot-check 5 jobs: do the scores and explanations make sense?
- Test edge cases: empty description, very short title, known noise posting.

**Acceptance criteria**:
- [x] All 5 score dimensions produce 0–100 values with signal-level explanations.
- [x] Overall score applies the documented weight formula.
- [x] Scoring functions are pure and testable (no database calls inside them).
- [x] Explanation JSONB matches the format in SCORING_LOGIC.md.
- [x] Scoring integrates with the ingestion pipeline — new jobs are scored automatically.
- [ ] At least 5 real jobs have been manually reviewed for scoring accuracy (ongoing QA).
- [ ] `SCORING_LOGIC.md` is updated if any weights or signals were adjusted in code.

**Files to create/modify** (as shipped):
- Types live in `src/lib/types/scoring.types.ts` and `database.types.ts` (not a separate `scoring/types.ts`).
- `src/lib/scoring/config.ts`, `founding.ts`, `builder.ts`, `gtmFit.ts`, `noise.ts`, `prestigeTrap.ts`, `composite.ts`, `scorer.ts`
- `src/lib/ingestion/runner.ts` (modified)

---

## Phases 4–5 — Tactical + Radar (shipped MVP)

**As shipped**: `/dashboard` with `ModeToggle`, tactical `JobTable` + `FilterBar` + `DetailDrawer` (status + notes via server actions), radar `RadarCanvas` + `IntelPanel` + `EventLog`. Public `/jobs` remains read-only browse.

**Acceptance** (informal): [x] usable table and filters; [x] drawer with score breakdown; [x] radar visualization from live job rows; [ ] full optimistic UI and live scan events deferred.

---

## Future Phases (documented, not yet planned in detail)

| Phase | Name | Summary |
|---|---|---|
| 6 | Company Intelligence | Company aggregation, stage inference, outreach angles |
| 7 | Doctrine Layer | Public/private content, articles, search |
| 8 | Automation & Alerts | Scheduled scans, hot-watch, digests, high-score alerts |
| 9 | Hardening & Launch | Mobile polish, a11y pass, performance, RLS/auth hardening |

Phases 4–5 tactical/radar MVP is in production; detailed planning for 6+ continues one phase at a time.
