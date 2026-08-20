# Peninsula Equine Hosting Governance

## Canonical production route

This repository, `spinandspurco-pixel/https-peninsulaequine-com-au`, is the
canonical implementation and release source for Peninsula Equine.

The sole production frontend route is:

`reviewed PR -> main -> Deploy Peninsula Equine to GitHub Pages -> peninsulaequine.com.au`

GitHub Pages serves the static React application. Supabase remains the managed
backend for Auth, database, Storage, and Edge Functions; it is not an
alternative frontend host.

## Retirement policy

Cloud Run/GCP, Vercel, CloudFront, S3, and any other legacy web-hosting route
are retired as production deployment paths. Do not:

- create or re-enable a deployment workflow for a retired host;
- deploy this frontend to a retired host;
- point production DNS at a retired host; or
- treat a retired host as a preview or failover path.

Legacy repositories, deployment manifests, and historical deployment guides
remain records only. They do not authorise a deployment or infrastructure
change. Their retention does not imply that their services should be deleted;
any deletion, billing, DNS, or external-platform action requires a separately
approved operational change outside this repository.

## Operating controls

1. Changes merge through reviewed pull requests to `main`.
2. `.github/workflows/deploy-github-pages.yml` is the only frontend production
   deployment workflow.
3. DNS changes must preserve `peninsulaequine.com.au` and
   `www.peninsulaequine.com.au` as GitHub Pages custom domains; see
   [DOMAIN_SETUP.md](./DOMAIN_SETUP.md).
4. Roll back frontend releases by reverting or correcting Git history and
   redeploying GitHub Pages; do not fail over to a retired host.
5. Historical GCP documents are labelled as archived and must not be followed
   as runbooks.
