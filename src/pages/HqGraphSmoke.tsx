import { useCallback, useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { HqNav } from "@/components/hq/HqNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Summary = {
  result?: "PASS" | "FAIL";
  exit_code?: number;
  started_at?: string;
  finished_at?: string;
  duration_ms?: number;
  residue_found?: boolean;
  suggested_count?: number;
  orphan_count?: number;
  duplicate_count?: number;
};

type ReportRow = {
  id: string;
  triggered_by_email: string | null;
  environment: string;
  result: "PASS" | "FAIL" | "RUNNING";
  exit_code: number;
  error_message: string | null;
  duration_ms: number | null;
  report: Record<string, unknown> & { summary?: Summary };
  created_at: string;
};

const CONFIRM_TOKEN = "I_UNDERSTAND_THIS_TOUCHES_PRODUCTION";

export default function HqGraphSmoke() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "pass" | "fail">("idle");
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("graph_smoke_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) toast.error(error.message);
    else setRows((data ?? []) as ReportRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const runSmoke = async () => {
    const sure = window.confirm(
      "Run the Knowledge Graph smoke test against THIS environment?\n\n" +
        "It inserts a throwaway media asset, waits for the suggested edge, " +
        "marks it verified, then deletes it in a finally block.\n\n" +
        "Click OK to proceed.",
    );
    if (!sure) return;

    setRunning(true);
    setStatus("running");
    setLastMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke("run-graph-smoke-test", {
        body: { confirm: CONFIRM_TOKEN, environment: window.location.hostname },
      });
      if (error) {
        setStatus("fail");
        setLastMessage(error.message);
        toast.error(`Smoke test failed: ${error.message}`);
      } else {
        const r = data as { result: string; exit_code: number; message?: string };
        if (r.result === "PASS") {
          setStatus("pass");
          setLastMessage("PASS — Knowledge Graph C.1b is production-ready.");
          toast.success("Smoke test PASSED");
        } else {
          setStatus("fail");
          setLastMessage(`FAIL [${r.exit_code}] ${r.message ?? "see report"}`);
          toast.error(`Smoke test FAILED: ${r.message ?? "see report"}`);
        }
      }
    } catch (e) {
      setStatus("fail");
      setLastMessage((e as Error).message);
      toast.error((e as Error).message);
    } finally {
      setRunning(false);
      load();
    }
  };

  const downloadJson = (row: ReportRow) => {
    const blob = new Blob([JSON.stringify(row.report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graph-smoke-${row.created_at}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJson = async (row: ReportRow) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(row.report, null, 2));
      toast.success("Report JSON copied");
    } catch (e) {
      toast.error(`Copy failed: ${(e as Error).message}`);
    }
  };

  const latest = rows[0];
  const latestSummary = latest?.report?.summary;


  if (authLoading) return null;
  if (!user || !isAdmin) {
    return (
      <Layout>
        <HqNav />
        <div className="max-w-3xl mx-auto px-6 py-16 text-foreground/70">
          Admin access required.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <HqNav />
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-2">
          <div className="text-[0.65rem] tracking-[0.45em] uppercase text-foreground/40">
            HQ · Diagnostics
          </div>
          <h1 className="font-serif text-3xl text-foreground">Graph Smoke Test</h1>
          <p className="text-sm text-foreground/60 max-w-2xl leading-relaxed">
            Runs the C.1b Knowledge Graph integrity check against this
            environment's database. Verifies seed state, Main Ridge coverage,
            and the suggestion→verify→cleanup pipeline. Browser-level UI sweep
            is covered by the local <code className="text-foreground/80">scripts/live-smoke-test</code> wrapper.
          </p>
        </header>

        <section className="border-y border-border/10 py-8 space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-amber-600/80">
            Warning · touches this environment's live data
          </div>
          <p className="text-sm text-foreground/70 max-w-2xl">
            A throwaway media asset is inserted and removed inside a
            <code className="text-foreground/80"> finally</code> block. No other
            production rows are written. The run aborts if cleanup leaves any
            residue (exit code 6).
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={runSmoke}
              disabled={running}
              className="text-sm tracking-[0.3em] uppercase text-foreground/90 underline underline-offset-8 disabled:opacity-40"
            >
              {running ? "Running…" : "Run Graph Smoke Test"}
            </button>
            {status !== "idle" && (
              <span
                className={
                  status === "pass"
                    ? "text-xs tracking-[0.3em] uppercase text-emerald-600"
                    : status === "fail"
                    ? "text-xs tracking-[0.3em] uppercase text-red-600"
                    : "text-xs tracking-[0.3em] uppercase text-foreground/50"
                }
              >
                {status}
              </span>
            )}
          </div>
          {lastMessage && (
            <pre className="text-xs text-foreground/70 whitespace-pre-wrap">{lastMessage}</pre>
          )}

          {latest && (
            <div className="mt-6 border border-border/10 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <span
                  className={
                    "text-[0.65rem] tracking-[0.35em] uppercase px-2 py-1 border " +
                    (latest.result === "PASS"
                      ? "text-emerald-600 border-emerald-600/40"
                      : latest.result === "FAIL"
                      ? "text-red-600 border-red-600/40"
                      : "text-foreground/40 border-foreground/20")
                  }
                >
                  {latest.result}
                </span>
                <span className="text-xs text-foreground/60">
                  Last run · exit code {latest.exit_code}
                </span>
              </div>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-xs text-foreground/70">
                <div>
                  <dt className="uppercase tracking-[0.25em] text-foreground/40">Started</dt>
                  <dd>{latestSummary?.started_at ? new Date(latestSummary.started_at).toLocaleString() : "—"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.25em] text-foreground/40">Finished</dt>
                  <dd>{latestSummary?.finished_at ? new Date(latestSummary.finished_at).toLocaleString() : "—"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.25em] text-foreground/40">Duration</dt>
                  <dd>{latest.duration_ms != null ? `${latest.duration_ms} ms` : "—"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.25em] text-foreground/40">Residue found</dt>
                  <dd className={latestSummary?.residue_found ? "text-red-600" : "text-emerald-600"}>
                    {latestSummary?.residue_found == null ? "—" : latestSummary.residue_found ? "true" : "false"}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.25em] text-foreground/40">Suggested (post-cleanup)</dt>
                  <dd>{latestSummary?.suggested_count ?? "—"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.25em] text-foreground/40">Orphans</dt>
                  <dd>{latestSummary?.orphan_count ?? "—"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.25em] text-foreground/40">Duplicates</dt>
                  <dd>{latestSummary?.duplicate_count ?? "—"}</dd>
                </div>
              </dl>
              {latest.error_message && (
                <div className="text-xs text-red-600">{latest.error_message}</div>
              )}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-foreground">Recent runs</h2>
            <button
              type="button"
              onClick={load}
              className="text-xs tracking-[0.3em] uppercase text-foreground/50 hover:text-foreground"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-sm text-foreground/50">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-foreground/50">No runs yet.</div>
          ) : (
            <ul className="divide-y divide-border/10">
              {rows.map((row) => (
                <li key={row.id} className="py-4 flex items-baseline gap-6">
                  <span
                    className={
                      row.result === "PASS"
                        ? "text-xs tracking-[0.3em] uppercase text-emerald-600 w-16"
                        : row.result === "FAIL"
                        ? "text-xs tracking-[0.3em] uppercase text-red-600 w-16"
                        : "text-xs tracking-[0.3em] uppercase text-foreground/40 w-16"
                    }
                  >
                    {row.result}
                  </span>
                  <span className="text-xs text-foreground/60 w-44">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                  <span className="text-xs text-foreground/50 flex-1 truncate">
                    {row.triggered_by_email ?? "—"} · {row.environment}
                    {row.duration_ms != null ? ` · ${row.duration_ms}ms` : ""}
                    {row.error_message ? ` · ${row.error_message}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadJson(row)}
                    className="text-xs tracking-[0.3em] uppercase text-foreground/60 hover:text-foreground"
                  >
                    JSON
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}
