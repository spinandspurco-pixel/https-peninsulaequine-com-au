import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "info@peninsulaequine.org";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOC_LABELS: Record<string, string> = {
  swms: "Safe Work Method Statement (SWMS)",
  work_permit: "Work Permit",
  risk_assessment: "Risk Assessment",
  payment_slip: "Weekly Payment Slip",
  site_inspection: "Site Inspection Report",
  event_checklist: "Event Safety Checklist",
};

const DOC_CATEGORY: Record<string, string> = {
  swms: "staff",
  work_permit: "staff",
  risk_assessment: "all",
  payment_slip: "all",
  site_inspection: "staff",
  event_checklist: "trainer",
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
    const category = DOC_CATEGORY[document_type] || "staff";

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

    // Role badge
    const roleBadge = category === "trainer"
      ? '<span style="display:inline-block;background:#9333ea;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-left:8px;">TRAINER</span>'
      : category === "staff"
        ? '<span style="display:inline-block;background:#f97316;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-left:8px;">STAFF</span>'
        : '';

    const emailHtml = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #171A23; color: #F5F1E8; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 20px; color: #E8C067;">📋 New Document Submission ${roleBadge}</h1>
          <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Submitted by ${submitted_by}</p>
        </div>
        <div style="border: 1px solid #ddd; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <h2 style="margin: 0 0 8px; font-size: 16px; color: #171A23;">${docLabel}</h2>
          <p style="font-size: 14px; color: #555; margin: 0 0 16px;">${title}</p>
          <div style="font-size: 14px; line-height: 1.8; color: #333;">
            ${summaryLines.slice(0, 20).join("<br />")}
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <div style="text-align: center; margin: 16px 0;">
            <a href="https://peninsulaequine.lovable.app/admin/documents" style="display:inline-block;background:#E8C067;color:#171A23;padding:10px 24px;border-radius:6px;font-weight:600;text-decoration:none;">Review in Document Portal</a>
          </div>
          <p style="font-size: 12px; color: #888; text-align: center;">
            Peninsula Equine · 59 Tubbarubba Rd, Merricks North VIC 3926
          </p>
        </div>
      </div>
    `;

    // Send to admin
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
    console.log("Admin notification sent:", result);

    // Send confirmation to submitter
    if (submitted_by && submitted_by.includes("@")) {
      const confirmHtml = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #171A23; color: #F5F1E8; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 20px; color: #E8C067;">✅ Document Received</h1>
            <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Your submission is now under review</p>
          </div>
          <div style="border: 1px solid #ddd; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; color: #333; line-height: 1.6;">
              Hi there,<br/><br/>
              Your <strong>${docLabel}</strong> titled "<strong>${title}</strong>" has been received and is pending admin review.
              You'll be notified once it's been approved.
            </p>
            <div style="margin: 20px 0; padding: 12px; background: #f0fdf4; border-radius: 6px; border-left: 4px solid #22c55e;">
              <p style="margin: 0; font-size: 13px; color: #166534;"><strong>Status:</strong> Submitted — Pending Review</p>
            </div>
            <div style="text-align: center; margin: 16px 0;">
              <a href="https://peninsulaequine.lovable.app/documents" style="display:inline-block;background:#E8C067;color:#171A23;padding:10px 24px;border-radius:6px;font-weight:600;text-decoration:none;">View Your Documents</a>
            </div>
            <p style="font-size: 12px; color: #888; text-align: center;">
              Peninsula Equine · 59 Tubbarubba Rd, Merricks North VIC 3926
            </p>
          </div>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Peninsula Equine <onboarding@resend.dev>",
          to: [submitted_by],
          subject: `✅ ${docLabel} Received — Peninsula Equine`,
          html: confirmHtml,
        }),
      });

      console.log("Confirmation email sent to:", submitted_by);
    }

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
