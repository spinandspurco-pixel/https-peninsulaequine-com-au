
DROP POLICY IF EXISTS "Public can view quotes by share token" ON public.quotes;
DROP POLICY IF EXISTS "Public can accept quotes via share token" ON public.quotes;
DROP POLICY IF EXISTS "Public can view line items for shared quotes" ON public.quote_line_items;

CREATE OR REPLACE FUNCTION public.get_quote_by_share_token(p_token text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.quotes; items jsonb;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN RETURN NULL; END IF;
  SELECT * INTO q FROM public.quotes WHERE share_token = p_token LIMIT 1;
  IF q.id IS NULL THEN RETURN NULL; END IF;
  UPDATE public.quotes SET viewed_at = COALESCE(viewed_at, now()) WHERE id = q.id;
  SELECT COALESCE(jsonb_agg(to_jsonb(li) ORDER BY li.sort_order), '[]'::jsonb)
    INTO items FROM public.quote_line_items li WHERE li.quote_id = q.id;
  RETURN jsonb_build_object('quote', to_jsonb(q), 'line_items', items);
END $$;
REVOKE EXECUTE ON FUNCTION public.get_quote_by_share_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quote_by_share_token(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.accept_quote_by_share_token(p_token text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE updated int;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN RETURN false; END IF;
  UPDATE public.quotes SET accepted_at = now(), status = 'accepted'
    WHERE share_token = p_token AND status = 'sent' AND accepted_at IS NULL;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END $$;
REVOKE EXECUTE ON FUNCTION public.accept_quote_by_share_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_quote_by_share_token(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Users can view own assessment by email" ON public.site_assessments;

DROP POLICY IF EXISTS "Anyone can view holds" ON public.slot_holds;
DROP POLICY IF EXISTS "Authenticated users can delete own holds" ON public.slot_holds;

CREATE POLICY "Authenticated can view hold occupancy" ON public.slot_holds
  FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.slot_holds FROM anon;
REVOKE SELECT ON public.slot_holds FROM authenticated;
GRANT SELECT (id, slot_id, expires_at, held_at) ON public.slot_holds TO authenticated;

CREATE OR REPLACE FUNCTION public.release_slot_hold(p_slot_id uuid, p_session_id text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.slot_holds WHERE slot_id = p_slot_id AND session_id = p_session_id;
$$;
REVOKE EXECUTE ON FUNCTION public.release_slot_hold(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_slot_hold(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.refresh_slot_hold(p_slot_id uuid, p_session_id text, p_expires_at timestamptz)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.slot_holds SET expires_at = p_expires_at
   WHERE slot_id = p_slot_id AND session_id = p_session_id;
$$;
REVOKE EXECUTE ON FUNCTION public.refresh_slot_hold(uuid, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_slot_hold(uuid, text, timestamptz) TO anon, authenticated;

DROP POLICY IF EXISTS "Staff can update own document photos" ON storage.objects;
CREATE POLICY "Staff can update own document photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'staff-document-photos' AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  )
  WITH CHECK (
    bucket_id = 'staff-document-photos' AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

REVOKE EXECUTE ON FUNCTION public.auto_mark_overdue_followups() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_nurture_on_inquiry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_hubspot_on_inquiry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_job_profit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_inquiry_stage_on_quote() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_expected_value() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_line_total() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_quote_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_slot_bookings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_quote_follow_ups() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_tag_inquiry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_holds() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.cleanup_expired_holds() TO authenticated, service_role;
