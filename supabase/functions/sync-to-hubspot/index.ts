import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InquiryPayload {
  inquiry_id: string;
  name: string;
  email: string;
  phone?: string;
  services?: string[];
  project_vision?: string;
  project_details?: string;
  budget_range?: string;
  preferred_start?: string;
  horse_name?: string;
  horse_breed?: string;
  experience_level?: string;
  status?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    // Get HubSpot API key from integration_settings
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: setting } = await supabase
      .from("integration_settings")
      .select("value")
      .eq("key", "hubspot_api_key")
      .single();

    const hubspotApiKey = setting?.value;
    if (!hubspotApiKey) {
      console.log("HubSpot API key not configured, skipping sync");
      return new Response(JSON.stringify({ success: false, reason: "not_configured" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const inquiry: InquiryPayload = await req.json();

    if (!inquiry.email) {
      throw new Error("Missing required field: email");
    }

    // Split name into first/last
    const nameParts = (inquiry.name || "").trim().split(/\s+/);
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

    // Create or update contact in HubSpot
    const hubspotResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hubspotApiKey}`,
        },
        body: JSON.stringify({ properties }),
      }
    );

    // If contact exists (409), update instead
    if (hubspotResponse.status === 409) {
      const conflictData = await hubspotResponse.json();
      const existingId = conflictData?.message?.match(/Existing ID: (\d+)/)?.[1];

      if (existingId) {
        const updateResponse = await fetch(
          `https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${hubspotApiKey}`,
            },
            body: JSON.stringify({ properties }),
          }
        );

        if (!updateResponse.ok) {
          const errBody = await updateResponse.text();
          throw new Error(`HubSpot update failed [${updateResponse.status}]: ${errBody}`);
        }

        console.log("HubSpot contact updated:", existingId);
        return new Response(
          JSON.stringify({ success: true, action: "updated", hubspot_id: existingId }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    if (!hubspotResponse.ok && hubspotResponse.status !== 409) {
      const errBody = await hubspotResponse.text();
      throw new Error(`HubSpot create failed [${hubspotResponse.status}]: ${errBody}`);
    }

    const hubspotData = await hubspotResponse.json();
    console.log("HubSpot contact created:", hubspotData.id);

    return new Response(
      JSON.stringify({ success: true, action: "created", hubspot_id: hubspotData.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error syncing to HubSpot:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
