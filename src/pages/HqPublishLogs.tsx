import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";
import { HqNav } from "@/components/hq/HqNav";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * HQ → Operations → Publish Logs
 *
 * Admin-only. Reads rows written by `scripts/prepublish.mjs` (via the
 * `publish-log-ingest` edge function). Rows are grouped by `run_id` so each
 * prepublish + publish attempt is a single expandable entry with per-step logs.
 */

type Row = {
  id: string;
  created_at: string;
  run_id: string;
  kind: "typecheck" | "lint" | "test" | "build" | "publish" | "summary";
  status: "pass" | "fail" | "skipped" | "info";
  duration_ms: number | null;
  commit_sha: string | null;
  branch: string | null;
  actor: string | null;
  log: string;
  meta: Record<string, unknown> | null;
};

type Run = {
  run_id: string;
  created_at: string;
  commit_sha: string | null;
  branch: string | null;
  actor: string | null;
  status: "pass" | "fail" | "skipped" | "info";
  steps: Row[];
};

const STEP_ORDER: Row["kind"][] = ["typecheck", "lint", "test", "build", "publish", "summary"];

function statusClass(status: Row["status"]) {
  if (status === "fail") return "text-red-400 border-red-500/40 bg-red-500/5";
  if (status === "pass") return "text-emerald-300 border-emerald-500/30 bg-emerald-500/5";
  if (status === "skipped") return "text-foreground/50 border-border/60 bg-background/40";
  return "text-foreground/70 border-border/60 bg-background/40";
}

function groupRuns(rows: Row[]): Run[] {
  const map = new Map<string, Run>();
  for (const r of rows) {
    let run = map.get(r.run_id);
    if (!run) {
      run = {
        run_id: r.run_id,
        created_at: r.created_at,
        commit_sha: r.commit_sha,
        branch: r.branch,
        actor: r.actor,
        status: "info",
        steps: [],
      };
      map.set(r.run_id, run);
    }
    run.steps.push(r);
    if (new Date(r.created_at) < new Date(run.created_at)) run.created_at = r.created_at;
  }
  for (const run of map.values()) {
    run.steps.sort(
      (a, b) => STEP_ORDER.indexOf(a.kind) - STEP_ORDER.indexOf(b.kind),
    );
    const summary = run.steps.find((s) => s.kind === "summary");
    run.status = summary?.status
      ?? (run.steps.some((s) => s.status === "fail") ? "fail"
        : run.steps.every((s) => s.status === "pass" || s.status === "skipped") ? "pass"
        : "info");
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

type FailureCluster = {
  key: string;
  commit_sha: string | null;
  bundle_id: string | null;
  count: number;
  first_seen: string;
  last_seen: string;
  run_ids: string[];
  sample_message: string;
};

function clusterFailures(rows: Row[]): FailureCluster[] {
  const map = new Map<string, FailureCluster>();
  for (const r of rows) {
    if (r.status !== "fail") continue;
    const bundleId =
      (r.meta && typeof r.meta === "object" && "bundle_id" in r.meta
        ? ((r.meta as { bundle_id?: unknown }).bundle_id ?? null)
        : null) as string | null;
    const commit = r.commit_sha ?? null;
    if (!commit && !bundleId) continue;
    const key = `${commit ?? "—"}::${bundleId ?? "—"}`;
    let c = map.get(key);
    if (!c) {
      c = {
        key,
        commit_sha: commit,
        bundle_id: bundleId,
        count: 0,
        first_seen: r.created_at,
        last_seen: r.created_at,
        run_ids: [],
        sample_message: (r.log ?? "").split("\n")[0]?.slice(0, 160) ?? "",
      };
      map.set(key, c);
    }
    c.count += 1;
    if (new Date(r.created_at) > new Date(c.last_seen)) c.last_seen = r.created_at;
    if (new Date(r.created_at) < new Date(c.first_seen)) c.first_seen = r.created_at;
    if (!c.run_ids.includes(r.run_id)) c.run_ids.push(r.run_id);
  }
  return Array.from(map.values())
    .filter((c) => c.count >= 1)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
    });
}

function buildSupportBundle(run: Run): string {
  return JSON.stringify(
    {
      run_id: run.run_id,
      created_at: run.created_at,
      status: run.status,
      branch: run.branch,
      commit_sha: run.commit_sha,
      actor: run.actor,
      steps: run.steps.map((s) => ({
        kind: s.kind,
        status: s.status,
        duration_ms: s.duration_ms,
        meta: s.meta ?? {},
        log_tail: (s.log ?? "").slice(-4000),
      })),
    },
    null,
    2,
  );
}

