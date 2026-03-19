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
- Enquiry replies (Hot/Warm leads): 3-4 sentences MAXIMUM. Structure: acknowledge project → position site assessment as the logical next step → include booking link → sign off. No questions. No delays. Move to booking.
- Enquiry replies (Low Intent/Early Stage): helpful but do not push booking. Keep it brief and informational.
- Follow-ups: 2-3 sentences. Reference project, position what a site assessment would resolve. Include booking link for qualified leads.
- Chase-ups: 2-3 sentences. Composed. Confirm availability. No pressure.
- Summaries: Bullets only. No narrative. Action-first.
- Alerts: One line each. Priority label, fact, action.

SITE ASSESSMENT BOOKING:
- The booking page is: /site-assessment
- For Hot and Warm leads, ALWAYS include the booking link in draft replies
- Position the assessment as the natural next step — not a sales pitch
- Frame it as: "The next step is a site assessment" — not "Would you like to book?"
- Never ask if they want to book. State that it's the process.

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

const TRIAGE_PROMPT = `Classify each inquiry. Prioritise identifying high-value opportunities for the founder.

HOT LEAD SIGNALS — classify as Hot when ANY combination present:
- Clear intent to build (specific project described, not just browsing)
- Budget signal present (stated budget, or services implying $50k+: full-facility, arena-construction, barn-construction)
- Timeline within 3-6 months (preferred_start indicates near-term)
- Property details mentioned (location, land size, existing structures)
- Multiple high-value services selected
- Lead tier "premium" or "high"

WARM LEAD SIGNALS:
- Some intent but missing details (budget or timeline unclear)
- Single service enquiry with reasonable scope
- Has project vision but vague on specifics

LOW INTENT SIGNALS:
- No budget signal, no timeline, vague enquiry
- "Just enquiring" / information-gathering language
- Lesson-only or event-only enquiries (unless combined with infrastructure)

Per lead:
- **State**: 🔴 Hot / 🟡 Warm / ⚪ Early Stage / ⬜ Low Intent / ❌ Not a Fit
- **Tags**: Priority / High-Value / Founder-Review / Booking-Ready / Info-Only
- **Type**: (infer from services)
- **Value**: High ($100k+) / Medium ($25k-100k) / Low (<$25k) / Unknown
- **Fit**: Strong / Possible / Poor
- **Next Step**:
  - Hot → "Book Site Assessment — flag for founder review" (default)
  - Warm → "Book Site Assessment" or "Send Follow-Up"
  - Early Stage → "Send Follow-Up" (no booking push)
  - Low Intent → "Wait" or light follow-up only
  - Not a Fit → "Decline" or "Escalate to Human Review"
- **Why**: One sentence. Decisive.
- **Booking Ready**: Yes / No

PRIORITY RULES:
- Hot leads always listed first with 🔴 marker
- Hot leads tagged "Priority" and "Founder-Review"
- For Low Intent: reduce follow-up intensity, do NOT push booking
- Founder time is limited — only surface leads worth his direct attention`;

const BOOKING_URL = "/site-assessment";

