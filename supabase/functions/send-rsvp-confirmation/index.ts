import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    `ORGANIZER;CN=Peninsula Equine:mailto:info@peninsulaequine.com.au`,
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

    const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "delivered@resend.dev";
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Peninsula Equine <onboarding@resend.dev>";

    const resend = new Resend(RESEND_API_KEY);
    const data: RSVPConfirmationRequest = await req.json();

    if (!data.name || !data.email || !data.eventTitle) {
      throw new Error("Missing required fields");
    }

    const isConfirmed = data.status === "confirmed";
    const formattedDate = new Date(data.eventDate + "T00:00:00").toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .event-box { background: #fff; padding: 20px; border-left: 4px solid #c9a227; margin: 20px 0; border-radius: 4px; }
          .event-box h3 { margin: 0 0 10px 0; color: #2c3e50; }
          .detail { margin: 5px 0; color: #555; font-size: 14px; }
          .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin: 15px 0; }
          .confirmed { background: #d4edda; color: #155724; }
          .waitlisted { background: #fff3cd; color: #856404; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">${isConfirmed ? "RSVP Confirmed!" : "You're on the Waitlist"}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Peninsula Equine Events</p>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>${isConfirmed
              ? "Your spot has been reserved! Here are your event details:"
              : "This event is currently full, but you're on the waitlist. We'll email you immediately if a spot opens up."
            }</p>
            
            <div class="event-box">
              <h3>${data.eventTitle}</h3>
              <p class="detail">📅 ${formattedDate}</p>
              ${data.eventTime ? `<p class="detail">🕐 ${data.eventTime}</p>` : ""}
              ${data.eventLocation ? `<p class="detail">📍 ${data.eventLocation}</p>` : ""}
              <p class="detail">👥 ${data.guests} ${data.guests === 1 ? "guest" : "guests"}</p>
            </div>

            <div style="text-align: center;">
              <span class="status-badge ${isConfirmed ? "confirmed" : "waitlisted"}">
                ${isConfirmed ? "✓ Confirmed" : "⏳ Waitlisted"}
              </span>
            </div>

            ${isConfirmed ? `
            <div style="background: #fff; padding: 16px; border: 1px solid #e8e2d6; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #2c3e50;">📅 Add to Your Calendar</p>
              <p style="margin: 0; font-size: 13px; color: #666;">Open the attached <strong>event.ics</strong> file to add this event to your calendar automatically.</p>
            </div>
            <p style="text-align: center; margin-top: 20px;">
              <a href="https://peninsulaequine.lovable.app/events" style="background: #c9a227; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">View Event Details</a>
            </p>
            ` : ""}

            <p style="margin-top: 25px;">
              See you there!<br>
              <strong>The Peninsula Equine Team</strong>
            </p>
          </div>
          <div class="footer">
            <p><strong>Peninsula Equine</strong> | Premium Equine Facilities</p>
            <p style="font-size: 11px; color: #999;">This is an automated confirmation of your RSVP.</p>
          </div>
        </div>
      </body>
      </html>
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
        from: FROM_EMAIL,
        to: [data.email],
        subject: isConfirmed
          ? `RSVP Confirmed: ${data.eventTitle}`
          : `Waitlist: ${data.eventTitle}`,
        html: confirmationHtml,
        ...(icsAttachments.length > 0 ? { attachments: icsAttachments } : {}),
      }),
      resend.emails.send({
        from: FROM_EMAIL,
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