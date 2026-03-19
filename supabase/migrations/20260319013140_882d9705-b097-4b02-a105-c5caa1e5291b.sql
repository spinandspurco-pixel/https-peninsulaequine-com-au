
-- 1. Jobs table
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  job_name text NOT NULL,
  client_name text,
  location text,
  status text NOT NULL DEFAULT 'active',
  revenue numeric NOT NULL DEFAULT 0,
  materials_cost numeric NOT NULL DEFAULT 0,
  labour_cost numeric NOT NULL DEFAULT 0,
  other_costs numeric NOT NULL DEFAULT 0,
  notes text
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage jobs" ON public.jobs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Cash flow table
CREATE TABLE public.cashflow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  deposit_received numeric NOT NULL DEFAULT 0,
  mid_payment numeric NOT NULL DEFAULT 0,
  final_payment numeric NOT NULL DEFAULT 0
);

ALTER TABLE public.cashflow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cashflow" ON public.cashflow
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cashflow_updated_at
  BEFORE UPDATE ON public.cashflow
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Pricing calculations table
CREATE TABLE public.pricing_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  calculation_name text,
  materials_cost numeric NOT NULL DEFAULT 0,
  labour_cost numeric NOT NULL DEFAULT 0,
  other_costs numeric NOT NULL DEFAULT 0,
  complexity_multiplier numeric NOT NULL DEFAULT 1.0,
  target_margin numeric NOT NULL DEFAULT 0.30,
  notes text
);

ALTER TABLE public.pricing_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pricing_calculations" ON public.pricing_calculations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Overheads table
CREATE TABLE public.overheads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  month text NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  notes text
);

ALTER TABLE public.overheads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage overheads" ON public.overheads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
