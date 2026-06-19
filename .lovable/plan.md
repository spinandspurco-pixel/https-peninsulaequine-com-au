## Site-Wide Intelligence Pass

This is a large scope. To do it properly without churn, I'll work in waves and report after each. Confirming the plan before I start.

### Scope (public pages only)

Pass 1 — Anchor pages (highest traffic, set the tone)
- `Index.tsx` — Hero copy, restructure to your 8-section spec, prune duplicates
- `Services.tsx` — Reframe 8 services, demote Whole-Property Planning to supporting concept
- `SelectedWorks.tsx` — 3 editorial project cards (Main Ridge, Aberdeen, Covered Arena & Stables)
- `FieldNotes.tsx` — Build-journal tone, timeline markers, headings from your list
- `About.tsx` — "Built by horse people. Backed by construction." Trust-first, not gallery

Pass 2 — Case studies
- `MainRidgePavilion.tsx` — Fire/timber/brick/corrugated steel tone
- `Aberdeen.tsx` — Indoor arena/stable precinct/viewing tone
- `CoveredArenaStablesBuild.tsx` — In-progress steel/clay/storm tone
- `RecoveryStation.tsx` (LumenArc) — Quiet/technical/restorative

Pass 3 — Supporting
- `Contact.tsx` / Estimate / nav dropdown — CTA standardisation ("Start a Project", "Explore Selected Works", "View Services", "Read Field Notes", "Explore LumenArc")
- `layout/` nav: remove Whole-Property Planning from services dropdown
- Footer + `RouteCanonical` meta titles/descriptions per page

Pass 4 — Construction-intelligence design layer (subtle, no sci-fi)
- Section numbers (01 / 02 …) on Index + Services + Selected Works
- Project status pills (`In Progress` / `Completed`) on Selected Works + case studies
- Hairline technical dividers between major sections
- Refined image captions (project · location · year)
- Field Notes timeline dots
- Reuse existing `BlueprintDivider` / blueprint tokens — no new heavy components

### What I will NOT touch
- Admin/staff/portal/CRM pages (`Admin*`, `Staff*`, `Employee*`, `Bookings*`, `Client*`, `Trainer*`)
- Lessons/booking funnel (`Lessons`, `BookLesson`, `GroupBooking`, `Schedule`, `Pricing`)
- Routing, data fetching, backend, auth, edge functions
- Image assets themselves — only placement, captions, alt text
- Hero image loading behaviour (recently shipped)

### Image placement rules I will enforce
Per your spec — sliding stop only in horseman/arena-surface contexts; Ciro+Ace only on About; Main Ridge images only on Main Ridge + Selected Works; Aberdeen images only on Aberdeen + indoor arena/stable sections; boots/clay/steel/machinery only in Field Notes / Groundworks / Covered Arena build; stable aisle only Stables & Aberdeen; drainage only in drainage/groundworks; LumenArc only in LumenArc.

I'll audit current usages and move/remove mismatches. Where an image is removed and no correct one exists, the slot becomes a tonal block (charcoal + hairline grid) rather than a placeholder.

### Pages flagged for human review (won't touch without your call)
- `Arenas.tsx`, `Stables.tsx`, `RoundPens.tsx`, `Infrastructure.tsx`, `Boarding.tsx`, `EquineEstates.tsx` — overlap with new Services structure. Likely consolidate into `ServiceDetail` or remove from nav. I'll list them in the final report rather than delete unilaterally.
- `TheStandard.tsx`, `WhyWeExist.tsx`, `Process.tsx`, `Visualise.tsx`, `HQ.tsx`, `Testimonials.tsx`, `FAQ.tsx`, `SiteAssessment.tsx` — flag for your decision: keep / fold into Services or About / remove from nav.

### Deliverable per wave
After each pass I'll report exactly:
1. Headings improved (before → after)
2. Copy rewritten (locations)
3. Sections removed/simplified
4. Image placements corrected
5. Pages still needing your review
6. Build status

### Question before I start
Two quick calls so I don't ship something you'd reverse:

**A. The orphan pages above (Arenas, Stables, RoundPens, Infrastructure, Boarding, EquineEstates, TheStandard, WhyWeExist, Process, Visualise, HQ, Testimonials, FAQ, SiteAssessment).** Want me to:
- (i) Leave them as-is, just flag them; OR
- (ii) Remove them from nav/footer but keep the routes; OR
- (iii) Fold service-y ones into `ServiceDetail` and drop the rest from routing.

**B. Whole-Property Planning** — supporting concept where? Options:
- (i) A short callout band on Services page only; OR
- (ii) A section on About; OR
- (iii) Both.

Reply with A(i/ii/iii) and B(i/ii/iii) and I'll execute the four waves in sequence, reporting after each.
