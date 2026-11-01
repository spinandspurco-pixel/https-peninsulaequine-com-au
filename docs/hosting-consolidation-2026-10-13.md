# Hosting documentation review and consolidation

Inspected **13 October 2026**. This is a documentation-only reconciliation;
merges, closures and operational changes below are a review sequence, not a
claim that they have been executed.

## Exact repository baseline

| Ref | Inspected SHA |
|---|---|
| `main` | `8e643d033f4bc33c62547ffe59842dad8f429d6a` |
| PR #43 before this correction | `4c04db0b493de8ee7ee74680055fac691dd976b0` |
| PR #35 | `f516316acda5a324b44c34de56b8a9f2bccef5db` |
| PR #37 | `e1b835abda5e2b4b56c10e329ffe4e0783ad1143` |

Recheck these refs before acting. Public website evidence remains the separate
9 October Sites version 38 record in [HOSTING_GOVERNANCE.md](../HOSTING_GOVERNANCE.md).
No later Sites publication or live backend recovery is claimed here.

## Review findings addressed in PR #43

| Finding | Resolution |
|---|---|
| README and historical banners still advertise Pages production | README separates Sites, redirect and backend; historical banners point to current runbooks. Stale workflow badges and the missing cleanup-plan link are removed. Related header/HQ guidance is scoped to the earlier application. |
| Workspace TXT owner ambiguous | [DOMAIN_SETUP.md](../DOMAIN_SETUP.md) distinguishes `.com.au` in Instra #4485334 from `.systems` in the application defaults. Ticket messages of 22 August, 2 October and 4 October were inspected; the values differ. Google Admin acceptance remains unverified for both. |
| Active backend lost recovery guidance | [BACKEND_RUNBOOK.md](../BACKEND_RUNBOOK.md) covers exact workflow triggers, configured target, migrations, partial deployments, recovery, email diagnostics and credential rotation. |

The domain review's assumption that the application's `.systems` default also
names the Instra task is not supported by the ticket. Preserve both separate
verification purposes; do not resolve the review by changing `.com.au` to
`.systems` everywhere or by publishing either token.

## Disposition of older drafts

| PR | Actual inspected state | Preserve | Do not carry forward |
|---|---|---|---|
| [#35](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/pull/35) | Only unique commit is `Initial plan`; merge-base-to-head file diff is empty. Its description claims changes and passing runs that the current branch does not establish. `main` removed the SPA smoke workflow and script in PR #41 (`3d76ff8d`, `047d094b`, merge `aeede5ad`). | Historical explanation that a SPA smoke test and a public website check need different targets; recorded in README/governance. No unique code to cherry-pick. | Restoring `publish-smoke-test.yml` or `scripts/publish-smoke-test.mjs`, or treating `.systems` as public website evidence. |
| [#37](https://github.com/spinandspurco-pixel/https-peninsulaequine-com-au/pull/37) | Latest commit recognizes Pages as a redirect, improving on its stale PR description. Still changes README, governance, domain guide and runbook with conflicting release/DNS claims; also moves five guides and three deployment files and adds an archive index. | Archive index, broken cleanup-link repair, correct distinction between redirect and SPA, and caution against declaring external resources deleted. Adapted in #43. | Its four overlapping operational documents; apex Pages IP / www CNAME cutover; `curl -I` as client-side redirect proof; `/hq` on the public Site as acceptance; unreviewed manifest relocation. |

The remaining PR #37 relocations are unnecessary for hosting correctness.
`cloudbuild.yaml` still references root `Dockerfile`; moving both unchanged
would not preserve those relative assumptions. Historical guide links and
possible external build triggers also need review before moving files.

## Safe sequence

1. Review #43 against the latest `main`. Confirm the Sites evidence is dated,
   the two Workspace tasks are separate, backend recovery remains available,
   and the diff contains only Markdown. Re-run link, whitespace and relevant
   repository checks; inspect hosted CI without treating it as Sites acceptance.
2. After approval, merge **#43 first**. Do not merge #35 or #37 into it or
   retarget their unchanged branches onto it. Preserve PR #41's smoke retirement
   and PR #42's artifact-retention changes. Note that any merge to `main` invokes
   the existing Pages redirect workflow; this PR's documentation paths do not
   match the Supabase push filter. This task does not perform that merge.
3. Recheck #35's head/diff. If still empty, close it as superseded by #41 and
   the #43 reconciliation; no squash or cherry-pick is required.
4. Recheck #37 for new unique work, then close it as superseded with the retained
   documentation accounted for above. If physical archival is later desired,
   start a new narrowly scoped PR from the post-#43 `main`; move only deliberately
   selected files, repair references and verify external consumers. Do not revive
   its operational text or move deployment entry points by default.
5. Handle any verified need for application monitoring or Workspace completion
   as separate work with a confirmed target. Do not resurrect old tests merely
   to make a draft mergeable or alter DNS/email to satisfy documentation.

## Verification scope

Local checks on 13 October:

- `git diff --check`: passed.
- Relative Markdown link and fragment scan: 94 targets across 19 changed
  documents, no missing targets or headings.
- `bash scripts/preview-mint-check.test.sh`: 6 passed, 0 failed.
- `bash scripts/preview-mint-check.sh`: passed.
- Pages workflow source assertions and redirect execution in an isolated JS
  context: homepage, contact and design-brief paths preserved; HTML homepage
  fallback and Google verification file checked. No host was published.
- Diff against `main`: workflow/runtime files unchanged, no changed path matches
  the backend push filter, and both retired SPA smoke files remain absent.

No workflow, application source, lockfile, migration, domain binding, DNS record,
nameserver or email-service configuration is part of this patch. Current hosted
CI results belong in the PR review. The 119 passing tests recorded on 9 October
belong to the separate Sites source, not this repository's current checks.
