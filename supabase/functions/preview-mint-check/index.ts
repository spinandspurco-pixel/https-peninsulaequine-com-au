import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Preview Mint Gate
 * ─────────────────
 * Scans every preview-visible table for placeholder / test / generic identities
 * that would shatter the illusion of a "prepared for you" Client Preview.
 *
 * Returns { passed, findings[] } so the HQ admin UI can block account minting
 * until every finding is resolved.
 *
 * Admin-only.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScanTarget {
  table: string;
  nameCols: string[];
  emailCols: string[];
}

// Only structured identity columns are scanned — never free-text fields like
// description / notes / scope, which can legitimately mention these words.
const TARGETS: ScanTarget[] = [
  { table: "inquiries", nameCols: ["name"], emailCols: ["email"] },
  {
    table: "quotes",
    nameCols: ["client_name", "accepted_by_name"],
    emailCols: ["client_email", "accepted_by_email"],
  },
  { table: "managed_testimonials", nameCols: ["client_name"], emailCols: [] },
  { table: "managed_projects", nameCols: ["name"], emailCols: [] },
  {
    table: "client_followups",
    nameCols: ["client_name", "project_name"],
    emailCols: ["client_email"],
  },
  { table: "event_rsvps", nameCols: ["name"], emailCols: ["email"] },
  { table: "equus_ridge_interest", nameCols: ["name"], emailCols: ["email"] },
  { table: "bookings", nameCols: ["client_name"], emailCols: ["client_email"] },
  { table: "lesson_bookings", nameCols: ["client_name"], emailCols: ["client_email"] },
  { table: "site_assessments", nameCols: ["client_name"], emailCols: ["client_email"] },
  { table: "newsletter_subscribers", nameCols: ["name"], emailCols: ["email"] },
];

const NAME_BLOCKLIST = [
  "Josh Smith",
  "Test User",
  "Test Client",
  "Demo User",
  "Placeholder User",
  "Placeholder",
  "John Doe",
  "Jane Doe",
  "Operator",
  "Lorem Ipsum",
];

const EMAIL_BLOCKLIST = [
  "@example.com",
  "@example.org",
  "@test.com",
  "test@",
  "demo@",
  "placeholder@",
  "noreply@example",
  "johntest@",
];

interface Finding {
  table: string;
  column: string;
  match: string;
  rowId?: string | null;
  value: string;
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
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) return json(401, { error: "Unauthorized" });
    const userId = claims.claims.sub as string;

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleErr || !isAdmin) return json(403, { error: "Forbidden — admin role required" });

    // ── Scan ───────────────────────────────────────────
    const findings: Finding[] = [];
    const tablesScanned: string[] = [];

    for (const target of TARGETS) {
      const cols = ["id", ...target.nameCols, ...target.emailCols].filter(Boolean);
      if (cols.length <= 1) continue;
      const { data, error } = await admin
        .from(target.table)
        .select(cols.join(","))
        .limit(2000);
      if (error) {
        // Table may not exist in some environments — record and continue.
        findings.push({
          table: target.table,
          column: "_scan",
          match: "scan_error",
          value: error.message,
        });
        continue;
      }
      tablesScanned.push(target.table);
      for (const row of (data ?? []) as Record<string, unknown>[]) {
        for (const col of target.nameCols) {
          const v = (row[col] ?? "") as string;
          if (!v) continue;
          for (const needle of NAME_BLOCKLIST) {
            // Word-boundary match so "Operations" doesn't trip "Operator".
            const re = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
            if (re.test(v)) {
              findings.push({
                table: target.table,
                column: col,
                match: needle,
                rowId: (row.id as string) ?? null,
                value: v,
              });
            }
          }
        }
        for (const col of target.emailCols) {
          const v = ((row[col] ?? "") as string).toLowerCase();
          if (!v) continue;
          for (const needle of EMAIL_BLOCKLIST) {
            if (v.includes(needle.toLowerCase())) {
              findings.push({
                table: target.table,
                column: col,
                match: needle,
                rowId: (row.id as string) ?? null,
                value: v,
              });
            }
          }
        }
      }
    }

    return json(200, {
      passed: findings.length === 0,
      findings,
      tablesScanned,
      ranAt: new Date().toISOString(),
      blocklist: { names: NAME_BLOCKLIST, emails: EMAIL_BLOCKLIST },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json(500, { error: msg });
  }
});
