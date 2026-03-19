
-- Add profit tracking columns to jobs table
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS estimated_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gross_profit numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS margin_percentage numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profit_status text NOT NULL DEFAULT 'on_track';

-- Create job_cost_entries table
CREATE TABLE public.job_cost_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'misc',
  description text,
  cost_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

ALTER TABLE public.job_cost_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage job cost entries"
  ON public.job_cost_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to recalculate job profit metrics
CREATE OR REPLACE FUNCTION public.recalc_job_profit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actual numeric;
  v_revenue numeric;
  v_gross numeric;
  v_margin numeric;
  v_status text;
  v_job_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_job_id := OLD.job_id;
  ELSE
    v_job_id := NEW.job_id;
  END IF;

  SELECT COALESCE(SUM(cost_amount), 0) INTO v_actual
    FROM public.job_cost_entries WHERE job_id = v_job_id;

  SELECT revenue INTO v_revenue FROM public.jobs WHERE id = v_job_id;

  v_gross := COALESCE(v_revenue, 0) - v_actual;
  v_margin := CASE WHEN COALESCE(v_revenue, 0) > 0
    THEN (v_gross / v_revenue) * 100
    ELSE 0 END;

  v_status := CASE
    WHEN v_margin >= 25 THEN 'on_track'
    WHEN v_margin >= 15 THEN 'watch'
    WHEN v_margin >= 5 THEN 'at_risk'
    ELSE 'critical'
  END;

  UPDATE public.jobs SET
    actual_cost = v_actual,
    gross_profit = v_gross,
    margin_percentage = v_margin,
    profit_status = v_status,
    updated_at = now()
  WHERE id = v_job_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_recalc_job_profit
  AFTER INSERT OR UPDATE OR DELETE ON public.job_cost_entries
  FOR EACH ROW EXECUTE FUNCTION public.recalc_job_profit();
