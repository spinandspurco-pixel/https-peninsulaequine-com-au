import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";
import { HqNav } from "@/components/hq/HqNav";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * HQ → Operations → Database Lints
 *
 * Admin-only. Invokes the `mgmt-db-lints` edge function which server-side
 * proxies Supabase Management API's database linter using SB_MGMT_ACCESS_TOKEN.
 * Strictly read-only.
 */

type Lint = {
  name?: string;
  title?: string;
  level?: string;
  facing?: string;
  categories?: string[];
  description?: string;
  detail?: string;
  remediation?: string | null;
  metadata?: Record<string, unknown> | null;
  cache_key?: string;
};

type RequestMeta = {
  endpoint: string;
  project_ref: string;
  fetched_at: string;
  duration_ms: number;
};

type Envelope =
  | { status: "ok"; request: RequestMeta; lints: Lint[] }
  | {
      status: "error";
      request: RequestMeta;
      lints: Lint[];
      error: { code: string; message: string; upstream_status?: number };
    };

const LEVEL_ORDER: Record<string, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
};

function levelClasses(level?: string) {
  const l = (level ?? "").toUpperCase();
  if (l === "ERROR") return "text-red-400 border-red-500/40 bg-red-500/5";
  if (l === "WARN") return "text-amber-300 border-amber-500/40 bg-amber-500/5";
  return "text-foreground/70 border-border/60 bg-background/40";
}

/**
 * Validate a raw response body against the v1 envelope contract. Anything
 * outside the contract is rejected so the UI never renders partial garbage.
 */
function parseEnvelope(data: unknown): Envelope {
  if (!data || typeof data !== "object") {
    throw new Error("Malformed response: not an object.");
  }
  const d = data as Record<string, unknown>;
  const status = d.status;
  if (status !== "ok" && status !== "error") {
    throw new Error("Malformed response: missing status.");
  }
  const req = d.request as Partial<RequestMeta> | undefined;
  if (
    !req ||
    typeof req.endpoint !== "string" ||
    typeof req.project_ref !== "string" ||
    typeof req.fetched_at !== "string" ||
    typeof req.duration_ms !== "number"
  ) {
    throw new Error("Malformed response: missing request metadata.");
  }
  const lints = Array.isArray(d.lints) ? (d.lints as Lint[]) : [];
  if (status === "error") {
    const err = d.error as
      | { code?: unknown; message?: unknown; upstream_status?: unknown }
      | undefined;
    if (!err || typeof err.code !== "string" || typeof err.message !== "string") {
      throw new Error("Malformed error response.");
    }
    return {
      status: "error",
      request: req as RequestMeta,
      lints,
      error: {
        code: err.code,
        message: err.message,
        upstream_status:
          typeof err.upstream_status === "number" ? err.upstream_status : undefined,
      },
    };
  }
  return { status: "ok", request: req as RequestMeta, lints };
}

