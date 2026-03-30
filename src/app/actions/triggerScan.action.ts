"use server";

import { runLeverScan } from "@/lib/ingestion/runner";

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

  const result = await runLeverScan({ sourceId });

  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  return {
    ok: true,
    message: `Done — ${result.sourceName}: found ${result.jobsFound}, inserted ${result.jobsNew}, skipped ${result.jobsDuplicate} duplicates (scan ${result.scanId}).`,
  };
}
