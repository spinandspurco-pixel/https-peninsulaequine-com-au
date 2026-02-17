import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_LABELS: Record<string, string> = {
  beginner: "Foundation Lesson",
  intermediate: "Development Lesson",
  advanced: "Performance Lesson",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !webhookSecret) {
    console.error("Stripe keys not configured");
    return new Response(JSON.stringify({ error: "Stripe not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const stripe = (await import("https://esm.sh/stripe@14.21.0")).default(stripeKey);
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const sessionId = session.id;

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Update booking status
      const { data: booking, error: updateError } = await supabase
        .from("lesson_bookings")
        .update({ payment_status: "paid", status: "confirmed" })
        .eq("stripe_session_id", sessionId)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error("Failed to update booking:", updateError);
      }

      if (!booking) {
        console.error("No booking found for session:", sessionId);
        return new Response(JSON.stringify({ received: true, warning: "No matching booking" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch slot details
      const { data: slot } = await supabase
        .from("lesson_slots")
        .select("*")
        .eq("id", booking.slot_id)
        .maybeSingle();

      // Determine lesson label
      const lessonLabel = PRICE_LABELS[booking.experience_level] || "Riding Lesson";
      const depositDollars = (booking.deposit_amount_cents / 100).toFixed(2);
      const fullDollars = (booking.full_price_cents / 100).toFixed(2);
      const remainingDollars = ((booking.full_price_cents - booking.deposit_amount_cents) / 100).toFixed(2);

      // Send confirmation email to client
      try {
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        const fromEmail = Deno.env.get("FROM_EMAIL") || "Peninsula Equine <onboarding@resend.dev>";
        const notificationEmail = Deno.env.get("NOTIFICATION_EMAIL");

        if (resendApiKey && slot) {
          // Format date/time for display
          const [year, month, day] = slot.slot_date.split("-").map(Number);
          const timeParts = slot.start_time?.split(":").map(Number) ?? [9, 0];
          const startHour = timeParts[0] ?? 9;
          const startMin = timeParts[1] ?? 0;
          const startDate = new Date(year, month - 1, day, startHour, startMin);
          const readableDate = startDate.toLocaleDateString("en-AU", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          });
          const readableTime = `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`;

          // Build rich confirmation email with payment details
          const emailHtml = `
            <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #2d2418;">
              <div style="background: #2d2418; padding: 24px; text-align: center;">
                <h1 style="color: #f5f0e8; margin: 0; font-size: 22px;">Peninsula Equine</h1>
                <p style="color: #c9a227; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px;">PAYMENT CONFIRMED ✓</p>
              </div>
              <div style="padding: 32px 24px; background: #faf8f4;">
                <p style="font-size: 16px;">Hi ${booking.client_name},</p>
                <p>Great news — your deposit has been received and your lesson is <strong>confirmed</strong>!</p>
                
                <div style="background: white; border: 1px solid #e8e2d6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #555; width: 140px;">Lesson</td>
                      <td style="padding: 8px 0; color: #2d2418;">${lessonLabel}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #555;">Date</td>
                      <td style="padding: 8px 0; color: #2d2418;">${readableDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #555;">Time</td>
                      <td style="padding: 8px 0; color: #2d2418;">${readableTime} (Melbourne time)</td>
                    </tr>
                    ${booking.horse_name ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #555;">Horse</td><td style="padding: 8px 0; color: #2d2418;">${booking.horse_name}</td></tr>` : ""}
                  </table>
                </div>

                <div style="background: #f0ede6; border: 1px solid #e8e2d6; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px; color: #2d2418;">💳 Payment Summary</p>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="padding: 4px 0; color: #555;">Full lesson price</td>
                      <td style="padding: 4px 0; text-align: right; color: #2d2418;">$${fullDollars}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #555;">50% deposit paid</td>
                      <td style="padding: 4px 0; text-align: right; color: #2d8a2d; font-weight: 600;">−$${depositDollars} ✓</td>
                    </tr>
                    <tr style="border-top: 1px solid #ddd;">
                      <td style="padding: 8px 0 4px; font-weight: 600; color: #2d2418;">Remaining balance</td>
                      <td style="padding: 8px 0 4px; text-align: right; font-weight: 600; color: #2d2418;">$${remainingDollars}</td>
                    </tr>
                  </table>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #888;">Remaining balance due on the day of your lesson.</p>
                </div>

                ${booking.lesson_goals ? `<p style="font-style: italic; color: #666; background: #fff; padding: 12px; border-left: 3px solid #c9a227; margin: 16px 0;">📝 Goals: ${booking.lesson_goals}</p>` : ""}

                <div style="margin: 24px 0; padding: 16px; background: #fff; border: 1px solid #e8e2d6; border-radius: 8px;">
                  <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px;">📋 Before Your Lesson</p>
                  <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; color: #555; line-height: 1.8;">
                    <li>Arrive 15 minutes early</li>
                    <li>Bring approved riding helmet</li>
                    <li>Wear close-fitting trousers & boots with a heel</li>
                    <li>Horse groomed with hooves picked out</li>
                  </ul>
                </div>

                <div style="margin: 24px 0; padding: 16px; background: #f0ede6; border-radius: 8px;">
                  <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px;">📍 Location</p>
                  <p style="margin: 0; font-size: 14px; color: #555;">59 Tubbarubba Road, Merricks North, VIC 3926</p>
                </div>

                <p style="font-size: 14px;">Need to reschedule? Contact us at <a href="mailto:info@peninsulaequine.com.au" style="color: #c9a227;">info@peninsulaequine.com.au</a> or call <a href="tel:+61418585489" style="color: #c9a227;">0418 585 489</a>.</p>

                <p style="margin-top: 24px;">See you soon!<br/><strong>— Glenn & The Peninsula Equine Team</strong></p>
              </div>
              <div style="background: #2d2418; padding: 16px; text-align: center;">
                <p style="color: #8a7e6a; margin: 0; font-size: 11px;">Peninsula Equine · 59 Tubbarubba Road, Merricks North, VIC 3926</p>
              </div>
            </div>
          `;

          // Send to client
          const clientRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [booking.client_email],
              subject: `Lesson Confirmed: ${lessonLabel} on ${readableDate}`,
              html: emailHtml,
            }),
          });

          if (!clientRes.ok) {
            console.error("Client email failed:", await clientRes.text());
          } else {
            console.log("Client confirmation email sent to:", booking.client_email);
          }

          // Notify staff
          const staffRecipients: string[] = [];
          if (notificationEmail) staffRecipients.push(notificationEmail);
          const trainerEmail = "glenn@peninsulaequine.com.au";
          if (!staffRecipients.includes(trainerEmail)) staffRecipients.push(trainerEmail);

          if (staffRecipients.length > 0) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: fromEmail,
                to: staffRecipients,
                subject: `💰 Deposit Paid: ${booking.client_name} — ${lessonLabel} on ${readableDate}`,
                html: `
                  <div style="font-family: sans-serif; max-width: 500px;">
                    <h2 style="color: #2d8a2d;">✓ Deposit Received</h2>
                    <p><strong>${booking.client_name}</strong> (${booking.client_email}) has paid their deposit:</p>
                    <ul>
                      <li><strong>Lesson:</strong> ${lessonLabel}</li>
                      <li><strong>Date:</strong> ${readableDate}</li>
                      <li><strong>Time:</strong> ${readableTime}</li>
                      <li><strong>Deposit Paid:</strong> $${depositDollars} AUD</li>
                      <li><strong>Remaining:</strong> $${remainingDollars} AUD (due on day)</li>
                      ${booking.horse_name ? `<li><strong>Horse:</strong> ${booking.horse_name}</li>` : ""}
                      ${booking.client_phone ? `<li><strong>Phone:</strong> ${booking.client_phone}</li>` : ""}
                    </ul>
                    ${booking.lesson_goals ? `<p><strong>Goals:</strong> ${booking.lesson_goals}</p>` : ""}
                  </div>
                `,
              }),
            });
          }
        } else {
          // Fallback: use existing send-booking-confirmation function
          await supabase.functions.invoke("send-booking-confirmation", {
            body: {
              clientName: booking.client_name,
              clientEmail: booking.client_email,
              serviceType: lessonLabel,
              bookingDate: slot?.slot_date || new Date().toISOString().split("T")[0],
              bookingTime: slot?.start_time || "09:00",
              durationMinutes: 60,
              notes: booking.lesson_goals || undefined,
            },
          });
        }
      } catch (emailErr) {
        console.error("Confirmation email failed:", emailErr);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
