"use server";

import { runIngestionScan } from "@/lib/ingestion/runner";

export type ScanActionState = {
  ok: boolean;
  message: string;
};

const initialUnauthorized: ScanActionState = {
  ok: false,
  message: "Could not run scan.",
};

export async function triggerScanAction(
  _prevState: ScanActionState,
  formData: FormData
): Promise<ScanActionState> {
  if (!process.env.OPS_SCAN_SECRET) {
    return {
      ok: false,
      message:
        "Server misconfiguration: set OPS_SCAN_SECRET in the environment.",
    };
  }

  const secret = String(formData.get("secret") ?? "");
  if (secret !== process.env.OPS_SCAN_SECRET) {
    return initialUnauthorized;
  }

  const sourceIdRaw = formData.get("sourceId");
  const sourceId =
    typeof sourceIdRaw === "string" && sourceIdRaw.trim()
      ? sourceIdRaw.trim()
      : undefined;

  const result = await runIngestionScan({ sourceId });

  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  const parts = result.results.map((r) =>
    r.ok
      ? `${r.sourceName}: found ${r.jobsFound}, new ${r.jobsNew}, dup ${r.jobsDuplicate}${r.scanId ? ` (${r.scanId.slice(0, 8)}…)` : ""}`
      : `${r.sourceName}: failed — ${r.error ?? "unknown"}`
  );

  return {
    ok: true,
    message: `Done — ${parts.join(" · ")}`,
  };
}
