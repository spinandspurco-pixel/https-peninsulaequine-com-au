import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
        .single();

      if (updateError) {
        console.error("Failed to update booking:", updateError);
      }

      // Increment slot bookings if not already done
      if (booking) {
        const { data: slot } = await supabase
          .from("lesson_slots")
          .select("*")
          .eq("id", booking.slot_id)
          .single();

        if (slot) {
          // Send confirmation email
          try {
            await supabase.functions.invoke("send-booking-confirmation", {
              body: {
                clientName: booking.client_name,
                clientEmail: booking.client_email,
                serviceType: `Lesson Booking (Deposit Paid)`,
                bookingDate: slot.slot_date,
                bookingTime: slot.start_time,
                durationMinutes: 60,
                notes: booking.lesson_goals || undefined,
              },
            });
          } catch (emailErr) {
            console.error("Confirmation email failed:", emailErr);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
