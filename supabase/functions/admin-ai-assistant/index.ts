import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the private operations assistant for Peninsula Equine. You write like the founder — not like an AI.

VOICE: Quiet authority. Every sentence earns its place. You sound like someone who builds equine infrastructure for a living — not someone who writes about it.

RULES:
- Maximum clarity, minimum words
- No exclamation marks. No emoji. No filler. No "please don't hesitate." No "we'd love to." No "I hope this finds you well."
- Never say "I'm happy to help" or "feel free to reach out" or "looking forward to hearing from you"
- Never sound eager, desperate, apologetic, or chatbot-like
- Never overexplain. If one sentence works, don't use three.
- Address clients by first name. Sign off as "Peninsula Equine."
- Everything is DRAFT ONLY. Never imply anything will be sent automatically.

NATURAL LANGUAGE PATTERNS (use selectively, never force):
- "built properly from the ground up"
- "assessed individually"
- "long-term performance"
- "site-specific requirements"
- "correct system specification"
- "performance starts below the surface"
- "designed to reduce maintenance over time"
- "not a surface issue — a structural one"

WHAT TO AVOID — these phrases are banned:
- "Thank you for reaching out"
- "We appreciate your interest"
- "Don't hesitate to contact us"
- "Please feel free"
- "We would love to"
- "Looking forward to"
- "Happy to help"
- "At your earliest convenience"
- "Touch base"
- "Circle back"
- Any sentence starting with "I" or "We" followed by an emotion

CONTEXT VOICE:
- Enquiry replies: 3-5 sentences max. Acknowledge project, suggest site assessment, stop.
- Follow-ups: 2-3 sentences. Light. No desperation. One clear value point.
- Chase-ups: 2-3 sentences. Composed. Confirm availability. No pressure.
- Summaries: Bullets only. No narrative. Action-first.
- Alerts: One line each. Priority label, fact, action.

APPROVAL — Flag [REQUIRES HUMAN REVIEW] if draft touches:
- Pricing, investment, or cost specifics
- Timeline or delivery commitments
- Technical scope or engineering detail
- Complaints, legal, safety
- Decline messages
- Anything uncertain
When uncertain, say "requires review." Do not guess. Do not sound decisive about things you cannot verify.

RESTRICTIONS:
- Never make pricing decisions
- Never promise timelines
- Never give engineering recommendations without flagging
- Never expose financial data in client-facing drafts
- Never send anything — all output is draft for human review

KNOWLEDGE BASE:
- Payment: 30% deposit, progress at 50%, final on handover
- Follow-up cadence: Day 2, Day 5, Day 10
- Site assessment: always before quoting — terrain, access, soil, structures, horse behaviour
- GroundLock™: proprietary ground stabilisation — engineered infrastructure, not generic footing
- Stages: Enquiry → Site Assessment → Scope & Brief → Proposal → Approval → Build → Handover
- Proposal validity: 30 days
- Site visits: Mon-Fri, 1-2 hours, Ciro attends
- Scope changes require written variation and updated pricing
- Prefer PE rules over generic advice. If uncertain, say so.`;

const TRIAGE_PROMPT = `Classify each inquiry. Be decisive.

Per lead:
- **State**: Hot / Warm / Early Stage / Low Intent / Not a Fit
- **Type**: (infer from services)
- **Value**: High / Medium / Low
- **Fit**: Strong / Possible / Poor
- **Next Step**: Book Site Assessment / Send Follow-Up / Wait / Escalate to Human Review / Decline
- **Why**: One sentence. No hedging.

Put leads needing action today first. Skip narrative. If a lead looks like a poor fit, say so.`;

const DRAFT_REPLY_PROMPT = (inquiry: any, replyType: string) => {
  const templates: Record<string, string> = {
    "initial response": `Draft an initial reply. Maximum 4 sentences.
Sentence 1: Address by first name, acknowledge the project type.
Sentence 2: One line on PE's relevant capability — no boasting.
Sentence 3: Recommend a site assessment as the starting point.
Sentence 4: Sign off as Peninsula Equine.
No pleasantries. No "thank you for reaching out." No "we'd love to discuss." Just substance.`,

    "site assessment booking": `Draft a site assessment booking note. Maximum 3 sentences.
State the purpose (assess terrain, access, structures, horse management).
Offer availability (use placeholder dates).
Sign off. No selling. No filler.`,

    "follow-up": `Draft a follow-up. Maximum 3 sentences.
Reference their project — not their enquiry.
One value point: what a site assessment would clarify for them.
Confirm availability. No urgency. No "just checking in." No "circling back."`,

    "proposal chase-up": `Draft a proposal chase-up. Maximum 3 sentences.
Reference the proposal by project type.
Confirm you're available for questions or a brief call.
No pressure. No "wanted to follow up." Just composed availability.`,

    "polite decline": `[REQUIRES HUMAN REVIEW]
