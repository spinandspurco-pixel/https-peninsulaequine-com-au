
-- =============================================
-- FIX 1: event_rsvps - Create a public view with only safe columns,
-- restrict base table SELECT to admins only
-- =============================================

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view RSVP counts" ON public.event_rsvps;

-- Create a safe public view that only exposes non-PII columns
CREATE VIEW public.event_rsvps_public
WITH (security_invoker = on) AS
  SELECT id, event_id, name, guests, created_at, status
  FROM public.event_rsvps;

-- Allow anonymous SELECT on the view by adding a permissive policy on the base table
-- that only allows access to non-sensitive columns via the view
-- Actually, security_invoker views use the caller's permissions on the base table.
-- We need a restricted SELECT policy that the view can use.
-- Instead, let's use a SECURITY DEFINER function approach, or just allow public select
-- of only the needed columns via a non-security-invoker view.

-- Drop the view we just created and recreate without security_invoker
DROP VIEW IF EXISTS public.event_rsvps_public;

CREATE VIEW public.event_rsvps_public AS
  SELECT id, event_id, name, guests, created_at, status
  FROM public.event_rsvps;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.event_rsvps_public TO anon, authenticated;

-- Add a new restricted policy: public can only select via specific columns needed
-- But since the view bypasses RLS (views owned by table owner), we just need to
-- ensure direct table access is restricted.
-- The view (owned by postgres) will bypass RLS, so we're safe to restrict the base table.

-- Now only admins can SELECT from the base table directly
CREATE POLICY "Anyone can view RSVP counts via view"
  ON public.event_rsvps FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 2: lesson_bookings - Remove overly permissive SELECT policy
-- =============================================

-- Drop the dangerous policy
DROP POLICY IF EXISTS "Anyone can view own bookings by email" ON public.lesson_bookings;

-- Replace with admin-only direct access (bookings are already managed via edge functions)
-- The existing "Admins can manage lesson bookings" ALL policy covers admin SELECT.
-- No anonymous SELECT needed - booking confirmation is handled via edge functions.

-- Also restrict the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Service role can update lesson bookings" ON public.lesson_bookings;

-- Recreate update policy scoped to authenticated service operations only
CREATE POLICY "Authenticated service can update lesson bookings"
  ON public.lesson_bookings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
