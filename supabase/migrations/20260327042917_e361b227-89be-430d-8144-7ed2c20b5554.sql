
-- Client portal projects (curated view of jobs/quotes for clients)
CREATE TABLE public.client_portal_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  build_stage TEXT NOT NULL DEFAULT 'planning',
  stage_label TEXT,
  property_layout_notes TEXT,
  groundlock_included BOOLEAN DEFAULT false,
  system_notes TEXT,
  contact_note TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Progress updates for portal projects
CREATE TABLE public.client_portal_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_portal_projects(id) ON DELETE CASCADE,
  image_url TEXT,
  note TEXT,
  update_type TEXT NOT NULL DEFAULT 'progress',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Property zones for land overview
CREATE TABLE public.client_portal_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.client_portal_projects(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL,
  zone_type TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_portal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_zones ENABLE ROW LEVEL SECURITY;

-- Admins can manage everything
CREATE POLICY "Admins can manage portal projects" ON public.client_portal_projects
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage portal updates" ON public.client_portal_updates
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage portal zones" ON public.client_portal_zones
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Clients can view their own projects (matched by email from auth.users)
CREATE POLICY "Clients can view own portal projects" ON public.client_portal_projects
  FOR SELECT TO authenticated
  USING (lower(client_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())));

CREATE POLICY "Clients can view own portal updates" ON public.client_portal_updates
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.client_portal_projects p
    WHERE p.id = client_portal_updates.project_id
    AND lower(p.client_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  ));

CREATE POLICY "Clients can view own portal zones" ON public.client_portal_zones
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.client_portal_projects p
    WHERE p.id = client_portal_zones.project_id
    AND lower(p.client_email) = lower((SELECT email FROM auth.users WHERE id = auth.uid()))
  ));

-- Updated_at trigger
CREATE TRIGGER update_client_portal_projects_updated_at
  BEFORE UPDATE ON public.client_portal_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
