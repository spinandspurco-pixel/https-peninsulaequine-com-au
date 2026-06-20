import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RSVPConfirmationRequest {
  name: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string | null;
  eventLocation?: string | null;
  eventDescription?: string | null;
  guests: number;
  status: "confirmed" | "waitlisted";
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function generateEventICS(opts: {
  summary: string;
  description: string;
  location: string;
  dtStart: string;
  dtEnd: string;
  attendee: string;
}): string {
  const uid = crypto.randomUUID() + "@peninsulaequine.com";
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peninsula Equine//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=Australia/Melbourne:${opts.dtStart}`,
    `DTEND;TZID=Australia/Melbourne:${opts.dtEnd}`,
    `SUMMARY:${opts.summary}`,
    `DESCRIPTION:${opts.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${opts.location}`,
    `ORGANIZER;CN=Peninsula Equine:mailto:info@peninsulaequine.org`,
    `ATTENDEE;RSVP=TRUE;CN=${opts.attendee}:mailto:${opts.attendee}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Event reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL");
    const BOOKINGS_FROM = Deno.env.get("BOOKINGS_EMAIL_FROM");
    const HQ_FROM = Deno.env.get("HQ_EMAIL_FROM");
    const BOOKINGS_REPLY_TO = "info@peninsulaequine.org";

    if (!BOOKINGS_FROM || !HQ_FROM || !NOTIFICATION_EMAIL
        || /resend\.dev/i.test(BOOKINGS_FROM) || /resend\.dev/i.test(HQ_FROM)) {
      console.error("[send-rsvp-confirmation] Missing or invalid sender secrets (BOOKINGS_EMAIL_FROM / HQ_EMAIL_FROM / NOTIFICATION_EMAIL)");
      return new Response(JSON.stringify({ error: "Email sender not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Require authenticated caller
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(RESEND_API_KEY);
    const data: RSVPConfirmationRequest = await req.json();

    if (!data.name || !data.email || !data.eventTitle) {
      throw new Error("Missing required fields");
    }

    // Verify caller owns the email OR is admin/employee
    const callerEmail = (userData.user.email ?? "").toLowerCase();
    if (callerEmail !== data.email.toLowerCase()) {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userData.user.id);
      const privileged = (roles ?? []).some((r: { role: string }) => ["admin", "employee"].includes(r.role));
      if (!privileged) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }


    const isConfirmed = data.status === "confirmed";
    const formattedDate = new Date(data.eventDate + "T00:00:00").toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Detect if this is a clinic/lesson-type event
    const titleLower = data.eventTitle.toLowerCase();
    const isClinic = titleLower.includes("clinic") || titleLower.includes("lesson") || titleLower.includes("workshop") || titleLower.includes("masterclass");

    // Format time for display
    const displayTime = data.eventTime
      ? (() => {
          const [h, m] = data.eventTime.split(":").map(Number);
          const ampm = h >= 12 ? "PM" : "AM";
          const h12 = h % 12 || 12;
          return `${h12}:${pad(m)} ${ampm}`;
        })()
      : null;

    const confirmationHtml = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #2d2418;">
        <div style="background: #2d2418; padding: 28px; text-align: center;">
          <h1 style="color: #f5f0e8; margin: 0; font-size: 22px;">Peninsula Equine</h1>
          <p style="color: #c9a227; margin: 6px 0 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">
            ${isConfirmed ? "RSVP Confirmed ✓" : "Waitlist Registered"}
          </p>
        </div>

        <div style="padding: 32px 24px; background: #faf8f4;">
          <p style="font-size: 16px;">Hi ${data.name},</p>

          ${isConfirmed
            ? `<p>Great news — your spot is secured! We're looking forward to seeing you${data.guests > 1 ? ` and your ${data.guests - 1} guest${data.guests > 2 ? "s" : ""}` : ""}.</p>`
            : `<p>This event is currently at capacity, but you're on the waitlist. We'll email you immediately if a spot opens up — no action needed on your end.</p>`
          }

          <!-- Event Details Card -->
          <div style="background: white; border: 1px solid #e8e2d6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="margin: 0 0 14px; font-size: 18px; color: #2d2418;">${data.eventTitle}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 7px 0; font-weight: 600; color: #888; width: 100px; font-size: 14px;">📅 Date</td>
                <td style="padding: 7px 0; color: #2d2418; font-size: 14px;">${formattedDate}</td>
              </tr>
              ${displayTime ? `
              <tr>
                <td style="padding: 7px 0; font-weight: 600; color: #888; font-size: 14px;">🕐 Time</td>
                <td style="padding: 7px 0; color: #2d2418; font-size: 14px;">${displayTime}</td>
              </tr>
              ` : ""}
              ${data.eventLocation ? `
              <tr>
                <td style="padding: 7px 0; font-weight: 600; color: #888; font-size: 14px;">📍 Location</td>
                <td style="padding: 7px 0; color: #2d2418; font-size: 14px;">${data.eventLocation}</td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 7px 0; font-weight: 600; color: #888; font-size: 14px;">👥 Guests</td>
                <td style="padding: 7px 0; color: #2d2418; font-size: 14px;">${data.guests} ${data.guests === 1 ? "person" : "people"}</td>
              </tr>
            </table>
          </div>

          ${data.eventDescription ? `
          <div style="font-style: italic; color: #555; background: #fff; padding: 14px 16px; border-left: 3px solid #c9a227; margin: 16px 0; font-size: 14px; line-height: 1.7;">
            ${data.eventDescription.slice(0, 300)}${data.eventDescription.length > 300 ? "…" : ""}
          </div>
          ` : ""}

          <div style="text-align: center; margin: 16px 0;">
            <span style="display: inline-block; padding: 6px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; ${isConfirmed ? "background: #d4edda; color: #155724;" : "background: #fff3cd; color: #856404;"}">
              ${isConfirmed ? "✓ Confirmed" : "⏳ Waitlisted"}
            </span>
          </div>

          ${isConfirmed ? `
          <!-- Calendar Invite -->
          <div style="background: #fff; border: 1px solid #e8e2d6; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #2d2418;">📅 Add to Your Calendar</p>
            <p style="margin: 0; font-size: 13px; color: #666;">Open the attached <strong>event.ics</strong> file to add this event to your calendar automatically.</p>
          </div>

          ${isClinic ? `
          <!-- Clinic Preparation Tips -->
          <div style="background: #fff; border: 1px solid #e8e2d6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-weight: 600; font-size: 14px; color: #2d2418;">📋 How to Prepare</p>
            <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; color: #555; line-height: 1.9;">
              <li>Arrive 15–20 minutes early for registration</li>
              <li>Wear close-fitting trousers and boots with a heel</li>
              <li>Bring your own approved riding helmet (limited spares available)</li>
              <li>Horse groomed, tacked, and hooves picked out before the session</li>
              <li>Bring water and sunscreen — we're outdoors!</li>
            </ul>
          </div>
          ` : `
          <!-- General Event Tips -->
          <div style="background: #fff; border: 1px solid #e8e2d6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-weight: 600; font-size: 14px; color: #2d2418;">📋 What to Bring</p>
            <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; color: #555; line-height: 1.9;">
              <li>Arrive 10–15 minutes early</li>
              <li>Wear closed-toe shoes suitable for a farm environment</li>
              <li>Bring sunscreen and a hat — we're on the Peninsula!</li>
            </ul>
          </div>
          `}

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://peninsulaequine.lovable.app/events" style="background: #c9a227; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 15px;">View All Upcoming Events</a>
          </div>
          ` : `
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://peninsulaequine.lovable.app/events" style="background: #c9a227; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 15px;">Browse Other Events</a>
          </div>
          `}

          <div style="background: #f0ede6; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 10px; font-weight: 600; color: #2d2418; font-size: 14px;">Questions? Get in touch</p>
            <p style="margin: 0; font-size: 14px; color: #555;">
              📞 <a href="tel:+61418585489" style="color: #c9a227; text-decoration: none;">0418 585 489</a>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              📧 <a href="mailto:info@peninsulaequine.org" style="color: #c9a227; text-decoration: none;">info@peninsulaequine.org</a>
            </p>
          </div>

          <p style="margin-top: 24px;">
            ${isConfirmed ? "See you there!" : "We'll be in touch if a spot opens up."}<br/>
            <strong>— Ciro & The Peninsula Equine Team</strong>
          </p>
        </div>

        <div style="background: #2d2418; padding: 16px; text-align: center;">
          <p style="color: #8a7e6a; margin: 0; font-size: 11px;">Peninsula Equine · Mornington Peninsula, VIC</p>
        </div>
      </div>
    `;

    // Generate .ics for confirmed RSVPs
    let icsAttachments: { filename: string; content: string; content_type: string }[] = [];
    if (isConfirmed && data.eventDate) {
      const [year, month, day] = data.eventDate.split("-").map(Number);
      const timeParts = data.eventTime?.split(":").map(Number) ?? [9, 0];
      const startHour = timeParts[0] ?? 9;
      const startMin = timeParts[1] ?? 0;
      const dtStart = `${year}${pad(month)}${pad(day)}T${pad(startHour)}${pad(startMin)}00`;
      const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(startHour + 2)}${pad(startMin)}00`;

      const icsContent = generateEventICS({
        summary: data.eventTitle,
        description: `${data.eventTitle} — Peninsula Equine\n${data.guests} guest(s)`,
        location: data.eventLocation || "Peninsula Equine, Mornington Peninsula, VIC",
        dtStart,
        dtEnd,
        attendee: data.email,
      });
      icsAttachments = [{
        filename: "event.ics",
        content: btoa(icsContent),
        content_type: "text/calendar; method=REQUEST",
      }];
    }

    // Send confirmation to attendee + notify business
    const [confirmRes, notifyRes] = await Promise.all([
      resend.emails.send({
        from: BOOKINGS_FROM,
        to: [data.email],
        reply_to: BOOKINGS_REPLY_TO,
        subject: isConfirmed
          ? `RSVP Confirmed: ${data.eventTitle}`
          : `Waitlist: ${data.eventTitle}`,
        html: confirmationHtml,
        ...(icsAttachments.length > 0 ? { attachments: icsAttachments } : {}),
      }),
      resend.emails.send({
        from: HQ_FROM,
        to: [NOTIFICATION_EMAIL],
        subject: `New RSVP: ${data.name} → ${data.eventTitle} (${data.status})`,
        html: `<p><strong>${data.name}</strong> (${data.email}) ${isConfirmed ? "confirmed" : "joined waitlist"} for <strong>${data.eventTitle}</strong> on ${formattedDate} — ${data.guests} guest(s).</p>`,
        reply_to: data.email,
      }),
    ]);

    console.log("RSVP confirmation sent:", confirmRes);
    console.log("RSVP notification sent:", notifyRes);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-rsvp-confirmation:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);