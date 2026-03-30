# Inspiration Log

## Template

- **Date**:
- **Reference name**:
- **Link / screenshot path**:
- **Category**: layout / motion / radar / panel / typography / sound / interaction / data-viz
- **What to borrow**:
- **What not to copy**:
- **How to adapt for GTM Sonar OS**:
- **Affected docs/components**:
- **Status**: observed / adopted / rejected

---

## Entries

### INS-001: Submarine sonar displays (real military CRT)

- **Date**: 2026-03-30
- **Reference name**: US Navy AN/SQS-53 sonar console screenshots
- **Link / screenshot path**: reference only (web search "submarine sonar display")
- **Category**: radar / layout
- **What to borrow**: Circular sweep with radial scan line. Contacts as bright marks that fade. Monochrome phosphor palette (green or amber on black). Sparse, functional labeling.
- **What not to copy**: CRT scan-line artifacts. Noisy static overlays. Low-resolution jagged rendering.
- **How to adapt for GTM Sonar OS**: Use smooth SVG rendering with the emerald accent palette. Contacts are crisp circles, not pixel blobs. Labels appear on hover/select, not cluttering the field. Fade-out is opacity-based, not noise-based.
- **Affected docs/components**: `VISUAL_LANGUAGE_MAP.md`, `RadarCanvas` component
- **Status**: adopted

### INS-002: Linear app — dense list UI + keyboard navigation

- **Date**: 2026-03-30
- **Reference name**: Linear (linear.app) issue tracker
- **Link / screenshot path**: https://linear.app
- **Category**: layout / interaction
- **What to borrow**: Dense table rows with strong type hierarchy. Keyboard-first navigation. Status pills with color + icon. Side panel for detail without leaving context. Command palette for quick actions.
- **What not to copy**: Purple-heavy brand palette. Issue-specific metadata (cycles, projects).
- **How to adapt for GTM Sonar OS**: Apply to tactical mode. Dark zinc background. Status pills use our status colors. Detail drawer replaces Linear's side peek. Keyboard nav for row selection + status changes.
- **Affected docs/components**: `FRONTEND_GUIDELINES.md`, `JobTable`, `DetailDrawer`
- **Status**: adopted
