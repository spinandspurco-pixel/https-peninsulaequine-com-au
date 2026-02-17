
-- Fix: set the view to SECURITY INVOKER (default safe behavior)
ALTER VIEW public.event_rsvp_counts SET (security_invoker = on);
