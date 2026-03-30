import { runLeverScan } from "@/lib/ingestion/runner";

export const dynamic = "force-dynamic";
/** Allow long Lever fetches + many inserts on Pro / Fluid Compute. */
export const maxDuration = 300;

function unauthorized() {
  return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return unauthorized();
  }

  const url = new URL(request.url);
  const sourceIdParam = url.searchParams.get("sourceId");
  const sourceId =
    typeof sourceIdParam === "string" && sourceIdParam.trim()
      ? sourceIdParam.trim()
      : undefined;

  const result = await runLeverScan({ sourceId });

  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.error },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    scanId: result.scanId,
    sourceId: result.sourceId,
    sourceName: result.sourceName,
    jobsFound: result.jobsFound,
    jobsNew: result.jobsNew,
    jobsDuplicate: result.jobsDuplicate,
  });
}
