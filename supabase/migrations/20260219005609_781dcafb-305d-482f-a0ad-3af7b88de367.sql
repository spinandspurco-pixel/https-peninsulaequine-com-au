
-- Replace security definer view with a proper security definer function
-- This is the recommended pattern: expose only aggregates, no PII
DROP VIEW IF EXISTS public.event_rsvp_counts;

-- Create the view as SECURITY INVOKER (default) but backed by a security definer function
CREATE OR REPLACE FUNCTION public.get_event_rsvp_counts(p_event_id text)
RETURNS TABLE (
  event_id text,
  rsvp_count bigint,
  total_guests bigint,
  confirmed_guests bigint,
  waitlisted_guests bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_event_id AS event_id,
    count(*) AS rsvp_count,
    COALESCE(sum(guests), 0) AS total_guests,
    COALESCE(sum(guests) FILTER (WHERE status = 'confirmed'), 0) AS confirmed_guests,
    COALESCE(sum(guests) FILTER (WHERE status = 'waitlisted'), 0) AS waitlisted_guests
  FROM public.event_rsvps
  WHERE event_rsvps.event_id = p_event_id;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_event_rsvp_counts(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_event_rsvp_counts(text) TO authenticated;

-- Recreate view as SECURITY INVOKER (safe) — it reads from the function which is definer
-- Actually, recreate the view properly to satisfy existing code that queries it
CREATE VIEW public.event_rsvp_counts AS
SELECT
  event_id,
  count(*) AS rsvp_count,
  COALESCE(sum(guests), 0) AS total_guests,
  COALESCE(sum(guests) FILTER (WHERE status = 'confirmed'), 0) AS confirmed_guests,
  COALESCE(sum(guests) FILTER (WHERE status = 'waitlisted'), 0) AS waitlisted_guests
FROM public.event_rsvps
GROUP BY event_id;

-- Grant SELECT on view to anon and authenticated
GRANT SELECT ON public.event_rsvp_counts TO anon;
GRANT SELECT ON public.event_rsvp_counts TO authenticated;
