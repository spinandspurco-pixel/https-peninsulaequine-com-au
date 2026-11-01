# Peninsula Equine — Current Website Runbook

Documentation reconciled: **13 October 2026**. Public release evidence below
was collected on **9 October 2026**; recheck for newer versions before operations.

## Current production

| Concern | Current evidence |
|---|---|
| Public frontend | ChatGPT Sites project `appgprj_6a816abda00c8191a88c78dac6fd7152` |
| Last verified published release | Version 38, 9 October 2026 |
| Source commit | `1ef39614adadf957202eb42044c4c66a1c7c919f` in the Site's source repository |
| Successful deployment | `appgdep_6ac854a94720819186f509b737708bab` |
| Public routes | https://peninsulaequine.com.au and its www hostname |
| Native route | https://peninsula-equine.jordynn-oakl-5154.chatgpt.site |
| Direct contact | 0418 585 489; ciro@procasa.com.au |
| Website enquiry | Prepared email; visitor reviews and sends using their email app |
| Optional design brief | Browser-local draft and downloadable PDF, manually emailed by visitor |
| Automatic delivery | Not activated; prerequisites below remain incomplete |

Both .com.au bindings and SSL were active on 9 October. The live homepage and design-brief
journey loaded in the browser on 9 October. A synthetic brief produced a
downloadable PDF; the temporary browser draft was cleared. No real enquiry or
email was sent. That verified source passed `npm test` (build, typecheck,
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

The 9 October release provides the contact fallback while online delivery is
unfinished. Its source includes a Resend adapter, durable outbox, signed delivery
webhook and protected dispatch endpoint, but the inspected `.openai/hosting.json`
had no D1 or R2 binding. Source presence is not hosted acceptance. Reconfirm
these release gates in the Site before enabling delivery.

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

Follow [DOMAIN_SETUP.md](./DOMAIN_SETUP.md). Instra #4485334 concerns the
Google Workspace root TXT at **`peninsulaequine.com.au`**; the 4 October
follow-up is already sent. The earlier application's verification UI/function
instead default to **`peninsulaequine.systems`** with a different token. They
must not be used to clear the `.com.au` request with their defaults. Verify each
domain's own requested record and Google's recognition separately.
Do not change MX, receiving mail, nameservers or the working web route.

## Separately maintained application and backend

The repository's earlier React/HQ application and Supabase backend are separate
from this Site. The backend deployment workflow remains active; use
[BACKEND_RUNBOOK.md](./BACKEND_RUNBOOK.md) for target identification, migrations,
partial deployments, database recovery, email diagnostics and credential rotation.
Use the confirmed application origin for HQ/auth checks, not the public Site
by assumption. A successful Pages redirect deployment does not deploy the
application or update its client configuration.

The backend guide supersedes the removed July operations sections for this
repository. The [archive index](./docs/legacy/README.md) identifies historical
hosting documents. [The consolidation record](./docs/hosting-consolidation-2026-10-13.md)
sets the review sequence for PRs #35, #37 and #43.

No current backend health, billing, recovery exercise or inbox-delivery result
is established by this documentation correction. GroundLock is excluded from
the public website programme.
