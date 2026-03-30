# QA Checklist

## Per-Feature Checklist

Before marking any implementation step as complete:

### Functionality
- [ ] Feature works as described in the relevant doc (PRD, APP_FLOW, etc.).
- [ ] Edge cases are handled (empty state, error state, loading state).
- [ ] Data persists correctly (check database after action).
- [ ] No console errors in browser dev tools.
- [ ] No unhandled promise rejections in server logs.

### Accessibility
- [ ] All interactive elements are keyboard-navigable (Tab, Enter, Escape).
- [ ] Screen reader announces meaningful labels (not "button" or "link").
- [ ] Color is not the sole indicator of state.
- [ ] Focus management is correct (drawers trap focus, modals return focus on close).
- [ ] `prefers-reduced-motion` is respected (animations degrade gracefully).

### Responsiveness
- [ ] Works on mobile viewport (375px).
- [ ] Works on tablet viewport (768px).
- [ ] Works on desktop viewport (1280px+).
- [ ] No horizontal scroll on any viewport.
- [ ] Touch targets are at least 44x44px on mobile.

### Performance
- [ ] No unnecessary client-side JavaScript (Server Components used where possible).
- [ ] Images use `next/image` with proper sizing.
- [ ] No layout shift on load (CLS < 0.1).
- [ ] Time to interactive is reasonable (< 3s on 3G simulation).

### Data Integrity
- [ ] Deduplication prevents duplicate records on re-scan.
- [ ] Status transitions follow the allowed state machine.
- [ ] Scores are within 0–100 range.
- [ ] Timestamps are in UTC.

### Documentation
- [ ] `COMPONENT_MAP.md` updated if new components were added.
- [ ] `DATA_FLOW.md` updated if data movement changed.
- [ ] `ADR.md` updated if architecture decisions were made.
- [ ] `TECH_STACK.md` updated if dependencies were added.
- [ ] `progress.txt` updated with session summary.
- [ ] `lessons.md` updated if a new lesson was learned.

## Pre-Deploy Checklist

Before deploying to Vercel:

- [ ] `npm run build` succeeds with no errors.
- [ ] `npm run lint` passes.
- [ ] TypeScript has no type errors.
- [ ] Environment variables are configured in Vercel project settings.
- [ ] Database migrations are applied to hosted Supabase.
- [ ] `.env.local` is in `.gitignore`.
- [ ] No hardcoded secrets in source code.
