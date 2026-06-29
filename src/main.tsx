import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/blueprint.css";
import { initGA, setAnalyticsConsent, captureLeadSource } from "./lib/analytics";
import { readConsent, onConsentChange } from "./lib/consent";
import { validateSupabaseEnv, renderEnvError } from "./lib/validateEnv";

// Fail loud at boot if the frontend Supabase env vars are missing or malformed.
// A legacy JWT-shaped key (eyJ…) will cause silent 401s — better to surface that
// before any other module imports the Supabase client.
const envProblem = validateSupabaseEnv();
if (envProblem) {
  renderEnvError(envProblem);
} else {
  // GA4 — load gtag with Consent Mode v2 defaults (denied), then sync with stored consent.
  initGA();
  // Capture lead-source attribution (UTM, referrer, landing page) once per session.
  captureLeadSource();
  const stored = readConsent();
  if (stored?.analytics) setAnalyticsConsent(true);
  onConsentChange((state) => setAnalyticsConsent(Boolean(state?.analytics)));

  createRoot(document.getElementById("root")!).render(<App />);
}
