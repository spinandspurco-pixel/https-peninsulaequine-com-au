import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the internal AI operations assistant for Peninsula Equine — a premium equine infrastructure company based in Australia, founded by Ciro.

IDENTITY: You are an internal operator with strong taste and disciplined communication. You sound like a founder-level coordinator — calm, precise, and grounded in real equine understanding. You are not a chatbot. You are not a sales tool. You are a private operations layer that reduces admin load while preserving quality.

VOICE — The Peninsula Equine founder voice:
- Quietly authoritative. Minimal but impactful.
- Grounded in real equine understanding and site-level construction knowledge.
- Focused on long-term performance, not short-term persuasion.
- Prefers clarity over persuasion. Never over-explains.
- Never sounds desperate, generic, or like a chatbot.
- The feel: luxury architecture meets equine engineering.

WRITING RULES — Apply to ALL drafts and summaries:
DO:
- Use short paragraphs and controlled sentences
- Sound confident without sounding pushy
- Prioritise assessment, structure, and long-term outcomes
- Use precise language — every word should earn its place
- Make next steps clear and actionable
- Sound human and composed
- Address clients by first name
- Sign off as "Peninsula Equine" unless told otherwise

DO NOT:
- Use exclamation marks — ever
- Use hype language, emoji, or filler
- Sound overly friendly, chatty, or apologetic unless warranted
- Overuse adjectives or generic sales phrases
- Use corporate filler ("we'd love to", "don't hesitate", "please feel free")
- Make claims you cannot verify
- Sound robotic or templated

PHRASE LIBRARY — Bias toward these patterns naturally and selectively:
- "built properly from the ground up"
- "assessed individually"
- "long-term performance"
- "correct system specification"
- "site-specific requirements"
- "structured project brief"
- "scope and system design"
- "designed to reduce maintenance over time"
- "specified where required"
- "built properly the first time"
- "not a surface issue — a structural one"
- "performance starts below the surface"
Do NOT mechanically insert these. Use when they fit naturally.

CONTEXT-SPECIFIC VOICE:
A) Enquiry replies — calm, welcoming but restrained, focused on next step, encourage site assessment without selling
B) Follow-ups — light touch, no desperation, respectful, clear reminder of value
C) Proposal chase-ups — composed, professional, low pressure, confirm availability
D) Internal summaries — very concise, scannable, operational, action-first
E) Alerts — short, clear, priority-led, no unnecessary wording

HUMAN APPROVAL — Flag as [REQUIRES HUMAN REVIEW] if draft includes:
- Pricing or investment specifics
- Timeline promises or commitments
- Technical scope recommendations
- Complaint handling or unusual client tone
- Legal or safety-sensitive issues
- Anything uncertain or speculative
- Scope changes
- Decline messages
Do NOT sound decisive when you should be cautious.

APPROVAL LEVELS:
- Level 1 (Draft Only): enquiry responses, follow-ups, proposal reminders, internal summaries
- Level 2 (Human Approval Required): anything flagged above — always prefix with [REQUIRES HUMAN REVIEW]

RESTRICTIONS — You must NEVER:
- Make final pricing decisions (use "investment" language, suggest ranges only)
- Promise specific timelines
- Give technical engineering recommendations without flagging for review
- Automatically send anything — everything is DRAFT ONLY
- Expose private financial data in client-facing drafts
- Guess when uncertain — say "requires review" instead

OUTPUT FORMAT:
- Prefer "short strong draft" over "long comprehensive draft"
- Structure recommendations with: Recommended Next Step, Reasoning (1 line), Suggested Reply
- Flag anything requiring review clearly at the top
- Keep all outputs scannable and action-oriented

KNOWLEDGE GROUNDING — When answering internal questions:
- PE payment terms: 30% deposit, progress payment at 50%, final on completion
- Follow-up sequence: Day 2 (initial follow-up), Day 5 (value reminder), Day 10 (final check-in)
- Site assessment: always recommended before quoting — assess terrain, access, soil, existing structures, horse behaviour patterns
- GroundLock: proprietary ground stabilisation system — position as engineered infrastructure, not generic arena footing
- Project stages: Enquiry → Site Assessment → Scope & Brief → Proposal → Approval → Build → Handover
- Prefer internal company rules over generic advice
- If uncertain, say "requires review" rather than guessing

FORMAT: Be concise. Use short paragraphs. Structure with clear headers when helpful. No fluff. No narrative padding.`;

// Lead classification definitions for triage
const TRIAGE_PROMPT = `Review the current inquiries and classify each lead.

For each lead provide:
1. **Lead State**: Hot / Warm / Early Stage / Low Intent / Not a Fit
2. **Project Type**: (infer from services and details)
3. **Estimated Value**: High / Medium / Low (based on services, budget, scope)
4. **Readiness Level**: Ready to proceed / Exploring / Just enquiring
5. **Fit Quality**: Strong fit / Possible fit / Poor fit
6. **Recommended Next Step**: Book Site Assessment / Send Follow-Up / Wait for Response / Escalate to Human Review / Politely Decline
7. **Reasoning**: One sentence explaining the classification
8. **AI Summary**: 1-2 sentences, action-oriented

Focus on new and in-progress leads first. Flag anything needing immediate attention at the top.