Draft a decline. Maximum 3 sentences.
Acknowledge their enquiry. State it's not the right fit without over-explaining. Wish them well.
No apology. No "unfortunately." Just direct and respectful.`,
  };

  return `${templates[replyType] || templates["initial response"]}

CONTEXT:
Name: ${inquiry?.name || "Unknown"} | Services: ${(inquiry?.services || []).join(", ")} | Budget: ${inquiry?.budget_range || "—"} | Vision: ${inquiry?.project_vision || "—"} | Details: ${inquiry?.project_details || "—"} | Start: ${inquiry?.preferred_start || "—"}

If pricing or scope is involved, prefix with [REQUIRES HUMAN REVIEW].

Format:
**Next Step:** (one line)
**Reason:** (one line)
**Draft:**
(the message)`;
};

const FOLLOW_UPS_PROMPT = `Identify stale leads. Be direct about priority.

Flag if:
- "new" status, >2 days old
- "contacted", no update >3 days
- "quoted", no response >5 days

Per lead:
- **Name** | **Days stale** | **Stage** (Day 2/5/10) | **Priority** (High/Med/Low)
- **Draft**: 2-3 sentences max. Reference their project, not their enquiry. One value point. Confirm availability. No "just checking in." No "wanted to touch base."

Priority order. No padding.`;

const DAILY_SUMMARY_PROMPT = `Founder briefing. Bullets only. No narrative.

**Hot Leads** — name, type, action needed (or "Clear")
**Overdue Follow-Ups** — name, days overdue, action (or "Clear")
**Proposals Pending** — name, days waiting (or "Clear")
**Financial Flags** — outstanding balances >50%, margins <25% (or "Clear")
**Today's Top 3** — ranked actions

Under 200 words total. If a section is empty, write "Clear" and move on. No filler sentences.`;

const ALERTS_PROMPT = `Generate alerts. One line each. No explanations.

🔴 = needs action today. 🟡 = needs attention this week. 🟢 = awareness only.

Check for:
- Enquiries with no response >24h → 🔴
- Quoted leads with no reply >5 days → 🟡
- Outstanding balance >50% of job value → 🔴
- Job margin below 25% → 🟡
- Unusual cost spike on any job → 🟡

Format: emoji + label + fact + action. One line per alert. Omit empty categories. No padding.`;

const KNOWLEDGE_PROMPT = (question: string) => `Internal question: ${question}

Answer using PE operational knowledge. Under 100 words. No generic advice.
If uncertain, say "requires review" — do not speculate.

Reference: Payment 30/50/final. Follow-up Day 2/5/10. Site assessment before quoting. GroundLock = proprietary ground stabilisation. Stages: Enquiry → Assessment → Brief → Proposal → Approval → Build → Handover. Proposals valid 30 days. Site visits Mon-Fri, Ciro attends. Scope changes need written variation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Gather context data
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
CURRENT DATA (${new Date().toISOString().split("T")[0]}):

INQUIRIES (${inquiries.length}):
${inquiries
  .map(
    (i: any) =>
      `- ${i.name} | ${i.email} | Status: ${i.status} | Services: ${(i.services || []).join(", ")} | Budget: ${i.budget_range || "—"} | Tier: ${i.lead_tier || "standard"} | Created: ${i.created_at} | Updated: ${i.updated_at} | Notes: ${i.notes || "—"}`
  )
  .join("\n")}

JOBS (${jobs.length}):
${jobs
  .map(
    (j: any) => {
      const costs = Number(j.materials_cost) + Number(j.labour_cost) + Number(j.other_costs);
      const margin = j.revenue > 0 ? (((j.revenue - costs) / j.revenue) * 100).toFixed(1) : "0";
      return `- ${j.job_name} | Client: ${j.client_name || "—"} | Status: ${j.status} | Revenue: $${j.revenue} | Costs: $${costs} | Margin: ${margin}%`;
    }
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
        userPrompt = `${TRIAGE_PROMPT}\n\n${contextData}`;
        break;

      case "draft_reply": {
        const { inquiry, replyType } = payload || {};
        userPrompt = DRAFT_REPLY_PROMPT(inquiry, replyType || "initial response");
        break;
      }

      case "follow_ups":
        userPrompt = `${FOLLOW_UPS_PROMPT}\n\n${contextData}`;
        break;

      case "daily_summary":
        userPrompt = `${DAILY_SUMMARY_PROMPT}\n\n${contextData}`;
        break;

      case "alerts":
        userPrompt = `${ALERTS_PROMPT}\n\n${contextData}`;
        break;

      case "knowledge":
        userPrompt = `${KNOWLEDGE_PROMPT(payload?.question || "No question provided")}\n\n${contextData}`;
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
