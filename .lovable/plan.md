## /hq Command Centre — Slice 8

Evolve `/hq` from a navigation dashboard into the private operating layer behind the public Peninsula Equine brand. Same serif/mono language, bronze linework, blueprint detail, no SaaS feel.

### New zone architecture

`src/pages/Admin.tsx` is rebuilt around six zones in this exact order, each a `<section>` with the existing roman-numeral + hairline rule header treatment:

```text
01  Command Overview     ← new
02  Pipeline             ← reuse CRMPipeline
03  Applications         ← new
04  Content              ← expand 2×2 → 3×2
05  Projects             ← new
06  Client Preview       ← new toggle/mode
```

`Today`, `Whole-Property Inbox`, `Financial Snapshot`, and `Team` are not removed — they collapse into a quieter `∞ Operations` drawer at the bottom (one expandable section) so existing staff workflows are preserved.

### 01 — Command Overview (`src/components/hq/CommandOverview.tsx`)

A single horizontal manifest strip + activity feed + quick actions. No charts.

- **Metrics row** (6 cells, hairline dividers, mono labels, serif numerals):
  - Active projects (jobs where status ∈ `in_progress`)
  - New enquiries (last 7d, `inquiries` where `deal_stage='new'`)
  - Site visits booked (`site_assessments` upcoming)
  - Proposals sent (`quotes` where `status='sent'`)
  - In-progress builds (`jobs` where `profit_status` not null and not completed)
  - Completed projects (jobs done this quarter)
- **Recent activity feed** — last 8 rows from `activity_log` rendered as a vertical timeline with thin gold rule.
- **Quick actions** — five text links: New Enquiry, Create Quote, Log Site Visit, Open Pipeline, Open Applications.

All counts fetched in one `useEffect` with `Promise.all`, skeletons use the pulsing dot pattern already in HQ.

### 02 — Pipeline

Keep existing `CRMPipeline` in kanban mode by default. Add a thin context bar above it showing the eight stages as text chips with counts so the zone reads as a project pipeline, not just a CRM. Stage list standardised to: New Enquiry · Qualified · Site Visit Booked · Proposal Sent · Approved · In Progress · Completed · Archived. Map these to existing `deal_stage` values where possible; surface stage rename in `crmTypes.ts` only (no schema change required for this slice).

### 03 — Applications (`src/components/hq/ApplicationsInbox.tsx`)

Reads from `inquiries` where `services && ARRAY['full-facility','whole-property']` OR `lead_tags @> '{full-build}'` — i.e. real "Apply to Build" submissions, separated from generic enquiries.

- **Filter bar** (text links, no selects): Project type · Land type · Location · Stage · Priority.
- **List rows** (editorial, not a table): code · name · location · build type · tier · last update · next action.
- **Side drawer** on click: full submission + internal notes textarea (writes to `inquiries.notes`) + three actions: `Good fit`, `Needs review`, `Not aligned` (writes to `lead_tier` / `deal_stage`) + `Convert to project` (creates row in `jobs` linked to inquiry).

### 04 — Content (3×2)

Replace the current 2×2 grid with a six-cell control room. Same minimal card treatment, adds two new cells:

```text
Services        Testimonials      Events
Documents       Selected Works    Field Notes
```

New routes/pages:
- `/hq/selected-works` → `src/pages/AdminSelectedWorks.tsx` — list the three case-study chapters (Main Ridge, Aberdeen, Covered Arena) with edit-in-place links to their data file. CMS-lite: copy/scope/status edits persist to a `managed_projects` table (created in Slice 8b) or, for this slice, to localStorage with a clear "Demo dataset" pill so the client preview is convincing.
- `/hq/field-notes` → `src/pages/AdminFieldNotes.tsx` — manage published field notes (`field_notes` content already in `src/pages/FieldNotes.tsx`). Same editorial pattern.

Both pages reuse the existing `Layout` + masthead pattern from `AdminServices.tsx`.

### 05 — Projects (`src/components/hq/ProjectsBoard.tsx` + `src/pages/HqProjectDetail.tsx`)

