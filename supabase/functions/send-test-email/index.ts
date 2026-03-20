const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TestEmailRequest {
  to: string;
  type: "transactional" | "marketing";
}

function transactionalHtml(to: string): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #2d2418;">
      <div style="background: #2d2418; padding: 28px; text-align: center;">
        <h1 style="color: #f5f0e8; margin: 0; font-size: 22px;">Peninsula Equine</h1>
        <p style="color: #c9a227; margin: 6px 0 0; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Transactional Test ✓</p>
      </div>
      <div style="padding: 32px 24px; background: #faf8f4;">
        <p style="font-size: 16px;">Hi there,</p>
        <p>This is a <strong>transactional email test</strong> from Peninsula Equine. If you're reading this, Resend deliverability is working correctly for booking confirmations, RSVP receipts, and inquiry auto-replies.</p>

        <div style="background: white; border: 1px solid #e8e2d6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #888; width: 120px;">Recipient</td>
              <td style="padding: 8px 0; color: #2d2418;">${to}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #888;">Type</td>
              <td style="padding: 8px 0; color: #2d2418;">Transactional</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #888;">Sent at</td>
              <td style="padding: 8px 0; color: #2d2418;">${new Date().toLocaleString("en-AU", { timeZone: "Australia/Melbourne" })}</td>
            </tr>
          </table>
        </div>

        <div style="background: #d4edda; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-weight: 600; color: #155724; font-size: 14px;">✅ Transactional emails are working</p>
          <p style="margin: 6px 0 0; color: #155724; font-size: 13px;">Booking confirmations, RSVP receipts, and inquiry auto-replies will deliver successfully.</p>
        </div>

        <div style="margin: 24px 0; padding: 16px; background: #fff; border: 1px solid #e8e2d6; border-radius: 8px;">
          <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px;">📋 What this test covers</p>
          <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; color: #555; line-height: 1.8;">
            <li>Resend API key validity</li>
            <li>Email rendering & layout</li>
            <li>Inbox deliverability (check spam folder too)</li>
            <li>Sender domain verification</li>
          </ul>
        </div>

        <p style="margin-top: 24px; font-size: 14px; color: #888;">This is a test email. No action required.</p>
      </div>
      <div style="background: #2d2418; padding: 16px; text-align: center;">
        <p style="color: #8a7e6a; margin: 0; font-size: 11px;">Peninsula Equine · Mornington Peninsula, VIC</p>
      </div>
    </div>
  `;
}

function marketingHtml(to: string): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #2d2418;">
      <div style="background: linear-gradient(135deg, #2d2418 0%, #3d3020 100%); padding: 36px 28px; text-align: center;">
        <h1 style="color: #f5f0e8; margin: 0; font-size: 26px; letter-spacing: 1px;">Peninsula Equine</h1>
        <div style="width: 60px; height: 2px; background: #c9a227; margin: 12px auto;"></div>
        <p style="color: #c9a227; margin: 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Marketing Test</p>
      </div>

      <div style="padding: 0;">
        <div style="background: #c9a227; padding: 20px 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">🐴 Upcoming Clinics & Events</h2>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">This is a sample marketing email layout</p>
        </div>

        <div style="padding: 32px 24px; background: #faf8f4;">
          <p style="font-size: 16px;">Hi there,</p>
          <p>This is a <strong>marketing email test</strong> to verify that promotional content, event announcements, and newsletter-style messages deliver correctly.</p>

          <!-- Sample Event Card -->
          <div style="background: white; border: 1px solid #e8e2d6; border-radius: 8px; overflow: hidden; margin: 20px 0;">
            <div style="background: #2d2418; padding: 14px 20px;">
              <h3 style="color: #f5f0e8; margin: 0; font-size: 16px;">🎯 Sample: Horsemanship Clinic</h3>
            </div>
            <div style="padding: 16px 20px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #888;">📅 Date</td>
                  <td style="padding: 6px 0; color: #2d2418;">Saturday, March 15, 2026</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888;">🕐 Time</td>
                  <td style="padding: 6px 0; color: #2d2418;">9:00 AM — 1:00 PM</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #888;">📍 Location</td>
                  <td style="padding: 6px 0; color: #2d2418;">Merricks North, VIC</td>
                </tr>
              </table>
              <div style="text-align: center; margin-top: 16px;">
                <a href="https://peninsulaequine.lovable.app/events" style="background: #c9a227; color: white; padding: 10px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">RSVP Now →</a>
              </div>
            </div>
          </div>

          <!-- Sample Promo Block -->
          <div style="background: #f0ede6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: #2d2418;">Now Booking: Riding Lessons</p>
            <p style="margin: 0 0 14px; font-size: 14px; color: #555;">Foundation · Development · Performance programs available</p>
            <a href="https://peninsulaequine.lovable.app/book-lesson" style="background: #2d2418; color: #f5f0e8; padding: 10px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">Browse Programs</a>
          </div>

          <div style="background: white; border: 1px solid #e8e2d6; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #888; width: 120px;">Recipient</td>
                <td style="padding: 8px 0; color: #2d2418;">${to}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #888;">Type</td>
                <td style="padding: 8px 0; color: #2d2418;">Marketing / Promotional</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #888;">Sent at</td>
                <td style="padding: 8px 0; color: #2d2418;">${new Date().toLocaleString("en-AU", { timeZone: "Australia/Melbourne" })}</td>
              </tr>
            </table>
          </div>

          <div style="background: #d4edda; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-weight: 600; color: #155724; font-size: 14px;">✅ Marketing emails are working</p>
            <p style="margin: 6px 0 0; color: #155724; font-size: 13px;">Promotional content, event announcements, and newsletters will deliver successfully.</p>
          </div>

          <p style="margin-top: 24px; font-size: 14px; color: #888;">This is a test email. No action required.</p>
        </div>
      </div>

      <div style="background: #2d2418; padding: 16px; text-align: center;">
        <p style="color: #8a7e6a; margin: 0; font-size: 11px;">Peninsula Equine · Mornington Peninsula, VIC</p>
        <p style="color: #6a6050; margin: 6px 0 0; font-size: 11px;">
          <a href="https://instagram.com/peninsulaequine" style="color: #8a7e6a; text-decoration: none;">Instagram</a> ·
          <a href="https://facebook.com/peninsulaequine" style="color: #8a7e6a; text-decoration: none;">Facebook</a>
        </p>
      </div>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");

    const fromEmail = Deno.env.get("FROM_EMAIL") || "Peninsula Equine <no-reply@notify.peninsulaequine.org>";

    const { to, type }: TestEmailRequest = await req.json();

    if (!to || !type) {
      throw new Error("Missing required fields: to, type");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      throw new Error("Invalid email address");
    }
    if (!["transactional", "marketing"].includes(type)) {
      throw new Error("Type must be 'transactional' or 'marketing'");
    }

    const html = type === "transactional" ? transactionalHtml(to) : marketingHtml(to);
    const subject = type === "transactional"
      ? "✅ Test: Transactional Email — Peninsula Equine"
      : "✅ Test: Marketing Email — Peninsula Equine";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      throw new Error(`Resend failed [${res.status}]: ${errText}`);
    }

    const result = await res.json();
    console.log(`Test ${type} email sent to ${to}:`, result);

    return new Response(
      JSON.stringify({ success: true, emailId: result.id, type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in send-test-email:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
