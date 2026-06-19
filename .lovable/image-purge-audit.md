# Peninsula Equine — Image Purge Audit

Generated as a controlled inventory of every image referenced from
`src/pages/**` and `src/components/**`. Each entry is classified against the
approved cinematic direction (sliding stop, Ciro + Ace, Main Ridge, Aberdeen,
covered-arena/stables build, stable aisle, groundworks/dirty boots, LumenArc).

Legend:
- **KEEP** — approved cinematic asset, correctly placed.
- **SWAP** — wrong category / wrong page / generic / flat / duplicate within
  the same section. Replace with the correct approved asset, or, if none
  exists for that slot, render `<EditorialPlaceholder />` instead.
- **REVIEW** — needs your eyes before action.
- **CDN-DELETE** — after all references are removed, the `.asset.json`
  pointer (and its CDN copy) can be deleted with `delete_asset`. Permanent.

---

## 1. Pages already aligned (KEEP)

These pages import only `approved-*`, curated `main-ridge/*`,
`covered-arenas/*`, `field-notes/*`, `lumenarc/*`, or `responsive/*` assets.
No action.

| Page | Notes |
|------|-------|
| `pages/Index.tsx` | Sliding stop hero, Ciro+Ace, Main Ridge, Aberdeen storm, covered-arena exterior, LumenArc canopy. Clean. |
| `pages/About.tsx` | Ciro+Ace quiet, sliding stop, mr-beam-detail, muddy boots, covered-comp sunset puddles. Aligned. |
| `pages/Aberdeen.tsx` | All `approved-aberdeen-*` + stable aisle/stall/tack. Aligned. |
| `pages/Arenas.tsx` | `approved-covered-arena-interior-night`. Aligned. |
| `pages/Stables.tsx` | Stable aisle/stall. ⚠ **REVIEW** — `stable-aisle-detail-warm-light` is imported twice (line 4 & 6); user direction explicitly rejects "repeated images too close together". |
| `pages/Services.tsx` | Locked cinematic system, category-correct. Aligned. |
| `pages/MainRidgePavilion.tsx` | Pavilion wide / fireplace / parrilla. Aligned. |
| `pages/CoveredArenaStablesBuild.tsx` | Storm frame, drainage, muddy boots. Aligned. |
| `pages/Infrastructure.tsx` | Groundworks dozer + muddy site. Aligned. |
| `pages/RecoveryStation.tsx` | LumenArc set only. Aligned. |
| `pages/EquineEstates.tsx` | `pe-estate-aerial-masterplan` — **REVIEW** (aerial reads slightly real-estate; you wanted estates de-emphasised). |
| `pages/FAQ.tsx` | Main Ridge brick fireplace detail as accent. KEEP. |

## 2. Pages that violate the direction (SWAP / placeholder)

These pull from the legacy bright-daytime / phone-photo `src/assets/*.jpg`
library that predates the cinematic system.

### `pages/Boarding.tsx` — **HEAVY VIOLATION**
12 raw `.jpg` imports: `aberdeen-stalls`, `aberdeen-stalls-detail`,
`aberdeen-barn-interior`, `aberdeen-aisle`, `aberdeen-stonework`,
`aberdeen-exterior` (×2), `aberdeen-deck`, `covered-arena-finished-lit`,
`main-ridge-finished-interior-1`, plus two blueprint PNGs.
- Reads as generic real-estate gallery.
- Aberdeen exterior used twice (lines 17 & 20) — repeat violation.
- **Action:** swap to approved Aberdeen set (`approved-aberdeen-*`,
  `approved-stable-aisle-detail-warm-light`,
  `approved-stable-stall-interior-symmetric`) for the slots that have a
  correct match; render `EditorialPlaceholder` for the rest.

### `pages/ServiceDetail.tsx` — **HEAVIEST VIOLATION**
~30 raw `.jpg` imports from the legacy library:
`covered-arena-finished-lit`, `covered-arena-black-exterior`,
`aberdeen-aisle/barn-interior/stalls/stalls-detail/stonework/exterior`,
`main-ridge-finished-interior-1/2`, `main-ridge-site-prep/brickwork/timber/`
`interior/barn-frame/arena-grading/crane-lift/frame-trench/post-depth/`
`rebar-foundation/timber-posts/trench-utilities`, `arena-sand-prep-1/2`.
- Several reused across slugs.
- Mixes phone-photo construction shots with finished interiors at random.
- **Action:** rebuild the service→image map to point only at approved
  cinematic assets; placeholder anything without a correct match. This is the
  largest swap of the purge.

### `data/caseStudyData.ts` — **VIOLATION (data layer)**
Same Aberdeen/Main-Ridge legacy `.jpg` set as ServiceDetail; also reuses
`living-hero-wide.jpg` for two different case studies (line 15 & 25, second
labelled `groundlockInstallation`).
- **Action:** swap to approved equivalents; placeholder where none exists;
  remove the `living-hero-wide` reuse.

