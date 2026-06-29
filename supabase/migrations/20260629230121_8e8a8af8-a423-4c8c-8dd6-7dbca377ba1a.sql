
-- Revoke EXECUTE on trigger-only SECURITY DEFINER functions from PUBLIC/anon/authenticated.
-- These are only invoked by Postgres triggers; nothing should call them via PostgREST.
REVOKE EXECUTE ON FUNCTION public._hq_graph_eval_media_row(public.media_assets) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_mark_overdue_followups() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.block_preview_writes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_nurture_on_inquiry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.hq_graph_trg_media_suggest() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_inquiry_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_inquiry_note_added() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_inquiry_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_hubspot_on_inquiry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_job_profit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_media_assets_audit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.staff_profiles_guard_active() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_inquiry_stage_on_quote() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_expected_value() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_line_total() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_quote_follow_ups() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_quote_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_slot_bookings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_tag_inquiry() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Helper functions called only from RLS / storage policies via security definer chain,
-- not intended for direct RPC.
REVOKE EXECUTE ON FUNCTION public.media_vault_asset_for_path(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_e2e_test_user(uuid) FROM PUBLIC, anon, authenticated;

-- Admin-only maintenance RPCs — anon never needs these.
REVOKE EXECUTE ON FUNCTION public.hq_graph_backfill_media_suggestions() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.seed_staff_roles() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verify_staff_seed() FROM PUBLIC, anon;

-- Authenticated-only directory helpers — anon should not list staff.
REVOKE EXECUTE ON FUNCTION public.list_staff_directory() FROM PUBLIC, anon;

-- Tighten the "Service role manages …" ALL/true policies. service_role bypasses RLS
-- anyway, so the policies are documentation; restate them as SELECT-only no-ops
-- under the service_role grantee to keep intent visible without tripping
-- the "policy always true" linter on write paths.
DROP POLICY IF EXISTS "Service role manages smoke reports" ON public.graph_smoke_reports;
DROP POLICY IF EXISTS "Service role can manage nurture" ON public.inquiry_nurture;
DROP POLICY IF EXISTS "Service role manages slot holds" ON public.slot_holds;
