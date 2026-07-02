# Domain Setup: peninsulaequine.com.au → peninsulaequine.systems

## Overview

`peninsulaequine.systems` is the primary domain for this website.
`peninsulaequine.com.au` and `www.peninsulaequine.com.au` should permanently redirect (HTTP 301) to `https://peninsulaequine.systems`.

The redirect rules already live in `vercel.json`. They only activate once both `.com.au` domains are attached to the same Vercel project.

## Vercel steps

1. Open the Vercel project for `https-peninsulaequine-com-au`.
2. Go to **Settings → Domains**.
3. Add:
   - `peninsulaequine.com.au`
   - `www.peninsulaequine.com.au`
4. Keep `peninsulaequine.systems` as the **Primary** domain.
5. Apply the DNS records Vercel shows at the registrar for the `.com.au` domain.

Once the domains verify, Vercel will serve the site on `.systems` and 301 redirect `.com.au` traffic to the matching `.systems` URL.

## Redirect behavior

`vercel.json` uses host-based redirects so the request path is preserved:

- `https://peninsulaequine.com.au/contact` → `https://peninsulaequine.systems/contact`
- `https://www.peninsulaequine.com.au/hq` → `https://peninsulaequine.systems/hq`

## Important checks

- Make sure the old website is no longer attached to either `.com.au` domain.
- Keep `public/robots.txt`, canonical tags, and sitemap URLs pointing at `https://peninsulaequine.systems`.
- The SPA rewrites for `/auth/callback` stay in place; they are separate from the host redirect.
