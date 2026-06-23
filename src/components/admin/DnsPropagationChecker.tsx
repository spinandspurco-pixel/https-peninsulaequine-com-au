import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X, Loader2, Radar, CircleStop, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Resolvers — DoH endpoints with permissive CORS so the browser can query them.
// ---------------------------------------------------------------------------
const RESOLVERS = [
  {
    id: "google",
    label: "Google 8.8.8.8",
    url: (name: string, type: string) =>
      `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
    headers: {} as Record<string, string>,
  },
  {
    id: "cloudflare",
    label: "Cloudflare 1.1.1.1",
    url: (name: string, type: string) =>
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    headers: { accept: "application/dns-json" } as Record<string, string>,
  },
] as const;

// ---------------------------------------------------------------------------
// Records we expect Resend to publish on peninsulaequine.systems
// `match` returns true when the resolver's `data` value satisfies the record.
// ---------------------------------------------------------------------------
const RECORDS = [
  {
    id: "dkim",
    label: "DKIM",
    host: "resend._domainkey.peninsulaequine.systems",
    type: "TXT",
    expected:
      "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC28qaXHsfOfs9r8fZdafVBUgm2Vo38CFO0LLthuiA4aQ0dOsjyoZs/dklsreyPAFJpw1AXpBHh0fxDTbH3sZYtuLRMZN5Yr8UL0jlkLjVBApUpUvYpjAIyIIQoHTek0rekqSIOyWnuUasRstNKoD/+Ip040tPSQ4x+zGbFxJ0ZowIDAQAB",
    expectedHint: "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC28qaXHsfOfs9r8fZdafVBUgm2Vo38C…",
    match: (data: string) => /p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC28qaXHsfOfs9r8fZdafVBUgm2Vo38C/.test(data),
  },
  {
    id: "mx",
    label: "MX",
    host: "send.peninsulaequine.systems",
    type: "MX",
    expected: "10 feedback-smtp.eu-west-1.amazonses.com.",
    expectedHint: "10 feedback-smtp.eu-west-1.amazonses.com.",
    match: (data: string) => /feedback-smtp\.eu-west-1\.amazonses\.com/i.test(data),
  },
  {
    id: "spf",
    label: "SPF",
    host: "send.peninsulaequine.systems",
    type: "TXT",
    expected: "v=spf1 include:amazonses.com ~all",
    expectedHint: "v=spf1 include:amazonses.com ~all",
    match: (data: string) => /v=spf1[^"]*include:amazonses\.com/i.test(data),
  },
] as const;

type CellState = "idle" | "checking" | "pass" | "fail" | "error";
interface Cell {
  state: CellState;
  data?: string[];     // raw answer strings
  message?: string;    // error text or note
  at?: number;         // last update timestamp
}

type Grid = Record<string, Record<string, Cell>>; // grid[recordId][resolverId]

const emptyGrid = (): Grid => {
  const g: Grid = {};
  for (const r of RECORDS) {
    g[r.id] = {};
    for (const res of RESOLVERS) g[r.id][res.id] = { state: "idle" };
  }
  return g;
};

const POLL_MS = 15_000;
const POLL_TIMEOUT_MS = 30 * 60_000;

async function queryDoh(resolver: typeof RESOLVERS[number], host: string, type: string) {
  try {
    const res = await fetch(resolver.url(host, type), { headers: resolver.headers });
    if (!res.ok) return { ok: false as const, message: `HTTP ${res.status}` };
    const json: any = await res.json();
    // Status 0 = NOERROR, 3 = NXDOMAIN
    const answers: string[] = (json?.Answer ?? []).map((a: any) => String(a.data));
    return { ok: true as const, status: json?.Status as number, answers };
  } catch (e: any) {
    return { ok: false as const, message: e?.message ?? "network error" };
  }
}

export default function DnsPropagationChecker() {
  const { toast } = useToast();
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const [polling, setPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const allPass = RECORDS.every((rec) =>
    RESOLVERS.every((res) => grid[rec.id][res.id].state === "pass"),
  );

  const runOnce = useCallback(async () => {
    // mark all cells checking
    setGrid((g) => {
      const next: Grid = JSON.parse(JSON.stringify(g));
      for (const rec of RECORDS) for (const res of RESOLVERS) next[rec.id][res.id].state = "checking";
      return next;
    });

    const jobs = RECORDS.flatMap((rec) =>
      RESOLVERS.map(async (res) => {
        const out = await queryDoh(res, rec.host, rec.type);
        let cell: Cell;
        if (!out.ok) {
          cell = { state: "error", message: out.message, at: Date.now() };
        } else if (out.status === 3) {
          cell = { state: "fail", message: "NXDOMAIN", at: Date.now() };
        } else if (!out.answers.length) {
          cell = { state: "fail", message: "no answer", at: Date.now() };
        } else {
          const matched = out.answers.some((d) => rec.match(d));
          cell = {
            state: matched ? "pass" : "fail",
            data: out.answers,
            message: matched ? undefined : "value mismatch",
            at: Date.now(),
          };
        }
        return { recId: rec.id, resId: res.id, cell };
      }),
    );

    const results = await Promise.all(jobs);
    setGrid((g) => {
      const next: Grid = JSON.parse(JSON.stringify(g));
      for (const { recId, resId, cell } of results) next[recId][resId] = cell;
      return next;
    });
    return results.every((r) => r.cell.state === "pass");
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    setPolling(false);
    setNextAt(null);
  }, []);

  const scheduleNext = useCallback((attempt: number) => {
    const at = Date.now() + POLL_MS;
    setNextAt(at);
    timerRef.current = window.setTimeout(async () => {
      if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
        stop();
        toast({ title: "Propagation poll timed out", description: "Stopped after 30 min.", variant: "destructive" });
        return;
      }
      setAttempts(attempt + 1);
      const done = await runOnce();
      if (done) {
        stop();
        toast({ title: "All resolvers green ✓", description: "DKIM, MX, and SPF resolved everywhere." });
        return;
      }
      scheduleNext(attempt + 1);
    }, POLL_MS);
  }, [runOnce, stop, toast]);

  const start = useCallback(async () => {
    if (polling) return;
    setPolling(true);
    setAttempts(1);
    startedAtRef.current = Date.now();
    const done = await runOnce();
    if (done) {
      stop();
      toast({ title: "All resolvers green ✓", description: "Records already fully propagated." });
      return;
    }
    toast({ title: "DNS propagation poll started", description: `Re-checking every ${POLL_MS / 1000}s for up to 30 min.` });
    scheduleNext(1);
  }, [polling, runOnce, scheduleNext, stop, toast]);

  // tick for countdown
  useEffect(() => {
    if (!polling) return;
    tickRef.current = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [polling]);

  // cleanup
  useEffect(() => () => stop(), [stop]);

  const cellClass = (s: CellState) => {
    switch (s) {
      case "pass": return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "fail": return "bg-red-500/10 text-red-300 border-red-500/30";
      case "error": return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "checking": return "bg-muted/30 text-muted-foreground border-border animate-pulse";
      default: return "bg-muted/20 text-muted-foreground/60 border-border";
    }
  };

  const cellIcon = (s: CellState) => {
    if (s === "pass") return <Check className="h-3 w-3" />;
    if (s === "fail") return <X className="h-3 w-3" />;
    if (s === "checking") return <Loader2 className="h-3 w-3 animate-spin" />;
    if (s === "error") return <X className="h-3 w-3" />;
    return <span className="text-[0.65rem]">—</span>;
  };

  return (
    <section className="border border-border/40 p-6 md:p-8 mb-12">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground/60">Live · DNS propagation</p>
          <h2 className="font-serif text-2xl tracking-tight mt-2">Resolver Propagation Check</h2>
          <p className="mt-2 text-sm font-light text-muted-foreground/70">
            Polls public resolvers directly for DKIM, MX, and SPF until each returns the expected value.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={runOnce} disabled={polling}>
            <RotateCw className="h-3 w-3 mr-2" />
            Check once
          </Button>
          {polling ? (
            <Button size="sm" variant="outline" onClick={stop}>
              <CircleStop className="h-3 w-3 mr-2 text-red-400" />
              Stop poll
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={start} disabled={allPass}>
              <Radar className="h-3 w-3 mr-2" />
              {allPass ? "All green" : "Auto-poll until propagated"}
            </Button>
          )}
        </div>
      </div>

      {polling && (
        <div className="mt-6 border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs flex items-center gap-3 flex-wrap">
          <Radar className="h-3 w-3 text-amber-300 animate-pulse" />
          <span className="uppercase tracking-[0.3em] text-[0.6rem] text-amber-300">Polling</span>
          <span className="font-mono text-muted-foreground/80">attempt {attempts}</span>
          {nextAt && (
            <span className="font-mono text-muted-foreground/60">
              next in {Math.max(0, Math.ceil((nextAt - Date.now()) / 1000))}s
            </span>
          )}
        </div>
      )}

      <div className="mt-6 overflow-x-auto border border-border/30">
        <table className="w-full text-xs">
          <thead className="bg-muted/20 text-muted-foreground/70 uppercase tracking-[0.2em] text-[0.6rem]">
            <tr>
              <th className="text-left px-3 py-2 font-light">Record</th>
              <th className="text-left px-3 py-2 font-light">Host</th>
              {RESOLVERS.map((r) => (
                <th key={r.id} className="text-left px-3 py-2 font-light whitespace-nowrap">{r.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {RECORDS.map((rec) => (
              <tr key={rec.id} className="align-top">
                <td className="px-3 py-3">
                  <div className="font-mono text-foreground">{rec.label}</div>
                  <div className="text-[0.6rem] text-muted-foreground/60 mt-1">{rec.type}</div>
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground/80 max-w-[18rem]">
                  <div className="truncate">{rec.host}</div>
                  <div className="text-[0.6rem] text-muted-foreground/50 mt-1 truncate" title={rec.expectedHint}>
                    expects: {rec.expectedHint}
                  </div>
                </td>
                {RESOLVERS.map((res) => {
                  const cell = grid[rec.id][res.id];
                  return (
                    <td key={res.id} className="px-3 py-3">
                      <div className={`inline-flex items-center gap-2 border px-2 py-1 ${cellClass(cell.state)}`}>
                        {cellIcon(cell.state)}
                        <span className="font-mono uppercase tracking-[0.2em] text-[0.6rem]">
                          {cell.state === "idle" ? "—" : cell.state}
                        </span>
                      </div>
                      {cell.message && (
                        <div className="mt-1 text-[0.6rem] text-muted-foreground/60">{cell.message}</div>
                      )}
                      {cell.data && cell.data.length > 0 && cell.state !== "pass" && (
                        <div className="mt-1 text-[0.6rem] font-mono text-muted-foreground/50 max-w-[16rem] truncate" title={cell.data.join(" | ")}>
                          got: {cell.data[0]}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[0.65rem] text-muted-foreground/50 leading-relaxed">
        Queries run from your browser via DNS-over-HTTPS — no edge function involved. A green row means that resolver has
        cached the published record. Resend uses its own resolvers, so both columns going green is a strong signal that
        verification will pass on the next attempt.
      </p>
    </section>
  );
}
