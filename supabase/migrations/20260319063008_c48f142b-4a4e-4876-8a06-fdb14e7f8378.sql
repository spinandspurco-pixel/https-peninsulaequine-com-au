
-- Add follow-up tracking columns to inquiries
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS follow_up_stage text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS next_follow_up_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS follow_up_status text NOT NULL DEFAULT 'pending';

-- Create follow_up_drafts table
CREATE TABLE public.follow_up_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL DEFAULT 'lead',
  entity_id uuid NOT NULL,
  stage text NOT NULL DEFAULT '1',
  draft_message text NOT NULL,
  subject_line text,
  client_name text NOT NULL,
  client_email text NOT NULL,
  project_ref text,
  deal_value numeric,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamp with time zone,
  sent_at timestamp with time zone,
  snoozed_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.follow_up_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage follow-up drafts"
  ON public.follow_up_drafts
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_follow_up_drafts_updated_at
  BEFORE UPDATE ON public.follow_up_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
