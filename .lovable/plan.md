# Construction Drawing Motion System

A subtle, bespoke technical-drawing layer applied site-wide. Charcoal + bronze + warm grey. No blueprint blue, no sci-fi, no clutter.

## 1. Design tokens (`src/index.css`, `tailwind.config.ts`)

Add semantic tokens (HSL) — reuse existing charcoal palette:
- `--draft-line`: warm charcoal `30 8% 22%` @ low opacity use
- `--draft-bronze`: `28 45% 52%`
- `--draft-bronze-soft`: `28 35% 60%`
- `--draft-grid`: charcoal @ 3%
- `--draft-warm-grey`: `30 6% 65%`

Keyframes:
- `draw-line` (stroke-dashoffset N → 0, 1100ms `cubic-bezier(0.45,0,0.15,1)`)
- `tick-in` (scaleX 0 → 1, 600ms)
- `mask-reveal` (clip-path inset 100% → 0, 1200ms)
- `plan-drift` (translateX subtle, 18s linear infinite, very low opacity)
- `fade-page` (opacity + 4px lift, 500ms — replaces white flash)

Utilities:
- `.bg-draft-grid` — 80px charcoal grid SVG, 3% opacity
- `.bg-plan-lines` — diagonal/horizontal faint plan motif, animated drift
- `.draft-corner` — corner-bracket pseudo-elements (12px, bronze, 1px)

## 2. Reusable primitives (`src/components/draft/`)

- `DraftLine.tsx` — horizontal/vertical SVG line that draws on scroll-in via IntersectionObserver (uses `prefers-reduced-motion` + mobile downscale).
- `DraftTicks.tsx` — row of measurement ticks, staggered tick-in.
- `DraftCorners.tsx` — wraps children with 4 bronze corner brackets (absolute positioned).
- `DraftSectionLabel.tsx` — small "§ 03 / SERVICES" overline with bronze numeral + warm grey label, 0.45em tracking.
- `DraftStatusCode.tsx` — pill-less monospace code like `PE-MR-024 · IN BUILD`.
- `DraftPlanBackdrop.tsx` — absolutely-positioned faint SVG plan lines, animated drift, `pointer-events-none`, mobile reduces opacity/disables motion.
- `DraftHoverFrame.tsx` — wraps an interactive card; on hover, animates 1px border + corner ticks "activating".
- `DraftReveal.tsx` — image mask reveal (clip-path) on scroll-in.
- `PageTransition.tsx` — wraps `<Routes>`; AnimatePresence fade (no white), uses background color of theme.

All primitives:
- Respect `prefers-reduced-motion` (skip animation, end state only).
- Use `IntersectionObserver` once-only.
- Mobile (`<768px`): shorter durations, ticks/brackets only, no infinite drift.

## 3. Page integrations

| Surface | Additions |
|---|---|
| `App.tsx` / router | `PageTransition` wrapper; remove any white flash bg |
| Homepage hero | `DraftPlanBackdrop` constrained to text column only (left half), `DraftSectionLabel` "§ 01" |
| Services cards (`ServicesGrid` / `ServiceDetail`) | bronze numeral, `DraftTicks` under title, `DraftHoverFrame` border line, `DraftPlanBackdrop` faint behind section |
| Selected Works / project cards | `DraftCorners` around image, `DraftStatusCode` (e.g. `PE-MR-024 · RESOLVED`), thin connector line from title → image corner |
| Field Notes timeline (`BuildTimeline` or Field Notes page) | replace timeline rule with `DraftLine` vertical, chapter markers as bronze tick + numeral |
| About sections (horseman / craft / groundwork) | `DraftLine` connectors between sections, `DraftSectionLabel` per section |
| Between major sections site-wide | `<DraftLine variant="horizontal" />` divider (1px, draws on enter) — added to `Layout` slots where applicable |
| Global background | optional `bg-draft-grid` on neutral sections (very subtle) |

## 4. Performance & a11y

- All SVGs inline, no extra requests.
- IntersectionObserver disconnect after first reveal.
- `will-change` only during active animation, removed after.
- `prefers-reduced-motion: reduce` → end-state only, no drift loops.
- Mobile: drift loops disabled, durations halved.

## 5. Out of scope

- No content/copy changes.
- No restructuring of existing components beyond inserting primitives.
- No new images.

## Build order

1. Tokens + keyframes + utilities.
2. Primitives in `src/components/draft/`.
3. `PageTransition` + router wrap (kills white flash).
4. Integrate into Services, Selected Works, Field Notes, About, Homepage hero — in that order.

After step 3 the user will see immediate site-wide effect; steps 4 are progressive enhancements per page.
