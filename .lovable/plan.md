## Scope

Public site only (items 1–6). No admin portal in this pass. Selected Works stays on existing project content — restyle only. Copy cuts applied directly. Brand direction unchanged: serif/sans pairing, blueprint grading, asymmetric tension, low-opacity micro-lines, silent UX.

The admin overhaul (item 7) and the `projects` pipeline table you approved will follow as a second slice once this lands.

## What I'll change

### 1. Homepage hero (`src/pages/Index.tsx`)

The current entrance fires multiple staggered tracks at once (atmosphere, blueprint overlay, chapter label, headline, support line, CTAs, scroll cue). Result reads busy.

Refine to a single weighted arrival:
- Reduce concurrent motion tracks to **three**: backdrop fade-in, headline reveal, then CTA + scroll cue together.
- Move overlay/blueprint layers to a longer, slower fade behind the headline (1400ms, `cubic-bezier(0.45,0,0.15,1)`) so they read as atmosphere, not events.
- Tighten the headline timing window — single 900ms reveal, no per-word stagger.
- Hold a 400ms beat before CTAs appear so the headline lands before the eye moves.
- Drop the secondary "chapter label" above the headline on hero only (kept on inner sections). It currently competes with the PE mark.

### 2. Services dropdown (`src/components/layout/Header.tsx`)

Today the dropdown lists every service with descriptive sub-copy — overloaded.

- Group into **3 columns** by intent: *Build* (Arenas, Stables, Covered, Infrastructure), *Plan* (Whole-Property Planning, Site Assessment, Pricing), *Programs* (Lessons, Events, Trainer). Column headers as overline.
- Strip per-item descriptions to a single hairline label. Description becomes a single sentence per column, not per item.
- Add one "View all services →" tail link at the bottom-right of the panel.
- Mobile accordion mirrors the same three groups so structure matches.

### 3. Selected Works rework (`src/pages/SelectedWorks.tsx`, `src/data/caseStudyData.ts` if needed for ordering only)

Restyle to a true luxury portfolio. Content unchanged.

- New card composition: full-bleed image, project name in serif overlay, location + year in mono overline, single status line (Resolved / In Progress). No mid-card CTA — whole card is the link.
- Hierarchy: **one** feature project (Main Ridge) at full-viewport scale, remaining projects in an asymmetric 2-up grid with -3rem bleed alternating left/right.
- Cinematic transitions: enter via `IntersectionObserver` with a 1100ms image scale-from-1.04 + caption fade, staggered per card.
- Hover: 600ms image desaturate + 1.02 scale, caption rises 8px. No shadow halos.
- Page header follows the established `bg-background/55` + engineering grid standard.

### 4. Spacing & overlap audit

Pages I'll sweep: `Index`, `About`, `Services`, `SelectedWorks`, `CaseStudy`, `Contact`, `MainRidgePavilion`, `Arenas`, `Stables`, `Infrastructure`, `FieldNotes`, `Events`.

Focus points:
- Chapter labels colliding with PE marks at `md` breakpoint — move PE mark to a fixed corner anchor on inner pages.
- Hero headline clipping at 375–414px — clamp font size via `clamp()` and reduce tracking on `< sm`.
- Footer top-padding consistency (currently varies between 8rem and 14rem across pages).
- Section pause blocks: enforce single `py-32 md:py-48` token.
- Mobile horizontal overflow from `-mx-` bleeds on Selected Works and About — gate bleeds behind `md:`.

### 5. CTA flow

Standardise three site-wide CTAs with consistent label, weight, and placement:
- **Selected Works** — neutral hairline link, used after editorial sections.
- **Services** — neutral hairline link, used after capability statements.
- **Apply to Build** — only filled accent treatment, used once per page max, at decision moments.

Remove duplicate Apply CTAs from mid-scroll on Index and Services. Header keeps the only persistent Apply.

### 6. Copy reduction

Cuts applied directly per your established copy standards (30–50% reduction, 2–3 line paragraphs, no generic descriptors). Targets:
- Hero support line → one sentence.
- Index section intros → strip restated mission lines that repeat the homepage header.
- Services page → remove the second "Why we exist" paragraph (duplicated from About).
- Selected Works intro → reduce to overline + one sentence.
- About → consolidate the two philosophy blocks into one.

## What I won't touch in this pass

- Admin portal, dashboard, pipeline, managers, staff resources (item 7).
- `projects` table migration (deferred to admin slice).
- Brand tokens, fonts, colour grading.
- Caves Studio content / case study narrative copy.
- Selected Works content itself (only layout + transitions).

## Verification

- Playwright headless screenshots at 375 / 768 / 1280 of: Index hero, services dropdown open, Selected Works grid, Selected Works hover state, About header, mobile nav with services accordion open.
- Console + network check on each route for errors.
- Re-screenshot the spacing-audit pages at the three breakpoints before claiming done.

## Order of execution

1. Header services dropdown restructure (smallest, unblocks CTA audit).
2. Homepage hero refinement.
3. Selected Works rework.
4. CTA + copy pass across Index, Services, About, Selected Works.
5. Spacing audit + mobile fixes across the page list.
6. Verification screenshots, report back with any deferred items.
