import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_SECRETS = [
  "FROM_EMAIL",
  "HQ_EMAIL_FROM",
  "BOOKINGS_EMAIL_FROM",
  "QUOTES_EMAIL_FROM",
  "NOREPLY_EMAIL_FROM",
] as const;

const VERIFIED_DOMAIN = "notify.peninsulaequine.org";

type SenderStatus = {
  secret: string;
  configured: boolean;
  raw?: string;
  address?: string;
  domain?: string;
  invalid?: boolean;
  resendDevDetected?: boolean;
  matchesVerifiedDomain?: boolean;
};

function parseAddress(value: string | undefined): { address?: string; domain?: string; invalid: boolean } {
  if (!value) return { invalid: true };
  // Support "Name <addr@domain>" or "addr@domain"
  const angle = value.match(/<([^>]+)>/);
  const addr = (angle ? angle[1] : value).trim();
  const m = addr.match(/^[^@\s]+@([^@\s]+\.[^@\s]+)$/);
  if (!m) return { invalid: true };
  return { address: addr, domain: m[1].toLowerCase(), invalid: false };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json(401, { error: "Unauthorized" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    const userId = userData?.user?.id;
    if (userErr || !userId) return json(401, { error: "Unauthorized" });

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) return json(403, { error: "Forbidden" });

    // ── Sender verification ────────────────────────────
    const senders: SenderStatus[] = SENDER_SECRETS.map((secret) => {
      const raw = Deno.env.get(secret);
      if (!raw) return { secret, configured: false };
      const parsed = parseAddress(raw);
      const resendDev = /resend\.dev/i.test(raw);
      return {
        secret,
        configured: true,
        raw,
        address: parsed.address,
        domain: parsed.domain,
        invalid: parsed.invalid,
        resendDevDetected: resendDev,
        matchesVerifiedDomain: parsed.domain === VERIFIED_DOMAIN,
      };
    });

    // ── Resend domain health ───────────────────────────
    let resendDomain: {
      requested: string;
      found: boolean;
      status?: string;
      records?: Array<{ record: string; name: string; status?: string; value?: string }>;
      error?: string;
    } = { requested: VERIFIED_DOMAIN, found: false };

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      resendDomain.error = "RESEND_API_KEY missing";
    } else {
      try {
        const listRes = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
        });
        const listJson: any = await listRes.json();
        if (!listRes.ok) {
          resendDomain.error = listJson?.message || `Resend list error ${listRes.status}`;
        } else {
          const list: any[] = listJson?.data ?? [];
          const match = list.find((d) => (d.name || "").toLowerCase() === VERIFIED_DOMAIN);
          if (!match) {
            resendDomain.found = false;
          } else {
            resendDomain.found = true;
            resendDomain.status = match.status;
            // Fetch detailed records
            const detailRes = await fetch(`https://api.resend.com/domains/${match.id}`, {
              headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
            });
            const detailJson: any = await detailRes.json();
            if (detailRes.ok) {
              resendDomain.status = detailJson?.status ?? resendDomain.status;
              resendDomain.records = (detailJson?.records ?? []).map((r: any) => ({
                record: r.record,
                name: r.name,
                status: r.status,
                value: r.value,
              }));
            }
          }
        }
      } catch (e) {
        resendDomain.error = e instanceof Error ? e.message : String(e);
      }
    }

    // ── Last success / last failure from diagnostic log ─
    const { data: lastSuccess } = await admin
      .from("email_diagnostic_log")
      .select("*")
      .eq("status", "sent")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: lastFailure } = await admin
      .from("email_diagnostic_log")
      .select("*")
      .eq("status", "failed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: history } = await admin
      .from("email_diagnostic_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    // ── Checklist ──────────────────────────────────────
    const dkim = resendDomain.records?.find((r) => /dkim/i.test(r.record));
    const spf = resendDomain.records?.find((r) => /spf/i.test(r.record) || r.record === "SPF");
    const dmarc = resendDomain.records?.find((r) => /dmarc/i.test(r.record));
    // Resend uses TXT/MX/CNAME — fall back to status-based view
    const allSendersOk = senders.every(
      (s) => s.configured && !s.invalid && !s.resendDevDetected
    );

    const checklist = {
      domainVerified: resendDomain.status === "verified",
      spfVerified: spf ? spf.status === "verified" : resendDomain.status === "verified",
      dkimVerified: dkim ? dkim.status === "verified" : resendDomain.status === "verified",
      dmarcVerified: dmarc ? dmarc.status === "verified" : null, // DMARC is optional / customer-owned root record
      sendersConfigured: allSendersOk,
      diagnosticSendPassed: Boolean(lastSuccess),
    };

    return json(200, {
      verifiedDomain: VERIFIED_DOMAIN,
      senders,
      resendDomain,
      lastSuccess,
      lastFailure,
      history: history ?? [],
      checklist,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[email-ops-status] error", err);
    return json(500, { error: err instanceof Error ? err.message : String(err) });
  }
});
