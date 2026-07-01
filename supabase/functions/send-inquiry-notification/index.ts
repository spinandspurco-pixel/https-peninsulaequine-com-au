import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InquiryNotificationRequest {
  name: string;
  email: string;
  phone?: string;
  services: string[];
  horseName?: string;
  horseAge?: string;
  horseBreed?: string;
  goals?: string;
  experienceLevel?: string;
  budgetRange?: string;
  preferredDate?: string;
  additionalNotes?: string;
}

/** Pad a number to 2 digits */
function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Escape arbitrary user input for safe HTML interpolation.
 * Prevents stored XSS / HTML injection in admin notification emails.
 * Use for ALL user-submitted fields rendered into the email body, attributes,
 * subject line, or URL parameters that end up inside HTML.
 */
function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Strict-ish URL-attribute sanitiser for href/src values built from user input.
 * Strips anything that isn't a plain printable ASCII subset and refuses
 * javascript:/data: schemes.
 */
function safeAttr(value: unknown): string {
  const s = esc(value).replace(/[\r\n\t]/g, "");
  if (/^\s*(javascript|data|vbscript):/i.test(String(value ?? ""))) return "";
  return s;
}

/**
 * Send an email through the connected Gmail account via the Lovable connector gateway.
 * Non-blocking: errors are logged but never thrown to the caller.
 */
