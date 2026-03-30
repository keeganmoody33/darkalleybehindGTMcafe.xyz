# GTM Sonar OS — Backend Structure

## Database: Supabase Postgres

### Entity Relationship

```
sources ──< scans ──< scan_results >── jobs >── companies
                                        │
                                        ├── scores
                                        ├── notes
                                        └── status_history
```

### Tables

#### `companies`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() | |
| `name` | text | NOT NULL, UNIQUE | Canonical company name |
| `domain` | text | NULLABLE | Company website domain |
| `inferred_stage` | text | NULLABLE | seed, series-a, series-b, growth, public, unknown |
| `employee_count_range` | text | NULLABLE | 1-10, 11-50, 51-200, 201-500, 500+ |
| `notes` | text | NULLABLE | User notes on the company |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

#### `sources`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() | |
| `name` | text | NOT NULL | Human label (e.g., "Lever - Ramp") |
| `type` | text | NOT NULL | lever, greenhouse, ashby, manual |
| `config` | jsonb | NOT NULL, default '{}' | API base URL, company slug, filters |
| `is_active` | boolean | NOT NULL, default true | |
| `scan_frequency_minutes` | integer | NOT NULL, default 360 | How often to scan (default 6h) |
| `last_scanned_at` | timestamptz | NULLABLE | |
| `created_at` | timestamptz | NOT NULL, default now() | |

#### `scans`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() | |
| `source_id` | uuid | FK → sources.id, NOT NULL | |
| `status` | text | NOT NULL | pending, running, completed, failed |
| `started_at` | timestamptz | NULLABLE | |
| `completed_at` | timestamptz | NULLABLE | |
| `jobs_found` | integer | NOT NULL, default 0 | |
| `jobs_new` | integer | NOT NULL, default 0 | |
| `jobs_duplicate` | integer | NOT NULL, default 0 | |
| `error_message` | text | NULLABLE | |
| `created_at` | timestamptz | NOT NULL, default now() | |

#### `jobs`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() | |
| `company_id` | uuid | FK → companies.id, NOT NULL | |
| `source_id` | uuid | FK → sources.id, NOT NULL | |
| `external_id` | text | NULLABLE | ATS-specific ID |
| `external_url` | text | NOT NULL | Canonical application URL |
| `title` | text | NOT NULL | |
| `description_raw` | text | NULLABLE | Full posting text |
| `description_plain` | text | NULLABLE | Stripped/normalized text for scoring |
| `location` | text | NULLABLE | |
| `is_remote` | boolean | NOT NULL, default false | |
| `department` | text | NULLABLE | |
| `employment_type` | text | NULLABLE | full-time, contract, part-time |
| `posted_at` | timestamptz | NULLABLE | When the ATS says it was posted |
| `discovered_at` | timestamptz | NOT NULL, default now() | When our scan found it |
| `status` | text | NOT NULL, default 'new' | new, reviewed, shortlisted, applied, outreach_sent, interviewing, archived |
| `outreach_angle` | text | NULLABLE | User's positioning notes |
| `dedupe_key` | text | NOT NULL, UNIQUE | Composite: normalized(title + company_name + source_type) |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

#### `scores`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() | |
| `job_id` | uuid | FK → jobs.id, NOT NULL, UNIQUE | One score record per job |
| `founding_score` | integer | NOT NULL | 0–100 |
| `builder_score` | integer | NOT NULL | 0–100 |
| `gtm_fit_score` | integer | NOT NULL | 0–100 |
| `noise_penalty` | integer | NOT NULL | 0–100 (higher = more noise) |
| `prestige_trap_penalty` | integer | NOT NULL | 0–100 (higher = more trap) |
| `overall_score` | integer | NOT NULL | Weighted composite |
| `explanation` | jsonb | NOT NULL | Structured reasons for each dimension |
| `scored_at` | timestamptz | NOT NULL, default now() | |

#### `notes`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() | |
| `job_id` | uuid | FK → jobs.id, NOT NULL | |
| `content` | text | NOT NULL | |
| `created_at` | timestamptz | NOT NULL, default now() | |

