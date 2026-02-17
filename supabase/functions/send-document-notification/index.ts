import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "info@peninsulaequine.com.au";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOC_LABELS: Record<string, string> = {
  swms: "Safe Work Method Statement (SWMS)",
  payment_slip: "Weekly Payment Slip",
  site_inspection: "Site Inspection Report",
  event_checklist: "Event Safety Checklist",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_type, title, form_data, submitted_by } = await req.json();

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured — skipping email");
      return new Response(JSON.stringify({ success: false, reason: "No email API key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const docLabel = DOC_LABELS[document_type] || document_type;

    // Build a readable summary
    const summaryLines: string[] = [];
    if (form_data) {
      for (const [key, value] of Object.entries(form_data)) {
        if (typeof value === "string" && value) {
          summaryLines.push(`<strong>${key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:</strong> ${value}`);
        } else if (typeof value === "number") {
          summaryLines.push(`<strong>${key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:</strong> ${value}`);
        }
      }
    }

    const emailHtml = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #171A23; color: #F5F1E8; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 20px; color: #E8C067;">📋 ${docLabel}</h1>
          <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Submitted by ${submitted_by}</p>
        </div>
        <div style="border: 1px solid #ddd; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <h2 style="margin: 0 0 16px; font-size: 16px; color: #171A23;">${title}</h2>
          <div style="font-size: 14px; line-height: 1.8; color: #333;">
            ${summaryLines.slice(0, 20).join("<br />")}
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">
            View and manage all documents in the 
            <a href="https://peninsulaequine.lovable.app/admin" style="color: #E8C067;">Admin Dashboard</a>.
          </p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Peninsula Equine <onboarding@resend.dev>",
        to: [NOTIFICATION_EMAIL],
        subject: `📋 New ${docLabel} — ${title}`,
        html: emailHtml,
      }),
    });

    const result = await res.json();
    console.log("Email sent:", result);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending document notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
