// Boundary + safe-handling smoke tests for validate-inquiry-upload.
//
// Confirms:
//   - Every allowed MIME/extension pair passes the validation layer.
//   - 10 MB exactly is accepted; 10 MB + 1 byte is rejected as file_too_large.
//   - Executable payloads renamed with a whitelisted extension are caught by
//     the magic-byte sniff (content_mismatch), not silently accepted.
//   - Executable MIME types are rejected up front (mime_not_allowed).
//
// The success path calls Supabase Storage which we don't have credentials for
// in-test, so for "valid" cases we only assert that no *validation* error
// was raised — any downstream storage/persist failure is acceptable here.

import { assert, assertEquals, assertNotEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.env.set("SUPABASE_URL", Deno.env.get("SUPABASE_URL") ?? "https://example.supabase.co");
Deno.env.set(
  "SUPABASE_SERVICE_ROLE_KEY",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "service-test-key",
);
Deno.env.set("SUPABASE_ANON_KEY", Deno.env.get("SUPABASE_ANON_KEY") ?? "anon-test-key");

const { handler } = await import("./index.ts");

const FOLDER = "11111111-2222-3333-4444-555555555555";
const MAX = 10 * 1024 * 1024;
const VALIDATION_CODES = new Set([
  "file_required",
  "empty_file",
  "file_too_large",
  "invalid_filename",
  "mime_not_allowed",
  "extension_mismatch",
  "content_mismatch",
  "invalid_multipart",
  "invalid_folder",
  "method_not_allowed",
]);

// ---------- fixtures ----------

const PNG_SIG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0, 0, 0, 0, 0, 0, 0, 0,
]);
const JPEG_SIG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const WEBP_SIG = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0,
  0x57, 0x45, 0x42, 0x50, 0, 0, 0, 0,
]);
const HEIC_SIG = new Uint8Array([0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70, 0, 0, 0, 0, 0, 0, 0, 0]);
const PDF_SIG = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0, 0, 0, 0, 0, 0, 0, 0]);
const OOXML_SIG = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const CFB_SIG = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0, 0, 0, 0, 0, 0, 0]);

// Classic MS-DOS "MZ" PE executable header — the payload we try to smuggle in.
const EXE_SIG = new Uint8Array([
  0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00,
  0x04, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00,
]);

function padTo(sig: Uint8Array, totalBytes: number): Uint8Array {
  const buf = new Uint8Array(totalBytes);
  buf.set(sig, 0);
  return buf;
}

function multipartRequest(form: FormData): Request {
  return new Request("http://localhost/validate-inquiry-upload", {
    method: "POST",
    body: form,
  });
}

async function post(file: File, folder = FOLDER) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await handler(multipartRequest(fd));
  const status = res.status;
  const body = (await res.json()) as {
    error?: string; code?: string; details?: Record<string, unknown>;
    path?: string; id?: string;
  };
  return { status, body };
}

// ---------- allowed types round-trip (validation layer only) ----------

interface Fixture {
  label: string;
  filename: string;
  mime: string;
  sig: Uint8Array;
}

const ALLOWED_FIXTURES: Fixture[] = [
  { label: "PNG",   filename: "photo.png",   mime: "image/png",   sig: PNG_SIG },
  { label: "JPEG",  filename: "photo.jpg",   mime: "image/jpeg",  sig: JPEG_SIG },
  { label: "WebP",  filename: "photo.webp",  mime: "image/webp",  sig: WEBP_SIG },
  { label: "HEIC",  filename: "photo.heic",  mime: "image/heic",  sig: HEIC_SIG },
  { label: "PDF",   filename: "brief.pdf",   mime: "application/pdf", sig: PDF_SIG },
  {
    label: "DOCX",
    filename: "brief.docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    sig: OOXML_SIG,
  },
  {
    label: "XLSX",
    filename: "budget.xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    sig: OOXML_SIG,
  },
  { label: "DOC",  filename: "brief.doc",  mime: "application/msword",       sig: CFB_SIG },
  { label: "XLS",  filename: "budget.xls", mime: "application/vnd.ms-excel", sig: CFB_SIG },
];

