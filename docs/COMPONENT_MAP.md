# Component Map

## Template

### Component: [Name]

- **Purpose**:
- **Route(s)**:
- **Inputs / props**:
- **Internal state**:
- **Data dependencies**:
- **Interacts with**:
- **Accessibility notes**:
- **Design rules**:
- **Status**: planned / in-progress / complete

---

## Components

### Component: PublicTopNav

- **Purpose**: Minimal public navigation between Home, Dashboard, Jobs, Methodology, Progress.
- **Route(s)**: all routes using root layout
- **Inputs / props**: none
- **Internal state**: none
- **Data dependencies**: none
- **Interacts with**: `src/app/layout.tsx`
- **Accessibility notes**: Uses semantic `<nav aria-label="Primary">` and standard links.
- **Design rules**: Dark-first command console; no decorative motion.
- **Status**: complete

---

### Component: JobsPage

- **Purpose**: Public read-only browse/filter list of jobs and scores.
- **Route(s)**: `/jobs`
- **Inputs / props**: `searchParams` (`q`, `status`, `minScore`)
- **Internal state**: none (server-rendered)
- **Data dependencies**: `jobs`, `companies`, `sources`, `scores`
- **Interacts with**: `src/lib/public/jobs.ts`
- **Accessibility notes**: Form inputs have labels; table is semantic HTML.
- **Design rules**: Tactical usefulness > visuals; server-side reads only.
- **Status**: complete (MVP)

---

### Component: MethodologyPage

- **Purpose**: Publish the canonical scoring logic for transparency.
- **Route(s)**: `/methodology`
- **Inputs / props**: none
- **Internal state**: none (server-rendered)
- **Data dependencies**: `docs/SCORING_LOGIC.md`
- **Interacts with**: none
- **Accessibility notes**: Uses `<pre>` for faithful rendering; content is text-only.
- **Design rules**: Public read-only; doctrine must match canonical docs.
- **Status**: complete (MVP)

---

### Component: ProgressPage

- **Purpose**: Public proof-of-work log of development sessions.
- **Route(s)**: `/progress`
- **Inputs / props**: none
- **Internal state**: none (server-rendered)
- **Data dependencies**: `progress.txt`
- **Interacts with**: none
- **Accessibility notes**: Uses `<pre>` for faithful rendering; content is text-only.
- **Design rules**: Public read-only; must not expose secrets.
- **Status**: complete (MVP)

---

### Component: OpsScanPage

- **Purpose**: Manually trigger a Lever ingestion run (fetch → normalize → dedupe → persist) without exposing a public endpoint.
- **Route(s)**: `/ops/scan`
- **Inputs / props**: none (page); form posts `secret`, optional `sourceId`
- **Internal state**: client form via `useActionState`
- **Data dependencies**: `sources`, `scans`, `jobs`, `companies`; requires `SUPABASE_SERVICE_ROLE_KEY` + `OPS_SCAN_SECRET`
- **Interacts with**: `src/app/actions/triggerScan.action.ts`, `src/lib/ingestion/runner.ts` (runner inserts `scores` for each new job)
- **Accessibility notes**: Status message uses `role="status"`; password field for shared secret.
- **Design rules**: Ops-only; `robots` noindex; not linked from `PublicTopNav`.
- **Status**: complete (MVP)

---

### Component: DashboardPage / DashboardShell

- **Purpose**: Command center with tactical vs radar mode; loads jobs via server, passes to client shell.
- **Route(s)**: `/dashboard`
- **Inputs / props**: `searchParams` for filters (`q`, `status`, `minScore`, `sortBy`, `isRemote`); `DashboardShell` receives `jobs`, `total`, `initialFilters`, optional `error`.
- **Internal state**: mode (`tactical` | `radar`), selected job id, overlay for tactical drawer.
- **Data dependencies**: `getDashboardJobs` from `src/lib/data/jobs.ts`
- **Interacts with**: `ModeToggle`, `FilterBar`, `JobTable`, `DetailDrawer`, `RadarCanvas`, `IntelPanel`, `EventLog`
- **Design rules**: Tactical brain + radar face per implementation plan.
- **Status**: complete

---

### Component: ModeToggle

- **Purpose**: Switch between tactical table view and radar canvas view on dashboard.
- **Route(s)**: `/dashboard`
- **Inputs / props**: `mode`, `onModeChange`
- **Status**: complete

---

### Component: FilterBar

- **Purpose**: GET-form filters for dashboard (search, status, min score, sort, remote-only).
- **Route(s)**: `/dashboard`
- **Status**: complete

---

### Component: JobTable

- **Purpose**: Dense clickable rows; title links externally; score sub-columns F/B/G; status pill.
- **Route(s)**: `/dashboard`
- **Interacts with**: `ScoreBadge`, `StatusPill`
- **Status**: complete

---

### Component: DetailDrawer

- **Purpose**: Slide-over job detail; score breakdown; status buttons; notes via `addNoteAction`.
- **Route(s)**: `/dashboard` (tactical mode)
- **Interacts with**: `ScoreBreakdown`, `updateStatusAction`, `addNoteAction`
- **Status**: complete

---

### Component: ScoreBadge / ScoreBreakdown / StatusPill

- **Purpose**: Score band styling; five-dimension explanation UI; status chips.
- **Status**: complete

---

### Component: RadarCanvas / PulseRings / SweepLine / ContactBlip

- **Purpose**: SVG radar, threshold rings, sweep animation, interactive blips.
- **Route(s)**: `/dashboard` (radar mode)
- **Status**: complete

---

### Component: IntelPanel / EventLog

- **Purpose**: Selected-contact summary on radar; bottom event feed (MVP uses synthetic entries from loaded jobs).
- **Route(s)**: `/dashboard` (radar mode)
- **Status**: complete

---

### Planned / not built

| Family | Location | Notes |
|---|---|---|
| Layout | `src/components/layout/` | `AppShell`, dedicated `Header` — optional |
| Tactical | `src/components/tactical/` | `JobRow` extract, `ScoreBar` — polish |
| Shared | `src/components/ui/` | Add shadcn primitives as needed |
