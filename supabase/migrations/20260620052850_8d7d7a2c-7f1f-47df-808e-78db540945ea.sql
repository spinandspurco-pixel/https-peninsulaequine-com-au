
-- Defense-in-depth: explicitly block any write attempt by users in the 'preview' role,
-- even if their JWT reaches the Data API directly. RLS already denies (admin required),
-- but this trigger produces a clear, auditable rejection.

CREATE OR REPLACE FUNCTION public.block_preview_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND public.has_role(auth.uid(), 'preview'::app_role)
     AND NOT public.has_role(auth.uid(), 'admin'::app_role)
  THEN
    RAISE EXCEPTION 'preview_mode_readonly: write operations are disabled for client preview accounts'
      USING ERRCODE = '42501';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'managed_projects','managed_services','managed_testimonials','managed_events',
    'staff_documents','inquiries','bookings','event_rsvps','quotes','quote_line_items',
    'quote_follow_ups','client_followups','employee_tasks','jobs','job_cost_entries',
    'announcements','approval_queue','website_suggestions','scheduled_messages',
    'follow_up_drafts','client_portal_projects','client_portal_updates','client_portal_zones',
    'message_templates','activity_log','automation_settings','integration_settings',
    'pricing_templates','pricing_calculations','site_assessments','assessment_availability',
    'lesson_slots','lesson_bookings','inquiry_nurture','cashflow','overheads',
    'newsletter_subscribers','user_roles','equus_ridge_interest','mlpgs_interest',
    'lumenarc_briefing_requests','ab_test_events','client_logs','slot_holds'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_block_preview_writes ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_block_preview_writes
         BEFORE INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.block_preview_writes()',
      t
    );
  END LOOP;
END;
$$;
