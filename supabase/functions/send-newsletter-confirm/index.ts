const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { email, confirmUrl } = await req.json();
  if (!email || !confirmUrl) {
    return new Response(JSON.stringify({ error: "Missing email or confirmUrl" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "hello@peninsulaequine.com";

  const html = `
<!DOCTYPE html>
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
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
