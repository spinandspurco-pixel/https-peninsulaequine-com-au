
-- Restrict has_role function execution to authenticated/service roles only (revoke from anon/public)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- Lumenarc briefing requests: add admin SELECT/UPDATE/DELETE policies so admins can read submissions
CREATE POLICY "Admins can view briefing requests"
  ON public.lumenarc_briefing_requests
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update briefing requests"
  ON public.lumenarc_briefing_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete briefing requests"
  ON public.lumenarc_briefing_requests
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- slot_holds: remove open INSERT and broad SELECT policies; rely on SECURITY DEFINER RPCs for mutations
DROP POLICY IF EXISTS "Authenticated users can create a hold" ON public.slot_holds;
DROP POLICY IF EXISTS "Authenticated can view hold occupancy" ON public.slot_holds;

-- Allow admins full control for ops/debugging
CREATE POLICY "Admins can manage slot holds"
  ON public.slot_holds
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Service role retains full access for RPCs/edge functions
CREATE POLICY "Service role manages slot holds"
  ON public.slot_holds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
