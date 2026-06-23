
-- ============================================================
-- 1) Restrict trainer reads on bookings to assigned bookings.
--    Currently any trainer can read every lesson booking's PII.
-- ============================================================
DROP POLICY IF EXISTS "Trainers can view lesson bookings" ON public.bookings;

CREATE POLICY "Trainers can view assigned lesson bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'trainer'::app_role)
  AND assigned_to = auth.uid()
  AND service_type = ANY (ARRAY['riding-lessons'::text, 'lesson'::text, 'clinic'::text, 'clinics-events'::text])
);

-- ============================================================
-- 2) Split managed_projects.internal_notes into an admin-only
--    sidecar table so employees/trainers can never read it.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.managed_project_internal_notes (
  project_id uuid PRIMARY KEY REFERENCES public.managed_projects(id) ON DELETE CASCADE,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.managed_project_internal_notes TO authenticated;
GRANT ALL ON public.managed_project_internal_notes TO service_role;

ALTER TABLE public.managed_project_internal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage project internal notes"
ON public.managed_project_internal_notes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_managed_project_internal_notes_updated_at
BEFORE UPDATE ON public.managed_project_internal_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing notes (preserves all current data).
INSERT INTO public.managed_project_internal_notes (project_id, notes)
SELECT id, internal_notes
FROM public.managed_projects
WHERE internal_notes IS NOT NULL AND length(trim(internal_notes)) > 0
ON CONFLICT (project_id) DO NOTHING;

-- Remove the now-relocated column from the staff-readable table.
ALTER TABLE public.managed_projects DROP COLUMN internal_notes;
