/**
 * Verifies that SB_MGMT_ACCESS_TOKEN can read the exact Supabase advisor
 * endpoint used by the security gate.
 *
 * This check is deliberately non-mutating. Supabase fine-grained tokens do
 * not expose a reliable permission-introspection endpoint, so CI must not
 * attempt DELETE or POST requests as capability probes. Least privilege is
 * enforced when the token is minted: advisors_read only, restricted to the
 * production project where available.
 */

import { assertMgmtToken, scrubError } from "./assertMgmtToken.ts";

const API = "https://api.supabase.com";
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "aizkqajrzkvwuobisnzr";
const ADVISOR_PATH = `/v1/projects/${PROJECT_REF}/advisors/security`;

async function main(): Promise<void> {
  const token = assertMgmtToken();
  console.log(`Checking read access to Supabase security advisors for ${PROJECT_REF}…`);

  const res = await fetch(`${API}${ADVISOR_PATH}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  // Drain without logging: API error bodies can contain operational detail.
  await res.text().catch(() => "");

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const { appendFileSync } = await import("node:fs");
    const result = res.ok ? "✅ read access confirmed" : `❌ HTTP ${res.status}`;
    appendFileSync(
      summaryPath,
      [
        "## Management token verification",
        "",
        "| Endpoint | Method | Result |",
        "|---|---|---|",
        `| \`${ADVISOR_PATH}\` | GET | ${result} |`,
        "",
        "Write access is not probed by CI. Confirm the token is minted with only `advisors_read`.",
        "",
      ].join("\n"),
    );
  }

  if (!res.ok) {
    console.error(
      `Token cannot read the security-advisor endpoint (HTTP ${res.status}). ` +
        "Mint a project-restricted token with advisors_read and update SB_MGMT_ACCESS_TOKEN.",
    );
    process.exit(1);
  }

  console.log("✓ Required read-only advisor access confirmed.");
}

main().catch((err) => {
  const safe = scrubError(err);
  console.error(safe.stack ?? safe.message);
  process.exit(1);
});
