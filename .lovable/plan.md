
# Blueprint Animations and Updated P.E Logo Integration

## Overview
This plan introduces two major enhancements: (1) replacing the current text-based "PE" logo mark with the new golden rope-circle P.E logo image throughout the site, and (2) integrating the equine architecture blueprint illustrations as animated background elements that "draw in" as users scroll, creating a sense of plans being sketched in real time.

---

## Part 1: Updated P.E Logo

**What changes:**
- Copy the new P.E rope logo image (`2d743e9c-...png`) into `src/assets/logo-pe-mark.png`
- **Hero section** (Index.tsx): Replace the text "PE" inside the circular border with the actual logo image. Remove the CSS circle/border since the rope circle is built into the image itself.
- **Header** (Header.tsx): The existing `logo-pe.png` already renders there -- swap it for the new updated version if desired, or keep both (the header uses the full logo, the hero uses the shortened mark).

---

## Part 2: Blueprint Background Illustrations

The blueprint images will be used as decorative background layers that reveal progressively as users scroll into each section, creating the illusion of architectural plans being drawn in real time.

### Assets to Add
Copy all blueprint images into `src/assets/`:
- `blueprint-barn.png` (the Horse Barn full plan)
- `blueprint-elevation.png` (Front Elevation detail)
- `blueprint-detail.png` (Door Frame Etch -- hardware detail)
- `blueprint-facility.png` (Window Frame Map -- full facility plan)

### New Component: `BlueprintBackground`
A reusable component that renders a blueprint image as a background layer with a scroll-triggered "drawing" reveal animation:

- Uses `clip-path` animated from `inset(0 100% 0 0)` to `inset(0 0 0 0)` as the section scrolls into view, creating a left-to-right "sketch reveal" effect
- Very low opacity (5-8%) so it acts as a subtle textural layer, not competing with content
- Optional SVG line overlay that traces key architectural lines using `stroke-dashoffset` animation (the "drawing in real time" effect)
- Respects `prefers-reduced-motion` by showing the image immediately without animation

### Where Blueprints Appear

1. **Homepage -- Services Section background**: The full barn plan (`blueprint-facility.png`) sits behind the services grid at ~6% opacity, revealed left-to-right as user scrolls in. Reinforces "we design and build."

2. **Services Page -- Page Header**: The elevation blueprint behind the header banner (replacing the current `mainRidgeBarnFrame` decorative element), with a slow parallax drift.

3. **About Page -- "Why Peninsula Equine?" section**: The door frame hardware detail (`blueprint-detail.png`) fades in behind the text, suggesting precision craftsmanship.

4. **Contact Page -- Form background**: A very subtle (4% opacity) full facility plan behind the inquiry form area, reinforcing "your project starts here."

5. **Section Dividers**: Between major sections, a thin horizontal strip showing a cropped portion of a blueprint, revealed with a line-draw animation as the user scrolls past.

### Animation Technique: SVG Line Draw

For the "numbers and drawings appearing in real time" effect, create a `BlueprintLineOverlay` component:
- Renders simplified SVG paths (straight lines, dimension markers, text labels) that match the style of the blueprint images
- Uses CSS `stroke-dasharray` + `stroke-dashoffset` animation triggered by Intersection Observer
- Lines draw themselves over 2-3 seconds as the section enters the viewport
- Color: white/cream at ~10% opacity on dark sections, charcoal at ~6% opacity on light sections
- Dimension text (e.g., "6x8", "3'-0\"") fades in with a typewriter-style delay after the lines complete

### Tailwind Config Additions
New keyframes:
- `blueprint-reveal`: clip-path from right-to-left over 1.5s
- `line-draw`: stroke-dashoffset from full to 0 over 2s
- `dimension-fade`: opacity 0 to 0.8 with slight upward translate

---

## Part 3: P.E Banner Integration

Copy the PE Banner image (`PE_Banner.png`) into assets. Use it as an optional hero variant or loading screen watermark -- the "FROM DIRT TO DYNASTY" tagline with blueprint background could serve as a powerful section divider between the hero and intro sections.

---

## Technical Details

### New Files
- `src/assets/logo-pe-mark.png` -- the rope circle P.E mark
- `src/assets/blueprint-barn.png`
- `src/assets/blueprint-elevation.png`
- `src/assets/blueprint-detail.png`
- `src/assets/blueprint-facility.png`
- `src/assets/pe-banner.png`
- `src/components/BlueprintBackground.tsx` -- reusable blueprint reveal component
- `src/components/BlueprintLineOverlay.tsx` -- SVG line-draw animation overlay

### Modified Files
- `src/pages/Index.tsx` -- swap hero PE text for logo image; add blueprint to services section
- `src/pages/Services.tsx` -- blueprint in page header background
- `src/pages/About.tsx` -- blueprint detail in story section
- `src/pages/Contact.tsx` -- subtle blueprint behind form
- `src/index.css` -- new keyframes for blueprint-reveal and line-draw animations
- `tailwind.config.ts` -- register new animation utilities

### Performance Considerations
- Blueprint images loaded with `loading="lazy"` and low priority
- Animations use `will-change: clip-path` only during transition, then removed
- SVG overlays are lightweight (a few paths, not complex illustrations)
- All animations disabled for `prefers-reduced-motion` users
