# GTM Sonar OS

A private-first operating system for finding and tracking founding go-to-market opportunities.

## What it does

- Ingests job postings from ATS APIs (Lever, Greenhouse, Ashby) and RSS-style aggregators (RemoteOK, Remotive) with GTM keyword filtering.
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

### Ops: Multi-source ingestion

1. Set `SUPABASE_SERVICE_ROLE_KEY` (writes require the service role) and `OPS_SCAN_SECRET` in `.env.local`.
2. Ensure `sources` has active rows: Lever (`company_slug`), Greenhouse (`board_token`), Ashby (`org_id`), RSS (`provider`: `remoteok` | `remotive` | `rss_feed` + `feed_url`, optional `keywords`), and optionally `manual` for the manual job form. See `supabase/migrations/001_initial_schema.sql`, `002_multi_source_seed.sql`, and `003_manual_and_gtm_sources.sql`.
3. Open [`/ops/scan`](http://localhost:3000/ops/scan) (not linked in the public nav), enter the secret, and run the scan. With no `sourceId`, **every** active source is scanned. New jobs are scored on insert and appear on [`/jobs`](http://localhost:3000/jobs) and [`/dashboard`](http://localhost:3000/dashboard).

**Scheduled scans (production):** Vercel Cron hits [`/api/cron/ingest`](https://darkalleybehindthegtmcafe.xyz/api/cron/ingest) **twice daily** (`vercel.json`: `0 11 * * *` and `0 1 * * *` UTC). That lines up with **~6:00 and ~20:00 Eastern** in standard time; during daylight saving, local times shift by an hour because Vercel runs on UTC. Set `CRON_SECRET` in Vercel; it is sent as `Authorization: Bearer <CRON_SECRET>`. Two jobs stay within **Vercel Hobby** limits.

### Command center

- [`/dashboard`](http://localhost:3000/dashboard): tactical table with filters, detail drawer (status + notes), and radar view with intel panel and event log. Linked from the top nav as **Dashboard**.

## Production (Vercel + darkalleybehindthegtmcafe.xyz)

1. **Repo**: [keeganmoody33/darkalleybehindGTMcafe.xyz](https://github.com/keeganmoody33/darkalleybehindGTMcafe.xyz) is connected to Vercel; pushes to `main` trigger production deploys.
2. In [Vercel](https://vercel.com): project settings should use Framework Preset **Next.js** (default build: `next build`).
3. **Environment variables** (Project → Settings → Environment Variables), for **Production** (and Preview if previews should hit Supabase):

   | Name | Notes |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://darkalleybehindthegtmcafe.xyz` (must match apex for `metadataBase` / OG URLs) |
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase project settings |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | Server-only; required for `/ops/scan` ingestion and dashboard mutations |
   | `OPS_SCAN_SECRET` | Long random string; gates `/ops/scan` |
   | `CRON_SECRET` | Long random string; Vercel Cron sends this as `Authorization: Bearer …` for `/api/cron/ingest` |

4. **Custom domain**: Project → **Domains** → add `darkalleybehindthegtmcafe.xyz` and `www.darkalleybehindthegtmcafe.xyz`. Copy the **exact DNS records** Vercel shows into your DNS provider (Namecheap: A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`) and wait for propagation.
5. **CLI** (optional): run `vercel login`, then from the repo root `vercel link` and `vercel deploy --prod`.

After DNS propagates, the site loads at **https://darkalleybehindthegtmcafe.xyz** (www redirects to apex if configured in Vercel).

If a new route (for example `/dashboard`) returns **404** in production but works locally, the Vercel deployment is probably behind `main`: push the latest commit and wait for the production build, or trigger a redeploy from the Vercel dashboard.

## Current phase

Phases 1–3 plus tactical dashboard and radar UI are shipped: scoring engine, `/dashboard`, ingestion with auto-score on new jobs, public `/jobs`. Next focus: auth/RLS, company intelligence, automation. See `progress.txt` and `docs/IMPLEMENTATION_PLAN.md`.
