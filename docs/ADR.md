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
