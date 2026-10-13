# Security Headers

Repository application header baseline. It does not establish the headers
served by the public ChatGPT Sites website; use [RUNBOOK.md](./RUNBOOK.md) and
verify that host's actual responses for public-site acceptance.

## Where they live

- **Public Sites website** — headers belong to the separate Site's source and
  hosting configuration. This repository does not publish that website.
- **GitHub Pages** — publishes the legacy redirect and Google verification file;
  its workflow does not copy `public/_headers` or serve the application.
- **`public/_headers`** — a portable static-host baseline retained for hosts that support the file.

## Application baseline values (host enforcement must be verified)

| Header | Value | Why |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years across all subdomains. |
| `X-Content-Type-Options` | `nosniff` | Blocks MIME sniffing. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Sends origin only on cross-origin requests; preserves analytics attribution. |
| `X-Frame-Options` | `SAMEORIGIN` | Legacy clickjacking protection (modern equivalent: CSP `frame-ancestors`). |
| `Permissions-Policy` | camera/mic/geolocation/payment/usb/sensors/FLoC all `=()` | Denies powerful APIs the site does not use. |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` | Required so the Google OAuth popup can `postMessage` back to the opener. Do **not** tighten to `same-origin` — it breaks Google sign-in. |

## Application CSP baseline — Report-Only

The application baseline defines a Content-Security-Policy as `Content-Security-Policy-Report-Only` so violations surface in DevTools without breaking Google sign-in, Supabase auth, analytics, fonts, or remote imagery.

Allowlist covers:
- `script-src` — self + `'unsafe-inline'` + `'unsafe-eval'` (Vite), `accounts.google.com`, `apis.google.com`.
- `connect-src` — self, `*.supabase.co` (https + wss), `accounts.google.com`, `*.googleapis.com`.
- `frame-src` / `form-action` — Google OAuth + Supabase auth endpoints.
- `img-src` — `self data: blob: https:` (covers Unsplash, OG images, AI-generated assets).
- `style-src` / `font-src` — Google Fonts.

### Promoting to enforced CSP

1. Leave Report-Only deployed for ≥ 1 week; watch the browser console + any CSP report endpoint.
2. Add any missing origins surfaced by reports (most likely candidates: an analytics host, a future embed).
3. Once clean, rename `Content-Security-Policy-Report-Only` → `Content-Security-Policy` in `public/_headers` and validate the equivalent response at the active host.
4. Verify headers and Google sign-in on the independently confirmed application
   host. The old publish smoke workflow was retired in PR #41; it is not a Sites
   release gate. See [BACKEND_RUNBOOK.md](./BACKEND_RUNBOOK.md).

### Known risks if enforced today

- `'unsafe-inline'` / `'unsafe-eval'` are still required by the Vite-hydrated bundle and Lovable injected runtime. Removing them needs a nonce/hash pipeline at build time.
- Any new third-party script (e.g. Plausible, PostHog, GTM) must be added to `script-src` and `connect-src` before enforcement.

## What is intentionally **not** set here

- `Cross-Origin-Embed-Policy: require-corp` — would break cross-origin images (Unsplash, Supabase storage).
- `Cross-Origin-Resource-Policy: same-origin` — would block the OG image and shared assets.
- A stricter `Permissions-Policy` for `clipboard-write` — used by the diagnostics "copy URI" buttons.
