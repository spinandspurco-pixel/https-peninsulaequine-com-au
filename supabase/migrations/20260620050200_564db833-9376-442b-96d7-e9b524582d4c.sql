CREATE TABLE IF NOT EXISTS public.managed_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  location text,
  build_type text,
  status text NOT NULL DEFAULT 'in_progress',
  priority text NOT NULL DEFAULT 'standard',
  scope text,
  internal_notes text,
  client_summary text,
  next_action text,
  last_update text,
  hero_image text,
  is_demo boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.managed_projects TO authenticated;
GRANT ALL ON public.managed_projects TO service_role;

ALTER TABLE public.managed_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage projects"
  ON public.managed_projects
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Preview role reads demo projects"
  ON public.managed_projects
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'preview') AND is_demo = true);

CREATE POLICY "Employees and trainers read projects"
  ON public.managed_projects
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'employee') OR public.has_role(auth.uid(), 'trainer'));

CREATE TRIGGER update_managed_projects_updated_at
  BEFORE UPDATE ON public.managed_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the curated demo dataset (three case-study chapters)
INSERT INTO public.managed_projects (code, name, location, build_type, status, priority, scope, client_summary, next_action, last_update, is_demo, sort_order)
VALUES
  ('PE-MR-014', 'Main Ridge Pavilion', 'Main Ridge, VIC', 'Custom Pavilion & Parrilla', 'completed', 'flagship',
   'Pavilion, brick parrilla, custom hardwood table, integrated lighting.',
   'A working ground-up pavilion delivered with parrilla, joinery and lighting integrated as one resolved object.',
   'Archive into Selected Works portfolio.',
   'Chapter 01 published', true, 1),
  ('PE-AB-019', 'Aberdeen Estate', 'Mornington Peninsula, VIC', 'Full Equine Facility', 'in_progress', 'flagship',
   'Stables, arena, round pen, viewing lounge, drainage, fencing.',
   'A complete working estate — barn, arena and lounge resolved as a single coherent property.',
   'Confirm tack-room joinery handover.',
   'Lounge interior approved', true, 2),
  ('PE-CA-026', 'Covered Arena & Stables', 'Mornington Peninsula, VIC', 'Covered Competition Arena', 'in_progress', 'live',
   'Covered competition arena, drainage, truck access, stabling.',
   'A weather-resilient covered facility built on honest ground preparation and resolved drainage.',
   'Schedule kickboard install.',
   'Night-work frame complete', true, 3)
ON CONFLICT (code) DO NOTHING;