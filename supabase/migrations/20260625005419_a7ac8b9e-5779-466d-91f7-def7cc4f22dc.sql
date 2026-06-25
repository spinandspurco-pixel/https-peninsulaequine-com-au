
-- 1) Table
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL DEFAULT 'image' CHECK (asset_type IN ('image','video','pdf')),
  storage_path text NOT NULL,
  file_url text,
  mime_type text,
  width int,
  height int,
  file_size bigint,
  title text NOT NULL,
  description text,
  alt_text text,
  project_id uuid REFERENCES public.managed_projects(id) ON DELETE SET NULL,
  location text,
  credit text,
  usage_rights text,
  approval_state text NOT NULL DEFAULT 'draft' CHECK (approval_state IN ('draft','approved','archived')),
  is_demo boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Grants (no anon — table is auth-only)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;

-- 3) Indexes
CREATE INDEX media_assets_approval_state_idx ON public.media_assets (approval_state);
CREATE INDEX media_assets_asset_type_idx ON public.media_assets (asset_type);
CREATE INDEX media_assets_project_id_idx ON public.media_assets (project_id);
CREATE INDEX media_assets_tags_gin_idx ON public.media_assets USING gin (tags);
CREATE INDEX media_assets_order_idx ON public.media_assets (sort_order DESC, created_at DESC);

-- 4) RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage media assets"
  ON public.media_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Moderators read all media assets"
  ON public.media_assets FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'moderator'::public.app_role));

CREATE POLICY "Staff read non-archived media assets"
  ON public.media_assets FOR SELECT TO authenticated
  USING (
    (public.has_role(auth.uid(), 'employee'::public.app_role)
     OR public.has_role(auth.uid(), 'trainer'::public.app_role))
    AND approval_state <> 'archived'
  );

CREATE POLICY "Preview reads approved demo media assets"
  ON public.media_assets FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'preview'::public.app_role)
    AND approval_state = 'approved'
    AND is_demo = true
  );

-- 5) Triggers
CREATE OR REPLACE FUNCTION public.set_media_assets_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := COALESCE(NEW.created_by, auth.uid());
    NEW.updated_by := COALESCE(NEW.updated_by, auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_by := auth.uid();
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER media_assets_audit
  BEFORE INSERT OR UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_media_assets_audit();

CREATE TRIGGER media_assets_block_preview_writes
  BEFORE INSERT OR UPDATE OR DELETE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.block_preview_writes();
