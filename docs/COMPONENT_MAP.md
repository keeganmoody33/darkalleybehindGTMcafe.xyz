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

*Components will be documented here as they are built.*

### Component: PublicTopNav

- **Purpose**: Minimal public navigation between read-only surfaces.
- **Route(s)**: all public routes
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

### Planned Component Families

| Family | Location | Components (expected) |
|---|---|---|
| Layout | `src/components/layout/` | `AppShell`, `Header`, `ModeToggle`, `EventLog` |
| Tactical | `src/components/tactical/` | `JobTable`, `JobRow`, `DetailDrawer`, `FilterBar`, `StatusPill`, `ScoreBar` |
| Radar | `src/components/radar/` | `RadarCanvas`, `SweepLine`, `PulseRings`, `ContactBlip`, `IntelPanel` |
| Shared | `src/components/ui/` | shadcn/ui primitives (Button, Table, Drawer, Dialog, Input, Badge, etc.) |
