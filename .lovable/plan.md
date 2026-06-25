## Phase C.1 — Peninsula Knowledge Graph

This is not a feature. It is the second layer of Peninsula OS — the connective tissue every future module will speak through.

```text
Layer 1  Foundation        Auth · Roles · Staff
Layer 2  Knowledge Graph   ← this phase
Layer 3  Modules           Media · Activity · CMS · Documents · Inquiries
Layer 4  Views             Command Centre · Project Workspace · Daily Brief
```

Built in two halves: the graph itself (infrastructure), then suggestions (the first consumer).

> **Guiding principle.** Although the graph is generic, Phase C.1 intentionally implements **Project-centric relationships only** (Project ↔ Media · Documents · Field Notes · Activity · Inquiries · Staff). Additional node domains (Client, Horse, Invoice, Proposal, Deliverable) will not be connected until they have a concrete operational need. Relationship Explorer is deferred to future work; **Coverage** is the headline outcome of this phase.

---

### The model — `hq_graph`

A node-and-edge graph. Every object in HQ is a **node**. Anything that relates to anything else is an **edge**. Project ↔ Media today; Horse ↔ Media, Client ↔ Invoice, Staff ↔ Project tomorrow — same shape.

```text
hq_graph_edges
├── id
├── from_type     (project | media | document | field_note | inquiry | note | staff | client | horse | …)
├── from_id       uuid
├── to_type       same enum
├── to_id         uuid
├── relation      (belongs_to | references | authored_by | attached_to | …)
├── status        (system_linked | suggested | manual | verified | dismissed)
├── matched_rules text[]    -- ['filename_alias','recent_uploader','project_tag']
├── created_by    uuid
├── verified_by   uuid
├── created_at
└── updated_at
```

Key decisions:

- **Trust as lifecycle, not score.** `status` is the canonical truth signal. Numeric weights live only inside `match.ts` to *derive* `matched_rules`; nothing numeric is persisted or shown.
- **One table for live + suggested edges.** A `suggested` row becomes `manual` (user attached) or `verified` (user explicitly confirmed a system-linked one) or `dismissed`. No second suggestion table — keeps the graph the single source of truth.
- **Indexed both directions** `(from_type, from_id)` and `(to_type, to_id)` so any module can traverse either side cheaply.
- **No `node` table.** Nodes are the existing rows in `managed_projects`, `media_assets`, etc. The graph references them by `(type, id)`. This avoids a second source of truth.

GRANTs: `authenticated` read/write, `service_role` all. Preview writes blocked via the existing `block_preview_writes` pattern. RLS scopes writes to admin/staff roles; reads follow each entity's existing visibility.

---

### Phase C.1a — Knowledge Graph (infrastructure, no UI)

Goal: every relevant object in HQ knows what it belongs to. Nothing visible changes.

1. **Migration**
   - `aliases text[]` on `managed_projects` (Main Ridge: `['main-ridge','mainridge','mr','main ridge pavilion']`).
   - `hq_graph_edges` table + GRANTs + RLS.
   - Backfill: any existing `project_id` / `project_slug` columns on media, documents, field notes, inquiries → edges with `status='system_linked'`, `matched_rules=['legacy_column']`.

2. **Graph library** (`src/lib/graph/`) — the only API anything else calls.
   - `edges.ts` — `link()`, `unlink()`, `setStatus()`, `relatedTo(type, id, opts)`, `coverage(type, id)`.
   - `types.ts` — node/edge/status/relation enums shared across the codebase.
   - Pure functions where possible; thin Supabase wrappers otherwise. Unit tested.

3. **Rule engine** (`src/lib/graph/rules/`) — separate from the graph.
   - One file per rule (`filenameAlias`, `projectTag`, `recentUploader`, `inquirySuburb`, `clientContact`, `exifGps`). Each: `(entity, candidates) → { matched: boolean, label: string }`.
   - `evaluate.ts` — runs the rule set against active projects, returns candidate edges. **Does not write anything.** Adding a rule = adding a file.

