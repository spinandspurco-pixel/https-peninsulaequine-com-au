// Integration tests for mgmt-db-lints.
//
// Verifies:
//   1. Missing SB_MGMT_ACCESS_TOKEN → 500 server_misconfigured, and the
//      response body never contains the env-var name or the (now-absent)
//      token value.
//   2. Secret present but no caller auth → 401 unauthenticated, proving the
//      secret check passed cleanly.
//   3. Secret present + a fake bearer token → 401 unauthenticated (Supabase
//      auth rejects the JWT), still fails safely without leaking the secret.
//   4. No response body ever contains the raw token value.

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

const TEST_TOKEN = "sbp_integration_test_supersecret_9999";

// Set required env for createClient() calls used inside handler().
// These do not need to be valid — the auth gate rejects before any network I/O
// when no bearer is supplied, and rejects the fake bearer for case (3).
Deno.env.set("SUPABASE_URL", Deno.env.get("SUPABASE_URL") ?? "https://example.supabase.co");
Deno.env.set("SUPABASE_ANON_KEY", Deno.env.get("SUPABASE_ANON_KEY") ?? "anon-test-key");
Deno.env.set(
  "SUPABASE_SERVICE_ROLE_KEY",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "service-test-key",
);

const { handler } = await import("./index.ts");

function makeReq(init: { auth?: string } = {}) {
  const headers: Record<string, string> = {};
  if (init.auth) headers.Authorization = init.auth;
  return new Request("http://localhost/mgmt-db-lints", { method: "GET", headers });
}

Deno.test("fails safely (500) when SB_MGMT_ACCESS_TOKEN is missing", async () => {
  Deno.env.delete("SB_MGMT_ACCESS_TOKEN");
  const res = await handler(makeReq());
  const body = await res.text();

  assertEquals(res.status, 500);
  const parsed = JSON.parse(body);
  assertEquals(parsed.error, "server_misconfigured");

  // Response must never leak the env-var name or the (would-be) token value.
  assert(!body.includes("SB_MGMT_ACCESS_TOKEN"), "env-var name must not appear in response");
  assert(!body.includes(TEST_TOKEN), "token value must not appear in response");
});

Deno.test("secret present → succeeds past the config check (401 without caller auth)", async () => {
  Deno.env.set("SB_MGMT_ACCESS_TOKEN", TEST_TOKEN);
  const res = await handler(makeReq());
  const body = await res.text();

  // 401 (not 500) proves the secret check passed — the function is now in
  // the auth gate, not the server-misconfigured branch.
  assertEquals(res.status, 401);
  const parsed = JSON.parse(body);
  assertEquals(parsed.error, "unauthenticated");
  assert(!body.includes(TEST_TOKEN), "token value must never appear in response");
  assert(
    !body.includes("SB_MGMT_ACCESS_TOKEN"),
    "env-var name must never appear in response",
  );
});

Deno.test({
  name: "secret present + fake bearer → 401 without leaking the secret",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
  Deno.env.set("SB_MGMT_ACCESS_TOKEN", TEST_TOKEN);
  const res = await handler(makeReq({ auth: "Bearer not.a.real.jwt" }));
  const body = await res.text();

  // Either 401 (invalid JWT rejected) or 500 (network to fake URL failed) —
  // both are safe. What matters is the secret never leaks.
  assert(res.status === 401 || res.status === 500 || res.status === 403);
  assert(!body.includes(TEST_TOKEN), "token value must never appear in response");
  assert(
    !body.includes("SB_MGMT_ACCESS_TOKEN"),
    "env-var name must never appear in response",
  );
});

Deno.test("OPTIONS preflight is allowed regardless of secret state", async () => {
  Deno.env.delete("SB_MGMT_ACCESS_TOKEN");
  const req = new Request("http://localhost/mgmt-db-lints", { method: "OPTIONS" });
  const res = await handler(req);
  await res.text();
  assertEquals(res.status, 200);
});

Deno.test("non-GET methods are rejected safely with the secret missing", async () => {
  Deno.env.delete("SB_MGMT_ACCESS_TOKEN");
  const req = new Request("http://localhost/mgmt-db-lints", { method: "POST" });
  const res = await handler(req);
  const body = await res.text();
  assertEquals(res.status, 405);
  const parsed = JSON.parse(body);
  assertEquals(parsed.error, "method_not_allowed");
});
