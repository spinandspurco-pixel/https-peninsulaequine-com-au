import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Admin-only banner. Fetches the latest deploy summary via the public RPC
 * `get_latest_deploy_status` and shows a subtle chip on private surfaces.
 * When the latest run failed, the chip becomes prominent and links straight
 * to `/hq/publish-logs` (full build artifacts + per-step logs).
 *
 * Hidden for preview accounts and non-admins.
 */

type Row = {
  run_id: string;
  status: "pass" | "fail" | "skipped" | "info";
  failing_step: string | null;
  failing_phase: string | null;
  commit_short: string | null;
  finished_at: string;
};

const POLL_MS = 5 * 60 * 1000;

export function DeployStatusBanner() {
  const { isAdmin, isPreview } = useAuth();
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    if (!isAdmin || isPreview) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.rpc("get_latest_deploy_status");
      if (cancelled) return;
      setRow(((data as Row[] | null) ?? [])[0] ?? null);
    };
    void load();
    const t = setInterval(load, POLL_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, [isAdmin, isPreview]);

  if (!isAdmin || isPreview || !row) return null;

  const failed = row.status === "fail";
  return (
    <Link
      to={failed ? "/hq/publish-logs" : "/status"}
      className={cn(
        "flex items-center justify-center gap-3 border-b px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] transition-colors",
        failed
          ? "border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/15"
          : "border-border/40 bg-background/40 text-foreground/50 hover:text-foreground/80",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          failed ? "bg-red-400" : row.status === "pass" ? "bg-emerald-400" : "bg-amber-400",
        )}
      />
      <span>
        Deploy · {failed ? "failed" : row.status}
        {failed && row.failing_phase ? ` · phase: ${row.failing_phase}` : ""}
        {row.commit_short ? ` · ${row.commit_short}` : ""}
      </span>
      <span className="text-foreground/50 normal-case tracking-normal">
        {failed ? "view artifacts →" : "status →"}
      </span>
    </Link>
  );
}