### `pages/BookLesson.tsx`
`aberdeen-exterior`, `covered-arena-finished-lit` + 3 blueprint PNGs.
- Generic and off-direction for a booking flow.
- **Action:** swap to one approved Aberdeen interior, or remove image usage
  here and rely on type/architecture only.

### `pages/Events.tsx`
`covered-arena-finished-lit` (×2 — line 19 & 21) + `main-ridge-finished-interior-2`.
- Repeat violation + finished-interior used as event imagery.
- **Action:** swap to one approved cinematic (Main Ridge pavilion fireplace
  reads as event-appropriate); placeholder the rest.

### `pages/Lessons.tsx`, `pages/TrainerProfile.tsx`
Single `.jpg` each (`main-ridge-finished-interior-1`,
`covered-arena-finished-lit`). Low risk but off-direction.
- **Action:** replace or remove.

### `pages/RoundPens.tsx`
`approved-aberdeen-round-pen-sunset`, `approved-round-pen-slab-sunrise`,
`approved-covered-arena-interior-construction-dawn-v2` + raw blueprint PNGs +
diagram PNGs.
- The "approved-*" round-pen images **are** sanctioned, but round pens read
  as a service rather than a brand pillar.
- **Action: REVIEW** — keep or fold into infrastructure? Diagrams (raw PNGs)
  are technical artefacts and may stay if labelled.

### `components/BuildTimeline.tsx`
`sequence-1-bare-ground` → `sequence-4-completed` — legacy bright daytime
phone sequence.
- **Action:** swap to `field-notes/muddy-boots-steel-frame`,
  `covered-competition-arena-*` series and storm/frame approved set.

### `components/BlueprintScene.tsx`
6 raw `blueprint-*.png` files — these are technical drawings, not
photography. **KEEP** for the construction-drawing layer (matches direction)
but **REVIEW** whether the scene is still used / needed.

### `lib/testimonials.ts`
`trainer-glenn.jpg`, `trainer-ciro.jpg` — small portrait headshots, not
brand hero imagery. Likely fine in testimonial context. **REVIEW**.

## 3. Logos / utility (KEEP, no action)

- `assets/logo-pe-mark.webp` — used in Header/Footer/StickyCTA/portals. KEEP.

## 4. After SWAPs land — CDN-DELETE candidates

Only after **all** code references are gone, the following pointers can be
deleted with `assets--delete_asset`:

```
src/assets/aberdeen-aisle.jpg
src/assets/aberdeen-barn-interior.jpg
src/assets/aberdeen-deck.jpg
src/assets/aberdeen-exterior.jpg
src/assets/aberdeen-stalls-detail.jpg
src/assets/aberdeen-stalls.jpg
src/assets/aberdeen-stonework.jpg
src/assets/aberdeen-stonework-color.jpg
src/assets/arena-sand-prep-1.jpg
src/assets/arena-sand-prep-2.jpg
src/assets/covered-arena-black-exterior.jpg
src/assets/covered-arena-finished-lit.jpg
src/assets/living-hero-wide.jpg
src/assets/main-ridge-arena-grading.jpg
src/assets/main-ridge-barn-frame.jpg
src/assets/main-ridge-brickwork.jpg
src/assets/main-ridge-crane-lift.jpg
src/assets/main-ridge-finished-interior-1.jpg
src/assets/main-ridge-finished-interior-2.jpg
src/assets/main-ridge-frame-trench.jpg
src/assets/main-ridge-interior.jpg
src/assets/main-ridge-post-depth.jpg
src/assets/main-ridge-rebar-foundation.jpg
src/assets/main-ridge-site-prep.jpg
src/assets/main-ridge-timber.jpg
src/assets/main-ridge-timber-posts.jpg
src/assets/main-ridge-trench-utilities.jpg
src/assets/sequence-1-bare-ground.jpg
src/assets/sequence-2-base-formation.jpg
src/assets/sequence-3-system-install.jpg
src/assets/sequence-4-completed.jpg
```

These are mostly raw `.jpg` (not `.asset.json` pointers) so they'll just be
removed from the repo with `rm` rather than via `delete_asset`. The
`.asset.json` pointer deletes only apply to the on-CDN imports.

---

## Recommended execution order

Each step is one focused turn. After each, the site still builds and
remaining wrong images are visibly replaced with `EditorialPlaceholder`.

1. **`ServiceDetail.tsx`** — biggest visible violation surface.
2. **`Boarding.tsx`** — second-largest, real-estate-gallery feel.
3. **`data/caseStudyData.ts`** — fixes everything that renders case studies.
4. **`BuildTimeline.tsx`** — sequence imagery to field-notes set.
5. **`Events.tsx` / `BookLesson.tsx` / `Lessons.tsx` / `TrainerProfile.tsx`** — small mop-up.
6. **`Stables.tsx`** dedupe.
7. CDN/raw-file cleanup once nothing imports the legacy library.