export default function HqDbLints() {
  const [lints, setLints] = useState<Lint[] | null>(null);
  const [meta, setMeta] = useState<RequestMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "mgmt-db-lints",
        { method: "GET" },
      );
      // supabase-js surfaces non-2xx as fnError but still parses the body into
      // `data`. Prefer the envelope shape when present so we get the code.
      const envelope = data ? parseEnvelope(data) : null;

      if (envelope?.status === "error") {
        const suffix = envelope.error.upstream_status
          ? ` (upstream ${envelope.error.upstream_status})`
          : "";
        throw new Error(
          `${envelope.error.code}: ${envelope.error.message}${suffix}`,
        );
      }
      if (fnError) throw fnError;
      if (!envelope) throw new Error("Empty response from mgmt-db-lints.");

      const list = [...envelope.lints].sort((a, b) => {
        const la = LEVEL_ORDER[(a.level ?? "").toUpperCase()] ?? 99;
        const lb = LEVEL_ORDER[(b.level ?? "").toUpperCase()] ?? 99;
        if (la !== lb) return la - lb;
        return (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? "");
      });

      setLints(list);
      setMeta(envelope.request);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Failed to load database lints.");
      setLints(null);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);


  const summary = useMemo(() => {
    if (!lints) return null;
    const counts = lints.reduce<Record<string, number>>((acc, l) => {
      const k = (l.level ?? "OTHER").toUpperCase();
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
    return counts;
  }, [lints]);

  return (
    <Layout>
      <HqNav />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <HqBreadcrumbs current="Database Lints" />

        <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-foreground/40">
              Operations · Read-only
            </p>
            <h1 className="mt-2 font-serif text-3xl leading-tight">
              Database Lints
            </h1>
            <p className="mt-2 max-w-xl text-sm text-foreground/60">
              Server-side proxy to the Supabase Management API database linter.
              Results are advisory — review each finding before acting.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-foreground/50">
            {meta && (
              <span>
                {meta.endpoint} · {new Date(meta.fetched_at).toLocaleTimeString()} ·{" "}
                {meta.duration_ms}ms
              </span>
            )}

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="border border-border/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-foreground/70 transition hover:text-foreground disabled:opacity-40"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </header>

        {summary && (
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.25em]">
            {Object.entries(summary).map(([lvl, n]) => (
              <span
                key={lvl}
                className={cn("border px-2 py-1", levelClasses(lvl))}
              >
                {lvl} · {n}
              </span>
            ))}
            {Object.keys(summary).length === 0 && (
              <span className="text-foreground/50 tracking-normal normal-case">
                No lints returned.
              </span>
            )}
          </div>
        )}

        <section className="mt-8">
          {loading && !lints && (
            <div className="border border-border/40 bg-background/40 p-8 text-sm text-foreground/60">
              Loading database lints…
            </div>
          )}

          {error && (
            <div className="border border-red-500/40 bg-red-500/5 p-6 text-sm text-red-300">
              <p className="font-medium">Could not load lints.</p>
              <p className="mt-1 text-red-300/80">{error}</p>
              <button
                type="button"
                onClick={load}
                className="mt-4 border border-red-500/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] hover:bg-red-500/10"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && lints && lints.length === 0 && (
            <div className="border border-border/40 bg-background/40 p-8 text-sm text-foreground/60">
              No findings. The database is clean per the current linter rules.
            </div>
          )}

          {lints && lints.length > 0 && (
            <ul className="divide-y divide-border/40 border border-border/40">
              {lints.map((lint, i) => (
                <li key={lint.cache_key ?? `${lint.name}-${i}`} className="p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <span
                        className={cn(
                          "mr-3 inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.25em]",
                          levelClasses(lint.level),
                        )}
                      >
                        {(lint.level ?? "INFO").toUpperCase()}
                      </span>
                      <span className="font-medium">
                        {lint.title ?? lint.name ?? "Unnamed lint"}
                      </span>
                    </div>
                    {lint.facing && (
                      <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                        {lint.facing}
                      </span>
                    )}
                  </div>

                  {lint.description && (
                    <p className="mt-3 text-sm text-foreground/70">
                      {lint.description}
                    </p>
                  )}
                  {lint.detail && lint.detail !== lint.description && (
                    <p className="mt-2 text-sm text-foreground/60">
                      {lint.detail}
                    </p>
                  )}

                  {lint.categories && lint.categories.length > 0 && (
                    <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-foreground/40">
                      {lint.categories.join(" · ")}
                    </p>
                  )}

                  {lint.remediation && (
                    <a
                      href={lint.remediation}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-xs uppercase tracking-[0.25em] text-foreground/70 underline underline-offset-4 hover:text-foreground"
                    >
                      Remediation guide ↗
                    </a>
                  )}

                  {lint.metadata && Object.keys(lint.metadata).length > 0 && (
                    <details className="mt-3 text-xs text-foreground/50">
                      <summary className="cursor-pointer uppercase tracking-[0.25em]">
                        Metadata
                      </summary>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words border border-border/40 bg-background/40 p-3 text-[11px] text-foreground/60">
                        {JSON.stringify(lint.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}
