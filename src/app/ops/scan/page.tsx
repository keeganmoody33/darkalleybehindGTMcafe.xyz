import type { Metadata } from "next";

import { ScanTriggerForm } from "./ScanTriggerForm";

export const metadata: Metadata = {
  title: "Ops — Scan",
  robots: { index: false, follow: false },
};

export default function OpsScanPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Lever ingestion</h1>
        <p className="text-sm text-muted">
          Server-side scan only. Requires{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            OPS_SCAN_SECRET
          </code>
          . Not linked in public navigation.
        </p>
      </div>
      <ScanTriggerForm />
    </main>
  );
}
