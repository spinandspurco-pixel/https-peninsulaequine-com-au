// Google Analytics 4 — Consent Mode v2 + lightweight event helpers.
//
// Set your GA4 Measurement ID below (or via VITE_GA_MEASUREMENT_ID).
// While the ID is the placeholder, all GA calls are silent no-ops.
const PLACEHOLDER = "G-XXXXXXXXXX";
export const GA_MEASUREMENT_ID: string =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) || PLACEHOLDER;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialised = false;

function isEnabled() {
  return typeof window !== "undefined" && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== PLACEHOLDER;
}

/** Inject gtag.js and set Consent Mode v2 defaults (denied until user opts in). */
export function initGA() {
  if (initialised || !isEnabled()) return;
  initialised = true;

  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };

  // Consent Mode v2 — default everything to denied. Upgraded via setAnalyticsConsent().
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false, // SPA — we send manually on route change
    anonymize_ip: true,
  });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);
}

/** Upgrade or revoke analytics consent. Call when the user accepts/declines. */
export function setAnalyticsConsent(granted: boolean) {
  if (!isEnabled() || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}

/** Manual page_view for SPA route changes. */
export function trackPageView(path: string, title?: string) {
  if (!isEnabled() || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: title ?? document.title,
  });
}

/** Generic GA4 event. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!isEnabled() || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/* ─── Lead-source attribution ─────────────────────────────────────────────
 * Captured once per session at app boot. Persisted in sessionStorage so the
 * source is still available when the user submits a form several pages later.
 */

export type LeadSource = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  referrer?: string;
  landing_page?: string;
};

const LEAD_SOURCE_KEY = "pe_lead_source";

export function captureLeadSource(): LeadSource {
  if (typeof window === "undefined") return {};
  try {
    const existing = window.sessionStorage.getItem(LEAD_SOURCE_KEY);
    if (existing) return JSON.parse(existing) as LeadSource;
  } catch {
    // sessionStorage unavailable — return what we can derive now.
  }

  const url = new URL(window.location.href);
  const get = (k: string) => url.searchParams.get(k) || undefined;
  const referrer = document.referrer && !document.referrer.includes(window.location.host)
    ? document.referrer
    : undefined;

  const source: LeadSource = {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_term: get("utm_term"),
    utm_content: get("utm_content"),
    gclid: get("gclid"),
    referrer,
    landing_page: window.location.pathname,
  };

  // Drop undefined keys for clean GA params.
  const clean = Object.fromEntries(
    Object.entries(source).filter(([, v]) => v !== undefined && v !== ""),
  ) as LeadSource;

  try {
    window.sessionStorage.setItem(LEAD_SOURCE_KEY, JSON.stringify(clean));
  } catch {
    /* ignore */
  }
  return clean;
}

export function getLeadSource(): LeadSource {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(LEAD_SOURCE_KEY);
    if (raw) return JSON.parse(raw) as LeadSource;
  } catch {
    /* ignore */
  }
  return captureLeadSource();
}

/**
 * Lead conversion. Maps to GA4 recommended `generate_lead` event so it can be
 * marked as a Key Event in the GA4 UI. Automatically merges lead-source params
 * (UTM tags, referrer, landing page) captured at the start of the session.
 */
export function trackConversion(form: string, params: Record<string, unknown> = {}) {
  trackEvent("generate_lead", {
    form_id: form,
    page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
    ...getLeadSource(),
    ...params,
  });
}

/** Fired when a user begins interacting with a lead form. */
export function trackFormStart(form: string, params: Record<string, unknown> = {}) {
  trackEvent("form_start", { form_id: form, ...params });
}

/** Fired when a lead form submission fails on the client. */
export function trackFormError(form: string, reason: string, params: Record<string, unknown> = {}) {
  trackEvent("form_error", { form_id: form, reason, ...params });
}

