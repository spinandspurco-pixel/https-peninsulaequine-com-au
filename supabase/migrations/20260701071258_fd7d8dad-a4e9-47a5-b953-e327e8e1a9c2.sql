
CREATE OR REPLACE FUNCTION public.link_inquiry_attachments(
  _ids uuid[],
  _inquiry_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated integer;
BEGIN
  IF _ids IS NULL OR array_length(_ids, 1) IS NULL OR _inquiry_id IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.inquiry_attachments
     SET inquiry_id = _inquiry_id,
         updated_at = now()
   WHERE id = ANY(_ids)
     AND inquiry_id IS NULL
     AND EXISTS (SELECT 1 FROM public.inquiries i WHERE i.id = _inquiry_id);

  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated;
END;
$$;

REVOKE ALL ON FUNCTION public.link_inquiry_attachments(uuid[], uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_inquiry_attachments(uuid[], uuid) TO anon, authenticated, service_role;
