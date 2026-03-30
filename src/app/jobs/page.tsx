import Link from "next/link";

import { getPublicJobs } from "@/lib/public/jobs";

function toInt(value: string | string[] | undefined): number | null {
  if (!value) return null;
  const s = Array.isArray(value) ? value[0] : value;
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function toStr(value: string | string[] | undefined): string {
  if (!value) return "";
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function formatIso(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export default async function JobsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await props.searchParams) ?? {};

  const q = toStr(sp.q).trim();
  const status = toStr(sp.status).trim();
  const minScore = toInt(sp.minScore);

  const result = await getPublicJobs({
    q: q || undefined,
    status: status || undefined,
    minScore: minScore ?? undefined,
    limit: 50,
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Jobs</h1>
        <p className="text-sm text-muted">
          Public read-only browse. Ops actions (scan, edit, status changes) are
          private.
        </p>
      </div>

      <form
        method="get"
        className="mt-6 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3"
      >
        <label className="grid gap-1 text-sm">
          <span className="text-muted">Search title</span>
          <input
            name="q"
            defaultValue={q}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            placeholder="e.g. Founding GTM Engineer"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-muted">Status</span>
          <select
            name="status"
            defaultValue={status || "all"}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="all">All</option>
            <option value="new">new</option>
            <option value="reviewed">reviewed</option>
            <option value="shortlisted">shortlisted</option>
            <option value="applied">applied</option>
            <option value="outreach_sent">outreach_sent</option>
            <option value="interviewing">interviewing</option>
            <option value="archived">archived</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-muted">Min overall score</span>
          <input
            name="minScore"
            defaultValue={minScore ?? ""}
            inputMode="numeric"
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            placeholder="e.g. 70"
          />
        </label>

        <div className="flex flex-wrap gap-2 sm:col-span-3">
          <button className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">
            Apply filters
          </button>
          <Link
            href="/jobs"
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm leading-9 text-muted hover:bg-muted hover:text-foreground"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-6 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="text-sm text-muted">
            {result.ok ? (
              <>
                Showing <span className="text-foreground">{result.jobs.length}</span>
                {typeof result.total === "number" ? (
                  <>
                    {" "}
                    of <span className="text-foreground">{result.total}</span>
                  </>
                ) : null}
              </>
            ) : (
              <>Unable to load jobs</>
            )}
          </p>
          <p className="text-xs text-muted">Limit: 50</p>
        </div>

        {!result.ok ? (
          <div className="px-4 py-6 text-sm">
            <p className="text-destructive">{result.error}</p>
            <p className="mt-2 text-muted">
              If this is a permissions issue, it means we need RLS/public read
              policies or server-only reads from a privileged role (admin-only).
            </p>
          </div>
        ) : result.jobs.length === 0 ? (
          <div className="px-4 py-10 text-sm text-muted">
            No jobs yet. Once ingestion starts, this page will populate
            automatically from the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b border-border text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Discovered</th>
                </tr>
              </thead>
              <tbody>
                {result.jobs.map((j) => (
                  <tr key={j.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <a
                        href={j.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-foreground hover:underline"
                      >
                        {j.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {j.companyName ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted">
                      {j.overallScore ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">{j.status}</td>
                    <td className="px-4 py-3 text-muted">
                      {j.sourceName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatIso(j.discovered_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

