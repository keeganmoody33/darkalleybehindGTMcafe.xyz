-- GTM Sonar OS — Initial Schema
-- Matches docs/BACKEND_STRUCTURE.md exactly.

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE companies (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL UNIQUE,
  domain          text,
  inferred_stage  text,       -- seed, series-a, series-b, growth, public, unknown
  employee_count_range text,  -- 1-10, 11-50, 51-200, 201-500, 500+
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SOURCES
-- ============================================================
CREATE TABLE sources (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text        NOT NULL,
  type                    text        NOT NULL,  -- lever, greenhouse, ashby, manual
  config                  jsonb       NOT NULL DEFAULT '{}',
  is_active               boolean     NOT NULL DEFAULT true,
  scan_frequency_minutes  integer     NOT NULL DEFAULT 360,
  last_scanned_at         timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SCANS
-- ============================================================
CREATE TABLE scans (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       uuid        NOT NULL REFERENCES sources(id),
  status          text        NOT NULL DEFAULT 'pending',  -- pending, running, completed, failed
  started_at      timestamptz,
  completed_at    timestamptz,
  jobs_found      integer     NOT NULL DEFAULT 0,
  jobs_new        integer     NOT NULL DEFAULT 0,
  jobs_duplicate  integer     NOT NULL DEFAULT 0,
  error_message   text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE jobs (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid        NOT NULL REFERENCES companies(id),
  source_id         uuid        NOT NULL REFERENCES sources(id),
  external_id       text,
  external_url      text        NOT NULL,
  title             text        NOT NULL,
  description_raw   text,
  description_plain text,
  location          text,
  is_remote         boolean     NOT NULL DEFAULT false,
  department        text,
  employment_type   text,       -- full-time, contract, part-time
  posted_at         timestamptz,
  discovered_at     timestamptz NOT NULL DEFAULT now(),
  status            text        NOT NULL DEFAULT 'new',
  outreach_angle    text,
  dedupe_key        text        NOT NULL UNIQUE,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- SCORES
-- ============================================================
CREATE TABLE scores (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                  uuid        NOT NULL UNIQUE REFERENCES jobs(id),
  founding_score          integer     NOT NULL,
  builder_score           integer     NOT NULL,
  gtm_fit_score           integer     NOT NULL,
  noise_penalty           integer     NOT NULL,
  prestige_trap_penalty   integer     NOT NULL,
  overall_score           integer     NOT NULL,
  explanation             jsonb       NOT NULL,
  scored_at               timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- NOTES
-- ============================================================
CREATE TABLE notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      uuid        NOT NULL REFERENCES jobs(id),
  content     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- STATUS HISTORY
-- ============================================================
CREATE TABLE status_history (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      uuid        NOT NULL REFERENCES jobs(id),
  from_status text        NOT NULL,
  to_status   text        NOT NULL,
  changed_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_jobs_status      ON jobs (status);
CREATE INDEX idx_jobs_company_id  ON jobs (company_id);
CREATE INDEX idx_scores_overall   ON scores (overall_score DESC);
CREATE INDEX idx_scans_source     ON scans (source_id, created_at DESC);
CREATE INDEX idx_notes_job_id     ON notes (job_id);
CREATE INDEX idx_status_history_job_id ON status_history (job_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Test company
INSERT INTO companies (name, domain, inferred_stage, employee_count_range)
VALUES ('Ramp', 'ramp.com', 'series-b', '201-500');

-- Test source (Lever adapter for Ramp)
INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
VALUES (
  'Lever - Ramp',
  'lever',
  '{"company_slug": "ramp"}',
  true,
  360
);
