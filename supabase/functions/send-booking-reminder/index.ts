import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL");

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
      // Send email to client
      if (resendApiKey) {
        try {
          const bookingDate = new Date(booking.booking_date).toLocaleDateString(
            "en-AU",
            { weekday: "long", year: "numeric", month: "long", day: "numeric" }
          );

          const emailHtml = `
            <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #2d2418;">
              <div style="background: #2d2418; padding: 24px; text-align: center;">
                <h1 style="color: #f5f0e8; margin: 0; font-size: 22px;">Peninsula Equine</h1>
                <p style="color: #b8a88a; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">BOOKING REMINDER</p>
              </div>
              <div style="padding: 32px 24px; background: #faf8f4;">
                <p>Hi ${booking.client_name},</p>
                <p>This is a friendly reminder about your upcoming booking:</p>
                <div style="background: white; border: 1px solid #e8e2d6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0 0 8px;"><strong>Service:</strong> ${booking.service_type}</p>
                  <p style="margin: 0 0 8px;"><strong>Date:</strong> ${bookingDate}</p>
                  ${booking.booking_time ? `<p style="margin: 0 0 8px;"><strong>Time:</strong> ${booking.booking_time}</p>` : ""}
                  <p style="margin: 0;"><strong>Duration:</strong> ${booking.duration_minutes} minutes</p>
                </div>
                ${booking.notes ? `<p style="font-style: italic; color: #666;">Note: ${booking.notes}</p>` : ""}
                <p>If you need to reschedule or have any questions, please contact us.</p>
                <p style="margin-top: 24px;">See you soon!<br/>— The Peninsula Equine Team</p>
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
              from: "Peninsula Equine <onboarding@resend.dev>",
              to: [booking.client_email],
              subject: `Reminder: Your ${booking.service_type} booking on ${bookingDate}`,
              html: emailHtml,
            }),
          });

          if (!emailRes.ok) {
            const errText = await emailRes.text();
            console.error(`Failed to send email for booking ${booking.id}:`, errText);
            continue;
          }

          // Also notify staff
          if (notificationEmail) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Peninsula Equine <onboarding@resend.dev>",
                to: [notificationEmail],
                subject: `Booking Reminder Sent: ${booking.client_name} — ${booking.service_type}`,
                html: `<p>Reminder email sent to <strong>${booking.client_name}</strong> (${booking.client_email}) for their ${booking.service_type} on ${bookingDate}.</p>`,
              }),
            });
          }
        } catch (emailErr) {
          console.error(`Email error for booking ${booking.id}:`, emailErr);
          continue;
        }
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