4. **Activity events** registered (not yet emitted from UI):
   `media_attached`, `document_attached`, `field_note_attached`, `inquiry_attached`, `edge_verified`, `edge_dismissed`.

5. **Tests**
   - Unit: each rule, the evaluator, `coverage()`.
   - Integration: backfill produces expected edges; preview role cannot write; reads stay scoped.

Stops here. The graph exists, is populated, and is queryable. No chips. No panels.

---

### Phase C.1b — Suggestion Engine + Surface (graph's first consumer)

The graph is infrastructure; the suggestion engine is the first thing built *on top of it*. It reads the graph, runs rules, and writes `status='suggested'` edges. Tomorrow Command Search, Daily Brief and Project Workspace are additional consumers — same graph, no rework.

1. **Suggestion service** (`src/lib/graph/suggestions.ts`)
   - On insert/update of media/document/field-note/inquiry, a SECURITY DEFINER trigger calls a helper that runs `evaluate()` and inserts `status='suggested'` edges (idempotent on `(from, to, relation)`).
   - One-off backfill pass after deploy generates suggestions for existing rows that have no edge.

2. **`RelationshipChip`** — single component reused across Media Vault rows, Inquiry header, Document item, Field Note item. Subtle inline: `Looks like Main Ridge · Attach · Not now`. No numbers, no modals. Attach → `status='manual'`. Dismiss → `status='dismissed'`.

3. **Needs Review** card in Command Centre:
   ```text
   Needs review        Judgement required
   ─────────────────────────────────────
   14 media · 2 documents · 1 inquiry  →
   ```
   Click-through scopes the bulk queue.

4. **Bulk review** — `/hq/review`. Grouped by entity type. Keyboard `J` `K` `A` `S`. Admin/staff only; preview read-only.

5. **Media Vault — Unassigned filter**: `All · Unassigned · By project`. Unassigned = no edge with `status ∈ (system_linked, manual, verified)`.

6. **Project Coverage** — derived live from the graph, surfaced on the existing project admin row (and ready for Phase C.2 Workspace):
   ```text
   Main Ridge
   Coverage
   Media        ✓ Verified
   Documents    ✓ Manual
   Field Notes  ⚠ Suggested
   Activity     ✓
   Deliverables ✕ None
   ```
   Pure derivation from `coverage()` — no new storage.

7. Activity Timeline picks up the new event types automatically.

---

### Reserved for later (designed-in, not built)

- **Relationship Explorer** on each entity (`Connected to: 24 Media · 13 Documents · 8 Field Notes · 2 Clients · 3 Staff`). Graph supports it today; UI lands with Phase C.2.
- Additional node types: Horse, Client, Invoice, Deliverable, Proposal. Schema supports them — we simply do not register edges for them yet.
- Command Search, Daily Brief, Project Workspace — all future consumers of the same graph.

---

### Explicitly out of scope

- `/hq/projects/:id` Workspace shell — Phase C.2.
- AI / LLM. Rules are deterministic.
- Auto-attach without confirmation.
- Any change to public site, role permissions, or existing entity shapes (purely additive).

---

### Sequence

**C.1a — Graph**
1. Migration: `aliases`, `hq_graph_edges`, GRANTs, RLS, backfill from legacy columns.
2. `src/lib/graph/` — types, edges API, rules, evaluator. Unit tests.
3. Typecheck + tests green. Pause.

**C.1b — Suggestions**
4. SECURITY DEFINER trigger function + attach to the four source tables.
5. One-off suggestion backfill for existing rows.
6. `RelationshipChip` + wire into Media Vault row.
7. Unassigned filter.
8. Needs Review card in Command Centre.
9. `/hq/review` bulk queue.
10. Chip wired into Inquiries, Documents, Field Notes.
11. Project Coverage block on project admin row.
12. QA pass (admin + preview, mobile), publish.

When Phase C.2 opens Main Ridge, the Workspace already has Media, Documents, Field Notes, Activity and a Coverage readout — because the graph beneath every module has been speaking the same language all along.