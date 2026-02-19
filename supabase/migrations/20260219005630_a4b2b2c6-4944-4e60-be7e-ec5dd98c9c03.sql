
-- Drop the view entirely and use the security definer function approach instead
-- The view is causing the security definer linter warning
DROP VIEW IF EXISTS public.event_rsvp_counts;

-- The function get_event_rsvp_counts already exists and is safe
-- Update it to handle the case where no rows exist
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

GRANT EXECUTE ON FUNCTION public.get_event_rsvp_counts(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_event_rsvp_counts(text) TO authenticated;
