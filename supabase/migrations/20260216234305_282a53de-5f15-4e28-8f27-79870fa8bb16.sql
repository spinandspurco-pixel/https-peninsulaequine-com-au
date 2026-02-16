
-- Trainers can view lesson/riding bookings
CREATE POLICY "Trainers can view lesson bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'trainer'::app_role)
  AND service_type IN ('riding-lessons', 'lesson', 'clinic', 'clinics-events')
);

-- Trainers can view lesson-related inquiries
CREATE POLICY "Trainers can view lesson inquiries"
ON public.inquiries
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'trainer'::app_role)
  AND (services && ARRAY['riding-lessons', 'clinics-events'])
);

-- Trainers can view their assigned tasks
CREATE POLICY "Trainers can view own tasks"
ON public.employee_tasks
FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid() AND has_role(auth.uid(), 'trainer'::app_role)
);

-- Trainers can update their assigned tasks
CREATE POLICY "Trainers can update own tasks"
ON public.employee_tasks
FOR UPDATE
TO authenticated
USING (assigned_to = auth.uid() AND has_role(auth.uid(), 'trainer'::app_role))
WITH CHECK (assigned_to = auth.uid() AND has_role(auth.uid(), 'trainer'::app_role));

-- Trainers can view announcements
CREATE POLICY "Trainers can view active announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (
  active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND has_role(auth.uid(), 'trainer'::app_role)
);

-- Trainers can view own role
CREATE POLICY "Trainers can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND has_role(auth.uid(), 'trainer'::app_role));
