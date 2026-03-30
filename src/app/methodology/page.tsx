import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

export default async function MethodologyPage() {
  const scoringPath = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "docs",
    "SCORING_LOGIC.md"
  );
  const scoring = await readFile(scoringPath, "utf8");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Methodology</h1>
        <p className="text-sm text-muted">
          Canonical scoring doctrine (rendered directly from{" "}
          <span className="font-mono">docs/SCORING_LOGIC.md</span>).
        </p>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-foreground">
          {scoring}
        </pre>
      </section>
    </main>
  );
}

