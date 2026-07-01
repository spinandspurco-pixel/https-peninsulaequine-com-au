// Tests for supabase/functions/mgmt-db-lints/index.ts
//
// Coverage:
//  1. `redact()` scrubs the token value and the literal env-var name from
//     strings, Errors (message + stack), and nested plain objects.
//  2. `handler()` returns 500 `server_misconfigured` when the token env var
//     is missing — and the response body contains no trace of the token name.
//  3. `handler()` returns 401 `unauthenticated` when no Authorization header
//     is provided (short-circuits before any upstream call).
//  4. `handler()` returns 403 `forbidden` for an authenticated non-admin.
//  5. Error responses and console output produced during a simulated upstream
//     failure never contain the token value.

import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

// Env must be set before importing the module so its module-scope reads
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY) succeed.
Deno.env.set("SUPABASE_URL", "https://example.supabase.co");
Deno.env.set("SUPABASE_ANON_KEY", "anon-test-key");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "service-role-test-key");

const { handler, redact } = await import("./index.ts");

const SECRET_TOKEN = "sbp_live_supersecret_ABCDEFGHIJKL1234567890";
const REDACTED = "[REDACTED_MGMT_TOKEN]";

function setToken(v: string | null) {
  if (v === null) Deno.env.delete("SB_MGMT_ACCESS_TOKEN");
  else Deno.env.set("SB_MGMT_ACCESS_TOKEN", v);
}

/**
 * Install a fetch stub for the duration of a handler call. Returns a
 * `restore()` fn and a `calls` array for assertions.
 */
function stubFetch(
  responder: (url: string, init?: RequestInit) => Response | Promise<Response>,
) {
  const original = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    calls.push({ url, init });
    return await responder(url, init);
  }) as typeof fetch;
  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

/**
 * Capture console.error output so we can assert redaction of log lines.
 * The module installs its own sanitiser at import time that wraps the
 * live console.error; our capture wrapper composes on top of that, so
 * anything we see here is already post-redaction.
 */
