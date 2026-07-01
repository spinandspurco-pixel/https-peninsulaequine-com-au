// supabase/functions/mgmt-db-lints/index.ts
//
// Admin-only proxy that calls the Supabase Management API using
// SB_MGMT_ACCESS_TOKEN. Scope: read database linter for this project only.
// See docs/security/sb-mgmt-access-token.md for the endpoint allowlist.
//
// Response envelope (v1) — every response, success or error, has this shape:
//
//   {
//     "status": "ok" | "error",
//     "request": {
//       "endpoint":    "lints",           // logical name of the upstream call
//       "project_ref": "<ref>",           // project the lints were fetched for
//       "fetched_at":  "<ISO-8601>",      // when the response was assembled
//       "duration_ms": <number>           // upstream round-trip (0 if skipped)
//     },
//     "lints": Lint[],                    // always present; [] on error
//     "error": { "code": string, "message": string, "upstream_status"?: number }
//                                         // present iff status === "error"
//   }
//
// Redacted logging: every console.* call and every response body is passed
// through `redact()` so that the SB_MGMT_ACCESS_TOKEN value (and, defensively,
// the literal env-var name) can never appear in logs or in a client response —
// even if an upstream error echoes the Authorization header back at us.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { assertMgmtCall, MgmtApiGuardError } from "../_shared/mgmtApiGuard.ts";

const PROJECT_REF = "aizkqajrzkvwuobisnzr";
const REDACTED = "[REDACTED_MGMT_TOKEN]";
const TOKEN_NAME = "SB_MGMT_ACCESS_TOKEN";
export const RESPONSE_ENVELOPE_VERSION = 1;

// Endpoints this function is permitted to call. Keep in sync with
// docs/security/sb-mgmt-access-token.md. Any new entry must have a matching
// least-privilege scope on the token.
const ALLOWED_ENDPOINTS = {
  lints: `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/lints`,
} as const;

type EndpointName = keyof typeof ALLOWED_ENDPOINTS;

export type Lint = {
  name?: string;
  title?: string;
  level?: string;
  facing?: string;
  categories?: string[];
  description?: string;
  detail?: string;
  remediation?: string | null;
  metadata?: Record<string, unknown> | null;
  cache_key?: string;
};

export type ResponseEnvelope = {
  status: "ok" | "error";
  request: {
    endpoint: EndpointName;
    project_ref: string;
    fetched_at: string;
    duration_ms: number;
  };
  lints: Lint[];
  error?: { code: string; message: string; upstream_status?: number };
};

/**
 * Scrub the token value + env-var name out of any string, Error, or plain
 * object before it leaves the function (log line or HTTP response body).
 */
export function redact(value: unknown): unknown {
  const token = Deno.env.get(TOKEN_NAME) ?? "";
  const scrubString = (s: string): string => {
    let out = s;
    if (token && token.length >= 8 && out.includes(token)) {
      out = out.split(token).join(REDACTED);
    }
    if (out.includes(TOKEN_NAME)) {
      out = out.split(TOKEN_NAME).join(REDACTED);
    }
    return out;
  };

  const scrubValue = (v: unknown, seen: WeakSet<object>): unknown => {
    if (typeof v === "string") return scrubString(v);
    if (v instanceof Error) {
      const message = scrubString(v.message ?? "");
      const clone = new Error(message);
      clone.name = v.name;
      if (typeof v.stack === "string") clone.stack = scrubString(v.stack);
      const cause = (v as { cause?: unknown }).cause;
      if (cause !== undefined) {
        (clone as { cause?: unknown }).cause = scrubValue(cause, seen);
      }
      return clone;
    }
    if (v && typeof v === "object") {
      if (seen.has(v as object)) return v;
      seen.add(v as object);
      try {
        const serialised = JSON.stringify(v);
        const scrubbed = scrubString(serialised);
        if (scrubbed !== serialised) return JSON.parse(scrubbed);
        return v;
      } catch {
        return v;
      }
    }
    return v;
  };

  return scrubValue(value, new WeakSet());
}

// Install console sanitiser once per cold start.
(function installConsoleSanitiser() {
  const methods = ["log", "info", "warn", "error", "debug"] as const;
  for (const m of methods) {
    const original = console[m].bind(console);
    console[m] = (...args: unknown[]) => original(...args.map(redact));
  }
})();

(function installGlobalErrorHandlers() {
  const emit = (label: string, err: unknown) => {
    const safe = redact(err);
    const line =
      safe instanceof Error
        ? `${label}: ${safe.stack ?? safe.message}`
        : `${label}: ${typeof safe === "string" ? safe : JSON.stringify(safe)}`;
    try {
      Deno.stderr.writeSync(new TextEncoder().encode(line + "\n"));
    } catch {
      // best-effort
    }
  };
  globalThis.addEventListener("error", (ev) => {
    emit("uncaught_error", (ev as ErrorEvent).error ?? (ev as ErrorEvent).message);
  });
  globalThis.addEventListener("unhandledrejection", (ev) => {
    ev.preventDefault();
    emit("unhandled_rejection", (ev as PromiseRejectionEvent).reason);
  });
})();

