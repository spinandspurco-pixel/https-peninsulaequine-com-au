import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";
import { HqNav } from "@/components/hq/HqNav";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { recordResults } from "@/lib/deployHealth";

/**
 * HQ → Operations → Deploy Health
 *
 * Internal admin-only detector for stuck production deployments.
 * Strictly read-only: this panel CANNOT clear or force-promote a pinned
 * deployment. That is a Lovable platform action. The "Copy escalation
 * payload" action just prepares a support message for the admin.
 */

const TARGETS = [
  { label: "Custom domain", url: "https://peninsulaequine.systems" },
  { label: "Lovable published", url: "https://https-peninsulaequine-com-au.lovable.app" },
];

const LEGACY_MARKER = "eyJhbGci";
const MODERN_MARKER = "sb_publishable_";
const BUNDLE_RE = /\/assets\/(index-[A-Za-z0-9_-]+\.js)/;

type ProbeResult = {
  label: string;
  url: string;
  fetchedAt: string;
  ok: boolean;
  bundleFile: string | null;
  bundleUrl: string | null;
  hasLegacyKey: boolean | null;
  hasModernKey: boolean | null;
  bundleBytes: number | null;
  error: string | null;
};

// The bundle hash this very page was served from (browser-side ground truth
// for "what the visitor is actually running"). Useful when the admin is on
// the same domain — confirms whether their session is on the stale build.
function getCurrentPageBundle(): string | null {
  if (typeof document === "undefined") return null;
  const scripts = Array.from(document.getElementsByTagName("script"));
  for (const s of scripts) {
    const src = s.getAttribute("src") ?? "";
    const m = src.match(BUNDLE_RE);
    if (m) return m[1];
  }
  return null;
}

async function probe(label: string, url: string): Promise<ProbeResult> {
  const fetchedAt = new Date().toISOString();
  try {
    const htmlRes = await fetch(url, { cache: "no-store", mode: "cors" });
    if (!htmlRes.ok) {
      return {
        label, url, fetchedAt, ok: false,
        bundleFile: null, bundleUrl: null,
        hasLegacyKey: null, hasModernKey: null, bundleBytes: null,
        error: `HTTP ${htmlRes.status} on root document`,
      };
    }
    const html = await htmlRes.text();
    const match = html.match(BUNDLE_RE);
    if (!match) {
      return {
        label, url, fetchedAt, ok: false,
        bundleFile: null, bundleUrl: null,
        hasLegacyKey: null, hasModernKey: null, bundleBytes: null,
        error: "No /assets/index-*.js reference found in HTML",
      };
    }
    const bundleFile = match[1];
    const bundleUrl = new URL(`/assets/${bundleFile}`, url).toString();
    const jsRes = await fetch(bundleUrl, { cache: "no-store", mode: "cors" });
    if (!jsRes.ok) {
      return {
        label, url, fetchedAt, ok: false,
        bundleFile, bundleUrl,
        hasLegacyKey: null, hasModernKey: null, bundleBytes: null,
        error: `HTTP ${jsRes.status} fetching bundle`,
      };
    }
    const js = await jsRes.text();
    return {
      label, url, fetchedAt, ok: true,
      bundleFile, bundleUrl,
      hasLegacyKey: js.includes(LEGACY_MARKER),
      hasModernKey: js.includes(MODERN_MARKER),
      bundleBytes: js.length,
      error: null,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      label, url, fetchedAt, ok: false,
      bundleFile: null, bundleUrl: null,
      hasLegacyKey: null, hasModernKey: null, bundleBytes: null,
      error: msg,
    };
  }
}

function isStuck(r: ProbeResult): boolean {
  if (!r.ok) return false;
  // Stuck = legacy JWT still baked in, OR modern publishable key missing.
  return r.hasLegacyKey === true || r.hasModernKey === false;
}

