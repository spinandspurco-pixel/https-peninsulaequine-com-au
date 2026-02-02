import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "delivered@resend.dev";
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Peninsula Equine <onboarding@resend.dev>";

    const resend = new Resend(RESEND_API_KEY);
    const inquiry: InquiryNotificationRequest = await req.json();

    // Validate required fields
    if (!inquiry.name || !inquiry.email) {
      throw new Error("Missing required fields: name and email");
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
                <div class="field-value">${inquiry.name}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value"><a href="mailto:${inquiry.email}">${inquiry.email}</a></div>
              </div>
              ${inquiry.phone ? `
              <div class="field">
                <div class="field-label">Phone</div>
                <div class="field-value"><a href="tel:${inquiry.phone}">${inquiry.phone}</a></div>
              </div>
              ` : ""}
              ${inquiry.preferredDate ? `
              <div class="field">
                <div class="field-label">Preferred Start Date</div>
                <div class="field-value">${inquiry.preferredDate}</div>
              </div>
              ` : ""}
            </div>

            <div class="section">
              <div class="section-title">Services Requested</div>
              <div class="highlight">${servicesList}</div>
            </div>

            ${inquiry.horseName || inquiry.horseAge || inquiry.horseBreed ? `
            <div class="section">
              <div class="section-title">Horse Details</div>
              ${inquiry.horseName ? `
              <div class="field">
                <div class="field-label">Horse Name(s)</div>
                <div class="field-value">${inquiry.horseName}</div>
              </div>
              ` : ""}
              ${inquiry.horseAge ? `
              <div class="field">
                <div class="field-label">Age(s)</div>
                <div class="field-value">${inquiry.horseAge}</div>
              </div>
              ` : ""}
              ${inquiry.horseBreed ? `
              <div class="field">
                <div class="field-label">Breed(s)</div>
                <div class="field-value">${inquiry.horseBreed}</div>
              </div>
              ` : ""}
            </div>
            ` : ""}

            <div class="section">
              <div class="section-title">Project Goals</div>
              <div class="highlight">${inquiry.goals || "Not specified"}</div>
            </div>

            <div class="section">
              <div class="section-title">Experience & Budget</div>
              <div class="field">
                <div class="field-label">Experience Level</div>
                <div class="field-value">${inquiry.experienceLevel || "Not specified"}</div>
              </div>
              <div class="field">
                <div class="field-label">Budget Range</div>
                <div class="field-value">${budgetDisplay}</div>
              </div>
            </div>

            ${inquiry.additionalNotes ? `
            <div class="section">
              <div class="section-title">Additional Notes</div>
              <div class="highlight">${inquiry.additionalNotes}</div>
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

    // Build the confirmation email HTML for the submitter
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .highlight { background: #fff; padding: 15px; border-left: 4px solid #c9a227; margin: 15px 0; }
          .services-list { margin: 0; padding-left: 20px; }
          .services-list li { margin-bottom: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .cta { background: #c9a227; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Thank You for Your Inquiry</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Peninsula Equine</p>
          </div>
          
          <div class="content">
            <p>Dear ${inquiry.name},</p>
            
            <p>Thank you for reaching out to Peninsula Equine! We've received your inquiry and are excited to learn more about your project.</p>
            
            <div class="highlight">
              <strong>Services you're interested in:</strong>
              <ul class="services-list">
                ${inquiry.services?.map(s => `<li>${s}</li>`).join("") || "<li>General inquiry</li>"}
              </ul>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <p>A member of our team will review your inquiry and get back to you within 1-2 business days. We'll discuss your project in detail and provide you with a personalized quote.</p>
            
            <p>In the meantime, feel free to explore our gallery to see examples of our recent work, or give us a call if you have any immediate questions.</p>
            
            <p style="margin-top: 25px;">
              We look forward to working with you!
            </p>
            
            <p>
              Warm regards,<br>
              <strong>The Peninsula Equine Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>Peninsula Equine | Premium Equine Facilities</p>
            <p>This is an automated confirmation of your inquiry submission.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send both emails in parallel
    const [notificationResponse, confirmationResponse] = await Promise.all([
      // Send the notification email to the business
      resend.emails.send({
        from: FROM_EMAIL,
        to: [NOTIFICATION_EMAIL],
        subject: `New Project Inquiry from ${inquiry.name}`,
        html: emailHtml,
        reply_to: inquiry.email,
      }),
      // Send the confirmation email to the submitter
      resend.emails.send({
        from: FROM_EMAIL,
        to: [inquiry.email],
        subject: "Thank You for Your Inquiry - Peninsula Equine",
        html: confirmationHtml,
      }),
    ]);

    console.log("Notification email sent:", notificationResponse);
    console.log("Confirmation email sent:", confirmationResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      data: { 
        notification: notificationResponse, 
        confirmation: confirmationResponse 
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
