/**
 * Local-only diagnostics history for the Google OAuth verification panel.
 *
 * Each entry records one verification attempt: the URL the admin pasted, the
 * parsed `client_id`, the parsed `redirect_uri`, and the resulting match
 * status. Persisted in localStorage under a single key, capped at MAX_ENTRIES.
 *
 * No secrets are stored — Client IDs and redirect URIs are public identifiers
 * and the URL itself is one the admin pasted from their own browser.
 */

export const HISTORY_KEY = "pe.oauth.diagnosticsHistory";
export const MAX_ENTRIES = 25;
const MAX_URL_LEN = 500;

export type OAuthMatchStatus = "ok" | "warn" | "fail" | "info";
export type OAuthRedirectStatus = "ok" | "fail" | "info";

export interface OAuthDiagnosticsEntry {
  ts: number;
  providedUrl: string;
  clientId: string | null;
  redirectUri: string | null;
  intendedClientId: string | null;
  expectedRedirectUri: string | null;
  clientStatus: OAuthMatchStatus;
  redirectStatus: OAuthRedirectStatus;
}

function safeRead(): OAuthDiagnosticsEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is OAuthDiagnosticsEntry =>
        !!e && typeof e === "object" && typeof e.ts === "number",
    );
  } catch {
    return [];
  }
}

function safeWrite(entries: OAuthDiagnosticsEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    /* quota / privacy mode — ignore */
  }
}

export function loadHistory(): OAuthDiagnosticsEntry[] {
  return safeRead().sort((a, b) => b.ts - a.ts);
}

export function appendEntry(
  entry: Omit<OAuthDiagnosticsEntry, "ts"> & { ts?: number },
): OAuthDiagnosticsEntry[] {
  const withTs: OAuthDiagnosticsEntry = {
    ...entry,
    ts: entry.ts ?? Date.now(),
    providedUrl: (entry.providedUrl ?? "").slice(0, MAX_URL_LEN),
  };
  const existing = safeRead();
  // Deduplicate: same providedUrl + same intended within 2s collapses into one row.
  const last = existing[existing.length - 1];
  const isDup =
    last &&
    last.providedUrl === withTs.providedUrl &&
    last.intendedClientId === withTs.intendedClientId &&
    Math.abs(last.ts - withTs.ts) < 2000;
  const next = (isDup ? existing.slice(0, -1) : existing).concat(withTs);
  const trimmed = next.slice(-MAX_ENTRIES);
  safeWrite(trimmed);
  return trimmed.slice().sort((a, b) => b.ts - a.ts);
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

export function historyToJson(entries: OAuthDiagnosticsEntry[]): string {
  return JSON.stringify(
    entries.map((e) => ({
      ts: new Date(e.ts).toISOString(),
      providedUrl: e.providedUrl,
      clientId: e.clientId,
      redirectUri: e.redirectUri,
      intendedClientId: e.intendedClientId,
      expectedRedirectUri: e.expectedRedirectUri,
      clientStatus: e.clientStatus,
      redirectStatus: e.redirectStatus,
    })),
    null,
    2,
  );
}
