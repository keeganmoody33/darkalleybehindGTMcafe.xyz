-- Manual ingestion target + extra GTM-relevant ATS sources (idempotent).

INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
SELECT 'Manual — ops entry', 'manual', '{}'::jsonb, true, 1440
WHERE NOT EXISTS (SELECT 1 FROM sources WHERE type = 'manual' AND name = 'Manual — ops entry');

INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
SELECT 'Lever - Vercel', 'lever', '{"company_slug": "vercel", "company_name": "Vercel"}'::jsonb, true, 360
WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'Lever - Vercel');

INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
SELECT 'Greenhouse - Databricks', 'greenhouse', '{"board_token": "databricks", "company_name": "Databricks"}'::jsonb, true, 360
WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'Greenhouse - Databricks');

INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
SELECT 'Greenhouse - Figma', 'greenhouse', '{"board_token": "figma", "company_name": "Figma"}'::jsonb, true, 360
WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'Greenhouse - Figma');

INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
SELECT 'Ashby - Deel', 'ashby', '{"org_id": "deel", "company_name": "Deel"}'::jsonb, true, 360
WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'Ashby - Deel');

-- Example generic RSS: set `feed_url` to any public job RSS/Atom (some sites block bots).
-- Leave inactive until you confirm the URL works with GTMSonarBot User-Agent.
INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
SELECT 'RSS feed (configure URL)', 'rss', '{"provider": "rss_feed", "feed_url": "", "company_name": "Custom feed", "keywords": ["engineer", "gtm", "sales", "revenue", "growth"]}'::jsonb, false, 720
WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'RSS feed (configure URL)');
