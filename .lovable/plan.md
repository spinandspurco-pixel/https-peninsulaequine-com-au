# Premiumisation Phase — Plan

Scope is large. I'll run it as seven sequenced slices on the public site, then the portal. Each slice ends in a Playwright pass (mobile/tablet/desktop) before moving on, so we keep cinematic integrity instead of stacking regressions.

## Slice 1 — Visual Rhythm Audit
Goal: every page reads as composed, not assembled.
- Page-by-page review: Home, Services (+ children), Selected Works, Field Notes, About, LumenArc, Contact.
- Normalise section vertical rhythm to a shared scale (e.g. `--pause-sm/md/lg/xl`) in `index.css`; replace ad-hoc `py-*` values where they break cadence.
- Audit chapter labels (`PE / 0X — …`) for consistent placement, weight, and tracking; remove duplicates.
- Tighten density spikes (intro → grid jumps) by inserting Pause sections or adjusting first-row offsets.

## Slice 2 — Motion System Audit
Goal: one PE motion language.
- Codify tokens in `tailwind.config.ts` + `index.css`: durations `arrive=1100ms`, `hold=800ms`, `exit=600ms`; ease `cubic-bezier(0.45,0,0.15,1)`.
- Sweep components for off-spec durations/easings; replace inline values with tokens.
- Reveal pattern: single IntersectionObserver hook (`useReveal`) — fade+8px lift, no scale, no blur, staggered by 80ms.
- Hover states: image scale capped at 1.03, caption lift 4px, 700ms; remove any 300ms ease-out snap.
- Blueprint motion: line draws only on first arrival; no infinite loops.

## Slice 3 — Image Treatment Audit
Goal: photography, render, product imagery feel unified.
- Standardise `CropSafeImage` defaults: blueprint grade (`brightness .88 contrast 1.08 saturate .82`), shared vignette overlay component.
- Establish crop ratios per surface (hero 21:9, project card 4:5, field note 3:2).
- Loading: `loading="lazy"` + `decoding="async"` everywhere except above-fold hero; add 600ms fade-in on `onLoad`.
- Remove one-off gradients; centralise in `src/components/media/ImageVeil.tsx`.

## Slice 4 — Mobile-First Luxury Review
Goal: mobile is designed, not adapted.
- Typography scale: clamp() for display/serif so headings don't shrink to flat sans on <400px.
- Thumb-reach: primary actions stay in bottom 60% of viewport; nav menu trigger sized 44px.
- Section pacing: shorter pauses on mobile (`--pause-md` halves), but keep one full-bleed cinematic beat per page.
- Re-crop hero/portfolio images for portrait (use `<picture>` with media queries).
- Header behaviour: hide-on-scroll-down, reveal-on-scroll-up.

## Slice 5 — Blueprint System Refinement
Goal: one cohesive architectural layer.
- Single source: `src/components/blueprint/` (Grid, Threads, CornerBrackets, ChapterLabel, DraftMark).
- Reduce overlay opacity ceiling to 3.5%; remove duplicated grids stacking on same section.
- Chapter labels: one per section, top-right, never on mobile if it collides with header.
- Remove decorative-only marks that don't reference structure.

## Slice 6 — Conversion Pathway Audit
Goal: Home → Services → Selected Works → Apply to Build feels inevitable.
- Trace path; ensure each page ends with a single quiet CTA pointing to the next step.
- Apply to Build form: progressive disclosure, autosave, clearer qualification copy.
- Trust signals: insert restrained proof points (project count, region, standard) at one anchor per page — no logo walls.
- Remove redundant CTAs mid-scroll.

## Slice 7 — Premium Portfolio Review (Selected Works)
Goal: strongest page on the site.
- Feature project (Main Ridge): full-bleed hero with parallax veil, 5-act scroll narrative.
- Project cards: editorial captions (Location · Year · Discipline), hover reveals one-line thesis.
- Case study pages: enforce 5-act template (Context, Brief, Ground, Build, Standard).
- Transitions: route-level fade+lift (240ms) using existing motion tokens.

## Slice 8 — Admin / Staff Portal Overhaul
Goal: PE Command Centre, not SaaS.

New schema (single migration):
- `projects` (pipeline) with stage enum, client_id, location, value_band, lead/ops owners
- `project_notes` (internal)
- `field_notes_drafts`
- `selected_works_entries` (CMS-backed portfolio)
- `staff_resources` (brand assets, SOPs, supplier links)
- `app_role` enum extended with `client_preview`
- RLS + GRANTs on every table; `has_role()` SECURITY DEFINER pattern.

Portal surfaces:
- Dashboard: pipeline health, today's field activity, pending applications, recent notes.
- Pipeline (Kanban + list).
- Client Applications inbox (extends current WholePropertyInbox pattern).
- Field Notes manager (draft → publish).
- Selected Works manager.
- Staff resources hub.
- Client Preview mode: read-only routes, hides ops chrome, branded as "PE Preview".

Visual: dark blueprint chrome, serif H1s, mono labels, drafting-grid backdrops, no shadcn defaults left untouched.

## Technical Notes
- All edits stay token-driven — no hardcoded colours.
- Motion tokens + reveal hook are prerequisites for slices 2–7; build them first inside slice 2.
- Each slice: implement → Playwright screenshots at 390 / 834 / 1440 → fix collisions → close.
- Portal schema goes in one migration with GRANTs and RLS so we don't ship half-secured tables.

## Sequencing
Slices 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. I'll pause after each slice for your eye before moving on, unless you'd rather I run 1–5 as one continuous refinement pass and check in before Conversion + Portfolio.

## Decisions I need from you
1. Run slices sequentially with check-ins, or batch 1–5 as one "refinement pass"?
2. Client Preview role: should it see real project data (masked) or a curated demo dataset?
3. Portal entry — keep current `/admin` route, or move to `/hq` to match the Command Centre framing?
