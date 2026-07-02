# Domain Setup: peninsulaequine.com.au → peninsulaequine.systems

## Overview

`peninsulaequine.systems` is the **primary domain** for this website.
`peninsulaequine.com.au` (and `www.peninsulaequine.com.au`) should permanently redirect (HTTP 301) to `https://peninsulaequine.systems`.

The redirect rules are already configured in `vercel.json` using Vercel's `has`-conditional redirect syntax, which fires only when the request host matches `.com.au`. No code changes are required — follow the Vercel dashboard steps below to activate them.

---

## How the redirect works

`vercel.json` contains two redirect rules:

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "www.peninsulaequine.com.au" }],
      "destination": "https://peninsulaequine.systems/$1",
      "permanent": true
    },
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "peninsulaequine.com.au" }],
      "destination": "https://peninsulaequine.systems/$1",
      "permanent": true
    }
  ]
}
```

- `permanent: true` issues an HTTP **301 Moved Permanently** response.
- Path and query string are preserved (`$1` captures the full path).
- These rules are **host-conditional**: they only fire when the request arrives on the `.com.au` domain. Traffic on `peninsulaequine.systems` is unaffected.

---

## Vercel Dashboard Setup

### Step 1 — Add `.com.au` domains to your Vercel project

1. Open [vercel.com](https://vercel.com) and go to your project (`https-peninsulaequine-com-au`).
2. Navigate to **Settings → Domains**.
3. Click **Add** and enter `peninsulaequine.com.au`.
4. Click **Add** again and enter `www.peninsulaequine.com.au`.
5. Vercel will display the DNS records required (CNAME or A record — see below).

### Step 2 — Set `peninsulaequine.systems` as primary

In **Settings → Domains**, confirm that `peninsulaequine.systems` (and optionally `www.peninsulaequine.systems`) is listed as the primary domain. Vercel assigns the "primary" label to the domain that receives traffic; the `.com.au` entries should show **Redirect → peninsulaequine.systems** once the DNS records propagate.

### Step 3 — Deploy

After adding the domains, trigger a fresh deployment (or promote the latest production build) so that the updated `vercel.json` redirect rules are live.

---

## DNS Configuration

Configure the following records with your domain registrar for `peninsulaequine.com.au`:

| Type  | Host                        | Value                   | TTL  |
|-------|-----------------------------|-------------------------|------|
| CNAME | `www`                       | `cname.vercel-dns.com`  | 3600 |
| A     | `@` (root / bare domain)    | `76.76.21.21`           | 3600 |

> **Note:** Some registrars do not allow a CNAME at the root (`@`). In that case use Vercel's A-record IP `76.76.21.21` for the root and a CNAME for `www`.

DNS propagation typically takes **5–30 minutes** but can take up to 48 hours depending on your registrar and TTL settings.

---

## Disconnecting the old `PeninsulaEquineWeb` repository

The old `PeninsulaEquineWeb` GitHub repository was a Figma export with localStorage mocks — it is **not** the live production site. To prevent it from interfering:

1. In the Vercel dashboard, locate any project connected to `PeninsulaEquineWeb`.
2. Go to that project's **Settings → Git** and **Disconnect** the repository.
3. Optionally **Delete** the old Vercel project entirely (this will not affect any DNS records already pointing at the new project).
4. Archive or delete the `PeninsulaEquineWeb` GitHub repository if it is no longer needed.

---

## Canonical URL policy

All SEO metadata, Open Graph tags, sitemap entries, and canonical link elements reference `https://peninsulaequine.systems`. The following files enforce this:

| File                          | Content                                      |
|-------------------------------|----------------------------------------------|
| `public/robots.txt`           | `Sitemap: https://peninsulaequine.systems/sitemap.xml` |
| `public/sitemap.xml`          | All `<loc>` entries use `https://peninsulaequine.systems` |
| `scripts/generate-sitemap.ts` | `BASE_URL = "https://peninsulaequine.systems"` |
| `scripts/prerender.ts`        | `SITE_ORIGIN = "https://peninsulaequine.systems"` |

Do **not** hardcode `peninsulaequine.com.au` in any of the above. The `.com.au` domain exists only as a redirect entry point.

---

## Verification checklist

After completing the above steps:

- [ ] `curl -I https://peninsulaequine.com.au` → HTTP 301 Location: `https://peninsulaequine.systems/`
- [ ] `curl -I https://www.peninsulaequine.com.au` → HTTP 301 Location: `https://peninsulaequine.systems/`
- [ ] `curl -I https://peninsulaequine.systems` → HTTP 200
- [ ] Browser: visiting any `.com.au` URL redirects to the same path on `.systems`
- [ ] SSL certificate is valid on both domains (Vercel provisions this automatically)
