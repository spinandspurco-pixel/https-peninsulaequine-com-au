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

These values record the current route; always obtain current required values
from this exact Site before an authorized DNS operation. Do not replace them
with the historical GitHub Pages IPs or `spinandspurco-pixel.github.io`.

The .systems and www.systems bindings remain pending in Sites with SSL
validation incomplete. They are not the canonical public website and must not
be treated as a ready failover host.

## Google Workspace verification — separate outstanding item

Instra ticket **#4485334** concerns a root TXT record for Google verification.
The latest recorded follow-up was sent on **4 October 2026**. On 9 October the
public root TXT lookup did not show the requested record, and no later reply
was found in the selected Gmail account.

Next action: confirm the requested TXT host/value/TTL from the existing ticket,
apply only that record through authorized registrar access, then check public
DNS and Google's recognition. A registrar acknowledgement alone does not
complete verification. The ticket is the source for the exact verification
value; do not copy it from an unrelated account or historical instruction.

Preserve nameservers and all existing A, CNAME, MX, SPF, DKIM, DMARC and other
verification records. Workspace verification does not authorize a web-hosting
cutover or receiving-mail change.

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