function buildRequestMeta(
  endpoint: EndpointName,
  startedAt: number,
): ResponseEnvelope["request"] {
  return {
    endpoint,
    project_ref: PROJECT_REF,
    fetched_at: new Date().toISOString(),
    duration_ms: Math.max(0, Math.round(performance.now() - startedAt)),
  };
}

function ok(endpoint: EndpointName, startedAt: number, lints: Lint[]): Response {
  const body: ResponseEnvelope = {
    status: "ok",
    request: buildRequestMeta(endpoint, startedAt),
    lints,
  };
  return new Response(JSON.stringify(redact(body)), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-Envelope-Version": String(RESPONSE_ENVELOPE_VERSION),
    },
  });
}

function fail(
  endpoint: EndpointName,
  startedAt: number,
  httpStatus: number,
  code: string,
  message: string,
  upstreamStatus?: number,
): Response {
  const body: ResponseEnvelope = {
    status: "error",
    request: buildRequestMeta(endpoint, startedAt),
    lints: [],
    error: {
      code,
      message,
      ...(upstreamStatus !== undefined ? { upstream_status: upstreamStatus } : {}),
    },
  };
  return new Response(JSON.stringify(redact(body)), {
    status: httpStatus,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "X-Envelope-Version": String(RESPONSE_ENVELOPE_VERSION),
    },
  });
}

/**
 * The upstream returns either a bare array of lints, or a wrapped shape.
 * Normalise to Lint[]; anything unrecognised becomes [].
 */
function normaliseLints(raw: unknown): Lint[] {
  if (Array.isArray(raw)) return raw as Lint[];
  if (raw && typeof raw === "object") {
    const maybe = (raw as { lints?: unknown }).lints;
    if (Array.isArray(maybe)) return maybe as Lint[];
  }
  return [];
}

export async function handler(req: Request): Promise<Response> {
  const endpoint: EndpointName = "lints";
  const startedAt = performance.now();

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return fail(endpoint, startedAt, 405, "method_not_allowed", "Only GET is supported.");
  }

  const mgmtToken = Deno.env.get(TOKEN_NAME);
  if (!mgmtToken) {
    console.error("mgmt token is not configured");
    return fail(
      endpoint,
      startedAt,
      500,
      "server_misconfigured",
      "Management token is not configured on the server.",
    );
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) {
    return fail(endpoint, startedAt, 401, "unauthenticated", "Missing bearer token.");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return fail(endpoint, startedAt, 401, "unauthenticated", "Invalid session.");
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: isAdmin, error: roleErr } = await adminClient.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (roleErr) {
    console.error("has_role failed", roleErr.message);
    return fail(
      endpoint,
      startedAt,
      500,
      "authz_check_failed",
      "Failed to verify admin role.",
    );
  }
  if (!isAdmin) {
    return fail(endpoint, startedAt, 403, "forbidden", "Admin role required.");
  }

  try {
    // Runtime guard — throws before any network call if the URL/method
    // drifts outside the shared allowlist.
    try {
      assertMgmtCall(ALLOWED_ENDPOINTS[endpoint], "GET");
    } catch (guardErr) {
      const msg = guardErr instanceof MgmtApiGuardError ? guardErr.message : "mgmt guard rejected call";
      console.error("mgmt guard blocked call", msg);
      return fail(endpoint, startedAt, 500, "mgmt_guard_blocked", msg);
    }

    const upstream = await fetch(ALLOWED_ENDPOINTS[endpoint], {
      method: "GET",
      headers: {
        Authorization: `Bearer ${mgmtToken}`,
        Accept: "application/json",
      },
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error("mgmt api non-ok", upstream.status);
      return fail(
        endpoint,
        startedAt,
        502,
        "mgmt_api_error",
        `Upstream returned ${upstream.status}: ${text.slice(0, 500)}`,
        upstream.status,
      );
    }

    let parsed: unknown = [];
    try {
      parsed = text.length ? JSON.parse(text) : [];
    } catch (e) {
      console.error("mgmt api invalid json", redact(e));
      return fail(
        endpoint,
        startedAt,
        502,
        "mgmt_api_invalid_json",
        "Upstream response was not valid JSON.",
      );
    }

    return ok(endpoint, startedAt, normaliseLints(parsed));
  } catch (e) {
    console.error("mgmt api fetch failed", redact(e));
    return fail(
      endpoint,
      startedAt,
      502,
      "mgmt_api_unreachable",
      "Failed to reach the management API.",
    );
  }
}

Deno.serve(async (req) => {
  try {
    return await handler(req);
  } catch (e) {
    console.error("handler crashed", redact(e));
    return fail("lints", performance.now(), 500, "internal_error", "Unexpected server error.");
  }
});