async function sendViaGmail(opts: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; status?: number; error?: string; id?: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GOOGLE_MAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY");
  if (!LOVABLE_API_KEY || !GOOGLE_MAIL_API_KEY) {
    return { ok: false, error: "gmail_connector_not_configured" };
  }

  const headers = [
    `To: ${opts.to.join(", ")}`,
    `Subject: ${opts.subject.replace(/[\r\n]/g, " ")}`,
    opts.replyTo ? `Reply-To: ${opts.replyTo}` : "",
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset="UTF-8"`,
    "",
    opts.html,
  ].filter(Boolean).join("\r\n");

  // base64url encode (UTF-8 safe)
  const utf8 = new TextEncoder().encode(headers);
  let bin = "";
  for (let i = 0; i < utf8.length; i++) bin += String.fromCharCode(utf8[i]);
  const raw = btoa(bin)
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  try {
    const res = await fetch(
      "https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      },
    );
    const body = await res.text();
    if (!res.ok) {
      console.error("[send-inquiry-notification] Gmail send failed", res.status, body);
      return { ok: false, status: res.status, error: body };
    }
    let id: string | undefined;
    try { id = JSON.parse(body)?.id; } catch { /* ignore */ }
    return { ok: true, status: res.status, id };
  } catch (e) {
    console.error("[send-inquiry-notification] Gmail send threw", e);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Generate a .ics calendar invite for a suggested follow-up consultation */
function generateConsultationICS(opts: {
  clientName: string;
  clientEmail: string;
  services: string[];
  isConstruction: boolean;
}): { icsBase64: string; readableDate: string } {
  const uid = crypto.randomUUID() + "@peninsulaequine.systems";  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  // Suggest consultation 3 business days from now at 10am Melbourne time
  const suggestedDate = new Date();
  let daysToAdd = 3;
  while (daysToAdd > 0) {
    suggestedDate.setDate(suggestedDate.getDate() + 1);
    const dow = suggestedDate.getDay();
    if (dow !== 0 && dow !== 6) daysToAdd--;
  }
  const y = suggestedDate.getFullYear();
  const m = suggestedDate.getMonth() + 1;
  const d = suggestedDate.getDate();
  const dtStart = `${y}${pad(m)}${pad(d)}T100000`;
  const dtEnd = `${y}${pad(m)}${pad(d)}T110000`;

  const readableDate = suggestedDate.toLocaleDateString("en-AU", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const summary = opts.isConstruction
    ? "Peninsula Equine — Project Consultation"
    : "Peninsula Equine — Program Consultation";

  const description = `Follow-up consultation with Peninsula Equine regarding: ${opts.services.join(", ")}.\\n\\nThis is a suggested time — reply to this email if you'd like to reschedule.`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peninsula Equine//Inquiry//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=Australia/Melbourne:${dtStart}`,
    `DTEND;TZID=Australia/Melbourne:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:Peninsula Equine, Mornington Peninsula, VIC`,
    `ORGANIZER;CN=Peninsula Equine:mailto:info@peninsulaequine.systems`,
    `ATTENDEE;RSVP=TRUE;CN=${opts.clientName}:mailto:${opts.clientEmail}`,
    "STATUS:TENTATIVE",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Consultation reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const icsBytes = new TextEncoder().encode(ics);
  let icsBin = "";
  for (let i = 0; i < icsBytes.length; i++) icsBin += String.fromCharCode(icsBytes[i]);
  return { icsBase64: btoa(icsBin), readableDate };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Get notification email from secret or use default
    const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "info@peninsulaequine.systems";
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
    const HQ_FROM = Deno.env.get("HQ_EMAIL_FROM");
    const WELCOME_REPLY_TO = "info@peninsulaequine.systems";

    if (!FROM_EMAIL || !HQ_FROM || /resend\.dev/i.test(FROM_EMAIL) || /resend\.dev/i.test(HQ_FROM)) {
      console.error("[send-inquiry-notification] Missing or invalid sender secrets (FROM_EMAIL / HQ_EMAIL_FROM)");
      return new Response(JSON.stringify({ error: "Email sender not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(RESEND_API_KEY);
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalise: accept both inquiry-style and quote-style payloads
    const inquiry: InquiryNotificationRequest = {
      ...rawBody,
      name: rawBody.name ?? rawBody.client_name ?? "",
      email: rawBody.email ?? rawBody.client_email ?? "",
    };

    // Validate required fields + basic length limits to reject abuse payloads
    if (!inquiry.name || !inquiry.email) {
      throw new Error("Missing required fields: name and email");
    }
    if (typeof inquiry.name !== "string" || typeof inquiry.email !== "string") {
      return new Response(JSON.stringify({ error: "Invalid field types" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (inquiry.name.length > 200 || inquiry.email.length > 254) {
      return new Response(JSON.stringify({ error: "Field too long" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ABUSE GUARD: This endpoint is public so the website's anonymous contact
    // forms can trigger it without auth. To prevent spam abuse, verify that the
    // submitted email matches a recently-created inquiry (or recently-accepted
    // quote) in the database. The form flows always insert into `inquiries`
    // (or update `quotes`) immediately before invoking this function, so a
    // legitimate caller will always find a match.
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[send-inquiry-notification] Missing Supabase service credentials");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const normalisedEmail = inquiry.email.trim().toLowerCase();
    const recentCutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const [{ data: recentInquiries }, { data: recentQuotes }] = await Promise.all([
      admin
        .from("inquiries")
        .select("id")
        .ilike("email", normalisedEmail)
        .gte("created_at", recentCutoff)
        .limit(1),
      admin
        .from("quotes")
        .select("id")
        .ilike("client_email", normalisedEmail)
        .gte("updated_at", recentCutoff)
        .limit(1),
    ]);
    const hasRecentActivity =
      (recentInquiries && recentInquiries.length > 0) ||
      (recentQuotes && recentQuotes.length > 0);
    if (!hasRecentActivity) {
      console.warn("[send-inquiry-notification] Rejected: no recent inquiry/quote for", normalisedEmail);
      return new Response(
        JSON.stringify({ error: "No matching recent inquiry found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }


    // Format the services list
    const servicesList = inquiry.services?.length 
      ? inquiry.services.join(", ") 
      : "Not specified";

    // Format budget for display
    const budgetDisplay = inquiry.budgetRange?.replace(/-/g, " ").replace("plus", "+") || "Not specified";

    // Build the email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 10px; border-bottom: 2px solid #c9a227; padding-bottom: 5px; }
          .field { margin-bottom: 12px; }
          .field-label { font-weight: 600; color: #555; }
          .field-value { color: #333; margin-top: 2px; }
          .highlight { background: #fff; padding: 15px; border-left: 4px solid #c9a227; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">New Project Inquiry</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Peninsula Equine</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">Contact Information</div>
              <div class="field">
                <div class="field-label">Name</div>
                <div class="field-value">${esc(inquiry.name)}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value"><a href="mailto:${safeAttr(inquiry.email)}">${esc(inquiry.email)}</a></div>
              </div>
              ${inquiry.phone ? `
              <div class="field">
                <div class="field-label">Phone</div>
                <div class="field-value"><a href="tel:${safeAttr(inquiry.phone)}">${esc(inquiry.phone)}</a></div>
              </div>
              ` : ""}
              ${inquiry.preferredDate ? `
              <div class="field">
                <div class="field-label">Preferred Start Date</div>
                <div class="field-value">${esc(inquiry.preferredDate)}</div>
              </div>
              ` : ""}
            </div>

            <div class="section">
              <div class="section-title">Services Requested</div>
              <div class="highlight">${esc(servicesList)}</div>
            </div>

            ${inquiry.horseName || inquiry.horseAge || inquiry.horseBreed ? `
            <div class="section">
              <div class="section-title">Horse Details</div>
              ${inquiry.horseName ? `
              <div class="field">
                <div class="field-label">Horse Name(s)</div>
                <div class="field-value">${esc(inquiry.horseName)}</div>
              </div>
              ` : ""}
              ${inquiry.horseAge ? `
              <div class="field">
                <div class="field-label">Age(s)</div>
                <div class="field-value">${esc(inquiry.horseAge)}</div>
              </div>
              ` : ""}
              ${inquiry.horseBreed ? `
              <div class="field">
                <div class="field-label">Breed(s)</div>
                <div class="field-value">${esc(inquiry.horseBreed)}</div>
              </div>
              ` : ""}
            </div>
            ` : ""}

            <div class="section">
              <div class="section-title">Project Goals</div>
              <div class="highlight">${esc(inquiry.goals || "Not specified")}</div>
            </div>

            <div class="section">
              <div class="section-title">Experience & Budget</div>
              <div class="field">
                <div class="field-label">Experience Level</div>
                <div class="field-value">${esc(inquiry.experienceLevel || "Not specified")}</div>
              </div>
              <div class="field">
                <div class="field-label">Budget Range</div>
                <div class="field-value">${esc(budgetDisplay)}</div>
              </div>
            </div>

            ${inquiry.additionalNotes ? `
            <div class="section">
              <div class="section-title">Additional Notes</div>
              <div class="highlight">${esc(inquiry.additionalNotes)}</div>
            </div>
            ` : ""}
          </div>
          
          <div class="footer">
            <p>This inquiry was submitted via the Peninsula Equine website.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Tailored next-steps based on services requested
    const serviceLabels: Record<string, string> = {
      "arena-construction": "Arena Construction",
      "barn-construction": "Barn & Stable Construction",
      "full-facility": "Full Facility Design & Build",
      "riding-lessons": "Riding Lessons",
      "clinics-events": "Clinics & Events",
      "fencing": "Fencing & Paddocks",
      "round-pens": "Round Pens & Yards",
      "infrastructure": "Site Infrastructure",
      "renovations": "Facility Renovations",
      "general": "General Inquiry",
    };

    const formattedServices = (inquiry.services || ["general"]).map(
      (s: string) => serviceLabels[s] || s.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
    );

    // Build tailored next-steps section based on service category
    const isConstruction = (inquiry.services || []).some((s: string) =>
      ["arena-construction", "barn-construction", "full-facility", "infrastructure", "fencing", "round-pens", "renovations"].includes(s)
    );
    const isLessons = (inquiry.services || []).some((s: string) =>
      ["riding-lessons", "clinics-events"].includes(s)
    );

    let nextStepsHtml = "";
    if (isConstruction && isLessons) {
      nextStepsHtml = `
        <p style="font-weight: 600; margin-bottom: 8px;">Here's what happens next:</p>
        <ol style="padding-left: 20px; color: #555; line-height: 1.9;">
          <li><strong>Project review</strong> — Ciro will personally assess your construction requirements and site needs</li>
          <li><strong>Lesson matching</strong> — Glenn will review your riding goals and experience level to find the right program</li>
          <li><strong>Tailored proposal</strong> — We'll prepare a detailed quote and lesson schedule within 1–2 business days</li>
          <li><strong>Site visit</strong> — For builds, we'll arrange a property walkthrough at your convenience</li>
        </ol>
      `;
    } else if (isConstruction) {
      nextStepsHtml = `
        <p style="font-weight: 600; margin-bottom: 8px;">Here's what happens next:</p>
        <ol style="padding-left: 20px; color: #555; line-height: 1.9;">
          <li><strong>Project review</strong> — Ciro will personally assess your requirements, site conditions, and vision</li>
          <li><strong>Site visit</strong> — We'll arrange a property walkthrough to discuss layout, drainage, and logistics</li>
          <li><strong>Custom proposal</strong> — You'll receive a detailed scope of work and quote within 3–5 business days</li>
          <li><strong>Build timeline</strong> — Once approved, we'll lock in your start date and project milestones</li>
        </ol>
      `;
    } else if (isLessons) {
      nextStepsHtml = `
        <p style="font-weight: 600; margin-bottom: 8px;">Here's what happens next:</p>
        <ol style="padding-left: 20px; color: #555; line-height: 1.9;">
          <li><strong>Goal assessment</strong> — Glenn will review your riding experience and goals</li>
          <li><strong>Program recommendation</strong> — We'll suggest the right lesson tier (Foundation, Development, or Performance)</li>
          <li><strong>Schedule your first lesson</strong> — We'll send available times within 1–2 business days</li>
          <li><strong>Pre-lesson checklist</strong> — You'll get everything you need to prepare for day one</li>
        </ol>
      `;
    } else {
      nextStepsHtml = `
        <p style="font-weight: 600; margin-bottom: 8px;">Here's what happens next:</p>
        <ol style="padding-left: 20px; color: #555; line-height: 1.9;">
          <li><strong>Review</strong> — A member of our team will review your inquiry in detail</li>
          <li><strong>Personal follow-up</strong> — We'll reach out within 1–2 business days to discuss your project</li>
          <li><strong>Tailored recommendation</strong> — Based on our conversation, we'll outline the best path forward</li>
        </ol>
      `;
    }

    // Generate .ics calendar invite for suggested consultation
    const { icsBase64, readableDate: suggestedConsultDate } = generateConsultationICS({
      clientName: inquiry.name,
      clientEmail: inquiry.email,
      services: formattedServices,
      isConstruction,
    });

    // Tailored CTA based on service type
    const ctaUrl = isLessons
      ? `https://peninsulaequine.systems/book-lesson`
      : `https://peninsulaequine.systems/schedule?services=${encodeURIComponent((inquiry.services || []).join(","))}&name=${encodeURIComponent(inquiry.name || "")}&email=${encodeURIComponent(inquiry.email || "")}`;
    const ctaText = isLessons ? "Browse Lesson Programs" : "Schedule a Follow-Up Call";
    const ctaEmoji = isLessons ? "🐴" : "📅";

    // Build the premium confirmation email — calm, controlled, authority-positioned
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.7; color: #2d2418; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="background: #1a1d26; padding: 32px; text-align: center;">
            <h1 style="color: #f5f0e8; margin: 0; font-size: 20px; font-family: Georgia, serif; letter-spacing: 0.5px;">Peninsula Equine</h1>
            <p style="color: #c9a227; margin: 8px 0 0; font-size: 10px; letter-spacing: 3px; text-transform: uppercase;">Engineered Infrastructure</p>
          </div>
          
          <div style="padding: 36px 28px; background: #faf8f4;">
            <p style="font-size: 15px; color: #2d2418; margin: 0 0 20px;">Hi ${esc(String(inquiry.name).split(" ")[0])},</p>
            
            <p style="font-size: 15px; color: #444; margin: 0 0 18px;">Thanks for sending through your project.</p>
            
            <p style="font-size: 15px; color: #444; margin: 0 0 18px;">We've received the details and will review it against our current build schedule and scope.</p>
            
            <p style="font-size: 15px; color: #444; margin: 0 0 18px;">If it aligns, we'll organise a time to speak and walk through the next steps properly.</p>
            
            <p style="font-size: 15px; color: #444; margin: 0 0 28px;">In the meantime, feel free to gather any reference material or site details you think are relevant.</p>
            
            <div style="border-top: 1px solid #e8e2d6; padding-top: 24px; margin-top: 8px;">
              <p style="margin: 0; font-size: 14px; color: #2d2418; font-weight: 600;">— Peninsula Equine</p>
              <p style="margin: 6px 0 0; font-size: 12px; color: #999; letter-spacing: 0.3px;">Private projects · Discreet builds · Built for long-term ownership</p>
            </div>
          </div>
          
          <div style="background: #1a1d26; padding: 16px; text-align: center;">
            <p style="color: #6a6050; margin: 0; font-size: 10px; letter-spacing: 1px;">peninsulaequine.systems</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Determine recipients — always notify admin + Sander; add Glenn for lesson/clinic inquiries
    const notifyRecipients: string[] = [NOTIFICATION_EMAIL];
    const sanderEmail = "sander@peninsulaequine.systems";
    if (!notifyRecipients.includes(sanderEmail)) {
      notifyRecipients.push(sanderEmail);
    }
    const lessonServices = ["riding-lessons", "clinics-events"];
    const isLessonInquiry = inquiry.services?.some((s: string) => lessonServices.includes(s));
    const trainerEmail = "glenn@peninsulaequine.systems";
    if (isLessonInquiry && !notifyRecipients.includes(trainerEmail)) {
      notifyRecipients.push(trainerEmail);
    }

    // Send notification, confirmation, and Gmail mirror in parallel.
    // Gmail send is best-effort: failures are logged but don't fail the request.
    const [notificationResponse, confirmationResponse, gmailResponse] = await Promise.all([
      // Send the notification email to the business + trainer (via Resend, verified domain)
      resend.emails.send({
        from: HQ_FROM,
        to: notifyRecipients,
        subject: `New Project Inquiry from ${String(inquiry.name).replace(/[\r\n]/g, " ").slice(0, 120)}`,
        html: emailHtml,
        reply_to: inquiry.email,
      }),
      // Send the confirmation email to the submitter with .ics calendar invite
      resend.emails.send({
        from: FROM_EMAIL,
        to: [inquiry.email],
        reply_to: WELCOME_REPLY_TO,
        subject: "Project Received — Peninsula Equine",
        html: confirmationHtml,
      }),
      // Mirror notification through the connected Gmail inbox so it lands in the team's Gmail
      sendViaGmail({
        to: notifyRecipients,
        subject: `[Gmail] New Project Inquiry — ${String(inquiry.name).replace(/[\r\n]/g, " ").slice(0, 120)}`,
        html: emailHtml,
        replyTo: inquiry.email,
      }),
    ]);

    console.log("Notification email sent:", notificationResponse);
    console.log("Confirmation email sent:", confirmationResponse);
    console.log("Gmail notification:", gmailResponse);


    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        notification: notificationResponse, 
        confirmation: confirmationResponse,
        gmail: gmailResponse,
      } 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-inquiry-notification function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
