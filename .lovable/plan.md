# Media Vault v1 — Plan

PE's evidence vault. Images first, schema flexible for video/PDF later. Sits **alongside** `cms_gallery_items` and `src/assets/**` — no migration in v1.

## 1. Data model — `public.media_assets`

Flexible enough that v2 (video, PDF) needs no schema change.

```text
id               uuid pk
asset_type       text  default 'image'    -- 'image' | 'video' | 'pdf' (v2+)
storage_path     text  not null            -- 'media-vault/{uuid}/{filename}'
file_url         text                      -- optional cached signed/public URL
mime_type        text
width            int
height           int
file_size        bigint

title            text  not null
description      text
alt_text         text

project_id       uuid  references managed_projects(id) on delete set null
location         text
credit           text                      -- photographer / source
usage_rights     text                      -- 'internal' | 'client' | 'public' | freeform

approval_state   text  not null default 'draft'   -- 'draft' | 'approved' | 'archived'
is_demo          boolean not null default false
tags             text[] not null default '{}'
sort_order       int    not null default 0

created_by       uuid  references auth.users(id)
updated_by       uuid  references auth.users(id)
created_at       timestamptz not null default now()
updated_at       timestamptz not null default now()
```

Indexes: `(approval_state)`, `(asset_type)`, `(project_id)`, GIN on `tags`, `(sort_order desc, created_at desc)`.

CHECK constraints on `asset_type` and `approval_state` allowed values.

## 2. RLS — `media_assets`

| Role | Visibility |
|---|---|
| admin | full CRUD |
| moderator | read all |
| employee / trainer | read approved + non-archived |
| preview | read `approval_state = 'approved' AND is_demo = true` only |
| anon | no access |

Write paths: `INSERT/UPDATE/DELETE` admin-only. `block_preview_writes` trigger attached for defence-in-depth.

`updated_by` set by trigger on update; `updated_at` via existing `update_updated_at_column`.

## 3. Storage bucket — `media-vault` (private)

- Private bucket.
- Path convention: `{asset_id}/{filename}`.
- `storage.objects` policies on bucket `media-vault`:
  - admin: full CRUD
  - moderator/employee/trainer: SELECT
  - preview: SELECT only when the row's `media_assets.is_demo=true AND approval_state='approved'` (enforced via `EXISTS` subquery against the path)
  - anon: no access
- Client reads via short-lived **signed URLs** generated on demand from the admin UI — never raw object URLs to preview.

## 4. HQ surface — `/hq/media`

New route + `HqNav` "Media" item.

Layout:
```text
HQ / 10 ─────────── Media Vault
Headline + serif intro line.
Filters bar (quiet, mono labels):
  [ Project ▾ ]  [ State ▾ ]  [ Type ▾ ]  [ search ]  [ + Upload ] (admin only)
Grid (3-4 cols desktop, 2 cols tablet, 1 col mobile):
  ┌──────────┐   each tile: thumbnail, title, state chip,
  │  image   │   project code, mono timestamp on hover.
  │          │   click → drawer with full metadata + edit (admin)
  └──────────┘
```

Components:
- `src/pages/AdminMedia.tsx` — page shell (Layout + HqNav + filters + grid).
- `src/components/hq/media/MediaGrid.tsx` — responsive grid + empty state.
- `src/components/hq/media/MediaTile.tsx` — single tile with signed-URL thumbnail.
- `src/components/hq/media/MediaUploadDialog.tsx` — admin upload (single file v1; drag-drop into modal, image only, ≤ 20 MB).
- `src/components/hq/media/MediaDetailDrawer.tsx` — view + edit metadata, archive, replace image (admin), read-only (preview/others).
- `src/lib/mediaVault.ts` — `listMedia()`, `uploadImage()`, `updateMedia()`, `archiveMedia()`, `getSignedThumb()`, with role-aware behaviour.

Empty state: serif italic line — *"The vault is empty. Upload approved work, and it lives here."*

## 5. Activity + Command Centre integration

- Add `media_assets` to `fetchHqActivity()` derived-events list (uses `updated_at`, mirrors current `staff_profiles` pattern). New kind `media_updated`. Preview-safe by RLS.
- Command Centre: add a 3-tile "Latest media" rail in `CommandOverview` below `ActivityWire`, only if `media_assets` returns rows. Signed thumbs, click → `/hq/media`. Skip render entirely on empty/error to stay low-risk.

## 6. Out of scope (v1)

- Public gallery wiring (`cms_gallery_items` stays untouched).
- Project detail picker.
- Bulk upload, drag-and-drop multi-file.
- Video / PDF upload handling (schema supports, UI does not).
- `hq_event_log` writer (use derived timestamps).
- Migration of `src/assets/**` JSON.
- Backfill from existing gallery.

## 7. Verification

- `tsgo --noEmit` clean.
- `vitest run` clean.
- New unit test: `mediaVault.test.ts` — group/sort/filter logic.
- Manual RLS checks via `supabase--read_query` impersonating admin/preview/anon paths (or by policy inspection).
- Browser smoke: admin upload → appears in grid → preview session sees only `approved + is_demo`.
- No console errors on `/hq/media`.

## 8. Technical detail (for reference)

- Migration order per project rules: CREATE TABLE → GRANT (authenticated + service_role; **no anon**) → ENABLE RLS → POLICIES → trigger attachments (`block_preview_writes`, `update_updated_at_column`, `set_updated_by`).
- `set_updated_by()` SECURITY DEFINER function sets `NEW.updated_by = auth.uid()` on update; `created_by` defaulted on insert from `auth.uid()`.
- Storage policies reference `media_assets` via `(storage.foldername(name))[1]::uuid = media_assets.id` for the preview EXISTS check.
- Signed URLs requested with 60 min TTL; cached in React state, refreshed on demand.
- All copy follows project memory: serif headings, mono overlines at 0.45em, low-opacity sans body, no prominent buttons (upload sits as a text link with hairline rule).

## 9. Build order

1. Migration: table + grants + RLS + triggers.
2. Storage bucket + `storage.objects` policies.
3. `src/lib/mediaVault.ts` + unit test.
4. `/hq/media` page + nav entry + grid + tile + empty state.
5. Upload dialog + detail drawer (admin gated).
6. Wire `media_updated` into `fetchHqActivity` + optional Latest Media rail.
7. Typecheck, tests, smoke check, report.
