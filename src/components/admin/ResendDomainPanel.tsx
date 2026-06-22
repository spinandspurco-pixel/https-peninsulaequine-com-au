import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X, Minus, RotateCw, ShieldCheck, MailCheck, Loader2, Radar, CircleStop } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const POLL_INTERVAL_MS = 30_000; // 30s between Resend verify calls
const POLL_TIMEOUT_MS = 30 * 60 * 1000; // give up after 30 min
const POLL_MAX_ATTEMPTS = Math.floor(POLL_TIMEOUT_MS / POLL_INTERVAL_MS);


interface ResendRecord {
  record: string;
  name: string;
  type: string;
  value: string;
  status?: string;
  priority?: number;
  ttl?: string | number;
}
interface ResendDomain {
  id: string;
  name: string;
  status: string;
  region?: string;
  records?: ResendRecord[];
}
interface StatusResponse {
  configured: boolean;
  domain?: ResendDomain;
  message?: string;
}

const statusBadge = (status?: string) => {
  const s = (status ?? "").toLowerCase();
  if (s === "verified") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (s === "failed" || s === "failure") return "bg-red-500/15 text-red-300 border-red-500/30";
  if (s === "pending" || s === "not_started") return "bg-amber-500/10 text-amber-300 border-amber-500/30";
  return "bg-muted/40 text-muted-foreground border-border";
};

