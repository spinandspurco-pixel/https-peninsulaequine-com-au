
-- Quotes table
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text NOT NULL,
  inquiry_id uuid REFERENCES public.inquiries(id) ON DELETE SET NULL,
  site_assessment_id uuid REFERENCES public.site_assessments(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_email text,
  project_type text NOT NULL DEFAULT '',
  location text,
  scope_summary text,
  exclusions text,
  internal_notes text,
  subtotal numeric NOT NULL DEFAULT 0,
  gst numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  expiry_date date,
  created_by uuid,
  approved_by uuid,
  sent_at timestamp with time zone,
  viewed_at timestamp with time zone,
  accepted_at timestamp with time zone,
  declined_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage quotes" ON public.quotes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Quote line items
CREATE TABLE public.quote_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'each',
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage quote line items" ON public.quote_line_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Pricing templates
CREATE TABLE public.pricing_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pricing templates" ON public.pricing_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Quote follow-up schedule
CREATE TABLE public.quote_follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  action_type text NOT NULL DEFAULT 'follow_up',
  status text NOT NULL DEFAULT 'pending',
  notes text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage quote follow-ups" ON public.quote_follow_ups
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Auto-compute line totals
CREATE OR REPLACE FUNCTION public.compute_line_total()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  NEW.line_total := COALESCE(NEW.quantity, 1) * COALESCE(NEW.unit_price, 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_compute_line_total
  BEFORE INSERT OR UPDATE OF quantity, unit_price ON public.quote_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_line_total();

-- Auto-generate quote numbers
CREATE OR REPLACE FUNCTION public.generate_quote_number()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
DECLARE
  seq_num integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 'PE-Q-(\d+)') AS integer)), 0) + 1
  INTO seq_num
  FROM public.quotes;
  
  NEW.quote_number := 'PE-Q-' || LPAD(seq_num::text, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_quote_number
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  WHEN (NEW.quote_number = '' OR NEW.quote_number IS NULL)
  EXECUTE FUNCTION public.generate_quote_number();

-- Create follow-ups when quote is sent
CREATE OR REPLACE FUNCTION public.create_quote_follow_ups()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'sent' AND (OLD IS NULL OR OLD.status != 'sent') THEN
    NEW.sent_at := COALESCE(NEW.sent_at, now());
    
    INSERT INTO public.quote_follow_ups (quote_id, due_date, action_type) VALUES
      (NEW.id, CURRENT_DATE + 2, 'check_viewed'),
      (NEW.id, CURRENT_DATE + 5, 'follow_up'),
      (NEW.id, CURRENT_DATE + 10, 'chase_up');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_quote_follow_ups
  BEFORE UPDATE OF status ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_quote_follow_ups();

-- Updated_at trigger for quotes
CREATE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_pricing_templates_updated_at
  BEFORE UPDATE ON public.pricing_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
