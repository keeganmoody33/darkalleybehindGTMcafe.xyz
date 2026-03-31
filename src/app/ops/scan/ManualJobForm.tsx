"use client";

import { useActionState } from "react";

import {
  insertManualJobAction,
  type ManualJobActionState,
} from "@/app/actions/insertManualJob.action";

const initial: ManualJobActionState = { ok: false, message: "" };

export function ManualJobForm() {
  const [state, formAction, pending] = useActionState(
    insertManualJobAction,
    initial,
  );

  return (
    <form action={formAction} className="mt-8 grid gap-4 border-t border-border pt-8">
      <h2 className="text-sm font-semibold tracking-tight">Manual job (Slack, newsletter, etc.)</h2>
      <p className="text-xs text-muted">
        Inserts one row into <code className="rounded bg-muted px-1 font-mono">jobs</code>{" "}
        with source type <code className="rounded bg-muted px-1 font-mono">manual</code>, then scores it.
      </p>

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
        <span className="text-muted">Job title</span>
        <input
          name="title"
          required
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          placeholder="e.g. Founding GTM Engineer"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-muted">Company name</span>
        <input
          name="companyName"
          required
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-muted">Job URL</span>
        <input
          name="url"
          type="url"
          required
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          placeholder="https://…"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-muted">Description (optional)</span>
        <textarea
          name="description"
          rows={4}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-muted">Location (optional)</span>
        <input
          name="location"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-muted">Posted date (optional, ISO or YYYY-MM-DD)</span>
        <input
          name="postedAt"
          type="date"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="isRemote"
          className="h-4 w-4 rounded border-input"
        />
        Remote
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-10 w-fit rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        {pending ? "Saving…" : "Insert manual job"}
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
