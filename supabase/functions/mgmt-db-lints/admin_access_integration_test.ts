// Integration test: admin-only access to mgmt-db-lints.
//
// Exercises the *deployed* function via HTTP (not the in-process handler) to
// confirm the admin gate holds end-to-end:
//   • no Authorization header           → 401 unauthenticated
//   • authenticated non-admin caller    → 403 forbidden, no upstream call
//   • authenticated admin caller        → 200 ok envelope with `lints`
//
// Required env (loaded from the repo `.env` via std/dotenv):
//   VITE_SUPABASE_URL              — project URL, used to derive functions URL
//   VITE_SUPABASE_PUBLISHABLE_KEY  — anon key, sent as apikey header
//   MGMT_LINTS_ADMIN_JWT           — access_token for a user with the admin role
//   MGMT_LINTS_NON_ADMIN_JWT       — access_token for an authenticated non-admin
//
// If either JWT is absent the corresponding test is skipped rather than failing,
// so this file is safe to run in environments where preview credentials are
// not provisioned.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");
const ADMIN_JWT = Deno.env.get("MGMT_LINTS_ADMIN_JWT");
const NON_ADMIN_JWT = Deno.env.get("MGMT_LINTS_NON_ADMIN_JWT");

const FUNCTION_URL = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/mgmt-db-lints`
  : null;

function haveBaseConfig(): boolean {
  return Boolean(SUPABASE_URL && ANON_KEY && FUNCTION_URL);
}

async function invoke(jwt: string | null): Promise<{ status: number; body: unknown }> {
  const headers: Record<string, string> = {
    apikey: ANON_KEY!,
    Accept: "application/json",
  };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  const res = await fetch(FUNCTION_URL!, { method: "GET", headers });
  // Always consume the body to avoid Deno resource-leak warnings.
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* keep raw text if not JSON */
  }
  return { status: res.status, body };
}

function assertEnvelopeShape(body: unknown) {
  assert(body && typeof body === "object", "response body must be a JSON object");
  const b = body as Record<string, unknown>;
  assert(b.status === "ok" || b.status === "error", "envelope.status invalid");
  assert(Array.isArray(b.lints), "envelope.lints must be an array");
  const req = b.request as Record<string, unknown> | undefined;
  assert(req && typeof req === "object", "envelope.request missing");
  assertEquals(typeof req!.endpoint, "string");
  assertEquals(typeof req!.project_ref, "string");
  assertEquals(typeof req!.fetched_at, "string");
  assertEquals(typeof req!.duration_ms, "number");
}

Deno.test({
  name: "integration: unauthenticated request → 401",
  ignore: !haveBaseConfig(),
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { status, body } = await invoke(null);
    assertEquals(status, 401);
    assertEnvelopeShape(body);
    assertEquals((body as { status: string }).status, "error");
    assertEquals(
      ((body as { error: { code: string } }).error).code,
      "unauthenticated",
    );
  },
});

Deno.test({
  name: "integration: authenticated non-admin → 403 forbidden",
  ignore: !haveBaseConfig() || !NON_ADMIN_JWT,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { status, body } = await invoke(NON_ADMIN_JWT!);
    assertEquals(status, 403, "non-admin must be rejected with 403");
    assertEnvelopeShape(body);
    const b = body as { status: string; error: { code: string }; lints: unknown[] };
    assertEquals(b.status, "error");
    assertEquals(b.error.code, "forbidden");
    // Defence in depth: even on failure the envelope keeps lints as [].
    assertEquals(b.lints.length, 0);
  },
});

Deno.test({
  name: "integration: authenticated admin → 200 ok with lints envelope",
  ignore: !haveBaseConfig() || !ADMIN_JWT,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { status, body } = await invoke(ADMIN_JWT!);
    assertEquals(status, 200, "admin must be able to read lints");
    assertEnvelopeShape(body);
    const b = body as { status: string; request: { endpoint: string } };
    assertEquals(b.status, "ok");
    assertEquals(b.request.endpoint, "lints");
  },
});
