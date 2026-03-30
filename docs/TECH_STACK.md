# GTM Sonar OS — Tech Stack

## Decided

| Layer | Technology | Version | Why |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Server Components, file-system routing, Vercel-native |
| Language | TypeScript | 5.x | Type safety for scoring logic, API contracts, and UI props |
| Styling | Tailwind CSS | 4.x | Utility-first, dark mode support, composable with shadcn/ui |
| Component library | shadcn/ui | latest | Accessible primitives for tactical mode (tables, drawers, filters, buttons) |
| Database | Supabase Postgres | hosted | Relational model for jobs/companies/scans/scores; realtime subscriptions available |
| ORM / query | Supabase JS client (`@supabase/supabase-js`) | latest | Direct Postgres access, RLS, realtime |
| Deployment | Vercel | — | Zero-config Next.js hosting, cron jobs, edge functions |
| Radar/sonar UI | Custom SVG + React | — | No off-the-shelf charting lib fits; hand-built for semantic meaning |
| Icons | Lucide React | latest | Consistent, tree-shakable icon set |
| Font | Geist Sans + Geist Mono | — | Interface text + code/metrics |

## Hybrid Posture

- **Local dev**: Supabase local dev stack (`supabase start`) or direct connection to a hosted Supabase project with dev credentials.
- **Hosted**: Vercel deploy + Supabase hosted project. Environment variables switch between local and hosted via `.env.local`.
- **Migration path**: Supabase migrations (`supabase db diff` / `supabase migration new`) keep schema in sync across environments.

## Planned (not yet added)

| Technology | Purpose | When |
|---|---|---|
| Supabase Auth | Login for hosted mode | When hosted mode ships |
| Vercel Cron Jobs | Scheduled ingestion scans | Phase 9 (automation layer) |
| Supabase Realtime | Live updates when new jobs land | After tactical MVP is stable |
| `next/font` (Geist) | Font optimization | Phase 5 (tactical MVP) |

## Constraints

- No dependency may be added without updating this file.
- No external service may be introduced without an ADR entry.
- Prefer boring, stable packages over bleeding-edge experiments.
- All packages must be explicitly versioned in `package.json`.
