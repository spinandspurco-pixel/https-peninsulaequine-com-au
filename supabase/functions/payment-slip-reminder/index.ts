import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "info@peninsulaequine.com.au";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find the current week window (Mon–Sun)
    const now = new Date();
    const day = now.getUTCDay(); // 0=Sun
    const diffToMon = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() + diffToMon);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    // Get all employees/trainers (users with staff roles)
    const { data: staffRoles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["employee", "trainer", "admin"]);

    const staffUserIds = [...new Set((staffRoles || []).map(r => r.user_id))];

    if (staffUserIds.length === 0) {
      console.log("No staff users found");
      return new Response(JSON.stringify({ success: true, message: "No staff to remind" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check who already submitted a payment slip this week
    const { data: submittedDocs } = await supabase
      .from("staff_documents")
      .select("user_id")
      .eq("document_type", "payment_slip")
      .gte("submitted_at", weekStart.toISOString())
      .lte("submitted_at", weekEnd.toISOString())
      .eq("status", "submitted");

    const submittedUserIds = new Set((submittedDocs || []).map(d => d.user_id));
    const missingUserIds = staffUserIds.filter(id => !submittedUserIds.has(id));

    console.log(`Staff: ${staffUserIds.length}, Already submitted: ${submittedUserIds.size}, Missing: ${missingUserIds.length}`);

    // Get emails for missing users via auth admin
    const missingEmails: string[] = [];
    for (const uid of missingUserIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(uid);
      if (userData?.user?.email) {
        missingEmails.push(userData.user.email);
      }
    }

    // Send admin summary email
    if (RESEND_API_KEY) {
      const wedDeadline = new Date(weekStart);
      wedDeadline.setUTCDate(weekStart.getUTCDate() + 2); // Wednesday

      const summaryHtml = `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#171A23;color:#F5F1E8;padding:24px;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;font-size:20px;color:#E8C067;">💰 Weekly Payment Slip Reminder</h1>
            <p style="margin:8px 0 0;opacity:0.8;font-size:14px;">Wednesday Collection — Week of ${weekStart.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
            <h2 style="margin:0 0 12px;font-size:16px;color:#171A23;">📊 Submission Status</h2>
            <p style="font-size:14px;color:#333;line-height:1.6;">
              <strong>Total Staff:</strong> ${staffUserIds.length}<br/>
              <strong style="color:#22c55e;">✅ Submitted:</strong> ${submittedUserIds.size}<br/>
              <strong style="color:#ef4444;">⏳ Outstanding:</strong> ${missingUserIds.length}
            </p>
            ${missingEmails.length > 0 ? `
              <div style="margin-top:16px;padding:12px;background:#fef2f2;border-radius:6px;">
                <p style="font-size:13px;font-weight:600;margin:0 0 8px;color:#dc2626;">Outstanding Submissions:</p>
                <ul style="margin:0;padding-left:20px;font-size:13px;color:#333;">
                  ${missingEmails.map(e => `<li>${e}</li>`).join("")}
                </ul>
              </div>
            ` : `<p style="color:#22c55e;font-weight:600;">🎉 All staff have submitted this week!</p>`}
            <hr style="margin:20px 0;border:none;border-top:1px solid #eee;"/>
            <p style="font-size:12px;color:#888;">
              View all submissions in the <a href="https://peninsulaequine.lovable.app/admin/documents" style="color:#E8C067;">Admin Document Portal</a>.
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
          to: [NOTIFICATION_EMAIL],
          subject: `💰 Weekly Payment Slips — ${submittedUserIds.size}/${staffUserIds.length} Submitted`,
          html: summaryHtml,
        }),
      });

      console.log("Admin summary email sent");

      // Send reminder to each staff member who hasn't submitted
      for (const email of missingEmails) {
        const reminderHtml = `
          <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#171A23;color:#F5F1E8;padding:24px;border-radius:8px 8px 0 0;">
              <h1 style="margin:0;font-size:20px;color:#E8C067;">⏰ Payment Slip Reminder</h1>
              <p style="margin:8px 0 0;opacity:0.8;font-size:14px;">Your weekly timesheet is due today (Wednesday)</p>
            </div>
            <div style="border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
              <p style="font-size:14px;color:#333;line-height:1.6;">
                Hi there,<br/><br/>
                This is a friendly reminder to submit your <strong>weekly payment slip</strong> for the week of 
                <strong>${weekStart.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</strong>.
              </p>
              <div style="text-align:center;margin:24px 0;">
                <a href="https://peninsulaequine.lovable.app/staff-documents" style="display:inline-block;background:#E8C067;color:#171A23;padding:12px 28px;border-radius:6px;font-weight:600;text-decoration:none;">Submit Payment Slip</a>
              </div>
              <p style="font-size:12px;color:#888;text-align:center;">Peninsula Equine · 59 Tubbarubba Rd, Merricks North VIC 3926</p>
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
            to: [email],
            subject: "⏰ Your Weekly Payment Slip is Due — Peninsula Equine",
            html: reminderHtml,
          }),
        });

        console.log(`Reminder sent to ${email}`);
      }
    } else {
      console.warn("RESEND_API_KEY not configured — skipping emails");
    }

    return new Response(JSON.stringify({
      success: true,
      total_staff: staffUserIds.length,
      submitted: submittedUserIds.size,
      outstanding: missingUserIds.length,
      reminders_sent: missingEmails.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in payment slip reminder:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
