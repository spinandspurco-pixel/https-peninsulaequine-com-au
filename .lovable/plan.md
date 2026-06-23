# Cinematic Motion + Global Sidebar Restructure

Two coordinated workstreams. Both honour the existing language (serif headings, low-opacity sans body, blueprint motifs, asymmetric tension, silent UI) — no new palette, no founder names, no prominent buttons.

## 1. Global sidebar navigation (minimalist rail)

A thin left rail, not a panel — consistent with the "interface reduction" rule.

- New `src/components/layout/SiteRail.tsx`: fixed 56px rail on `lg+`, holds a small PE wordmark top, vertical text-link nav (Work, Systems, Field Notes, HQ, Apply), and a single 1px thread that grows with scroll progress.
- Collapses to a bare hamburger glyph (top-left, no box, no border) below `lg`, and on any viewport once the user scrolls past the hero. Opening triggers a full-bleed overlay nav with the same text-link list at large editorial scale.
- Mount in `src/App.tsx` once, outside `<Routes>`. Existing top nav stays only on routes that already have a hero header; we hide the duplicate via a small `useSiteChrome` hook that returns `{ showTopNav: boolean }` per route.
- Scroll behaviour driven by `requestAnimationFrame` (per memory), not React state per frame.
- No changes to admin/portal layouts (`/hq`, `/admin/*`, `/client-portal`, `/employee-dashboard`, `/trainer-portal`, staff portals) — they keep their own chrome.

## 2. Cinematic motion pass

All additive, all respect `prefers-reduced-motion`, all use existing `cubic-bezier(0.45, 0, 0.15, 1)` and 800-1400ms timings from memory.

- **Hero parallax scale**: hero image subtly scales `1 → 1.06` and translates `0 → 40px` over the first viewport. Implemented in `src/components/Hero` (or current homepage hero component) via `useScroll` + `useTransform` from `framer-motion`, but written through `requestAnimationFrame` + CSS variables to avoid React re-renders.
- **Lens-blur image reveal**: new `src/components/motion/LensBlurImage.tsx` — wraps an `<img>`, starts at `filter: blur(18px) saturate(0.6)` and resolves to crisp as it enters viewport (IntersectionObserver via existing `useInView` hook). Drop-in replacement on hero, Selected Works tiles, and Field Notes covers.
- **Heading reveal**: new `src/components/motion/RevealHeading.tsx` — splits the serif heading into word spans, each fades + rises 16px with 60ms stagger when the heading enters view. Applied to top-of-section H2s on Index, About, Services, SelectedWorks, FieldNotes. Not a "text scramble" — that reads as gimmick against the institutional tone.
- **Magnetic affordance**: new `src/components/motion/MagneticLink.tsx` — wraps text links (e.g. "Apply to Build", "Request Assessment"). On `pointermove` within 80px, the link translates up to 6px toward the cursor with a 200ms spring back on leave. Underline (1px, existing thread style) extends on hover. No button boxes added.
- All new motion components are pure presentation; no business logic, no data, no route changes.

## Files

Created:
- `src/components/layout/SiteRail.tsx`
- `src/components/layout/OverlayNav.tsx`
- `src/hooks/useSiteChrome.ts`
- `src/components/motion/LensBlurImage.tsx`
- `src/components/motion/RevealHeading.tsx`
- `src/components/motion/MagneticLink.tsx`

Edited:
- `src/App.tsx` (mount rail)
- `src/pages/Index.tsx` (hero parallax, heading reveals, magnetic CTAs, lens-blur on hero img)
- `src/pages/SelectedWorks.tsx` (lens-blur tiles, heading reveal)
- `src/pages/FieldNotes.tsx` (lens-blur covers, heading reveal)
- `src/pages/About.tsx`, `src/pages/Services.tsx` (heading reveal only)
- `src/index.css` (rail tokens, `--rail-width`, content offset on `lg+`)

## Out of scope (explicit)

Not in this pass — flag separately if wanted:
- Palette shift to #0A0A0A / Raw Steel / Equestrian Tan
- Curtain-wipe route transitions, blueprint skeletons
- Layered Earth groundworks interactive, LumenArc pulse
- Progressive-disclosure rebuild of intake
- Lottie diagrams, variable-font scroll morphing

## Technical notes

- Framer Motion is already a dep — verify with `rg motion package.json` before adding.
- `useReducedMotion` hook exists in `src/hooks/` — every new motion component must short-circuit to the resolved state when it returns true.
- Sidebar must not appear over admin chrome; gate via `useSiteChrome` route-prefix check.
- No sound, no auto-play, no founder names anywhere in nav copy.
