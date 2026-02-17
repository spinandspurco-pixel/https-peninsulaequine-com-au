

# Secure RSVP Access Flow: Auth-Gated RSVP + Public Aggregated Counts

## Overview

Currently, the `event_rsvps_public` view exposes individual attendee **names** and guest counts to everyone. The RSVP form also allows anonymous submissions (no login required). This plan:

1. Replaces the public view with an **aggregated counts-only** view (no names)
2. Requires **authentication** to submit an RSVP
3. Keeps individual attendee details visible only to **admins**

## What Changes

### 1. Database: Replace public view with aggregated counts

Drop the current `event_rsvps_public` view (which exposes names) and create a new `event_rsvp_counts` view that only exposes per-event totals:

```text
event_rsvp_counts
-----------------
event_id  TEXT
total_guests  BIGINT
confirmed_guests  BIGINT
waitlisted_guests  BIGINT
rsvp_count  BIGINT
```

Grant `SELECT` on this view to `anon` and `authenticated`.

### 2. Database: Allow authenticated users to view their own RSVPs

Add an RLS policy on `event_rsvps` so authenticated users can see their **own** RSVPs (matched by `user_id`). This requires adding a `user_id` column to `event_rsvps` to link RSVPs to auth users.

### 3. Update EventGuestList component

- Query `event_rsvp_counts` instead of `event_rsvps_public` for the capacity bar (public-facing)
- Remove the attendee name list from the public display
- Keep the capacity progress bar and "X spots left" badge

### 4. Update EventRSVPForm to require authentication

- Check for an active session before showing the form
- If not logged in, show a prompt to sign in/sign up with a link to the login page
- On submit, include `user_id` from the session so the RLS policy works
- Remove the email field from the form (pull it from the auth session instead)

### 5. Update Realtime subscription

The realtime subscription in `EventGuestList` currently listens to `event_rsvps` inserts. Since the public no longer gets individual rows, switch to re-fetching the aggregate count view on channel events.

---

## Technical Details

### Migration SQL

```sql
-- 1. Add user_id column to event_rsvps
ALTER TABLE public.event_rsvps
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Drop old public view
DROP VIEW IF EXISTS public.event_rsvps_public;

-- 3. Create aggregated counts view
CREATE VIEW public.event_rsvp_counts AS
  SELECT
    event_id,
    COUNT(*)::bigint AS rsvp_count,
    COALESCE(SUM(guests), 0)::bigint AS total_guests,
    COALESCE(SUM(guests) FILTER (WHERE status = 'confirmed'), 0)::bigint AS confirmed_guests,
    COALESCE(SUM(guests) FILTER (WHERE status = 'waitlisted'), 0)::bigint AS waitlisted_guests
  FROM public.event_rsvps
  GROUP BY event_id;

GRANT SELECT ON public.event_rsvp_counts TO anon, authenticated;

-- 4. Add RLS policy for authenticated users to view own RSVPs
CREATE POLICY "Users can view own RSVPs"
  ON public.event_rsvps FOR SELECT
  USING (user_id = auth.uid());

-- 5. Restrict INSERT to authenticated users only
DROP POLICY IF EXISTS "Anyone can submit RSVP" ON public.event_rsvps;

CREATE POLICY "Authenticated users can submit RSVP"
  ON public.event_rsvps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

### EventGuestList.tsx changes

- Replace query from `event_rsvps_public` to `event_rsvp_counts`
- Remove the attendee names list entirely
- Keep the capacity bar + badge showing "X / Y spots filled"
- Realtime channel triggers a re-fetch of counts (not individual row tracking)

### EventRSVPForm.tsx changes

- Import and use `useAuth` hook to get current user
- If `user` is null, render a "Sign in to RSVP" prompt with a link to `/login?redirect=/events`
- Remove the email input field; use `user.email` from session
- Include `user_id: user.id` in the insert payload
- Keep all other fields (name, phone, guests, notes)

### Events.tsx + TrainerClinicRSVP.tsx

- No structural changes needed; they consume EventGuestList and EventRSVPForm which handle the auth logic internally

### Files Summary

| File | Action |
|------|--------|
| New migration SQL | Create -- add user_id, drop old view, create aggregate view, update RLS |
| `src/components/events/EventGuestList.tsx` | Edit -- query aggregate view, remove attendee names |
| `src/components/events/EventRSVPForm.tsx` | Edit -- require auth, use session email, include user_id |

