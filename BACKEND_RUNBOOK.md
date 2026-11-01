# Peninsula Equine — Repository Application and Supabase Runbook

Reconciled against repository source on **13 October 2026**. This guide covers
the earlier React/HQ application and its still-active backend deployment
workflow. The public ChatGPT Sites website has a separate [runbook](./RUNBOOK.md).
These are procedures for a separately authorized operation; no deployment,
database recovery, secret rotation or test email was performed in this correction.

## Identify the system before acting

| Item | Evidence and required confirmation |
|---|---|
| Backend workflow | [deploy-supabase-functions.yml](./.github/workflows/deploy-supabase-functions.yml), job `Deploy database and functions to production` |
| Deployment project | Workflow sets `SUPABASE_PROJECT_ID` from repository variable `VITE_SUPABASE_PROJECT_ID`. Confirm that non-secret ref in repository settings and match the intended Supabase dashboard/project before releasing or recovering. |
| Source project reference | [supabase/config.toml](./supabase/config.toml) contains `mxjuknqwzbvvmmdrvkql`. The July runbook used the same ref. Neither establishes the current value of the workflow variable. Stop and reconcile a mismatch. |
| Deployment credentials | Actions secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD`; values must not enter source, reports or logs. |
| Application frontend | Confirm its actual host and release process independently. GitHub Pages now publishes a redirect, and neither `.com.au` nor `.systems` is established here as a live HQ host. |
| Application client | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`; confirm they address the same intended project. |
| Runtime credentials | Supabase-injected keys and project Edge Function secrets, including `RESEND_API_KEY` and sender settings. They are separate from Sites secrets and DNS. |

Record the operator, target project, source SHA, last successful backend run,
incident/change scope and recovery point in the operational record. Other
Supabase integration comments or security scans may address different project
refs; verify their target before treating them as evidence for this backend.

## Active workflow and release process

The workflow triggers on pushes to `main` affecting `supabase/functions/**`,
`supabase/migrations/**`, `supabase/config.toml`, or its own workflow file. It
also allows manual dispatch. The documentation paths changed in PR #43 do not
match that push filter; a Markdown file under a matched directory would still
trigger it. Pull requests do not deploy this backend. Manual dispatch remains
capable of deployment and must use the exact reviewed `main` revision.

The workflow, in order:

1. Checks out the selected revision and installs the Supabase CLI (`latest`).
2. Links the project selected by `VITE_SUPABASE_PROJECT_ID`.
3. Runs `supabase db push --linked --include-all`.
4. Deploys each `supabase/functions/*/index.ts` function through `--use-api`,
   excluding `mcp` from the loop, then deploys `mcp` separately.

It has concurrency group `supabase-backend-production`,
`cancel-in-progress: false`, and a 15-minute job timeout. It does **not** declare
a GitHub environment approval gate. Do not assume a second approval after merge.

Before a release, review the full pending migration set: `--include-all` can
include older local migrations absent from remote history. Confirm a usable
backup/recovery point and test the change in an isolated local or staging
database. Create new migrations with `supabase migration new <name>` after
checking the installed CLI's `--help`; retain applied migration files unchanged.
Run affected repository checks, obtain review, then merge through the existing
workflow. Do not run a manual production `db push` alongside it.

After release, record the run URL, source SHA, CLI version, actual project ref,
applied migration IDs and function deployment outcomes. Check authenticated
application access, role boundaries and the affected read/write journey on the
confirmed application host with authorized test data. CI success alone does
not prove runtime health. Never run production seeds or send email merely to
validate this documentation.

## Failure triage and recovery

First identify whether the fault is in Sites, the Pages redirect, the application
client, the database, a function or email. Use the matching runbook; do not
change public DNS as a backend repair.

1. Pause further backend merges and manual dispatches while investigating.
   Inspect running and pending jobs. `cancel-in-progress: false` protects the
   running job, but does not guarantee every pending run will execute. If an
   incident requires stopping a job or disabling a workflow,
   the authorized operator must record that containment action and its effect.
2. Inspect the failed run's link, migration and individual function steps plus
   Supabase logs. Confirm the project before accessing data. A failure after
   migration may leave the database updated and functions only partly deployed.
3. Compare remote migration history and deployed function versions with the
   recorded last successful release. Cancellation, timeout and a red workflow
   do not imply that earlier steps were undone. Avoid blind retries.
4. Select the smallest reviewed recovery below, verify it on an isolated target,
   then release it through the same workflow. Retain the incident evidence.

### Function or application-code regression

Prepare a corrective PR or a scoped revert of the affected function code.
Confirm compatibility with the database schema already applied before deploying.
Do not remove applied migrations as a supposed rollback, and do not dispatch
an old whole-repository revision: it may contain unrelated schema/function
changes. The workflow redeploys the function set, not just the changed function.

For a frontend regression, use the independently confirmed application release
process. Reverting this repository or redeploying the Pages redirect does not
recover the public Sites website or publish a rebuilt HQ client.

### Database migration regression

Git reverts do not undo applied SQL. Prefer a new forward corrective migration
that preserves data. Review its effect on constraints, grants, RLS, functions
and client compatibility; test against an isolated copy with representative
data. Merge the new migration through the workflow and verify the resulting
schema and affected queries. Migration-history repair alone does not reverse SQL.

