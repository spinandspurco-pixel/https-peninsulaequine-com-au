# Domain Setup: peninsulaequine.com.au → GitHub Pages

## Overview

`peninsulaequine.com.au` is the primary public website domain. GitHub Pages serves the frontend from this repository; Supabase serves the backend separately.

Do not retain CloudFront, S3, Vercel, or another web-hosting record for the public apex once the cutover is complete.

## Registrar DNS steps

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
- Confirm HTTPS returns GitHub's certificate and the current site title.
- Confirm `public/robots.txt`, canonical tags, and sitemap URLs use `https://peninsulaequine.com.au`.
- GitHub Pages' deployed `404.html` preserves SPA deep links such as `/hq` and `/auth/callback`.
