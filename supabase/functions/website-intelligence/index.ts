import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the internal website intelligence analyst for Peninsula Equine. You review design, motion, performance, brand consistency, and conversion clarity.

AESTHETIC STANDARD:
- Midnight & Blackened Steel palette: deep navy/charcoal with Antique Gold accents
- Ultra-minimal, architectural, editorial
- Quiet motion: 600-800ms, cubic-bezier easing, soft fades only
- No horizontal slides, no bouncy effects, no flashy gimmicks
- Extreme restraint: negative space, editorial typography, high-contrast imagery
- Every section must justify its existence

BRAND ECOSYSTEM:
- Peninsula Equine (primary brand)
- GroundLock™ (proprietary ground stabilisation)
- Equus Ridge (property/lifestyle arm)

RULES:
- Favor simplification over adding more
- Never suggest flashy motion or trendy UI patterns
- Preserve the architectural design language
- Prioritize mobile responsiveness, performance, and conversion clarity
- Be decisive and specific — no vague suggestions
- Each suggestion must have: title, issue, why it matters, suggested fix, priority (High/Medium/Low), category`;

const AUDIT_PROMPTS: Record<string, string> = {
  design: `Perform a Design Audit. Review and report on:
- Spacing consistency across sections
- Typography hierarchy (H1 > H2 > body > caption)
- Visual rhythm and section composition
- Icon consistency and usage
- Section clutter or unnecessary elements
- Page composition quality

Return 3-6 specific, actionable findings. Each must include: title, issue detected, why it matters, suggested fix, priority (High/Medium/Low).
Format as a JSON array of objects with keys: title, issue, why_it_matters, suggested_fix, priority, category (always "design").`,

  motion: `Perform a Motion / UX Audit. Review and report on:
- Reveal timing and scroll animation quality
- Hover interaction quality
- Page transition smoothness
- Scroll behavior and smoothness
- Animation restraint (are there too many or poorly timed animations?)
- Interaction feedback quality

Peninsula Equine standard: 600-800ms duration, cubic-bezier easing, soft fades and masked reveals only. No horizontal slides, no bounce, no flashy effects.

Return 3-6 specific findings as JSON array with keys: title, issue, why_it_matters, suggested_fix, priority, category (always "motion").`,

  performance: `Perform a Performance Audit. Review and report on:
- Potential loading speed issues (large images, heavy scripts, unoptimized assets)
- Heavy sections that could cause render delays
- Animation performance concerns (GPU compositing, layout thrashing)
- Mobile performance risks
- Layout shift risks (CLS)
- Unnecessary re-renders or heavy component trees

Return 3-6 specific findings as JSON array with keys: title, issue, why_it_matters, suggested_fix, priority, category (always "performance").`,

  brand: `Perform a Brand Consistency Audit. Review and report on:
- Tone consistency across pages (should be: quiet authority, premium, calm)
- CTA consistency (language, placement, visual weight)
- Repeated or weak copy
- Sections that underperform or feel generic
- Ecosystem consistency across Peninsula Equine / GroundLock / Equus Ridge
- Any copy that sounds eager, desperate, or chatbot-like

Return 3-6 specific findings as JSON array with keys: title, issue, why_it_matters, suggested_fix, priority, category (always "brand").`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roles } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id);
    if (!roles?.some((r: any) => r.role === "admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { audit_type, page_context } = await req.json();

    const auditPrompt = AUDIT_PROMPTS[audit_type];
    if (!auditPrompt) {
      return new Response(JSON.stringify({ error: "Unknown audit type. Use: design, motion, performance, brand" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather site structure context
    const contextParts = [auditPrompt];

    if (page_context) {
      contextParts.push(`\nPAGE CONTEXT PROVIDED:\n${page_context}`);
    }

    // Add known site structure
    contextParts.push(`\nSITE STRUCTURE:
- Home (/) — hero, services highlights, testimonials, about teaser, gallery teaser, quote section
- About (/about) — team, story, values
- Services (/services) — service cards, detail pages
- Gallery (/gallery) — filterable project gallery
- Contact (/contact) — inquiry form
- Lessons (/lessons) — lesson booking
- Events (/events) — managed events
- FAQ (/faq)
- GroundLock (/groundlock) — product page
- Equus Ridge (/equus-ridge) — lifestyle brand
- Site Assessment (/site-assessment) — booking form
- Process (/process) — build process stages

DESIGN SYSTEM:
- Dark theme: bg 222 20% 6%, foreground cream/white
- Accent: Antique Gold 38 50% 50%
- Font: Serif headings, sans body
- Motion: cubic-bezier(0.16, 1, 0.3, 1), 600-800ms
- Components: shadcn/ui with custom variants
- Textures: CSS grid overlays, grain at 3.5% opacity`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          { role: "user", content: contextParts.join("\n") },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    // Try to parse JSON from the response
    let suggestions = [];
    try {
      // Extract JSON array from response (may be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("Failed to parse AI suggestions as JSON, returning raw");
      return new Response(JSON.stringify({ suggestions: [], raw: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("website-intelligence error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