For data loss or a change that cannot be corrected safely, stop writes under
the incident procedure and have the project owner assess the available backup
or PITR restore point, downtime and data loss window. Confirm availability in
the actual project; this guide does not establish backup coverage. Obtain
explicit approval for the concrete restore before executing it. Database backups
do not restore deleted Storage objects; assess those separately. After recovery,
reconcile migration history with source, verify Auth/RLS and application
compatibility, and resume writers/deployments deliberately. Never use a
production database reset as routine recovery.

## Email diagnostics — repository application only

The source's expected sender domain is `notify.peninsulaequine.systems`.
This is a configuration expectation, not proof that the current provider account
has verified it or that it is the public Site's sender.

| Setting | Repository purpose |
|---|---|
| `HQ_EMAIL_FROM` | HQ notifications |
| `NOREPLY_EMAIL_FROM` | System messages |
| `BOOKINGS_EMAIL_FROM` | Bookings |
| `QUOTES_EMAIL_FROM` | Quotes |
| `FROM_EMAIL` | Default sender |
| `NOTIFICATION_EMAIL` | Staff notification destination where used |
| `RESEND_API_KEY` | Provider access for application email functions |
| `info@peninsulaequine.systems` | Reply-to in `send-test-email`; separate receiving mailbox |

On the confirmed application host, an authorized admin can inspect
`/hq/legacy` → **Systems Health** → **Email diagnostics**. The route mounts
`Admin` and its `ControlRoom`, which renders `EmailDiagnostics` in that tab.
This requires a confirmed application deployment and admin access; it is not a
route on the public Sites website.

Do not use `/hq/deploy-health` as an operational entry point. Its existing
application screen still emits obsolete GitHub Pages cutover actions for the
public apex/www records and does not mount the email diagnostics. Those actions
must be corrected or retired before that screen is used again. They must never
be followed to replace the public Sites route.

The [email-ops-status function](./supabase/functions/email-ops-status/index.ts)
checks sender settings, provider domain records and `email_diagnostic_log`.
Use `resend-domain-status` for its provider status view. Check the exact provider
account, sender domain, timestamp and errors; an old successful diagnostic is
not evidence that delivery works after a new change.

The [send-test-email function](./supabase/functions/send-test-email/index.ts)
sends a real message and writes a diagnostic row. Run it only with authorization
for the specific recipient; explicitly choose that recipient instead of relying
on its default. Inspect the provider result and recipient inbox separately.
Do not invoke notification or resend functions as a read-only health check.

Use provider-issued SPF/DKIM and other sender records, not assumed record types
or copied values. Receiving-mail MX and the two Workspace ownership TXT tasks
are separate; see [DOMAIN_SETUP.md](./DOMAIN_SETUP.md). No email/DNS change is
needed to merge this documentation correction.

## Credential rotation and validation

For an authorized rotation, inventory every consumer and confirm the target
project/account first. Record key identifiers, not values. Roll out and validate
the replacement before retiring the old credential where the provider supports
overlap; a compromise may require immediate revocation under the incident plan.

| Credential | Rotation and recovery path |
|---|---|
| Application publishable key | Create/obtain the intended project's replacement, update the actual application build configuration and repository variable as applicable, rebuild and release through the confirmed application host, then check login and authenticated requests. A Pages redirect deployment does not rebuild the client. |
| `RESEND_API_KEY` | Replace in the actual backend's Edge Function secrets; confirm scope and sender-domain access. Supabase makes updated secrets available without a redeploy. Inspect diagnostics; an inbox test still needs recipient authorization. Restore the old key only if it remains valid and uncompromised. |
| Legacy `SUPABASE_SERVICE_ROLE_KEY` and other server API keys | Inventory runtime and external consumers. Use the current Supabase API-key migration/rotation procedure and test compatibility before disabling legacy keys; this source still reads legacy injected keys. Do not try to create a custom `SUPABASE_*` secret or place a privileged key in `VITE_*`. An API-key-format migration is a separate code change. |
| `SUPABASE_ACCESS_TOKEN` | Replace the deployment credential in Actions secrets with the required project access; verify target access before the next authorized deployment. It is distinct from the read-oriented `SB_MGMT_ACCESS_TOKEN`. |
| `SUPABASE_DB_PASSWORD` | Coordinate database password change with all database clients and the matching Actions secret. Verify connectivity before resuming the deployment queue; do not assume dual-password overlap. |
| `SB_MGMT_ACCESS_TOKEN` | Use the [existing rotation guide](./docs/security/sb-mgmt-access-token-rotation.md) after checking its project, scopes and runtime consumers against the current configuration. Its historical project/host assumptions do not override the target-identification checks above. |

If validation fails before revocation, revert only the affected consumer setting
to a still-valid, uncompromised credential and retest. Otherwise issue and deploy
a replacement; do not assume a revoked credential can be recovered. Record the
result, affected consumers and follow-up work without revealing secrets.

## References and limits

Current Supabase guidance consulted for this documentation review:

- [Managing environments and migrations](https://supabase.com/docs/guides/deployment/managing-environments)
- [Database backups and recovery](https://supabase.com/docs/guides/platform/backups)
- [Edge Function secrets](https://supabase.com/docs/guides/functions/secrets)
- [API key rotation](https://supabase.com/docs/guides/getting-started/api-keys)

Source review establishes that the workflow remains deployment-capable. Live
project configuration, backup availability, successful recovery and application
hosting have not been exercised or certified by this correction.
