# Peninsula Equine — Cinematic Refinement Pass

This is a directed refinement, not a rebuild. The foundation, draft motion system, and copy reset already shipped. This plan tightens art direction, image hierarchy, and mobile feel into one coherent cinematic system.

## 1. Homepage Hero (priority)

- Lock the approved sliding-stop image as the hero anchor (`src/assets/homepage-refresh/sliding-stop-hero.png`).
- Full-bleed, min-h `92dvh`, object-position tuned so horse + dust read clearly and Ciro's face stays shadowed (`object-[62%_46%]` mobile, `center` desktop).
- Bronze/charcoal grade: `brightness(0.78) contrast(1.14) saturate(0.82)`.
- Left-weighted dark gradient for legibility; remove any white flash on first paint (set `body { background: hsl(var(--background)) }` already, verify no late image swap).
- Heading: **From Dirt to Dynasty**. Body: approved horse-people line. CTAs: *Explore Selected Works* (primary, text-link with bronze rule) / *View Services* (secondary).
- Faint `DraftPlanBackdrop` masked to the text column only — never over the horse.
- Subtle parallax (translateY on scroll, max 40px, rAF-driven, disabled on mobile + reduced motion).

## 2. Homepage Flow

Enforce this order, removing duplicates:
1. Sliding-stop hero
2. Brand discipline statement (1 line, serif, generous whitespace)
3. Services overview (Build / Ground / Systems trio)
4. Built by horse people (Ciro + Ace quiet image, short body)
5. Selected Works preview (3 cards)
6. Field Notes preview (current build image + status)
7. LumenArc teaser (approved imagery, restrained)
8. Final CTA (text-link only, no boxed button)

Cut anything outside this list on `Index.tsx`.

## 3. Construction-Drawing Motion System

Already scaffolded in `src/components/draft/`. Extend selectively:
- Apply `DraftCorners` to large Selected Works images (already on cards — verify mobile).
- Add bronze section numbering (`§ 01 / SERVICES` style) at the top of each homepage section.
- `DraftLine` horizontal dividers between sections (1px, bronze @ 40%, draw-on once).
- Hover: bronze underline grows 8→14 on CTAs (already pattern; standardise).
- Field Notes timeline: extend the vertical construction line full-section with chapter markers `01 / 02 / 03`.
- Mobile: disable drift loops, halve durations (already wired via reduced-motion + matchMedia guard).

## 4. Image Audit (global)

Sweep these pages and replace any off-brand image with approved assets or a dark editorial placeholder (`bg-foreground/5` + draft grid + status code):

- `Index.tsx`, `About.tsx`, `Services.tsx`, `SelectedWorks.tsx`, `FieldNotes.tsx`, `RecoveryStation.tsx`, `Arenas.tsx`, `Stables.tsx`, `Infrastructure.tsx`.

Keep only: sliding-stop, Ciro+Ace quiet, Main Ridge pavilion set, Aberdeen set, current build set (steel/storm/clay/boots/drainage), LumenArc approved.

Remove: bright daytime real-estate shots, duplicated heroes, tiny thumbnails where a full-bleed belongs.

## 5. Services Restructure

Reorganise `Services.tsx` and the header dropdown into three clusters:

```
BUILD            GROUND                       SYSTEMS
Covered Arenas   Groundworks & Site Prep      LumenArc Recovery Systems
Stables & Barns  Drainage & Surfacing
Pavilions        Equine Infrastructure
```

Whole-Property Planning becomes a supporting paragraph under Build, not a top-level item. Update `Header.tsx` nav accordingly.

## 6. Selected Works

`SelectedWorks.tsx` — three large cinematic cards (Main Ridge, Aberdeen, Current Build). Each:
- Full-width on mobile, 2/3 + 1/3 asymmetric on desktop.
- Bronze numeral (01/02/03), status label, 1-line description, "View Project" text CTA with bronze rule.
- `DraftCorners` on image, slow 1000ms scale-1.03 hover.

## 7. Field Notes

`FieldNotes.tsx` — already has timeline scaffolding. Tighten:
- Full vertical construction line (left edge) spanning the page, with chapter markers at each section.
- Replace any non-build image with approved current-build assets.
- Status row: `IN PROGRESS · MORNINGTON PENINSULA · STEEL + GROUNDWORKS`.

## 8. About

`About.tsx` hero → Ciro + Ace quiet connection (not a building exterior).
Core message: **Built by horse people. Backed by construction.**
Three section blocks: Horseman / Craft / Groundwork, connected by vertical bronze `DraftLine`.

## 9. Copy Pass

Sweep for residual "premium equine environments", outdoor-arena-first phrasing, and duplicated taglines. Apply approved lines where they fit naturally (no stuffing).

## 10. Mobile QA

Playwright run at 384×800 + 768×1024:
- Hero crop shows horse, not just dirt.
- CTAs ≥ 44px tap target.
- No black dead zones > 30vh.
- Dropdown menu clear and scrollable.
- Project cards full-bleed, not slivers.
- Field Notes timeline line visible.
- Footer spacing balanced.

## 11. Final QA

- `bunx tsc --noEmit` clean.
- No white flash on first paint (verify `index.html` body bg + `Layout` mounted backdrop).
- Routes resolve, no missing imports.
- Keyboard nav + focus rings visible (bronze).
- Inquiry form submits.

## Technical Notes

- All colours via existing tokens (`--accent` bronze, `--foreground` charcoal). No hex in components.
- Animations gated by `useReducedMotion` and `IntersectionObserver` (disconnect after first reveal).
- Parallax via `requestAnimationFrame`, never React state.
- No new dependencies.

## Out of Scope

- No backend / schema changes.
- No new pages.
- No new image generation in this pass — audit + reassignment only. If a gap is found I'll flag it and propose generation separately.

## Build Order

1. Hero lock + flash fix
2. Homepage section sweep (order + duplicates)
3. Services restructure + header nav
4. Selected Works cards
5. Field Notes timeline + image swap
6. About hero swap
7. Global image audit on remaining pages
8. Copy sweep
9. Mobile Playwright QA + fixes
10. tsc + final pass
