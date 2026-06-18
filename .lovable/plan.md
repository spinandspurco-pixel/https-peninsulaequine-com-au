
## Findings from the audit

Good news: **no Wellness Station references remain anywhere**, and no overclaiming language ("world-class", "industry-leading", etc.) was found.

Critical finding: a botched find-replace at some point turned the word **"Mornington" into the letter "n"** across 10+ files. Several are visible to clients (quote pages, field notes locations, estimate copy). These must be fixed first.

## Phase 1 — P0 live copy bugs (do first, ship same pass)

Fix the broken `"n"` artifacts left over from a previous find-replace:

- `src/pages/ClientQuote.tsx` — `"n Peninsula, VIC"` → `"Mornington Peninsula, VIC"`
- `src/pages/Estimate.tsx` — `"n ex. GST"`, `"n's 10% GST"`, `"nn market"` → AU equivalents
- `src/pages/FieldNotes.tsx:156-158` — three locations: `"n Peninsula"` → `"Mornington Peninsula"`
- `src/pages/Events.tsx`, `Legal.tsx` (×2), `AdminTestimonials.tsx`, `ClientPortal.tsx` — `toLocaleDateString("en-n", …)` → `"en-AU"`
- `src/pages/StaffDocuments.tsx` — `"Hourly Rate ($n)"` → `"$AUD"`
- `src/pages/Pricing.tsx` — variable `n_PRICING_FAQS` → `AU_PRICING_FAQS`
- `src/pages/gallery/galleryData.ts:5`, `src/pages/GroupBooking.tsx` — comment artifacts

## Phase 2 — Navigation & discoverability

- `Header.tsx` services dropdown: "Groundworks", "Custom Rural Builds", "Drainage & Surfacing" all dead-end at `/services`. Point them at proper anchors (`/services#groundworks`, etc.) so each lands on its section.
- `Footer.tsx`: rename "Recovery Stations" → "LumenArc" to match the brand.
- Add Field Notes, About, FAQ, Testimonials links into the Footer column structure so publicly-routed pages are reachable.

## Phase 3 — Visual consistency pass

Bring stragglers in line with the editorial / architectural system already established on Index, RecoveryStation, Arenas, Stables, EquineEstates, Infrastructure, FieldNotes:

- **Testimonials.tsx** — strip `rounded-lg` / `rounded-xl` from video cards (lines 49, 83, 101, 104, 295). Replace with sharp-edged full-bleed treatment + vignette gradients matching FieldNotes.
- **Pricing.tsx** — replace SaaS-style `md:grid-cols-3` shadcn `<Card>` grid with editorial 12-column layout + hairline dividers + serif headings.
- **Boarding.tsx** — replace `sm:grid-cols-2 lg:grid-cols-3 gap-6` generic card grid with the `gap-px bg-foreground/[0.05]` divider grid pattern used by Arenas/Stables.
- **FAQ.tsx** — sharpen accordion edges (remove `rounded-lg`), tighten typography to match brand scale.
- **About.tsx, Testimonials.tsx, FAQ.tsx** — wrap content blocks in `<RevealOnScroll>` so motion register matches the rest of the site.
- Audit remaining shadcn `<Button>` usages on Contact/FAQ/BookLesson — replace with the brand CTA pattern (`px-12 py-4 border text-[11px] font-mono uppercase tracking-[0.3em]`) where the button is a primary marketing CTA. Leave functional form submit buttons as-is.

## Phase 4 — Blueprint overlay coverage

Use the existing `BlueprintContinuity` / `BlueprintDivider` components (already built for LumenArc) to give other craft-focused pages the same drafting tonal layer:

- `Process.tsx` — full-page `<BlueprintContinuity />`
- `TheStandard.tsx` — full-page `<BlueprintContinuity />`
- `SiteAssessment.tsx` — `<BlueprintContinuity />` + drafting divider between sections
- `Estimate.tsx` — `<BlueprintContinuity />` so the calculator reads as "engineered" not generic
- `Services.tsx` — add `<BlueprintDivider />` between capability bands

Overlay opacity stays at the existing 2–3.5% so it never competes with content.

## Phase 5 — Hygiene & performance

- Rename `src/pages/RecoveryStation.tsx` → `src/pages/LumenArc.tsx` (update App.tsx import). Stale filename.
- Add `loading="lazy"` to `GalleryLightbox.tsx` nav-preview images and `Footer.tsx` logo. Spot-check below-fold imagery on Arenas/Stables/EquineEstates/Infrastructure.
- Leave hero images eager (correct for LCP).

## Out of scope for this pass

- Generating new imagery to "replace generic stock-feeling visuals" — current images are real project photos. If you point at specific ones you want replaced, I'll swap them with `imagegen` or new uploads in a follow-up pass.
- Rewriting long-form copy on every page. I'll only touch copy where it's broken (`n` artifacts) or overclaiming. A full editorial rewrite is a separate ask — let me know if you want it and I'll scope it.
- Building the missing sub-pages for `/services/groundworks`, `/services/custom-rural-builds`, `/services/drainage-surfacing`. The dropdown will point at section anchors for now; building real sub-pages is a sizeable separate feature.

## Approach

I'll ship Phase 1 (live bugs) and Phase 2 (nav) in one pass, then Phase 3, 4, 5 in a second pass so you can review the visual changes in chunks rather than one giant diff. Approve and I'll begin.
