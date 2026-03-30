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

### Ops: Lever scan (ingestion)

1. Set `SUPABASE_SERVICE_ROLE_KEY` (writes require the service role) and `OPS_SCAN_SECRET` in `.env.local`.
2. Ensure `sources` has an active Lever row with `config.company_slug` (see seed in `supabase/migrations/001_initial_schema.sql`).
3. Open [`/ops/scan`](http://localhost:3000/ops/scan) (not linked in the public nav), enter the secret, and run the scan. New jobs appear on `/jobs`.

## Production (Vercel + darkalleybehindgtmcafe.xyz)

1. **Push this repo** to GitHub (or GitLab / Bitbucket).
2. In [Vercel](https://vercel.com): **Add New Project** → import the repo → Framework Preset **Next.js** → **Deploy** (default build: `next build`, output: Next.js).
3. **Environment variables** (Project → Settings → Environment Variables), for **Production** (and Preview if you want previews to work against Supabase):

   | Name | Notes |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://darkalleybehindgtmcafe.xyz` |
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase project settings |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | Server-only; required for `/ops/scan` ingestion |
   | `OPS_SCAN_SECRET` | Long random string; gates `/ops/scan` |

4. **Custom domain**: Project → **Domains** → add `darkalleybehindgtmcafe.xyz` (and `www.darkalleybehindgtmcafe.xyz` if you use it). Copy the **exact DNS records** Vercel shows into your DNS provider and wait for propagation.
5. **CLI** (optional): run `vercel login`, then from the repo root `vercel link` and `vercel deploy --prod`.

After DNS propagates, the site should load at **https://darkalleybehindgtmcafe.xyz**.

## Current phase

Phase 1–2 — Next.js + Supabase scaffold, public read-only routes, and **ops-gated** Lever ingestion (`/ops/scan`). See `progress.txt` for the latest status.
