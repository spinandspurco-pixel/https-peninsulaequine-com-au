import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the operations voice of Peninsula Equine — a premium equine facility builder on the Mornington Peninsula, Australia. You draft email replies to incoming project enquiries.

VOICE RULES (non-negotiable):
- 2–4 sentences maximum. Never exceed this.
- Quietly authoritative, technical, and confident.
- No exclamation marks. No emojis. No hype language.
- Never say "Thank you for reaching out", "I hope this finds you well", "We'd love to help", or any generic filler.
- Do NOT sound like a chatbot or customer service script.
- Sign off as "Peninsula Equine" — nothing else.

RESPONSE STRUCTURE:
1. Acknowledge what they described (1 sentence, specific — reference their actual project details).
2. Reframe or clarify the problem if relevant — show expertise (1 sentence).
3. Position how Peninsula Equine's approach solves it (1 sentence).
4. Guide to next step: either a call to discuss scope, or sending through a layout/photo for review (1 sentence).

RESTRICTIONS:
- Never provide specific pricing or cost estimates.
- Never make guarantees about timelines or outcomes.
- Never over-explain technical details — imply depth, don't lecture.
- Always leave room for human follow-up.

EXAMPLE TONE:
"The key difference is how the system behaves under load over time — not just how it looks on install."
"That size of arena will need a considered drainage approach before we specify the surface."
"Worth sending through a few photos of the current surface — that'll shape the plan."`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI gateway not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase config");
    }

    // ── AuthN: require a valid signed-in user ─────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Service-role client for role lookup and data access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── AuthZ: only admin/employee can generate AI drafts ─────────────────
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = new Set((roleRows ?? []).map((r) => r.role));
    const isPrivileged = roles.has("admin") || roles.has("employee");
    const isPreview = roles.has("preview");
    if (!isPrivileged || isPreview) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { inquiry_id } = await req.json();
    if (!inquiry_id || typeof inquiry_id !== "string") {
      return new Response(JSON.stringify({ error: "inquiry_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch inquiry
    const { data: inquiry, error: fetchErr } = await supabase
      .from("inquiries")
      .select("*")
      .eq("id", inquiry_id)
      .single();

    if (fetchErr || !inquiry) throw new Error("Inquiry not found");

    // Build context prompt
    const context = [
      `Client: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      inquiry.phone ? `Phone: ${inquiry.phone}` : null,
      inquiry.services?.length ? `Services: ${inquiry.services.join(", ")}` : null,
      inquiry.project_vision ? `Vision: ${inquiry.project_vision}` : null,
      inquiry.project_details ? `Details: ${inquiry.project_details}` : null,
      inquiry.budget_range ? `Budget: ${inquiry.budget_range}` : null,
      inquiry.preferred_start ? `Timeline: ${inquiry.preferred_start}` : null,
      inquiry.preferred_service ? `Primary interest: ${inquiry.preferred_service}` : null,
    ].filter(Boolean).join("\n");

    const userPrompt = `Draft a reply to this enquiry. Address them by first name only.\n\n${context}`;

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const draftMessage = aiData.choices?.[0]?.message?.content?.trim();
    if (!draftMessage) throw new Error("Empty AI response");

    // Generate subject line
    const firstName = inquiry.name.split(/\s+/)[0];
    const subjectLine = `Re: Your equine facility project`;

    // Save as follow-up draft
    const { data: draft, error: insertErr } = await supabase
      .from("follow_up_drafts")
      .insert({
        entity_id: inquiry.id,
        entity_type: "lead",
        client_name: inquiry.name,
        client_email: inquiry.email,
        draft_message: draftMessage,
        subject_line: subjectLine,
        stage: inquiry.deal_stage || "new",
        deal_value: inquiry.deal_value || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Failed to save draft:", insertErr);
      // Still return the draft even if save fails
      return new Response(JSON.stringify({
        success: true,
        draft: { draft_message: draftMessage, subject_line: subjectLine },
        saved: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      draft,
      saved: true,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("generate-enquiry-response error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
