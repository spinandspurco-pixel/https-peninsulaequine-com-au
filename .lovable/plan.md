## Add sorting and status filtering to verification history table

Extend the verification history block in `src/components/admin/ResendDomainPanel.tsx` with lightweight controls that sit in the section header next to "Clear history".

### Controls
- **Status filter** — minimal `<select>` styled to match the panel's overline/mono aesthetic (transparent bg, border-border/30, uppercase tracking). Options derived from currently present statuses plus a permanent `All` entry: `All · verified · pending · failed · error · not_configured · unknown`. Defaults to `All`.
- **Sort toggle** — small text button cycling `Newest ↓` ↔ `Oldest ↑`. Applies to the `at` timestamp. Defaults to `Newest ↓` (current behaviour).
- **Source filter (bonus, same row)** — `All sources · status refresh · manual verify · auto-poll`. `auto-poll #N` entries match the `auto-poll` filter via `startsWith`. Defaults to `All sources`.

### Behaviour
- Filtering/sorting is derived via `useMemo` from the existing `history` state — no changes to how entries are appended.
- Empty filtered result shows the existing muted "No checks match this filter." row (reworded from the current empty state, which still applies when `history.length === 0`).
- Row count indicator beside the heading: `showing X of Y` in muted mono when a filter narrows results.
- "Clear history" stays on the right; controls sit between heading and clear button, wrapping on narrow widths.

### Files
- `src/components/admin/ResendDomainPanel.tsx` — add `statusFilter`, `sourceFilter`, `sortDir` state, a `useMemo` for the derived list, and the header controls. No edge-function or schema changes.
