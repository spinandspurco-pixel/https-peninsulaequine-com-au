
-- Helper: resolve the media_assets row from a storage object's path.
-- Path convention: '{asset_id}/{filename}' so the first folder is the UUID.
CREATE OR REPLACE FUNCTION public.media_vault_asset_for_path(_name text)
RETURNS public.media_assets
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.*
  FROM public.media_assets m
  WHERE m.id = NULLIF((string_to_array(_name, '/'))[1], '')::uuid
  LIMIT 1
$$;

-- Admin: full CRUD on media-vault objects
CREATE POLICY "media-vault admin all"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'media-vault' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'media-vault' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Staff (moderator/employee/trainer) read non-archived
CREATE POLICY "media-vault staff read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'media-vault'
    AND (
      public.has_role(auth.uid(), 'moderator'::public.app_role)
      OR public.has_role(auth.uid(), 'employee'::public.app_role)
      OR public.has_role(auth.uid(), 'trainer'::public.app_role)
    )
    AND COALESCE((public.media_vault_asset_for_path(name)).approval_state, 'archived') <> 'archived'
  );

-- Preview: read only approved + demo
CREATE POLICY "media-vault preview read demo approved"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'media-vault'
    AND public.has_role(auth.uid(), 'preview'::public.app_role)
    AND (public.media_vault_asset_for_path(name)).approval_state = 'approved'
    AND (public.media_vault_asset_for_path(name)).is_demo = true
  );
