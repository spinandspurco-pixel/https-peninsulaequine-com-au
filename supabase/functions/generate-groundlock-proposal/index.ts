import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify admin
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader ?? "" } } },
    );
    const { data: { user } } = await anonClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
    if (!roles?.length) throw new Error("Admin access required");

    const { inquiry_id } = await req.json();
    if (!inquiry_id) throw new Error("inquiry_id required");

    // Fetch inquiry
    const { data: inquiry, error: iqErr } = await supabase
      .from("inquiries")
      .select("*")
      .eq("id", inquiry_id)
      .single();
    if (iqErr || !inquiry) throw new Error("Inquiry not found");

    // Parse project details
    const details = inquiry.project_details || "";
    const propertyMatch = details.match(/Property:\s*(.+)/i);
    const sizeMatch = details.match(/Size:\s*(.+)/i);
    const propertyType = propertyMatch?.[1]?.trim() || "";
    const projectSize = sizeMatch?.[1]?.trim() || "";
    const clientMessage = details
      .replace(/Property:\s*.+/i, "")
      .replace(/Size:\s*.+/i, "")
      .trim();

    // Determine project type from services
    const services = inquiry.services || [];
    const projectType = services[0] || inquiry.preferred_service || "GroundLock System";

    // Use AI to generate polished overview
    const aiPrompt = `You are writing a premium architectural proposal for a GroundLock ground stabilisation system. Write in third person, professional tone. No fluff.

Client: ${inquiry.name}
Property type: ${propertyType || "Not specified"}
Project type: ${projectType}
Size: ${projectSize || "Not specified"}
Client message: ${clientMessage || "No additional details provided"}

Generate a JSON object with these fields:
- overview: 2 paragraphs (string with \\n\\n between). Professional summary of the project approach tailored to their property and use case. Do NOT use generic language.
- scopeItems: array of 4 objects with {phase, description}. Tailored to their project type.
- investmentNote: 1-2 sentences about the complete system approach.
- layoutNotes: 1 sentence describing the proposed layout approach for their site.

Return ONLY valid JSON, no markdown.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const projectId = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || "";

    const aiRes = await fetch("https://ai-gateway.lovable.dev/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "x-project-id": projectId,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: aiPrompt }],
        temperature: 0.4,
      }),
    });

    if (!aiRes.ok) throw new Error(`AI request failed: ${aiRes.status}`);

    const aiData = await aiRes.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    
    const generated = JSON.parse(jsonMatch[0]);

    // Insert proposal draft
    const { data: proposal, error: insErr } = await supabase
      .from("groundlock_proposals")
      .insert({
        proposal_ref: "", // trigger will generate
        inquiry_id: inquiry.id,
        client_name: inquiry.name,
        client_email: inquiry.email,
        property_name: propertyType || null,
        location: null,
        project_type: projectType,
        project_size: projectSize || null,
        overview: generated.overview || "",
        system_notes: null,
        layout_notes: generated.layoutNotes || null,
        scope_items: generated.scopeItems || [],
        investment_total: "[INSERT PRICE]",
        investment_note: generated.investmentNote || "",
        attachment_urls: inquiry.attachment_urls || [],
        status: "draft",
        created_by: user.id,
      })
      .select()
      .single();

    if (insErr) throw insErr;

    return new Response(JSON.stringify({ proposal }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("generate-groundlock-proposal error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
