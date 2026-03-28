import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── Email templates ─────────────────────────────────── */

const EMAILS = [
  {
    step: 1,
    delayHours: 1, // 1 hour after submission
    subject: "Your Site Assessment Request",
    body: (name: string) => `
      <p>Hi ${name},</p>
      <p>Thanks for reaching out.</p>
      <p>I've received your enquiry and will review the details shortly.</p>
      <p>Each project is assessed based on ground conditions, scope, and current availability.</p>
      <p>I'll be in touch soon to discuss next steps.</p>
      <p style="margin-top:28px;">
        — Ciro<br/>
        <span style="color:#888;font-size:13px;">Peninsula Equine</span>
      </p>
    `,
  },
  {
    step: 2,
    delayHours: 24, // Next day
    subject: "Where Most Properties Go Wrong",
    body: (name: string) => `
      <p>Hi ${name},</p>
      <p>Most ground issues aren't surface problems.</p>
      <p>They start underneath — with poor drainage, unstable base layers, or incorrect build-up.</p>
      <p>From Dirt to Dynasty — that's how we approach every project.</p>
      <p>When it's done properly, the surface holds.<br/>
      When it's not, problems keep returning.</p>
      <p style="margin-top:28px;">
        — Ciro
      </p>
    `,
  },
  {
    step: 3,
    delayHours: 72, // Day 3-4
    subject: "Built Once. Built Properly.",
    body: (name: string) => `
      <p>Hi ${name},</p>
      <p>We don't approach projects as quick fixes.</p>
      <p>Every build is designed to perform long-term —
      consistent footing, proper drainage, and structures that hold up over time.</p>
      <p>It's a different way of building.<br/>
      And it's why the result lasts.</p>
      <p style="margin-top:28px;">
        — Ciro
      </p>
    `,
  },
  {
    step: 4,
    delayHours: 120, // Day 5-6
    subject: "Next Step",
    body: (name: string) => `
      <p>Hi ${name},</p>
      <p>If your project is something you're ready to move forward with,
      the next step is a site assessment.</p>
      <p>That's where we look at the land properly and determine what will actually work.</p>
      <p>Let me know a suitable time,<br/>
      and we can go from there.</p>
      <p style="margin-top:28px;">
        — Ciro<br/>
        <span style="color:#888;font-size:13px;">Peninsula Equine</span>
      </p>
    `,
  },
];

function wrapEmail(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; line-height: 1.7; color: #2d2418; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; }
    .header { background: #2d2418; padding: 24px; text-align: center; }
    .header h1 { color: #f5f0e8; margin: 0; font-size: 18px; font-family: Georgia, serif; letter-spacing: 2px; }
    .header p { color: #c9a227; margin: 6px 0 0; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; }
    .body { padding: 32px 24px; background: #faf8f4; font-size: 15px; }
    .footer { padding: 20px 24px; text-align: center; background: #f0ede6; font-size: 11px; color: #888; }
    .footer a { color: #c9a227; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Peninsula Equine</h1>
      <p>Engineered Infrastructure</p>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>Peninsula Equine · Mornington Peninsula, VIC</p>
      <p><a href="https://peninsulaequine.org">peninsulaequine.org</a> · 0418 585 489</p>
      <p style="margin-top:12px;font-size:10px;color:#aaa;">Built properly. From the ground up.</p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const resend = new Resend(RESEND_API_KEY);

    // Fetch nurture rows that are due and not completed
    const { data: dueNurtures, error: fetchError } = await supabase
      .from("inquiry_nurture")
      .select("*")
      .eq("completed", false)
      .lte("next_send_at", new Date().toISOString())
      .limit(10);

    if (fetchError) throw fetchError;
    if (!dueNurtures || dueNurtures.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;

    for (const nurture of dueNurtures) {
      const currentStep = nurture.step + 1; // step 0 = not started, send step 1
      const emailTemplate = EMAILS.find((e) => e.step === currentStep);

      if (!emailTemplate) {
        // All emails sent — mark complete
        await supabase
          .from("inquiry_nurture")
          .update({ completed: true, updated_at: new Date().toISOString() })
          .eq("id", nurture.id);
        continue;
      }

      const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Peninsula Equine <info@peninsulaequine.org>";
      
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [nurture.client_email],
          subject: emailTemplate.subject,
          html: wrapEmail(emailTemplate.body(nurture.client_name)),
        });

        // Calculate next send time
        const nextTemplate = EMAILS.find((e) => e.step === currentStep + 1);
        const nextSendAt = nextTemplate
          ? new Date(Date.now() + nextTemplate.delayHours * 60 * 60 * 1000).toISOString()
          : new Date().toISOString();
        const isComplete = !nextTemplate;

        await supabase
          .from("inquiry_nurture")
          .update({
            step: currentStep,
            next_send_at: nextSendAt,
            completed: isComplete,
            updated_at: new Date().toISOString(),
          })
          .eq("id", nurture.id);

        processed++;
        console.log(`Sent nurture email step ${currentStep} to ${nurture.client_email}`);
      } catch (sendErr) {
        console.error(`Failed to send nurture to ${nurture.client_email}:`, sendErr);
      }
    }

    return new Response(JSON.stringify({ processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Nurture processing error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
