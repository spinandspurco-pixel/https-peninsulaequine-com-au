
-- Table for storing generated GroundLock proposal drafts
CREATE TABLE public.groundlock_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  proposal_ref TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  property_name TEXT,
  location TEXT,
  project_type TEXT,
  project_size TEXT,
  proposal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overview TEXT,
  system_notes TEXT,
  layout_notes TEXT,
  scope_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  investment_total TEXT DEFAULT '[INSERT PRICE]',
  investment_note TEXT,
  attachment_urls TEXT[] DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.groundlock_proposals ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage groundlock proposals"
  ON public.groundlock_proposals
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-increment proposal ref
CREATE OR REPLACE FUNCTION public.generate_proposal_ref()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  seq_num integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(proposal_ref FROM 'GL-(\d+)') AS integer)), 0) + 1
  INTO seq_num
  FROM public.groundlock_proposals;
  
  NEW.proposal_ref := 'GL-' || LPAD(seq_num::text, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_proposal_ref
  BEFORE INSERT ON public.groundlock_proposals
  FOR EACH ROW
  WHEN (NEW.proposal_ref IS NULL OR NEW.proposal_ref = '')
  EXECUTE FUNCTION public.generate_proposal_ref();

-- Updated_at trigger
CREATE TRIGGER update_groundlock_proposals_updated_at
  BEFORE UPDATE ON public.groundlock_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