#### `status_history`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() | |
| `job_id` | uuid | FK → jobs.id, NOT NULL | |
| `from_status` | text | NOT NULL | |
| `to_status` | text | NOT NULL | |
| `changed_at` | timestamptz | NOT NULL, default now() | |

### Indexes

- `jobs.dedupe_key` — UNIQUE (enforces deduplication)
- `jobs.status` — B-tree (filter by status)
- `jobs.company_id` — B-tree (company aggregation)
- `scores.overall_score` — B-tree DESC (sort by score)
- `scans.source_id, scans.created_at` — composite (scan history per source)

### Deduplication Strategy

1. On ingest, compute `dedupe_key` = `lower(trim(title)) || '::' || lower(trim(company_name)) || '::' || source_type`.
2. Attempt INSERT with ON CONFLICT (dedupe_key) DO NOTHING.
3. Track `jobs_duplicate` count on the scan record.
4. If the same role appears on multiple ATS platforms, each gets its own record (different `source_type` in the dedupe key).

## API Shape (Next.js Server Actions + Route Handlers)

### Server Actions (mutations)

| Action | Input | Effect |
|---|---|---|
| `updateJobStatus` | `{ jobId, newStatus }` | Updates `jobs.status`, inserts `status_history` row |
| `addJobNote` | `{ jobId, content }` | Inserts into `notes` |
| `updateOutreachAngle` | `{ jobId, angle }` | Updates `jobs.outreach_angle` |
| `triggerScan` | `{ sourceId? }` | Queues an ingestion run |
| `updateCompanyNotes` | `{ companyId, notes }` | Updates `companies.notes` |

### Route Handlers (reads, used by client components)

| Endpoint | Method | Returns |
|---|---|---|
| `/api/jobs` | GET | Paginated job list with scores, filterable by status/score/source/title |
| `/api/jobs/[id]` | GET | Full job detail with scores, notes, company, status history |
| `/api/companies` | GET | Company list with job counts |
| `/api/companies/[id]` | GET | Company detail with associated jobs |
| `/api/scans` | GET | Scan history with stats |
| `/api/sources` | GET | Configured sources |

## File Structure (backend)

```
src/
├── lib/
│   ├── db/
│   │   └── supabase.ts          # Supabase client singleton
│   ├── ingestion/
│   │   ├── types.ts              # RawJob, NormalizedJob interfaces
│   │   ├── fetchers/
│   │   │   ├── lever.ts          # Lever API adapter
│   │   │   ├── greenhouse.ts     # Greenhouse API adapter
│   │   │   └── ashby.ts          # Ashby API adapter
│   │   ├── normalizer.ts         # Raw → canonical job shape
│   │   ├── deduper.ts            # Dedupe key generation + conflict handling
│   │   └── runner.ts             # Orchestrates fetch → normalize → dedupe → score → persist
│   ├── scoring/
│   │   ├── types.ts              # ScoreResult, ScoreExplanation interfaces
│   │   ├── founding.ts           # Founding score logic
│   │   ├── builder.ts            # Builder score logic
│   │   ├── gtmFit.ts             # GTM fit score logic
│   │   ├── penalties.ts          # Noise + prestige-trap penalties
│   │   ├── composite.ts          # Weighted overall score
│   │   └── scorer.ts             # Orchestrates all dimensions
│   └── utils/
│       ├── text.ts               # Text normalization helpers
│       └── dates.ts              # Date formatting helpers
├── app/
│   ├── api/
│   │   ├── jobs/
│   │   │   └── route.ts
│   │   ├── companies/
│   │   │   └── route.ts
│   │   ├── scans/
│   │   │   └── route.ts
│   │   └── sources/
│   │       └── route.ts
│   └── actions/
│       ├── updateJobStatus.action.ts
│       ├── addJobNote.action.ts
│       ├── updateOutreachAngle.action.ts
│       ├── triggerScan.action.ts
│       └── updateCompanyNotes.action.ts
```
