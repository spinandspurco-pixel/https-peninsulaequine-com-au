import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// IP rate limiter: 10 attempts per 10 minutes
const ipLimits = new Map<string, { count: number; resetAt: number }>();
const IP_MAX = 10;
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  if (!checkIpRate(ip)) {
    // Log rate-limit hit
    const rlClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    rlClient.from("ab_test_events").insert({
      test_name: "newsletter_funnel",
      variant: "default",
      event_type: "confirm_rate_limited",
      visitor_id: ip,
      page_path: "/confirm-newsletter",
      metadata: { reason: "ip_throttle" },
    }).then(() => {});

    return new Response(confirmPage("Too many attempts. Please try again later.", false), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token || !UUID_RE.test(token)) {
    return new Response(confirmPage("Invalid or expired link.", false), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Look up subscriber by token
  const { data: subscriber, error: fetchError } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, name, confirmed")
    .eq("confirm_token", token)
    .maybeSingle();

  if (fetchError || !subscriber) {
    return new Response(confirmPage("Invalid or expired link.", false), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (subscriber.confirmed) {
    return new Response(confirmPage("You're already confirmed!", true), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Confirm the subscriber
  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({ confirmed: true, confirm_token: null })
    .eq("id", subscriber.id);

  if (updateError) {
    return new Response(confirmPage("Something went wrong. Please try again.", false), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Log confirmation analytics event
  supabase.from("ab_test_events").insert({
    test_name: "newsletter_funnel",
    variant: "default",
    event_type: "email_confirmed",
    visitor_id: ip,
    page_path: "/confirm-newsletter",
    metadata: { subscriber_id: subscriber.id },
  }).then(() => {});

  // Fire welcome series (fire-and-forget)
  supabase.functions.invoke("send-welcome-series", {
    body: { email: subscriber.email, name: subscriber.name || "", source: "newsletter-confirmed" },
  }).catch(() => {});

  return new Response(confirmPage("You're confirmed! Welcome to the herd. 🐴", true), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
});

function confirmPage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Newsletter Confirmation — Peninsula Equine</title>
  <style>
    body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#171A23; color:#F5F1E8; font-family:system-ui,sans-serif; }
    .card { text-align:center; max-width:400px; padding:3rem 2rem; }
    .icon { font-size:3rem; margin-bottom:1rem; }
    h1 { font-size:1.5rem; margin:0 0 0.5rem; color:${success ? "#E8C067" : "#ef4444"}; }
    p { font-size:0.95rem; opacity:0.7; line-height:1.5; }
    a { display:inline-block; margin-top:1.5rem; padding:0.75rem 2rem; background:#E8C067; color:#171A23; border-radius:8px; text-decoration:none; font-weight:600; font-size:0.875rem; }
    a:hover { opacity:0.9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✅" : "⚠️"}</div>
    <h1>${message}</h1>
    ${success ? '<p>You\'ll receive updates, tips, and exclusive offers from Peninsula Equine.</p><a href="/">Back to Peninsula Equine</a>' : '<p>This confirmation link may have expired or already been used.</p>'}
  </div>
</body>
</html>`;
}
