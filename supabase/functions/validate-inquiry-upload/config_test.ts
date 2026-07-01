// Unit tests for loadUploadConfig — env-driven limits for max size,
// allowed MIME types, and extensions.

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.env.set("SUPABASE_URL", Deno.env.get("SUPABASE_URL") ?? "https://example.supabase.co");
Deno.env.set(
  "SUPABASE_SERVICE_ROLE_KEY",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "service-test-key",
);
Deno.env.set("SUPABASE_ANON_KEY", Deno.env.get("SUPABASE_ANON_KEY") ?? "anon-test-key");

const { loadUploadConfig, handler } = await import("./index.ts");

function envFrom(map: Record<string, string | undefined>) {
  return {
    get: (k: string) => (Object.prototype.hasOwnProperty.call(map, k) ? map[k] : undefined),
  };
}

// ---------- defaults ----------

Deno.test("defaults when no env vars are set", () => {
  const { config, errors } = loadUploadConfig(envFrom({}));
  assertEquals(errors, []);
  assertEquals(config.maxBytes, 10 * 1024 * 1024);
  assert(config.allowed["image/png"]?.includes("png"));
  assert(config.allowed["application/pdf"]?.includes("pdf"));
});

// ---------- size ----------

Deno.test("INQUIRY_UPLOAD_MAX_BYTES overrides default", () => {
  const { config, errors } = loadUploadConfig(
    envFrom({ INQUIRY_UPLOAD_MAX_BYTES: "2097152" }),
  );
  assertEquals(errors, []);
  assertEquals(config.maxBytes, 2_097_152);
});

Deno.test("INQUIRY_UPLOAD_MAX_BYTES rejects non-numeric", () => {
  const { errors, config } = loadUploadConfig(
    envFrom({ INQUIRY_UPLOAD_MAX_BYTES: "big" }),
  );
  assert(errors.some((e) => e.includes("MAX_BYTES")));
  assertEquals(config.maxBytes, 10 * 1024 * 1024); // falls back to default
});

Deno.test("INQUIRY_UPLOAD_MAX_BYTES rejects zero/negative", () => {
  const { errors: e1 } = loadUploadConfig(envFrom({ INQUIRY_UPLOAD_MAX_BYTES: "0" }));
  const { errors: e2 } = loadUploadConfig(envFrom({ INQUIRY_UPLOAD_MAX_BYTES: "-1" }));
  assert(e1.length > 0);
  assert(e2.length > 0);
});

Deno.test("INQUIRY_UPLOAD_MAX_BYTES rejects values above hard cap", () => {
  const { errors } = loadUploadConfig(
    envFrom({ INQUIRY_UPLOAD_MAX_BYTES: String(100 * 1024 * 1024) }),
  );
  assert(errors.some((e) => e.includes("hard cap")));
});

// ---------- INQUIRY_UPLOAD_ALLOWED_TYPES (JSON) ----------

Deno.test("INQUIRY_UPLOAD_ALLOWED_TYPES JSON overrides map", () => {
  const { config, errors } = loadUploadConfig(
    envFrom({
      INQUIRY_UPLOAD_ALLOWED_TYPES: JSON.stringify({
        "image/png": ["png"],
        "image/gif": ["gif"],
      }),
    }),
  );
  assertEquals(errors, []);
  assertEquals(Object.keys(config.allowed).sort(), ["image/gif", "image/png"]);
  assertEquals(config.allowed["image/gif"], ["gif"]);
});

Deno.test("INQUIRY_UPLOAD_ALLOWED_TYPES rejects invalid JSON", () => {
  const { errors } = loadUploadConfig(
    envFrom({ INQUIRY_UPLOAD_ALLOWED_TYPES: "{not json" }),
  );
  assert(errors.some((e) => e.includes("ALLOWED_TYPES")));
});

Deno.test("INQUIRY_UPLOAD_ALLOWED_TYPES rejects non-object / empty / bad shape", () => {
  const cases = [
    "[]",
    "null",
    "{}",
    JSON.stringify({ "image/png": [] }),
    JSON.stringify({ "not-a-mime": ["x"] }),
    JSON.stringify({ "image/png": ["bad ext!"] }),
    JSON.stringify({ "image/png": "png" }),
  ];
  for (const raw of cases) {
    const { errors } = loadUploadConfig(envFrom({ INQUIRY_UPLOAD_ALLOWED_TYPES: raw }));
    assert(errors.length > 0, `expected errors for ${raw}`);
  }
});

