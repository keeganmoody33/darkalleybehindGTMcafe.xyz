"use client";

import Link from "next/link";

interface FilterBarProps {
  initialFilters: {
    q?: string;
    status?: string;
    minScore?: string;
    sortBy?: string;
    sortDir?: string;
    isRemote?: string;
  };
  action?: string;
}

export function FilterBar({ initialFilters, action = "/dashboard" }: FilterBarProps) {
  return (
    <form
      method="get"
      action={action}
      className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="grid gap-1 text-xs">
        <span className="text-zinc-400">Search</span>
        <input
          name="q"
          defaultValue={initialFilters.q ?? ""}
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-zinc-600"
          placeholder="Search jobs..."
        />
      </label>

      <label className="grid gap-1 text-xs">
        <span className="text-zinc-400">Status</span>
        <select
          name="status"
          defaultValue={initialFilters.status ?? "all"}
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
        >
          <option value="all">All</option>
          <option value="new">new</option>
          <option value="reviewed">reviewed</option>
          <option value="shortlisted">shortlisted</option>
          <option value="applied">applied</option>
          <option value="outreach_sent">outreach sent</option>
          <option value="interviewing">interviewing</option>
          <option value="archived">archived</option>
        </select>
      </label>

      <label className="grid gap-1 text-xs">
        <span className="text-zinc-400">Min score</span>
        <input
          name="minScore"
          defaultValue={initialFilters.minScore ?? ""}
          inputMode="numeric"
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-zinc-600"
          placeholder="e.g. 60"
        />
      </label>

      <label className="grid gap-1 text-xs">
        <span className="text-zinc-400">Sort</span>
        <select
          name="sortBy"
          defaultValue={initialFilters.sortBy ?? "score"}
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground"
        >
          <option value="score">Score (high → low)</option>
          <option value="date">Date (new → old)</option>
          <option value="title">Title (A → Z)</option>
        </select>
      </label>

      <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            name="isRemote"
            value="true"
            defaultChecked={initialFilters.isRemote === "true"}
            className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800"
          />
          Remote only
        </label>
      </div>

      <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
        <button
          type="submit"
          className="h-8 rounded-lg bg-sonar-accent px-4 text-xs font-medium text-zinc-950"
        >
          Apply
        </button>
        <Link
          href="/dashboard"
          className="flex h-8 items-center rounded-lg border border-border px-3 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-foreground"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
