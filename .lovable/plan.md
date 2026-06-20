# Living Blueprint Experience — Site-Wide Pass

One coherent system: a construction drawing resolving into a finished equine environment. Motion communicates precision, sequence, assembly — never spectacle.

## Phase 1 — Shared Blueprint + Motion Token Layer

Build the foundation every page consumes. No page edits in this phase.

**1. Motion + blueprint tokens (`src/styles/blueprint.css`)**
- Durations: `--bp-quick: 420ms`, `--bp-resolve: 900ms`, `--bp-arrive: 1400ms`, `--bp-handoff: 1800ms`
- Easings: `--bp-ease-draw: cubic-bezier(0.45, 0, 0.15, 1)`, `--bp-ease-settle: cubic-bezier(0.25, 0.1, 0.2, 1)`
- Stroke + grid tokens: hairline width, bronze hue, grid opacity (2-3.5%)
- Keyframes: `bp-line-draw` (stroke-dashoffset), `bp-rule-resolve` (scaleX from left), `bp-bracket-pin` (opacity + 2px translate), `bp-image-emerge` (blueprint underlay → photograph cross-fade), `bp-mark-arrive`
- Single `@media (prefers-reduced-motion: reduce)` block neutralising all of the above

**2. Shared primitives (`src/components/architecture/`)**
- `BlueprintLineDraw.tsx` — IntersectionObserver-driven SVG line that draws once on enter
- `BronzeRule.tsx` (refactor existing) — accepts `variant: "resolve" | "static"`, uses tokens
- `CornerBrackets.tsx` — 4 corner brackets that pin in on enter
- `ChapterMark.tsx` — section number + label + hairline, arrives as a unit
- `BlueprintImage.tsx` — image wrapper that renders a blueprint underlay (grid + outline traced from image dimensions), cross-fades to photograph on enter; handles lazy-load without flicker via `decoding="async"` + reserved aspect-ratio
- `PageHandoff.tsx` — standardised closer: chapter mark + bronze rule + next-sheet link with directional bracket; replaces ad-hoc closers across pages

**3. Reduced-motion + perf guards**
- All primitives respect `prefers-reduced-motion` (instant resolve, no draw)
- IntersectionObserver `rootMargin: "-10% 0px"`, `threshold: 0.15`, fires once
- `will-change` only during active transition, removed on completion (matches existing perf memory)

## Phase 2 — Page-by-Page Refinement

Each page consumes the new primitives. Order chosen so handoffs land in narrative sequence.

| Page | Refinement |
|---|---|
| Homepage (`Index.tsx`) | Arrival: blueprint grid resolves → hero photograph emerges via `BlueprintImage`. Kill layout jump (reserve hero aspect). Recompose hero copy stack to remove collision risk on tablet. Section marks via `ChapterMark`. Closer → Selected Works via `PageHandoff` ("Sheet 02 — Selected Works"). |
| Navigation + mobile menu (`layout/`) | Services dropdown rebuilt as a capability map (2-col, label + one-line descriptor, hairline dividers). Mobile menu: full-height calm sheet, bronze hairlines, chapter-marked sections, no shadcn defaults. Active states: bronze underline 1px, no chip. Apply to Build: text link with bracket, not button. |
| Services (`Services.tsx`, `ServiceDetail.tsx`) | Capability tiles use `CornerBrackets`. Each service ends with `PageHandoff` → Apply. |
| Selected Works (`SelectedWorks.tsx`) | This is the benchmark — light touch only. Ensure every card uses `BlueprintImage`. Closer already strong, wrap in `PageHandoff` for consistency. |
| Main Ridge Pavilion | Verify Aberdeen handoff (already fixed) now uses `PageHandoff`. ChapterMark on each act. |
| Aberdeen | Same treatment. Closer → Field Notes or Apply via `PageHandoff`. |
| Field Notes | `BlueprintImage` on every entry. Closer → Selected Works or Apply. |
| LumenArc (`components/lumenarc/`) | Currently feels disconnected. Apply BlueprintImage + bronze hairlines + chapter mark. Closer → Services / Apply. |
| About | Closer → Apply via `PageHandoff`. Hero into `BlueprintImage`. |
| Contact | Already refined — wrap form in `CornerBrackets`, replace remaining shadcn card edges. Success state: chapter mark + bronze rule. |
| Site Assessment / Apply to Build | Step indicator becomes a drawing-sheet progress (Sheet 01/06 etc). Already partially done — finish. |
| Footer | Bronze hairline resolve on enter. Replace any remaining generic spacing with grid-aligned columns. |
| Page transitions (`PageTransition.tsx`) | Single shared crossfade using `--bp-handoff`, blueprint grid briefly overlays during transit. |

## Phase 3 — QA Sweep

- Desktop / tablet / mobile capture via Playwright on every audited page
- Console error scan, network 404 scan, horizontal-scroll check
- Duplicate H1/H2 audit (`rg` for repeated `<h1`/`<h2` strings)
- Dead-button audit (buttons without onClick / href)
- Alt-text audit on every `<img>`
- Placeholder copy scan (`rg` for "Lorem", "placeholder", "TODO", "example.com")
- Reduced-motion verification (toggle media query, confirm instant resolve)
- Layout-shift check (CLS observation during arrival animations)

## Technical Details

- No new dependencies — IntersectionObserver + CSS keyframes only
- All tokens flow from `blueprint.css` imported once in `main.tsx`
- Primitives are tree-shakeable; pages import only what they use
- Backend untouched. No schema, no edge functions, no auth changes
- `prefers-reduced-motion` honoured at the CSS level so JS doesn't need branching
- Image emergence uses a CSS-only blueprint underlay (linear-gradient grid + outline) — no extra network requests per image

## Out of Scope

- New features, new pages, new routes
- Backend, schema, edge functions, auth
- Copy rewrites beyond removing placeholder / generic artefacts surfaced by QA
- HQ internal surfaces (already polished in prior pass)

## Deliverable at End

- Files changed list
- Pages audited list
- Motion improvements summary
- Playwright screenshots: desktop + mobile for each audited page (arrival + closer)
- Caveats
- Final go/no-go recommendation for Josh's preview access

## Estimated Surface

~6 new files (tokens + primitives), ~18 edited files (pages + nav + footer + transition). Two implementation passes: Phase 1 in one pass, Phase 2+3 in the next.
