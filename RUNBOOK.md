# Peninsula Equine — Current Website Runbook

Last reconciled: **9 October 2026**.

## Current production

| Concern | Current evidence |
|---|---|
| Public frontend | ChatGPT Sites project `appgprj_6a816abda00c8191a88c78dac6fd7152` |
| Latest published release | Version 38, 9 October 2026 |
| Source commit | `1ef39614adadf957202eb42044c4c66a1c7c919f` in the Site's source repository |
| Successful deployment | `appgdep_6ac854a94720819186f509b737708bab` |
| Public routes | https://peninsulaequine.com.au and its www hostname |
| Native route | https://peninsula-equine.jordynn-oakl-5154.chatgpt.site |
| Direct contact | 0418 585 489; ciro@procasa.com.au |
| Website enquiry | Prepared email; visitor reviews and sends using their email app |
| Optional design brief | Browser-local draft and downloadable PDF, manually emailed by visitor |
| Automatic delivery | Not activated; prerequisites below remain incomplete |

Both .com.au bindings and SSL are active. The live homepage and design-brief
journey loaded in the browser on 9 October. A synthetic brief produced a
downloadable PDF; the temporary browser draft was cleared. No real enquiry or
email was sent. The exact current source passed `npm test` (build, typecheck,
119 tests, zero failures). These checks do not certify physical devices,
screen readers, alternate browsers or real inbox delivery.

## Release and recovery

1. Open the existing Site and its current source; check for newer work.
2. Make scoped changes, retain its stack and release safeguards, and run the
   relevant source and interaction checks.
3. Push the exact tested source, save its matching archive as a version, then
   publish that version through Sites. Preserve its audience and domain bindings.
4. Confirm the successful deployment result, actual apex/www route, and affected
   visitor journeys. Record any checks that could not run.
5. Recover using a previously successful version of this same Site and its
   matching archive. Do not fail over to a legacy host or rewrite source history.

A saved version is not necessarily published. A GitHub merge, CI pass or
GitHub Pages deployment in this repository is not proof of a Sites release.
See [HOSTING_GOVERNANCE.md](./HOSTING_GOVERNANCE.md).

## Enquiry delivery gates

The public contact fallback remains usable while online delivery is unfinished.
The Site source includes a Resend adapter, durable outbox, signed delivery
webhook and protected dispatch endpoint, but `.openai/hosting.json` currently
has no D1 or R2 binding. Source presence is not hosted acceptance.

The connected Resend account has **three of three domain slots occupied** and
no Peninsula Equine sender on 9 October. Do not remove or borrow another
business's domain. A paid upgrade has not been authorized.

Before enabling online receipt:
- Resolve PE sender capacity and verify its provider-issued DNS records.
- Configure the required D1 binding/migrations, operator access and reviewed
  privacy/retention settings.
- Configure Site secrets for transport, webhook and dispatch without exposing
  credentials in source, logs or documentation.
- Install the periodic retry caller and verify monitoring/recovery behavior.
- Prove hosted authorization, storage, signed events, retries and controlled
  inbox delivery before enabling release flags.

Use the current Site source documents `docs/notification-release-gates.md`,
`docs/notification-workflow-review.md` and `docs/operating-record.md` for the
implementation details, with dated current release evidence taking precedence
over their historical publication statements.

## DNS and Workspace

Follow [DOMAIN_SETUP.md](./DOMAIN_SETUP.md). Instra #4485334 remains the reference
for the missing Google Workspace root TXT record; the 4 October follow-up is
already sent. Verify the requested record and Google's recognition separately.
Do not change MX, receiving mail, nameservers or the working web route.

## Historical application boundaries

The previous July runbook described GitHub Pages, Supabase project
`mxjuknqwzbvvmmdrvkql`, /hq and /auth/callback, Lovable, and senders under
notify.peninsulaequine.systems. Those instructions are preserved in Git history
but are **not the operating instructions for the published Sites website**.
Do not run their deployment, test-email, credential-rotation or migration
commands against the current Site by assumption.

This correction makes no claim about the current health or billing of legacy
accounts. Changes to them require their own scoped review. GroundLock is
excluded from the public website programme.
