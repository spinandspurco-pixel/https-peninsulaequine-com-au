# Peninsula Equine Hosting Governance

## Current production route — verified 9 October 2026

The public website at https://peninsulaequine.com.au is published by **ChatGPT
Sites**, project `appgprj_6a816abda00c8191a88c78dac6fd7152`.

The last release verified in this record is **Site version 38**, published on
9 October 2026. This is dated evidence, not a claim that no newer version exists:
- Source: `1ef39614adadf957202eb42044c4c66a1c7c919f`
- Successful deployment: `appgdep_6ac854a94720819186f509b737708bab`
- Native address: https://peninsula-equine.jordynn-oakl-5154.chatgpt.site
- Both .com.au hostnames have active domain and SSL bindings in Sites.

Production changes follow the existing Sites source repository, a tested saved
version, and the Sites publication operation. A saved version is not proof of
publication. Confirm its deployment result and actual production journeys.

This GitHub repository contains the earlier application and its operating
history. It is **not the source of the currently published Sites release**.
Its checks do not establish the public website's implementation or release status.

| Surface | Source / release mechanism | Operational authority |
|---|---|---|
| Public website | Existing Sites project and its separate source repository | [RUNBOOK.md](./RUNBOOK.md) |
| Repository application / HQ | React source in this repository; hosted application origin requires separate confirmation | [BACKEND_RUNBOOK.md](./BACKEND_RUNBOOK.md) |
| Supabase backend | Active `deploy-supabase-functions.yml`; migrations then functions | [BACKEND_RUNBOOK.md](./BACKEND_RUNBOOK.md) |
| GitHub Pages | `retired-site/index.html` redirect plus Google HTML verification file | [README deployment section](./README.md#10-deployment) |

The earlier frontend's retirement does **not** retire the Supabase workflow.
Its target is selected by repository configuration, not by the public Site's
domain. Backend recovery instructions remain current and separately scoped.

## Operating controls

1. Keep GitHub changes on reviewed pull requests to `main`.
2. Preserve the working Sites route. Do not change production DNS to match old
   GitHub Pages, Vercel, Cloud Run/GCP, CloudFront or S3 guidance.
3. Use the current Site's source and release records for changes to the public
   website. Recheck for intervening versions before publishing.
4. Confirm apex and www domain status, SSL, and public interactions after an
   approved release. Do not infer complete functionality from a page fetch.
5. Roll back through the same Site using a known, previously successful saved
   version and its archive. Reverting this GitHub repository does not roll back
   the current public website.
6. Keep secrets, customer enquiries and operator identities out of public docs.
7. GroundLock is excluded from this website programme.

See [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) for the observed DNS route and
[RUNBOOK.md](./RUNBOOK.md) for checks and outstanding delivery prerequisites.

## Historical hosting and pending work

The former GitHub Pages production designation is superseded by the dated
release and DNS evidence above. [Archived deployment records](./docs/legacy/README.md)
do not authorize deployment, DNS changes or service deletion. Retired GCP,
Cloud Run, Vercel, CloudFront and S3 frontend paths are not approved production,
preview or failover routes. This is not evidence that external resources have
been decommissioned. `scripts/pre-deploy.sh` also retains obsolete Pages
acceptance text; it is not a public Sites release gate.

PR #35 has no changed files at its inspected head; its described SPA smoke
workflow and script were removed on `main` by PR #41. PR #37's latest commit
recognizes the Pages redirect, but still misidentifies this repository as the
public release source and proposes unsafe apex/www Pages DNS instructions.
Its archive-index and broken-link improvements are preserved here without
moving deployment manifests. See the exact
[review and consolidation sequence](./docs/hosting-consolidation-2026-10-13.md).

No hosting assignment, deployment workflow, DNS, billing, or external account
is changed by this documentation update.
