-- Narrow staff write access for slot_holds so /schedule (employee/trainer/admin)
-- can acquire, refresh, and release holds. Anon access remains blocked.
-- Existing "Admins can manage slot holds" (ALL) and "Service role manages slot holds" stay in place.

CREATE POLICY "Staff can insert slot holds"
ON public.slot_holds
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'employee'::app_role)
  OR public.has_role(auth.uid(), 'trainer'::app_role)
);

CREATE POLICY "Staff can update slot holds"
ON public.slot_holds
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'employee'::app_role)
  OR public.has_role(auth.uid(), 'trainer'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'employee'::app_role)
  OR public.has_role(auth.uid(), 'trainer'::app_role)
);

CREATE POLICY "Staff can delete slot holds"
ON public.slot_holds
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'employee'::app_role)
  OR public.has_role(auth.uid(), 'trainer'::app_role)
);

CREATE POLICY "Staff can read slot holds"
ON public.slot_holds
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'employee'::app_role)
  OR public.has_role(auth.uid(), 'trainer'::app_role)
);