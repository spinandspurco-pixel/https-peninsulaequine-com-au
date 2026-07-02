# Authentication Bridge & Blueprint Audit Implementation

This document summarizes the implementations from the Peninsula Equine Audit Report addressing authentication, styling, and motion consistency.

## Overview

The audit identified three primary areas for improvement:

1. **Legacy API Authentication Handshake** — Modern frontend struggling with outdated backend protocol
2. **Visual Cleanup** — Legacy red text/error styling breaking Blueprint aesthetic
3. **Motion Consistency** — Ensuring animation timing across public and HQ ecosystems

## What Was Implemented

### 1. Server-Side Authentication Adapter

**File:** `/api/auth/login.ts`

A Vercel serverless function that acts as a secure intermediary between the modern frontend and legacy API.

**Why it matters:**
- Eliminates CORS errors (request originates from Vercel server, not browser)
- Controls request format precisely (form-encoded vs JSON)
- Handles cookie/session negotiation server-side
- Provides a single point to debug auth failures

**How it works:**
1. Frontend sends JSON credentials to `/api/auth/login`
2. Bridge converts to legacy format (form-encoded)
3. Bridge injects required headers (`X-Requested-With`, `Content-Type`)
4. Bridge captures response and passes cookies back to frontend

**Configuration:**

Add to `.env.local`:
```
LEGACY_API_URL=https://your-legacy-api-domain.com
LEGACY_API_KEY=your_api_key_if_needed
```

Update the endpoint path in `/api/auth/login.ts` if needed:
```typescript
const LEGACY_API_LOGIN_PATH = "/login"; // Change if different
```

### 2. Blueprint Alert Tokens & Red Text Override

**Files:**
- `/src/index.css` — Added alert color tokens + global override
- Tokens: `--bp-alert-color`, `--bp-alert-danger`, `--bp-alert-warning`, `--bp-alert-info`

**Global CSS Override Catches:**
- `[class*="error"]` — Any element with "error" in class name
- `[class*="alert"]` — Any element with "alert" in class name
- `[class*="danger"]` — Any element with "danger" in class name
- `[class*="warning"]` — Any element with "warning" in class name
- `[style*="color: red"]` — Inline red text styles
- `.legacy-red-text`, `.alert-danger` — Explicit legacy classes

**Colors:**
- `--bp-alert-danger`: Muted warm-amber (HSL 35 42% 48%) — on-brand, not jarring
- `--bp-alert-warning`: Soft amber-gold (HSL 30 50% 52%)
- `--bp-alert-info`: Cool slate-blue (HSL 220 50% 55%)

All automatically applied via `!important` to override legacy styles.

### 3. Animation Constants Module

**File:** `/src/lib/animationConstants.ts`

Centralized motion language ensuring HQ and public sites move in perfect synchronization.

**Exports:**

```typescript
import { ANIMATION_TIMING, buildTransition, getStaggerDelay } from '@/lib/animationConstants';

// Easing functions
ANIMATION_TIMING.ease.default        // cubic-bezier(0.22, 1, 0.36, 1)
ANIMATION_TIMING.ease.draw           // cubic-bezier(0.45, 0, 0.15, 1)
ANIMATION_TIMING.ease.settle         // cubic-bezier(0.25, 0.1, 0.2, 1)

// Durations (ms)
ANIMATION_TIMING.duration.fast       // 300ms
ANIMATION_TIMING.duration.normal     // 800ms
ANIMATION_TIMING.duration.cinematic  // 1200ms

// Stagger intervals
ANIMATION_TIMING.stagger.card        // 120ms
ANIMATION_TIMING.stagger.section     // 200ms

// Transform distances
ANIMATION_TIMING.distance.sm         // 6px
ANIMATION_TIMING.distance.md         // 12px

// Helper functions
buildTransition('opacity', 'normal', 'default')  // "opacity 800ms cubic-bezier(...)"
getStaggerDelay('section', 2)                    // "400ms"
```

### 4. Layout Shift Prevention

**File:** `/src/index.css`

Updated `.pe-reveal` class to include `min-height` support:

```css
.pe-reveal {
  min-height: var(--reveal-min-height, auto);
  /* Prevents "jumping" during stagger reveal */
}
```

