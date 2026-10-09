# Peninsula Equine Hosting Governance

## Current production route — verified 9 October 2026

The public website at https://peninsulaequine.com.au is published by **ChatGPT
Sites**, project `appgprj_6a816abda00c8191a88c78dac6fd7152`.

The current release is **Site version 38**, published on 9 October 2026:
- Source: `1ef39614adadf957202eb42044c4c66a1c7c919f`
- Successful deployment: `appgdep_6ac854a94720819186f509b737708bab`
- Native address: https://peninsula-equine.jordynn-oakl-5154.chatgpt.site
- Both .com.au hostnames have active domain and SSL bindings in Sites.

Production changes follow the existing Sites source repository, a tested saved
version, and the Sites publication operation. A saved version is not proof of
publication. Confirm its deployment result and actual production journeys.

This GitHub repository contains the earlier application and its operating
history. It is **not the source of the currently published Sites release**.
Its GitHub Pages workflows, checks, and older Supabase/HQ instructions do not
establish the live website's implementation or release status.

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
release and DNS evidence above. Legacy repositories, manifests, workflows and
runbooks are historical records, not permission to deploy, change DNS, or
delete services.

Draft PR #37 still describes GitHub Pages as canonical. Do not apply its hosting
claim without reconciling it with this record. Draft PR #35's .systems smoke-test
target does not verify the current .com.au public website. Neither draft has
been merged or closed by this documentation correction.

No hosting assignment, deployment workflow, DNS, billing, or external account
is changed by this documentation update.
