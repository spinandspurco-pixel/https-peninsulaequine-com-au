import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the internal AI operations assistant for Peninsula Equine — a premium equine infrastructure company based in Australia.

ROLE: You help the admin coordinator manage leads, draft replies, prioritise follow-ups, summarise daily operations, and flag issues. You reduce repetitive admin work while preserving high-quality, human-reviewed communication.

TONE RULES — ALL drafts must match Peninsula Equine's voice:
- Calm, premium, concise, confident
- Never use exclamation marks or hype
- Never be robotic or overly friendly
- Focus on long-term performance, assessment, structure, clarity
- Address clients by first name
- Sign off as "Peninsula Equine" unless told otherwise

RESTRICTIONS — You must NEVER:
- Make final pricing decisions (use "investment" language, suggest ranges only)
- Promise specific timelines
- Give technical engineering recommendations without flagging "requires human review"
- Automatically send anything — everything is DRAFT ONLY
- Expose private financial data in client-facing drafts

APPROVAL LEVELS:
- Level 1 (Draft Only): enquiry responses, follow-ups, summaries, reminders
- Level 2 (Human Approval Required): anything mentioning pricing/investment, scope changes, technical advice, complaints, timeline commitments, decline messages — flag these with [REQUIRES APPROVAL]

FORMAT: Be concise. Use short paragraphs. Structure with clear headers when helpful. No fluff.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, payload } = await req.json();

    // Gather context data based on action
    let contextData = "";

    if (["triage", "daily_summary", "alerts", "follow_ups", "knowledge"].includes(action)) {
      const [inquiriesRes, jobsRes, cashflowRes] = await Promise.all([
        supabase
          .from("inquiries")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(20),
        supabase
          .from("cashflow")
          .select("*, jobs(job_name, revenue)")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      const inquiries = inquiriesRes.data || [];
      const jobs = jobsRes.data || [];
      const cashflows = cashflowRes.data || [];

      contextData = `
CURRENT DATA SNAPSHOT:

INQUIRIES (${inquiries.length} most recent):
${inquiries
  .map(
    (i: any) =>
      `- ${i.name} | ${i.email} | Status: ${i.status} | Services: ${(i.services || []).join(", ")} | Budget: ${i.budget_range || "unknown"} | Tier: ${i.lead_tier || "standard"} | Created: ${i.created_at} | Notes: ${i.notes || "none"}`
  )
  .join("\n")}

JOBS (${jobs.length}):
${jobs
  .map(
    (j: any) =>
      `- ${j.job_name} | Client: ${j.client_name || "—"} | Status: ${j.status} | Revenue: $${j.revenue} | Costs: $${Number(j.materials_cost) + Number(j.labour_cost) + Number(j.other_costs)} | Margin: ${j.revenue > 0 ? (((j.revenue - Number(j.materials_cost) - Number(j.labour_cost) - Number(j.other_costs)) / j.revenue) * 100).toFixed(1) : 0}%`
  )
  .join("\n")}

CASHFLOW (${cashflows.length}):
${cashflows
  .map((c: any) => {
    const received = Number(c.deposit_received) + Number(c.mid_payment) + Number(c.final_payment);
    const invoiced = c.jobs?.revenue || 0;
    return `- ${c.jobs?.job_name || "Unknown"} | Received: $${received} / $${invoiced} | Outstanding: $${invoiced - received}`;
  })
  .join("\n")}
`;
    }

    let userPrompt = "";

    switch (action) {
      case "triage":
        userPrompt = `Review the current inquiries and classify each by:
1. Urgency (High / Medium / Low)
2. Project type
3. Estimated value tier
4. Recommended next action
5. Brief AI summary (1-2 sentences)

Focus on new and in-progress leads. Flag any that need immediate attention.

${contextData}`;
        break;

      case "draft_reply": {
        const { inquiry, replyType } = payload || {};
        const replyTypeLabel = replyType || "initial response";
        userPrompt = `Draft a ${replyTypeLabel} email for this enquiry. Keep it calm, premium, and concise. Use Peninsula Equine tone.

ENQUIRY:
Name: ${inquiry?.name || "Unknown"}
Email: ${inquiry?.email || ""}
Services: ${(inquiry?.services || []).join(", ")}
Project Vision: ${inquiry?.project_vision || "Not provided"}
Project Details: ${inquiry?.project_details || "Not provided"}
Budget: ${inquiry?.budget_range || "Not specified"}
Preferred Start: ${inquiry?.preferred_start || "Not specified"}
Status: ${inquiry?.status || "new"}

Reply type: ${replyTypeLabel}

If this involves pricing or scope, add [REQUIRES APPROVAL] at the top.`;
        break;
      }

      case "follow_ups":
        userPrompt = `Review the current inquiries and identify leads that need follow-up.

Flag leads where:
- Status is "new" and created more than 2 days ago (no response)
- Status is "contacted" and no recent update
- Status is "quoted" and waiting more than 5 days

For each, suggest:
1. Follow-up timing (Day 2, Day 5, Day 10)
2. Draft a brief follow-up message in PE tone
3. Priority level

${contextData}`;
        break;

      case "daily_summary":
        userPrompt = `Generate a concise daily operations summary for the admin team.

Include:
1. Hot leads requiring action today
2. Overdue follow-ups
3. Proposals awaiting response
4. Outstanding payment balances
5. Jobs with margins below 25%
6. Any urgent flags

Keep it scannable. Use bullet points. No fluff.

${contextData}`;
        break;

      case "alerts":
        userPrompt = `Scan the current data and generate internal alerts.

LEAD ALERTS:
- New enquiries with no response (>24h)
- Stale quoted leads (>5 days)
- High-value leads needing attention

FINANCIAL ALERTS:
- Outstanding balances
- Jobs with margin below 25%
- Unusual cost patterns

OPERATIONS ALERTS:
- Overdue admin tasks
- Pipeline bottlenecks

Format as a prioritised alert list. Use labels: 🔴 Critical, 🟡 Warning, 🟢 Info

${contextData}`;
        break;

      case "knowledge":
        userPrompt = `Answer this internal admin question using available context and Peninsula Equine operational knowledge.

Question: ${payload?.question || "No question provided"}

If data is available, reference it. If not, provide general PE operational guidance.
Keep the answer concise and actionable.

${contextData}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "No response generated.";

    return new Response(
      JSON.stringify({ result: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("admin-ai-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
