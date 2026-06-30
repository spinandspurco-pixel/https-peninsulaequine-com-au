import { supabase } from "@/integrations/supabase/client";

export type DeployHealthAuditAction =
  | "view_page"
  | "run_checks"
  | "retry_promotion"
  | "copy_escalation_text"
  | "copy_escalation_json"
  | "copy_support_email"
  | "download_escalation_txt"
  | "open_support_email";

export type DeployHealthAuditStatus = "success" | "failure" | "info";

/**
 * Best-effort audit log for admin actions on /hq/deploy-health.
 * RLS enforces admin-only insert; non-admins silently no-op.
 * Never throws — diagnostics must never break the UI.
 */
export async function logDeployHealthAudit(
  action: DeployHealthAuditAction,
  status: DeployHealthAuditStatus,
  detail: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { data: userResult } = await supabase.auth.getUser();
    const user = userResult?.user;
    if (!user) return;
    await supabase.from("deploy_health_audit").insert({
      actor_user_id: user.id,
      actor_email: user.email ?? null,
      action,
      status,
      detail: detail as never,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch {
    /* swallow — audit must never break the page */
  }
}
