/**
 * AUTHENTICATION ADAPTER INTEGRATION GUIDE
 *
 * This document explains how to integrate the server-side auth bridge
 * with your modern frontend authentication system.
 *
 * Files:
 * - `/api/auth/login.ts` — Server-side bridge to legacy API
 * - `/src/lib/animationConstants.ts` — Unified motion language
 * - `/src/index.css` — Blueprint alert tokens + legacy text override
 */

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: Update Environment Variables
// ═══════════════════════════════════════════════════════════════════════════

// Add to your `.env.local` (never commit this file):
//
//   LEGACY_API_URL=https://your-legacy-api-domain.com
//   LEGACY_API_KEY=your_api_key_if_needed
//   NODE_ENV=development
//

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: Frontend Integration Example
// ═══════════════════════════════════════════════════════════════════════════

import type { OAuthAttemptResult } from "@/lib/oauthSignIn";

export type HQLoginAttemptResult =
  | { kind: "ok"; token: string; user: string }
  | { kind: "error"; message: string; transient: boolean };

/**
 * Attempt HQ login via the authentication bridge.
 * The frontend sends credentials to /api/auth/login (your Vercel function).
 * The bridge translates them to the legacy API's format.
 */
export async function attemptHQLogin(
  username: string,
  password: string,
  opts: { maxAttempts?: number; backoffMs?: number } = {}
): Promise<HQLoginAttemptResult> {
  const max = Math.max(1, opts.maxAttempts ?? 2);
  const backoff = Math.max(0, opts.backoffMs ?? 400);
  let lastError = "";

  for (let attempt = 1; attempt <= max; attempt++) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: send cookies back to browser
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        lastError = data.error || "Authentication failed";
        // Check if error is transient (network/5xx) or permanent (401/403)
        const isTransient = response.status >= 500;
        if (!isTransient) {
          return { kind: "error", message: lastError, transient: false };
        }
      } else {
        // Success — extract token and user from legacy response
        return {
          kind: "ok",
          token: data.token || data.sessionId || "",
          user: data.user || data.username || username,
        };
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }

    // Retry with linear backoff on transient failures
    if (attempt < max) {
      await new Promise((r) => setTimeout(r, backoff * attempt));
    }
  }

  return {
    kind: "error",
    message: lastError || "Login failed after retries",
    transient: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: Debug the Handshake
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Debugging Checklist:
 *
 * 1. Browser Network Tab
 *    - F12 → Network tab
 *    - Attempt login
 *    - Look for `/api/auth/login` request (status should be 200 for success)
 *    - If 401/403, the legacy API rejected the credentials
 *    - Check "Response" tab for error details
 *
 * 2. Response Headers (WWW-Authenticate)
 *    - Click failed request
 *    - Response Headers section
 *    - If "WWW-Authenticate: Basic" → legacy expects HTTP Basic auth
 *    - If "WWW-Authenticate: Bearer" → legacy expects JWT tokens
 *    - If "WWW-Authenticate: Digest" → legacy uses old digest auth
 *    → Add appropriate header handling to /api/auth/login.ts
 *
 * 3. Vercel Deployment Logs
 *    - Go to Vercel Dashboard → your deployment
 *    - View logs during login attempt
 *    - Look for [auth-adapter] console.log messages
 *    - These show the exact request being sent to legacy API
 *
 * 4. Compare with Working Legacy Request
 *    - Log in to the legacy site directly
 *    - Open Network tab
 *    - Note the exact headers, cookies, and body format
 *    - Copy any headers missing from the bridge
 *    → Update /api/auth/login.ts headers block
 *
 * 5. Test with curl (from Vercel server context)
 *    - Add this to /api/auth/login.ts temporarily:
 *      console.log("Testing legacy endpoint...");
 *      const testFetch = await fetch(legacyUrl, {...});
 *      console.log("Status:", testFetch.status);
 *    - Deploy and watch logs
 *    - Should show actual legacy response
 */

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4: Fixing Common 401 Errors
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Common Fixes:
 *
 * ERROR: 401 Unauthorized
 * FIX 1: Missing X-Requested-With header
 *   → Already included in /api/auth/login.ts
 *   → Legacy often strips CORS preflight without this
 *
 * FIX 2: Wrong Content-Type
 *   → Try: "application/x-www-form-urlencoded" (default in bridge)
 *   → Or try: "application/json" + JSON.stringify(body)
 *   → Update the headers and body in /api/auth/login.ts
 *
 * FIX 3: Missing Authorization header
 *   → Uncomment in /api/auth/login.ts:
 *      "Authorization": req.headers.authorization || ""
 *   → Or use Basic auth: "Authorization": `Basic ${btoa(username:password)}`
 *
 * FIX 4: Cookies not being passed
 *   → Legacy API may require session cookie from initial handshake
 *   → The bridge captures Set-Cookie headers
 *   → Frontend must use credentials: 'include' in fetch
 *   → Already done in attemptHQLogin() example above
 *
 * FIX 5: CORS still failing
 *   → This means the legacy API is still seeing browser origin
 *   → Verify /api/auth/login.ts is being called (check Network tab)
 *   → If legacy API sends CORS headers, the bridge should bypass
 *   → If issue persists, legacy may require preflight auth
 */

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5: Using Animation Constants for Consistent Motion
// ═══════════════════════════════════════════════════════════════════════════

import { ANIMATION_TIMING, buildTransition } from "@/lib/animationConstants";

/**
 * Example: HQ login form with Blueprint-consistent motion
 */
export function HQLoginForm() {
  return (
    <form
      style={{
        "--reveal-min-height": "400px", // Prevents layout shift during animation reveal
      } as React.CSSProperties}
      className="pe-reveal"
    >
      <input
        type="text"
        placeholder="Username"
        style={{
          transition: buildTransition("border-color", "fast", "interactive"),
        }}
      />
      <input
        type="password"
        placeholder="Password"
        style={{
          transition: buildTransition("border-color", "fast", "interactive"),
        }}
      />
      <button
        style={{
          transition: buildTransition("background-color", "fast", "interactive"),
        }}
      >
        Sign In
      </button>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 6: Layout Shift Prevention
// ═══════════════════════════════════════════════════════════════════════════

/**
 * To prevent "jumping" during animation reveal:
 *
 * 1. Set min-height on reveal containers:
 *    <div className="pe-reveal" style={{ "--reveal-min-height": "200px" }}>
 *      {/* content */}
 *    </div>
 *
 * 2. Or use data attribute (update CSS if needed):
 *    <div className="pe-reveal" data-min-height="200px">
 *      {/* content */}
 *    </div>
 *
 * 3. Best practice: Calculate min-height based on content:
 *    - Measure tallest variant of content
 *    - Set that as min-height
 *    - Allows stagger without layout recalculation
 */

// ═══════════════════════════════════════════════════════════════════════════
// STEP 7: Verify Blueprint Alert Styling
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The global CSS override now catches:
 * - Any element with class containing "error"
 * - Any element with class containing "alert"
 * - Any element with class containing "danger"
 * - Any inline style with "color: red"
 *
 * All are automatically replaced with Blueprint alert colors:
 * - --bp-alert-danger: muted warm-amber (on-brand, not jarring)
 * - --bp-alert-warning: soft amber-gold
 * - --bp-alert-info: cool slate-blue
 *
 * To verify in your browser:
 * - Right-click on red text → Inspect
 * - Styles tab → look for the overrides from index.css
 * - Computed tab → verify final color is hsl(35 42% 48%)
 */

export default function AuthAdapterIntegrationGuide() {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>🔐 Authentication Adapter Integration</h1>
      <p>See comments above for step-by-step integration instructions.</p>
      <p>
        API Bridge: <code>/api/auth/login</code>
      </p>
      <p>
        Animation Constants: <code>@/lib/animationConstants</code>
      </p>
      <p>
        Blueprint Tokens: Added to <code>src/index.css</code>
      </p>
    </div>
  );
}
