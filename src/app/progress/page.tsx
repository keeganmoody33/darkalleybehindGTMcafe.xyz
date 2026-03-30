import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

async function readLog(relPath: string) {
  const abs = path.join(process.cwd(), relPath);
  return await readFile(abs, "utf8");
}

export default async function ProgressPage() {
  const progress = await readLog("progress.txt");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Progress</h1>
        <p className="text-sm text-muted">
          Session-by-session execution log (rendered from{" "}
          <span className="font-mono">progress.txt</span>).
        </p>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-foreground">
          {progress}
        </pre>
      </section>
    </main>
  );
}

