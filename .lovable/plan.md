# Brand Realignment — Remove GroundLock, Install Recovery Station

GroundLock currently spans 55 files: 14 dedicated pages, a `components/groundlock/` folder, proposal templates, CRM lead types, masterplan zones, edge functions, SQL migrations, and metadata. This is a destructive cleanup, not a rename.

## 1 — New site architecture

Header + footer nav reduced to exactly:

```text
Arenas · Stables · Equine Estates · Recovery Stations · Infrastructure & Maintenance · Selected Work · About · Contact
```

Route mapping:

| Nav item                     | Route                          | Source                                        |
| ---------------------------- | ------------------------------ | --------------------------------------------- |
| Arenas                       | `/arenas`                      | new — split from `/services`                  |
| Stables                      | `/stables`                     | new — split from `/services`                  |
| Equine Estates               | `/equine-estates`              | new — rebuilt from EquusRidge tone            |
| Recovery Stations            | `/recovery-stations`           | rebuilt from existing `/pavilion` page        |
| Infrastructure & Maintenance | `/infrastructure`              | new — absorbs round pens, fencing, surfaces   |
| Selected Work                | `/gallery`                     | existing                                      |
| About                        | `/about`                       | existing                                      |
| Contact                      | `/contact`                     | existing                                      |

The current `/pavilion` page is renamed and rewritten as **Peninsula Equine Recovery Station** — wellness, grooming, drying, post-work recovery, winter comfort, performance preparation. Same cinematic structure, refreshed copy and trademark line.

## 2 — Pages deleted

Removed from router and filesystem:

```text
src/pages/GroundLock.tsx
src/pages/GroundLockHowItWorks.tsx
src/pages/GroundLockSystems.tsx
src/pages/GroundLockSetup.tsx
src/pages/GroundLockOnboarding.tsx
src/pages/GroundLockLicensing.tsx
src/pages/GroundLockEvents.tsx
src/pages/SignatureSystems.tsx        (built around GL tiers)
src/pages/Shop.tsx                    (Systems showroom around GL)
src/pages/Forge.tsx                   (GL Forge product line)
src/pages/InstallerAccess.tsx         (GL installer portal)
src/pages/SiteAssessment.tsx          (will be rebuilt minimal, no GL framing)
```

Components deleted wholesale:

```text
src/components/groundlock/*           (entire folder)
src/components/proposal/ProposalGroundLock.tsx
src/components/InteractiveMasterplan.tsx  (GL hover zones)
```

## 3 — Files rewritten, not deleted

- `src/components/layout/Header.tsx` — new nav
- `src/components/layout/Footer.tsx` — new column structure, no GL
- `index.html` — title, description, OG, JSON-LD
- `public/sitemap.xml` + `public/robots.txt` — new routes only
- `src/App.tsx` — drop dead routes, add new ones, register Recovery Station
- `src/pages/Services.tsx` — becomes a thin redirect/index pointing at the 5 offering pages
- `src/pages/Contact.tsx` — remove GL mentions in form options
- `src/pages/ClientPortal.tsx`, `ClientQuote.tsx` — strip GL line items
- `src/data/caseStudyData.ts` — remove GL outcome metrics, no grid copy
- `src/data/servicePricingFaq.ts` — drop GL FAQs
- `src/components/QuoteBuilder.tsx`, `proposal/Proposal*.tsx` — remove GL scope items, leave Arena/Stable/Estate/Recovery/Infra
- `src/components/masterplan/*` — strip GL grid zones, keep generic site zones
- `src/components/crm/crmTypes.ts`, `LeadDetailPanel.tsx` — drop `interest: 'groundlock'` enum, replace with new offerings

## 4 — Backend cleanup

Edge functions:

- `supabase/functions/generate-groundlock-proposal/` — delete folder
- `supabase/functions/generate-enquiry-response/index.ts` — strip GL prompt sections
- `supabase/functions/admin-ai-assistant/index.ts` — strip GL knowledge blocks

SQL migrations are historical record — **not edited**. Any live `groundlock_*` tables/columns remain in the DB but become orphaned; no app code reads them after this pass. A follow-up migration to drop them can be done separately if you want — flag below.

`src/integrations/supabase/types.ts` is auto-generated — leaves any GL table types in place harmlessly until the next types regen.

## 5 — SEO + metadata

- `index.html` `<title>`: *Peninsula Equine — premium equine environments*
- meta description: *Arenas, stables, equine estates and recovery stations — built by riders, crafted for performance. Mornington Peninsula.*
- JSON-LD `Organization` name + description aligned
- `sitemap.xml` lists only the 8 nav routes + project case studies
- `robots.txt` keeps allow-all

## 6 — Verification pass

- `rg -i 'groundlock|ground.?lock|ground.?grid'` returns zero hits in `src/`, `index.html`, `public/`, edge functions
- Every nav link resolves to a live route (no 404s)
- Every internal `<Link to=...>` audited against the new route list; broken ones rewritten or removed
- Build passes

## Decisions I need from you before I start

1. **`/site-assessment`** — currently GL-framed but the assessment model itself is a core business tool (per memory). Keep route, rewrite copy generically (recommended) or delete entirely?
2. **`/equus-ridge`** — branded destination page, no GL inside. Keep as-is, or fold into the new `/equine-estates`?
3. **CRM lead `interest` enum** — drop `'groundlock'` and replace with `'recovery_station' | 'arena' | 'stable' | 'estate' | 'infrastructure'`? Existing leads with `interest='groundlock'` will display as "—" until manually re-tagged.
4. **Orphaned DB tables** — write a follow-up migration to drop `groundlock_*` tables, or leave them in place?

Answer those four and I'll execute the full pass in one go.
