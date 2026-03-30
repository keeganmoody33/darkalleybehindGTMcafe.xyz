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
│  GH, AB) │     │  source) │     │  canonical)│     │  key)   │     │  + comp)│
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

- **Trigger**: Vercel Cron `GET /api/cron/ingest` three times daily (UTC `11`, `17`, `1` → 6am/noon/8pm **EST**; see `vercel.json`) with Bearer `CRON_SECRET`, or manual `/ops/scan` server action (`OPS_SCAN_SECRET`).
- **Source data**: ATS API response (JSON array of job postings).
- **Transformations**: Raw API shape → `NormalizedJob` (strip HTML, detect remote, parse dates, extract company name) → generate `dedupe_key` → check for existing record → if new, run scoring engine → produce `ScoreResult` with explanations.
- **Persistence**: INSERT into `jobs` (ON CONFLICT dedupe_key DO NOTHING), INSERT into `scores`, UPSERT `companies` (create if not exists), INSERT `scans` record with stats.
- **Consumer**: Public `/jobs` and `/dashboard` read from Supabase (server-side). Radar mode plots contacts; tactical mode lists rows. Event log (dashboard) shows summary-style entries.
- **Failure modes**: ATS API timeout (retry 2x with backoff), ATS API 404 (mark source as errored), malformed response (log and skip individual records), database constraint violation (log, do not crash scan).
- **Observability**: `scans` table tracks status, timing, counts, errors. Console logging for dev. Future: structured logs.
- **Related files**: `src/lib/ingestion/runner.ts`, `src/app/api/cron/ingest/route.ts`, `src/app/actions/triggerScan.action.ts`, `vercel.json`, `src/lib/ingestion/fetchers/*.ts`, `src/lib/ingestion/normalizer.ts`, `src/lib/ingestion/deduper.ts`, `src/lib/scoring/scorer.ts`.

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
