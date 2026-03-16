import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const inquirySchema = z.object({
  inquiry_id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(20).optional().nullable(),
  services: z.array(z.string().max(100)).max(20).optional(),
  project_vision: z.string().max(2000).optional().nullable(),
  project_details: z.string().max(5000).optional().nullable(),
  budget_range: z.string().max(50).optional().nullable(),
  preferred_start: z.string().max(100).optional().nullable(),
  horse_name: z.string().max(100).optional().nullable(),
  horse_breed: z.string().max(100).optional().nullable(),
  experience_level: z.string().max(50).optional().nullable(),
  status: z.string().max(50).optional().nullable(),
});

/** Uniform client response — identical for success and failure, never leaks internals */
const OK_RESPONSE = { success: true, message: "Sync complete" };
const jsonHeaders = { "Content-Type": "application/json", ...corsHeaders };
const okJson = () =>
  new Response(JSON.stringify(OK_RESPONSE), { status: 200, headers: jsonHeaders });

/** Retry a fetch with exponential backoff for transient failures */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  { retries = 2, baseDelay = 500 } = {}
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      // Only retry on 429 (rate-limit) or 5xx server errors
      if (res.status === 429 || (res.status >= 500 && attempt < retries)) {
        const retryAfter = res.headers.get("Retry-After");
        const delay = retryAfter
          ? Math.min(parseInt(retryAfter, 10) * 1000, 10_000)
          : baseDelay * Math.pow(2, attempt);
        console.warn(`HubSpot ${res.status} — retrying in ${delay}ms (attempt ${attempt + 1})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`HubSpot network error — retrying in ${delay}ms:`, lastError.message);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError ?? new Error("HubSpot request failed after retries");
}

/** Classifies a HubSpot API error for internal logging */
function classifyHubSpotError(status: number, body: string): string {
  if (status === 401) return "HUBSPOT_AUTH_INVALID";
  if (status === 403) return "HUBSPOT_SCOPE_DENIED";
  if (status === 429) return "HUBSPOT_RATE_LIMITED";
  if (status >= 500) return "HUBSPOT_SERVER_ERROR";
  if (body.includes("PROPERTY_DOESNT_EXIST")) return "HUBSPOT_BAD_PROPERTY";
  if (body.includes("INVALID_EMAIL")) return "HUBSPOT_INVALID_EMAIL";
  return `HUBSPOT_ERROR_${status}`;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      return okJson();
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: setting } = await supabase
      .from("integration_settings")
      .select("value")
      .eq("key", "hubspot_api_key")
      .single();

    const hubspotApiKey = setting?.value;
    if (!hubspotApiKey) {
      console.log("HubSpot API key not configured, skipping sync");
      return okJson();
    }

    // Validate input
    const parsed = inquirySchema.safeParse(await req.json());
    if (!parsed.success) {
      console.error("Invalid inquiry data:", parsed.error.flatten());
      return okJson();
    }

    const inquiry = parsed.data;

    // Split name into first/last
    const nameParts = inquiry.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Build HubSpot contact properties
    const properties: Record<string, string> = {
      email: inquiry.email,
      firstname: firstName,
      lastname: lastName,
      hs_lead_status: "NEW",
      lifecyclestage: "lead",
    };

    if (inquiry.phone) properties.phone = inquiry.phone;
    if (inquiry.services?.length) properties.industry = inquiry.services.join(", ");
    if (inquiry.project_vision) properties.message = inquiry.project_vision;
    if (inquiry.project_details) properties.notes_last_contacted = inquiry.project_details;
    if (inquiry.budget_range) properties.annualrevenue = inquiry.budget_range;
    if (inquiry.horse_name) properties.jobtitle = `Horse: ${inquiry.horse_name}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${hubspotApiKey}`,
    };

    // Create contact
    const createRes = await fetchWithRetry(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      { method: "POST", headers, body: JSON.stringify({ properties }) }
    );

    // Handle conflict — update existing contact
    if (createRes.status === 409) {
      const conflictData = await createRes.json();
      const existingId = conflictData?.message?.match(/Existing ID: (\d+)/)?.[1];

      if (existingId) {
        const updateRes = await fetchWithRetry(
          `https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`,
          { method: "PATCH", headers, body: JSON.stringify({ properties }) }
        );

        if (!updateRes.ok) {
          const errBody = await updateRes.text();
          const code = classifyHubSpotError(updateRes.status, errBody);
          console.error(`[${code}] CRM update failed [${updateRes.status}]:`, errBody);
          return okJson();
        }

        console.log("HubSpot contact updated");
        return okJson();
      }

      console.error("CRM 409 conflict — could not resolve existing record:", JSON.stringify(conflictData));
      return okJson();
    }

    if (!createRes.ok) {
      const errBody = await createRes.text();
      const code = classifyHubSpotError(createRes.status, errBody);
      console.error(`[${code}] HubSpot create failed [${createRes.status}]`);
      return okJson();
    }

    console.log("HubSpot contact synced");
    return okJson();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Unhandled sync error:", msg);
    return okJson();
  }
});
