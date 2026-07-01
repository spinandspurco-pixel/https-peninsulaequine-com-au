// Integration tests for validate-inquiry-upload.
//
// Verifies each failure path returns the documented
//   { error: string, code: string, details?: object }
// shape at the correct HTTP status.

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

// The handler reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY only in the
// success path (never reached by these validation tests), but createClient()
// is imported eagerly — provide dummies so import doesn't fail.
Deno.env.set("SUPABASE_URL", Deno.env.get("SUPABASE_URL") ?? "https://example.supabase.co");
Deno.env.set(
  "SUPABASE_SERVICE_ROLE_KEY",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "service-test-key",
);
Deno.env.set("SUPABASE_ANON_KEY", Deno.env.get("SUPABASE_ANON_KEY") ?? "anon-test-key");

const { handler } = await import("./index.ts");

const FOLDER = "11111111-2222-3333-4444-555555555555";

// Minimal valid PNG signature (8 header bytes + trailing zeros to reach 16).
const PNG_SIG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0, 0, 0, 0, 0, 0, 0, 0,
]);

function multipartRequest(form: FormData): Request {
  return new Request("http://localhost/validate-inquiry-upload", {
    method: "POST",
    body: form,
  });
}

async function readError(res: Response) {
  const body = await res.json();
  return body as { error?: unknown; code?: unknown; details?: unknown };
}

function assertErrorShape(
  body: { error?: unknown; code?: unknown; details?: unknown },
  expectedCode: string,
  { requireDetails = true }: { requireDetails?: boolean } = {},
) {
  assertEquals(typeof body.error, "string", "error must be a string message");
  assert((body.error as string).length > 0, "error message must be non-empty");
  assertEquals(body.code, expectedCode, `code must equal ${expectedCode}`);
  if (requireDetails) {
    assertEquals(typeof body.details, "object", "details must be an object");
    assert(body.details !== null, "details must not be null");
  }
}

// ---------- method / content-type gate ----------

Deno.test("GET → 405 method_not_allowed", async () => {
  const res = await handler(
    new Request("http://localhost/validate-inquiry-upload", { method: "GET" }),
  );
  assertEquals(res.status, 405);
  assertErrorShape(await readError(res), "method_not_allowed");
});

Deno.test("OPTIONS preflight → 200 with CORS", async () => {
  const res = await handler(
    new Request("http://localhost/validate-inquiry-upload", { method: "OPTIONS" }),
  );
  assertEquals(res.status, 200);
  await res.text();
});

Deno.test("non-multipart body → 400 invalid_multipart", async () => {
  const res = await handler(
    new Request("http://localhost/validate-inquiry-upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ file: "nope" }),
    }),
  );
  assertEquals(res.status, 400);
  const body = await readError(res);
  assertErrorShape(body, "invalid_multipart");
  const details = body.details as Record<string, unknown>;
  assertEquals(details.received_content_type, "application/json");
});

Deno.test("multipart declared without boundary → 400 invalid_multipart", async () => {
  // No boundary parameter → Deno either rejects at formData() or produces an
  // empty form. Either way the request cannot reach the success path.
  const res = await handler(
    new Request("http://localhost/validate-inquiry-upload", {
      method: "POST",
      headers: { "content-type": "multipart/form-data" },
      body: "irrelevant",
    }),
  );
  const body = await readError(res);
  assertEquals(res.status, 400);
  // Accept either the parse-failure code or the downstream missing-file code.
  assert(
    body.code === "invalid_multipart" || body.code === "file_required",
    `expected invalid_multipart or file_required, got ${String(body.code)}`,
  );
});

// ---------- required-field validation ----------

Deno.test("missing file field → 400 file_required", async () => {
  const fd = new FormData();
  fd.append("folder", FOLDER);
  const res = await handler(multipartRequest(fd));
  assertEquals(res.status, 400);
  const body = await readError(res);
  assertErrorShape(body, "file_required");
  assertEquals((body.details as Record<string, unknown>).field, "file");
});

