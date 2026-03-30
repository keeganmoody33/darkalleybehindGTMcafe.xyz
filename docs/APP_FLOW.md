# GTM Sonar OS — Application Flow

## Primary Modes

### 1. Sonar Mode (default view)

```
┌─────────────────────────────────────────────────────┐
│  Header: scan status · last scan time · active filters │
├────────────────────────────┬────────────────────────┤
│                            │  Intel Panel           │
│    Radar Canvas            │  - Selected contact    │
│    - Sweep line            │  - Score breakdown     │
│    - Pulse rings           │  - Company context     │
│    - Plotted contacts      │  - Outreach angle      │
│    - Score-based placement │  - Status actions      │
│                            │  - Notes               │
├────────────────────────────┴────────────────────────┤
│  Event Log: recent scan results · status changes     │
└─────────────────────────────────────────────────────┘
```

**Contact placement logic**: distance from center = inverse of overall score (high score = closer to center). Angle = category/title-family grouping. Brightness/size = recency + score.

### 2. Tactical Mode (productivity view)

```
┌─────────────────────────────────────────────────────┐
│  Toolbar: filters · search · sort · bulk actions     │
├─────────────────────────────────────────────────────┤
│  Dense Table                                         │
│  Title | Company | Score | Stage | Status | Source   │
│  ───────────────────────────────────────────────────│
│  row...                                              │
│  row...                                              │
│  row... (selected, highlighted)                      │
├─────────────────────────────────────────────────────┤
│  Detail Drawer (slides from right)                   │
│  - Full description                                  │
│  - Score breakdown with explanations                 │
│  - Company intel                                     │
│  - Notes + outreach angle                            │
│  - Status transition buttons                         │
└─────────────────────────────────────────────────────┘
```

## User Flows

### Flow: New scan reveals jobs

1. Scheduled cron (or manual trigger) fires.
2. Fetcher calls ATS API for configured companies/sources.
3. Normalizer transforms raw payloads into canonical `Job` shape.
4. Deduper checks URL + title/company compound key against existing records.
5. New jobs are scored (founding, builder, GTM fit, noise penalty, prestige-trap penalty → overall).
6. Jobs are persisted with scores and explanation text.
7. UI receives new data on next load/refresh (or via realtime subscription if Supabase Realtime is enabled).
8. Sonar mode: new contacts appear at perimeter, revealed by sweep line.
9. Event log shows "Scan complete: 12 new contacts, 3 high-score matches."

### Flow: Review a job in tactical mode

1. User opens tactical mode.
2. Table loads with default sort: overall score descending, status = new first.
3. User clicks a row → detail drawer opens.
4. User reads score breakdown and explanation.
5. User changes status (e.g., new → reviewed, or new → shortlisted).
6. User optionally adds a note or outreach angle.
7. Status change persists immediately.

### Flow: Filter and act

1. User applies filters: score >= 70, status = new, source = Lever.
2. Table updates.
3. User bulk-selects rows → marks as reviewed.

### Flow: Trigger manual scan

1. User clicks "Scan now" in header.
2. Ingestion runs for all configured sources.
3. Progress indicator shows scan state.
4. Results appear in both modes.

## Navigation

| Route | Purpose |
|---|---|
| `/` | Sonar mode (default) |
| `/tactical` | Tactical table mode |
| `/job/[id]` | Job detail (deep link) |
| `/settings` | Source config, scan schedule, scoring weights |
| `/scans` | Scan history and diagnostics |

## State Machine: Job Status

```
new → reviewed → shortlisted → applied → outreach sent → interviewing → archived
                                                                         ↑
new → archived (skip directly)                                           │
reviewed → archived ─────────────────────────────────────────────────────┘
shortlisted → archived
applied → archived
outreach sent → archived
interviewing → archived
```

Any status can transition to `archived`. Forward transitions follow the primary flow. Backward transitions are not allowed (if you un-archive, the job returns to `reviewed`).
