import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/blueprint.css";
import { initGA, setAnalyticsConsent } from "./lib/analytics";
import { readConsent, onConsentChange } from "./lib/consent";

// GA4 — load gtag with Consent Mode v2 defaults (denied), then sync with stored consent.
initGA();
const stored = readConsent();
if (stored?.analytics) setAnalyticsConsent(true);
onConsentChange((state) => setAnalyticsConsent(Boolean(state?.analytics)));

createRoot(document.getElementById("root")!).render(<App />);
