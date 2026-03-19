
CREATE TABLE public.website_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'design',
  title text NOT NULL,
  issue text NOT NULL,
  why_it_matters text,
  suggested_fix text,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'suggested',
  reviewer_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.website_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage website suggestions"
  ON public.website_suggestions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_website_suggestions_updated_at
  BEFORE UPDATE ON public.website_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
