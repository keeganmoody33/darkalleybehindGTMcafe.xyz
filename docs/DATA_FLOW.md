# Data Flow

## System Flow (high-level)

```
Source API → Fetcher → Normalizer → Deduper → Scorer → Database → API/Actions → UI → User Action → Status Update
```

## Detailed Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌─────────┐     ┌─────────┐
│  ATS API │────▶│ Fetcher  │────▶│ Normalizer │────▶│ Deduper │────▶│ Scorer  │
│ (Lever,  │     │ (per-    │     │ (raw →     │     │ (check  │     │ (5 dim  │
│ GH, AB,  │     │  source) │     │  canonical)│     │  key)   │     │  + comp)│
│ RSS, man)│     │          │     │            │     │         │     │         │
└──────────┘     └──────────┘     └────────────┘     └─────────┘     └─────────┘
                                                                          │
                                                                          ▼
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌─────────────────────────┐
│  User    │◀───▶│    UI    │◀────│  API /     │◀────│      Supabase           │
│          │     │ (Sonar + │     │  Actions   │     │  (jobs, scores,         │
│          │     │  Tactical)│     │            │     │   companies, scans)     │
└──────────┘     └──────────┘     └────────────┘     └─────────────────────────┘
```

## Template

### Flow: [Name]

- **Trigger**:
- **Source data**:
- **Transformations**:
- **Persistence**:
- **Consumer**:
- **Failure modes**:
- **Observability**:
- **Related files**:

---

## Flows

### Flow: Ingestion scan

- **Trigger**: Vercel Cron `GET /api/cron/ingest` twice daily (UTC `11` and `1`; see `vercel.json`) with Bearer `CRON_SECRET`, or manual `/ops/scan` server action (`OPS_SCAN_SECRET`).
- **Source data**: Per **active** `sources` row: Lever / Greenhouse / Ashby public JSON, or RSS (`remoteok`, `remotive`, or generic `rss_feed` + `feed_url`). Type `manual` is skipped by the scan loop.
- **Transformations**: Raw payload → `NormalizedJob` (strip HTML, detect remote, parse dates, company name) → `dedupe_key` from `title + company + sourceType` → insert if new → `scoreJob` → `scores` row.
- **Persistence**: INSERT `jobs`, INSERT `scores`, UPSERT `companies`, one `scans` row per source with counts; update `sources.last_scanned_at`.
- **Consumer**: `/jobs` and `/dashboard` read via `getPublicJobs` / `getDashboardJobs` with optional filters: **ingested** window (`discovered_at`) and **ATS posted** window (`posted_at`).
- **Failure modes**: Per-source try/catch: failed scan marks that `scans` row failed; other sources continue. Duplicate `dedupe_key` counts as duplicate, not error.
- **Observability**: `scans` table; cron JSON returns `results[]` and `totals`.
- **Related files**: `src/lib/ingestion/runner.ts`, `src/app/api/cron/ingest/route.ts`, `src/app/actions/triggerScan.action.ts`, `src/lib/ingestion/fetchers/*.ts`, `src/lib/ingestion/normalizer.ts`, `src/lib/ingestion/deduper.ts`, `src/lib/scoring/scorer.ts`, `src/lib/data/jobs.ts`, `src/lib/public/jobs.ts`.

### Flow: Manual job entry

- **Trigger**: `/ops/scan` form “Manual job” + `OPS_SCAN_SECRET`.
- **Source data**: Title, company, URL, optional description/location/posted date/remote flag.
- **Transformations**: Build `NormalizedJob` with `sourceType: manual` → `scoreJob` → same dedupe rules as ingest (`manual` in dedupe key).
- **Persistence**: Requires an active `sources` row with `type = manual` (seeded in migration `003`). INSERT `jobs` + `scores`.
- **Related files**: `src/app/actions/insertManualJob.action.ts`, `src/app/ops/scan/ManualJobForm.tsx`.

### Flow: Status update

- **Trigger**: User clicks status button in tactical mode or intel panel.
- **Source data**: `{ jobId, newStatus }` from UI.
- **Transformations**: Validate status enum; update `jobs.status`. Insert `status_history` row.
- **Persistence**: UPDATE `jobs`, INSERT `status_history`.
- **Consumer**: UI reflects new status immediately (optimistic update, then confirm). Radar blip visual changes per status.
- **Failure modes**: Invalid transition (reject with message), database error (rollback, show error).
- **Observability**: `status_history` provides full audit trail.
- **Related files**: `src/app/actions/updateStatus.action.ts`, `JobTable`, `IntelPanel`.

### Flow: Note creation

- **Trigger**: User adds a note in the detail drawer or intel panel.
- **Source data**: `{ jobId, content }` from UI.
- **Transformations**: None (plain text storage).
- **Persistence**: INSERT into `notes`.
- **Consumer**: Notes list in detail drawer / intel panel.
- **Failure modes**: Empty content (validate client-side), database error.
- **Observability**: Notes have timestamps for chronological display.
- **Related files**: `src/app/actions/addNote.action.ts`, `DetailDrawer`, `IntelPanel`.
