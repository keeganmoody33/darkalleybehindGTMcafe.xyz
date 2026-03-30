# GTM Sonar OS — Ingestion Sources

## Strategy

v1 focuses on **structured ATS API endpoints** — they return clean JSON, are publicly accessible for job listings, and cover most startups. Scraping is out of scope for v1.

## v1 Sources

### 1. Lever (Primary)

- **API**: `https://api.lever.co/v0/postings/{company}?mode=json`
- **Auth**: None required for public postings.
- **Rate limits**: Undocumented but generous for public endpoints. Recommend 1 req/sec.
- **Response shape**: Array of posting objects with `id`, `text` (title), `description` (HTML), `categories` (team, location, commitment), `createdAt`, `hostedUrl`.
- **Normalization notes**: Description is HTML — strip to plain text for scoring. `categories.commitment` maps to `employment_type`. `categories.location` maps to `location`. Remote detection from location string.
- **Target companies**: Curated list of startups known to use Lever (configurable in `sources` table).

### 2. Greenhouse (Secondary)

- **API**: `https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs`
- **Auth**: None required for public job board API.
- **Rate limits**: Documented at 50 req/10 sec.
- **Response shape**: `{ jobs: [{ id, title, location: { name }, content, updated_at, absolute_url }] }`. Detail endpoint: `/v1/boards/{board_token}/jobs/{id}` for full HTML content.
- **Normalization notes**: `content` is HTML. Location parsing required. No explicit remote flag — infer from location string.
- **Target companies**: Curated list (configurable).

### 3. Ashby (Tertiary)

- **API**: `https://api.ashbyhq.com/posting-api/job-board/{org}`
- **Auth**: None required for public job board.
- **Response shape**: `{ jobs: [{ id, title, location, employmentType, department, publishedAt, externalLink }] }`.
- **Normalization notes**: Cleaner structure than Lever/Greenhouse. Description may require separate detail fetch.
- **Target companies**: Curated list (configurable).

## Planned v2 Sources

| Source | Type | Notes |
|---|---|---|
| Y Combinator Work at a Startup | Aggregator | Structured listings, would need scraping or API discovery |
| Wellfound (AngelList) | Aggregator | API access varies; may need auth |
| Hacker News "Who is Hiring" | Monthly thread | Parse structured comments |
| LinkedIn Jobs | Platform | Requires API access or scraping (complex) |
| Custom company career pages | Scraping | Per-company adapters |

## Scan Configuration

| Setting | Default | Notes |
|---|---|---|
| `scan_frequency_minutes` | 360 (6 hours) | Per-source, configurable |
| Max concurrent fetches | 3 | Avoid rate limit issues |
| Retry on failure | 2 attempts with exponential backoff | |
| Stale threshold | 60 days | Jobs older than this get noise penalty |

## Company Curation

The `sources` table stores which companies to scan on each ATS. Initial seeding:

1. Manually add 10–20 target companies per ATS platform.
2. Focus on: seed/series-A startups, companies known to hire GTM engineers, companies in the user's target market.
3. Over time, add companies discovered through the review process.

## Canonical Job Shape (post-normalization)

```typescript
interface NormalizedJob {
  externalId: string;
  externalUrl: string;
  title: string;
  descriptionRaw: string;      // Original HTML/markdown
  descriptionPlain: string;    // Stripped text for scoring
  companyName: string;
  location: string | null;
  isRemote: boolean;
  department: string | null;
  employmentType: string | null;
  postedAt: Date | null;
  sourceType: 'lever' | 'greenhouse' | 'ashby';
}
```
