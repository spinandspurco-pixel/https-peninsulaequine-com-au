import { useEffect, useState, useMemo, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";
import { HqNav } from "@/components/hq/HqNav";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { Search, RefreshCw, Inbox, Download } from "lucide-react";
import { toast } from "sonner";
import { InquiryDetailDrawer } from "@/components/admin/InquiryDetailDrawer";
import { INQUIRY_STATUSES, statusLabel, STATUS_TONE, type InquiryStatus } from "@/lib/inquiryStatus";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type BulkAction = "approve" | "complete" | "delete";

const BULK_COPY: Record<BulkAction, { verb: string; title: string; body: (n: number) => string; confirm: string; destructive?: boolean }> = {
  approve: {
    verb: "Approve",
    title: "Approve selected inquiries?",
    body: (n) => `${n} ${n === 1 ? "inquiry" : "inquiries"} will move to In Progress.`,
    confirm: "Approve",
  },
  complete: {
    verb: "Mark complete",
    title: "Mark selected inquiries complete?",
    body: (n) => `${n} ${n === 1 ? "inquiry" : "inquiries"} will move to Closed.`,
    confirm: "Mark complete",
  },
  delete: {
    verb: "Delete",
    title: "Delete selected inquiries?",
    body: (n) =>
      `${n} ${n === 1 ? "inquiry" : "inquiries"} and any linked notes will be permanently removed. This cannot be undone.`,
    confirm: "Delete permanently",
    destructive: true,
  },
};


type SortKey = "newest" | "oldest" | "updated";

interface Row {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  services: string[] | null;
  project_vision: string | null;
  project_details: string | null;
  preferred_start: string | null;
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 25;

export default function AdminInquiries() {
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InquiryStatus>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Clear selection when the visible dataset changes.
  useEffect(() => {
    setSelected(new Set());
  }, [debouncedSearch, statusFilter, sort, page]);

  useEffect(() => {
    document.title = "Inquiries | Peninsula Equine HQ";
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    let q = supabase
      .from("inquiries")
      .select(
        "id,name,email,phone,status,services,project_vision,project_details,preferred_start,created_at,updated_at",
        { count: "exact" }
      );

    if (statusFilter !== "all") q = q.eq("status", statusFilter);

    if (debouncedSearch) {
      const term = debouncedSearch.replace(/[%,]/g, " ");
      const like = `%${term}%`;
      q = q.or(
        [
          `name.ilike.${like}`,
          `email.ilike.${like}`,
          `phone.ilike.${like}`,
          `preferred_start.ilike.${like}`,
          `project_vision.ilike.${like}`,
          `project_details.ilike.${like}`,
        ].join(",")
      );
    }

    if (sort === "newest") q = q.order("created_at", { ascending: false });
    else if (sort === "oldest") q = q.order("created_at", { ascending: true });
    else q = q.order("updated_at", { ascending: false });

    q = q.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    const { data, error: err, count: total } = await q;
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((data ?? []) as Row[]);
    if (typeof total === "number") setCount(total);
  }, [debouncedSearch, statusFilter, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (id: string) => {
    setActiveId(id);
    setDrawerOpen(true);
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someOnPageSelected = rows.some((r) => selected.has(r.id));

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const togglePage = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (rows.every((r) => next.has(r.id))) {
        rows.forEach((r) => next.delete(r.id));
      } else {
        rows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }, [rows]);

  const runBulk = useCallback(async (action: BulkAction) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkRunning(true);
    try {
      if (action === "delete") {
        const { error: err } = await supabase.from("inquiries").delete().in("id", ids);
        if (err) throw err;
        toast.success(`Deleted ${ids.length} ${ids.length === 1 ? "inquiry" : "inquiries"}.`);
      } else {
        const nextStatus: InquiryStatus = action === "approve" ? "in-progress" : "closed";
        const { error: err } = await supabase
          .from("inquiries")
          .update({ status: nextStatus, updated_at: new Date().toISOString() })
          .in("id", ids);
        if (err) throw err;
        toast.success(
          `${BULK_COPY[action].verb}d ${ids.length} ${ids.length === 1 ? "inquiry" : "inquiries"}.`,
        );
      }
      setSelected(new Set());
      setPendingAction(null);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bulk action failed";
      toast.error(msg);
    } finally {
      setBulkRunning(false);
    }
  }, [selected, load]);

  const exportCsv = useCallback(async () => {
    setExporting(true);
    try {
      let q = supabase
        .from("inquiries")
        .select(
          "id,name,email,phone,status,services,project_vision,project_details,preferred_start,budget_range,created_at,updated_at",
        );

      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      if (debouncedSearch) {
        const term = debouncedSearch.replace(/[%,]/g, " ");
        const like = `%${term}%`;
        q = q.or(
          [
            `name.ilike.${like}`,
            `email.ilike.${like}`,
            `phone.ilike.${like}`,
            `preferred_start.ilike.${like}`,
            `project_vision.ilike.${like}`,
            `project_details.ilike.${like}`,
          ].join(","),
        );
      }
      if (sort === "newest") q = q.order("created_at", { ascending: false });
      else if (sort === "oldest") q = q.order("created_at", { ascending: true });
      else q = q.order("updated_at", { ascending: false });
      q = q.limit(5000);

      const { data, error: err } = await q;
      if (err) throw err;
      const inquiries = data ?? [];
      if (inquiries.length === 0) {
        toast.message("Nothing to export.");
        return;
      }

      const ids = inquiries.map((i: any) => i.id);
      const { data: atts, error: aErr } = await supabase
        .from("inquiry_attachments")
        .select("inquiry_id, filename")
        .in("inquiry_id", ids);
      if (aErr) throw aErr;
      const attMap = new Map<string, string[]>();
      (atts ?? []).forEach((a: any) => {
        if (!a.inquiry_id) return;
        const arr = attMap.get(a.inquiry_id) ?? [];
        arr.push(a.filename);
        attMap.set(a.inquiry_id, arr);
      });

      const escape = (v: unknown) => {
        if (v === null || v === undefined) return "";
        const s = Array.isArray(v) ? v.join("; ") : String(v);
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const headers = [
        "id",
        "created_at",
        "updated_at",
        "name",
        "email",
        "phone",
        "status",
        "services",
        "budget_range",
        "preferred_start",
        "project_vision",
        "project_details",
        "attachment_count",
        "attachment_filenames",
      ];
      const lines = [headers.join(",")];
      for (const r of inquiries as any[]) {
        const files = attMap.get(r.id) ?? [];
        lines.push(
          [
            r.id,
            r.created_at,
            r.updated_at,
            r.name,
            r.email,
            r.phone,
            statusLabel(r.status as InquiryStatus),
            r.services,
            r.budget_range,
            r.preferred_start,
            r.project_vision,
            r.project_details,
            files.length,
            files,
          ]
            .map(escape)
            .join(","),
        );
      }
      const csv = "\ufeff" + lines.join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = format(new Date(), "yyyyMMdd-HHmm");
      const scope = statusFilter === "all" ? "all" : statusFilter;
      a.href = url;
      a.download = `inquiries-${scope}-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${inquiries.length} ${inquiries.length === 1 ? "inquiry" : "inquiries"}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [debouncedSearch, statusFilter, sort]);



  return (
    <Layout>
      <main className="bg-background text-foreground type-architectural min-h-screen">
        <div className="section-container max-w-[1280px] pt-28 pb-24">
          <HqNav className="mb-12" />

          <header className="mb-12 flex items-baseline gap-5">
            <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">
              HQ / 02
            </span>
            <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
            <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">
              Inquiry Inbox
            </span>
          </header>

          <div className="mb-10 grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-7 space-y-3">
              <h1 className="font-serif text-foreground/95 leading-[1.02] tracking-[-0.024em] text-[clamp(1.9rem,1.2rem+2.2vw,2.8rem)]">
                Every inquiry, one place.
              </h1>
              <p className="font-sans font-light text-foreground/55 leading-[1.7] text-[0.95rem] max-w-xl">
                Triage, status, internal notes, and an audit trail — all visible to admin and
                operations staff. Client-facing surfaces never see what's recorded here.
              </p>
            </div>
            <div className="col-span-12 md:col-span-5 flex flex-wrap gap-3 md:justify-end">
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as typeof statusFilter)}
                options={[
                  { value: "all", label: "All" },
                  ...INQUIRY_STATUSES.map((s) => ({ value: s, label: statusLabel(s) })),
                ]}
              />
              <FilterSelect
                label="Sort"
                value={sort}
                onChange={(v) => setSort(v as SortKey)}
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                  { value: "updated", label: "Recently Updated" },
                ]}
              />
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-8 flex items-center gap-4 border-b border-border/20 pb-3">
            <Search className="h-3.5 w-3.5 text-muted-foreground/45" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, location, or message…"
              className="flex-1 bg-transparent text-[13px] font-light text-foreground/85 placeholder:text-muted-foreground/35 focus:outline-none"
            />
            <button
              onClick={load}
              className="text-muted-foreground/35 hover:text-accent/80 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={exportCsv}
              disabled={exporting || loading}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 hover:text-accent/80 disabled:opacity-40 transition-colors"
              aria-label="Export filtered inquiries as CSV"
              title="Export current filter as CSV"
            >
              <Download className={`h-3.5 w-3.5 ${exporting ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">{exporting ? "Exporting…" : "Export CSV"}</span>
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">
              {String(count).padStart(3, "0")}
            </span>

          </div>

          {error && (
            <p role="alert" className="font-mono text-[11px] uppercase tracking-[0.4em] text-red-500/80 mb-6">
              Failed to load · {error}
            </p>
          )}

          {!loading && rows.length === 0 && !error && (
            <div className="py-20 flex flex-col items-center gap-4">
              <Inbox className="h-5 w-5 text-muted-foreground/20" strokeWidth={1} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/35">
                No inquiries match
              </p>
            </div>
          )}

          {/* Bulk action bar */}
          {rows.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-6 border-b border-border/[0.12] pb-3 px-2">
              <label className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/55 cursor-pointer">
                <Checkbox
                  checked={
                    allOnPageSelected
                      ? true
                      : someOnPageSelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={togglePage}
                  aria-label="Select all inquiries on this page"
                />
                <span>
                  {selected.size > 0
                    ? `${selected.size} selected`
                    : "Select all on page"}
                </span>
              </label>
              {selected.size > 0 && (
                <div className="flex flex-wrap items-center gap-5 ml-auto">
                  <button
                    type="button"
                    disabled={bulkRunning}
                    onClick={() => setPendingAction("approve")}
                    className="font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-400/85 hover:text-emerald-300 disabled:opacity-40 transition-colors"
                  >
                    Approve → In Progress
                  </button>
                  <button
                    type="button"
                    disabled={bulkRunning}
                    onClick={() => setPendingAction("complete")}
                    className="font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/70 hover:text-foreground disabled:opacity-40 transition-colors"
                  >
                    Mark complete
                  </button>
                  <button
                    type="button"
                    disabled={bulkRunning}
                    onClick={() => setPendingAction("delete")}
                    className="font-mono text-[10px] uppercase tracking-[0.35em] text-red-400/85 hover:text-red-300 disabled:opacity-40 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/45 hover:text-foreground/70 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          <ul className="divide-y divide-border/[0.08] border-t border-border/[0.12]">
            {rows.map((r) => {
              const preview = r.project_vision ?? r.project_details ?? "";
              const isChecked = selected.has(r.id);
              return (
                <li
                  key={r.id}
                  className={`grid grid-cols-12 gap-4 py-5 px-2 transition-colors duration-300 ${
                    isChecked ? "bg-accent/[0.04]" : "hover:bg-foreground/[0.015]"
                  }`}
                >
                  <div className="col-span-1 sm:col-span-1 flex items-start pt-1">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleOne(r.id)}
                      aria-label={`Select inquiry from ${r.name}`}
                    />
                  </div>
                  <button
                    onClick={() => open(r.id)}
                    className="col-span-11 text-left grid grid-cols-11 gap-4"
                  >
                    <div className="col-span-11 sm:col-span-3 font-mono uppercase text-[10px] tracking-[0.35em] text-foreground/45">
                      <div className="text-foreground/70">
                        {format(new Date(r.created_at), "dd MMM yyyy")}
                      </div>
                      <div className="text-foreground/35 mt-1 normal-case tracking-normal font-sans">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="col-span-11 sm:col-span-5 space-y-1.5">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="font-serif text-[1.05rem] leading-snug text-foreground/90">
                          {r.name}
                        </span>
                        <span className="font-sans text-[12px] text-muted-foreground/55">
                          {r.email}
                        </span>
                        {r.phone && (
                          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/45">
                            {r.phone}
                          </span>
                        )}
                      </div>
                      {preview && (
                        <p className="text-[12px] leading-relaxed font-light text-foreground/55 line-clamp-2">
                          {preview}
                        </p>
                      )}
                      {r.services && r.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {r.services.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55 px-1.5 py-0.5 border border-border/25"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-11 sm:col-span-3 flex sm:justify-end items-start">
                      <span
                        className={`font-mono text-[10px] uppercase tracking-[0.3em] ${
                          STATUS_TONE[r.status] ?? "text-foreground/55"
                        }`}
                      >
                        {statusLabel(r.status as InquiryStatus)}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>


          {/* Pagination */}
          {count > PAGE_SIZE && (
            <div className="mt-10 flex items-center justify-center gap-8 font-mono text-[10px] uppercase tracking-[0.35em]">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-foreground/70 hover:text-accent disabled:text-muted-foreground/20 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-muted-foreground/55">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="text-foreground/70 hover:text-accent disabled:text-muted-foreground/20 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>

      <InquiryDetailDrawer
        inquiryId={activeId}
        open={drawerOpen}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) load();
        }}
        onChanged={load}
      />

      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(o) => {
          if (!o && !bulkRunning) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          {pendingAction && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{BULK_COPY[pendingAction].title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {BULK_COPY[pendingAction].body(selected.size)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={bulkRunning}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={bulkRunning}
                  onClick={(e) => {
                    e.preventDefault();
                    if (pendingAction) void runBulk(pendingAction);
                  }}
                  className={
                    BULK_COPY[pendingAction].destructive
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : undefined
                  }
                >
                  {bulkRunning ? "Working…" : BULK_COPY[pendingAction].confirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
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
  options: { value: string; label: string }[];
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
          <option key={o.value} value={o.value} className="bg-background text-foreground">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
