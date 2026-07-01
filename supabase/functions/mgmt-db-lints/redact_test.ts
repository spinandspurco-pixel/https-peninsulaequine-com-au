// Deno tests for the mgmt-db-lints redaction helper.
// Run via: supabase--test_edge_functions { functions: ["mgmt-db-lints"] }

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

// The token must exist in the env before we import index.ts, because the
// module resolves MGMT_TOKEN at import time.
const TEST_TOKEN = "sbp_test_supersecret_value_1234567890";
Deno.env.set("SB_MGMT_ACCESS_TOKEN", TEST_TOKEN);

const { redact } = await import("./index.ts");

Deno.test("redact() scrubs the token value from strings", () => {
  const input = `calling api with Bearer ${TEST_TOKEN} appended`;
  const out = redact(input) as string;
  assert(!out.includes(TEST_TOKEN), "token value must not appear");
  assert(out.includes("[REDACTED:SB_MGMT_ACCESS_TOKEN]"));
});

Deno.test("redact() scrubs the env-var name from strings", () => {
  const out = redact("SB_MGMT_ACCESS_TOKEN is not configured") as string;
  assert(!out.includes("SB_MGMT_ACCESS_TOKEN"));
  assert(out.includes("[REDACTED:SB_MGMT_ACCESS_TOKEN]"));
});

Deno.test("redact() scrubs the token value from Error.message and stack", () => {
  const err = new Error(`fetch failed: token=${TEST_TOKEN}`);
  const out = redact(err) as Error;
  assert(!out.message.includes(TEST_TOKEN));
  assert(out.message.includes("[REDACTED:SB_MGMT_ACCESS_TOKEN]"));
});

Deno.test("redact() scrubs the token value from nested objects", () => {
  const payload = { authorization: `Bearer ${TEST_TOKEN}`, ok: false };
  const out = redact(payload) as Record<string, unknown>;
  const serialised = JSON.stringify(out);
  assert(!serialised.includes(TEST_TOKEN));
  assert(serialised.includes("[REDACTED:SB_MGMT_ACCESS_TOKEN]"));
  assertEquals(out.ok, false);
});

Deno.test("redact() leaves unrelated values untouched", () => {
  assertEquals(redact("hello world"), "hello world");
  assertEquals(redact(42), 42);
  assertEquals(redact(null), null);
});
