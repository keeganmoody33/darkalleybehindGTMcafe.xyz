# GTM Sonar OS — Visual Language Map

## Core Metaphor

The interface is a **sonar/radar command center**. The user is an operator scanning for high-value targets (founding GTM roles) in a noisy field. Every visual element encodes operational meaning.

## Visual Elements and Their Meanings

### Radar Canvas

| Element | Visual | Meaning |
|---|---|---|
| **Center point** | Bright accent dot | The user (you) |
| **Pulse rings** | Concentric circles radiating outward | Score thresholds (inner = high score, outer = low score) |
| **Sweep line** | Rotating radial line, accent-colored | Active scanning; reveals new contacts on pass |
| **Contact blip** | Small dot/marker on the radar field | A job posting |
| **Blip distance from center** | Closer = higher overall score | Score magnitude |
| **Blip angle/sector** | Grouped by title family or category | Role type clustering |
| **Blip brightness** | Brighter = newer or higher score | Recency + quality |
| **Blip size** | Slightly larger for higher founding score | Founding signal strength |
| **Blip color** | Accent (high fit) → muted (low fit) → warning (penalized) | Score quality band |
| **Fading blip** | Opacity decreasing | Aging or archived contact |

### Scan Events

| Event | Visual | Meaning |
|---|---|---|
| **Scan start** | Sweep line accelerates briefly, pulse ring emits | New scan initiated |
| **New contacts found** | Blips appear at perimeter, fade in as sweep passes | Newly discovered jobs |
| **High-score match** | Brief glow burst on contact + event log entry | A role scored above threshold |
| **Scan complete** | Sweep returns to normal speed | Scan finished |
| **Scan failure** | Sweep line flickers, red tint on affected sector | Source returned an error |

### Status Indicators

| Status | Visual on radar | Visual in tactical | Color |
|---|---|---|---|
| `new` | Full brightness, slight pulse | No icon, bold text | accent |
| `reviewed` | Steady brightness | Eye icon | foreground |
| `shortlisted` | Inner ring glow | Star icon | accent-bright |
| `applied` | Ring around blip | Send icon | info |
| `outreach_sent` | Double ring | Mail icon | info |
| `interviewing` | Pulsing glow | Calendar icon | warning (attention) |
| `archived` | Dim, nearly invisible | Archive icon, muted text | muted |

### Score Bands

| Band | Score range | Color treatment | Radar behavior |
|---|---|---|---|
| **Hot** | 80–100 | Bright accent, slight glow | Inner rings, large blip |
| **Warm** | 60–79 | Standard accent | Mid-field |
| **Cool** | 40–59 | Dimmed accent | Outer rings |
| **Cold** | 20–39 | Muted / zinc tones | Perimeter, small blip |
| **Noise** | 0–19 | Near-invisible or filtered out | Hidden by default |

## Panels and Surfaces

| Surface | Role | Visual treatment |
|---|---|---|
| **Radar canvas** | Primary view, spatial overview | Dark background, no border, full bleed |
| **Intel panel** | Selected contact detail | Surface-raised, right-docked, subtle border |
| **Event log** | Scan activity and status changes | Surface, bottom-docked, monospace text |
| **Toolbar/header** | Mode switch, filters, scan controls | Surface, top-fixed, minimal height |
| **Detail drawer** | Full job detail (tactical mode) | Surface-raised, slides from right |
| **Filter bar** | Active filter chips | Inline, subtle background |

## What NOT to Do

- No spinning globes or 3D radar effects.
- No Hollywood-style "hacking" aesthetics.
- No gratuitous particle effects.
- No sound effects that play without user opt-in.
- No color-only status indicators (always pair with icon/label).
- No animation that runs when nothing is happening.
- No blur/glassmorphism that reduces text readability.
