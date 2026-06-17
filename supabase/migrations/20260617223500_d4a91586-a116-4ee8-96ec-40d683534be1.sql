
CREATE OR REPLACE FUNCTION public.get_quote_by_share_token(p_token text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.quotes; items jsonb;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN RETURN NULL; END IF;
  BEGIN
    SELECT * INTO q FROM public.quotes WHERE share_token::text = p_token LIMIT 1;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;
  IF q.id IS NULL THEN RETURN NULL; END IF;
  UPDATE public.quotes SET viewed_at = COALESCE(viewed_at, now()) WHERE id = q.id;
  SELECT COALESCE(jsonb_agg(to_jsonb(li) ORDER BY li.sort_order), '[]'::jsonb)
    INTO items FROM public.quote_line_items li WHERE li.quote_id = q.id;
  RETURN jsonb_build_object('quote', to_jsonb(q), 'line_items', items);
END $$;

CREATE OR REPLACE FUNCTION public.accept_quote_by_share_token(p_token text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE updated int;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN RETURN false; END IF;
  BEGIN
    UPDATE public.quotes SET accepted_at = now(), status = 'accepted'
      WHERE share_token::text = p_token AND status = 'sent' AND accepted_at IS NULL;
    GET DIAGNOSTICS updated = ROW_COUNT;
  EXCEPTION WHEN others THEN
    RETURN false;
  END;
  RETURN updated > 0;
END $$;
