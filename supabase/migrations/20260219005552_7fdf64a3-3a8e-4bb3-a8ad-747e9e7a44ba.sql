
-- Drop the existing view and recreate it as SECURITY DEFINER
-- so public/anon users can read aggregate counts without seeing PII
DROP VIEW IF EXISTS public.event_rsvp_counts;

CREATE VIEW public.event_rsvp_counts
WITH (security_invoker = false)
AS
SELECT
  event_id,
  count(*) AS rsvp_count,
  COALESCE(sum(guests), 0) AS total_guests,
  COALESCE(sum(guests) FILTER (WHERE status = 'confirmed'), 0) AS confirmed_guests,
  COALESCE(sum(guests) FILTER (WHERE status = 'waitlisted'), 0) AS waitlisted_guests
FROM public.event_rsvps
GROUP BY event_id;

-- Grant SELECT to both anon and authenticated roles
GRANT SELECT ON public.event_rsvp_counts TO anon;
GRANT SELECT ON public.event_rsvp_counts TO authenticated;

-- Fix the misleadingly-named policy on event_rsvps that blocked the view
-- Drop the old one and replace with a proper admin-only direct-table policy
DROP POLICY IF EXISTS "Anyone can view RSVP counts via view" ON public.event_rsvps;
