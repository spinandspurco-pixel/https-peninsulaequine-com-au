import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/lib/usePageMeta";
import { cn } from "@/lib/utils";

type DeployStatus = {
  run_id: string;
  status: "pass" | "fail" | "skipped" | "info";
  failing_step: string | null;
  failing_phase: string | null;
  failing_hint: string | null;
  commit_short: string | null;
  branch: string | null;
  finished_at: string;
  duration_ms: number | null;
};

const LABEL: Record<DeployStatus["status"], string> = {
  pass: "Operational",
  fail: "Degraded",
  skipped: "Idle",
  info: "Unknown",
};

const DOT: Record<DeployStatus["status"], string> = {
  pass: "bg-emerald-400",
  fail: "bg-red-400",
  skipped: "bg-foreground/40",
  info: "bg-amber-400",
};

export default function Status() {
  usePageMeta({
    title: "System status — Peninsula Equine",
    description: "Live deployment status for peninsulaequine.systems.",
  });
  const [data, setData] = useState<DeployStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("get_latest_deploy_status");
      if (cancelled) return;
      if (error) setError(error.message);
      else setData(((data as DeployStatus[] | null) ?? [])[0] ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-6 py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/50">
          Peninsula Equine · System status
        </p>
        <h1 className="mt-4 font-serif text-4xl">Status</h1>

        <div className="mt-10 rounded border border-border/50 bg-background/40 p-6">
          {loading && <p className="text-sm text-foreground/60">Checking…</p>}
          {error && (
            <p className="text-sm text-red-300">Could not reach status service.</p>
          )}
          {!loading && !error && !data && (
            <p className="text-sm text-foreground/60">No deployments recorded yet.</p>
          )}
          {data && (
            <>
              <div className="flex items-center gap-3">
                <span className={cn("h-2.5 w-2.5 rounded-full", DOT[data.status])} />
                <span className="font-serif text-2xl">{LABEL[data.status]}</span>
              </div>
              <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm text-foreground/70">
                <dt className="text-foreground/50">Last deploy</dt>
                <dd>{new Date(data.finished_at).toLocaleString()}</dd>
                {data.branch && (<><dt className="text-foreground/50">Branch</dt><dd className="font-mono text-xs">{data.branch}</dd></>)}
                {data.commit_short && (<><dt className="text-foreground/50">Commit</dt><dd className="font-mono text-xs">{data.commit_short}</dd></>)}
                {data.status === "fail" && data.failing_step && (
                  <>
                    <dt className="text-foreground/50">Failing step</dt>
                    <dd className="font-mono text-xs">{data.failing_step}</dd>
                  </>
                )}
                {data.status === "fail" && data.failing_phase && (
                  <>
                    <dt className="text-foreground/50">Phase</dt>
                    <dd className="font-mono text-xs text-amber-300">{data.failing_phase}</dd>
                  </>
                )}
              </dl>
              {data.status === "fail" && data.failing_hint && (
                <p className="mt-4 font-mono text-[11px] text-foreground/60">
                  ↳ {data.failing_hint}
                </p>
              )}
            </>
          )}
        </div>

        <p className="mt-8 text-xs text-foreground/50">
          For incident history and full build artifacts, staff can visit{" "}
          <Link to="/hq/publish-logs" className="underline underline-offset-4">/hq/publish-logs</Link>.
        </p>
      </div>
    </Layout>
  );
}
