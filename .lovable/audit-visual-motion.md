# Peninsula Equine — Visual Rhythm & Motion Audit

**Scope:** Phase 1 of premiumisation. Findings + proposed fixes only. No code shipped yet.
**Direction set by user:** motion intensity 5 (more cinematic — slower, heavier, more layered), blueprint density "underused — make more architectural", delivery = audit-first.

---

## 0. Headline diagnosis

The site already has a real motion system (`src/lib/motion.ts` — EASE, DURATION, HOLD, STAGGER, DISTANCE) and a real blueprint vocabulary (`engineering-grid`, `bg-plan-lines`, `DraftCorners/Line/Ticks`, `Blueprint*`). The problem is **dispersion, not absence**:

- **109 files** use a scroll-reveal hook; **299 inline `duration-*` / `ease-*` Tailwind utilities** are scattered across pages. Most do not go through `motion.ts`. Result: the system exists, but each page improvises against it.
- **67 blueprint-component usages** — concentrated on case studies, sparse on Home / Services / Selected Works index / About / Contact. So the architectural identity reads strongest on the deepest pages and weakest on the entry pages, which inverts the intent.
- **Three competing reveal hooks** (`useScrollReveal`, `useScrollAnimation`, `useStaggeredAnimation`) with different defaults (threshold 0.15 vs 0.1, different rootMargins, different stagger constants 120/150/200/500). Same gesture, three timings → reveals feel slightly out of sync between adjacent sections.
- **PageTransition** is 400ms out / 500ms in (900ms total). Against `DURATION.slow = 1200` for hero arrivals, the page swap feels faster than what arrives after it — the transition undersells the content.
- **GlobalCinematicBackdrop** parallax factor `0.04` is barely perceptible; on long pages it does nothing. Either commit harder or drop it.

---

## 1. Visual rhythm — per-page findings

Notation: ✔ working · ⚠ tighten · ✖ break.

### Home (`Index.tsx`, 647 lines)
- ✔ Hero arrival is the strongest moment on the site — keep as the reference for "tier 1 arrival".
- ⚠ Section-to-section pacing: services grid → why → projects → field notes → CTA all use ~similar reveal cadence. No breathing pause between blocks. **Fix:** insert two "pause sections" (italic serif anchor, 30vh, blueprint thread only) between Services↔Projects and Field Notes↔CTA. Already a documented pattern (`mem://style/pause-section`) but not deployed here.
- ⚠ Density jump at Services tiles (3-up grid lands immediately after a cinematic hero). **Fix:** demote first tile to a single full-bleed editorial frame, then 2-up below — asymmetric tension instead of a SaaS grid.
- ✖ Below-the-fold momentum drop around Field Notes preview — cards repeat the same crop ratio as Projects above. **Fix:** Field Notes preview uses tall portrait crops (4:5) to break the rhythm and signal a different content tier.

### Services
- ⚠ Hero → service list → process → faq → CTA. Process and FAQ both arrive with the same reveal direction (up, 12px). **Fix:** alternate reveal axis — Process arrives from below, FAQ arrives via opacity-only (no Y). Same speed, different gesture, audible rhythm.
- ✖ Service cards lack blueprint marks. They are the most "SaaS-like" surface on the site. **Fix:** add DraftCorners to each card at 4% opacity, chapter overline ("01 — GROUNDWORKS"), 1px vertical thread separating card body from CTA link.

### Selected Works (index)
- ⚠ This is the page the user wants to become "strongest on the site". Currently it presents projects as a grid of equal-weight tiles. That reads as a portfolio template, not a collection.
- ✖ No editorial pacing between projects. **Fix:** zigzag layout with -3rem bleed (per `mem://style/layout-standards`), each project gets: oversized serif numeral, project metadata column (location, year, scope, status), full-bleed image, one-line "what was resolved" pull-quote. One project per ~110vh band.
- ⚠ Hover state on project cards uses scale. House rule (`motion.ts`: `IMAGE_HOVER_SCALE = "1"`) says no scale. **Fix:** replace with crossfade between hero crop and detail crop + 1px progress thread underneath.

### Case Studies (`/projects/:slug`)
- ✔ Strongest motion authoring on the site. Reference standard. CaseStudyArrival → Understanding → Scope → Solution → Process → Transformation → Outcomes → Gallery → Close already follows the 5-phase emotion progression.
- ⚠ Outcomes and Gallery both deliver "result" payloads back-to-back. **Fix:** between them, insert a single full-bleed pause frame — black, italic serif client quote, no other UI.

### About
- ⚠ Three-part editorial structure is correct but every section arrives with the same fade-up. **Fix:** middle section ("how we work") uses a horizontal scroll-pin (text holds, image slides) for one moment of differentiation. Returns to vertical immediately after.
- ✖ Headshots / portraits crop at 1:1. **Fix:** structural crops (3:4 portrait, tight to jaw, blueprint thread overlay at 6% opacity) to match the `style/visual-precision-standard` rule.

### Field Notes
- ⚠ List view is chronological card stack. Feels like a blog index. **Fix:** treat as construction log — sticky date column on the left (year only, oversized, 0.45em tracking), entries on the right, hairline divider between months.

### Contact / Apply
- ✖ 638-line page. Form sits in a card on a backdrop. **Fix:** form lives directly on the dark backdrop, no card — labels left-aligned overline style, inputs bottom-border only, one field per row, blueprint thread between sections. The page itself is the container.

### LumenArc
- ✔ Holding standard — leave for now. Re-audit after Selected Works lands.

---

## 2. Motion system — proposed unification

**Action:** make `src/lib/motion.ts` the single source. Migrate the three reveal hooks down to one and route everything through it.

