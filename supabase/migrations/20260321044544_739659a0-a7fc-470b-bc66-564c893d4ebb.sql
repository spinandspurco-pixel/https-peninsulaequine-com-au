
ALTER TABLE public.client_followups ADD COLUMN IF NOT EXISTS assigned_to text DEFAULT NULL;
ALTER TABLE public.client_followups ADD COLUMN IF NOT EXISTS project_name text DEFAULT NULL;
ALTER TABLE public.client_followups ADD COLUMN IF NOT EXISTS deal_stage text DEFAULT NULL;
ALTER TABLE public.client_followups ADD COLUMN IF NOT EXISTS quote_status text DEFAULT NULL;
ALTER TABLE public.client_followups ADD COLUMN IF NOT EXISTS deal_value numeric DEFAULT NULL;