const recordIcon = (status?: string) => {
  const s = (status ?? "").toLowerCase();
  if (s === "verified") return <Check className="h-3 w-3 text-emerald-400" />;
  if (s === "failed") return <X className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

export default function ResendDomainPanel() {
  const { toast } = useToast();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; latency?: number; detail?: string } | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  // Auto-poll state
  const [polling, setPolling] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [nextPollAt, setNextPollAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const pollTimerRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);

  const invoke = async (action: "status" | "verify" | "test-inquiry") => {
    const { data, error } = await supabase.functions.invoke("resend-domain-status", {
      body: { action },
    });
    if (error) throw new Error(error.message ?? "Edge function failed");
    return data;
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await invoke("status");
      setStatus(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (e: any) {
      toast({ title: "Status check failed", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  const triggerVerify = useCallback(async (opts?: { silent?: boolean }) => {
    setVerifying(true);
    try {
      const data = await invoke("verify");
      setStatus({ configured: true, domain: data.domain });
      setLastChecked(new Date().toLocaleTimeString());
      if (!opts?.silent) {
        toast({
          title: "Verification re-checked",
          description: `Resend status: ${data.domain?.status ?? "unknown"}`,
        });
      }
      return data.domain?.status as string | undefined;
    } catch (e: any) {
      if (!opts?.silent) {
        toast({ title: "Verify failed", description: e?.message, variant: "destructive" });
      }
      throw e;
    } finally {
      setVerifying(false);
    }
  }, [toast]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) { window.clearTimeout(pollTimerRef.current); pollTimerRef.current = null; }
    if (tickTimerRef.current) { window.clearInterval(tickTimerRef.current); tickTimerRef.current = null; }
    setPolling(false);
    setNextPollAt(null);
  }, []);

  const scheduleNext = useCallback((attempt: number) => {
    const at = Date.now() + POLL_INTERVAL_MS;
    setNextPollAt(at);
    pollTimerRef.current = window.setTimeout(async () => {
      if (attempt >= POLL_MAX_ATTEMPTS) {
        stopPolling();
        toast({ title: "Polling timed out", description: `No verification after ${POLL_MAX_ATTEMPTS} attempts.`, variant: "destructive" });
        return;
      }
      setPollAttempts(attempt + 1);
      try {
        const next = (await triggerVerify({ silent: true }))?.toLowerCase();
        if (next === "verified") {
          stopPolling();
          toast({ title: "Domain verified ✓", description: "Resend now accepts sends from peninsulaequine.systems." });
          return;
        }
        if (next === "failed" || next === "failure") {
          stopPolling();
          toast({ title: "Verification failed", description: "Resend reports failure — check DNS records.", variant: "destructive" });
          return;
        }
      } catch {
        // transient error: keep polling
      }
      scheduleNext(attempt + 1);
    }, POLL_INTERVAL_MS);
  }, [stopPolling, toast, triggerVerify]);

  const startPolling = useCallback(async () => {
    if (polling) return;
    setPolling(true);
    setPollAttempts(1);
    try {
      const initial = (await triggerVerify({ silent: true }))?.toLowerCase();
      if (initial === "verified") {
        stopPolling();
        toast({ title: "Domain verified ✓", description: "Already passing — no polling needed." });
        return;
      }
    } catch {
      // continue into the loop anyway
    }
    toast({ title: "Auto-poll started", description: `Re-checking every ${POLL_INTERVAL_MS / 1000}s for up to ${POLL_TIMEOUT_MS / 60_000} min.` });
    scheduleNext(1);
  }, [polling, scheduleNext, stopPolling, toast, triggerVerify]);

  // Tick for countdown display
  useEffect(() => {
    if (!polling) return;
    tickTimerRef.current = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => { if (tickTimerRef.current) window.clearInterval(tickTimerRef.current); };
  }, [polling]);

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);


  const retestInquiry = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const data = await invoke("test-inquiry");
      const res = data?.result ?? {};
      const notification = res?.data?.notification;
      const gmail = res?.data?.gmail;
      const ok = data?.ok && !notification?.error;
      const detail = notification?.error
        ? `Resend: ${notification.error.message ?? "error"}`
        : `Resend ✓ · Gmail ${gmail?.ok ? "✓" : "—"}`;
      setTestResult({ ok, latency: data?.latency, detail });
      toast({
        title: ok ? "Inquiry test sent" : "Inquiry test had errors",
        description: detail,
        variant: ok ? "default" : "destructive",
      });
    } catch (e: any) {
      setTestResult({ ok: false, detail: e?.message });
      toast({ title: "Re-test failed", description: e?.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const d = status?.domain;

  return (
    <section className="border border-border/40 p-6 md:p-8 mb-12">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground/60">
            Live · Resend
          </p>
          <h2 className="font-serif text-2xl tracking-tight mt-2">Domain Verification</h2>
          <p className="mt-2 text-sm font-light text-muted-foreground/70">
            Polls Resend for <span className="font-mono">peninsulaequine.systems</span> DNS state.
            Re-trigger verification or send a fresh inquiry-form test.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <RotateCw className="h-3 w-3 mr-2" />}
            Refresh status
          </Button>
          <Button size="sm" variant="outline" onClick={() => triggerVerify()} disabled={verifying || !status?.configured}>
            {verifying ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <ShieldCheck className="h-3 w-3 mr-2" />}
            Re-verify with Resend
          </Button>
          {polling ? (
            <Button size="sm" variant="outline" onClick={stopPolling}>
              <CircleStop className="h-3 w-3 mr-2 text-red-400" />
              Stop auto-poll
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={startPolling} disabled={!status?.configured}>
              <Radar className="h-3 w-3 mr-2" />
              Auto-poll until verified
            </Button>
          )}
          <Button size="sm" onClick={retestInquiry} disabled={testing}>
            {testing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <MailCheck className="h-3 w-3 mr-2" />}
            Re-test inquiry email
          </Button>

        </div>
      </div>

      {polling && (
        <div className="mt-6 border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs flex items-center gap-3 flex-wrap">
          <Radar className="h-3 w-3 text-amber-300 animate-pulse" />
          <span className="uppercase tracking-[0.3em] text-[0.6rem] text-amber-300">Auto-poll</span>
          <span className="font-mono text-muted-foreground/80">
            attempt {pollAttempts}/{POLL_MAX_ATTEMPTS}
          </span>
          {nextPollAt && (
            <span className="font-mono text-muted-foreground/60">
              next check in {Math.max(0, Math.ceil((nextPollAt - Date.now()) / 1000))}s
              {/* tick keeps countdown live */}
              <span className="hidden">{tick}</span>
            </span>
          )}
          {verifying && <span className="text-muted-foreground/60 italic">checking…</span>}
        </div>
      )}


      {!status && (
        <p className="mt-6 text-xs text-muted-foreground/60 italic">
          Click <span className="font-mono">Refresh status</span> to pull current state from Resend.
        </p>
      )}

      {status && !status.configured && (
        <p className="mt-6 text-sm text-amber-300/80">
          {status.message ?? "Domain not registered in Resend."}
        </p>
      )}

      {status?.configured && d && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="outline" className={`uppercase tracking-[0.2em] text-[0.6rem] ${statusBadge(d.status)}`}>
              {d.status}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground/70">
              {d.name} · {d.region ?? "—"} · id {d.id.slice(0, 8)}…
            </span>
            {lastChecked && (
              <span className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground/50 ml-auto">
                Checked {lastChecked}
              </span>
            )}
          </div>

          {d.records && d.records.length > 0 && (
            <div className="border border-border/30">
              <table className="w-full text-xs">
                <thead className="bg-muted/20 text-muted-foreground/70 uppercase tracking-[0.2em] text-[0.6rem]">
                  <tr>
                    <th className="text-left px-3 py-2 font-light">Status</th>
                    <th className="text-left px-3 py-2 font-light">Type</th>
                    <th className="text-left px-3 py-2 font-light">Host</th>
                    <th className="text-left px-3 py-2 font-light">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {d.records.map((r, i) => (
                    <tr key={i} className="align-top">
                      <td className="px-3 py-2">{recordIcon(r.status)}</td>
                      <td className="px-3 py-2 font-mono">{r.type}{r.priority ? ` (${r.priority})` : ""}</td>
                      <td className="px-3 py-2 font-mono break-all">{r.name}</td>
                      <td className="px-3 py-2 font-mono break-all text-muted-foreground/80">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {testResult && (
        <div className={`mt-6 border px-4 py-3 text-xs ${
          testResult.ok ? "border-emerald-500/30 text-emerald-300" : "border-red-500/30 text-red-300"
        }`}>
          <span className="uppercase tracking-[0.3em] text-[0.6rem] mr-3">
            {testResult.ok ? "Sent" : "Failed"}
          </span>
          <span className="font-mono">{testResult.detail}</span>
          {testResult.latency != null && (
            <span className="ml-3 text-muted-foreground/60">· {testResult.latency}ms</span>
          )}
        </div>
      )}
    </section>
  );
}
