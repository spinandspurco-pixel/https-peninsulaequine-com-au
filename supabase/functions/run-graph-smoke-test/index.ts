// Admin-only Knowledge Graph C.1b smoke test runner.
// Mirrors the DB-level phases of scripts/live-smoke-test/smoke.py
// (Phase 1 SQL verify + Phase 3 pipeline with guaranteed cleanup),
// but runs entirely inside Lovable Cloud — no browser, no laptop secrets.
// Browser-level UI sweep (Phase 2) is intentionally NOT covered here;
// keep the local script for that.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MAIN_RIDGE_CODE = "PE-MR-014";

type Step = { ok: boolean; msg: string; info?: boolean };
type Summary = {
  result?: "PASS" | "FAIL";
  exit_code?: number;
  started_at: string;
  finished_at?: string;
  duration_ms?: number;
  residue_found?: boolean;
  suggested_count?: number;
  orphan_count?: number;
  duplicate_count?: number;
};
type Report = {
  run_id: string;
  started_at: string;
  ended_at?: string;
  environment: string;
  phases: Record<string, unknown>;
  steps: Step[];
  summary: Summary;
  result?: "PASS" | "FAIL";
  exit_code?: number;
  error?: { code: number; message: string; sql?: string };
};

const EXIT = {
  OK: 0,
  CONFIG: 1,
  VERIFY_MISMATCH: 2,
  UPLOAD: 4,
  VERIFY_FLOW: 5,
  CLEANUP: 6,
} as const;

function isoStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").replace(/Z$/, "Z");
}

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

