# GTM Sonar OS — Product Requirements Document

## Mission

A private-first operating system for finding and tracking founding go-to-market opportunities. The product continuously ingests jobs from ATS systems and selected startup/job sources, normalizes and deduplicates them, scores them for founding/builder/GTM fit, and presents them in a cinematic sonar-style interface with a tactical productivity mode underneath it.

## v1 Scope

### In scope

- **Ingestion pipeline**: fetch structured job postings from ATS APIs (Lever, Greenhouse, Ashby) and normalize them into a canonical shape.
- **Deduplication**: prevent duplicate records from repeat scans using URL + title/company compound keys.
- **Scoring engine**: compute founding score, builder score, GTM fit score, noise penalty, prestige-trap penalty, and an overall composite score — each with a human-readable explanation.
- **Tactical review mode**: dense list/table view with filters, detail drawer, status transitions (new → reviewed → shortlisted → applied → outreach sent → interviewing → archived), notes, and outreach angle fields.
- **Sonar/radar UI**: SVG radar canvas, sweep line, pulse rings, plotted contacts, event log, detail panel — every visual encodes meaning.
- **Company intelligence**: company-level aggregation, inferred stage, notes, role-pattern detection, outreach angle generation.
- **Scheduled scans**: multiple scans per day via cron; hot-watch list for priority sources.
- **Digest/alerts**: high-score match notifications.
- **Mobile-first, accessible, performant**.

### Out of scope for v1

- Public-facing "Doctrine" / article section (documented for v2).
- Multi-user / team features.
- AI-generated cover letters or full outreach drafts (may layer in later).
- Paid integrations (LinkedIn Recruiter, etc.).

## Target Roles

Primary titles and signals:

| Title family | Examples |
|---|---|
| Founding GTM | Founding GTM Engineer, GTME, Founding Growth |
| Growth engineering | Growth Engineer, Head of Growth, Growth Lead |
| GTM leadership | Head of GTM, GTM Lead, VP GTM |
| RevOps / systems builder | RevOps Engineer, GTM Systems, Marketing Ops Architect |
| Adjacent 0→1 | First marketing hire, First revenue hire, Head of Demand Gen (at seed/A) |

A role's importance comes from its **description, company stage, and implied ownership** — not just the title string. The scoring engine must look deeper than keyword matching.

## Users

Single user: the builder (Keegan). No auth required in v1 local dev; Supabase Auth planned for hosted mode.

## Product Principles

1. **Decision engine, not job board.** Surface the *why* behind every role, not just the listing.
2. **Tactical usability beats flashy visuals.** The tactical table mode must be useful before the radar is beautiful.
3. **Every visual encodes meaning.** No decorative animations.
4. **Score, don't just list.** Scoring with explanations is the core differentiator.
5. **Private-first, hybrid-ready.** Works locally; migrates to hosted without data loss.

## Success Criteria (v1)

- Can ingest, normalize, deduplicate, and score jobs from at least 2 ATS sources.
- Can review, filter, and act on jobs in tactical mode daily.
- Scoring produces human-readable explanations that improve decision speed.
- Sonar UI reflects real data and adds spatial understanding of the opportunity landscape.
- Runs reliably on local dev and deploys to Vercel + Supabase.
