import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Peninsula Equine <onboarding@resend.dev>";
    const TO_EMAIL = "info@peninsulaequine.org";

    const resend = new Resend(RESEND_API_KEY);
    const data = await req.json();

    const { name, email, phone, propertyType, projectType, size, message, attachmentUrls } = data;

    if (!name || !email) throw new Error("Name and email are required");

    const field = (label: string, value: string | undefined) =>
      value ? `<tr><td style="padding:8px 12px;font-weight:600;color:#555;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eee;">${label}</td><td style="padding:8px 12px;color:#333;border-bottom:1px solid #eee;">${value}</td></tr>` : "";

    const attachmentSection = attachmentUrls?.length
      ? `<div style="margin-top:24px;padding:16px;background:#f5f3ee;border-left:3px solid #c9a227;">
           <p style="margin:0 0 8px;font-weight:600;color:#555;font-size:13px;">Uploaded Files (${attachmentUrls.length})</p>
           <p style="margin:0;font-size:12px;color:#888;">Files attached to inquiry — check storage bucket "inquiry-attachments"</p>
           ${attachmentUrls.map((url: string) => `<p style="margin:4px 0 0;font-size:12px;color:#666;">• ${url}</p>`).join("")}
         </div>`
      : "";

    const html = `<!DOCTYPE html><html><head><style>
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;}
    </style></head><body>
      <div style="max-width:580px;margin:0 auto;">
        <div style="background:#1a1d26;padding:28px 24px;text-align:center;">
          <h1 style="color:#f5f0e8;margin:0;font-size:18px;letter-spacing:0.5px;">New GroundLock Project Enquiry</h1>
          <p style="color:#c9a227;margin:8px 0 0;font-size:10px;letter-spacing:3px;text-transform:uppercase;">System Specification Request</p>
        </div>
        <div style="padding:28px 24px;background:#faf8f4;">
          <table style="width:100%;border-collapse:collapse;">
            ${field("Name", name)}
            ${field("Email", `<a href="mailto:${email}">${email}</a>`)}
            ${field("Phone", phone)}
            ${field("Property Type", propertyType)}
            ${field("Project Type", projectType)}
            ${field("Size", size)}
          </table>
          ${message ? `<div style="margin-top:20px;padding:16px;background:#fff;border-left:3px solid #c9a227;">
            <p style="margin:0 0 4px;font-weight:600;color:#555;font-size:13px;">Message</p>
            <p style="margin:0;color:#444;font-size:14px;white-space:pre-wrap;">${message}</p>
          </div>` : ""}
          ${attachmentSection}
        </div>
        <div style="background:#1a1d26;padding:14px;text-align:center;">
          <p style="color:#6a6050;margin:0;font-size:10px;letter-spacing:1px;">Via GroundLock™ Project Form · peninsulaequine.org</p>
        </div>
      </div>
    </body></html>`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `New GroundLock Project Enquiry — ${name}`,
      html,
      reply_to: email,
    });

    console.log("GroundLock enquiry email sent:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending GroundLock enquiry:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
