/**
 * Persistent ring buffer of OAuth errors observed in the browser.
 *
 * Survives the full-page redirect that OAuth performs, so an error that
 * happens during sign-in is still visible in HQ → Diagnostics afterwards.
 */

const STORAGE_KEY = "pe.oauth.errorLog.v1";
const MAX_ENTRIES = 25;

export type OAuthErrorSource =
  | "login-button"
  | "provider-check"
  | "redirect-validator"
  | "callback";

export type OAuthErrorEntry = {
  ts: number;
  provider: string;
  source: OAuthErrorSource;
  message: string;
  code?: string;
  context?: Record<string, unknown>;
};

export type OAuthFix = {
  title: string;
  steps: string[];
  severity: "fail" | "warn" | "info";
};

function read(): OAuthErrorEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: OAuthErrorEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(-MAX_ENTRIES)),
    );
  } catch {
    /* quota — ignore */
  }
}

export function recordOAuthError(entry: Omit<OAuthErrorEntry, "ts">): void {
  const all = read();
  all.push({ ts: Date.now(), ...entry });
  write(all);
}

export function listOAuthErrors(): OAuthErrorEntry[] {
  return read().slice().reverse(); // newest first
}

export function clearOAuthErrors(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Pattern-match a recorded message against well-known Supabase / Google OAuth
 * failure modes and return prescriptive fix steps.
 */
export function diagnoseOAuthError(entry: OAuthErrorEntry): OAuthFix {
  const msg = (entry.message || "").toLowerCase();
  const code = (entry.code || "").toLowerCase();

  if (msg.includes("missing oauth secret") || code === "missing_oauth_secret") {
    return {
      severity: "fail",
      title: "Google Client Secret is not persisted on the auth service",
      steps: [
        "Open Backend → Users → Auth Settings → Google.",
        "Re-paste the Client ID and Client Secret (no leading/trailing whitespace).",
        "Confirm the success toast appears, then wait ~60 seconds.",
        "Or switch to Lovable-managed Google OAuth to bypass custom credentials.",
        "Re-run the Google OAuth check on this page to confirm PASS.",
      ],
    };
  }

  if (msg.includes("redirect_uri_mismatch") || code === "redirect_uri_mismatch") {
    return {
      severity: "fail",
      title: "Google rejected the redirect URI Supabase sent",
      steps: [
        "Open Google Cloud Console → APIs & Services → Credentials → OAuth client.",
        "Add the exact Supabase callback URI shown in the panel above to “Authorized redirect URIs”.",
        "Save in Google Cloud, wait ~5 minutes for propagation.",
        "Re-run the live validator to confirm the round-trip succeeds.",
      ],
    };
  }

  if (msg.includes("unsupported provider") || msg.includes("provider is not enabled")) {
    return {
      severity: "fail",
      title: "Google provider is not enabled on the backend",
      steps: [
        "Open Backend → Users → Auth Settings → Sign-in methods.",
        "Toggle Google ON and save.",
        "Reload this page and re-run the Google OAuth check.",
      ],
    };
  }

  if (msg.includes("invalid_client") || msg.includes("invalid client")) {
    return {
      severity: "fail",
      title: "Google rejected the Client ID",
      steps: [
        "Verify the Client ID in Backend → Users → Auth Settings → Google matches the one in Google Cloud Console exactly.",
        "Make sure the OAuth client in Google Cloud is type “Web application”.",
        "Confirm the project the Client ID belongs to is not deleted or suspended.",
      ],
    };
  }

  if (msg.includes("access_denied")) {
    return {
      severity: "warn",
      title: "User dismissed Google's consent screen",
      steps: [
        "This is usually a user action, not a misconfiguration.",
        "If it happens for every user, check that the OAuth consent screen in Google Cloud is published (not “Testing” unless the user's email is on the test list).",
      ],
    };
  }

  if (msg.includes("popup") && (msg.includes("block") || msg.includes("closed"))) {
    return {
      severity: "warn",
      title: "Popup was blocked or closed before completion",
      steps: [
        "Allow popups for this origin in the browser.",
        "Retry from the login screen — the broker uses a popup in preview iframes.",
      ],
    };
  }

  if (msg.includes("refresh token")) {
    return {
      severity: "info",
      title: "Session refresh failed",
      steps: [
        "Usually benign — happens after logout or token expiry.",
        "Sign in again. If it persists for every session, check clock skew on the device.",
      ],
    };
  }

  return {
    severity: "warn",
    title: "Unrecognised OAuth error",
    steps: [
      "Copy the raw message and search Lovable / Supabase docs for the exact phrase.",
      "Re-run the Google OAuth provider check above to narrow down whether the failure is at the provider, the redirect URI, or the client.",
    ],
  };
}
