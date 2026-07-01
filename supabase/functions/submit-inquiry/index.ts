/**
 * submit-inquiry
 *
 * Server-side handler for public inquiry submissions.
 *
 *  • Anonymous (no JWT required) — this is a lead-capture endpoint.
 *  • Validates every field with Zod before touching the database.
 *  • Persists the row via the service role so RLS never blocks a legitimate
 *    submission and so the caller can't spoof server-controlled fields
 *    (status, is_demo, deal_stage, lead_tier, etc.).
 *  • Returns a structured confirmation payload the client can render:
 *      { ok: true, id, status, created_at, received }
 *  • Never echoes secrets. All logs go through a redactor.
 */

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* ── Redaction ─────────────────────────────────────────── */
const REDACTED = "[REDACTED]";
function redact(value: unknown): unknown {
  if (value == null) return value;
  const secrets = [
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    Deno.env.get("SUPABASE_ANON_KEY"),
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY"),
  ].filter((s): s is string => !!s && s.length > 8);
  const scrub = (s: string) =>
    secrets.reduce((acc, sec) => acc.split(sec).join(REDACTED), s);
  if (typeof value === "string") return scrub(value);
  if (value instanceof Error) {
    return { name: value.name, message: scrub(value.message), stack: value.stack ? scrub(value.stack) : undefined };
  }
  if (typeof value === "object") {
    try {
      return JSON.parse(scrub(JSON.stringify(value)));
    } catch {
      return value;
    }
  }
  return value;
}
const _origConsole = { log: console.log, warn: console.warn, error: console.error };
for (const k of ["log", "warn", "error"] as const) {
  console[k] = (...args: unknown[]) => _origConsole[k](...args.map(redact));
}

/* ── Payload schema ────────────────────────────────────── */
const AttachmentSchema = z.object({
  path: z.string().min(1).max(500),
  name: z.string().min(1).max(255),
  size: z.number().int().nonnegative().max(50 * 1024 * 1024),
  mime: z.string().min(1).max(200),
});

const InquirySchema = z.object({
  // Required
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  services: z.array(z.string().min(1).max(80)).min(1).max(20),

  // Optional contact / property
  phone: z.string().trim().max(30).optional().nullable(),
  preferred_contact: z.enum(["email", "phone", "text"]).optional(),

  // Optional project details
  project_vision: z.string().trim().max(2000).optional().nullable(),
  project_details: z.string().trim().max(2000).optional().nullable(),
  budget_range: z.string().trim().max(80).optional().nullable(),
  preferred_start: z.string().trim().max(80).optional().nullable(),
  preferred_service: z.string().trim().max(80).optional().nullable(),
  experience_level: z.string().trim().max(80).optional().nullable(),
  horse_name: z.string().trim().max(120).optional().nullable(),
  horse_age: z.string().trim().max(40).optional().nullable(),
  horse_breed: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),

  // Attachments (already validated + stored by validate-inquiry-upload)
  attachment_urls: z.array(z.string().max(500)).max(10).optional(),
  attachments: z.array(AttachmentSchema).max(10).optional(),

  // Optional client hint for source/campaign; never trusted for auth.
  source: z.string().trim().max(80).optional(),
});
export type InquiryPayload = z.infer<typeof InquirySchema>;

/* ── Handler ───────────────────────────────────────────── */
export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ ok: false, code: "method_not_allowed" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("submit-inquiry: server misconfigured (missing env)");
    return json({ ok: false, code: "server_misconfigured" }, 500);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, code: "invalid_json" }, 400);
  }

  const parsed = InquirySchema.safeParse(raw);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        code: "invalid_payload",
        errors: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }
  const p = parsed.data;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const row = {
    name: p.name,
    email: p.email.toLowerCase(),
    phone: p.phone?.trim() || null,
    preferred_contact: p.preferred_contact ?? "email",
    services: p.services,
    horse_name: p.horse_name ?? null,
    horse_age: p.horse_age ?? null,
    horse_breed: p.horse_breed ?? null,
    project_vision: p.project_vision ?? null,
    project_details: p.project_details ?? null,
    experience_level: p.experience_level ?? null,
    budget_range: p.budget_range ?? null,
    preferred_start: p.preferred_start ?? null,
    preferred_service: p.preferred_service ?? null,
    notes: p.notes ?? null,
    attachment_urls: p.attachment_urls ?? [],
    attachments: p.attachments ?? [],
    // Server-controlled fields — never sourced from the request:
    status: "new",
    is_demo: false,
  };

  const { data, error } = await supabase
    .from("inquiries")
    .insert(row)
    .select("id, status, created_at")
    .single();

  if (error || !data) {
    console.error("submit-inquiry: insert failed", error);
    return json({ ok: false, code: "persist_failed" }, 502);
  }

  const received = {
    name: row.name,
    email: row.email,
    services: row.services,
    attachment_count: row.attachment_urls.length,
    source: p.source ?? null,
  };

  return json(
    {
      ok: true,
      id: data.id,
      status: data.status,
      created_at: data.created_at,
      received,
      message: "Inquiry received.",
    },
    201,
  );
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(redact(body)), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

if ((import.meta as any).main !== false) {
  Deno.serve(handler);
}
