import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  recipient?: string;
  domain?: string;
  records?: Array<{
    label: string;
    type: string;
    host: string;
    resolvers: Array<{ label: string; state: string; resolved?: string[] }>;
  }>;
  attempts?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json(401, { error: "Unauthorized" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) return json(401, { error: "Unauthorized" });
    const userId = claims.claims.sub as string;
    const userEmail = (claims.claims.email as string | undefined) ?? null;

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) return json(403, { error: "Forbidden — admin role required" });

    const body: Body = await req.json().catch(() => ({}));
    const recipient = (body.recipient || userEmail || "").trim();
    if (!recipient || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient)) {
      return json(400, { error: "Valid recipient email required" });
    }

    // ── Server-side rate limiting ──────────────────────
    // 5-min cooldown between sends, max 4 sends per user per hour.
    const COOLDOWN_MS = 5 * 60_000;
    const RATE_WINDOW_MS = 60 * 60_000;
    const RATE_MAX = 4;
    const sinceIso = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { data: recent, error: rateErr } = await adminClient
      .from("dns_notify_sends")
      .select("sent_at")
      .eq("user_id", userId)
      .gte("sent_at", sinceIso)
      .order("sent_at", { ascending: false });
    if (rateErr) {
      console.error("[notify-dns-propagated] rate lookup failed", rateErr);
      return json(500, { error: "rate_lookup_failed" });
    }
    const sends = recent ?? [];
    if (sends.length > 0) {
      const lastMs = new Date(sends[0].sent_at).getTime();
      const cooldownLeft = COOLDOWN_MS - (Date.now() - lastMs);
      if (cooldownLeft > 0) {
        const retry = Math.ceil(cooldownLeft / 1000);
        return new Response(
          JSON.stringify({ ok: false, error: "cooldown", retryAfterSeconds: retry }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(retry) } },
        );
      }
    }
    if (sends.length >= RATE_MAX) {
      const oldestMs = new Date(sends[sends.length - 1].sent_at).getTime();
      const resetLeft = RATE_WINDOW_MS - (Date.now() - oldestMs);
      const retry = Math.max(1, Math.ceil(resetLeft / 1000));
      return new Response(
        JSON.stringify({
          ok: false,
          error: "rate_limited",
          limit: RATE_MAX,
          windowSeconds: RATE_WINDOW_MS / 1000,
          retryAfterSeconds: retry,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(retry) } },
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) return json(500, { error: "RESEND_API_KEY not configured" });
    const FROM = Deno.env.get("HQ_EMAIL_FROM") || Deno.env.get("FROM_EMAIL");
    if (!FROM) return json(500, { error: "HQ_EMAIL_FROM not configured" });

    const domain = body.domain || "peninsulaequine.systems";
    const at = new Date().toISOString();
    const rows = (body.records ?? []).map((r) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;">${r.label} <span style="color:#999;font-size:11px;">${r.type}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:11px;color:#666;">${r.host}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#0a7d4a;font-weight:600;">${r.resolvers.filter(x=>x.state==="pass").length}/${r.resolvers.length} green</td>
      </tr>`).join("");

    const subject = `✓ DNS propagated — ${domain}`;
    const html = `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#faf8f4;color:#2d2418;">
        <p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a227;margin:0 0 12px;">Peninsula Equine · DNS</p>
        <h1 style="font-weight:300;font-size:22px;margin:0 0 8px;">All resolvers green</h1>
        <p style="font-size:14px;line-height:1.7;color:#444;">DKIM, MX, and SPF for <strong>${domain}</strong> now resolve as expected across every checked resolver.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px;">${rows}</table>
        <p style="font-size:12px;color:#888;margin-top:24px;">Confirmed ${at}${body.attempts ? ` · after ${body.attempts} attempt(s)` : ""}</p>
      </div>`;

    const resend = new Resend(RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [recipient],
      reply_to: "info@peninsulaequine.systems",
      subject,
      html,
    });
    if (error) {
      console.error("[notify-dns-propagated] Resend error:", error);
      return json(502, { ok: false, error: (error as any).message ?? String(error) });
    }
    return json(200, { ok: true, recipient, resendId: (data as any)?.id ?? null });
  } catch (err) {
    console.error("[notify-dns-propagated] error:", err);
    return json(500, { ok: false, error: err instanceof Error ? err.message : String(err) });
  }
});
