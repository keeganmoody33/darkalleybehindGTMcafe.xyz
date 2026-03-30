import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Ingestion writes (jobs, scans) require the service role — not the anon key.
 */
export function getSupabaseIngestClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Ingestion requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only)."
    );
  }

  return createClient(url, key);
}
