// supabase/functions/publish-log-ingest/index.ts
//
// Ingest endpoint for pre-publish gate output (typecheck / lint / test / build /
// publish steps). Authenticated via shared secret `PUBLISH_LOG_INGEST_SECRET`
// passed in the `x-ingest-secret` header. Writes rows into `public.publish_logs`
// using the service-role client. Never returns log contents back — write-only.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type StepKind = "typecheck" | "lint" | "test" | "build" | "publish" | "summary";
type StepStatus = "pass" | "fail" | "skipped" | "info";

type IncomingStep = {
  kind: StepKind;
  status: StepStatus;
  duration_ms?: number;
  log?: string;
  meta?: Record<string, unknown>;
};

type Payload = {
  run_id: string;
  commit_sha?: string;
  branch?: string;
  actor?: string;
  steps: IncomingStep[];
};

const MAX_LOG_BYTES = 200_000;

function trimLog(s: string | undefined): string {
  if (!s) return "";
  if (s.length <= MAX_LOG_BYTES) return s;
  return s.slice(0, MAX_LOG_BYTES) + `\n\n… [truncated ${s.length - MAX_LOG_BYTES} chars]`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const secret = Deno.env.get("PUBLISH_LOG_INGEST_SECRET");
  if (!secret) {
    return new Response(JSON.stringify({ error: "server_misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
  if (req.headers.get("x-ingest-secret") !== secret) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
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

  if (!payload?.run_id || !Array.isArray(payload.steps) || payload.steps.length === 0) {
    return new Response(JSON.stringify({ error: "invalid_payload" }), {
      status: 400,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const rows = payload.steps.map((s) => ({
    run_id: payload.run_id,
    kind: s.kind,
    status: s.status,
    duration_ms: typeof s.duration_ms === "number" ? Math.round(s.duration_ms) : null,
    commit_sha: payload.commit_sha ?? null,
    branch: payload.branch ?? null,
    actor: payload.actor ?? null,
    log: trimLog(s.log),
    meta: s.meta ?? {},
  }));

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.from("publish_logs").insert(rows);
  if (error) {
    return new Response(JSON.stringify({ error: "insert_failed", message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ status: "ok", inserted: rows.length }), {
    status: 200,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});
