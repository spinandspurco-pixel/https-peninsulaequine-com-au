
-- Staff documents table for SWMS, payment slips, site inspections, event checklists
CREATE TABLE public.staff_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL, -- 'swms' | 'payment_slip' | 'site_inspection' | 'event_checklist'
  title TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'submitted' | 'approved' | 'rejected'
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_documents ENABLE ROW LEVEL SECURITY;

-- Staff can view their own documents
CREATE POLICY "Staff can view own documents"
ON public.staff_documents
FOR SELECT
USING (user_id = auth.uid());

-- Staff can create documents
CREATE POLICY "Staff can create documents"
ON public.staff_documents
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'employee') OR has_role(auth.uid(), 'trainer'))
);

-- Staff can update their own draft documents
CREATE POLICY "Staff can update own drafts"
ON public.staff_documents
FOR UPDATE
USING (user_id = auth.uid() AND status = 'draft')
WITH CHECK (user_id = auth.uid());

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
ON public.staff_documents
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update any document (for review/approval)
CREATE POLICY "Admins can update all documents"
ON public.staff_documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can delete documents
CREATE POLICY "Admins can delete documents"
ON public.staff_documents
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_staff_documents_updated_at
BEFORE UPDATE ON public.staff_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_staff_documents_user ON public.staff_documents(user_id);
CREATE INDEX idx_staff_documents_type ON public.staff_documents(document_type);
CREATE INDEX idx_staff_documents_status ON public.staff_documents(status);