- **Board view** at zone 05: lists rows from `jobs` (or, for the curated demo dataset, the three case-study projects) showing name · location · build type · status · next action · last update. Click → routes to `/hq/projects/:id`.
- **Detail page** `/hq/projects/:id`:
  - Header: project code, location, build type, status pill.
  - Six tabs as text links (no shadcn Tabs chrome): Status · Scope · Notes · Gallery · Internal Timeline · Client-facing Summary.
  - Status/scope/summary write back to `jobs` (or demo store).
  - Gallery uses existing project imagery from `src/config/projectImagery.ts`.
  - Internal timeline reads `activity_log` filtered to the project.
  - Client-facing summary field is a textarea explicitly labelled "Visible in Client Portal".

### 06 — Client Preview

A read-only mode rather than a separate route, so the same `/hq` URL can be shared.

- New hook `src/hooks/useHqMode.ts` returns `{ mode: 'staff' | 'preview', isPreview }`. `mode = 'preview'` when:
  - URL has `?view=preview`, OR
  - the logged-in user has `user_roles.role = 'preview'` (new enum value, added in a tiny migration), OR
  - the env flag `?demo=1` is set (for Josh share links).
- A `HqPreviewBanner` mounts at the top of `/hq` when in preview mode: small bronze pill + "Preview — view only · client demo" + an "Exit preview" link for staff.
- All write actions (Create Quote, Convert to project, save notes, edit content) are wrapped in a tiny `<WriteGuard>` component that disables the control and shows a "view-only in preview" hover hint.
- Preview mode also forces the curated demo dataset (Cadence: run-all-seven dataset already loaded in Slice 7) and hides the Team / Operations / Financial sections so the surface stays presentation-grade.
- Routing: `/hq/preview` becomes a thin alias that sets `?view=preview` and forwards to `/hq`.

A separate migration adds `'preview'` to the `app_role` enum and a policy granting that role read access to the demo content, but no write privileges anywhere.

### Visual rules (applied to every new component)

- Serif numerals at zone headers, mono overlines at `0.3em` tracking, accent rules at `1px` height.
- Bronze/gold lines use existing `--accent` token at `15–35%` opacity.
- No bright fill colours, no shadcn `Card` chrome — sections are separated by `border-border/10` hairlines only.
- Spacing follows existing `pe-pause-*` rhythm.
- Activity feed and applications list use `min-h-screen` editorial cadence (one row breathes), not dense tables.
- All interactive elements are text links unless an action is destructive.

### Files touched

New:
- `src/components/hq/CommandOverview.tsx`
- `src/components/hq/ApplicationsInbox.tsx`
- `src/components/hq/ProjectsBoard.tsx`
- `src/components/hq/HqPreviewBanner.tsx`
- `src/components/hq/WriteGuard.tsx`
- `src/hooks/useHqMode.ts`
- `src/pages/AdminSelectedWorks.tsx`
- `src/pages/AdminFieldNotes.tsx`
- `src/pages/HqProjectDetail.tsx`

Edited:
- `src/pages/Admin.tsx` — restructure to 6 zones, fold legacy sections into `∞ Operations`.
- `src/App.tsx` — add routes `/hq/projects/:id`, `/hq/selected-works`, `/hq/field-notes`, `/hq/preview`.
- `src/components/crm/crmTypes.ts` — align stage labels.

DB:
- One migration adding `'preview'` to `app_role` enum + a `managed_projects` table (id, code, name, location, build_type, status, scope, internal_notes, client_summary, next_action, demo flag) with RLS: `authenticated` admin read/write, `preview` role read-only. Includes the required `GRANT` block.

### Out of scope for this slice

- Editable Selected Works writing back to the public site (still served from `src/data/caseStudyData.ts`). HQ edits land in `managed_projects` for the demo; a follow-up slice wires the public site to read from there if you want.
- Real activity_log instrumentation across edge functions (uses existing rows only).
- A full user/permissions admin surface — preview role is added but managed via SQL for now.

### Acceptance

- `/hq` shows the six zones in order, with the bronze hairline header treatment matching Slice 7.
- Counts in zone 01 are live against the dev DB.
- An application can be opened, noted, scored, and converted into a project row.
- `?view=preview` mode disables every write control and hides Operations.
- Mobile (390px): all zones stack cleanly, the metrics row becomes a 2-column grid, the content grid becomes a single column.
