import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function generateICS(opts: {
  summary: string;
  description: string;
  location: string;
  dtStart: string;
  dtEnd: string;
  organizer: string;
  attendee: string;
}): string {
  const uid = crypto.randomUUID() + "@peninsulaequine.com";
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
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
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Your booking is coming up soon",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL");
    const fromEmail = Deno.env.get("FROM_EMAIL") || "Peninsula Equine <onboarding@resend.dev>";

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch bookings with unsent reminders that are due
    const { data: dueReminders, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("reminder_sent", false)
      .not("reminder_at", "is", null)
      .lte("reminder_at", new Date().toISOString())
      .in("status", ["confirmed", "pending"]);

    if (fetchError) {
      console.error("Failed to fetch reminders:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!dueReminders || dueReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders due", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;

    for (const booking of dueReminders) {
      if (!resendApiKey) continue;

      try {
        const [year, month, day] = booking.booking_date.split("-").map(Number);
        const timeParts = booking.booking_time?.split(":").map(Number) ?? [9, 0];
        const startHour = timeParts[0] ?? 9;
        const startMin = timeParts[1] ?? 0;
        const duration = booking.duration_minutes ?? 60;

        const startDate = new Date(year, month - 1, day, startHour, startMin);
        const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

        const dtStart = `${year}${pad(month)}${pad(day)}T${pad(startHour)}${pad(startMin)}00`;
        const dtEnd = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

        const bookingDate = startDate.toLocaleDateString("en-AU", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        });
        const readableTime = `${pad(startHour)}:${pad(startMin)}`;

        // Generate ICS calendar invite
        const icsContent = generateICS({
          summary: `${booking.service_type} — Peninsula Equine`,
          description: `Reminder: Your ${booking.service_type} booking with Peninsula Equine.${booking.notes ? `\nNotes: ${booking.notes}` : ""}`,
          location: "Peninsula Equine, Mornington Peninsula, VIC",
          dtStart,
          dtEnd,
          organizer: "ciro@peninsulaequine.com",
          attendee: booking.client_email,
        });
        const icsBase64 = btoa(icsContent);

        const emailHtml = `
          <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #2d2418;">
            <div style="background: #2d2418; padding: 24px; text-align: center;">
              <h1 style="color: #f5f0e8; margin: 0; font-size: 22px;">Peninsula Equine</h1>
              <p style="color: #b8a88a; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">BOOKING REMINDER</p>
            </div>
            <div style="padding: 32px 24px; background: #faf8f4;">
              <p style="font-size: 16px;">Hi ${booking.client_name},</p>
              <p>This is a friendly reminder about your upcoming booking:</p>
              <div style="background: white; border: 1px solid #e8e2d6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #555; width: 120px;">Service</td>
                    <td style="padding: 8px 0; color: #2d2418;">${booking.service_type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #555;">Date</td>
                    <td style="padding: 8px 0; color: #2d2418;">${bookingDate}</td>
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
              ${booking.notes ? `<p style="font-style: italic; color: #666; background: #fff; padding: 12px; border-left: 3px solid #c9a227; margin: 16px 0;">📝 ${booking.notes}</p>` : ""}
              
              <div style="background: #fff; border: 1px solid #e8e2d6; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 8px; font-weight: 600; color: #2d2418;">📅 Add to Your Calendar</p>
                <p style="margin: 0; font-size: 13px; color: #666;">Open the attached <strong>booking.ics</strong> file to add this to your calendar.</p>
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #555;">Need to reschedule?</p>
                <a href="https://peninsulaequine.lovable.app/schedule?name=${encodeURIComponent(booking.client_name)}&email=${encodeURIComponent(booking.client_email)}" style="background: #c9a227; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">📅 Reschedule Booking</a>
              </div>

              <p style="font-size: 14px;">Questions? Contact us at <a href="mailto:ciro@peninsulaequine.com" style="color: #c9a227;">ciro@peninsulaequine.com</a></p>
              <p style="margin-top: 24px;">See you soon!<br/><strong>— Ciro & The Peninsula Equine Team</strong></p>
            </div>
            <div style="background: #2d2418; padding: 16px; text-align: center;">
              <p style="color: #8a7e6a; margin: 0; font-size: 11px;">Peninsula Equine · Mornington Peninsula, VIC</p>
            </div>
          </div>
        `;

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [booking.client_email],
            subject: `Reminder: Your ${booking.service_type} booking on ${bookingDate}`,
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

        if (!emailRes.ok) {
          const errText = await emailRes.text();
          console.error(`Failed to send reminder for booking ${booking.id}:`, errText);
          continue;
        }

        // Notify staff
        if (notificationEmail) {
          const staffRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [notificationEmail],
              subject: `Reminder Sent: ${booking.client_name} — ${booking.service_type} on ${bookingDate}`,
              html: `<p>Reminder sent to <strong>${booking.client_name}</strong> (${booking.client_email}) for ${booking.service_type} on ${bookingDate} at ${readableTime}.</p>`,
            }),
          });
          await staffRes.text();
        }
      } catch (emailErr) {
        console.error(`Email error for booking ${booking.id}:`, emailErr);
        continue;
      }

      // Mark as sent
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ reminder_sent: true })
        .eq("id", booking.id);

      if (updateError) {
        console.error(`Failed to mark reminder sent for ${booking.id}:`, updateError);
      } else {
        sentCount++;
      }
    }

    return new Response(
      JSON.stringify({ message: `Sent ${sentCount} reminder(s)`, count: sentCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
