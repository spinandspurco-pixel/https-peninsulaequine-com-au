// Lightweight consent store. Categories beyond "necessary" are opt-in.
export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string; // ISO timestamp
  version: number;
}

export const CONSENT_STORAGE_KEY = "pe.consent.v1";
export const CONSENT_VERSION = 1;
const EVENT_NAME = "pe:consent-change";

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(partial: Omit<ConsentState, "necessary" | "decidedAt" | "version"> & { analytics: boolean; marketing: boolean }) {
  const state: ConsentState = {
    necessary: true,
    analytics: partial.analytics,
    marketing: partial.marketing,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent<ConsentState>(EVENT_NAME, { detail: state }));
  } catch {
    /* storage blocked — fall through */
  }
  return state;
}

export function clearConsent() {
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }));
  } catch {
    /* noop */
  }
}

export function onConsentChange(cb: (state: ConsentState | null) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<ConsentState | null>).detail ?? null);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

export function openConsentManager() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("pe:consent-open"));
}