const DRAFT_REPLY_PROMPT = (inquiry: any, replyType: string) => {
  // Determine if this looks like a qualified lead
  const services = (inquiry?.services || []).join(", ");
  const hasBudget = inquiry?.budget_range && inquiry.budget_range !== "not-sure";
  const hasDetails = inquiry?.project_vision || inquiry?.project_details;
  const isQualified = hasBudget || hasDetails || services.length > 0;

  const bookingInstruction = isQualified
    ? `\nThis appears to be a qualified lead. Include the booking link (${BOOKING_URL}) naturally in the reply. Frame the site assessment as the next step — not a suggestion.`
    : `\nThis appears to be an early-stage enquiry. Be helpful but do not push booking.`;

  const templates: Record<string, string> = {
    "initial response": `Draft an initial reply. Maximum 3-4 sentences.
Sentence 1: Address by first name, acknowledge the specific project.
Sentence 2: Position the site assessment as the standard next step — "The next step is a site assessment to evaluate your site."
Sentence 3: Direct them to book: "You can book a time here: ${BOOKING_URL}"
Sentence 4: Sign off as Peninsula Equine.
Do NOT ask questions. Do NOT offer to "discuss further." Move directly to booking.${bookingInstruction}`,

    "site assessment booking": `Draft a site assessment booking note. Maximum 3 sentences.
State the purpose (assess terrain, access, structures, horse management).
Direct to booking: ${BOOKING_URL}
Sign off. No selling. No filler.`,

    "follow-up": `Draft a follow-up. Maximum 3 sentences.
Reference their project — not their enquiry.
One value point: what a site assessment would clarify for them.
Include booking link: ${BOOKING_URL}
No urgency. No "just checking in." No "circling back."${bookingInstruction}`,

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
Name: ${inquiry?.name || "Unknown"} | Services: ${services} | Budget: ${inquiry?.budget_range || "—"} | Vision: ${inquiry?.project_vision || "—"} | Details: ${inquiry?.project_details || "—"} | Start: ${inquiry?.preferred_start || "—"}

If pricing or scope is involved, prefix with [REQUIRES HUMAN REVIEW].

Format:
**Next Step:** (one line)
**Reason:** (one line)
**Draft:**
(the message)`;
};

const FOLLOW_UPS_PROMPT = `Identify stale leads. Differentiate follow-up intensity by lead quality.

Flag if:
- "new" status, >2 days old
- "contacted", no update >3 days
- "quoted", no response >5 days

FOLLOW-UP INTENSITY:
- Hot/Warm leads: follow up promptly (Day 2/5), include booking link (${BOOKING_URL}), reference what the assessment would resolve for their specific project
- Early Stage leads: lighter touch (Day 5/10), informational, no booking pressure
- Low Intent leads: minimal follow-up (Day 10 only), brief check-in, do NOT push booking or assessment

Per lead:
- **Name** | **Days stale** | **Quality** (Hot/Warm/Early/Low) | **Stage** (Day 2/5/10) | **Priority** (High/Med/Low)
- **Booking Ready**: Yes/No
- **Draft**: 2-3 sentences max. Tone and content must match lead quality level.

Hot/Warm leads first. Low Intent leads last.`;

const DAILY_SUMMARY_PROMPT = `Founder briefing. Bullets only. No narrative. Protect the founder's time.

STRICT CONSTRAINT: Maximum 6 items total across all sections. Group by lane.

**Founder / Review** (max 2 items)
Hot leads or decisions requiring founder attention. Name, value, action. If none: "Clear."

**Build / Site** (max 1 item)
Today's site visits or active build flags. If none: "Clear."

**Admin / Coordination** (max 2 items)
Overdue high-value follow-ups OR overdue quotes only. Skip low-priority leads entirely. If none: "Clear."

**Financial Flag** (max 1 item)
Only show: margins <25%, outstanding >50%, or overdue high-value quotes. If none: "Clear."

SUPPRESSION RULES:
- Do NOT show Low Intent or Early Stage leads
- Do NOT show leads with deal_value < $25k unless overdue >10 days
- Do NOT show completed or stopped follow-ups
- Do NOT show proposals under 3 days old

Under 150 words total. No filler. No exclamation marks.`;

const ALERTS_PROMPT = `Generate alerts. One line each. No explanations. Maximum 5 alerts total.

🔴 = needs action today. 🟡 = needs attention this week.

PRIORITY ORDER (show highest priority first, stop at 5):
1. Overdue high-value leads (deal_value >= $50k, no response >48h) → 🔴
2. Overdue quotes (total >= $25k, no response >5 days) → 🔴
3. Margin-risk jobs (margin <15%) → 🔴
4. Hot leads not yet booked for assessment → 🟡
5. Outstanding balance >50% of job value → 🟡

SUPPRESS:
- Low Intent leads entirely
- Early Stage leads unless >10 days stale
- Leads with deal_value < $10k
- Any alert that doesn't have a clear action

Format: emoji + label + fact + action. One line per alert. No 🟢 items. Omit empty categories.`;

const KNOWLEDGE_PROMPT = (question: string) => `Internal question: ${question}

Answer using PE operational knowledge. Under 100 words. No generic advice.
If uncertain, say "requires review" — do not speculate.

Reference: Payment 30/50/final. Follow-up Day 2/5/10. Site assessment before quoting. GroundLock = proprietary ground stabilisation. Stages: Enquiry → Assessment → Brief → Proposal → Approval → Build → Handover. Proposals valid 30 days. Site visits Mon-Fri, Ciro attends. Scope changes need written variation.`;

const DECISION_PANEL_PROMPT = `Analyse the pipeline and return ONE actionable system-level insight. One sentence only.

Look for patterns:
- Multiple leads stalling at the same stage
- Low reply-to-booking conversion
- Concentration risk (revenue dependent on 1-2 deals)
- Follow-up gaps creating pipeline leaks
- Proposal-to-close ratio declining
- Job margins dropping below 25% (watch), 15% (at_risk), or 5% (critical)
- Actual costs exceeding estimated costs on active jobs
- Labour or material cost spikes across multiple jobs

Rules:
- One sentence. Under 30 words. No filler.
- Be specific — reference the pattern you detected.
- If pipeline is healthy, say "Pipeline operating normally. No structural issues detected."
- No exclamation marks. No emoji.`;

const DAILY_PLAN_PROMPT = `Generate today's operating plan for the Peninsula Equine team. This is the daily command centre.

The team has 4 operating lanes. Route every task to the correct lane based on who actually does the work.

TEAM LANES:

1. FOUNDER / SYSTEMS & CREATIVE (Jordynn)
   - Lovable / dashboard refinement
   - AI/admin system oversight
   - Content capture planning
   - Brand direction
   - Proposal polish
   - Selective high-value lead review (Hot leads with $100k+ or complex scope only)
   - Do NOT overload with repetitive admin. Protect time for systems work and content.

2. BUILD / SITE (Ciro + Sander)
   - On-site build tasks
   - Site visits / assessments (Ciro attends)
   - Build decisions
   - Delivery execution
   - Client walkthroughs on site
   - Do NOT route desk/admin tasks here. Field and build only.

3. ADMIN / COORDINATION (Admin)
   - Enquiry replies and follow-ups
   - Booking management
   - CRM status updates
   - Proposal sending (not polish)
   - Reminders
   - Financial admin (chasing payments, invoicing)
   - Day 2/5/10 follow-ups
   - Recurring coordination tasks

4. NEEDS FOUNDER REVIEW (Human Decision Required)
   - High-value leads requiring personal attention
   - Pricing-sensitive items
   - Scope-sensitive items
   - Unusual client situations
   - Anything requiring sign-off

Format EXACTLY as follows — use these headers and structure:

## Today's Briefing
One sentence: what today looks like (e.g. "2 hot leads, 1 site visit, 1 overdue payment.")

## 🔴 Needs Founder Review
Items requiring Jordynn's decision or sign-off. Hot leads, pricing, scope, unusual situations.
Per item: bullet with action, name, and why it needs review. Max 5 items.
If none: "Clear — no items requiring review."

## 🛠 Build / Site — Ciro & Sander
- Today's site visits: location, time, client name, project type
- Active build tasks or decisions needed on site
- Client walkthroughs scheduled
If none: "No site tasks today."

## 📋 Admin / Coordination
- Follow-ups due (Day 2/5/10 with suggested action)
- New lead replies needed
- Booking confirmations or reminders to send
- CRM updates needed
- Financial admin (payment chasing, invoicing)
Group by: lead replies first, then follow-ups, then admin.

## 🎯 Founder / Systems & Creative — Jordynn
- Dashboard or systems work flagged
- Content capture opportunities
- Proposal polish needed
- Brand or creative tasks
- Protected block recommendations
If none: "No systems tasks flagged."

## Financial Alerts
- Overdue payments (>30 days or >50% outstanding)
- Jobs with margin <25%
- Cash flow concerns
If clear: "No financial flags."

## Quick Wins
2-3 easy actions that move deals forward with minimal effort. Assign each to the correct lane.

RULES:
- Route every task to the correct team lane. Never dump admin tasks on the founder.
- HOT leads ($100k+ or complex) → Needs Founder Review
- WARM leads → Admin / Coordination for follow-up
- LOW INTENT → minimal attention, do not surface unless >10 days stale
- Site visits → always Build / Site lane
- Follow-ups, CRM, reminders → always Admin / Coordination
- Be decisive. Each item has a clear action and clear owner.
- No fluff. No narrative paragraphs. Bullets only.
- Under 400 words total.
- Today's date for reference: ${new Date().toISOString().split("T")[0]}`;

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
    const needsContext = ["triage", "daily_summary", "alerts", "follow_ups", "knowledge", "daily_plan", "decision_panel"].includes(action);
    
    if (needsContext) {
      const today = new Date().toISOString().split("T")[0];
      const queries: any[] = [
        supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("cashflow").select("*, jobs(job_name, revenue)").order("created_at", { ascending: false }).limit(20),
      ];

      // For daily_plan and decision_panel, also fetch assessments, bookings, and quotes
      if (action === "daily_plan" || action === "decision_panel") {
        queries.push(
          supabase.from("site_assessments").select("*").gte("slot_date", today).order("slot_date", { ascending: true }).limit(10),
          supabase.from("bookings").select("*").gte("booking_date", today).order("booking_date", { ascending: true }).limit(10),
          supabase.from("quotes").select("*").not("status", "in", '("expired","declined")').order("created_at", { ascending: false }).limit(20),
        );
      }

      // For alerts and daily_summary, also fetch quotes
      if (action === "alerts" || action === "daily_summary") {
        queries.push(
          null, null, // placeholders for assessments/bookings
          supabase.from("quotes").select("*").not("status", "in", '("expired","declined")').order("created_at", { ascending: false }).limit(20),
        );
      }

      const results = await Promise.all(queries.map((q: any) => q ? q : Promise.resolve({ data: [] })));
      const inquiries = results[0].data || [];
      const jobs = results[1].data || [];
      const cashflows = results[2].data || [];
      const siteAssessments = results[3]?.data || [];
      const bookings = results[4]?.data || [];
      const activeQuotes = results[5]?.data || [];

      contextData = `
CURRENT DATA (${today}):

INQUIRIES (${inquiries.length}):
${inquiries
  .map(
    (i: any) =>
      `- ${i.name} | ${i.email} | Status: ${i.status} | Services: ${(i.services || []).join(", ")} | Budget: ${i.budget_range || "—"} | Tier: ${i.lead_tier || "standard"} | Deal: $${i.deal_value || 0} @ ${i.probability || 0}% = $${i.expected_value || 0} | Stage: ${i.deal_stage || "—"} | Last Contact: ${i.last_contact_at || "—"} | Created: ${i.created_at} | Notes: ${i.notes || "—"}`
  )
  .join("\n")}

JOBS (${jobs.length}):
${jobs
  .map(
    (j: any) => {
      const costs = Number(j.actual_cost) || (Number(j.materials_cost) + Number(j.labour_cost) + Number(j.other_costs));
      const margin = j.margin_percentage != null ? Number(j.margin_percentage).toFixed(1) : (j.revenue > 0 ? (((j.revenue - costs) / j.revenue) * 100).toFixed(1) : "0");
      const profitStatus = j.profit_status || "—";
      return `- ${j.job_name} | Client: ${j.client_name || "—"} | Status: ${j.status} | Revenue: $${j.revenue} | Est Cost: $${j.estimated_cost || 0} | Actual Cost: $${costs} | Profit: $${j.gross_profit || 0} | Margin: ${margin}% | Profit Status: ${profitStatus}`;
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

QUOTES (${activeQuotes.length}):
${activeQuotes.length === 0 ? "None." : activeQuotes.map((q: any) => `- ${q.quote_number} | ${q.client_name} | $${q.total} | Status: ${q.status} | Sent: ${q.sent_at || "not sent"} | Expiry: ${q.expiry_date || "—"}`).join("\n")}
`;

      if (action === "daily_plan" || action === "decision_panel") {
        contextData += `
SITE ASSESSMENTS (upcoming):
${siteAssessments.length === 0 ? "None scheduled." : siteAssessments.map((a: any) => `- ${a.client_name} | ${a.location} | ${a.slot_date} at ${a.slot_time} | Type: ${a.project_type} | Status: ${a.status}`).join("\n")}

BOOKINGS (upcoming):
${bookings.length === 0 ? "None scheduled." : bookings.map((b: any) => `- ${b.client_name} | ${b.booking_date} ${b.booking_time || ""} | ${b.service_type} | Status: ${b.status}`).join("\n")}
`;
      }
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

      case "daily_plan":
        userPrompt = `${DAILY_PLAN_PROMPT}\n\n${contextData}`;
        break;

      case "decision_panel":
        userPrompt = `${DECISION_PANEL_PROMPT}\n\n${contextData}`;
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

    if (action === "decision_panel") {
      return new Response(
        JSON.stringify({ system_lever: content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
