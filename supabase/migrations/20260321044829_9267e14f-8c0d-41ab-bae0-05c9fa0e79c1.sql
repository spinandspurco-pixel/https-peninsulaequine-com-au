
-- Trigger: auto-sync inquiry deal_stage when a quote is created, sent, or accepted
CREATE OR REPLACE FUNCTION public.sync_inquiry_stage_on_quote()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only act if the quote is linked to an inquiry
  IF NEW.inquiry_id IS NULL THEN RETURN NEW; END IF;

  -- Quote created (draft)
  IF TG_OP = 'INSERT' AND NEW.status = 'draft' THEN
    UPDATE public.inquiries
    SET deal_stage = 'quote_in_progress', updated_at = now()
    WHERE id = NEW.inquiry_id AND deal_stage IN ('new', 'qualified', 'scope_review');
  END IF;

  -- Quote sent
  IF NEW.status = 'sent' AND (OLD IS NULL OR OLD.status != 'sent') THEN
    UPDATE public.inquiries
    SET deal_stage = 'quote_sent', updated_at = now()
    WHERE id = NEW.inquiry_id;

    -- Auto-create client follow-up in 3 business days
    INSERT INTO public.client_followups (
      client_name, client_email, inquiry_id, due_date,
      followup_type, status, notes, deal_stage, quote_status, deal_value
    )
    SELECT
      i.name, i.email, i.id,
      CURRENT_DATE + 3,
      'call', 'pending',
      'Auto-created: quote sent check-in',
      'quote_sent', 'sent', NEW.total
    FROM public.inquiries i WHERE i.id = NEW.inquiry_id
    ON CONFLICT DO NOTHING;
  END IF;

  -- Quote accepted
  IF NEW.accepted_at IS NOT NULL AND (OLD IS NULL OR OLD.accepted_at IS NULL) THEN
    UPDATE public.inquiries
    SET deal_stage = 'won', updated_at = now()
    WHERE id = NEW.inquiry_id;
  END IF;

  -- Quote declined
  IF NEW.declined_at IS NOT NULL AND (OLD IS NULL OR OLD.declined_at IS NULL) THEN
    UPDATE public.inquiries
    SET deal_stage = 'closed', updated_at = now()
    WHERE id = NEW.inquiry_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger on quotes for INSERT and UPDATE
DROP TRIGGER IF EXISTS sync_inquiry_stage_on_quote_insert ON public.quotes;
CREATE TRIGGER sync_inquiry_stage_on_quote_insert
  AFTER INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_inquiry_stage_on_quote();

DROP TRIGGER IF EXISTS sync_inquiry_stage_on_quote_update ON public.quotes;
CREATE TRIGGER sync_inquiry_stage_on_quote_update
  AFTER UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_inquiry_stage_on_quote();

-- Trigger: auto-mark overdue client followups
CREATE OR REPLACE FUNCTION public.auto_mark_overdue_followups()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- On any update to client_followups, check if it should be overdue
  IF NEW.status = 'pending' AND NEW.due_date < CURRENT_DATE THEN
    NEW.status := 'overdue';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_mark_overdue_followups ON public.client_followups;
CREATE TRIGGER auto_mark_overdue_followups
  BEFORE UPDATE ON public.client_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_mark_overdue_followups();
