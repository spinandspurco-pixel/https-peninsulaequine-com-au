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

export default function HqDbLints() {
  const [lints, setLints] = useState<Lint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "mgmt-db-lints",
        { method: "GET" },
      );
      if (fnError) throw fnError;

      // Response may be an array directly, or a wrapped { error, ... } payload.
      if (data && typeof data === "object" && !Array.isArray(data) && "error" in data) {
        const err = (data as { error: string; status?: number }).error;
        throw new Error(`${err}${(data as any).status ? ` (${(data as any).status})` : ""}`);
      }

      const list: Lint[] = Array.isArray(data)
        ? (data as Lint[])
        : Array.isArray((data as any)?.lints)
          ? ((data as any).lints as Lint[])
          : [];

      list.sort((a, b) => {
        const la = LEVEL_ORDER[(a.level ?? "").toUpperCase()] ?? 99;
        const lb = LEVEL_ORDER[(b.level ?? "").toUpperCase()] ?? 99;
        if (la !== lb) return la - lb;
        return (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? "");
      });

      setLints(list);
      setFetchedAt(new Date());
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Failed to load database lints.");
      setLints(null);
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
        <HqBreadcrumbs current="Database Lints" sectionOverride="operations" />

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
            {fetchedAt && (
              <span>Last fetched {fetchedAt.toLocaleTimeString()}</span>
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
