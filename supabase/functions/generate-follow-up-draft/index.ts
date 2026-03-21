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

    // ── Enforce max 3 follow-ups per entity ──
    const { count: existingCount } = await supabase
      .from("follow_up_drafts")
      .select("id", { count: "exact", head: true })
      .eq("entity_id", entity_id)
      .neq("status", "stopped");

    if ((existingCount ?? 0) >= 3) {
      return new Response(JSON.stringify({ error: "Maximum 3 follow-ups reached. Extend manually if needed." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Prevent duplicate pending drafts for same entity + stage ──
    const currentStage = entity_type === "lead" ? (context.stage || "none") : "1";
    const stageMap: Record<string, string> = { none: "1", "1": "2", "2": "3", "3": "final" };
    const targetStage = stageMap[currentStage] || "final";

    const { count: dupeCount } = await supabase
      .from("follow_up_drafts")
      .select("id", { count: "exact", head: true })
      .eq("entity_id", entity_id)
      .eq("stage", targetStage)
      .in("status", ["pending", "approved"]);

    if ((dupeCount ?? 0) > 0) {
      return new Response(JSON.stringify({ error: "A draft already exists for this stage." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build prompt
    let systemPrompt = `You are a follow-up message writer for Peninsula Equine, a premium equestrian facility builder in Victoria, Australia.

VOICE:
- Calm, direct, professional
- No exclamation marks, no hype, no spam language
- No "just checking in" or "touching base" or "hope you're well"
- 2-4 sentences maximum
- Include client's first name
- Reference the project naturally
- End with a clear, specific next step — ALWAYS direct to booking a site assessment
- Default CTA: "You can book a site assessment here: /site-assessment"

CONVERSION RULES:
- Every follow-up must push toward a concrete action (book assessment, confirm scope, accept proposal)
- Never leave conversations open-ended
- Frame the site assessment as the logical next step — not a suggestion
- Hot/Warm leads: be directive, position booking as assumed
- Low intent: brief, informational, no push

NEVER:
- Use "Hi there!" or generic greetings
- Sound desperate or pushy
- Use marketing language
- Mention discounts or urgency tactics
- Ask "Would you like to book?" — state it as the process`;

    let userPrompt = "";

    if (entity_type === "lead") {
      const stage = context.stage || "none";
      const tier = context.tier || "standard";
      const services = (context.services || []).join(", ");
      const days = context.days_since_contact || 0;

      // Rotate angles by stage to prevent repeated phrasing
      const stageGuidance: Record<string, string> = {
        none: `First follow-up. ANGLE: Project acknowledgment + process clarity.
Address by first name. Reference their specific project (${services}). 
State: "The next step is a site assessment — it covers terrain, access, and site-specific requirements."
Direct to booking: /site-assessment. Sign off as Peninsula Equine.`,
        "1": `Second follow-up. ANGLE: Value reinforcement.
Reference what the site assessment would resolve for their specific project — e.g. ground conditions, structural planning, drainage considerations.
Position PE's approach: "Built once, built properly — the assessment ensures the system is designed to your site."
Include booking link: /site-assessment. Brief, no questions.`,
        "2": `Third follow-up. ANGLE: Clarification prompt.
Ask one specific, project-related question to re-engage — e.g. "Have your timeline or site requirements changed since we last spoke?"
Keep the door open. Reference availability for a brief call or site visit.
Include booking link: /site-assessment.`,
        final: `Final follow-up. ANGLE: Close the loop.
Respectful close. Let them know you won't follow up again unless they reach out.
Reference the project one last time. Leave on a professional, composed note.
No booking push — just availability if circumstances change.`,
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

${tier === "premium" || tier === "high" ? "This is a high-value lead — be slightly more attentive but still reserved. Be directive about booking." : ""}
${tier === "starter" || (!tier || tier === "standard") ? "Standard lead — keep it brief and professional. Include booking link but don't push hard." : ""}

IMPORTANT: Do NOT repeat phrasing from previous follow-ups. Each stage uses a different angle.

Return JSON with: { "subject_line": "...", "message": "..." }`;
    } else {
      const days = context.days_since_sent || 0;
      const viewed = context.viewed || false;
      const total = context.total || 0;

      // Rotate quote follow-up angles
      const angleIndex = days <= 3 ? 0 : days <= 7 ? 1 : 2;
      const angles = [
        // Day 3: Calm check-in
        `It's been ${days} days since the project brief was sent. ${viewed ? "They've viewed it." : "They haven't opened it yet."}
Tone: calm, no urgency. Simply check in. Example angle: "Just checking in — let me know if you'd like to move forward or if timing has shifted."
Do NOT ask if they have questions. Do NOT reference specific scope items. Keep it to 2 sentences max.
${!viewed ? "Mention you're available for a brief walkthrough if helpful." : ""}`,
        // Day 7: Controlled scarcity
        `It's been ${days} days since the project brief was sent. ${viewed ? "They've reviewed it." : "No view recorded."}
Tone: measured, authoritative. Reference build schedule. Example angle: "We're finalising upcoming builds this week — let me know if this is something you want to secure."
Do NOT discount. Do NOT sound desperate. One clear line about locking in schedule. 2-3 sentences max.`,
        // Day 10+: Close the loop
        `${days} days since the proposal. Time to close the loop respectfully.
Be direct but composed: "If the scope aligns, we can lock this into schedule and move into planning."
Reference that build slots are allocated per season — operational reality, not pressure.
If no response expected, leave on a professional note. 2 sentences max.`,
      ];

      userPrompt = `Write a follow-up email for a sent quote:
Client: ${client_name}
Quote: ${context.quote_number}
Project type: ${context.project_type}
Total: $${total.toLocaleString()}
Days since sent: ${days}
Quote viewed: ${viewed ? "Yes" : "No"}

ANGLE: ${angles[angleIndex]}

${total >= 100000 ? "This is a significant investment — be measured and respectful of the decision. But be clear about next steps." : ""}

IMPORTANT: End with a clear next step. Never leave it open-ended.

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