class SmokeFail extends Error {
  constructor(public code: number, message: string, public sql?: string) {
    super(message);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply(405, { error: "method_not_allowed" });

  // ── Auth: admin only ───────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return reply(401, { error: "unauthorized" });
  const token = authHeader.replace("Bearer ", "");

  const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claimsData, error: claimsErr } = await authedClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims?.sub) return reply(401, { error: "unauthorized" });
  const userId = claimsData.claims.sub as string;
  const userEmail = (claimsData.claims.email as string | undefined) ?? null;

  const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: isAdmin, error: roleErr } = await svc.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (roleErr) return reply(500, { error: "role_check_failed", detail: roleErr.message });
  if (!isAdmin) return reply(403, { error: "forbidden_admin_only" });

  // ── Body / safety ─────────────────────────────────────────────────
  let body: { confirm?: string; environment?: string } = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  if (body.confirm !== "I_UNDERSTAND_THIS_TOUCHES_PRODUCTION") {
    return reply(400, {
      error: "missing_confirm",
      hint: "POST { confirm: 'I_UNDERSTAND_THIS_TOUCHES_PRODUCTION' }",
    });
  }

  const startedAtMs = Date.now();
  const report: Report = {
    run_id: isoStamp(),
    started_at: new Date().toISOString(),
    environment: body.environment ?? "cloud",
    phases: {},
    steps: [],
  };

  const ok = (msg: string) => report.steps.push({ ok: true, msg });
  const info = (msg: string) => report.steps.push({ ok: true, msg, info: true });

  // Create RUNNING row up-front
  const { data: runRow, error: insertErr } = await svc
    .from("graph_smoke_reports")
    .insert({
      triggered_by: userId,
      triggered_by_email: userEmail,
      environment: report.environment,
      result: "RUNNING",
      exit_code: 0,
      report: { run_id: report.run_id, started_at: report.started_at },
    })
    .select("id")
    .single();
  if (insertErr) return reply(500, { error: "report_row_failed", detail: insertErr.message });
  const reportId = runRow.id as string;

  const finalise = async (
    result: "PASS" | "FAIL",
    exit_code: number,
    error?: { code: number; message: string; sql?: string },
  ) => {
    report.ended_at = new Date().toISOString();
    report.result = result;
    report.exit_code = exit_code;
    if (error) report.error = error;
    await svc
      .from("graph_smoke_reports")
      .update({
        result,
        exit_code,
        error_message: error?.message ?? null,
        duration_ms: Date.now() - startedAtMs,
        report,
      })
      .eq("id", reportId);
  };

  // ── Phase 1: SQL verify ───────────────────────────────────────────
  let mainRidgeId: string;
  try {
    // status counts
    const { data: statusRows, error: e1 } = await svc
      .from("hq_graph_edges")
      .select("status");
    if (e1) throw new SmokeFail(EXIT.VERIFY_MISMATCH, `status query failed: ${e1.message}`);
    const statusMap: Record<string, number> = {};
    for (const r of statusRows ?? []) {
      statusMap[r.status as string] = (statusMap[r.status as string] ?? 0) + 1;
    }
    ok(`status counts: ${JSON.stringify(statusMap)}`);
    if ((statusMap.suggested ?? 0) !== 0) {
      throw new SmokeFail(
        EXIT.VERIFY_MISMATCH,
        `suggested != 0 (got ${statusMap.suggested})`,
      );
    }
    ok("suggested = 0");

    // Main Ridge project
    const { data: mr, error: e2 } = await svc
      .from("managed_projects")
      .select("id")
      .eq("code", MAIN_RIDGE_CODE)
      .maybeSingle();
    if (e2) throw new SmokeFail(EXIT.VERIFY_MISMATCH, `project lookup failed: ${e2.message}`);
    if (!mr) throw new SmokeFail(EXIT.VERIFY_MISMATCH, `Main Ridge project ${MAIN_RIDGE_CODE} missing`);
    mainRidgeId = mr.id as string;

    // Main Ridge system_linked media edge count
    const { count: mrCount, error: e3 } = await svc
      .from("hq_graph_edges")
      .select("*", { count: "exact", head: true })
      .eq("from_type", "project")
      .eq("from_id", mainRidgeId)
      .eq("to_type", "media")
      .eq("status", "system_linked");
    if (e3) throw new SmokeFail(EXIT.VERIFY_MISMATCH, `MR edge count failed: ${e3.message}`);
    if ((mrCount ?? 0) !== 5) {
      throw new SmokeFail(
        EXIT.VERIFY_MISMATCH,
        `Main Ridge system_linked media edges = ${mrCount}, expected 5`,
      );
    }
    ok("Main Ridge system_linked media edges = 5");

    // Orphans + duplicates via lightweight checks
    const orphans = await countOrphans(svc);
    if (orphans !== 0) throw new SmokeFail(EXIT.VERIFY_MISMATCH, `orphans = ${orphans}, expected 0`);
    ok("orphans = 0");

    const dupes = await countDuplicates(svc);
    if (dupes !== 0) throw new SmokeFail(EXIT.VERIFY_MISMATCH, `duplicate edges = ${dupes}, expected 0`);
    ok("duplicate edges = 0");

    report.phases.sql_verify = {
      status_counts: statusMap,
      main_ridge_id: mainRidgeId,
    };
  } catch (err) {
    const f = err instanceof SmokeFail ? err : new SmokeFail(EXIT.VERIFY_MISMATCH, String((err as Error).message ?? err));
    await finalise("FAIL", f.code, { code: f.code, message: f.message });
    return reply(200, { report_id: reportId, result: "FAIL", exit_code: f.code, message: f.message });
  }

  // ── Phase 3: pipeline (insert → suggested → verify → cleanup) ─────
  let assetId: string | null = null;
  try {
    // Insert throwaway
    const newId = crypto.randomUUID();
    const { error: insErr } = await svc.from("media_assets").insert({
      id: newId,
      title: "main-ridge-test.jpg",
      description: "cloud smoke test",
      tags: ["main-ridge"],
      project_id: null,
      is_demo: false,
      approval_state: "draft",
      asset_type: "image",
      storage_path: `smoke/${newId}.jpg`,
    });
    if (insErr) throw new SmokeFail(EXIT.UPLOAD, `throwaway insert failed: ${insErr.message}`);
    assetId = newId;
    info(`inserted throwaway media_assets.id=${assetId}`);

    // Wait up to 5s for suggested edge from trigger
    let edge: { id: string; from_id: string; status: string; matched_rules: string[] | null } | null = null;
    for (let i = 0; i < 10; i++) {
      const { data: row } = await svc
        .from("hq_graph_edges")
        .select("id, from_id, status, matched_rules")
        .eq("to_type", "media")
        .eq("to_id", assetId)
        .eq("status", "suggested")
        .maybeSingle();
      if (row) { edge = row as typeof edge; break; }
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!edge) throw new SmokeFail(EXIT.UPLOAD, "trigger did not produce a suggested edge within 5s");
    if (edge.from_id !== mainRidgeId) {
      throw new SmokeFail(
        EXIT.UPLOAD,
        `suggested edge points to ${edge.from_id}, expected Main Ridge ${mainRidgeId}`,
      );
    }
    ok(`suggested edge created (rules: ${JSON.stringify(edge.matched_rules)})`);

    // Mimic UI "Verify" click → promote to verified
    const { error: vErr } = await svc
      .from("hq_graph_edges")
      .update({ status: "verified" })
      .eq("id", edge.id);
    if (vErr) throw new SmokeFail(EXIT.VERIFY_FLOW, `verify update failed: ${vErr.message}`);

    const { data: after } = await svc
      .from("hq_graph_edges")
      .select("status")
      .eq("id", edge.id)
      .maybeSingle();
    if (!after || after.status !== "verified") {
      throw new SmokeFail(
        EXIT.VERIFY_FLOW,
        `edge status after verify = ${after?.status ?? "missing"}, expected verified`,
      );
    }
    ok("edge status = verified");

    report.phases.pipeline = { asset_id: assetId, verified_edge_id: edge.id };
  } catch (err) {
    const f = err instanceof SmokeFail ? err : new SmokeFail(EXIT.UPLOAD, String((err as Error).message ?? err));
    await cleanupThrowaway(svc, assetId);
    await finalise("FAIL", f.code, { code: f.code, message: f.message });
    return reply(200, { report_id: reportId, result: "FAIL", exit_code: f.code, message: f.message });
  } finally {
    // finally cleanup (no-op if already cleaned in catch)
    await cleanupThrowaway(svc, assetId);
    ok("throwaway asset cleaned up (finally)");
  }

  // ── Final bells ───────────────────────────────────────────────────
  try {
    const { count: finalSuggested, error: fsErr } = await svc
      .from("hq_graph_edges")
      .select("*", { count: "exact", head: true })
      .eq("status", "suggested");
    if (fsErr) throw new SmokeFail(EXIT.CLEANUP, `final suggested check failed: ${fsErr.message}`);
    const finalOrphans = await countOrphans(svc);
    report.phases.final = { suggested: finalSuggested ?? 0, orphans: finalOrphans };

    if ((finalSuggested ?? 0) !== 0) {
      throw new SmokeFail(EXIT.CLEANUP, `suggested != 0 after cleanup (got ${finalSuggested})`);
    }
    if (finalOrphans !== 0) {
      throw new SmokeFail(EXIT.CLEANUP, `orphans != 0 after cleanup (got ${finalOrphans})`);
    }
    ok("suggested = 0 after cleanup (the final bell)");
    ok("orphans = 0 after cleanup");
  } catch (err) {
    const f = err instanceof SmokeFail ? err : new SmokeFail(EXIT.CLEANUP, String((err as Error).message ?? err));
    await finalise("FAIL", f.code, { code: f.code, message: f.message });
    return reply(200, { report_id: reportId, result: "FAIL", exit_code: f.code, message: f.message });
  }

  await finalise("PASS", EXIT.OK);
  return reply(200, { report_id: reportId, result: "PASS", exit_code: EXIT.OK });
});