for (const fx of ALLOWED_FIXTURES) {
  Deno.test(`allowed ${fx.label} passes validation layer`, async () => {
    const { status, body } = await post(new File([fx.sig as BlobPart], fx.filename, { type: fx.mime }));
    // Success (2xx) OR a downstream storage/persist error is fine — anything
    // in VALIDATION_CODES would mean the allow-list rejected a supported type.
    if (body.code) {
      assert(
        !VALIDATION_CODES.has(body.code),
        `${fx.label} was rejected by validation with code=${body.code} (status=${status}, details=${JSON.stringify(body.details)})`,
      );
    }
  });
}

// ---------- size boundaries ----------

Deno.test("size boundary: exactly 10 MB → not file_too_large", async () => {
  const bytes = padTo(PNG_SIG, MAX);
  const { status, body } = await post(new File([bytes as BlobPart], "big.png", { type: "image/png" }));
  assertNotEquals(body.code, "file_too_large", `10 MB should be accepted (status=${status})`);
});

Deno.test("size boundary: 10 MB + 1 byte → 413 file_too_large", async () => {
  const bytes = padTo(PNG_SIG, MAX + 1);
  const { status, body } = await post(new File([bytes as BlobPart], "toobig.png", { type: "image/png" }));
  assertEquals(status, 413);
  assertEquals(body.code, "file_too_large");
  assertEquals((body.details as Record<string, unknown>).max, MAX);
  assertEquals((body.details as Record<string, unknown>).size, MAX + 1);
});

Deno.test("size boundary: 1 byte PNG → not file_too_large, not empty", async () => {
  // Fails content_mismatch (single byte can't be a PNG), but neither size code.
  const { body } = await post(new File([new Uint8Array([0x89])], "tiny.png", { type: "image/png" }));
  assertNotEquals(body.code, "empty_file");
  assertNotEquals(body.code, "file_too_large");
});

// ---------- renamed executables & spoofed extensions ----------

Deno.test("renamed .exe as image/png (bytes are MZ header) → content_mismatch", async () => {
  // MIME + extension say PNG, but magic bytes are MZ (Windows PE header).
  const { status, body } = await post(
    new File([EXE_SIG], "resume.png", { type: "image/png" }),
  );
  assertEquals(status, 415);
  assertEquals(body.code, "content_mismatch");
});

Deno.test("renamed .exe as application/pdf → content_mismatch", async () => {
  const { status, body } = await post(
    new File([EXE_SIG], "invoice.pdf", { type: "application/pdf" }),
  );
  assertEquals(status, 415);
  assertEquals(body.code, "content_mismatch");
});

Deno.test("executable declared as application/x-msdownload → 415 mime_not_allowed", async () => {
  const { status, body } = await post(
    new File([EXE_SIG], "installer.exe", { type: "application/x-msdownload" }),
  );
  assertEquals(status, 415);
  assertEquals(body.code, "mime_not_allowed");
});

Deno.test("double extension resume.pdf.exe (declared pdf) → 415 extension_mismatch", async () => {
  // Even if MIME is pdf, the trailing extension is .exe which isn't in the
  // allowed list for application/pdf.
  const { status, body } = await post(
    new File([PDF_SIG], "resume.pdf.exe", { type: "application/pdf" }),
  );
  assertEquals(status, 415);
  assertEquals(body.code, "extension_mismatch");
  const details = body.details as Record<string, unknown>;
  assertEquals(details.extension, "exe");
});

Deno.test("PNG bytes with .jpg extension → 415 extension_mismatch", async () => {
  const { status, body } = await post(
    new File([PNG_SIG], "photo.jpg", { type: "image/png" }),
  );
  assertEquals(status, 415);
  assertEquals(body.code, "extension_mismatch");
});

Deno.test("SVG payload (script vector) → 415 mime_not_allowed", async () => {
  // SVG is intentionally NOT on the allow-list because it can carry <script>.
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>');
  const { status, body } = await post(
    new File([svg], "logo.svg", { type: "image/svg+xml" }),
  );
  assertEquals(status, 415);
  assertEquals(body.code, "mime_not_allowed");
});

Deno.test("HTML payload → 415 mime_not_allowed", async () => {
  const html = new TextEncoder().encode("<html><script>alert(1)</script></html>");
  const { status, body } = await post(
    new File([html], "page.html", { type: "text/html" }),
  );
  assertEquals(status, 415);
  assertEquals(body.code, "mime_not_allowed");
});