export default function HqDeployHealth() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [running, setRunning] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const pageBundle = useMemo(getCurrentPageBundle, []);

  const run = useCallback(async () => {
    setRunning(true);
    try {
      const out = await Promise.all(TARGETS.map((t) => probe(t.label, t.url)));
      setResults(out);
      setLastCheckedAt(new Date().toISOString());
      recordResults(out);
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) run();
  }, [isAdmin, run]);

  const anyStuck = results.some(isStuck);

  const escalation = useMemo(() => {
    const lines: string[] = [];
    lines.push("Lovable Support — stuck production promotion");
    lines.push("");
    lines.push(`Project ID: ebeb5b18-7fa0-4d1b-b9a3-22ec57bd6cff`);
    lines.push(`Checked at: ${lastCheckedAt ?? "(not yet)"}`);
    lines.push(`Triggered by: ${user?.email ?? "(unknown admin)"}`);
    lines.push(`Page bundle (admin browser): ${pageBundle ?? "(unknown)"}`);
    lines.push("");
    lines.push("Observed bundle state:");
    for (const r of results) {
      lines.push(`- ${r.label} (${r.url})`);
      if (!r.ok) {
        lines.push(`    error: ${r.error}`);
        continue;
      }
      lines.push(`    bundle: ${r.bundleFile}`);
      lines.push(`    legacy eyJhbGci present: ${r.hasLegacyKey}`);
      lines.push(`    sb_publishable_ present: ${r.hasModernKey}`);
      lines.push(`    bytes: ${r.bundleBytes}`);
      lines.push(`    stuck: ${isStuck(r)}`);
    }
    lines.push("");
    lines.push("Required platform action:");
    lines.push("Clear stuck production promotion / pinned deployment and force-promote");
    lines.push("a fresh frontend deployment for the listed domains. Production API keys");
    lines.push("have already been rotated to sb_publishable_*; the live bundle has not");
    lines.push("advanced. Staff login fails with 401: Legacy API keys are disabled until");
    lines.push("the bundle is promoted. Do not rotate keys again.");
    return lines.join("\n");
  }, [results, lastCheckedAt, user?.email, pageBundle]);

  const copyEscalation = async () => {
    try {
      await navigator.clipboard.writeText(escalation);
      toast.success("Escalation payload copied");
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  };

  const supportSubject = "Stuck production promotion — force-promote required";
  const supportBody = useMemo(() => {
    const next = [
      "",
      "------",
      "Recommended next steps (platform side):",
      "1. Clear any pinned/stuck production deployment for this project.",
      "2. Force-promote the latest successful frontend build to:",
      "     - https://peninsulaequine.systems",
      "     - https://www.peninsulaequine.systems",
      "     - https://https-peninsulaequine-com-au.lovable.app",
      "3. Confirm the served bundle contains `sb_publishable_` and no legacy `eyJhbGci` key.",
      "4. Reply with the promoted deployment ID + timestamp so we can re-run Deploy Health.",
      "",
      "Do NOT rotate API keys again — already rotated to sb_publishable_*.",
    ].join("\n");
    return `${escalation}\n${next}`;
  }, [escalation]);

  const openSupportEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportBody);
    } catch {
      /* ignore */
    }
    const href =
      `mailto:support@lovable.dev` +
      `?subject=${encodeURIComponent(supportSubject)}` +
      `&body=${encodeURIComponent(supportBody)}`;
    window.location.href = href;
    toast.success("Opening email — payload also copied to clipboard");
  };

  const escalationJson = useMemo(() => {
    return JSON.stringify(
      {
        kind: "stuck_production_promotion",
        projectId: "ebeb5b18-7fa0-4d1b-b9a3-22ec57bd6cff",
        checkedAt: lastCheckedAt,
        triggeredBy: user?.email ?? null,
        adminPageBundle: pageBundle,
        targets: results.map((r) => ({
          label: r.label,
          url: r.url,
          fetchedAt: r.fetchedAt,
          ok: r.ok,
          bundleFile: r.bundleFile,
          bundleUrl: r.bundleUrl,
          bundleBytes: r.bundleBytes,
          hasLegacyKey: r.hasLegacyKey,
          hasModernKey: r.hasModernKey,
          stuck: isStuck(r),
          error: r.error,
        })),
        requiredPlatformAction:
          "Clear stuck production promotion / pinned deployment and force-promote a fresh frontend build. Do not rotate keys again.",
        recommendedNextSteps: [
          "Clear any pinned/stuck production deployment for this project.",
          "Force-promote the latest successful frontend build to peninsulaequine.systems, www.peninsulaequine.systems, https-peninsulaequine-com-au.lovable.app.",
          "Confirm served bundle contains sb_publishable_ and no legacy eyJhbGci key.",
          "Reply with promoted deployment ID + timestamp so Deploy Health can be re-run.",
        ],
      },
      null,
      2,
    );
  }, [results, lastCheckedAt, user?.email, pageBundle]);

  const copyEscalationJson = async () => {
    try {
      await navigator.clipboard.writeText(escalationJson);
      toast.success("Escalation payload copied as JSON");
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  };

  const downloadEscalationTxt = () => {
    try {
      const stamp = (lastCheckedAt ?? new Date().toISOString())
        .replace(/[:.]/g, "-");
      const filename = `deploy-health-escalation-${stamp}.txt`;
      const blob = new Blob([supportBody], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${filename}`);
    } catch {
      toast.error("Download failed");
    }
  };

  const copySupportEmail = async () => {
    const full =
      `To: support@lovable.dev\n` +
      `Subject: ${supportSubject}\n\n` +
      supportBody;
    try {
      await navigator.clipboard.writeText(full);
      toast.success("Support email copied (To, Subject, payload)");
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <HqNav />
        <HqBreadcrumbs />
        <div className="max-w-3xl mx-auto px-6 py-16 text-foreground/60">Loading…</div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Layout>
        <HqNav />
        <HqBreadcrumbs />
        <div className="max-w-3xl mx-auto px-6 py-16 text-foreground/70">
          Admin access required.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <HqNav />
      <HqBreadcrumbs />
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-2">
          <div className="text-[0.65rem] tracking-[0.45em] uppercase text-foreground/40">
            HQ · Operations · Diagnostics
          </div>
          <h1 className="font-serif text-3xl text-foreground">Deploy Health</h1>
          <p className="text-sm text-foreground/60 max-w-2xl leading-relaxed">
            Read-only detector for stuck production promotions. Compares the
            live JS bundle on each public domain against the expected modern
            publishable-key marker. This panel cannot clear or promote a
            deployment — that is a Lovable platform action.
          </p>
        </header>

        <section className="border-y border-border/10 py-6 flex items-center justify-between gap-6">
          <div className="text-xs text-foreground/60 space-y-1">
            <div>
              <span className="uppercase tracking-[0.3em] text-foreground/40">Last checked: </span>
              <span className="text-foreground/80">{lastCheckedAt ?? "—"}</span>
            </div>
            <div>
              <span className="uppercase tracking-[0.3em] text-foreground/40">Admin page bundle: </span>
              <code className="text-foreground/80">{pageBundle ?? "—"}</code>
            </div>
          </div>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="text-sm tracking-[0.3em] uppercase text-foreground/90 underline underline-offset-8 disabled:opacity-40"
            title="Immediately re-fetch bundle state, markers, and timestamps"
          >
            {running ? "Re-checking…" : "Re-run deploy health checks"}
          </button>
        </section>

        {anyStuck && (
          <section className="border border-amber-600/40 bg-amber-600/5 px-5 py-4 space-y-2">
            <div className="text-[0.65rem] tracking-[0.45em] uppercase text-amber-700">
              Platform action required
            </div>
            <p className="text-sm text-foreground/80 max-w-2xl leading-relaxed">
              At least one live domain is serving a stale bundle (legacy
              <code className="px-1">eyJhbGci</code> present, or
              <code className="px-1">sb_publishable_</code> missing).
              Production promotion is stuck. Copy the escalation payload and
              send to Lovable Support.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <button
                type="button"
                onClick={run}
                disabled={running}
                className="text-xs tracking-[0.3em] uppercase text-amber-700 underline underline-offset-8 disabled:opacity-40"
              >
                {running ? "Re-checking…" : "Re-run checks now"}
              </button>
              <button
                type="button"
                onClick={openSupportEmail}
                className="text-xs tracking-[0.3em] uppercase text-amber-700 underline underline-offset-8"
              >
                Contact Lovable Support →
              </button>
              <button
                type="button"
                onClick={copyEscalation}
                className="text-xs tracking-[0.3em] uppercase text-foreground/90 underline underline-offset-8"
              >
                Copy escalation payload
              </button>
              <button
                type="button"
                onClick={copySupportEmail}
                className="text-xs tracking-[0.3em] uppercase text-foreground/90 underline underline-offset-8"
              >
                Copy support email
              </button>
              <button
                type="button"
                onClick={copyEscalationJson}
                className="text-xs tracking-[0.3em] uppercase text-foreground/90 underline underline-offset-8"
              >
                Copy as JSON
              </button>
              <button
                type="button"
                onClick={downloadEscalationTxt}
                className="text-xs tracking-[0.3em] uppercase text-foreground/90 underline underline-offset-8"
              >
                Download .txt
              </button>
            </div>
          </section>
        )}

        <section className="space-y-6">
          {results.length === 0 && !running && (
            <div className="text-sm text-foreground/50">No probes yet.</div>
          )}
          {results.map((r) => {
            const stuck = isStuck(r);
            return (
              <article key={r.url} className="border border-border/10 p-5 space-y-3">
                <header className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[0.65rem] tracking-[0.45em] uppercase text-foreground/40">
                      {r.label}
                    </div>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-foreground/80 underline underline-offset-4"
                    >
                      {r.url}
                    </a>
                  </div>
                  <span
                    className={
                      "text-[0.6rem] tracking-[0.35em] uppercase px-2 py-1 border " +
                      (!r.ok
                        ? "text-foreground/50 border-border/20"
                        : stuck
                        ? "text-amber-700 border-amber-600/40"
                        : "text-emerald-700 border-emerald-600/40")
                    }
                  >
                    {!r.ok ? "Probe error" : stuck ? "Stale" : "Fresh"}
                  </span>
                </header>

                {r.error && (
                  <div className="text-xs text-red-600/80">{r.error}</div>
                )}

                <details className="group border-t border-border/10 pt-3 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between cursor-pointer list-none text-[0.65rem] tracking-[0.45em] uppercase text-foreground/50 hover:text-foreground/80">
                    <span>Marker check details</span>
                    <span className="text-foreground/40 group-open:rotate-90 transition-transform">›</span>
                  </summary>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs mt-4">
                    <dt className="uppercase tracking-[0.3em] text-foreground/40">Live bundle</dt>
                    <dd>
                      <code className="text-foreground/80">{r.bundleFile ?? "—"}</code>
                    </dd>

                    <dt className="uppercase tracking-[0.3em] text-foreground/40">Bundle bytes</dt>
                    <dd className="text-foreground/70">{r.bundleBytes ?? "—"}</dd>

                    <dt className="uppercase tracking-[0.3em] text-foreground/40">
                      Legacy marker <code>eyJhbGci</code>
                    </dt>
                    <dd
                      className={
                        r.hasLegacyKey === true
                          ? "text-amber-700"
                          : r.hasLegacyKey === false
                          ? "text-emerald-700"
                          : "text-foreground/50"
                      }
                    >
                      {r.hasLegacyKey === null ? "—" : r.hasLegacyKey ? "present (bad)" : "absent (good)"}
                    </dd>

                    <dt className="uppercase tracking-[0.3em] text-foreground/40">
                      Publishable marker <code>sb_publishable_</code>
                    </dt>
                    <dd
                      className={
                        r.hasModernKey === true
                          ? "text-emerald-700"
                          : r.hasModernKey === false
                          ? "text-amber-700"
                          : "text-foreground/50"
                      }
                    >
                      {r.hasModernKey === null ? "—" : r.hasModernKey ? "present (good)" : "absent (bad)"}
                    </dd>

                    <dt className="uppercase tracking-[0.3em] text-foreground/40">Bundle URL</dt>
                    <dd className="truncate">
                      {r.bundleUrl ? (
                        <a href={r.bundleUrl} target="_blank" rel="noreferrer" className="text-foreground/70 underline underline-offset-4">
                          {r.bundleUrl}
                        </a>
                      ) : "—"}
                    </dd>

                    <dt className="uppercase tracking-[0.3em] text-foreground/40">Fetched at</dt>
                    <dd className="text-foreground/70">{r.fetchedAt}</dd>

                    <dt className="uppercase tracking-[0.3em] text-foreground/40">Verdict</dt>
                    <dd
                      className={
                        !r.ok
                          ? "text-foreground/60"
                          : stuck
                          ? "text-amber-700"
                          : "text-emerald-700"
                      }
                    >
                      {!r.ok ? "Probe error" : stuck ? "Stale (platform action required)" : "Fresh (modern key present)"}
                    </dd>
                  </dl>
                </details>
              </article>
            );
          })}
        </section>

        <section className="border-t border-border/10 pt-6 space-y-3">
          <div className="text-[0.65rem] tracking-[0.45em] uppercase text-foreground/40">
            Escalation payload
          </div>
          <p className="text-xs text-foreground/60 max-w-2xl leading-relaxed">
            Prefilled for Lovable Support. Includes project ID, observed bundle
            hashes per domain, marker check results, and the timestamp of this
            check. This panel never attempts to clear or promote a deployment.
          </p>
          <pre className="text-[0.7rem] leading-relaxed text-foreground/75 whitespace-pre-wrap border border-border/10 p-4 bg-foreground/[0.015]">
{escalation}
          </pre>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <button
              type="button"
              onClick={openSupportEmail}
              className="text-xs tracking-[0.3em] uppercase text-foreground/90 underline underline-offset-8"
            >
              Contact Lovable Support →
            </button>
            <button
              type="button"
              onClick={copyEscalation}
              className="text-xs tracking-[0.3em] uppercase text-foreground/60 underline underline-offset-8"
            >
              Copy escalation payload
            </button>
            <button
              type="button"
              onClick={copySupportEmail}
              className="text-xs tracking-[0.3em] uppercase text-foreground/60 underline underline-offset-8"
            >
              Copy support email
            </button>
            <button
              type="button"
              onClick={copyEscalationJson}
              className="text-xs tracking-[0.3em] uppercase text-foreground/60 underline underline-offset-8"
            >
              Copy as JSON
            </button>
            <button
              type="button"
              onClick={downloadEscalationTxt}
              className="text-xs tracking-[0.3em] uppercase text-foreground/60 underline underline-offset-8"
            >
              Download .txt
            </button>
          </div>
          <p className="text-[0.65rem] text-foreground/40 leading-relaxed">
            Opens your mail client with support@lovable.dev pre-filled (subject,
            payload, and recommended next steps). The payload is also copied to
            your clipboard in case the mail client truncates.
          </p>
        </section>
      </div>
    </Layout>
  );
}
