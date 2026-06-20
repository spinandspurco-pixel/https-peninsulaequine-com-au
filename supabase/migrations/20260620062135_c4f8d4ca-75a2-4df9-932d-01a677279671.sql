DROP POLICY IF EXISTS "Admins can view RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Admins can delete RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can view own RSVPs" ON public.event_rsvps;

CREATE POLICY "Admins can view RSVPs"
  ON public.event_rsvps
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete RSVPs"
  ON public.event_rsvps
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own RSVPs"
  ON public.event_rsvps
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());