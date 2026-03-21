
-- GroundLock project setup submissions from approved builders
CREATE TABLE public.groundlock_project_setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_location TEXT NOT NULL,
  ground_conditions TEXT NOT NULL,
  primary_use TEXT NOT NULL DEFAULT 'arena',
  traffic_level TEXT NOT NULL DEFAULT 'medium',
  estimated_area TEXT,
  notes TEXT,
  attachment_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.groundlock_project_setups ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins can manage groundlock setups"
  ON public.groundlock_project_setups
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can submit their own
CREATE POLICY "Users can create own groundlock setups"
  ON public.groundlock_project_setups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view own groundlock setups"
  ON public.groundlock_project_setups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_groundlock_project_setups_updated_at
  BEFORE UPDATE ON public.groundlock_project_setups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for project setup attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('groundlock-attachments', 'groundlock-attachments', false);

-- Storage policies
CREATE POLICY "Authenticated users can upload groundlock attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'groundlock-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own groundlock attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'groundlock-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all groundlock attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'groundlock-attachments' AND public.has_role(auth.uid(), 'admin'));
