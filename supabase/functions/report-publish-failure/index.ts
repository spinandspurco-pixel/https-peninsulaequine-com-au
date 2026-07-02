// supabase/functions/report-publish-failure/index.ts
//
// Admin-authenticated endpoint to record a publishing failure that happened
// outside the prepublish gate (e.g. an internal error during the hosted
// publish step). Captures timestamp, bundle id, and error message so the
// team can review later and share the record with support.
//
// Writes a single `publish_logs` row per report:
//   kind    = 'publish'
//   status  = 'fail'
//   log     = full error message pasted by the reporter
//   meta    = { source: 'manual_report', bundle_id, reporter_email,
//               user_agent, context, occurred_at }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AttachmentInput = {
  path?: string;
  name?: string;
  size?: number;
  type?: string;
};

type Payload = {
  bundle_id?: string;
  error_message?: string;
  context?: string;
  occurred_at?: string;
  commit_sha?: string;
  branch?: string;
  user_agent?: string;
  attachments?: AttachmentInput[];
};

const MAX_LOG = 20_000;
const MAX_FIELD = 2_000;

function clip(s: string | undefined, max: number): string {
  if (!s) return "";
  const t = String(s);
  return t.length <= max ? t : t.slice(0, max) + "\n\n… [truncated]";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Verify caller identity + admin role via user-scoped client.
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userRes, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userRes?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
  const user = userRes.user;

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: hasRole, error: roleErr } = await admin.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (roleErr || !hasRole) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const errorMessage = clip(payload.error_message, MAX_LOG).trim();
  if (!errorMessage) {
    return new Response(
      JSON.stringify({ error: "error_message_required" }),
      { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  }

  const runId = crypto.randomUUID();
  const occurredAt = payload.occurred_at ?? new Date().toISOString();

  const attachments = Array.isArray(payload.attachments)
    ? payload.attachments
        .filter((a) => a && typeof a.path === "string" && a.path.length > 0)
        .slice(0, 10)
        .map((a) => ({
          path: clip(a.path, 512),
          name: clip(a.name, 255) || null,
          size: typeof a.size === "number" && a.size >= 0 ? a.size : null,
          type: clip(a.type, 128) || null,
        }))
    : [];

  const row = {
    run_id: runId,
    kind: "publish" as const,
    status: "fail" as const,
    duration_ms: null,
    commit_sha: clip(payload.commit_sha, 64) || null,
    branch: clip(payload.branch, 128) || null,
    actor: user.email ?? user.id,
    log: errorMessage,
    meta: {
      source: "manual_report",
      bundle_id: clip(payload.bundle_id, MAX_FIELD) || null,
      context: clip(payload.context, MAX_FIELD) || null,
      user_agent: clip(payload.user_agent, MAX_FIELD) || null,
      reporter_email: user.email ?? null,
      reporter_id: user.id,
      occurred_at: occurredAt,
      attachments,
    },
  };

  const { error: insErr } = await admin.from("publish_logs").insert(row);
  if (insErr) {
    return new Response(
      JSON.stringify({ error: "insert_failed", message: insErr.message }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  }

  // Fire-and-forget admin notification. Never fails the request.
  let notified = false;
  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const toAddr = Deno.env.get("NOTIFICATION_EMAIL");
    const fromAddr =
      Deno.env.get("HQ_EMAIL_FROM") ||
      Deno.env.get("NOREPLY_EMAIL_FROM") ||
      Deno.env.get("FROM_EMAIL");
    if (resendKey && toAddr && fromAddr) {
      const esc = (v: unknown) =>
        String(v ?? "")
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      const subject = `[HQ] Publish failure reported${
        row.meta.bundle_id ? ` · ${String(row.meta.bundle_id).slice(0, 24)}` : ""
      }`;
      const rows: Array<[string, string | null]> = [
        ["Reporter", row.actor ?? null],
        ["Bundle", row.meta.bundle_id],
        ["Commit", row.commit_sha],
        ["Branch", row.branch],
        ["Occurred", occurredAt],
        ["Context", row.meta.context],
        ["Attachments", attachments.length ? String(attachments.length) : null],
      ];
      const html = `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0f172a;max-width:640px">
          <h2 style="font-size:16px;margin:0 0 12px">New publish failure report</h2>
          <table style="border-collapse:collapse;font-size:13px;width:100%">
            ${rows
              .filter(([, v]) => v)
              .map(
                ([k, v]) =>
                  `<tr><td style="padding:4px 8px 4px 0;color:#64748b">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`,
              )
              .join("")}
          </table>
          <h3 style="font-size:13px;margin:16px 0 6px;color:#64748b">Error</h3>
          <pre style="white-space:pre-wrap;background:#f1f5f9;padding:12px;border-radius:6px;font-size:12px;line-height:1.45">${esc(
            errorMessage.slice(0, 4000),
          )}</pre>
          <p style="font-size:12px;color:#64748b;margin-top:16px">Review at /hq/publish-logs · run ${esc(runId)}</p>
        </div>`;
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [toAddr],
          subject,
          html,
        }),
      });
      notified = resp.ok;
      if (!resp.ok) {
        console.error("notify_failed", resp.status, await resp.text());
      }
    }
  } catch (e) {
    console.error("notify_exception", e);
  }

  return new Response(
    JSON.stringify({ status: "ok", run_id: runId, notified }),
    { status: 200, headers: { ...corsHeaders, "content-type": "application/json" } },
  );
});
