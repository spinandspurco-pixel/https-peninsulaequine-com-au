// supabase/functions/mgmt-db-lints/index.ts
//
// Admin-only proxy that calls the Supabase Management API using
// SB_MGMT_ACCESS_TOKEN. Scope: read database linter for this project only.
// See docs/security/sb-mgmt-access-token.md for the endpoint allowlist.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PROJECT_REF = "aizkqajrzkvwuobisnzr";

// Endpoints this function is permitted to call. Keep in sync with
// docs/security/sb-mgmt-access-token.md. Any new entry must have a matching
// least-privilege scope on the token.
const ALLOWED_ENDPOINTS = {
  lints: `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/lints`,
} as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  // 1. Server-side secret. Never returned, never logged.
  const mgmtToken = Deno.env.get("SB_MGMT_ACCESS_TOKEN");
  if (!mgmtToken) {
    console.error("SB_MGMT_ACCESS_TOKEN is not configured");
    return json({ error: "server_misconfigured" }, 500);
  }

  // 2. Admin gate — verify caller is an authenticated admin.
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "unauthenticated" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "unauthenticated" }, 401);

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: isAdmin, error: roleErr } = await adminClient.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (roleErr) {
    console.error("has_role failed", roleErr.message);
    return json({ error: "authz_check_failed" }, 500);
  }
  if (!isAdmin) return json({ error: "forbidden" }, 403);

  // 3. Server-side call to Supabase Management API.
  try {
    const upstream = await fetch(ALLOWED_ENDPOINTS.lints, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${mgmtToken}`,
        Accept: "application/json",
      },
    });

    const text = await upstream.text();
    // Redact the token from any error body before returning/logging.
    const safe = text.replaceAll(mgmtToken, "[REDACTED]");

    if (!upstream.ok) {
      console.error("mgmt api non-ok", upstream.status);
      return json({ error: "mgmt_api_error", status: upstream.status, body: safe }, 502);
    }

    return new Response(safe, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mgmt api fetch failed", (e as Error).message);
    return json({ error: "mgmt_api_unreachable" }, 502);
  }
});