async function cleanupThrowaway(svc: ReturnType<typeof createClient>, assetId: string | null) {
  if (!assetId) return;
  try {
    await svc.from("hq_graph_edges").delete().eq("to_type", "media").eq("to_id", assetId);
    await svc.from("media_assets").delete().eq("id", assetId);
  } catch { /* swallow — best effort */ }
}

async function countOrphans(svc: ReturnType<typeof createClient>): Promise<number> {
  // Pull edges in batches and check existence client-side.
  // Production hq_graph_edges is small (< few thousand) so this is fine.
  const { data: edges, error } = await svc
    .from("hq_graph_edges")
    .select("from_type, from_id, to_type, to_id");
  if (error) throw new SmokeFail(EXIT.VERIFY_MISMATCH, `orphan scan failed: ${error.message}`);
  if (!edges) return 0;

  const projectIds = new Set<string>();
  const mediaIds = new Set<string>();
  for (const e of edges) {
    if (e.from_type === "project") projectIds.add(e.from_id as string);
    if (e.from_type === "media") mediaIds.add(e.from_id as string);
    if (e.to_type === "project") projectIds.add(e.to_id as string);
    if (e.to_type === "media") mediaIds.add(e.to_id as string);
  }

  const liveProjects = await fetchExisting(svc, "managed_projects", [...projectIds]);
  const liveMedia = await fetchExisting(svc, "media_assets", [...mediaIds]);

  let orphans = 0;
  for (const e of edges) {
    if (e.from_type === "project" && !liveProjects.has(e.from_id as string)) orphans++;
    else if (e.from_type === "media" && !liveMedia.has(e.from_id as string)) orphans++;
    else if (e.to_type === "project" && !liveProjects.has(e.to_id as string)) orphans++;
    else if (e.to_type === "media" && !liveMedia.has(e.to_id as string)) orphans++;
  }
  return orphans;
}

async function fetchExisting(
  svc: ReturnType<typeof createClient>,
  table: "managed_projects" | "media_assets",
  ids: string[],
): Promise<Set<string>> {
  const set = new Set<string>();
  if (ids.length === 0) return set;
  const { data } = await svc.from(table).select("id").in("id", ids);
  for (const r of data ?? []) set.add(r.id as string);
  return set;
}

async function countDuplicates(svc: ReturnType<typeof createClient>): Promise<number> {
  const { data: edges, error } = await svc
    .from("hq_graph_edges")
    .select("from_type, from_id, to_type, to_id, relation");
  if (error) throw new SmokeFail(EXIT.VERIFY_MISMATCH, `duplicate scan failed: ${error.message}`);
  if (!edges) return 0;
  const seen = new Map<string, number>();
  for (const e of edges) {
    const key = `${e.from_type}|${e.from_id}|${e.to_type}|${e.to_id}|${e.relation}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  let dupes = 0;
  for (const n of seen.values()) if (n > 1) dupes++;
  return dupes;
}
