/**
 * Startup validation for frontend Supabase env vars.
 *
 * The frontend MUST ship the new `sb_publishable_…` key format.
 * Legacy JWT-shaped anon keys (`eyJ…`) cause 401s once the platform
 * rotates legacy keys out — see README §7 and OPS_ALERTS history.
 *
 * If the key is missing or malformed we render a full-screen error
 * panel into #root and stop the React mount. Better to fail loud at
 * boot than to ship a broken bundle to clients.
 */

const SB_PUBLISHABLE_PREFIX = "sb_publishable_";
const LEGACY_JWT_PREFIX = "eyJ";

type EnvProblem = {
  title: string;
  detail: string;
  fix: string;
};

export function validateSupabaseEnv(): EnvProblem | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

  if (!url) {
    return {
      title: "VITE_SUPABASE_URL is missing",
      detail: "The frontend cannot reach the backend without a project URL.",
      fix: "Set VITE_SUPABASE_URL in your hosting environment (Vercel → Settings → Environment Variables) for Production and Preview, then redeploy.",
    };
  }

  if (!key) {
    return {
      title: "VITE_SUPABASE_PUBLISHABLE_KEY is missing",
      detail: "The frontend has no publishable key to authenticate API calls.",
      fix: "Copy the sb_publishable_… value from Lovable → Cloud → Backend → API Keys and set it as VITE_SUPABASE_PUBLISHABLE_KEY in your hosting environment for Production and Preview, then redeploy.",
    };
  }

  if (key.startsWith(LEGACY_JWT_PREFIX)) {
    // Legacy JWT anon keys remain VALID for un-migrated Lovable Cloud projects.
    // Surface a console warning but do NOT block boot.
     
    console.warn(
      "[Peninsula Equine] Legacy JWT-format Supabase key in use. This is valid for unmigrated projects; migrate via Rotate API keys when ready.",
    );
    return null;
  }

  if (!key.startsWith(SB_PUBLISHABLE_PREFIX)) {
    return {
      title: "Unrecognised Supabase publishable key format",
      detail: `VITE_SUPABASE_PUBLISHABLE_KEY must start with "${SB_PUBLISHABLE_PREFIX}" or the legacy "${LEGACY_JWT_PREFIX}" JWT prefix. Got: "${key.slice(0, 12)}…"`,
      fix: "Copy the correct publishable key from Lovable → Cloud → Backend → API Keys and replace it in your hosting environment, then redeploy.",
    };
  }

  return null;
}

export function renderEnvError(problem: EnvProblem): void {
   
  console.error(
    `[Peninsula Equine] Frontend boot blocked: ${problem.title}\n${problem.detail}\nFix: ${problem.fix}`,
  );

  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML = `
    <div style="
      min-height: 100vh;
      background: #0a0a0a;
      color: #e8e6e1;
      font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    ">
      <div style="max-width: 640px; width: 100%;">
        <div style="
          font-size: 0.7rem;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          opacity: 0.5;
          margin-bottom: 1.5rem;
        ">Peninsula Equine · Configuration error</div>
        <h1 style="
          font-family: ui-serif, Georgia, serif;
          font-size: 2rem;
          line-height: 1.15;
          margin: 0 0 1.25rem;
          font-weight: 400;
        ">${escapeHtml(problem.title)}</h1>
        <p style="
          font-size: 0.95rem;
          line-height: 1.55;
          opacity: 0.75;
          margin: 0 0 1.5rem;
          font-weight: 300;
        ">${escapeHtml(problem.detail)}</p>
        <div style="
          border-top: 1px solid rgba(232,230,225,0.12);
          padding-top: 1.5rem;
        ">
          <div style="
            font-size: 0.65rem;
            letter-spacing: 0.4em;
            text-transform: uppercase;
            opacity: 0.45;
            margin-bottom: 0.6rem;
          ">Fix</div>
          <p style="
            font-size: 0.9rem;
            line-height: 1.55;
            opacity: 0.85;
            margin: 0 0 1.75rem;
            font-weight: 300;
          ">${escapeHtml(problem.fix)}</p>
          <a href="/hq/diagnostics" style="
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            font-size: 0.7rem;
            letter-spacing: 0.35em;
            text-transform: uppercase;
            color: #c9a961;
            text-decoration: none;
            border-bottom: 1px solid rgba(201,169,97,0.4);
            padding-bottom: 0.35rem;
            font-weight: 400;
          ">Open Diagnostics Panel →</a>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
