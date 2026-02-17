
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
