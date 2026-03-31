# GTM Sonar OS — Ingestion Sources

## Strategy

Primary path: **public ATS JSON APIs** and **aggregator JSON/RSS** — no auth for public boards, predictable shapes, ToS-friendly when using documented endpoints.

**Niche / closed channels** (Slack, LinkedIn, private communities): use **manual job entry** on `/ops/scan` (gated by `OPS_SCAN_SECRET`) so you can paste roles without scraping gated sites.

## Implemented source types (`sources.type`)

| Type | Config | Fetcher |
|------|--------|---------|
| `lever` | `company_slug` (or `company`), optional `company_name` | Lever public postings JSON |
| `greenhouse` | `board_token` (or `company_slug`), optional `company_name` | Greenhouse board API `?content=true` |
| `ashby` | `org_id` (or `company_slug`), optional `company_name` | Ashby public job board API |
| `rss` | `provider`: `remoteok` (default), `remotive`, or `rss_feed` | See below |
| `manual` | `{}` | Not fetched by cron — jobs inserted via ops manual form |

### RSS `provider` values

- **`remoteok`** — `https://remoteok.com/api` (JSON), filtered by `keywords` or app default GTM list.
- **`remotive`** — Remotive categories (software-dev, marketing, business, data), keyword filter.
- **`rss_feed`** (alias **`feed`**) — **requires** `feed_url` (RSS 2.0 or Atom). Optional `company_name` as the default company label per item. Optional `keywords` array; default uses the same GTM keyword list as RemoteOK.

Some third-party feeds return **403** to non-browser clients; if a feed fails, try another URL or leave that source inactive until you confirm access.

## v1 ATS (details)

### Lever

- **API**: `https://api.lever.co/v0/postings/{company}?mode=json`
- **Auth**: None for public postings.
- **Normalization**: HTML → plain text; remote from categories/location.

### Greenhouse

- **API**: `https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true`
- **Auth**: None for public boards.
- **Rate limits**: Documented 50 req / 10s per board.

### Ashby

- **API**: `https://api.ashbyhq.com/posting-api/job-board/{org}?includeCompensation=true`
- **Auth**: None for public boards.
- **Fields**: `jobUrl`, `publishedAt`, `descriptionHtml` / `descriptionPlain`, etc.

## Layer B — Aggregators (implemented)

| Source | Mechanism | Notes |
|--------|-----------|--------|
| RemoteOK | JSON API | Broad remote tech roles; keyword gate |
| Remotive | JSON API | Category sweep + keywords |
| Generic RSS/Atom | `provider: rss_feed` + `feed_url` | For stable newsletter/board feeds |

## Layer B/C — still planned (not in repo)

| Source | Notes |
|--------|--------|
| YC Work at a Startup | HTML; dedicated parser |
| Hacker News “Who is hiring” | Monthly; Algolia HN API or thread parse |
| LinkedIn / Indeed | Partner APIs or vendor data; legal review |
| Custom career pages | Per-site adapters or manual capture |

## Scan configuration

| Setting | Default | Notes |
|---------|---------|--------|
| `scan_frequency_minutes` | 360 | Per `sources` row |
| Cron | 2× daily UTC | [`vercel.json`](../vercel.json) → [`/api/cron/ingest`](../src/app/api/cron/ingest/route.ts) |
| `manual` sources | — | Skipped by automated scan |

## Company curation

Use the `sources` table: one row per board/feed. Seeds live in [`supabase/migrations/`](../supabase/migrations/) (`001`–`003`). Add rows for PLG/revops-heavy companies (Lever/Greenhouse/Ashby slugs from careers URLs).

## Canonical job shape (post-normalization)

Matches [`NormalizedJob`](../src/lib/types/ingestion.types.ts): `externalId`, `externalUrl`, `title`, `descriptionRaw` / `descriptionPlain`, `companyName`, `location`, `isRemote`, `department`, `employmentType`, `postedAt`, `sourceType` including `lever` | `greenhouse` | `ashby` | `rss` | `manual`.

## Compliance

Prefer **public APIs** and **feeds you’re allowed to poll**. For LinkedIn and members-only Slack job channels, use **manual entry** or a licensed data provider rather than scraping behind logins.
