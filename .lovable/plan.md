## Homepage Hero Refinement

Refine the existing hero in `src/pages/Index.tsx` only. Layout, scroll fade and 25s slow zoom stay intact. Site-wide motion, typography and copy rules already in memory are respected (calm cadence, editorial serif, single H1, ≤16-word subtext).

### 1. Luxury image grading
Update the hero `<img>` filter to a Range Rover / Ralph Lauren style grade:
`brightness(0.88) contrast(1.18) saturate(0.78) sepia(0.06)`
Add a second warm overlay (very low opacity amber `rgba(180,140,90,0.06)` mixed with deep shadow at the bottom) layered above the image but below content, to give a golden-hour cast without breaking the dark aesthetic.

### 2. Animated blueprint overlay
Add a new absolutely-positioned `<div>` above the photo, below content, rendering a thin cyan/white grid + a few architectural dimension lines as inline SVG (reusing the language of `BlueprintLineOverlay`). It slowly fades in/out in a 14s loop (opacity 0 → 0.08 → 0) via a new `heroBlueprintPulse` keyframe in `src/index.css`. `pointer-events-none`, `mix-blend-mode: screen`, respects `prefers-reduced-motion` (animation paused).

### 3. Drifting dust particles
Add a single lightweight CSS-only particle field: ~14 tiny `<span>` dots (1–2px, `bg-amber-200/30`, `blur-[1px]`) randomly positioned, each with a `dustDrift` keyframe (translateY -20vh to 5vh, slight X sway, opacity 0→0.5→0) over 18–28s with staggered delays. Defined once in `index.css`. Disabled under reduced motion. Sits above image, below blueprint, below content.

### 4. Text hierarchy & copy
Replace current H1 + single line with:
- Eyebrow (micro): `PENINSULA EQUINE` — mono, 10px, tracking 0.5em, white/35, fade-in 200ms
- H1: `From Dirt to Dynasty.` — serif, current scale, white, fade-in 500ms
- Secondary headline: `Built by riders. Crafted for performance.` — serif italic, ~1.25rem→1.6rem clamp, white/70, fade-in 800ms
- Supporting statement: `Premium equine environments engineered through craftsmanship, horsemanship and experience.` — sans 300, max-width 38rem, white/45, fade-in 1100ms
- CTA row (1400ms): Primary `Start Your Project` → `/contact` (solid warm-bone bg, near-black text, hover lift), Secondary `View Our Work` → `/gallery` (ghost outline, white/60 border, hover white).

All staged on the existing 300–500ms cadence; no bounce; durations 800ms ease-out.

### 5. Technical details
- Edits confined to `src/pages/Index.tsx` and `src/index.css` (new keyframes `heroBlueprintPulse`, `dustDrift`, and a `.hero-particle` utility).
- New tiny component `HeroAtmosphere` co-located in `Index.tsx` (or `src/components/HeroAtmosphere.tsx`) encapsulating the blueprint SVG + particle field for cleanliness.
- Buttons use existing tokens (`bg-accent text-accent-foreground`, `border-primary-foreground/30`) — no hardcoded colors.
- All new motion gated behind `@media (prefers-reduced-motion: reduce)`.
- `marginTop: -22vh`, scroll fade, slow-zoom and vignette preserved.

### Out of scope
Rest of homepage sections, header/footer, other routes.
