# Architecture Decision Records

## Template

### ADR-NNN: [Decision title]

- **Date**:
- **Status**: proposed / accepted / superseded
- **Context**:
- **Decision**:
- **Consequences**:
- **Alternatives considered**:

---

## Decisions

### ADR-001: Next.js App Router as frontend framework

- **Date**: 2026-03-30
- **Status**: accepted
- **Context**: Need a React framework with server-side rendering, file-system routing, and strong Vercel deployment support. The app is single-user but benefits from Server Components for data-heavy views (job tables, score breakdowns).
- **Decision**: Use Next.js 16 with App Router. Server Components by default. Client Components only where interactivity is required (radar canvas, filters, status toggles).
- **Consequences**: Locked into React ecosystem. Must use `'use client'` boundary discipline. Server Actions for mutations.
- **Alternatives considered**: Remix (good data loading, weaker Vercel integration), plain Vite + React (no SSR without extra work), SvelteKit (different ecosystem, less shadcn/ui support).

### ADR-002: Supabase Postgres as primary data store

- **Date**: 2026-03-30
- **Status**: accepted
- **Context**: Need relational storage for jobs, companies, scores, scans. Must support hybrid local/hosted development. Must support future realtime subscriptions for live scan updates.
- **Decision**: Use Supabase hosted Postgres with `@supabase/supabase-js`. Use Supabase local dev stack for offline work. Migrations via Supabase CLI.
- **Consequences**: Tied to Supabase client library (but standard Postgres underneath). RLS available for future multi-user. Realtime available when needed.
- **Alternatives considered**: Raw Postgres + Prisma (more ORM overhead, less realtime), SQLite (simpler but no hosted path without migration), Neon (good but less local dev tooling than Supabase).

### ADR-003: Rule-based scoring before AI scoring

- **Date**: 2026-03-30
- **Status**: accepted
- **Context**: Scoring is the core differentiator. Could use LLM-based scoring from day one, or start with rule-based heuristics.
- **Decision**: v1 uses rule-based scoring (keyword matching, signal weighting, heuristics). Pure functions, testable, fast, no API costs. AI-assisted scoring is a documented v2 consideration.
- **Consequences**: Scoring accuracy depends on signal quality and weight tuning. Must be easy to iterate on weights. Explanation text is template-based, not generated.
- **Alternatives considered**: LLM scoring from day one (expensive, slow, harder to debug, overkill before we know what signals matter).

### ADR-004: shadcn/ui for tactical mode components

- **Date**: 2026-03-30
- **Status**: accepted
- **Context**: Tactical mode needs accessible, keyboard-navigable tables, drawers, dialogs, buttons, and filters. Building from scratch is slow and error-prone.
- **Decision**: Use shadcn/ui (Radix primitives + Tailwind) for all tactical UI. Radar/sonar canvas is custom SVG, not shadcn/ui.
- **Consequences**: Must initialize shadcn/ui and configure its Tailwind integration. Components are source code in the project, fully customizable.
- **Alternatives considered**: Headless UI (fewer components), raw Radix (no styling), Material UI (wrong aesthetic), Ant Design (wrong aesthetic and heavy).

### ADR-005: Hybrid local/hosted development posture

- **Date**: 2026-03-30
- **Status**: accepted
- **Context**: The app is private-first but should be accessible from anywhere eventually. Need to develop locally without requiring cloud resources, but deploy to hosted infra when ready.
- **Decision**: Use Supabase local dev stack (`supabase start`) for local development. Environment variables in `.env.local` switch between local and hosted Supabase. Supabase migrations keep schema in sync. Vercel for deployment.
- **Consequences**: Must maintain migration discipline. `.env.local` must be gitignored. Two environment configs to manage.
- **Alternatives considered**: Local-only with SQLite (no hosted path), hosted-only from day one (requires internet for dev).

### ADR-006: One app with two surfaces + Supabase Auth/RLS boundary

- **Date**: 2026-03-30
- **Status**: accepted
- **Context**: This product must preserve two surfaces: a public read-only experience and an admin/ops control layer. The repo currently contains (a) a legacy public static prototype (`darkalley-cursor/`) and (b) a Next.js + Supabase target architecture. Without an explicit boundary, "ops" capabilities (scan triggers, status edits, notes, scoring tuning) can accidentally leak into the public surface.
- **Decision**:
  - Use **one Next.js app** that contains **two explicit surfaces**:
    - **Public surface**: browse/filter/learn; strictly read-only.
    - **Admin/ops surface**: trigger scans, edit records, manage statuses/notes, tune scoring.
  - Use **Supabase Auth + Row Level Security (RLS)** as the v1 boundary for all mutations and any privileged reads. Public read-only endpoints must be safe without authentication.
  - Enforce a strict key boundary:
    - `SUPABASE_SERVICE_ROLE_KEY` is **server-only** and must never be imported by client components or shipped to the browser.
    - `NEXT_PUBLIC_SUPABASE_URL` (and, later, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) may exist client-side for read-only queries as needed.
- **Consequences**:
  - The app must implement auth checks and RLS policies before enabling admin mutations.
  - The codebase must clearly separate "public" vs "admin" routes/components/actions to prevent accidental coupling.
  - Local and hosted environments both require consistent auth/RLS behavior.
- **Alternatives considered**:
  - Two separate apps (public + ops) sharing a backend: clearer separation but higher maintenance overhead early.
  - Temporary shared-secret admin token: faster initially but tends to become a permanent unsafe shortcut and does not integrate with RLS.

### ADR-007: Supabase client split (server vs browser)

- **Date**: 2026-03-30
- **Status**: accepted
- **Context**: The repo needs both (a) privileged server-side capabilities (ingestion runs, admin mutations) and (b) a safe path for read-only public browsing. The Supabase service role key is highly privileged and must never ship to the browser bundle.
- **Decision**:
  - Introduce explicit clients:
    - `src/lib/db/supabaseServer.ts` uses `SUPABASE_SERVICE_ROLE_KEY` and is **server-only** (guarded by `server-only`).
    - `src/lib/db/supabaseBrowser.ts` uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` for safe browser usage when needed.
  - Keep `src/lib/db/supabase.ts` as a compatibility server-only re-export for legacy imports.
- **Consequences**:
  - Any client component importing `src/lib/db/supabase.ts` will fail early (intended) because it is server-only.
  - Public read paths must either be implemented as server reads (preferred) or use the anon browser client with RLS protecting private data.
  - Environment variables must include `NEXT_PUBLIC_SUPABASE_ANON_KEY` (documented in `.env.example`).
- **Alternatives considered**:
  - Single client with conditional keys: too easy to accidentally bundle privileged secrets.

### ADR-008: Scoring modules as separate dimension files

- **Date**: 2026-03-30
- **Status**: accepted
- **Context**: The implementation plan originally referenced a single `penalties.ts` for both noise and prestige-trap dimensions.
- **Decision**: Implement noise and prestige-trap as `src/lib/scoring/noise.ts` and `src/lib/scoring/prestigeTrap.ts`, plus `config.ts`, `composite.ts`, and `scorer.ts` orchestration. Shared score types remain in `src/lib/types/scoring.types.ts` and `database.types.ts`.
- **Consequences**: File list in docs must reference the two penalty modules; pure functions stay testable per dimension.
- **Alternatives considered**: Single `penalties.ts` exporting both — slightly fewer files but longer file and mixed concerns.
