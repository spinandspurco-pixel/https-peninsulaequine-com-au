import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WelcomeRequest {
  email: string;
  name: string;
  source?: string;
  // If step is provided, send that specific step; otherwise send step 1
  step?: number;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
const WELCOME_REPLY_TO = "info@peninsulaequine.org";
const SITE_URL = "https://peninsulaequine.lovable.app";

function assertSender(): Response | null {
  if (!FROM_EMAIL || /resend\.dev/i.test(FROM_EMAIL)) {
    console.error(
      "[send-welcome-series] FROM_EMAIL secret missing or points to resend.dev — refusing to send."
    );
    return new Response(
      JSON.stringify({ error: "Email sender not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  return null;
}

// ── Welcome Series Emails ──────────────────────────────────────────

function emailStep1(name: string): { subject: string; html: string } {
  const first = name.split(" ")[0] || "there";
  return {
    subject: `Welcome to Peninsula Equine, ${first}!`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c0a09;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0a09;">
<tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1c1917;border-radius:12px;border:1px solid #292524;">

<!-- Header -->
<tr><td style="padding:32px 32px 16px;text-align:center;">
  <h1 style="margin:0;font-size:28px;color:#c8a96e;font-family:Georgia,serif;">Welcome to the Herd</h1>
  <div style="width:60px;height:2px;background:#c8a96e;margin:16px auto;"></div>
</td></tr>

<!-- Body -->
<tr><td style="padding:0 32px 24px;color:#d6d3d1;font-size:15px;line-height:1.7;">
  <p>Hi ${first},</p>
  <p>Thank you for reaching out to Peninsula Equine. We're a family-run operation on Victoria's Mornington Peninsula, and we're thrilled you're interested in what we do.</p>
  <p>Over the next few days we'll share some helpful resources to get you started:</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr><td style="padding:12px 16px;background:#292524;border-radius:8px;border-left:3px solid #c8a96e;">
      <p style="margin:0 0 4px;color:#c8a96e;font-weight:bold;font-size:14px;">📩 Coming Up</p>
      <ul style="margin:8px 0 0;padding-left:20px;color:#a8a29e;font-size:14px;">
        <li style="margin-bottom:6px;"><strong style="color:#d6d3d1;">Tomorrow:</strong> Our top tips for your first visit</li>
        <li style="margin-bottom:6px;"><strong style="color:#d6d3d1;">Day 3:</strong> Meet the team & see our facilities</li>
      </ul>
    </td></tr>
  </table>
  <p>In the meantime, feel free to explore our services or get in touch with any questions.</p>
</td></tr>

<!-- CTA -->
<tr><td style="padding:0 32px 32px;text-align:center;">
  <a href="${SITE_URL}/services" style="display:inline-block;padding:14px 32px;background:#c8a96e;color:#1c1917;font-weight:bold;font-size:14px;border-radius:999px;text-decoration:none;">Explore Our Services</a>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:1px solid #292524;text-align:center;">
  <p style="margin:0;color:#78716c;font-size:12px;">Peninsula Equine · Mornington Peninsula, VIC</p>
  <p style="margin:8px 0 0;color:#78716c;font-size:11px;">
    <a href="${SITE_URL}" style="color:#c8a96e;text-decoration:none;">Visit Website</a> · 
    <a href="${SITE_URL}/contact" style="color:#c8a96e;text-decoration:none;">Contact Us</a>
  </p>
</td></tr>

</table></td></tr></table></body></html>`,
  };
}

function emailStep2(name: string): { subject: string; html: string } {
  const first = name.split(" ")[0] || "there";
  return {
    subject: `Your First Visit — What to Know, ${first}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c0a09;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0a09;">
<tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1c1917;border-radius:12px;border:1px solid #292524;">

<tr><td style="padding:32px 32px 16px;text-align:center;">
  <h1 style="margin:0;font-size:26px;color:#c8a96e;font-family:Georgia,serif;">Preparing for Your Visit</h1>
  <div style="width:60px;height:2px;background:#c8a96e;margin:16px auto;"></div>
</td></tr>

<tr><td style="padding:0 32px 24px;color:#d6d3d1;font-size:15px;line-height:1.7;">
  <p>Hi ${first},</p>
  <p>Whether you're booking a lesson, touring our facilities, or planning a build — here's what to keep in mind:</p>
  
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr><td style="padding:16px;background:#292524;border-radius:8px;">
      <p style="margin:0 0 12px;color:#c8a96e;font-weight:bold;font-size:15px;">✅ Visitor Checklist</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;color:#d6d3d1;font-size:14px;">🥾 Wear closed-toe shoes or riding boots</td></tr>
        <tr><td style="padding:6px 0;color:#d6d3d1;font-size:14px;">👖 Comfortable, long pants recommended</td></tr>
        <tr><td style="padding:6px 0;color:#d6d3d1;font-size:14px;">🧢 Hat & sunscreen — we're outdoors!</td></tr>
        <tr><td style="padding:6px 0;color:#d6d3d1;font-size:14px;">📱 Arrive 10 minutes early for check-in</td></tr>
        <tr><td style="padding:6px 0;color:#d6d3d1;font-size:14px;">🐴 No experience needed — we start from the basics</td></tr>
      </table>
    </td></tr>
  </table>

  <p>We pride ourselves on a welcoming, pressure-free environment. Our team will guide you every step of the way.</p>
</td></tr>

<tr><td style="padding:0 32px 32px;text-align:center;">
  <a href="${SITE_URL}/book-lesson" style="display:inline-block;padding:14px 32px;background:#c8a96e;color:#1c1917;font-weight:bold;font-size:14px;border-radius:999px;text-decoration:none;">Book a Lesson</a>
  <span style="display:inline-block;width:12px;"></span>
  <a href="${SITE_URL}/faq" style="display:inline-block;padding:14px 32px;background:transparent;color:#c8a96e;font-weight:bold;font-size:14px;border-radius:999px;text-decoration:none;border:1px solid #c8a96e;">Read FAQs</a>
</td></tr>

<tr><td style="padding:24px 32px;border-top:1px solid #292524;text-align:center;">
  <p style="margin:0;color:#78716c;font-size:12px;">Peninsula Equine · Mornington Peninsula, VIC</p>
</td></tr>

</table></td></tr></table></body></html>`,
  };
}

function emailStep3(name: string): { subject: string; html: string } {
  const first = name.split(" ")[0] || "there";
  return {
    subject: `Meet the Team Behind Peninsula Equine`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c0a09;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0a09;">
<tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1c1917;border-radius:12px;border:1px solid #292524;">

<tr><td style="padding:32px 32px 16px;text-align:center;">
  <h1 style="margin:0;font-size:26px;color:#c8a96e;font-family:Georgia,serif;">Meet Our Team</h1>
  <div style="width:60px;height:2px;background:#c8a96e;margin:16px auto;"></div>
</td></tr>

<tr><td style="padding:0 32px 24px;color:#d6d3d1;font-size:15px;line-height:1.7;">
  <p>Hi ${first},</p>
  <p>Peninsula Equine is built on decades of horsemanship, craftsmanship, and a genuine love of the equestrian lifestyle.</p>
  
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr><td style="padding:16px;background:#292524;border-radius:8px;border-left:3px solid #c8a96e;">
      <p style="margin:0 0 8px;color:#c8a96e;font-weight:bold;font-size:15px;">🏗️ What We Offer</p>
      <ul style="margin:8px 0 0;padding-left:20px;color:#a8a29e;font-size:14px;">
        <li style="margin-bottom:6px;"><strong style="color:#d6d3d1;">Custom Equestrian Facilities</strong> — Barns, arenas, round pens</li>
        <li style="margin-bottom:6px;"><strong style="color:#d6d3d1;">Riding Lessons</strong> — All levels, all ages</li>
        <li style="margin-bottom:6px;"><strong style="color:#d6d3d1;">Clinics &amp; Events</strong> — Horsemanship workshops &amp; community days</li>
        <li style="margin-bottom:6px;"><strong style="color:#d6d3d1;">Horse Boarding</strong> — Premium care on the Peninsula</li>
      </ul>
    </td></tr>
  </table>

  <p>We'd love to hear more about your goals. Whether it's a dream barn, your first ride, or anything in between — let's make it happen.</p>
</td></tr>

<tr><td style="padding:0 32px 32px;text-align:center;">
  <a href="${SITE_URL}/about" style="display:inline-block;padding:14px 32px;background:#c8a96e;color:#1c1917;font-weight:bold;font-size:14px;border-radius:999px;text-decoration:none;">About Us</a>
  <span style="display:inline-block;width:12px;"></span>
  <a href="${SITE_URL}/gallery" style="display:inline-block;padding:14px 32px;background:transparent;color:#c8a96e;font-weight:bold;font-size:14px;border-radius:999px;text-decoration:none;border:1px solid #c8a96e;">View Gallery</a>
</td></tr>

<tr><td style="padding:24px 32px;border-top:1px solid #292524;text-align:center;">
  <p style="margin:0;color:#78716c;font-size:12px;">Peninsula Equine · Mornington Peninsula, VIC</p>
  <p style="margin:8px 0 0;color:#78716c;font-size:11px;">You received this because you signed up at peninsulaequine.org. <a href="${SITE_URL}" style="color:#c8a96e;text-decoration:none;">Unsubscribe</a></p>
</td></tr>

</table></td></tr></table></body></html>`,
  };
}

const SERIES = [emailStep1, emailStep2, emailStep3];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, name, source, step } = body as WelcomeRequest;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Batch mode (cron) requires service-role / internal secret
    const INTERNAL_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET");
    const callerSecret = req.headers.get("x-internal-secret") ?? "";
    const isInternalCall = !!INTERNAL_SECRET && callerSecret === INTERNAL_SECRET;

    // ── Batch mode (cron): process subscribers needing next step ──
    if (!email) {
      if (!isInternalCall) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results: Array<{ email: string; step: number; success: boolean }> = [];

      // Step 2: subscribed >24h ago, still on step 1
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: step2 } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("email, name")
        .eq("series_step", 1)
        .lt("last_email_sent_at", oneDayAgo)
        .is("unsubscribed_at", null)
        .limit(50);

      for (const sub of step2 || []) {
        const { subject, html } = SERIES[1](sub.name || "Friend");
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM_EMAIL, to: [sub.email], subject, html }),
        });
        const ok = res.ok;
        await res.text();
        if (ok) {
          await supabaseAdmin.from("newsletter_subscribers").update({ series_step: 2, last_email_sent_at: new Date().toISOString() }).eq("email", sub.email);
        }
        results.push({ email: sub.email, step: 2, success: ok });
      }

      // Step 3: last email >48h ago, still on step 2
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: step3 } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("email, name")
        .eq("series_step", 2)
        .lt("last_email_sent_at", twoDaysAgo)
        .is("unsubscribed_at", null)
        .limit(50);

      for (const sub of step3 || []) {
        const { subject, html } = SERIES[2](sub.name || "Friend");
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM_EMAIL, to: [sub.email], subject, html }),
        });
        const ok = res.ok;
        await res.text();
        if (ok) {
          await supabaseAdmin.from("newsletter_subscribers").update({ series_step: 3, last_email_sent_at: new Date().toISOString() }).eq("email", sub.email);
        }
        results.push({ email: sub.email, step: 3, success: ok });
      }

      console.log(`Batch processed ${results.length} welcome emails`);
      return new Response(JSON.stringify({ success: true, processed: results }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Single-send mode (form submission) ──
    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Only step 1 allowed from public callers; later steps require internal secret
    const requestedStep = step ?? 1;
    if (requestedStep !== 1 && !isInternalCall) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Tie public sends to a legitimate recent form submission to prevent abuse
    if (!isInternalCall) {
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const [{ data: inq }, { data: sub }] = await Promise.all([
        supabaseAdmin.from("inquiries").select("id").ilike("email", email).gte("created_at", tenMinAgo).limit(1),
        supabaseAdmin.from("newsletter_subscribers").select("email").ilike("email", email).gte("created_at", tenMinAgo).limit(1),
      ]);
      if ((!inq || inq.length === 0) && (!sub || sub.length === 0)) {
        return new Response(JSON.stringify({ error: "No matching recent submission" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    const sendStep = requestedStep;
    const idx = Math.min(Math.max(sendStep, 1), SERIES.length) - 1;
    const { subject, html } = SERIES[idx](name || "Friend");


    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject, html }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(
        JSON.stringify({ success: false, error: resendData.message || "Send failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert subscriber record and advance series step
    await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          name: name || null,
          source: source || "website",
          series_step: sendStep,
          last_email_sent_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    console.log(`Welcome series step ${sendStep} sent to ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        step: sendStep,
        totalSteps: SERIES.length,
        emailId: resendData.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Welcome series error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
