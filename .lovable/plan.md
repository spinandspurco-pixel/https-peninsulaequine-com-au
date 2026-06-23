## Add verification attempt history table

Append a scrollable history log to `src/components/admin/ResendDomainPanel.tsx`, rendered directly beneath the amber poll-status row.

### Behaviour
- Every verify call (manual "Re-verify with Resend" and silent auto-poll ticks) appends one entry.
- Initial "Refresh status" calls also append an entry, tagged as `status` vs `verify` so the source is clear.
- Newest entry on top; cap in-memory at 50 rows to avoid runaway growth.
- History lives in component state only (no DB persistence) — resets on page reload, matching the existing panel's session-scoped model.

### Row shape
Each entry records:
- `timestamp` — ISO time, displayed as local `HH:mm:ss`
- `source` — `auto-poll #N` / `manual verify` / `status refresh`
- `status` — `verified` / `pending` / `failed` / `error` with the same colour treatment as the main status badge
- `message` — Resend error string, failed-record summary (e.g. "DKIM pending, SPF ok"), or "—" on clean success

### UI
- Section heading: overline "Verification history" matching the panel's existing typography tokens.
- Uses the existing `@/components/ui/table` primitives (Table/THead/TRow/TCell) for consistency.
- Columns: Time · Source · Status · Detail.
- Wrapper `max-h-64 overflow-y-auto` so long histories scroll without stretching the page.
- Empty state: single muted row "No checks yet — run a verify or start auto-poll."
- Small ghost "Clear history" text-link in the section header.

### Files
- `src/components/admin/ResendDomainPanel.tsx` — add `history` state + `appendHistory()` helper, call it from `triggerStatus`, `triggerVerify`, and the auto-poll tick handler, then render the table below the poll-status row.

No edge-function, schema, or routing changes.
