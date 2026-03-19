import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) throw new Error("Admin access required");

    const { entity_type, entity_id, client_name, client_email, context } = await req.json();

    // Build prompt
    let systemPrompt = `You are a follow-up message writer for Peninsula Equine, a premium equestrian facility builder in Victoria, Australia.

VOICE:
- Calm, direct, professional
- No exclamation marks, no hype, no spam language
- No "just checking in" or "touching base"
- 2-4 sentences maximum
- Include client's first name
- Reference the project naturally
- End with a clear, simple next step

NEVER:
- Use "Hi there!" or generic greetings
- Sound desperate or pushy
- Use marketing language
- Mention discounts or urgency tactics`;

    let userPrompt = "";

    if (entity_type === "lead") {
      const stage = context.stage || "none";
      const tier = context.tier || "standard";
      const services = (context.services || []).join(", ");
      const days = context.days_since_contact || 0;

      const stageGuidance: Record<string, string> = {
        none: "First follow-up. Acknowledge their enquiry, reference their project briefly, invite them to book a site assessment or reply with questions.",
        "1": "Second follow-up. Gently reinforce Peninsula Equine's approach — built once, built properly. Reference something specific about their project. Suggest a quick call.",
        "2": "Third follow-up. Brief and warm. Let them know the door is open. No pressure. Offer to answer any remaining questions.",
        final: "Final follow-up. Respectful close. Let them know you won't follow up again unless they reach out. Leave on a positive, professional note.",
      };

      userPrompt = `Write a follow-up email for:
Client: ${client_name}
Email: ${client_email}
Lead Tier: ${tier}
Services interested in: ${services}
Project vision: ${context.vision || "Not specified"}
Days since last contact: ${days}
Follow-up stage: ${stage}

Guidance: ${stageGuidance[stage] || stageGuidance.none}

${tier === "premium" || tier === "high" ? "This is a high-value lead — be slightly more attentive but still reserved." : ""}

Return JSON with: { "subject_line": "...", "message": "..." }`;
    } else {
      const days = context.days_since_sent || 0;
      const viewed = context.viewed || false;
      const total = context.total || 0;

      userPrompt = `Write a follow-up email for a sent quote:
Client: ${client_name}
Quote: ${context.quote_number}
Project type: ${context.project_type}
Total: $${total.toLocaleString()}
Days since sent: ${days}
Quote viewed: ${viewed ? "Yes" : "No"}

${viewed
        ? "They've viewed the quote but haven't responded. Ask what questions they might have. Reference the project scope naturally."
        : "They haven't viewed the quote yet. Gently check if they received it. Offer to walk through it over a call."}

${total >= 100000 ? "This is a significant investment — be measured and respectful of the decision." : ""}

Return JSON with: { "subject_line": "...", "message": "..." }`;
    }

    // Call AI
    const aiResponse = await fetch("https://aigateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI error: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let parsed: { subject_line?: string; message?: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { subject_line: "Follow-up", message: content };
    }

    // Determine stage
    let nextStage = "1";
    if (entity_type === "lead") {
      const currentStage = context.stage || "none";
      const stageMap: Record<string, string> = { none: "1", "1": "2", "2": "3", "3": "final" };
      nextStage = stageMap[currentStage] || "final";

      // Update inquiry follow-up stage
      await supabase.from("inquiries").update({
        follow_up_stage: nextStage,
        follow_up_status: "pending",
        last_contact_at: new Date().toISOString(),
      }).eq("id", entity_id);
    }

    // Insert draft
    await supabase.from("follow_up_drafts").insert({
      entity_type,
      entity_id,
      stage: nextStage,
      draft_message: parsed.message || content,
      subject_line: parsed.subject_line || null,
      client_name,
      client_email,
      project_ref: entity_type === "quote" ? context.quote_number : null,
      deal_value: entity_type === "lead" ? context.deal_value : context.total,
      status: "pending",
    });

    // Log activity
    await supabase.from("activity_log").insert({
      action_type: "follow_up_drafted",
      action_level: "draft",
      category: "communications",
      title: `Follow-up draft generated for ${client_name}`,
      description: `Stage ${nextStage} ${entity_type} follow-up`,
      entity_id,
      entity_type,
      performed_by: "ai",
    });

    return new Response(JSON.stringify({ success: true, stage: nextStage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
