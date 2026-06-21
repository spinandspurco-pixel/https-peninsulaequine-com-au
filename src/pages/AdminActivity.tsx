import { useEffect, useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { HqNav } from "@/components/hq/HqNav";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";

type ActivityRow = {
  id: string;
  created_at: string;
  action_type: string;
  action_level: string;
  category: string;
  title: string;
  description: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  performed_by: string;
  approved_by: string | null;
  approved_at: string | null;
};

const PAGE_SIZE = 50;

const LEVEL_TONE: Record<string, string> = {
  info: "text-foreground/70",
  notice: "text-accent/85",
  warning: "text-amber-500/85",
  critical: "text-red-500/90",
};

export default function AdminActivity() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    document.title = "Activity Timeline | Peninsula Equine HQ";
  }, []);

  useEffect(() => {
    setPage(0);
  }, [category, level]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      let q = supabase
        .from("activity_log")
        .select(
          "id, created_at, action_type, action_level, category, title, description, entity_type, entity_id, metadata, performed_by, approved_by, approved_at"
        )
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (category !== "all") q = q.eq("category", category);
      if (level !== "all") q = q.eq("action_level", level);
      const { data, error: err } = await q;
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setRows((prev) => (page === 0 ? (data as ActivityRow[]) : [...prev, ...(data as ActivityRow[])]));
      setHasMore((data?.length ?? 0) === PAGE_SIZE);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, category, level]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.category && set.add(r.category));
    return Array.from(set).sort();
  }, [rows]);

  return (
    <Layout>
      <main className="bg-background text-foreground type-architectural min-h-screen">
        <div className="section-container max-w-[1280px] pt-28 pb-24">
          <HqNav className="mb-12" />

          <header className="mb-12 flex items-baseline gap-5">
            <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">HQ / 09</span>
            <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
            <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">Activity Timeline</span>
          </header>

          <div className="mb-10 grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-7 space-y-3">
              <h1 className="font-serif text-foreground/95 leading-[1.02] tracking-[-0.024em] text-[clamp(1.9rem,1.2rem+2.2vw,2.8rem)]">
                Who did what, and when.
              </h1>
              <p className="font-sans font-light text-foreground/55 leading-[1.7] text-[0.95rem] max-w-xl">
                A single, append-only record of every meaningful action across the studio — uploads,
                approvals, intake submissions, contractor downloads, role changes.
              </p>
            </div>
            <div className="col-span-12 md:col-span-5 flex flex-wrap gap-3 md:justify-end">
              <FilterSelect label="Category" value={category} onChange={setCategory} options={["all", ...categories]} />
              <FilterSelect
                label="Level"
                value={level}
                onChange={setLevel}
                options={["all", "info", "notice", "warning", "critical"]}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="font-mono text-[11px] uppercase tracking-[0.4em] text-red-500/80 mb-6">
              Failed to load · {error}
            </p>
          )}

          {!loading && rows.length === 0 && !error && (
            <p className="font-serif italic text-foreground/55 py-12 text-center">
              No activity recorded yet. The timeline begins with the next action.
            </p>
          )}

          <ol className="divide-y divide-accent/12 border-t border-accent/15">
            {rows.map((row) => (
              <li key={row.id} className="grid grid-cols-12 gap-4 py-5">
                <div className="col-span-12 sm:col-span-3 font-mono uppercase text-[10px] tracking-[0.4em] text-foreground/45 pt-1">
                  <div className="text-foreground/70">{format(new Date(row.created_at), "dd MMM yyyy")}</div>
                  <div className="text-foreground/40">{format(new Date(row.created_at), "HH:mm")}</div>
                  <div className="text-foreground/30 mt-1 normal-case tracking-normal font-sans">
                    {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-9 space-y-2">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className={`font-serif text-[1.05rem] leading-snug ${LEVEL_TONE[row.action_level] ?? "text-foreground/80"}`}>
                      {row.title}
                    </span>
                    <span className="font-mono uppercase text-[9px] tracking-[0.4em] text-accent/55">
                      {row.category}
                    </span>
                    {row.action_level !== "info" && (
                      <span className={`font-mono uppercase text-[9px] tracking-[0.4em] ${LEVEL_TONE[row.action_level] ?? "text-foreground/45"}`}>
                        · {row.action_level}
                      </span>
                    )}
                  </div>
                  {row.description && (
                    <p className="font-sans font-light text-foreground/60 leading-[1.65] text-[0.92rem]">
                      {row.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/40">
                    <span>By · <span className="text-foreground/65">{row.performed_by}</span></span>
                    {row.entity_type && (
                      <span>
                        On · <span className="text-foreground/65">{row.entity_type}</span>
                        {row.entity_id ? <span className="text-foreground/35 normal-case tracking-normal font-sans"> ({row.entity_id.slice(0, 8)})</span> : null}
                      </span>
                    )}
                    {row.approved_at && (
                      <span>Approved · <span className="text-accent/75">{format(new Date(row.approved_at), "dd MMM HH:mm")}</span></span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex items-center justify-center gap-6">
            {loading && (
              <span className="font-mono uppercase text-[10px] tracking-[0.4em] text-foreground/45">Loading…</span>
            )}
            {!loading && hasMore && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-accent transition-colors duration-500 text-[10px] tracking-[0.42em]"
              >
                <span className="w-8 h-px bg-accent/40 transition-all duration-500 group-hover:w-14 group-hover:bg-accent" />
                Load more
              </button>
            )}
            {!loading && !hasMore && rows.length > 0 && (
              <span className="font-mono uppercase text-[10px] tracking-[0.4em] text-foreground/30">End of record</span>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 font-mono uppercase text-[10px] tracking-[0.4em] text-foreground/55">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-b border-accent/30 px-2 py-1 text-foreground/80 focus:outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-background text-foreground">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