**Usage:**
```jsx
<div className="pe-reveal" style={{ "--reveal-min-height": "200px" }}>
  {/* Content */}
</div>
```

## Integration Guide

### Step 1: Update Environment

Add to `.env.local`:
```
LEGACY_API_URL=https://your-legacy-api-domain.com
```

### Step 2: Use the Auth Bridge

**Example Component:**
See `/src/components/auth/HQAuthBridge.tsx` for a complete login form example.

**Simple Integration:**
```typescript
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // Critical: sends/receives cookies
  body: JSON.stringify({ username, password }),
});

const data = await response.json();
if (response.ok) {
  // Success — token in data.token
} else {
  // Error — message in data.error
}
```

### Step 3: Verify Blueprint Alert Styling

1. Right-click on any error/alert element → Inspect
2. Check Styles tab — should see override from `/src/index.css`
3. Computed tab — color should be `hsl(35 42% 48%)` (muted amber)

### Step 4: Use Animation Constants

```typescript
import { ANIMATION_TIMING, buildTransition } from '@/lib/animationConstants';

// In your component
style={{
  transition: buildTransition('opacity', 'normal', 'default'),
  // → "opacity 800ms cubic-bezier(0.22, 1, 0.36, 1)"
}}
```

## Debugging the "401 Unauthorized" Error

### Network Inspection

1. **Open Browser DevTools** (F12)
2. **Network Tab** → Attempt login
3. Look for `/api/auth/login` request
4. **Response Status:**
   - `200` → Success (check Response body)
   - `401/403` → Credentials rejected by legacy API
   - `500` → Bridge error (check server logs)

### Check Response Headers

1. Click the failed request
2. **Response Headers** section
3. Look for `WWW-Authenticate` header:
   - `Basic` → Legacy expects HTTP Basic auth
   - `Bearer` → Legacy expects JWT tokens
   - `Digest` → Legacy uses old digest auth

### Compare with Successful Legacy Request

1. Log in to the legacy site directly
2. Network tab → capture successful login request
3. Compare headers with bridge request
4. Missing headers? Add them to `/api/auth/login.ts`

### Vercel Logs

1. Vercel Dashboard → your deployment
2. View logs during login attempt
3. Look for `[auth-adapter]` console messages
4. These show exact request being sent to legacy API

## Common Fixes

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check WWW-Authenticate header; add missing Authorization header |
| CORS Error | Bridge should bypass — verify `/api/auth/login` is being called |
| Cookies not persisting | Frontend must use `credentials: 'include'` in fetch |
| Wrong format | Try both form-encoded and JSON formats; log in bridge to test |
| Credentials rejected | Compare legacy request headers with bridge; add custom headers as needed |

## Files Changed

```
api/auth/login.ts                    — New: Server-side auth bridge
src/components/auth/HQAuthBridge.tsx — New: Example login component
src/lib/animationConstants.ts        — New: Unified motion language
src/lib/authAdapterIntegration.ts    — New: Integration guide & examples
src/index.css                        — Updated: Alert tokens + override styles
```

## Testing Checklist

- [ ] Auth bridge deploys to Vercel without errors
- [ ] Network tab shows `/api/auth/login` request
- [ ] Legacy API receives form-encoded credentials
- [ ] Cookies are passed back to frontend
- [ ] Red text/alerts appear in Blueprint colors
- [ ] Animation timing feels synchronized between public and HQ
- [ ] Layout doesn't shift during `.pe-reveal` animations
- [ ] Reduced motion preference respected
- [ ] High contrast mode shows readable alert colors

## Next Steps

1. **Configure Legacy API URL** in environment variables
2. **Update headers in `/api/auth/login.ts`** if legacy API requires custom auth
3. **Test with staging environment** before production deployment
4. **Monitor Vercel logs** for auth-adapter messages during testing
5. **Update login UI** to use `HQAuthBridge` component or similar

## Additional Resources

- `/src/lib/authAdapterIntegration.ts` — Detailed integration examples
- `/api/auth/login.ts` — Full source with inline documentation
- `/src/components/auth/HQAuthBridge.tsx` — Complete working example
