
-- 1. Project aliases
ALTER TABLE public.managed_projects
  ADD COLUMN IF NOT EXISTS aliases text[] NOT NULL DEFAULT '{}'::text[];

-- 2. Knowledge graph edges
CREATE TABLE IF NOT EXISTS public.hq_graph_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_type text NOT NULL,
  from_id uuid NOT NULL,
  to_type text NOT NULL,
  to_id uuid NOT NULL,
  relation text NOT NULL DEFAULT 'belongs_to',
  status text NOT NULL DEFAULT 'suggested',
  matched_rules text[] NOT NULL DEFAULT '{}'::text[],
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hq_graph_edges_status_check CHECK (status IN ('system_linked','suggested','manual','verified','dismissed')),
  CONSTRAINT hq_graph_edges_no_self_loop CHECK (NOT (from_type = to_type AND from_id = to_id))
);

CREATE UNIQUE INDEX IF NOT EXISTS hq_graph_edges_unique_edge
  ON public.hq_graph_edges (from_type, from_id, to_type, to_id, relation);
CREATE INDEX IF NOT EXISTS hq_graph_edges_from_idx
  ON public.hq_graph_edges (from_type, from_id);
CREATE INDEX IF NOT EXISTS hq_graph_edges_to_idx
  ON public.hq_graph_edges (to_type, to_id);
CREATE INDEX IF NOT EXISTS hq_graph_edges_status_idx
  ON public.hq_graph_edges (status);

-- 3. GRANTs
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hq_graph_edges TO authenticated;
GRANT ALL ON public.hq_graph_edges TO service_role;

-- 4. RLS
ALTER TABLE public.hq_graph_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read graph edges"
  ON public.hq_graph_edges
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'moderator'::app_role)
    OR public.has_role(auth.uid(), 'employee'::app_role)
    OR public.has_role(auth.uid(), 'trainer'::app_role)
    OR public.has_role(auth.uid(), 'preview'::app_role)
  );

CREATE POLICY "Admins and moderators manage graph edges"
  ON public.hq_graph_edges
  FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'moderator'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'moderator'::app_role)
  );

CREATE POLICY "Staff create graph edges"
  ON public.hq_graph_edges
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'employee'::app_role)
    OR public.has_role(auth.uid(), 'trainer'::app_role)
  );

-- 5. Block preview writes
CREATE TRIGGER hq_graph_edges_block_preview_writes
  BEFORE INSERT OR UPDATE OR DELETE ON public.hq_graph_edges
  FOR EACH ROW EXECUTE FUNCTION public.block_preview_writes();

-- 6. updated_at trigger
CREATE TRIGGER hq_graph_edges_updated_at
  BEFORE UPDATE ON public.hq_graph_edges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Backfill: existing media_assets.project_id → system_linked edges
INSERT INTO public.hq_graph_edges (from_type, from_id, to_type, to_id, relation, status, matched_rules)
SELECT 'project', m.project_id, 'media', m.id, 'belongs_to', 'system_linked', ARRAY['legacy_column']
FROM public.media_assets m
WHERE m.project_id IS NOT NULL
ON CONFLICT (from_type, from_id, to_type, to_id, relation) DO NOTHING;
