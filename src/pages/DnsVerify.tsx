import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const FUNCTION_URL =
  "https://aizkqajrzkvwuobisnzr.supabase.co/functions/v1/verify-google-dns";

const DEFAULT_DOMAIN = "peninsulaequine.systems";
const DEFAULT_TOKEN =
  "google-site-verification=iMvRcyyPNi6aHBd0py3awRWPqS6-Yh2hXIl9y4vkKDU";

const DOMAIN_RE =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$/;

function validateInputs(domain: string, token: string): string[] {
  const errors: string[] = [];
  const d = domain.trim().toLowerCase();
  const t = token.trim();

  if (!d) {
    errors.push("Domain is required.");
  } else if (d.length > 253) {
    errors.push("Domain is too long.");
  } else if (!DOMAIN_RE.test(d)) {
    errors.push(
      "Domain appears malformed. Use a valid hostname like peninsulaequine.systems.",
    );
  }

  if (!t) {
    errors.push("TXT token is required.");
  } else if (t.length < 10) {
    errors.push("TXT token is too short to be a valid verification string.");
  } else if (/\s/.test(t)) {
    errors.push("TXT token cannot contain spaces.");
  }

  return errors;
}

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

type Attempt = {
  at: string;
  ready: boolean;
  summary: string;
};

const POLL_INTERVAL_MS = 15_000;
const MAX_ATTEMPTS = 40; // ~10 minutes

export default function DnsVerify() {
  const [searchParams] = useSearchParams();
  const [domain, setDomain] = useState(
    searchParams.get("domain") || DEFAULT_DOMAIN,
  );
  const [token, setToken] = useState(
    searchParams.get("txt") || DEFAULT_TOKEN,
  );
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paramError, setParamError] = useState<string | null>(null);
  const stopRef = useRef(false);
  const autoStartedRef = useRef(false);

  const validationErrors = useMemo(
    () => validateInputs(domain, token),
    [domain, token],
  );
  const isValid = validationErrors.length === 0;

  const runCheck = useCallback(async (): Promise<CheckResult | null> => {
    setError(null);
    if (!isValid) {
      setError(validationErrors.join(" "));
      return null;
    }
    try {
      const url = `${FUNCTION_URL}?domain=${encodeURIComponent(
        domain,
      )}&token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { method: "GET" });
      const data = (await res.json()) as CheckResult;
      setResult(data);
      setAttempts((prev) => [
        {
          at: new Date().toLocaleTimeString(),
          ready: data.ready,
          summary: data.ready
            ? "Record found in authoritative zone"
            : `Not yet (${data.googleVerificationRecords.length} google TXT records found)`,
        },
        ...prev,
      ]);
      return data;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [domain, token, isValid, validationErrors]);

  const startPolling = useCallback(async () => {
    if (!isValid) {
      setError(validationErrors.join(" "));
      return;
    }
    stopRef.current = false;
    setPolling(true);
    setAttempts([]);
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      if (stopRef.current) break;
      const r = await runCheck();
      if (r?.ready) break;
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    setPolling(false);
  }, [runCheck, isValid, validationErrors]);

  const stopPolling = useCallback(() => {
    stopRef.current = true;
    setPolling(false);
  }, []);

  useEffect(() => {
    return () => {
      stopRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (autoStartedRef.current) return;
    const paramDomain = searchParams.get("domain");
    const paramTxt = searchParams.get("txt");
    if (paramDomain || paramTxt) {
      autoStartedRef.current = true;
      const errs = validateInputs(
        paramDomain || DEFAULT_DOMAIN,
        paramTxt || DEFAULT_TOKEN,
      );
      if (errs.length > 0) {
        setParamError(errs.join(" "));
        return;
      }
      startPolling();
    }
  }, [searchParams, startPolling]);

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-10">
        <header className="space-y-3">
          <p className="text-[0.625rem] uppercase tracking-[0.45em] text-foreground/50">
            Infrastructure / DNS
          </p>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight">
            Google Workspace verification
          </h1>
          <p className="text-sm text-foreground/60 leading-relaxed">
            One-click check that the required TXT record is live in the
            authoritative zone. Polls every 15 seconds until it reports ready.
          </p>
        </header>

        <section className="space-y-4 border-t border-foreground/10 pt-8">
          <label className="block space-y-1">
            <span className="text-[0.625rem] uppercase tracking-[0.35em] text-foreground/50">
              Domain
            </span>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={polling}
              className="w-full bg-transparent border-b border-foreground/20 py-2 text-sm focus:outline-none focus:border-foreground/60"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[0.625rem] uppercase tracking-[0.35em] text-foreground/50">
              Expected TXT value
            </span>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={polling}
              className="w-full bg-transparent border-b border-foreground/20 py-2 text-xs font-mono focus:outline-none focus:border-foreground/60"
            />
          </label>

          <div className="flex gap-6 pt-2 text-xs uppercase tracking-[0.3em]">
            {!polling ? (
              <button
                onClick={startPolling}
                className="text-foreground hover:opacity-60 transition-opacity"
              >
                → Verify now
              </button>
            ) : (
              <button
                onClick={stopPolling}
                className="text-foreground/60 hover:opacity-80 transition-opacity"
              >
                ■ Stop polling
              </button>
            )}
            <button
              onClick={runCheck}
              disabled={polling}
              className="text-foreground/60 hover:opacity-80 transition-opacity disabled:opacity-30"
            >
              ↻ Single check
            </button>
          </div>
        </section>

        {paramError && (
          <div className="border-l-2 border-amber-400/60 pl-4 text-sm text-amber-400">
            {paramError}
          </div>
        )}

        {error && (
          <div className="border-l-2 border-destructive/60 pl-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <section className="space-y-6 border-t border-foreground/10 pt-8">
            <div
              className={`text-3xl font-serif ${
                result.ready ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {result.ready ? "Ready" : "Not yet"}
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {result.recommendation}
            </p>

            <dl className="grid grid-cols-1 gap-4 text-xs">
              <div>
                <dt className="uppercase tracking-[0.3em] text-foreground/40">
                  DNS provider
                </dt>
                <dd className="mt-1 text-foreground/80">{result.dnsProvider}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.3em] text-foreground/40">
                  Nameservers
                </dt>
                <dd className="mt-1 text-foreground/80 font-mono">
                  {result.authoritativeNameservers.join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.3em] text-foreground/40">
                  Google TXT records found
                </dt>
                <dd className="mt-1 text-foreground/80 font-mono break-all">
                  {result.googleVerificationRecords.length
                    ? result.googleVerificationRecords.join("\n")
                    : "(none)"}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.3em] text-foreground/40">
                  Checked at
                </dt>
                <dd className="mt-1 text-foreground/60">
                  {new Date(result.checkedAt).toLocaleString()}
                </dd>
              </div>
            </dl>

            {result.ready && (
              <a
                href="https://admin.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs uppercase tracking-[0.3em] text-emerald-400 hover:opacity-80"
              >
                → Open Google Admin to click Verify
              </a>
            )}
          </section>
        )}

        {attempts.length > 0 && (
          <section className="space-y-3 border-t border-foreground/10 pt-8">
            <h2 className="text-[0.625rem] uppercase tracking-[0.45em] text-foreground/50">
              Poll history
            </h2>
            <ul className="space-y-2 text-xs text-foreground/70 font-mono">
              {attempts.map((a, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-foreground/40">{a.at}</span>
                  <span className={a.ready ? "text-emerald-400" : ""}>
                    {a.summary}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
