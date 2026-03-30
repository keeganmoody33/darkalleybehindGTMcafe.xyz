# GTM Sonar OS — Frontend Guidelines

## Design System Foundation

- **Theme**: Dark-first. The default and primary experience is a dark command console.
- **Component library**: shadcn/ui (Radix primitives + Tailwind). All tactical UI (tables, drawers, dialogs, buttons, inputs, filters) uses shadcn/ui components.
- **Custom visuals**: The radar/sonar canvas is hand-built SVG + React. It does not use shadcn/ui or any charting library.

## Color Tokens

| Token | Role | Value (approx) |
|---|---|---|
| `--background` | Page background | zinc-950 / `#09090b` |
| `--surface` | Card/panel background | zinc-900 / `#18181b` |
| `--surface-raised` | Elevated panels, drawers | zinc-800 / `#27272a` |
| `--border` | Borders, dividers | zinc-700 / `#3f3f46` |
| `--foreground` | Primary text | zinc-50 / `#fafafa` |
| `--muted` | Secondary text | zinc-400 / `#a1a1aa` |
| `--accent` | Primary accent (radar energy) | emerald-400 / `#34d399` |
| `--accent-dim` | Low-energy accent | emerald-700 / `#047857` |
| `--danger` | Destructive actions, penalties | red-500 / `#ef4444` |
| `--warning` | Caution, noise indicators | amber-500 / `#f59e0b` |
| `--info` | Informational, neutral | sky-400 / `#38bdf8` |

## Typography

- **Interface text**: Geist Sans. Sizes: 14px body, 12px caption, 16px heading-sm, 20px heading-md, 28px heading-lg.
- **Code / metrics / IDs / timestamps**: Geist Mono.
- **Hierarchy**: Use font weight (400/500/600) and size, not color variety, to create hierarchy.

## Layout Principles

- Mobile-first breakpoints: `sm` (640), `md` (768), `lg` (1024), `xl` (1280).
- Tactical mode: full-width table, drawer slides from right on row select.
- Sonar mode: radar canvas takes primary space, intel panel on right (collapsible on mobile).
- Event log docks to bottom in both modes.
- Consistent padding: `p-4` for panels, `p-2` for dense table cells.

## Motion Rules

- Every animation must encode product meaning (see `VISUAL_LANGUAGE_MAP.md`).
- Prefer CSS transitions over JS animation libraries.
- Respect `prefers-reduced-motion`: all animations must degrade to instant transitions.
- No decorative looping animations.
- Allowed motions: sweep line rotation, contact reveal fade-in, pulse ring expansion on new scan, drawer slide, status-change highlight flash.

## Accessibility

- All interactive elements must be keyboard-navigable.
- Color is never the sole indicator of state — pair with icon, label, or pattern.
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text.
- Radar contacts must have text-equivalent labels accessible via screen reader.
- Sound is optional and muted by default.

## Component Conventions

- Components live in `src/components/`.
- Shared UI primitives (from shadcn/ui): `src/components/ui/`.
- Radar-specific components: `src/components/radar/`.
- Tactical-mode components: `src/components/tactical/`.
- Layout shells: `src/components/layout/`.
- Each component file exports a single named component.
- Props are typed with explicit interfaces (not inline).
- No barrel exports (`index.ts` re-exports) — import directly from the component file.

## State Management

- Server Components by default. Only add `'use client'` when interactivity or browser APIs are needed.
- Push `'use client'` as deep in the tree as possible.
- Server Actions for data mutations (status changes, notes, manual scan triggers).
- Client-side data: React state + SWR or direct Supabase subscriptions for live updates.

## File Naming

- Components: `PascalCase.tsx` (e.g., `RadarCanvas.tsx`, `JobTable.tsx`).
- Utilities: `camelCase.ts` (e.g., `formatScore.ts`, `dedupeJobs.ts`).
- Types: `camelCase.types.ts` (e.g., `job.types.ts`).
- Server Actions: `camelCase.action.ts` (e.g., `updateStatus.action.ts`).
- Route files: Next.js conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
