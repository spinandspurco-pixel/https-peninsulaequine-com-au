CREATE OR REPLACE FUNCTION public.get_quote_by_share_token(p_token text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE q public.quotes; items jsonb; safe_quote jsonb;
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
  safe_quote := to_jsonb(q) - 'internal_notes';
  RETURN jsonb_build_object('quote', safe_quote, 'line_items', items);
END $$;