# GTM Sonar OS

A private-first operating system for finding and tracking founding go-to-market opportunities.

## What it does

- Ingests job postings from ATS APIs (Lever, Greenhouse, Ashby).
- Normalizes, deduplicates, and scores them for founding/builder/GTM fit.
- Presents them in two modes:
  - **Sonar mode**: cinematic radar command-center UI where jobs appear as contacts on a sweep scan.
  - **Tactical mode**: dense list/table for fast review, filtering, and status management.
- Generates context: why a role matches, likely company pain, outreach angle.
- Tracks status: new, reviewed, shortlisted, applied, outreach sent, interviewing, archived.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase Postgres |
| Deployment | Vercel |
| Radar UI | Custom SVG + React |

## Development workflow

This project uses a disciplined, doc-driven development process:

1. **Before coding**: read `progress.txt`, `lessons.md`, and the relevant docs in `/docs`.
2. **Implement**: one approved step at a time from `docs/IMPLEMENTATION_PLAN.md`.
3. **After coding**: update `progress.txt`, and any affected docs (`ADR.md`, `COMPONENT_MAP.md`, `DATA_FLOW.md`, `lessons.md`).

See `.cursor/rules/` for the full set of operating guardrails.

## Project structure

```
/docs                  Canonical product + engineering documentation
/.cursor/rules         Cursor AI guardrails
progress.txt           Session-by-session execution log
lessons.md             Accumulated lessons learned
discovery.txt          Original product discovery document
```

## Getting started

### Prereqs

- Node.js (project uses Next.js 16)
- A Supabase project (hosted or local Supabase stack)

### Environment variables

Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

### Database schema

Apply `supabase/migrations/001_initial_schema.sql` to your Supabase Postgres database.

### Run

```bash
npm install
npm run dev
```

## Current phase

Phase 0 — Project foundation (docs, rules, logging). See `progress.txt` for latest status.