function captureConsoleError() {
  const original = console.error;
  const lines: string[] = [];
  console.error = (...args: unknown[]) => {
    lines.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "));
    // don't forward to keep test output clean
  };
  return {
    lines,
    restore: () => {
      console.error = original;
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. redact()
// ─────────────────────────────────────────────────────────────────────────────

Deno.test("redact: scrubs raw token value from strings", () => {
  setToken(SECRET_TOKEN);
  const out = redact(`Authorization: Bearer ${SECRET_TOKEN} trailing`);
  assertEquals(out, `Authorization: Bearer ${REDACTED} trailing`);
});

Deno.test("redact: scrubs the literal env-var name from strings", () => {
  setToken(SECRET_TOKEN);
  const out = redact("failed to read SB_MGMT_ACCESS_TOKEN from env");
  assertStringIncludes(out as string, REDACTED);
  assert(!(out as string).includes("SB_MGMT_ACCESS_TOKEN"));
});

Deno.test("redact: scrubs token from Error message and stack", () => {
  setToken(SECRET_TOKEN);
  const err = new Error(`upstream 401 with token ${SECRET_TOKEN}`);
  err.stack = `Error: token ${SECRET_TOKEN}\n    at somewhere`;
  const scrubbed = redact(err) as Error;
  assert(scrubbed instanceof Error);
  assert(!scrubbed.message.includes(SECRET_TOKEN));
  assertStringIncludes(scrubbed.message, REDACTED);
  assert(scrubbed.stack !== undefined && !scrubbed.stack.includes(SECRET_TOKEN));
});

Deno.test("redact: scrubs token from nested object values", () => {
  setToken(SECRET_TOKEN);
  const payload = {
    error: "mgmt_api_error",
    body: `{"hint":"bad token ${SECRET_TOKEN}"}`,
    nested: { headers: { Authorization: `Bearer ${SECRET_TOKEN}` } },
  };
  const scrubbed = JSON.stringify(redact(payload));
  assert(!scrubbed.includes(SECRET_TOKEN));
  assert(!scrubbed.includes("SB_MGMT_ACCESS_TOKEN"));
  assertStringIncludes(scrubbed, REDACTED);
});

Deno.test("redact: no-op when token env var is unset", () => {
  setToken(null);
  // Env-var name is still redacted, but a raw random string is unchanged.
  const out = redact("nothing sensitive here") as string;
  assertEquals(out, "nothing sensitive here");
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. handler(): missing token
// ─────────────────────────────────────────────────────────────────────────────

Deno.test("handler: 500 server_misconfigured when token missing", async () => {
  setToken(null);
  const capture = captureConsoleError();
  try {
    const res = await handler(
      new Request("https://fn.local/mgmt-db-lints", {
        method: "GET",
        headers: { Authorization: "Bearer some.jwt.here" },
      }),
    );
    assertEquals(res.status, 500);
    const body = await res.json();
    assertEquals(body.error, "server_misconfigured");
    // Even the error path must not echo the env-var name in the body.
    const raw = JSON.stringify(body);
    assert(!raw.includes("SB_MGMT_ACCESS_TOKEN"));
  } finally {
    capture.restore();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. handler(): missing Authorization → 401
// ─────────────────────────────────────────────────────────────────────────────

Deno.test("handler: 401 unauthenticated when Authorization header missing", async () => {
  setToken(SECRET_TOKEN);
  const stub = stubFetch(() => new Response("should not be called", { status: 500 }));
  try {
    const res = await handler(
      new Request("https://fn.local/mgmt-db-lints", { method: "GET" }),
    );
    assertEquals(res.status, 401);
    const body = await res.json();
    assertEquals(body.error, "unauthenticated");
    // Short-circuit: never reached auth.getUser or the Management API.
    assertEquals(stub.calls.length, 0);
  } finally {
    stub.restore();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. handler(): non-admin → 403
// ─────────────────────────────────────────────────────────────────────────────

Deno.test({ name: "handler: 403 forbidden for authenticated non-admin", sanitizeOps: false, sanitizeResources: false, fn: async () => {
  setToken(SECRET_TOKEN);
  const stub = stubFetch((url) => {
    // GoTrue user lookup succeeds
    if (url.includes("/auth/v1/user")) {
      return new Response(
        JSON.stringify({ id: "00000000-0000-0000-0000-000000000001", aud: "authenticated" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    // has_role RPC returns false
    if (url.includes("/rest/v1/rpc/has_role")) {
      return new Response("false", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Any call to api.supabase.com would be a test failure.
    if (url.includes("api.supabase.com")) {
      throw new Error(`unexpected mgmt-api call to ${url}`);
    }
    return new Response("unhandled", { status: 500 });
  });
  try {
    const res = await handler(
      new Request("https://fn.local/mgmt-db-lints", {
        method: "GET",
        headers: { Authorization: "Bearer non.admin.jwt" },
      }),
    );
    assertEquals(res.status, 403);
    const body = await res.json();
    assertEquals(body.error, "forbidden");
    // No call was made to the Management API endpoint.
    assert(!stub.calls.some((c) => c.url.includes("api.supabase.com")));
  } finally {
    stub.restore();
  }
} });


// ─────────────────────────────────────────────────────────────────────────────
// 5. handler(): upstream error responses and logs never contain the token
// ─────────────────────────────────────────────────────────────────────────────

Deno.test({ name: "handler: token never leaks in mgmt_api_error body or logs", sanitizeOps: false, sanitizeResources: false, fn: async () => {
  setToken(SECRET_TOKEN);
  const capture = captureConsoleError();
  // Simulate an upstream that echoes the Authorization header back — a
  // realistic worst case for accidental token leaks.
  const stub = stubFetch((url, init) => {
    if (url.includes("/auth/v1/user")) {
      return new Response(
        JSON.stringify({ id: "00000000-0000-0000-0000-000000000002", aud: "authenticated" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.includes("/rest/v1/rpc/has_role")) {
      return new Response("true", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("api.supabase.com")) {
      const auth = (init?.headers as Record<string, string> | undefined)?.["Authorization"] ??
        (init?.headers as Record<string, string> | undefined)?.["authorization"] ??
        "";
      // Deliberately echo the token back in the error body.
      return new Response(
        JSON.stringify({ message: "invalid token", echoed_auth: auth }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response("unhandled", { status: 500 });
  });
  try {
    const res = await handler(
      new Request("https://fn.local/mgmt-db-lints", {
        method: "GET",
        headers: { Authorization: "Bearer admin.jwt" },
      }),
    );
    assertEquals(res.status, 502);
    const rawBody = await res.text();
    const parsed = JSON.parse(rawBody);
    assertEquals(parsed.error, "mgmt_api_error");
    assertEquals(parsed.status, 401);
    // The core guarantee — no token substring in the outgoing body,
    // even though the upstream echoed it.
    assert(!rawBody.includes(SECRET_TOKEN), "response body must not contain the token");
    assert(!rawBody.includes("SB_MGMT_ACCESS_TOKEN"), "response body must not contain env-var name");
    assertStringIncludes(rawBody, REDACTED);

    // Captured console.error lines are all post-redaction.
    for (const line of capture.lines) {
      assert(!line.includes(SECRET_TOKEN), `log line leaked token: ${line}`);
    }
  } finally {
    stub.restore();
    capture.restore();
  }
} });

