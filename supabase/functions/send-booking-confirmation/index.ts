import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BookingConfirmationRequest {
  bookingId?: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  bookingDate: string; // YYYY-MM-DD
  bookingTime?: string; // HH:MM
  durationMinutes?: number;
  notes?: string;
  timezone?: string;
}

/** Generate an .ics calendar file string */
function generateICS(opts: {
  summary: string;
  description: string;
  location: string;
  dtStart: string; // yyyyMMddTHHmmss
  dtEnd: string;
  organizer: string;
  attendee: string;
}): string {
  const uid = crypto.randomUUID() + "@peninsulaequine.com";
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peninsula Equine//Booking//EN",
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
    `ORGANIZER;CN=Peninsula Equine:mailto:${opts.organizer}`,
    `ATTENDEE;RSVP=TRUE;CN=${opts.attendee}:mailto:${opts.attendee}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Booking reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Pad a number to 2 digits */
function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL");
    const fromEmail =
      Deno.env.get("FROM_EMAIL") || "Peninsula Equine <onboarding@resend.dev>";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const body: BookingConfirmationRequest = await req.json();

    if (!body.clientName || !body.clientEmail || !body.bookingDate) {
      throw new Error("Missing required fields: clientName, clientEmail, bookingDate");
    }

    // Parse date + time
    const [year, month, day] = body.bookingDate.split("-").map(Number);
    const timeParts = body.bookingTime?.split(":").map(Number) ?? [9, 0];
    const startHour = timeParts[0] ?? 9;
    const startMin = timeParts[1] ?? 0;
    const duration = body.durationMinutes ?? 60;

    const startDate = new Date(year, month - 1, day, startHour, startMin);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    const dtStart = `${year}${pad(month)}${pad(day)}T${pad(startHour)}${pad(startMin)}00`;
    const dtEnd = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

    const readableDate = startDate.toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const readableTime = `${pad(startHour)}:${pad(startMin)}`;

    // Generate ICS
    const icsContent = generateICS({
      summary: `${body.serviceType} — Peninsula Equine`,
      description: `Your ${body.serviceType} booking with Peninsula Equine.${body.notes ? `\n\nNotes: ${body.notes}` : ""}`,
      location: "Peninsula Equine, Mornington Peninsula, VIC",
      dtStart,
      dtEnd,
      organizer: "ciro@peninsulaequine.com",
      attendee: body.clientEmail,
    });

    // Base64-encode the ICS file for Resend attachment
    const icsBase64 = btoa(icsContent);

    // Build confirmation email HTML
    const emailHtml = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #2d2418;">
        <div style="background: #2d2418; padding: 24px; text-align: center;">
          <h1 style="color: #f5f0e8; margin: 0; font-size: 22px;">Peninsula Equine</h1>
          <p style="color: #b8a88a; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">BOOKING CONFIRMED ✓</p>
        </div>
        <div style="padding: 32px 24px; background: #faf8f4;">
          <p style="font-size: 16px;">Hi ${body.clientName},</p>
          <p>Your booking has been confirmed! Here are the details:</p>
          
          <div style="background: white; border: 1px solid #e8e2d6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #555; width: 120px;">Service</td>
                <td style="padding: 8px 0; color: #2d2418;">${body.serviceType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #555;">Date</td>
                <td style="padding: 8px 0; color: #2d2418;">${readableDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #555;">Time</td>
                <td style="padding: 8px 0; color: #2d2418;">${readableTime} (Melbourne time)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #555;">Duration</td>
                <td style="padding: 8px 0; color: #2d2418;">${duration} minutes</td>
              </tr>
            </table>
          </div>

          ${body.notes ? `<p style="font-style: italic; color: #666; background: #fff; padding: 12px; border-left: 3px solid #c9a227; margin: 16px 0;">📝 ${body.notes}</p>` : ""}

          <div style="background: #fff; border: 1px solid #e8e2d6; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #2d2418;">📅 Add to Your Calendar</p>
            <p style="margin: 0; font-size: 13px; color: #666;">Open the attached <strong>booking.ics</strong> file to add this booking to your calendar automatically.</p>
          </div>

          <div style="margin: 24px 0; padding: 16px; background: #f0ede6; border-radius: 8px;">
            <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px;">📍 Location</p>
            <p style="margin: 0; font-size: 14px; color: #555;">Peninsula Equine, Mornington Peninsula, VIC</p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #555;">Want to schedule a follow-up consultation?</p>
            <a href="https://peninsulaequine.lovable.app/schedule" style="background: #c9a227; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">📅 Schedule a Follow-Up</a>
          </div>

          <p style="font-size: 14px;">Need to reschedule? Contact us at <a href="mailto:ciro@peninsulaequine.com" style="color: #c9a227;">ciro@peninsulaequine.com</a> or call <a href="tel:+15551234567" style="color: #c9a227;">(555) 123-4567</a>.</p>

          <p style="margin-top: 24px;">See you soon!<br/><strong>— Ciro & The Peninsula Equine Team</strong></p>
        </div>
        <div style="background: #2d2418; padding: 16px; text-align: center;">
          <p style="color: #8a7e6a; margin: 0; font-size: 11px;">Peninsula Equine · Mornington Peninsula, VIC</p>
        </div>
      </div>
    `;

    // Send confirmation to client with .ics attachment
    const clientEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [body.clientEmail],
        subject: `Booking Confirmed: ${body.serviceType} on ${readableDate}`,
        html: emailHtml,
        attachments: [
          {
            filename: "booking.ics",
            content: icsBase64,
            content_type: "text/calendar; method=REQUEST",
          },
        ],
      }),
    });

    if (!clientEmailRes.ok) {
      const errText = await clientEmailRes.text();
      console.error("Failed to send confirmation email:", errText);
      throw new Error(`Email send failed: ${errText}`);
    }

    // Notify staff
    if (notificationEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [notificationEmail],
          subject: `New Booking: ${body.clientName} — ${body.serviceType} on ${readableDate}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px;">
              <h2>New Booking Confirmed</h2>
              <p><strong>${body.clientName}</strong> (${body.clientEmail}) has booked:</p>
              <ul>
                <li><strong>Service:</strong> ${body.serviceType}</li>
                <li><strong>Date:</strong> ${readableDate}</li>
                <li><strong>Time:</strong> ${readableTime}</li>
                <li><strong>Duration:</strong> ${duration} min</li>
              </ul>
              ${body.notes ? `<p>Notes: ${body.notes}</p>` : ""}
            </div>
          `,
          attachments: [
            {
              filename: "booking.ics",
              content: icsBase64,
              content_type: "text/calendar; method=REQUEST",
            },
          ],
        }),
      });
    }

    const result = await clientEmailRes.json();
    console.log("Booking confirmation sent:", result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in send-booking-confirmation:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