### A. Consolidate hooks
- Keep `useScrollReveal` as the canonical hook. Deprecate `useScrollAnimation` + `useStaggeredAnimation` (re-export thin wrappers that call the canonical one, with the same API, so we can migrate page by page).
- Single defaults: `threshold: 0.18`, `rootMargin: "0px 0px -10% 0px"`, `once: true`.

### B. Promote timings to tier 5 (cinematic)
Current tokens are correct in shape; intensity dial needs to move up:
- `DURATION.normal`: 800 → **900** (section arrivals breathe longer).
- `DURATION.slow`: 1200 → **1400** (hero / chapter arrivals).
- `DURATION.extended`: 1400 → **1800** (full-bleed scene reveals).
- `HOLD`: 1500 → **1800** (longer stillness before next reveal fires in choreographed scenes).
- `STAGGER.section`: 200 → **260**.
- Easing: standardise on `EASE.cinematic` (`cubic-bezier(0.45, 0, 0.15, 1)`) for arrivals — currently split between `default` and `cinematic`.

### C. PageTransition — re-balance
Currently 400/500 (900ms). Proposal: **600ms out / 900ms in (1500ms total)**, opacity-only on exit (drop the 0.995 scale — it reads as a glitch on retina), `EASE.cinematic` both phases. Net effect: transition feels owned, not skipped.

### D. Hover discipline
Audit and remove every `hover:scale-*` on images and cards. Replace with: opacity shift on overlay (0 → 0.15), 1px thread underline on labels, crossfade between two crops on hero tiles. House rule already exists (`IMAGE_HOVER_SCALE = "1"`) but is not enforced — add an ESLint rule or grep gate in CI.

### E. GlobalCinematicBackdrop
- Increase parallax factor `0.04 → 0.09`.
- Add a second, slower-moving layer (factor `0.03`) of plan-line cross-hatch at 2% opacity above the engineering-grid, offset 40px — depth.
- Vignette: current radial is fine; keep.

### F. Reduced-motion path
All three hooks honour it. Add a check to PageTransition's swap that uses a pure crossfade (no transform) under reduced motion. Already correct in spirit, verify implementation.

---

## 3. Blueprint system — make architectural, not decorative

User direction: underused, make more architectural. Concrete moves:

1. **Page-level blueprint layer**, not section-level. Every public page mounts one `BlueprintScene` at the page root with: drafting grid (2.5% opacity), one full-height 1px vertical thread at the asymmetric column line (currently used inconsistently), chapter overline anchor in the top-left corner of the viewport showing the current section name as the user scrolls. This becomes the navigational spine.

2. **Section corners.** Every major section gets `DraftCorners` at the four extremes at 5% opacity. No exceptions. This is the architectural register — repetition is the point.

3. **Status codes.** Adopt `DraftStatusCode` on every hero: top-right corner shows `PE—HOME · REV 06 · 2026`, `PE—SERVICES · REV 04 · 2026`, etc. Small, mono, 0.45em tracking, 40% opacity. Reads as drafting-set markings.

4. **Section indices.** Each section's heading is preceded by `00 ⟶ 00` index pairs (`02 ⟶ 06` = section 2 of 6). Already used on case studies — extend to Home / Services / Selected Works / About.

5. **Threads as transitions.** Between sections, replace the `<hr>`-style dividers with a 1px vertical thread that draws on scroll (stroke-dasharray) — `DraftLine` already supports this. Use everywhere a section change happens.

6. **Remove decorative noise.** Audit and delete: any `bg-plan-lines` used inside a single card (use it at the section level only); any blueprint overlay above 8% opacity (kills photography); any duplicated `BlueprintBackground` + `engineering-grid` stack (pick one per page).

7. **Photography overlays.** Every hero image gets a 4% blueprint thread overlay (one vertical, one horizontal, offset to thirds) — ties photography into the drafting system without competing.

---

## 4. Per-page priority order (when we move to implementation)

If we ship pass-by-pass:

1. **Tokens + hooks** (`motion.ts`, hook consolidation, PageTransition rebalance, backdrop intensification) — invisible plumbing, lifts every page at once.
2. **Selected Works index** — biggest perceived-value lift, sets the standard for the rest.
3. **Home** — pause sections, asymmetric Services tile, blueprint spine.
4. **Services + service detail** — DraftCorners on cards, alternated reveal axes.
5. **About** — structural portraits, one horizontal-pin moment.
6. **Field Notes** — construction-log layout.
7. **Contact / Apply** — strip card chrome.
8. **Case studies** — pause frame between Outcomes ↔ Gallery; otherwise hold.

---

## 5. What I'm not touching in this phase

- Conversion pathway, mobile-first luxury pass, portfolio storytelling rewrite, admin/staff portal overhaul. All queued behind this phase, per the sequencing you picked.
- Copy — `mem://style/copy-standards` already governs that; can run a separate pass.
- Backend / auth / RLS — out of scope here.

---

## 6. Approval gates

Before I start implementation I need a yes/no on each:

- [ ] Adopt the tier-5 timings in §2B (longer arrivals, longer hold).
- [ ] PageTransition rebalance to 600/900 opacity-only.
- [ ] Consolidate three reveal hooks into `useScrollReveal`.
- [ ] Mount `BlueprintScene` at every public page root (page-level spine).
- [ ] Status codes + section indices on every public page hero.
- [ ] Selected Works zigzag layout with -3rem bleeds and oversized numerals.
- [ ] Pause sections inserted at the four locations called out above.

Reply with which gates are green and I'll start with §4 step 1 (tokens + hooks).