Deno.test("INQUIRY_UPLOAD_ALLOWED_TYPES normalises case + dotted extensions", () => {
  const { config, errors } = loadUploadConfig(
    envFrom({
      INQUIRY_UPLOAD_ALLOWED_TYPES: JSON.stringify({
        "IMAGE/PNG": [".PNG", "png"],
      }),
    }),
  );
  assertEquals(errors, []);
  assertEquals(config.allowed["image/png"], ["png"]);
});

// ---------- CSV pair fallback ----------

Deno.test("INQUIRY_UPLOAD_ALLOWED_MIME/EXT pair builds cartesian map", () => {
  const { config, errors } = loadUploadConfig(
    envFrom({
      INQUIRY_UPLOAD_ALLOWED_MIME: "image/png, image/jpeg",
      INQUIRY_UPLOAD_ALLOWED_EXT: "png, jpg, jpeg",
    }),
  );
  assertEquals(errors, []);
  assertEquals(config.allowed["image/png"], ["png", "jpg", "jpeg"]);
  assertEquals(config.allowed["image/jpeg"], ["png", "jpg", "jpeg"]);
});

Deno.test("CSV pair requires both sides populated", () => {
  const { errors } = loadUploadConfig(
    envFrom({ INQUIRY_UPLOAD_ALLOWED_MIME: "image/png" }),
  );
  assert(errors.length > 0);
});

// ---------- integration through handler ----------

const FOLDER = "11111111-2222-3333-4444-555555555555";
const PNG_SIG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0, 0, 0, 0, 0, 0, 0, 0,
]);

Deno.test("handler enforces env-configured max size", async () => {
  Deno.env.set("INQUIRY_UPLOAD_MAX_BYTES", "1024");
  try {
    const buf = new Uint8Array(2048);
    buf.set(PNG_SIG, 0);
    const fd = new FormData();
    fd.append("file", new File([buf], "big.png", { type: "image/png" }));
    fd.append("folder", FOLDER);
    const res = await handler(
      new Request("http://localhost/validate-inquiry-upload", { method: "POST", body: fd }),
    );
    assertEquals(res.status, 413);
    const body = await res.json();
    assertEquals(body.code, "file_too_large");
    assertEquals(body.details.max, 1024);
  } finally {
    Deno.env.delete("INQUIRY_UPLOAD_MAX_BYTES");
  }
});

Deno.test("handler rejects MIME missing from env allowlist", async () => {
  Deno.env.set(
    "INQUIRY_UPLOAD_ALLOWED_TYPES",
    JSON.stringify({ "application/pdf": ["pdf"] }),
  );
  try {
    const fd = new FormData();
    fd.append("file", new File([PNG_SIG], "a.png", { type: "image/png" }));
    fd.append("folder", FOLDER);
    const res = await handler(
      new Request("http://localhost/validate-inquiry-upload", { method: "POST", body: fd }),
    );
    assertEquals(res.status, 415);
    const body = await res.json();
    assertEquals(body.code, "mime_not_allowed");
    assertEquals(body.details.allowed, ["application/pdf"]);
  } finally {
    Deno.env.delete("INQUIRY_UPLOAD_ALLOWED_TYPES");
  }
});

Deno.test("handler returns 500 when config env is malformed", async () => {
  Deno.env.set("INQUIRY_UPLOAD_MAX_BYTES", "not-a-number");
  try {
    const fd = new FormData();
    fd.append("file", new File([PNG_SIG], "a.png", { type: "image/png" }));
    fd.append("folder", FOLDER);
    const res = await handler(
      new Request("http://localhost/validate-inquiry-upload", { method: "POST", body: fd }),
    );
    assertEquals(res.status, 500);
    const body = await res.json();
    assertEquals(body.code, "server_misconfigured");
  } finally {
    Deno.env.delete("INQUIRY_UPLOAD_MAX_BYTES");
  }
});
