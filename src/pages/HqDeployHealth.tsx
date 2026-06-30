import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";
import { HqNav } from "@/components/hq/HqNav";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { recordResults } from "@/lib/deployHealth";
import { logDeployHealthAudit, type DeployHealthAuditAction } from "@/lib/deployHealthAudit";
import { supabase } from "@/integrations/supabase/client";
import {
  auditRowsToCsv,
  auditRowsToJson,
  downloadTextFile,
  timestampedFilename,
} from "@/lib/auditExport";

type AuditRow = {
  id: string;
  created_at: string;
  actor_email: string | null;
  action: string;
  status: string | null;
  detail: unknown;
};


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

type RetryOutcome = {
  startedAt: string;
  finishedAt: string;
  attempts: number;
  before: { label: string; bundleFile: string | null; stuck: boolean }[];
  after: { label: string; bundleFile: string | null; stuck: boolean }[];
  status: "success" | "partial" | "no_change" | "error";
  message: string;
};

export default function HqDeployHealth() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [running, setRunning] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryOutcome, setRetryOutcome] = useState<RetryOutcome | null>(null);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const refreshAudit = useCallback(async () => {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const { data, error } = await supabase
        .from("deploy_health_audit")
        .select("id, created_at, actor_email, action, status, payload")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      setAudit((data ?? []) as AuditRow[]);
    } catch (e) {
      setAuditError(e instanceof Error ? e.message : String(e));
    } finally {
      setAuditLoading(false);
    }
  }, []);

  const exportAudit = useCallback(
    (format: "csv" | "json") => {
      if (audit.length === 0) {
        toast.info("Nothing to export yet — run a check first.");
        return;
      }
      const filename = timestampedFilename("deploy-health-audit", format);
      const mime = format === "csv" ? "text/csv" : "application/json";
      const body =
        format === "csv" ? auditRowsToCsv(audit) : auditRowsToJson(audit);
      downloadTextFile(filename, mime, body);
      toast.success(`Exported ${audit.length} row${audit.length === 1 ? "" : "s"} as ${format.toUpperCase()}.`);
      void logDeployHealthAudit("download_payload", "success", {
        kind: "audit_log_export",
        format,
        rowCount: audit.length,
        filename,
      });
    },
    [audit],
  );

  const pageBundle = useMemo(getCurrentPageBundle, []);

  const run = useCallback(async () => {
    setRunning(true);
    try {
      const out = await Promise.all(TARGETS.map((t) => probe(t.label, t.url)));
      setResults(out);
      setLastCheckedAt(new Date().toISOString());
      recordResults(out);
      void logDeployHealthAudit("run_checks", "success", {
        targets: out.map((r) => ({
          label: r.label,
          ok: r.ok,
          bundleFile: r.bundleFile,
          stuck: isStuck(r),
        })),
      }).then(() => refreshAudit());
      return out;
    } finally {
      setRunning(false);
    }
  }, [refreshAudit]);


  useEffect(() => {
    if (isAdmin) {
      void logDeployHealthAudit("view_page", "info", {
        path: typeof location !== "undefined" ? location.pathname : null,
      }).then(() => refreshAudit());
      run();
    }
  }, [isAdmin, run, refreshAudit]);



  const retryPromotion = useCallback(async () => {
    setRetrying(true);
    const startedAt = new Date().toISOString();
    let before: RetryOutcome["before"] = [];
    let afterProbes: ProbeResult[] = [];
    let attempts = 0;
    const maxAttempts = 4;

    try {
      const beforeProbes = results.length
        ? results
        : await Promise.all(TARGETS.map((t) => probe(t.label, t.url)));
      before = beforeProbes.map((r) => ({
        label: r.label,
        bundleFile: r.bundleFile,
        stuck: isStuck(r),
      }));
      afterProbes = beforeProbes;

      // Re-probe with a short backoff so a freshly-triggered promotion
      // (CDN cache flush, edge re-pin) has a chance to land.
      for (let i = 0; i < maxAttempts; i++) {
        attempts = i + 1;
        // Cache-bust hint via query param on the HTML root
        afterProbes = await Promise.all(
          TARGETS.map((t) => probe(t.label, `${t.url}?_rh=${Date.now()}`)),
        );
        const stillStuck = afterProbes.some(isStuck);
        const changed = afterProbes.some((r, idx) => {
          const b = before[idx];
          return b && r.bundleFile && b.bundleFile && r.bundleFile !== b.bundleFile;
        });
        if (!stillStuck || changed) break;
        await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
      }


      // Persist visible state from the final probe pass (strip the cache-bust
      // suffix from URLs we display).
      const cleaned = afterProbes.map((r, idx) => ({ ...r, url: TARGETS[idx].url }));
      setResults(cleaned);
      setLastCheckedAt(new Date().toISOString());
      recordResults(cleaned);

      const after = cleaned.map((r) => ({
        label: r.label,
        bundleFile: r.bundleFile,
        stuck: isStuck(r),
      }));
      const stillStuck = after.filter((a) => a.stuck);
      const changed = after.filter((a, idx) => {
        const b = before[idx];
        return b && a.bundleFile && b.bundleFile && a.bundleFile !== b.bundleFile;
      });

      let status: RetryOutcome["status"];
      let message: string;
      if (stillStuck.length === 0 && changed.length > 0) {
        status = "success";
        message = `Promotion landed — fresh bundle on ${changed.length}/${after.length} target(s).`;
        toast.success(message);
      } else if (stillStuck.length === 0) {
        status = "success";
        message = `All targets fresh (no stale markers detected).`;
        toast.success(message);
      } else if (changed.length > 0) {
        status = "partial";
        message = `Partial — ${changed.length} target(s) updated, ${stillStuck.length} still stale.`;
        toast.warning(message);
      } else {
        status = "no_change";
        message = `No change after ${attempts} attempt(s) — promotion still stuck. Escalate to Lovable Support.`;
        toast.error(message);
      }

      setRetryOutcome({
        startedAt,
        finishedAt: new Date().toISOString(),
        attempts,
        before,
        after,
        status,
        message,
      });
      void logDeployHealthAudit(
        "retry_promotion",
        status === "success" ? "success" : "failure",
        { attempts, startedAt, status, message, before, after },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const outcome: RetryOutcome = {
        startedAt,
        finishedAt: new Date().toISOString(),
        attempts,
        before,
        after: before,
        status: "error",
        message: `Retry failed: ${msg}`,
      };
      setRetryOutcome(outcome);
      toast.error(outcome.message);
      void logDeployHealthAudit("retry_promotion", "failure", {
        attempts, startedAt, error: msg, before,
      });
    } finally {
      setRetrying(false);
    }
  }, [results]);




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

  const [manualCopy, setManualCopy] = useState<{ label: string; text: string } | null>(null);

  const tryCopy = useCallback(async (
    label: string,
    text: string,
    successMsg: string,
    auditAction?: DeployHealthAuditAction,
  ) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      toast.success(successMsg);
      if (auditAction) {
        void logDeployHealthAudit(auditAction, "success", { label, bytes: text.length });
      }
    } catch (e) {
      const reason = e instanceof Error ? e.message : "Clipboard blocked";
      toast.error(`Copy failed — ${reason}. Use the manual copy box.`);
      setManualCopy({ label, text });
      if (auditAction) {
        void logDeployHealthAudit(auditAction, "failure", { label, reason, fallback: "manual_copy_box" });
      }
    }
  }, []);

  const copyEscalation = () =>
    tryCopy("Escalation payload", escalation, "Escalation payload copied", "copy_escalation_text");


  const supportSubject = "Stuck production promotion — force-promote required";
  const supportBody = useMemo(() => {
    const keyLines: string[] = ["", "------", "Supabase key-type mismatch details:"];
    if (results.length === 0) {
      keyLines.push("  (no probes run yet)");
    } else {
      for (const r of results) {
        const keyType =
          !r.ok
            ? "unknown (probe error)"
            : r.hasLegacyKey
              ? "LEGACY JWT (eyJhbGci) — stale"
              : r.hasModernKey
                ? "sb_publishable_ — fresh"
                : "neither marker present — unknown";
        keyLines.push(`  - ${r.label}: ${keyType}`);
        keyLines.push(`      bundle: ${r.bundleFile ?? "—"}  stuck: ${isStuck(r)}`);
      }
      const stuck = results.filter(isStuck).map((r) => r.label);
      keyLines.push("");
      keyLines.push(
        stuck.length === 0
          ? "  Overall: all targets fresh (no key mismatch detected)."
          : `  Overall: KEY MISMATCH on ${stuck.length}/${results.length} — ${stuck.join(", ")}`,
      );
    }
    const next = [
      ...keyLines,
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
  }, [escalation, results]);


  const openSupportEmail = async () => {
    let clipboardOk = false;
    try {
      await navigator.clipboard?.writeText(supportBody);
      clipboardOk = true;
    } catch {
      /* ignore — mailto still opens */
    }
    const href =
      `mailto:support@lovable.dev` +
      `?subject=${encodeURIComponent(supportSubject)}` +
      `&body=${encodeURIComponent(supportBody)}`;
    window.location.href = href;
    toast.success("Opening email — payload also copied to clipboard");
    void logDeployHealthAudit("open_support_email", "success", {
      subject: supportSubject,
      bodyBytes: supportBody.length,
      clipboardCopied: clipboardOk,
    });
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

  const copyEscalationJson = () =>
    tryCopy("Escalation payload (JSON)", escalationJson, "Escalation payload copied as JSON", "copy_escalation_json");

  const promotionReportJson = useMemo(() => {
    return JSON.stringify(
      {
        kind: "promotion_report",
        projectId: "ebeb5b18-7fa0-4d1b-b9a3-22ec57bd6cff",
        generatedAt: new Date().toISOString(),
        triggeredBy: user?.email ?? null,
        adminPageBundle: pageBundle,
        lastCheckedAt,
        retry: retryOutcome
          ? {
              startedAt: retryOutcome.startedAt,
              finishedAt: retryOutcome.finishedAt,
              attempts: retryOutcome.attempts,
              status: retryOutcome.status,
              message: retryOutcome.message,
              perDomain: retryOutcome.after.map((a, idx) => {
                const b = retryOutcome.before[idx];
                const beforeHash = b?.bundleFile ?? null;
                const afterHash = a.bundleFile ?? null;
                const changed = !!(beforeHash && afterHash && beforeHash !== afterHash);
                let domainStatus: "success" | "partial" | "no_change" | "error";
                if (!afterHash) domainStatus = "error";
                else if (!a.stuck) domainStatus = "success";
                else if (changed) domainStatus = "partial";
                else domainStatus = "no_change";
                return {
                  label: a.label,
                  attempts: retryOutcome.attempts,
                  before: { bundleFile: beforeHash, stuck: b?.stuck ?? null },
                  after: { bundleFile: afterHash, stuck: a.stuck },
                  changed,
                  status: domainStatus,
                };
              }),
            }
          : null,
        currentProbes: results.map((r) => ({
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
      },
      null,
      2,
    );
  }, [retryOutcome, results, lastCheckedAt, user?.email, pageBundle]);

  const copyPromotionReport = () =>
    tryCopy(
      "Promotion report (JSON)",
      promotionReportJson,
      retryOutcome
        ? "Promotion report copied"
        : "Promotion report copied (no retry run yet — current probes only)",
      "copy_promotion_report",
    );


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
      void logDeployHealthAudit("download_escalation_txt", "success", {
        filename, bytes: supportBody.length,
      });
    } catch (e) {
      const reason = e instanceof Error ? e.message : "Download failed";
      toast.error("Download failed");
      void logDeployHealthAudit("download_escalation_txt", "failure", { reason });
    }
  };

  const copySupportEmail = () => {
    const full =
      `To: support@lovable.dev\n` +
      `Subject: ${supportSubject}\n\n` +
      supportBody;
    return tryCopy("Support email (To, Subject, payload)", full, "Support email copied (To, Subject, payload)", "copy_support_email");
  };



  const anyStuck = results.some(isStuck);

  const keyFormatDiff = useMemo(() => {
    const raw = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? "";
    const trimmed = raw.trim();
    const length = trimmed.length;
    const prefix = trimmed.slice(0, 16);
    const isModern = trimmed.startsWith("sb_publishable_");
    const isLegacy = trimmed.startsWith("eyJ");
    const shape: "modern" | "legacy_jwt" | "empty" | "unknown" =
      length === 0 ? "empty" : isModern ? "modern" : isLegacy ? "legacy_jwt" : "unknown";
    const expected = {
      prefix: "sb_publishable_",
      minLength: 40,
      example: "sb_publishable_XXXXXXXXXXXXXXXXXXXXXX",
    };
    return { raw: trimmed, length, prefix, shape, expected, isModern, isLegacy };
  }, []);


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
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={retryPromotion}
              disabled={retrying || running}
              className="text-sm tracking-[0.3em] uppercase text-foreground/90 underline underline-offset-8 disabled:opacity-40"
              title="Re-probe each domain with cache-bust + backoff to detect whether a fresh bundle has landed"
            >
              {retrying ? "Retrying promotion…" : "Retry promotion"}
            </button>
            <button
              type="button"
              onClick={run}
              disabled={running || retrying}
              className="text-sm tracking-[0.3em] uppercase text-foreground/60 underline underline-offset-8 disabled:opacity-40"
              title="Immediately re-fetch bundle state, markers, and timestamps"
            >
              {running ? "Re-checking…" : "Re-run checks"}
            </button>
          </div>
        </section>

        <section
          className={
            "border px-5 py-4 space-y-4 " +
            (keyFormatDiff.shape === "modern"
              ? "border-emerald-600/30 bg-emerald-600/5"
              : "border-red-600/40 bg-red-600/5")
          }
        >
          <div className="flex items-center justify-between gap-4">
            <div
              className={
                "text-[0.65rem] tracking-[0.45em] uppercase " +
                (keyFormatDiff.shape === "modern" ? "text-emerald-700" : "text-red-700")
              }
            >
              VITE_SUPABASE_PUBLISHABLE_KEY · format diff
            </div>
            <span
              className={
                "text-[0.6rem] tracking-[0.35em] uppercase px-2 py-1 border " +
                (keyFormatDiff.shape === "modern"
                  ? "text-emerald-700 border-emerald-600/40"
                  : "text-red-700 border-red-600/40")
              }
            >
              {keyFormatDiff.shape === "modern"
                ? "Match"
                : keyFormatDiff.shape === "legacy_jwt"
                ? "Legacy JWT"
                : keyFormatDiff.shape === "empty"
                ? "Missing"
                : "Unknown"}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-[0.7rem]">
            <div className="border border-border/10 p-3 space-y-2 bg-foreground/[0.015]">
              <div className="uppercase tracking-[0.3em] text-foreground/40 text-[0.6rem]">
                Expected
              </div>
              <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
                <dt className="text-foreground/50">prefix</dt>
                <dd><code className="text-emerald-700">{keyFormatDiff.expected.prefix}</code></dd>
                <dt className="text-foreground/50">min length</dt>
                <dd className="text-foreground/80">{keyFormatDiff.expected.minLength}</dd>
                <dt className="text-foreground/50">example</dt>
                <dd className="truncate"><code className="text-foreground/70">{keyFormatDiff.expected.example}</code></dd>
              </dl>
            </div>
            <div className="border border-border/10 p-3 space-y-2 bg-foreground/[0.015]">
              <div className="uppercase tracking-[0.3em] text-foreground/40 text-[0.6rem]">
                Actual (in this bundle)
              </div>
              <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
                <dt className="text-foreground/50">prefix</dt>
                <dd>
                  <code
                    className={
                      keyFormatDiff.isModern ? "text-emerald-700" : "text-red-700"
                    }
                  >
                    {keyFormatDiff.prefix || "(empty)"}
                  </code>
                </dd>
                <dt className="text-foreground/50">length</dt>
                <dd
                  className={
                    keyFormatDiff.length >= keyFormatDiff.expected.minLength
                      ? "text-foreground/80"
                      : "text-red-700"
                  }
                >
                  {keyFormatDiff.length}
                </dd>
                <dt className="text-foreground/50">shape</dt>
                <dd
                  className={
                    keyFormatDiff.shape === "modern" ? "text-emerald-700" : "text-red-700"
                  }
                >
                  {keyFormatDiff.shape}
                </dd>
              </dl>
            </div>
          </div>

          {keyFormatDiff.shape !== "modern" && (
            <div className="border-t border-border/10 pt-3 space-y-2">
              <div className="text-[0.65rem] tracking-[0.45em] uppercase text-red-700">
                Fix checklist
              </div>
              <ol className="text-xs text-foreground/80 leading-relaxed space-y-1 list-decimal pl-5">
                <li>Rotate Supabase API keys to the <code>sb_publishable_*</code> format in Backend → API Keys.</li>
                <li>Confirm <code>.env</code> writes <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> starting with <code>sb_publishable_</code>.</li>
                <li>Republish the frontend so the new key is baked into <code>/assets/index-*.js</code>.</li>
                <li>Run <strong>Re-run checks</strong> above and confirm every target shows <strong>Fresh</strong>.</li>
                <li>If the bundle still serves a legacy key after republish, use <strong>Copy support email</strong> to escalate (promotion is stuck, not the key).</li>
              </ol>
            </div>
          )}
        </section>


        {anyStuck && (
          <section className="border border-amber-600/50 bg-amber-600/5 px-5 py-4 flex items-start justify-between gap-6">
            <div className="space-y-1">
              <div className="text-[0.65rem] tracking-[0.45em] uppercase text-amber-700">
                Supabase key mismatch detected
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">
                One or more live bundles still contain the legacy <code>eyJhbGci</code> key
                or are missing the modern <code>sb_publishable_</code> marker. Copy the full
                payload below and send it to Lovable Support to force-promote a fresh build.
              </p>
            </div>
            <div className="shrink-0 flex flex-col gap-2">
              <button
                type="button"
                onClick={copySupportEmail}
                className="text-sm tracking-[0.3em] uppercase text-amber-900 bg-amber-600/15 border border-amber-700/50 px-4 py-2 hover:bg-amber-600/25"
                title="Generate a ready-to-send support email (To, Subject, body with key-type mismatch details) and copy it to your clipboard"
              >
                Copy support email
              </button>
              <button
                type="button"
                onClick={copyEscalationJson}
                className="text-xs tracking-[0.3em] uppercase text-amber-800 border border-amber-700/40 px-4 py-2 hover:bg-amber-600/10"
                title="Copy the full deploy-health JSON payload to your clipboard"
              >
                Copy JSON payload
              </button>
            </div>

          </section>
        )}


        {retryOutcome && (
          <section
            className={
              "border px-5 py-4 space-y-3 " +
              (retryOutcome.status === "success"
                ? "border-emerald-600/40 bg-emerald-600/5"
                : retryOutcome.status === "partial"
                ? "border-amber-600/40 bg-amber-600/5"
                : retryOutcome.status === "no_change"
                ? "border-red-600/40 bg-red-600/5"
                : "border-red-600/40 bg-red-600/5")
            }
          >
            <div className="flex items-center justify-between gap-4">
              <div
                className={
                  "text-[0.65rem] tracking-[0.45em] uppercase " +
                  (retryOutcome.status === "success"
                    ? "text-emerald-700"
                    : retryOutcome.status === "partial"
                    ? "text-amber-700"
                    : "text-red-700")
                }
              >
                {retryOutcome.status === "success"
                  ? "Retry succeeded"
                  : retryOutcome.status === "partial"
                  ? "Retry partial"
                  : retryOutcome.status === "no_change"
                  ? "Retry — no change"
                  : "Retry error"}
              </div>
              <button
                type="button"
                onClick={() => setRetryOutcome(null)}
                className="text-[0.6rem] tracking-[0.3em] uppercase text-foreground/50 hover:text-foreground/80"
              >
                Dismiss
              </button>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{retryOutcome.message}</p>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 text-[0.7rem] text-foreground/70">
              <dt className="uppercase tracking-[0.3em] text-foreground/40">Attempts</dt>
              <dd>{retryOutcome.attempts}</dd>
              <dt className="uppercase tracking-[0.3em] text-foreground/40">Started</dt>
              <dd>{retryOutcome.startedAt}</dd>
              <dt className="uppercase tracking-[0.3em] text-foreground/40">Finished</dt>
              <dd>{retryOutcome.finishedAt}</dd>
            </dl>
            <div className="border border-border/10 overflow-x-auto">
              <div className="px-3 py-2 uppercase tracking-[0.3em] text-foreground/40 text-[0.6rem] border-b border-border/10">
                Per-domain results
              </div>
              <table className="w-full text-[0.7rem]">
                <thead>
                  <tr className="text-left text-foreground/40 uppercase tracking-[0.25em] text-[0.55rem]">
                    <th className="px-3 py-2 font-normal">Domain</th>
                    <th className="px-3 py-2 font-normal">Attempts</th>
                    <th className="px-3 py-2 font-normal">Before</th>
                    <th className="px-3 py-2 font-normal">After</th>
                    <th className="px-3 py-2 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {retryOutcome.after.map((a, idx) => {
                    const b = retryOutcome.before[idx];
                    const beforeHash = b?.bundleFile ?? null;
                    const afterHash = a.bundleFile ?? null;
                    const changed = !!(beforeHash && afterHash && beforeHash !== afterHash);
                    let rowStatus: "success" | "partial" | "no_change" | "error";
                    let tone: string;
                    if (!afterHash) {
                      rowStatus = "error"; tone = "text-red-700";
                    } else if (!a.stuck && changed) {
                      rowStatus = "success"; tone = "text-emerald-700";
                    } else if (!a.stuck) {
                      rowStatus = "success"; tone = "text-emerald-700";
                    } else if (changed) {
                      rowStatus = "partial"; tone = "text-amber-700";
                    } else {
                      rowStatus = "no_change"; tone = "text-amber-700";
                    }
                    const label = rowStatus === "no_change" ? "no change" : rowStatus;
                    return (
                      <tr key={`row-${a.label}`} className="border-t border-border/10 align-top">
                        <td className="px-3 py-2 text-foreground/70">{a.label}</td>
                        <td className="px-3 py-2 text-foreground/70">{retryOutcome.attempts}</td>
                        <td className="px-3 py-2">
                          <code className={b?.stuck ? "text-amber-700" : "text-foreground/70"}>
                            {beforeHash ?? "—"}
                          </code>
                        </td>
                        <td className="px-3 py-2">
                          <code className={a.stuck ? "text-amber-700" : "text-emerald-700"}>
                            {afterHash ?? "—"}
                          </code>
                        </td>
                        <td className={`px-3 py-2 uppercase tracking-[0.25em] text-[0.6rem] ${tone}`}>
                          {label}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
              <button
                type="button"
                onClick={copyPromotionReport}
                className="text-xs tracking-[0.3em] uppercase text-foreground/80 underline underline-offset-8"
                title="Copy full before/after probe JSON for support/debugging"
              >
                Copy promotion report
              </button>
              {(retryOutcome.status === "no_change" || retryOutcome.status === "partial") && (
                <>
                  <button
                    type="button"
                    onClick={openSupportEmail}
                    className="text-xs tracking-[0.3em] uppercase text-red-700 underline underline-offset-8"
                  >
                    Escalate to Lovable Support →
                  </button>
                  <button
                    type="button"
                    onClick={copyEscalationJson}
                    className="text-xs tracking-[0.3em] uppercase text-foreground/80 underline underline-offset-8"
                  >
                    Copy payload as JSON
                  </button>
                </>
              )}
            </div>
          </section>
        )}

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

        <section className="border-t border-border/10 pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[0.65rem] tracking-[0.45em] uppercase text-foreground/40">
              Audit log · last 25
            </div>
            <button
              type="button"
              onClick={refreshAudit}
              disabled={auditLoading}
              className="text-[0.65rem] tracking-[0.3em] uppercase text-foreground/60 underline underline-offset-8 disabled:opacity-40"
            >
              {auditLoading ? "Loading…" : "Refresh"}
            </button>
          </div>
          <p className="text-xs text-foreground/60 max-w-2xl leading-relaxed">
            Every admin diagnostic action on this page — view, run checks,
            retry promotion, copy, download, open support email — is recorded
            in <code>deploy_health_audit</code>. Insert and read are gated by
            row-level security to the <code>admin</code> role.
          </p>
          {auditError && (
            <div className="text-xs text-red-600/80">Failed to load: {auditError}</div>
          )}
          {!auditError && audit.length === 0 && !auditLoading && (
            <div className="text-xs text-foreground/50">No audit entries yet.</div>
          )}
          {audit.length > 0 && (
            <div className="border border-border/10">
              <table className="w-full text-[0.7rem]">
                <thead>
                  <tr className="text-foreground/40 uppercase tracking-[0.3em]">
                    <th className="text-left font-normal px-3 py-2">When</th>
                    <th className="text-left font-normal px-3 py-2">Actor</th>
                    <th className="text-left font-normal px-3 py-2">Action</th>
                    <th className="text-left font-normal px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((row) => (
                    <tr key={row.id} className="border-t border-border/10">
                      <td className="px-3 py-2 text-foreground/70 whitespace-nowrap">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-foreground/70">
                        {row.actor_email ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-foreground/80">
                        <code>{row.action}</code>
                      </td>
                      <td
                        className={
                          "px-3 py-2 " +
                          (row.status === "success"
                            ? "text-emerald-700"
                            : row.status === "failure"
                            ? "text-red-700"
                            : "text-foreground/60")
                        }
                      >
                        {row.status ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>


      {manualCopy && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Manual copy fallback"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
          onClick={() => setManualCopy(null)}
        >
          <div
            className="w-full max-w-2xl bg-background border border-border/30 shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-[0.65rem] tracking-[0.45em] uppercase text-amber-700">
                  Manual copy required
                </div>
                <h2 className="font-serif text-xl text-foreground mt-1">{manualCopy.label}</h2>
                <p className="text-xs text-foreground/60 mt-2 leading-relaxed">
                  Clipboard access was blocked by your browser. Select all (⌘/Ctrl+A) inside the box below, then copy (⌘/Ctrl+C).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManualCopy(null)}
                className="text-xs tracking-[0.3em] uppercase text-foreground/60 hover:text-foreground"
              >
                Close
              </button>
            </div>
            <textarea
              readOnly
              value={manualCopy.text}
              onFocus={(e) => e.currentTarget.select()}
              autoFocus
              className="w-full h-72 text-[0.7rem] leading-relaxed font-mono text-foreground/80 bg-foreground/[0.02] border border-border/20 p-3 focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none"
            />
            <div className="flex items-center justify-between gap-4 text-[0.65rem] text-foreground/50">
              <span>{manualCopy.text.length.toLocaleString()} characters</span>
              <button
                type="button"
                onClick={() => tryCopy(manualCopy.label, manualCopy.text, "Copied")}
                className="text-xs tracking-[0.3em] uppercase text-foreground/90 underline underline-offset-8"
              >
                Try copy again
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
