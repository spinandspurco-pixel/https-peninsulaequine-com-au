import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hardcoded prices (AUD cents) to prevent client-side tampering
const PRICE_MAP: Record<string, { full: number; deposit: number; label: string }> = {
  beginner:     { full: 9500,  deposit: 4750,  label: "Foundation Lesson" },
  intermediate: { full: 12000, deposit: 6000,  label: "Development Lesson" },
  advanced:     { full: 15000, deposit: 7500,  label: "Performance Lesson" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      slot_id,
      lesson_type,
      client_name,
      client_email,
      client_phone,
      horse_name,
      experience_level,
      lesson_goals,
    } = await req.json();

    // Validate required fields
    if (!slot_id || !lesson_type || !client_name || !client_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: slot_id, lesson_type, client_name, client_email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pricing = PRICE_MAP[lesson_type];
    if (!pricing) {
      return new Response(
        JSON.stringify({ error: `Invalid lesson_type: ${lesson_type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Init Supabase with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify slot availability
    const { data: slot, error: slotError } = await supabase
      .from("lesson_slots")
      .select("*")
      .eq("id", slot_id)
      .single();

    if (slotError || !slot) {
      return new Response(
        JSON.stringify({ error: "Slot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (slot.current_bookings >= slot.max_bookings) {
      return new Response(
        JSON.stringify({ error: "This slot is fully booked" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      // Stripe not configured yet — create booking as pending without payment
      const { data: booking, error: bookingError } = await supabase
        .from("lesson_bookings")
        .insert({
          slot_id,
          client_name,
          client_email,
          client_phone: client_phone || null,
          horse_name: horse_name || null,
          experience_level: experience_level || lesson_type,
          lesson_goals: lesson_goals || null,
          stripe_session_id: `pending_${crypto.randomUUID()}`,
          payment_status: "not_configured",
          deposit_amount_cents: pricing.deposit,
          full_price_cents: pricing.full,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) {
        console.error("Booking insert error:", bookingError);
        return new Response(
          JSON.stringify({ error: "Failed to create booking" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Increment bookings count
      await supabase.rpc("cleanup_expired_holds").catch(() => {});
      await supabase
        .from("lesson_slots")
        .update({ current_bookings: slot.current_bookings + 1 })
        .eq("id", slot_id);

      return new Response(
        JSON.stringify({
          success: true,
          mode: "no_payment",
          booking_id: booking.id,
          message: "Booking created without payment — Stripe is not configured yet.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stripe IS configured — create Checkout Session
    const stripe = (await import("https://esm.sh/stripe@14.21.0")).default(stripeKey);

    const origin = req.headers.get("origin") || "https://peninsulaequine.lovable.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: client_email,
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: `${pricing.label} — 50% Deposit`,
              description: `Deposit for ${pricing.label} on ${slot.slot_date} at ${slot.start_time}`,
            },
            unit_amount: pricing.deposit,
          },
          quantity: 1,
        },
      ],
      metadata: {
        slot_id,
        lesson_type,
        client_name,
        client_email,
        client_phone: client_phone || "",
        horse_name: horse_name || "",
        experience_level: experience_level || lesson_type,
        lesson_goals: lesson_goals || "",
      },
      success_url: `${origin}/book-lesson?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book-lesson?cancelled=true`,
    });

    // Create pending booking
    await supabase.from("lesson_bookings").insert({
      slot_id,
      client_name,
      client_email,
      client_phone: client_phone || null,
      horse_name: horse_name || null,
      experience_level: experience_level || lesson_type,
      lesson_goals: lesson_goals || null,
      stripe_session_id: session.id,
      payment_status: "pending",
      deposit_amount_cents: pricing.deposit,
      full_price_cents: pricing.full,
      status: "pending",
    });

    return new Response(
      JSON.stringify({ success: true, mode: "stripe", url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-lesson-checkout error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
