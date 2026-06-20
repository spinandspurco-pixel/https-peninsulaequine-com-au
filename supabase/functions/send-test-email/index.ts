import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  recipient?: string;
  sender?: "hq" | "noreply" | "bookings" | "quotes" | "from";
}

const SENDER_SECRET_MAP: Record<string, string> = {
  hq: "HQ_EMAIL_FROM",
  noreply: "NOREPLY_EMAIL_FROM",
  bookings: "BOOKINGS_EMAIL_FROM",
  quotes: "QUOTES_EMAIL_FROM",
  from: "FROM_EMAIL",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // ── AuthZ: admin only ──────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json(401, { error: "Unauthorized" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return json(401, { error: "Unauthorized" });
    }
    const userId = claims.claims.sub as string;
    const userEmail = (claims.claims.email as string | undefined) ?? null;

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin, error: roleErr } = await adminClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleErr || !isAdmin) {
      return json(403, { error: "Forbidden — admin role required" });
    }

    // ── Inputs ─────────────────────────────────────────
    const body: TestEmailRequest = await req.json().catch(() => ({}));
    const senderKey = body.sender ?? "hq";
    const senderSecret = SENDER_SECRET_MAP[senderKey];
    if (!senderSecret) {
      return json(400, { error: `Unknown sender '${senderKey}'` });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return json(500, { error: "RESEND_API_KEY not configured" });
    }
    const FROM = Deno.env.get(senderSecret);
    if (!FROM || /resend\.dev/i.test(FROM)) {
      return json(500, {
        error: `Sender secret ${senderSecret} missing or still points to resend.dev`,
      });
    }

    const recipient = (body.recipient || userEmail || "").trim();
    if (!recipient || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient)) {
      return json(400, { error: "Valid recipient email required" });
    }

    // ── Send ───────────────────────────────────────────
    const resend = new Resend(RESEND_API_KEY);
    const startedAt = new Date().toISOString();
    const subject = `Peninsula Equine — transactional test (${senderKey})`;
    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#faf8f4;color:#2d2418;">
        <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a227;margin:0 0 12px;">Peninsula Equine · Diagnostic</p>
        <h1 style="font-family:Georgia,serif;font-weight:300;font-size:22px;margin:0 0 16px;">Transactional email test</h1>
        <p style="font-size:14px;line-height:1.7;color:#444;">This is an admin-triggered diagnostic to confirm the <strong>${senderKey}</strong> sender (<code>${FROM.replace(/</g, "&lt;")}</code>) is delivering through Resend with verified DNS.</p>
        <p style="font-size:12px;color:#888;margin-top:24px;">Triggered ${startedAt} · by ${userEmail ?? userId}</p>
      </div>`;

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [recipient],
      reply_to: "info@peninsulaequine.org",
      subject,
      html,
    });

    const logRow = {
      triggered_by: userId,
      triggered_by_email: userEmail,
      sender_key: senderKey,
      from_address: FROM,
      recipient,
      subject,
      status: error ? "failed" : "sent",
      resend_id: (data as any)?.id ?? null,
      error_message: error
        ? (typeof error === "string" ? error : (error as any).message ?? JSON.stringify(error))
        : null,
      raw: error ?? data ?? null,
    };
    await adminClient.from("email_diagnostic_log").insert(logRow);

    if (error) {
      console.error("[send-test-email] Resend error:", error);
      return json(502, {
        ok: false,
        sender: senderKey,
        from: FROM,
        recipient,
        startedAt,
        error: logRow.error_message,
        raw: error,
      });
    }

    return json(200, {
      ok: true,
      sender: senderKey,
      from: FROM,
      recipient,
      replyTo: "info@peninsulaequine.org",
      subject,
      startedAt,
      finishedAt: new Date().toISOString(),
      resendId: (data as any)?.id ?? null,
      raw: data,
    });
  } catch (err) {
    console.error("[send-test-email] Unhandled error:", err);
    return json(500, {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
