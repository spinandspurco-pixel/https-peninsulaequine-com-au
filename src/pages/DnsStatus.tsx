import { useCallback, useEffect, useRef, useState } from "react";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";
import { useSearchParams, Link } from "react-router-dom";

const FUNCTION_URL =
  "https://aizkqajrzkvwuobisnzr.supabase.co/functions/v1/verify-google-dns";

const DEFAULT_DOMAIN = "peninsulaequine.systems";
const DEFAULT_TOKEN =
  "google-site-verification=iMvRcyyPNi6aHBd0py3awRWPqS6-Yh2hXIl9y4vkKDU";

const POLL_INTERVAL_S = 30;

type CheckResult = {
  ready: boolean;
  domain: string;
  expected: string;
  found: boolean;
  authoritativeNameservers: string[];
  dnsProvider: string;
  txtRecords: string[];
  googleVerificationRecords: string[];
  recommendation: string;
  checkedAt: string;
};

/**
 * Read-only DNS verification status page.
 * Polls verify-google-dns every 30s and displays a live countdown to the next check.
 */
export default function DnsStatus() {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get("domain") || DEFAULT_DOMAIN;
  const token = searchParams.get("txt") || DEFAULT_TOKEN;

  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(POLL_INTERVAL_S);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const mounted = useRef(true);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${FUNCTION_URL}?domain=${encodeURIComponent(
        domain,
      )}&token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { method: "GET" });
      const data = (await res.json()) as CheckResult;
      if (!mounted.current) return;
      setResult(data);
    } catch (e) {
      if (!mounted.current) return;
      setError((e as Error).message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [domain, token]);

  // Initial fetch + lifecycle
  useEffect(() => {
    mounted.current = true;
    runCheck();
    return () => {
      mounted.current = false;
    };
  }, [runCheck]);

  // Countdown + auto re-poll
  useEffect(() => {
    if (!autoRefresh) return;
    setCountdown(POLL_INTERVAL_S);
    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          runCheck();
          return POLL_INTERVAL_S;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, runCheck, result?.checkedAt]);

  const status = result?.ready ? "ready" : result ? "pending" : loading ? "checking" : "idle";

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <HqBreadcrumbs current="DNS Status" />
      <div className="mx-auto max-w-2xl space-y-12">
        <header className="space-y-3">
          <p className="text-[0.625rem] uppercase tracking-[0.45em] text-foreground/50">
            Infrastructure / DNS Status
          </p>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight">
            {domain}
          </h1>
          <p className="text-sm text-foreground/60 leading-relaxed">
            Live check of the Google Workspace verification TXT record.
          </p>
        </header>

        {/* Status block */}
        <section className="space-y-6 border-t border-foreground/10 pt-10">
          <div className="flex items-baseline gap-4">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                status === "ready"
                  ? "bg-emerald-400"
                  : status === "pending"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-foreground/30 animate-pulse"
              }`}
              aria-hidden
            />
            <h2
              className={`font-serif text-3xl ${
                status === "ready"
                  ? "text-emerald-400"
                  : status === "pending"
                    ? "text-amber-400"
                    : "text-foreground/70"
              }`}
            >
              {status === "ready"
                ? "Verified"
                : status === "pending"
                  ? "Awaiting DNS"
                  : "Checking…"}
            </h2>
          </div>

          {result && (
            <p className="text-sm text-foreground/70 leading-relaxed">
              {result.recommendation}
            </p>
          )}

          {error && (
            <p className="border-l-2 border-destructive/60 pl-4 text-sm text-destructive">
              {error}
            </p>
          )}
        </section>

        {/* Countdown */}
        <section className="space-y-4 border-t border-foreground/10 pt-10">
          <div className="flex items-baseline justify-between">
            <p className="text-[0.625rem] uppercase tracking-[0.45em] text-foreground/50">
              Next re-check
            </p>
            <button
              type="button"
              onClick={() => setAutoRefresh((v) => !v)}
              className="text-[0.625rem] uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground/70 transition-colors"
            >
              {autoRefresh ? "■ Pause" : "▶ Resume"}
            </button>
          </div>

          <div className="flex items-baseline gap-6">
            <span className="font-serif text-6xl tabular-nums text-foreground/90">
              {autoRefresh ? `${countdown}s` : "—"}
            </span>
            <button
              type="button"
              onClick={runCheck}
              disabled={loading}
              className="text-xs uppercase tracking-[0.3em] text-foreground/60 hover:text-foreground transition-opacity disabled:opacity-30"
            >
              ↻ Check now
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-px bg-foreground/10 overflow-hidden">
            <div
              className="h-px bg-foreground/40 transition-[width] duration-1000 ease-linear"
              style={{
                width: autoRefresh
                  ? `${((POLL_INTERVAL_S - countdown) / POLL_INTERVAL_S) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </section>

        {/* Diagnostics */}
        {result && (
          <section className="space-y-6 border-t border-foreground/10 pt-10">
            <p className="text-[0.625rem] uppercase tracking-[0.45em] text-foreground/50">
              Diagnostics
            </p>
            <dl className="grid grid-cols-1 gap-5 text-xs">
              <div>
                <dt className="uppercase tracking-[0.3em] text-foreground/40">
                  DNS provider
                </dt>
                <dd className="mt-1.5 text-foreground/80">{result.dnsProvider}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.3em] text-foreground/40">
                  Authoritative nameservers
                </dt>
                <dd className="mt-1.5 text-foreground/80 font-mono">
                  {result.authoritativeNameservers.join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.3em] text-foreground/40">
                  Expected TXT
                </dt>
                <dd className="mt-1.5 text-foreground/80 font-mono break-all">
                  {result.expected}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.3em] text-foreground/40">
                  Google TXT records found
                </dt>
                <dd className="mt-1.5 text-foreground/80 font-mono break-all whitespace-pre-line">
                  {result.googleVerificationRecords.length
                    ? result.googleVerificationRecords.join("\n")
                    : "(none)"}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.3em] text-foreground/40">
                  Last checked
                </dt>
                <dd className="mt-1.5 text-foreground/60">
                  {new Date(result.checkedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </section>
        )}

        <footer className="border-t border-foreground/10 pt-8 flex gap-6 text-[0.625rem] uppercase tracking-[0.3em] text-foreground/40">
          <Link
            to={`/hq/dns-verify?domain=${encodeURIComponent(domain)}&txt=${encodeURIComponent(token)}`}
            className="hover:text-foreground/70 transition-colors"
          >
            → Edit verification
          </Link>
          {result?.ready && (
            <a
              href="https://admin.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:opacity-80 transition-opacity"
            >
              → Open Google Admin
            </a>
          )}
        </footer>
      </div>
    </main>
  );
}
