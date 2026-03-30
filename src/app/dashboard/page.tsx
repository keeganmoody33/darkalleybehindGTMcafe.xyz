import { getDashboardJobs } from "@/lib/data/jobs";
import { DashboardShell } from "./DashboardShell";

function toStr(value: string | string[] | undefined): string {
  if (!value) return "";
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function toInt(value: string | string[] | undefined): number | null {
  if (!value) return null;
  const s = Array.isArray(value) ? value[0] : value;
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

export default async function DashboardPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await props.searchParams) ?? {};

  const q = toStr(sp.q).trim();
  const status = toStr(sp.status).trim();
  const minScore = toInt(sp.minScore);
  const sortBy = toStr(sp.sortBy).trim() as "score" | "date" | "title" | "";
  const isRemote = toStr(sp.isRemote).trim();

  const result = await getDashboardJobs({
    q: q || undefined,
    status: status && status !== "all" ? status : undefined,
    minScore: minScore ?? undefined,
    sortBy: (sortBy as "score" | "date" | "title") || "score",
    sortDir: "desc",
    isRemote: isRemote === "true" ? true : undefined,
    limit: 100,
  });

  const jobs = result.ok ? result.jobs : [];
  const total = result.ok ? result.total : 0;

  const filters = {
    q: q || undefined,
    status: status || undefined,
    minScore: minScore?.toString() ?? undefined,
    sortBy: sortBy || undefined,
    isRemote: isRemote || undefined,
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Command Center</h1>
          <p className="text-xs text-zinc-500">Tactical review mode</p>
        </div>
      </div>

      <DashboardShell
        jobs={jobs}
        total={total}
        initialFilters={filters}
        error={!result.ok ? result.error : undefined}
      />
    </main>
  );
}