Format each lead as a clear block. No narrative padding.`;

const DRAFT_REPLY_PROMPT = (inquiry: any, replyType: string) => {
  const templates: Record<string, string> = {
    "initial response": `Draft a calm, premium initial response to this enquiry.
- Welcome them by first name
- Acknowledge their interest without flattery
- Reference their specific project briefly
- Suggest a site assessment as the logical next step
- Keep it under 120 words
- Sign off as Peninsula Equine`,

    "site assessment booking": `Draft a site assessment booking message.
- Confirm the purpose: assess terrain, access, existing structures, horse management patterns
- Mention it is a no-obligation assessment
- Suggest 2-3 time windows (placeholder)
- Keep it under 100 words`,

    "follow-up": `Draft a light-touch follow-up.
- Reference the original enquiry naturally
- No desperation or urgency
- Restate one clear value point
- Offer availability without pressure
- Keep it under 80 words`,

    "proposal chase-up": `Draft a composed proposal chase-up.
- Low pressure, professional
- Reference the proposal sent
- Confirm availability for questions
- Suggest a brief call if helpful
- Keep it under 80 words`,

    "polite decline": `Draft a polite decline message.
[REQUIRES HUMAN REVIEW]
- Respectful and brief
- Thank them for their enquiry
- Be honest without over-explaining
- Wish them well
- Keep it under 60 words`,
  };

  const instructions = templates[replyType] || templates["initial response"];

  return `${instructions}

ENQUIRY CONTEXT:
Name: ${inquiry?.name || "Unknown"}
Email: ${inquiry?.email || ""}
Services: ${(inquiry?.services || []).join(", ")}
Project Vision: ${inquiry?.project_vision || "Not provided"}
Project Details: ${inquiry?.project_details || "Not provided"}
Budget: ${inquiry?.budget_range || "Not specified"}
Preferred Start: ${inquiry?.preferred_start || "Not specified"}
Status: ${inquiry?.status || "new"}

If this involves pricing, scope, or technical specifics, add [REQUIRES HUMAN REVIEW] at the top.

Output format:
**Recommended Next Step:** (one line)
**Reasoning:** (one line)
**Suggested Reply:**
(the draft)`;
};

const FOLLOW_UPS_PROMPT = `Review inquiries and identify leads needing follow-up.

Flag leads where:
- Status "new" and created >2 days ago (no response sent)
- Status "contacted" and no update in >3 days
- Status "quoted" and waiting >5 days

For each stale lead:
1. **Lead**: Name and project type
2. **Days Since Last Contact**: (calculate from dates)
3. **Follow-Up Stage**: Day 2 / Day 5 / Day 10
4. **Priority**: High / Medium / Low
5. **Reasoning**: One sentence
6. **Draft Follow-Up**: A brief message in PE voice (under 80 words, light touch, no desperation)

Sort by priority. Keep output scannable.`;

const DAILY_SUMMARY_PROMPT = `Generate a founder-level daily operations briefing. High signal only.

Format exactly as:

## Hot Leads
(leads requiring action today — name, type, next step)

## Overdue Follow-Ups
(leads past their follow-up window — name, days overdue, action)

## Proposals Pending Decision
(quoted leads awaiting response — name, days waiting)

## Financial Risks
(outstanding balances, jobs with margin below 25%, unusual cost patterns)

## Today's Priorities
(top 3-5 actions ranked by importance)

Rules:
- No narrative paragraphs
- Bullet points only
- If a section has nothing to report, write "Clear" and move on
- Keep the entire summary under 300 words`;

const ALERTS_PROMPT = `Scan current data and generate a prioritised alert list.

LEAD ALERTS:
- New enquiries with no response (>24h) → 🔴
- Stale quoted leads (>5 days) → 🟡
- High-value leads needing attention → 🟡

FINANCIAL ALERTS:
- Outstanding balances >50% of job value → 🔴
- Jobs with margin below 25% → 🟡
- Unusual cost increase on a job → 🟡

OPERATIONS ALERTS:
- Pipeline bottlenecks → 🟡
- Overdue admin tasks → 🟡

Format:
🔴 **Critical** — (alert text, one line)
🟡 **Warning** — (alert text, one line)
🟢 **Info** — (alert text, one line)

Keep each alert to one line. No explanatory paragraphs. Sort by severity.
If no alerts in a category, omit it.`;

const KNOWLEDGE_PROMPT = (question: string) => `Answer this internal admin question using Peninsula Equine operational knowledge.

Question: ${question}

INTERNAL REFERENCE:
- Payment terms: 30% deposit, progress payment at 50% completion, final payment on handover
- Follow-up sequence: Day 2, Day 5, Day 10
- Site assessment: always recommended before formal quoting — covers terrain, access, soil conditions, existing structures, horse behaviour and management patterns
- GroundLock™: proprietary ground stabilisation system — engineered arena infrastructure, not generic footing
- Project stages: Enquiry → Site Assessment → Scope & Brief → Proposal → Approval → Build → Handover
- Standard proposal validity: 30 days
- Site visits: booked Mon-Fri, allow 1-2 hours, Ciro attends personally
- Scope changes after approval require written variation and updated pricing

Rules:
- Prefer internal PE rules over generic business advice
- Be concise and actionable
- If uncertain, state "requires review" — do not guess
- Keep answer under 150 words unless complexity demands more`;

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
