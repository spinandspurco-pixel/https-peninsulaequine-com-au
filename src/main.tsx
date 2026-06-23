import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/blueprint.css";
import { initGA, setAnalyticsConsent, captureLeadSource } from "./lib/analytics";
import { readConsent, onConsentChange } from "./lib/consent";

// GA4 — load gtag with Consent Mode v2 defaults (denied), then sync with stored consent.
initGA();
// Capture lead-source attribution (UTM, referrer, landing page) once per session.
captureLeadSource();
const stored = readConsent();
if (stored?.analytics) setAnalyticsConsent(true);
onConsentChange((state) => setAnalyticsConsent(Boolean(state?.analytics)));

createRoot(document.getElementById("root")!).render(<App />);
