

# Protect lesson_bookings: Restrict Access and Remove Public INSERT

## Problem

The `lesson_bookings` table currently has an INSERT policy (`"Service role can insert lesson bookings"`) with `WITH CHECK (true)`, meaning any anonymous user could insert rows directly. Only edge functions (using the service role client) actually insert into this table, so the public INSERT policy is unnecessary and a security risk.

Additionally, there is no explicit restriction ensuring only authenticated users can read bookings -- currently only admins can SELECT, which is fine, but the open INSERT policy needs to go.

## Changes

### Database migration (single SQL migration)

1. **Drop the public INSERT policy** (`"Service role can insert lesson bookings"`) -- edge functions use the service role key, which bypasses RLS entirely, so they are unaffected.
2. No new SELECT policy is needed -- the existing admin-only SELECT policy is correct since no client-side code queries this table; only admins view bookings through the admin dashboard.

### No code changes required

Both `create-lesson-checkout` and `stripe-lesson-webhook` edge functions use the Supabase service role client, which bypasses RLS. Removing the public INSERT policy will not affect them.

---

## Technical Details

### Migration SQL

```sql
-- Remove the overly permissive public INSERT policy
DROP POLICY IF EXISTS "Service role can insert lesson bookings" ON public.lesson_bookings;
```

That single statement is all that is needed. The service role used by edge functions bypasses RLS, so no replacement INSERT policy is required.

### Files

| File | Action |
|------|--------|
| New migration SQL | Create -- drop the public INSERT policy |

No component or edge function files need changes.
