import { runIngestionScan } from "@/lib/ingestion/runner";

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

  const result = await runIngestionScan({ sourceId });

  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.error },
      { status: 500 }
    );
  }

  const failed = result.results.filter((r) => !r.ok);
  const totals = result.results.reduce(
    (acc, r) => ({
      jobsFound: acc.jobsFound + r.jobsFound,
      jobsNew: acc.jobsNew + r.jobsNew,
      jobsDuplicate: acc.jobsDuplicate + r.jobsDuplicate,
    }),
    { jobsFound: 0, jobsNew: 0, jobsDuplicate: 0 }
  );

  if (failed.length === result.results.length && result.results.length > 0) {
    return Response.json(
      {
        ok: false,
        error: failed[0]?.error ?? "All source scans failed.",
        results: result.results,
        totals,
      },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    results: result.results,
    totals,
    partialFailures: failed.length > 0 ? failed : undefined,
  });
}
