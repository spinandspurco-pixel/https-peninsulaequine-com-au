/**
 * Check read access to the security gate's exact advisor endpoint.
 * This does not prove the absence of other permissions. Review the scoped
 * token in Supabase: Advisors Read only, restricted to the production project.
 * Never issue mutating capability probes against production.
 */
import { assertMgmtToken, scrubError } from "./assertMgmtToken.ts";
import { assertMgmtCall } from "./mgmtApiGuard.ts";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "mxjuknqwzbvvmmdrvkql";

async function main(): Promise<void> {
  const token = assertMgmtToken();
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/advisors/security`;
  assertMgmtCall(url, "GET");
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30_000),
    redirect: "error",
  });
  await response.body?.cancel();
  if (!response.ok) throw new Error(`Advisor read access unavailable: HTTP ${response.status} (project ${PROJECT_REF})`);

  const lines = [
    "## Supabase advisor read access",
    `- Project: \`${PROJECT_REF}\``,
    `- GET advisor endpoint: HTTP ${response.status}`,
    "- Read access confirmed. The security gate must still validate and compare the scan response.",
    "- Additional token permissions cannot be inferred from this read; review the token's Supabase configuration.",
  ];
  console.log(lines.join("\n"));
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
  }
}

main().catch((err) => {
  console.error(scrubError(err).message);
  process.exit(1);
});