Deno.test("file field is a string, not a File → 400 file_required", async () => {
  const fd = new FormData();
  fd.append("file", "just-a-string");
  fd.append("folder", FOLDER);
  const res = await handler(multipartRequest(fd));
  assertEquals(res.status, 400);
  assertErrorShape(await readError(res), "file_required");
});

Deno.test("missing folder → 400 invalid_folder (missing)", async () => {
  const fd = new FormData();
  fd.append("file", new File([PNG_SIG], "a.png", { type: "image/png" }));
  const res = await handler(multipartRequest(fd));
  assertEquals(res.status, 400);
  const body = await readError(res);
  assertErrorShape(body, "invalid_folder");
  assertEquals((body.details as Record<string, unknown>).reason, "missing");
});

Deno.test("non-UUID folder → 400 invalid_folder (not_uuid)", async () => {
  const fd = new FormData();
  fd.append("file", new File([PNG_SIG], "a.png", { type: "image/png" }));
  fd.append("folder", "not-a-uuid");
  const res = await handler(multipartRequest(fd));
  assertEquals(res.status, 400);
  const body = await readError(res);
  assertErrorShape(body, "invalid_folder");
  assertEquals((body.details as Record<string, unknown>).reason, "not_uuid");
});

// ---------- size validation ----------

Deno.test("empty file → 400 empty_file", async () => {
  const fd = new FormData();
  fd.append("file", new File([], "a.png", { type: "image/png" }));
  fd.append("folder", FOLDER);
  const res = await handler(multipartRequest(fd));
  assertEquals(res.status, 400);
  const body = await readError(res);
  assertErrorShape(body, "empty_file");
  assertEquals((body.details as Record<string, unknown>).size, 0);
});

Deno.test("oversize file (>10 MB) → 413 file_too_large", async () => {
  const oversize = new Uint8Array(10 * 1024 * 1024 + 1);
  oversize.set(PNG_SIG, 0);
  const fd = new FormData();
  fd.append("file", new File([oversize], "big.png", { type: "image/png" }));
  fd.append("folder", FOLDER);
  const res = await handler(multipartRequest(fd));
  assertEquals(res.status, 413);
  const body = await readError(res);
  assertErrorShape(body, "file_too_large");
  const details = body.details as Record<string, unknown>;
  assertEquals(details.max, 10 * 1024 * 1024);
  assertEquals(details.size, oversize.byteLength);
});

// ---------- type validation ----------

Deno.test("disallowed MIME → 415 mime_not_allowed", async () => {
  const fd = new FormData();
  fd.append(
    "file",
    new File([new Uint8Array([1, 2, 3, 4])], "evil.exe", {
      type: "application/x-msdownload",
    }),
  );
  fd.append("folder", FOLDER);
  const res = await handler(multipartRequest(fd));
  assertEquals(res.status, 415);
  const body = await readError(res);
  assertErrorShape(body, "mime_not_allowed");
  assertEquals(
    (body.details as Record<string, unknown>).mime,
    "application/x-msdownload",
  );
});

Deno.test("MIME/extension mismatch → 415 extension_mismatch", async () => {
  // Declared image/png but extension is .jpg
  const fd = new FormData();
  fd.append("file", new File([PNG_SIG], "photo.jpg", { type: "image/png" }));
  fd.append("folder", FOLDER);
  const res = await handler(multipartRequest(fd));
  assertEquals(res.status, 415);
  assertErrorShape(await readError(res), "extension_mismatch");
});

Deno.test("magic-byte mismatch → 415 content_mismatch", async () => {
  // Declared image/png with .png extension but bytes are NOT a PNG signature.
  const fake = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const fd = new FormData();
  fd.append("file", new File([fake], "spoof.png", { type: "image/png" }));
  fd.append("folder", FOLDER);
  const res = await handler(multipartRequest(fd));
  assertEquals(res.status, 415);
  assertErrorShape(await readError(res), "content_mismatch", { requireDetails: true });
});
