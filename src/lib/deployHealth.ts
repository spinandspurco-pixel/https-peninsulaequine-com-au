/**
 * Shared deploy-health probe + streak tracking.
 *
 * Used by:
 *  - /hq/deploy-health (full detector page)
 *  - <DeployHealthBanner /> (admin-only sticky chip)
 *
 * Strictly read-only: probes public bundles, never mutates deployments.
 */

const LEGACY_MARKER = "eyJhbGci";
const MODERN_MARKER = "sb_publishable_";
const BUNDLE_RE = /\/assets\/(index-[A-Za-z0-9_-]+\.js)/;

export const DEPLOY_HEALTH_TARGETS = [
  { label: "Custom domain", url: "https://peninsulaequine.systems" },
  { label: "Lovable published", url: "https://https-peninsulaequine-com-au.lovable.app" },
];

const STREAK_KEY = "pe.deployHealth.staleStreak";
const LAST_KEY = "pe.deployHealth.lastCheckedAt";
const LAST_STATE_KEY = "pe.deployHealth.lastState"; // "fresh" | "stale" | "error"
export const ESCALATION_THRESHOLD = 3;

export type ProbeResult = {
  label: string;
  url: string;
  fetchedAt: string;
  ok: boolean;
  bundleFile: string | null;
  bundleUrl: string | null;
  hasLegacyKey: boolean | null;
  hasModernKey: boolean | null;
  bundleBytes: number | null;
  error: string | null;
};

export async function probeTarget(label: string, url: string): Promise<ProbeResult> {
  const fetchedAt = new Date().toISOString();
  try {
    const htmlRes = await fetch(url, { cache: "no-store", mode: "cors" });
    if (!htmlRes.ok) {
      return base(label, url, fetchedAt, `HTTP ${htmlRes.status} on root document`);
    }
    const html = await htmlRes.text();
    const match = html.match(BUNDLE_RE);
    if (!match) return base(label, url, fetchedAt, "No /assets/index-*.js reference found");
    const bundleFile = match[1];
    const bundleUrl = new URL(`/assets/${bundleFile}`, url).toString();
    const jsRes = await fetch(bundleUrl, { cache: "no-store", mode: "cors" });
    if (!jsRes.ok) {
      return { ...base(label, url, fetchedAt, `HTTP ${jsRes.status} fetching bundle`), bundleFile, bundleUrl };
    }
    const js = await jsRes.text();
    return {
      label, url, fetchedAt, ok: true,
      bundleFile, bundleUrl,
      hasLegacyKey: js.includes(LEGACY_MARKER),
      hasModernKey: js.includes(MODERN_MARKER),
      bundleBytes: js.length,
      error: null,
    };
  } catch (e: unknown) {
    return base(label, url, fetchedAt, e instanceof Error ? e.message : String(e));
  }
}

function base(label: string, url: string, fetchedAt: string, error: string): ProbeResult {
  return {
    label, url, fetchedAt, ok: false,
    bundleFile: null, bundleUrl: null,
    hasLegacyKey: null, hasModernKey: null, bundleBytes: null,
    error,
  };
}

export function isStuck(r: ProbeResult): boolean {
  if (!r.ok) return false;
  return r.hasLegacyKey === true || r.hasModernKey === false;
}

export type StreakState = {
  streak: number;
  lastCheckedAt: string | null;
  lastState: "fresh" | "stale" | "error" | null;
};

export function readStreak(): StreakState {
  if (typeof localStorage === "undefined") {
    return { streak: 0, lastCheckedAt: null, lastState: null };
  }
  const streak = Number(localStorage.getItem(STREAK_KEY) ?? "0") || 0;
  const lastCheckedAt = localStorage.getItem(LAST_KEY);
  const lastState = localStorage.getItem(LAST_STATE_KEY) as StreakState["lastState"];
  return { streak, lastCheckedAt, lastState };
}

/** Update the persisted streak based on a batch of probe results. */
export function recordResults(results: ProbeResult[]): StreakState {
  const now = new Date().toISOString();
  const anyStuck = results.some(isStuck);
  const allErrored = results.length > 0 && results.every((r) => !r.ok);
  const state: StreakState["lastState"] = anyStuck ? "stale" : allErrored ? "error" : "fresh";

  let streak = readStreak().streak;
  if (state === "stale") streak += 1;
  else if (state === "fresh") streak = 0;
  // "error" → leave streak as-is (probably CORS / offline, not stale)

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STREAK_KEY, String(streak));
    localStorage.setItem(LAST_KEY, now);
    localStorage.setItem(LAST_STATE_KEY, state ?? "");
  }
  return { streak, lastCheckedAt: now, lastState: state };
}

export async function runProbes(): Promise<{ results: ProbeResult[]; streak: StreakState }> {
  const results = await Promise.all(DEPLOY_HEALTH_TARGETS.map((t) => probeTarget(t.label, t.url)));
  const streak = recordResults(results);
  return { results, streak };
}
