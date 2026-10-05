# Peninsula Equine Hosting Governance

## Canonical production route

This repository, `spinandspurco-pixel/https-peninsulaequine-com-au`, is the
canonical release source and governance document store for Peninsula Equine.

The GitHub Pages deployment from this repository (`spinandspurco-pixel.github.io`)
publishes a **route-preserving redirect** to `https://peninsulaequine.com.au`.
It does not serve the React application directly. The `retired-site/index.html`
page performs an immediate `<meta http-equiv="refresh">` + JavaScript redirect so
that any visitor who reaches the GitHub Pages URL is transparently forwarded to
the production domain.

`peninsulaequine.com.au` is the sole authoritative production frontend address.
Its DNS origin must be confirmed before making any hosting or DNS changes; do
not assume GitHub Pages IPs are the current authoritative origin.

Supabase remains the managed backend for Auth, database, Storage, and Edge
Functions; it is not an alternative frontend host.

## Retirement policy

Cloud Run/GCP, Vercel, CloudFront, S3, and any other legacy web-hosting route
are retired as production deployment paths. Before labelling any retired
infrastructure definitively decommissioned, confirm the live topology at the
DNS/origin level; do not delete external infrastructure as part of a
documentation-only change. Do not:

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
2. `.github/workflows/deploy-github-pages.yml` is the only workflow that
   publishes to GitHub Pages. It now publishes `retired-site/index.html` as a
   route-preserving redirect to `https://peninsulaequine.com.au`; it does not
   build or serve the React application.
3. DNS changes must keep `peninsulaequine.com.au` resolvable and serving the
   production application; `www.peninsulaequine.com.au` should redirect there.
   The GitHub Pages domain records (four apex `A` records +
   `www` CNAME to `spinandspurco-pixel.github.io.`) handle the redirect host
   only — verify the authoritative origin of `peninsulaequine.com.au` at the
   DNS level before any DNS change; see [DOMAIN_SETUP.md](./DOMAIN_SETUP.md).
4. Roll back redirect changes with a revert commit or follow-up corrective
   commit; do not rewrite `main` history or fail over to a retired host.
5. Historical GCP documents are labelled as archived in `docs/legacy/` and must
   not be followed as runbooks.
6. Root-level files `FINAL_STATUS.md` and `AUTHENTICATION_SETUP.md` contain
   historical GCP notes and carry the same "do not follow" banner; they are
   retained for audit purposes only.
