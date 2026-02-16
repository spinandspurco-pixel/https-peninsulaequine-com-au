
# Peninsula Equine — Redesign Plan

## Completed Passes

### Pass 1 ✅ — Unified Blueprint System
- Created `BlueprintScene.tsx` with 8 presets
- Integrated into Index.tsx hero, intro, services sections
- Standardized PageHeader backgrounds

### Pass 2 ✅ — Services Refactor
- Reduced `Services.tsx` from 1,754 → ~230 lines (overview grid)
- Expanded `ServiceDetail.tsx` with pricing, gallery, FAQ, construction process
- Adjacent service navigation (prev/next)

### Pass 3 ✅ — Gallery & Page Cleanup
- Refactored `Gallery.tsx` from 1,611 → ~190 lines
- Extracted into `src/pages/gallery/`:
  - `galleryData.ts` — all gallery items, videos, filter configs, types
  - `GalleryLightbox.tsx` — full lightbox with pinch-zoom, swipe, keyboard nav
  - `FeaturedVideoSection.tsx` — slow-mo featured videos
  - `VideoGallerySection.tsx` — full video grid with hover autoplay
  - `GalleryGrid.tsx` — masonry photo grid with lazy loading + infinite scroll
  - `GalleryFilters.tsx` — search, service/location/project filters, quick tags
- About.tsx already clean (523 lines) with blueprint backgrounds
- Contact.tsx already clean (269 lines) with blueprint backgrounds

---

## Remaining Passes

### Pass 4 — Homepage Polish
- Review Index.tsx hero section for final animation timing
- Ensure consistent section transitions
- Verify responsive behavior on mobile/tablet

### Pass 5 — Final QA & Performance
- Audit all pages for broken links / missing images
- Check lighthouse scores
- Verify prefers-reduced-motion across all animations
- Final accessibility pass (WCAG AA)
