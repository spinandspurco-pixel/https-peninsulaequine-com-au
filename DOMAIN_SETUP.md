# Domain Setup: current Peninsula Equine production route

## Verified state — 9 October 2026

The primary public address is https://peninsulaequine.com.au, hosted by the
existing ChatGPT Sites project. Sites reports the apex and www bindings and
SSL as active. The observed web DNS route is:

| Host | Type | Target |
|---|---|---|
| peninsulaequine.com.au | A | 162.159.143.30 |
| peninsulaequine.com.au | A | 172.66.3.26 |
| www.peninsulaequine.com.au | CNAME | custom-domains.chatgpt.site. |

These values record the route observed on 9 October; obtain current required values
from this exact Site before an authorized DNS operation. Do not replace them
with the historical GitHub Pages IPs or `spinandspurco-pixel.github.io`.

On 9 October, the `.systems` and `www.systems` bindings were pending in Sites
with SSL validation incomplete. This is not evidence of a current application
deployment there. They are not the canonical public website or a ready failover.

## Google Workspace verification — two distinct domains

### Public TXT recheck — 2 November 2026

Instra's reply of 27 October 2026 at 15:07 UTC (28 October in Melbourne), in
ticket **#4485334**, confirms that it added the requested `.com.au` TXT record.
On 2 November, independent Google Public DNS and Cloudflare DNS-over-HTTPS
lookups both returned the exact verification value from the ticket at the root
of `peninsulaequine.com.au`. No DNS record or nameserver was changed during
this recheck.

The public DNS prerequisite is now verified. Recognition in the intended
Google Admin account remains unverified; do not mark Workspace setup or mail
activation complete from the TXT match alone. The earlier absence recorded
below is historical and no longer the current public DNS result.

### Earlier reconciliation — 13 October 2026

`@` means the root of the **selected DNS zone**, not an interchangeable record
for every Peninsula Equine domain. The following evidence was reconciled on
13 October 2026:

| Domain / full TXT owner | Purpose and evidence | Verification boundary |
|---|---|---|
| `peninsulaequine.com.au` (`@` in the `.com.au` zone) | Workspace domain-ownership verification requested in Instra **#4485334**. The 22 August request explicitly names this domain; the 2 October confirmation and 4 October follow-up repeat it. | Match the ticket to this domain in the intended Google Admin account before any future DNS edit. The 9 October lookup recorded the TXT as absent; no completion is established here. |
| `peninsulaequine.systems` (`@` in the `.systems` zone) | Earlier application's Workspace verification helper: `DOMAIN` in [DnsPublish.tsx](./src/pages/DnsPublish.tsx) and `DEFAULT_DOMAIN` in [verify-google-dns](./supabase/functions/verify-google-dns/index.ts). | These constants prove what the application checks, not which Workspace tenant owns the domain, current Google acceptance, or the purpose of the `.com.au` ticket. Reconfirm the `.systems` task in its own Google Admin account. |

The ticket and application contain **different verification values**. Do not
copy the application's hardcoded token to `.com.au`, or the ticket's token to
`.systems`. The precise values remain in their respective source records;
confirm the current Google-issued value and TTL rather than treating either
historical value as a new instruction. The selected Gmail ticket search on
13 October found no later Instra response confirming completion.

The function accepts explicit `domain` and `token` parameters; without them it
checks `.systems` with its historical default token. Its `ready` result reports
a DNS match from public resolvers, not successful Google Admin verification.
It must not be used with defaults to clear the `.com.au` ticket.

For a separately authorized verification task, record the full domain, Google
account/tenant, purpose, TXT owner, value source and TTL before editing anything.
Afterwards check the exact domain's TXT through independent public resolvers
and confirm recognition in that same Google Admin account. A registrar save or
acknowledgement alone does not complete verification. This documentation change
does not apply either record.

Preserve nameservers and all existing A, CNAME, MX, SPF, DKIM, DMARC and other
verification records. Workspace verification does not authorize a web-hosting
cutover or receiving-mail change.

### Other Google and email records are separate

- `public/google7675cee3aad607c0.html` is an HTML-file Google site-verification
  artifact included by the Pages redirect workflow. Its presence does not
  satisfy either Workspace root TXT task or prove which Google product/account
  accepted it.
- `notify.peninsulaequine.systems` is the sender domain expected by the
  repository application's Resend diagnostics. Provider-issued sending records
  and mailbox MX records are separate from Workspace ownership TXT records;
  see [BACKEND_RUNBOOK.md](./BACKEND_RUNBOOK.md).

## Verification after an authorized change

- Compare public DNS with the exact Site's current domain requirements.
- Confirm both hostnames, HTTPS and canonical redirects in a browser.
- Check /contact and /design-brief; verify their actions separately from page load.
- Check the matching successful Sites deployment and source version.
- Record the date, changed record and observed result; do not claim propagation
  from a save confirmation alone.

See [HOSTING_GOVERNANCE.md](./HOSTING_GOVERNANCE.md) and
[RUNBOOK.md](./RUNBOOK.md). Earlier GitHub Pages cutover instructions are
superseded. No DNS record was altered by this documentation update.
