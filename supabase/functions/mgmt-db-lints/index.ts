// supabase/functions/mgmt-db-lints/index.ts
//
// Admin-only proxy that calls the Supabase Management API using
// SB_MGMT_ACCESS_TOKEN. Scope: read database linter for this project only.
// See docs/security/sb-mgmt-access-token.md for the endpoint allowlist.
//
// Redacted logging: every console.* call and every response body is passed
// through `redact()` so that the SB_MGMT_ACCESS_TOKEN value (and, defensively,
// the literal env-var name) can never appear in logs or in a client response —
// even if an upstream error echoes the Authorization header back at us.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PROJECT_REF = "aizkqajrzkvwuobisnzr";
const REDACTED = "[REDACTED_MGMT_TOKEN]";
const TOKEN_NAME = "SB_MGMT_ACCESS_TOKEN";

// Endpoints this function is permitted to call. Keep in sync with
// docs/security/sb-mgmt-access-token.md. Any new entry must have a matching
// least-privilege scope on the token.
const ALLOWED_ENDPOINTS = {
  lints: `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/lints`,
} as const;

// Resolve the token once so the sanitiser knows what value to strip.
const MGMT_TOKEN = Deno.env.get(TOKEN_NAME) ?? "";

/**
 * Scrub the token value + env-var name out of any string, Error, or plain
 * object before it leaves the function (log line or HTTP response body).
 * Only strings ≥ 8 chars are replaced — avoids nuking short unrelated
 * substrings if MGMT_TOKEN is misconfigured.
 */
export function redact(value: unknown): unknown {
  const scrubString = (s: string): string => {
    let out = s;
    if (MGMT_TOKEN && MGMT_TOKEN.length >= 8 && out.includes(MGMT_TOKEN)) {
      out = out.split(MGMT_TOKEN).join(REDACTED);
    }
    if (out.includes(TOKEN_NAME)) {
      out = out.split(TOKEN_NAME).join(REDACTED);
    }
    return out;
  };

  if (typeof value === "string") return scrubString(value);
  if (value instanceof Error) {
    const message = scrubString(value.message);
    const clone = new Error(message);
    clone.name = value.name;
    if (typeof value.stack === "string") clone.stack = scrubString(value.stack);
    return clone;
  }
  if (value && typeof value === "object") {
    try {
      const serialised = JSON.stringify(value);
      const scrubbed = scrubString(serialised);
      if (scrubbed !== serialised) return JSON.parse(scrubbed);
      return value;
    } catch {
      return value;
    }
  }
  return value;
}

// Install console sanitiser once per cold start. Any console.log/info/warn/
// error/debug call anywhere in this function (or in libraries it imports)
// will have its arguments run through `redact()` before being emitted.
(function installConsoleSanitiser() {
  const methods = ["log", "info", "warn", "error", "debug"] as const;
  for (const m of methods) {
    const original = console[m].bind(console);
    console[m] = (...args: unknown[]) => original(...args.map(redact));
  }
})();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(redact(body)), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  // 1. Server-side secret. Never returned, never logged.
  if (!MGMT_TOKEN) {
    console.error("mgmt token is not configured");
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
        Authorization: `Bearer ${MGMT_TOKEN}`,
        Accept: "application/json",
      },
    });

    const text = await upstream.text();
    const safeBody = redact(text) as string;

    if (!upstream.ok) {
      // Status only — never the body, which could echo request headers.
      console.error("mgmt api non-ok", upstream.status);
      return json({ error: "mgmt_api_error", status: upstream.status, body: safeBody }, 502);
    }

    return new Response(safeBody, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    // `redact()` clones the Error so the token can't leak via .message/.stack.
    console.error("mgmt api fetch failed", redact(e));
    return json({ error: "mgmt_api_unreachable" }, 502);
  }
});
