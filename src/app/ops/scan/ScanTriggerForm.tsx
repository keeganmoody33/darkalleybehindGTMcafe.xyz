"use client";

import { useActionState } from "react";

import {
  triggerScanAction,
  type ScanActionState,
} from "@/app/actions/triggerScan.action";

const initial: ScanActionState = { ok: false, message: "" };

export function ScanTriggerForm() {
  const [state, formAction, pending] = useActionState(
    triggerScanAction,
    initial
  );

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        <span className="text-muted">OPS secret</span>
        <input
          type="password"
          name="secret"
          required
          autoComplete="off"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-muted">Source id (optional)</span>
        <input
          name="sourceId"
          placeholder="Leave empty to scan every active source"
          className="h-10 rounded-lg border border-input bg-background px-3 font-mono text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Running…" : "Run ingestion scan"}
      </button>

      {state.message ? (
        <p
          className={
            state.ok ? "text-sm text-sonar-accent" : "text-sm text-destructive"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
