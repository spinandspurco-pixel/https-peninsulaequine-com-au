# Peninsula Equine

Production codebase for **peninsulaequine.com.au** — the public marketing site, client-facing flows (assessments, bookings, portals), and **HQ** (internal operating system covering CMS, projects, relationships, deploy health, and operations).

> Single-bundle React SPA. The frontend deploys from GitHub Actions to GitHub Pages; Supabase provides Auth, database, storage, and Edge Functions.

---

## Build & Security Status

> Replace `OWNER/REPO` below with this repository's GitHub `owner/repo` slug. All badges reflect the `main` branch.

| Workflow | Status |
|---|---|
| Security gate (blocking, per-PR) | [![Security gate](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/security-gate.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/security-gate.yml) |
| Nightly security scan | [![Nightly security scan](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/nightly-security-scan.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/nightly-security-scan.yml) |
| Strict build (typecheck + lint + vitest) | [![Strict Build](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/strict-build.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/strict-build.yml) |
| Node.js CI | [![Node.js CI](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/node.js.yml) |
| Prerender unit tests | [![Prerender unit tests](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/prerender-unit-tests.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/prerender-unit-tests.yml) |
| Verify prerendered head tags | [![Verify prerendered head tags](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/verify-prerender.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/verify-prerender.yml) |
| Verify accessibility (axe) | [![Verify accessibility](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/verify-accessibility.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/verify-accessibility.yml) |
| Verify asset pointers | [![Verify asset pointers](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/verify-assets.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/verify-assets.yml) |
| Verify internal links | [![Verify internal links](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/verify-internal-links.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/verify-internal-links.yml) |
| Publish smoke test (post-deploy) | [![Publish Smoke Test](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/publish-smoke-test.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/publish-smoke-test.yml) |
| Preview mint gate | [![Preview Mint Gate](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/preview-mint-check.yml/badge.svg?branch=main)](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/actions/workflows/preview-mint-check.yml) |

---



---

## 1. Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript 5 |
| Routing | `react-router-dom` v6 (`BrowserRouter`) |
| Styling | Tailwind CSS v3 + shadcn/ui (Radix primitives) |
| State / data | `@tanstack/react-query`, `zustand`, `react-hook-form` + `zod` |
| Backend | Supabase — Postgres + Auth + Storage + Edge Functions |
| AI | Lovable AI Gateway (Gemini / GPT-5) via edge functions |
| PDF / docs | `jspdf`, `react-markdown` |
| Testing | `vitest`, `@testing-library/react`, `@playwright/test`, `axe-core` |
| Build wrapper | `scripts/build-strict.ts` (typecheck → vite build → prerender → verify) |

---

## 2. Folder structure

```
.
├── public/                  # Static assets served as-is (favicon, /assets/*, /sounds/*)
├── src/
│   ├── App.tsx              # Top-level router (all routes registered here)
│   ├── main.tsx             # React entry, global providers
│   ├── index.css            # Design tokens + Tailwind layer
│   ├── pages/               # 62 route components (public + /hq/*)
│   ├── components/          # Shared UI; hq/ subdir for HQ-specific
│   │   └── ui/              # shadcn primitives
│   ├── integrations/
│   │   └── supabase/        # Generated client + types (DO NOT EDIT)
│   ├── lib/                 # Business logic (graph engine, work queue,
│   │                        # deploy health, auth routing, command centre)
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand stores
│   ├── data/                # Static seed/content data
│   ├── config/              # App-level config
│   └── test/                # Vitest setup
├── supabase/
│   ├── config.toml          # Auto-generated, do not hand-edit
│   ├── migrations/          # SQL migrations (source of truth for schema)
│   └── functions/           # Edge functions (see §6)
├── scripts/                 # Build, prerender, verification, smoke tests
├── .github/workflows/       # CI (strict build, prerender, a11y, smoke, security)
├── vite.config.ts           # Vite config (alias @ → src/)
├── .github/workflows/deploy-github-pages.yml # GitHub Pages deployment
├── public/_headers          # Static-host security-header baseline
├── OPS_ALERTS.md            # Live operational alerts (external infra)
├── RUNBOOK.md               # Deploy, rollback, key rotation, and governance
└── REPOSITORY_CLEANUP_PLAN.md  # Audit & staged cleanup roadmap
```

---

## 3. Key routes

### Public

| Path | Purpose |
|---|---|
| `/` | Homepage (cinematic hero, narrative sections) |
| `/arenas`, `/stables`, `/infrastructure` | Service category landings |
| `/services`, `/services/:slug` | Service catalogue + detail |
| `/selected-works`, `/selected-works/:slug` | Case studies |
| `/lumenarc` | LumenArc product line |
| `/about`, `/contact` | Editorial + lead capture |
| `/site-assessment`, `/estimate`, `/client-quote` | Paid qualification + quoting flow |
| `/lessons`, `/book-lesson`, `/group-booking`, `/schedule` | Horsemanship sessions |
| `/events` | Public events |
| `/portal`, `/portal/login` | Magic-link client portal |
| `/privacy`, `/terms`, `/thank-you`, `/404` | Utility |

### HQ (auth-gated, role-based via `ProtectedRoute`)

| Path | Roles | Purpose |
|---|---|---|
| `/hq` | admin, employee, trainer, moderator, preview | Command Centre (Morning Brief, Work Queue, Watchlist) |
| `/hq/legacy`, `/hq/projects`, `/hq/clients` | same | Legacy admin surface |
| `/hq/projects/:id` | same | Project workspace |
| `/hq/cms`, `/hq/services`, `/hq/testimonials`, `/hq/events`, `/hq/selected-works`, `/hq/field-notes` | content roles | CMS surfaces |
| `/hq/media`, `/hq/review` | admin/mod/preview | Media library + knowledge-graph suggestions |
| `/hq/inquiries`, `/hq/documents`, `/hq/activity`, `/hq/staff` | mixed | Operations |
| `/hq/cms`, `/hq/email-migration`, `/hq/staff-allowlist`, `/hq/graph-smoke`, `/hq/deploy-health`, `/hq/dns-*` | **admin only** | Platform / ops |

`ProtectedRoute` reads the Supabase session and `user_roles` (separate table — never on profiles; see `src/lib/authRouting.ts`). Preview-role users see a subtle banner; admins see "Exit preview".

---

## 4. HQ / Admin architecture

- **Entry:** `/hq` → `HqCommandCentre.tsx`. Two-tier navigation (`HqNav`): Primary row (PE · Applications · Content · Projects · Clients) + contextual sub-row per section. Collapsible groups remember state via `localStorage`.
- **Breadcrumbs:** Every non-top-level HQ page uses `HqBreadcrumbs` (`HQ / Section / Page`).
- **Work Queue scoring:** `src/lib/commandCentre/workQueue.ts` ranks priorities for the Morning Brief.
- **Relationship graph (C.1b — frozen):** `hq_graph_edges` + `managed_projects.aliases`; engine in `src/lib/graph/`. `◇ Suggested` chips surface candidate edges in Media, resolved via `/hq/review`.
- **Deploy Health:** `/hq/deploy-health` + `DeployHealthBanner` + `DeployStatusWidget` track bundle hash drift; escalates to "Platform action required" after a stale streak. Logic in `src/lib/deployHealth.ts`.
- **Operations widget:** admin/founder-only `ops-signals` widget on the Command Centre (`src/lib/roleView.ts`). Diagnostics never shown to client roles.
- **Graph Smoke Test:** `/hq/graph-smoke` runs the `run-graph-smoke-test` edge function and reads results from `graph_smoke_reports`.
- **AuthDebugPanel:** strictly localhost-only — never renders in preview or production (`src/components/AuthDebugPanel.tsx`).

---

## 5. Supabase setup

The Supabase client is auto-generated at `src/integrations/supabase/client.ts` — **do not edit**. Import everywhere as:

```ts
import { supabase } from "@/integrations/supabase/client";
```

### Conventions

- **RLS is mandatory** on every `public` table, paired with explicit `GRANT`s to `authenticated` / `service_role` (and `anon` only when the policy allows anonymous reads).
- **Roles** live in a dedicated `user_roles` table (enum: `admin`, `moderator`, `employee`, `trainer`, `preview`, `user`). Checked via the `has_role(uuid, app_role)` security-definer function. Never store role on profiles.
- **Auth providers:** email + Google. HIBP password protection enabled (`password_hibp_enabled`).
- **Service role key** is not exposed to the frontend and is available only to the Supabase Edge Function runtime.

### Migrations

All schema changes go through `supabase/migrations/*.sql`. The Supabase deployment workflow applies them; do not run `supabase db push` directly against production.

---

## 6. Edge functions

Located in `supabase/functions/`. Deployed automatically on commit.

| Function | Purpose |
|---|---|
| `admin-ai-assistant` | Lovable AI Gateway proxy for HQ assistant |
| `generate-enquiry-response` | AI-drafted reply for new inquiries |
| `send-inquiry-notification`, `send-rsvp-confirmation`, `send-welcome-series`, `send-document-notification`, `send-test-email` | Transactional email (Resend) |
| `create-lesson-checkout` | Payment session for lessons |
| `create-staff-account`, `verify-admin-login`, `mint-josh-preview`, `preview-mint-check` | Auth utilities |
| `e2e-seed-users` | Test fixture seeding |
| `run-graph-smoke-test` | Knowledge-graph smoke test invoked from `/hq/graph-smoke` |
| `email-ops-status`, `resend-domain-status`, `notify-dns-propagated`, `verify-google-dns` | Email/DNS health |

---

## 7. Environment variables

Frontend-injected (Vite — must be prefixed `VITE_`):

| Variable | Notes |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PROJECT_ID` | Project ref |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Must be `sb_publishable_…` format.** Legacy JWT-shaped keys (`eyJ…`) are forbidden — they cause 401s on rotation. |

Backend-only (set in Supabase secrets, never in `.env`):

- `SUPABASE_SERVICE_ROLE_KEY` — server only
- `RESEND_API_KEY`, `LOVABLE_API_KEY`, plus any provider keys edge functions need

`.env` is committed in this repo (publishable values only). Never add service-role or private keys.

---

## 8. Local development

```bash
bun install
bun run dev           # Vite dev server on http://localhost:8080
bun run lint
bun run test          # vitest
bun run test:e2e      # playwright (requires test:e2e:install first)
bun run verify:a11y   # axe-core accessibility sweep
```

`npm` / `pnpm` work but `bun` is the project standard.

---

## 9. Build & verification pipeline

`bun run build` runs **`scripts/build-strict.ts`**, which:

1. **`prebuild`** — `verify-assets.ts` + `verify-homepage-image-uniqueness.ts` (asset integrity).
2. **Typecheck** (strict, fails the build).
3. **Vite build** → `dist/`.
4. **`postbuild`** — `prerender.ts` (static-renders key public routes), `verify-prerender.ts` (validates output against `prerender-verify.schema.json`), `verify-internal-links.ts`.

### Output

| Setting | Value |
|---|---|
| Output dir | `dist` |
| Entry HTML | `dist/index.html` |
| Build command | `bun run build` |
| Install command | `bun install` |
| Node version | 18+ (Bun handles toolchain) |

---

## 10. Deployment

### GitHub Pages

1. Merge a reviewed change to `main`.
2. GitHub Actions runs `bun install --frozen-lockfile` and `bun run build`.
3. The Pages workflow publishes `dist`, including `404.html` as the SPA fallback.
4. Repository variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, and `VITE_SUPABASE_PUBLISHABLE_KEY` provide the public client configuration.
5. The production custom domain is `peninsulaequine.com.au`; DNS is managed at the registrar.

After a deploy, verify on the production domain:
- Homepage 200 + the latest bundle hash.
- `/hq` renders the login gate.
- Login completes against Supabase (no 401s — confirms `sb_publishable_*` key is bound correctly).
- A deep link (e.g. `/services/arenas`) refreshes without 404.

---

## 11. CI workflows (`.github/workflows/`)

| Workflow | Trigger | What it checks |
|---|---|---|
| `strict-build.yml` | PR + push | Full `bun run build` (typecheck + prerender + link verify) |
| `prerender-unit-tests.yml` | PR | Prerender logic unit tests |
| `verify-prerender.yml` | PR | Prerender output schema |
| `verify-internal-links.yml` | PR | No broken internal links in prerendered HTML |
| `verify-accessibility.yml` | PR | axe-core sweep on built output |
| `verify-assets.yml` | PR | Asset integrity / no orphans introduced |
| `preview-mint-check.yml` | scheduled | Preview-account session mint health |
| `publish-smoke-test.yml` | post-publish | Verifies homepage loads, `/hq` renders, login flow, hero bundle hash matches latest build |
| `security-gate.yml` | PR | Blocks merges with unresolved criticals |
| `nightly-security-scan.yml` | nightly | Full security scan |

---

## 12. GitHub deployment flow

- GitHub is the source of truth: branch, review, and merge changes there.
- A merge to `main` runs validation and deploys the public frontend to GitHub Pages.
- Use the GitHub Actions run and `/hq/deploy-health` to verify each release.

---

## 13. Operational status

- **Live alerts:** see [`OPS_ALERTS.md`](./OPS_ALERTS.md). No open alerts.
- **Cleanup roadmap:** see [`REPOSITORY_CLEANUP_PLAN.md`](./REPOSITORY_CLEANUP_PLAN.md). **Stage A complete** (orphan asset purge + 8 unused packages removed). Stages B–D pending explicit approval.
- **Known optimisation target:** `Admin-*.js` (~716 KB) and `index-*.js` (~755 KB) — to be addressed via Vite `manualChunks` before further code deletion.

---

## 14. Conventions & guardrails

- Australian English, Mornington Peninsula focus. No US-centric copy.
- Institutional voice — no founder names/bios in public copy (limited overrides documented in project memory).
- Design tokens only — never hardcode colour utilities like `text-white` or `bg-[#…]`. All colours live in `src/index.css` and shadcn variants.
- Never edit `src/integrations/supabase/{client.ts,types.ts}`, `supabase/config.toml`, or auto-managed `VITE_SUPABASE_*` entries in `.env`.
- Roles always checked server-side via `has_role()` — never trust client storage for privilege.
