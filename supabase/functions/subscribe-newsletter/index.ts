import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// IP rate limiter: 3 requests per 10 minutes
const ipLimits = new Map<string, { count: number; resetAt: number }>();
const IP_MAX = 3;
const IP_WINDOW_MS = 600_000;

function checkIpRate(ip: string): boolean {
  const now = Date.now();
  const entry = ipLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipLimits.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }
  if (entry.count >= IP_MAX) return false;
  entry.count++;
  return true;
}

const emailSchema = z.object({
  email: z.string().trim().email().max(255),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  if (!checkIpRate(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a few minutes." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const parsed = emailSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.issues[0].message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const email = parsed.data.email;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Check existing subscriber
  const { data: existing, error: fetchErr } = await supabase
    .from("newsletter_subscribers")
    .select("id, confirmed, last_email_sent_at, confirm_token")
    .eq("email", email)
    .maybeSingle();

  if (fetchErr) {
    console.error("DB fetch error:", fetchErr);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Already confirmed — don't send another email, just return success
  if (existing?.confirmed) {
    return new Response(
      JSON.stringify({ ok: true, message: "Already subscribed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Email-based rate limit: refuse if last email was < 2 min ago
  if (existing?.last_email_sent_at) {
    const lastSent = new Date(existing.last_email_sent_at).getTime();
    if (Date.now() - lastSent < 120_000) {
      return new Response(
        JSON.stringify({ error: "Confirmation email already sent. Please check your inbox." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  let confirmToken: string;

  if (existing) {
    // Re-generate token for unconfirmed subscriber
    const { data: updated, error: updateErr } = await supabase
      .from("newsletter_subscribers")
      .update({
        confirm_token: crypto.randomUUID(),
        last_email_sent_at: new Date().toISOString(),
        source: "footer",
      })
      .eq("id", existing.id)
      .select("confirm_token")
      .single();

    if (updateErr || !updated) {
      console.error("DB update error:", updateErr);
      return new Response(
        JSON.stringify({ error: "Something went wrong" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    confirmToken = updated.confirm_token;
  } else {
    // New subscriber
    const { data: inserted, error: insertErr } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email,
        source: "footer",
        confirmed: false,
        last_email_sent_at: new Date().toISOString(),
      })
      .select("confirm_token")
      .single();

    if (insertErr || !inserted) {
      console.error("DB insert error:", insertErr);
      return new Response(
        JSON.stringify({ error: "Something went wrong" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    confirmToken = inserted.confirm_token;
  }

  // Build confirm URL server-side
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const confirmUrl = `${supabaseUrl}/functions/v1/confirm-newsletter?token=${confirmToken}`;

  // Send confirmation email via Resend
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "hello@peninsulaequine.com";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#171A23;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#171A23;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#1E2130;border-radius:12px;overflow:hidden;">
        <tr><td style="height:4px;background:linear-gradient(90deg,#E8C067,#C9A54E);"></td></tr>
        <tr><td style="padding:40px 32px;text-align:center;">
          <h1 style="color:#E8C067;font-size:22px;margin:0 0 12px;">Confirm Your Subscription</h1>
          <p style="color:#F5F1E8;opacity:0.7;font-size:15px;line-height:1.6;margin:0 0 28px;">
            Thanks for signing up for Peninsula Equine updates! Click below to confirm your email and start receiving tips, news, and exclusive offers.
          </p>
          <a href="${confirmUrl}" style="display:inline-block;padding:14px 36px;background:#E8C067;color:#171A23;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">
            Confirm My Email
          </a>
          <p style="color:#F5F1E8;opacity:0.4;font-size:12px;margin:28px 0 0;line-height:1.5;">
            If you didn't sign up, you can safely ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Peninsula Equine <${NOTIFICATION_EMAIL}>`,
      to: [email],
      subject: "Confirm your Peninsula Equine subscription",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send confirmation email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
