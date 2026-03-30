import { supabaseServer } from "@/lib/db/supabaseServer";

export default async function Home() {
  const hasEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));

  let companyCount: number | null = null;
  let dbNote: string | null = null;

  if (hasEnv) {
    const result = await supabaseServer
      .from("companies")
      .select("id", { count: "exact", head: true });

    if (result.error) {
      dbNote = `DB read failed: ${result.error.message}`;
    } else {
      companyCount = result.count ?? 0;
    }
  } else {
    dbNote = "DB not configured yet (missing Supabase env vars).";
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
        <h1 className="text-2xl font-semibold tracking-tight">GTM Sonar OS</h1>
        <p className="text-sm text-muted">Scanning for founding GTM opportunities.</p>
      </div>

      <div className="max-w-lg text-sm text-muted">
        <p>
          Phase 1 verification: server-side DB read path{" "}
          {companyCount === null ? "not verified" : "verified"}.
        </p>
        {companyCount !== null ? (
          <p>Companies in DB: {companyCount}</p>
        ) : (
          <p>{dbNote}</p>
        )}
      </div>
    </main>
  );
}
