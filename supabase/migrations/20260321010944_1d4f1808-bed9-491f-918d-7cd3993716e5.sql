
-- Post-completion client follow-up reminders
CREATE TABLE public.client_followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  followup_type TEXT NOT NULL DEFAULT 'two_week',
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage client followups"
ON public.client_followups FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_client_followups_updated_at
BEFORE UPDATE ON public.client_followups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
