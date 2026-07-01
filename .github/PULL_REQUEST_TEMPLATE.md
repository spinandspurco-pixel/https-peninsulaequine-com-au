<!-- Pull Request template: secure attachments checklist -->

## Summary

This PR implements a secure server-side upload flow for Contact attachments, an attachments metadata table, a transactional inquiry creation RPC, a ClamAV scanner worker, orphan-cleanup script, and basic tests.

---

## QA checklist (reviewers)

- [ ] Migration applied on staging: `supabase/migrations/20260701_add_attachments_and_create_inquiry_fn.sql` executed and `public.attachments` table exists.
- [ ] RPC present: `create_inquiry_with_attachments` is available.
- [ ] Env secrets set on staging: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Upload endpoint works: POST `/api/upload-inquiry-attachment` with multipart/form-data returns `200` and an `attachment.id`.
- [ ] Create-inquiry endpoint works: POST `/api/create-inquiry` with `attachment_ids` links attachments to the new inquiry.
- [ ] Server-side validation: rejected disallowed file types and files > 10MB.
- [ ] Contact UI submits files to the server endpoint, then creates inquiry; verify toasts and UX for errors.
- [ ] Scanner worker runs and updates `attachments.scan_status` from `pending` → `scanning` → `clean|infected|failed`.
- [ ] Orphan cleanup removes unattached objects older than 7 days.
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is not exposed client-side.
- [ ] Confirm direct client uploads are blocked after storage policy change.

---

## Deployment notes

- Run the migration on staging and production before enabling the Contact UI changes.
- Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to server environment in staging/production.
- Deploy scanner worker (k8s/deployment or Docker) and schedule the cleanup job.


