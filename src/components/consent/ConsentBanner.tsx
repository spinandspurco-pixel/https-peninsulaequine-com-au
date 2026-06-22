import { useEffect, useState } from "react";
import { CONSENT_STORAGE_KEY, readConsent, writeConsent } from "@/lib/consent";

/**
 * Native, minimal consent banner.
 *
 * Categories:
 *  - Necessary (always on): session, security, preference storage required for the site to function.
 *  - Analytics (opt-in): anonymous usage measurement to improve the site.
 *  - Marketing (opt-in): attribution and remarketing pixels.
 *
 * Surfaces on first visit and whenever a visitor reopens it via the footer
 * "Privacy settings" link (dispatched as the `pe:consent-open` window event).
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Initial decision check
  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      // Delay slightly so it doesn't fight the intro animation
      const t = window.setTimeout(() => setOpen(true), 1200);
      return () => window.clearTimeout(t);
    }
    setAnalytics(existing.analytics);
    setMarketing(existing.marketing);
  }, []);

  // Reopen handler from footer link
  useEffect(() => {
    const onOpen = () => {
      const existing = readConsent();
      if (existing) {
        setAnalytics(existing.analytics);
        setMarketing(existing.marketing);
      }
      setShowDetails(true);
      setOpen(true);
    };
    window.addEventListener("pe:consent-open", onOpen);
    // Cross-tab sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY) {
        const existing = readConsent();
        if (existing) {
          setAnalytics(existing.analytics);
          setMarketing(existing.marketing);
          setOpen(false);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("pe:consent-open", onOpen);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!open) return null;

  const acceptAll = () => {
    writeConsent({ analytics: true, marketing: true });
    setOpen(false);
  };
  const rejectAll = () => {
    writeConsent({ analytics: false, marketing: false });
    setOpen(false);
  };
  const saveSelected = () => {
    writeConsent({ analytics, marketing });
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
      className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl border border-border/40 bg-background/95 backdrop-blur-md shadow-2xl">
        <div className="p-5 sm:p-6">
          <p
            id="consent-title"
            className="text-[10px] uppercase tracking-[0.45em] text-foreground/55"
          >
            Cookies &amp; privacy
          </p>
          <p
            id="consent-desc"
            className="mt-3 text-sm leading-relaxed text-foreground/75 font-light"
          >
            We use a small number of cookies to run this site. Analytics and marketing
            cookies are off by default and only load if you accept them.
          </p>

          {showDetails && (
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground/85">Necessary</p>
                  <p className="text-foreground/60 font-light">
                    Required for navigation, session continuity, and remembering your
                    privacy choice. Always active.
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-[0.3em] text-foreground/50 shrink-0 pt-1">
                  Always on
                </span>
              </li>
              <li className="flex items-start justify-between gap-4">
                <label className="flex-1 cursor-pointer">
                  <p className="font-medium text-foreground/85">Analytics</p>
                  <p className="text-foreground/60 font-light">
                    Anonymous, aggregated usage to understand which pages help and which
                    fail. No profiling of individuals.
                  </p>
                </label>
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-accent"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  aria-label="Allow analytics cookies"
                />
              </li>
              <li className="flex items-start justify-between gap-4">
                <label className="flex-1 cursor-pointer">
                  <p className="font-medium text-foreground/85">Marketing</p>
                  <p className="text-foreground/60 font-light">
                    Attribution and remarketing pixels so we can measure campaigns and
                    reach the right audiences.
                  </p>
                </label>
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-accent"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  aria-label="Allow marketing cookies"
                />
              </li>
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.3em]">
            <button
              type="button"
              onClick={acceptAll}
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Accept all
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Reject all
            </button>
            {showDetails ? (
              <button
                type="button"
                onClick={saveSelected}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                Save choices
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="text-foreground/55 hover:text-foreground/80 transition-colors"
              >
                Customise
              </button>
            )}
            <a
              href="/privacy"
              className="ml-auto text-foreground/55 hover:text-foreground/80 transition-colors normal-case tracking-normal text-xs underline-offset-4 hover:underline"
            >
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
