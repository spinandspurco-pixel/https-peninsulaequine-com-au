
-- Assessment availability slots managed by admin
CREATE TABLE public.assessment_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage availability"
  ON public.assessment_availability FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view available slots"
  ON public.assessment_availability FOR SELECT TO public
  USING (is_blocked = false AND slot_date >= CURRENT_DATE);

-- Site assessment bookings
CREATE TABLE public.site_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  location TEXT NOT NULL,
  project_type TEXT NOT NULL,
  project_notes TEXT,
  slot_id UUID REFERENCES public.assessment_availability(id) ON DELETE SET NULL,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site assessments"
  ON public.site_assessments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create a site assessment booking"
  ON public.site_assessments FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own assessment by email"
  ON public.site_assessments FOR SELECT TO public
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_assessment_availability_updated_at
  BEFORE UPDATE ON public.assessment_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_assessments_updated_at
  BEFORE UPDATE ON public.site_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
