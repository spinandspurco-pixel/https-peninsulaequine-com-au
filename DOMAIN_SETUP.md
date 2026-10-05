# Domain Setup: peninsulaequine.com.au

## Overview

`peninsulaequine.com.au` is the sole production domain for Peninsula Equine.

**Current GitHub Pages role:** the Pages deployment from this repository
(`spinandspurco-pixel.github.io`) publishes `retired-site/index.html`, which is
a route-preserving redirect to `https://peninsulaequine.com.au`. GitHub Pages
does **not** directly serve the React application.

Confirm the authoritative DNS origin of `peninsulaequine.com.au` before making
any DNS or hosting change; do not assume GitHub Pages IPs are the current
production origin.

Do not point the apex domain at CloudFront, S3, Vercel, Cloud Run/GCP, or any
other legacy hosting route. Those routes are retired and must not be re-enabled
for production, preview, or failover; see [HOSTING_GOVERNANCE.md](./HOSTING_GOVERNANCE.md).

## Registrar DNS steps (redirect host)

These steps configure the GitHub Pages domain so the redirect page is reachable
at `peninsulaequine.com.au` and `www.peninsulaequine.com.au`. Adapt them if the
authoritative origin has changed.

1. Open the domain's DNS records at the registrar.
2. Remove only the old web-hosting A/AAAA/ALIAS records for the apex; preserve MX, SPF, DKIM, DMARC, and other non-web records.
3. Add four apex `A` records for `@`:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
4. Add `www` as a `CNAME` to `spinandspurco-pixel.github.io.`
5. In GitHub repository settings, confirm Pages is set to custom domain `peninsulaequine.com.au`.

## Verification

- Check all four apex A records and the `www` CNAME from a public resolver.
- Confirm `https://peninsulaequine.com.au` returns the production application (not a redirect loop).
- Confirm `https://www.peninsulaequine.com.au` redirects to the apex.
- Verify the redirect page (`retired-site/index.html`) forwards deep links correctly.
