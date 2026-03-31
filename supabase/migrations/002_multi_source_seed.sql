-- Additional ingestion sources: Greenhouse, Ashby, RSS aggregators (GTM keyword filter in app).
-- Idempotent: skips if a source with the same name already exists.

INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
SELECT 'Greenhouse - Stripe', 'greenhouse', '{"board_token": "stripe", "company_name": "Stripe"}'::jsonb, true, 360
WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'Greenhouse - Stripe');

INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
SELECT 'Ashby - Linear', 'ashby', '{"org_id": "linear", "company_name": "Linear"}'::jsonb, true, 360
WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'Ashby - Linear');

INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
SELECT 'RSS - RemoteOK (GTM keywords)', 'rss', '{"provider": "remoteok"}'::jsonb, true, 360
WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'RSS - RemoteOK (GTM keywords)');

INSERT INTO sources (name, type, config, is_active, scan_frequency_minutes)
SELECT 'RSS - Remotive (GTM keywords)', 'rss', '{"provider": "remotive"}'::jsonb, true, 360
WHERE NOT EXISTS (SELECT 1 FROM sources WHERE name = 'RSS - Remotive (GTM keywords)');
