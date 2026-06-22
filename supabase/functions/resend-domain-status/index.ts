import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DOMAIN = "peninsulaequine.systems";

interface ResendRecord {
  record: string;
  name: string;
  type: string;
  value: string;
  ttl?: string | number;
  status?: string;
  priority?: number;
}

interface ResendDomain {
  id: string;
  name: string;
  status: string;
  region?: string;
  created_at?: string;
  records?: ResendRecord[];
}

async function resend(path: string, init?: RequestInit) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY not configured");
  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let json: unknown = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, body: json, raw: text };
}

async function findDomain(): Promise<ResendDomain | null> {
  const list = await resend("/domains");
  if (!list.ok) throw new Error(`Resend list failed (${list.status}): ${list.raw}`);
  const data = (list.body as { data?: ResendDomain[] })?.data ?? [];
  const match = data.find((d) => d.name === DOMAIN);
  if (!match) return null;
  // Fetch detail to include record list
  const detail = await resend(`/domains/${match.id}`);
  if (!detail.ok) return match;
  return detail.body as ResendDomain;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Require an authenticated admin user
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: isAdmin } = await serviceClient.rpc("has_role", {
      _user_id: userData.user.id, _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: { action?: string } = {};
    try { body = await req.json(); } catch { /* GET-like */ }
    const action = body.action ?? "status";

    if (action === "verify") {
      const domain = await findDomain();
      if (!domain) {
        return new Response(JSON.stringify({ error: "domain_not_found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const verify = await resend(`/domains/${domain.id}/verify`, { method: "POST" });
      const fresh = await findDomain();
      return new Response(
        JSON.stringify({
          triggered: verify.ok,
          verifyStatus: verify.status,
          verifyBody: verify.body,
          domain: fresh,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "test-inquiry") {
      const payload = {
        name: "HQ Smoke Test",
        email: "info@peninsulaequine.systems",
        services: ["general"],
        goals: "Automated re-test from HQ → Email Migration panel.",
        additionalNotes: `Triggered ${new Date().toISOString()} by admin ${userData.user.email}`,
      };
      const t0 = Date.now();
      const { data: invokeData, error: invokeErr } = await serviceClient.functions.invoke(
        "send-inquiry-notification",
        { body: payload },
      );
      const latency = Date.now() - t0;
      if (invokeErr) {
        return new Response(JSON.stringify({
          ok: false, latency, error: invokeErr.message ?? String(invokeErr),
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ ok: true, latency, result: invokeData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: status
    const domain = await findDomain();
    if (!domain) {
      return new Response(JSON.stringify({
        configured: false, domain: DOMAIN,
        message: "Domain not registered in Resend.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ configured: true, domain }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

Deno.serve(handler);