export default function HqPublishLogs() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportBundleId, setReportBundleId] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportContext, setReportContext] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportNotice, setReportNotice] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("publish_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) setError(error.message);
    setRows((data as Row[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submitReport = useCallback(async () => {
    setReportNotice(null);
    const message = reportMessage.trim();
    if (!message) {
      setReportNotice("Add the error message before reporting.");
      return;
    }
    const MAX_BYTES = 20 * 1024 * 1024;
    const oversize = reportFiles.find((f) => f.size > MAX_BYTES);
    if (oversize) {
      setReportNotice(`"${oversize.name}" exceeds the 20MB per-file limit.`);
      return;
    }
    setReportSubmitting(true);
    try {
      const folder = crypto.randomUUID();
      const uploaded: Array<{ path: string; name: string; size: number; type: string }> = [];
      for (let i = 0; i < reportFiles.length; i++) {
        const f = reportFiles[i];
        setUploadProgress(`Uploading ${i + 1}/${reportFiles.length}: ${f.name}`);
        const safe = f.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 200);
        const path = `${folder}/${Date.now()}-${safe}`;
        const { error: upErr } = await supabase.storage
          .from("publish-failure-attachments")
          .upload(path, f, { contentType: f.type || "application/octet-stream", upsert: false });
        if (upErr) throw new Error(`Upload failed for ${f.name}: ${upErr.message}`);
        uploaded.push({ path, name: f.name, size: f.size, type: f.type || "" });
      }
      setUploadProgress(null);
      const { data, error } = await supabase.functions.invoke("report-publish-failure", {
        body: {
          bundle_id: reportBundleId.trim() || undefined,
          error_message: message,
          context: reportContext.trim() || undefined,
          occurred_at: new Date().toISOString(),
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          attachments: uploaded,
        },
      });
      if (error) throw error;
      const runId = (data as { run_id?: string } | null)?.run_id ?? "";
      setReportNotice(`Recorded. Run ${runId.slice(0, 8)} saved.`);
      setReportBundleId("");
      setReportMessage("");
      setReportContext("");
      setReportFiles([]);
      await load();
    } catch (e) {
      setReportNotice(e instanceof Error ? e.message : "Failed to record report.");
    } finally {
      setUploadProgress(null);
      setReportSubmitting(false);
    }
  }, [reportBundleId, reportMessage, reportContext, reportFiles, load]);

  const openAttachment = useCallback(async (path: string) => {
    const { data, error } = await supabase.storage
      .from("publish-failure-attachments")
      .createSignedUrl(path, 60 * 10);
    if (error || !data?.signedUrl) {
      alert(error?.message ?? "Could not create download link");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }, []);

  const copyForSupport = useCallback(async (run: Run) => {
    try {
      await navigator.clipboard.writeText(buildSupportBundle(run));
      setCopyNotice(run.run_id);
      setTimeout(() => setCopyNotice((c) => (c === run.run_id ? null : c)), 1500);
    } catch {
      setCopyNotice("error");
    }
  }, []);

  const runs = useMemo(() => groupRuns(rows ?? []), [rows]);
  const clusters = useMemo(() => clusterFailures(rows ?? []), [rows]);

  const jumpToRun = useCallback((runId: string) => {
    setExpanded(runId);
    setTimeout(() => {
      const el = document.getElementById(`run-${runId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <HqBreadcrumbs current="Publish Logs" />
        <HqNav />

        <header className="mt-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Publish logs</h1>
            <p className="mt-2 max-w-2xl text-sm text-foreground/60">
              Full output of every prepublish gate (typecheck, lint, tests, build) and any
              publish attempt that streamed a log. Latest 500 rows, grouped by run.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReportOpen((v) => !v)}
              className="rounded border border-border/60 px-3 py-1.5 text-xs uppercase tracking-wide text-foreground/70 hover:text-foreground"
            >
              {reportOpen ? "Cancel report" : "Report a failure"}
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded border border-border/60 px-3 py-1.5 text-xs uppercase tracking-wide text-foreground/70 hover:text-foreground"
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </header>

        {reportOpen && (
          <section className="mt-6 rounded border border-border/50 bg-background/40 p-4">
            <h2 className="font-serif text-lg">Record a publishing failure</h2>
            <p className="mt-1 text-xs text-foreground/60">
              Captures timestamp, bundle id, and the exact error message so it can be reviewed
              later or shared with support if it repeats.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs uppercase tracking-wide text-foreground/60">
                Bundle id
                <input
                  type="text"
                  value={reportBundleId}
                  onChange={(e) => setReportBundleId(e.target.value)}
                  placeholder="e.g. deploy_abc123 or bundle hash"
                  className="mt-1 w-full rounded border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-foreground normal-case tracking-normal"
                />
              </label>
              <label className="text-xs uppercase tracking-wide text-foreground/60">
                Context (optional)
                <input
                  type="text"
                  value={reportContext}
                  onChange={(e) => setReportContext(e.target.value)}
                  placeholder="What you were doing when it failed"
                  className="mt-1 w-full rounded border border-border/60 bg-background/60 px-3 py-2 text-xs text-foreground normal-case tracking-normal"
                />
              </label>
            </div>
            <label className="mt-3 block text-xs uppercase tracking-wide text-foreground/60">
              Error message *
              <textarea
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                rows={5}
                placeholder="Paste the exact error text shown in the publish dialog"
                className="mt-1 w-full rounded border border-border/60 bg-background/60 px-3 py-2 font-mono text-xs text-foreground normal-case tracking-normal"
              />
            </label>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-foreground/60">{reportNotice}</span>
              <button
                type="button"
                onClick={() => void submitReport()}
                disabled={reportSubmitting}
                className="rounded border border-border/60 bg-background/60 px-3 py-1.5 text-xs uppercase tracking-wide text-foreground/80 hover:text-foreground disabled:opacity-50"
              >
                {reportSubmitting ? "Saving…" : "Save report"}
              </button>
            </div>
          </section>
        )}

        {error && (
          <div className="mt-6 rounded border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {rows && rows.length === 0 && !error && (
          <div className="mt-8 rounded border border-border/50 bg-background/40 p-6 text-sm text-foreground/60">
            No runs yet. Trigger a run with{" "}
            <code className="rounded bg-background/60 px-1.5 py-0.5">bun run prepublish</code>{" "}
            and set{" "}
            <code className="rounded bg-background/60 px-1.5 py-0.5">
              PUBLISH_LOG_INGEST_URL
            </code>{" "}
            +{" "}
            <code className="rounded bg-background/60 px-1.5 py-0.5">
              PUBLISH_LOG_INGEST_SECRET
            </code>{" "}
            so the report is uploaded here.
          </div>
        )}

        {clusters.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-serif text-lg">Failure clusters</h2>
              <span className="text-xs text-foreground/50">
                Grouped by commit &amp; bundle · {clusters.length} unique
              </span>
            </div>
            <ul className="space-y-2">
              {clusters.map((c) => (
                <li
                  key={c.key}
                  className="rounded border border-red-500/30 bg-red-500/5 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
                        c.count >= 3
                          ? "border-red-500/60 bg-red-500/10 text-red-200"
                          : "border-amber-500/40 bg-amber-500/5 text-amber-300",
                      )}
                    >
                      {c.count}× {c.count >= 3 ? "recurring" : "seen"}
                    </span>
                    <span className="font-mono text-foreground/70">
                      commit {c.commit_sha ? c.commit_sha.slice(0, 7) : "—"}
                    </span>
                    <span className="font-mono text-foreground/70">
                      bundle {c.bundle_id ? c.bundle_id.slice(0, 24) : "—"}
                    </span>
                    <span className="text-foreground/50">
                      last {new Date(c.last_seen).toLocaleString()}
                    </span>
                  </div>
                  {c.sample_message && (
                    <p className="mt-2 line-clamp-2 font-mono text-[11px] text-foreground/60">
                      {c.sample_message}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
                    {c.run_ids.slice(0, 8).map((rid) => (
                      <button
                        key={rid}
                        type="button"
                        onClick={() => jumpToRun(rid)}
                        className="rounded border border-border/60 px-1.5 py-0.5 font-mono text-foreground/70 hover:text-foreground"
                      >
                        {rid.slice(0, 8)}
                      </button>
                    ))}
                    {c.run_ids.length > 8 && (
                      <span className="text-foreground/50">
                        +{c.run_ids.length - 8} more
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ul className="mt-6 space-y-3">
          {runs.map((run) => {
            const isOpen = expanded === run.run_id;
            return (
              <li
                key={run.run_id}
                id={`run-${run.run_id}`}
                className="rounded border border-border/50 bg-background/40 scroll-mt-24"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : run.run_id)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider",
                        statusClass(run.status),
                      )}
                    >
                      {run.status}
                    </span>
                    <span className="font-mono text-xs text-foreground/70">
                      {run.run_id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-foreground/50">
                      {new Date(run.created_at).toLocaleString()}
                    </span>
                    {run.branch && (
                      <span className="text-xs text-foreground/50">· {run.branch}</span>
                    )}
                    {run.commit_sha && (
                      <span className="font-mono text-[11px] text-foreground/50">
                        {run.commit_sha.slice(0, 7)}
                      </span>
                    )}
                    {run.actor && (
                      <span className="text-xs text-foreground/50">· {run.actor}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {run.steps
                      .filter((s) => s.kind !== "summary")
                      .map((s) => (
                        <span
                          key={s.id}
                          className={cn(
                            "rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
                            statusClass(s.status),
                          )}
                          title={`${s.kind}: ${s.status}${s.duration_ms ? ` (${s.duration_ms}ms)` : ""}`}
                        >
                          {s.kind}
                        </span>
                      ))}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border/40 px-4 py-3">
                    <div className="mb-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void copyForSupport(run)}
                        className="rounded border border-border/60 px-2.5 py-1 text-[10px] uppercase tracking-wider text-foreground/70 hover:text-foreground"
                      >
                        {copyNotice === run.run_id ? "Copied" : "Copy for support"}
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {run.steps.map((step) => {
                        const key = `${run.run_id}:${step.kind}`;
                        const stepOpen = expandedStep === key;
                        return (
                          <li key={step.id} className="rounded border border-border/40">
                            <button
                              type="button"
                              onClick={() => setExpandedStep(stepOpen ? null : key)}
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
                                    statusClass(step.status),
                                  )}
                                >
                                  {step.status}
                                </span>
                                <span className="font-mono text-xs">{step.kind}</span>
                                {step.duration_ms != null && (
                                  <span className="text-xs text-foreground/50">
                                    {step.duration_ms}ms
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {(() => {
                                  const meta = (step.meta ?? {}) as {
                                    phase?: string | null;
                                    phase_hint?: string | null;
                                    attempts?: unknown[];
                                  };
                                  const attempts = Array.isArray(meta.attempts) ? meta.attempts.length : 0;
                                  return (
                                    <>
                                      {meta.phase && (
                                        <span
                                          className="rounded border border-amber-500/40 bg-amber-500/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-amber-300"
                                          title={meta.phase_hint ?? undefined}
                                        >
                                          phase: {meta.phase}
                                        </span>
                                      )}
                                      {attempts > 1 && (
                                        <span className="text-[11px] text-foreground/50">
                                          {attempts} attempts
                                        </span>
                                      )}
                                      <span className="text-xs text-foreground/50">
                                        {stepOpen ? "hide log" : "view log"}
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                            </button>
                            {stepOpen && (
                              <div className="border-t border-border/40">
                                {(() => {
                                  const meta = (step.meta ?? {}) as {
                                    phase_hint?: string | null;
                                    attempts?: Array<{ attempt: number; status: string; duration_ms: number; exit_code: number | null }>;
                                  };
                                  const attempts = Array.isArray(meta.attempts) ? meta.attempts : [];
                                  if (!meta.phase_hint && attempts.length <= 1) return null;
                                  return (
                                    <div className="border-b border-border/40 bg-background/40 px-3 py-2 text-[11px] text-foreground/70">
                                      {meta.phase_hint && (
                                        <div className="font-mono text-amber-300/90">
                                          ↳ {meta.phase_hint}
                                        </div>
                                      )}
                                      {attempts.length > 1 && (
                                        <div className="mt-1 font-mono text-foreground/60">
                                          attempts:{" "}
                                          {attempts
                                            .map((a) => `#${a.attempt} ${a.status} (${a.duration_ms}ms)`)
                                            .join("  ·  ")}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                                <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap bg-background/60 p-3 font-mono text-[11px] leading-relaxed text-foreground/80">
                                  {step.log || "(no output captured)"}
                                </pre>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Layout>
  );
}
