-- Allow employees and trainers to read active jobs for the job switcher dropdown
CREATE POLICY "Employees can view active jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (
  status = 'active' AND (
    has_role(auth.uid(), 'employee'::app_role) OR
    has_role(auth.uid(), 'trainer'::app_role)
  )
);