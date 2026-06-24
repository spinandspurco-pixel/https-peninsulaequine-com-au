// Google Ads conversion helpers (gtag.js).
// The base gtag loader + AW-18258586668 config live in index.html.

// Window.gtag / dataLayer are already declared globally in src/lib/analytics.ts.


function fire(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const g = window.gtag;
  if (typeof g === "function") {
    try {
      g(...args);
    } catch {
      /* swallow — analytics must never break the UI */
    }
  }
}

/** Contact Us conversion (fired on /contact page view). */
export function trackContactConversion() {
  fire("event", "ads_conversion_Contact_Us_1", {});
}

/** Request Quote conversion (fired on /estimate page view). */
export function trackQuoteConversion() {
  fire("event", "conversion", {
    send_to: "AW-18258586668/T_87CMHu_8McEKzYr4JE",
  });
}
