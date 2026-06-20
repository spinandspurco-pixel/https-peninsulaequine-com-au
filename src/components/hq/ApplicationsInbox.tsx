import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHqMode } from "@/hooks/useHqMode";
import { WriteGuard } from "./WriteGuard";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  services: string[];
  project_details: string | null;
  project_vision: string | null;
  budget_range: string | null;
  preferred_start: string | null;
  lead_tier: string | null;
  lead_tags: string[] | null;
  deal_stage: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const FILTER_GROUPS = {
  type: ["All", "Full Facility", "Arena", "Stables", "Infrastructure"],
  tier: ["All", "Premium", "High", "Standard"],
  stage: ["All", "New", "Qualified", "Scope Review", "Won", "Closed"],
} as const;

function classifyType(services: string[]): string {
  if (services.includes("full-facility") || services.includes("whole-property")) return "Full Facility";
  if (services.some((s) => s.includes("arena"))) return "Arena";
  if (services.some((s) => s.includes("stable") || s.includes("barn"))) return "Stables";
  return "Infrastructure";
}

function stageLabel(stage: string | null): string {
  if (!stage) return "New";
  return stage
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function ApplicationsInbox() {
  const { isPreview } = useHqMode();
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [filterType, setFilterType] = useState<string>("All");
  const [filterTier, setFilterTier] = useState<string>("All");
  const [filterStage, setFilterStage] = useState<string>("All");
  const [notesDraft, setNotesDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(80)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("[ApplicationsInbox]", error);
          setRows([]);
        } else {
          // Applications = inquiries marked as full-build or whole-property tier
          const apps = (data ?? []).filter(
            (i: any) =>
              i.services?.some((s: string) =>
                ["full-facility", "whole-property"].includes(s)
              ) || i.lead_tags?.includes("full-build")
          );
          setRows(apps as Application[]);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterType !== "All" && classifyType(r.services) !== filterType) return false;
      if (filterTier !== "All" && (r.lead_tier ?? "standard").toLowerCase() !== filterTier.toLowerCase())
        return false;
      if (filterStage !== "All") {
        const stage = stageLabel(r.deal_stage);
        if (stage !== filterStage) return false;
      }
      return true;
    });
  }, [rows, filterType, filterTier, filterStage]);

  const openRow = (row: Application) => {
    setSelected(row);
    setNotesDraft(row.notes ?? "");
  };

  const scoreApplication = async (verdict: "good_fit" | "review" | "not_aligned") => {
    if (!selected) return;
    const tagMap = {
      good_fit: { tier: "premium", stage: "qualified" },
      review: { tier: selected.lead_tier ?? "standard", stage: "scope_review" },
      not_aligned: { tier: "standard", stage: "closed" },
    } as const;
    const update = tagMap[verdict];
    const { error } = await supabase
      .from("inquiries")
      .update({
        lead_tier: update.tier,
        deal_stage: update.stage,
        notes: notesDraft || selected.notes,
      })
      .eq("id", selected.id);
    if (error) {
      toast.error("Could not save verdict");
      return;
    }
    toast.success(`Marked: ${verdict.replace("_", " ")}`);
    setRows((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? { ...r, lead_tier: update.tier, deal_stage: update.stage, notes: notesDraft }
          : r
      )
    );
    setSelected(null);
  };

  const convertToProject = async () => {
    if (!selected) return;
    const code = `PE-AP-${selected.id.slice(0, 4).toUpperCase()}`;
    const { error } = await supabase.from("managed_projects").insert({
      code,
      name: `${selected.name} — ${classifyType(selected.services)}`,
      location: "TBC",
      build_type: classifyType(selected.services),
      status: "in_progress",
      priority: selected.lead_tier === "premium" ? "flagship" : "standard",
      scope: selected.project_details ?? selected.project_vision,
      internal_notes: notesDraft || selected.notes,
      next_action: "Scope confirmation call",
      last_update: "Converted from application",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("inquiries").update({ deal_stage: "won", notes: notesDraft }).eq("id", selected.id);
    toast.success(`Project ${code} created`);
    setSelected(null);
  };

  return (
    <div className="space-y-10">
      {/* Filter bar */}
      <div className="space-y-4">
        {[
          { label: "Type", values: FILTER_GROUPS.type, current: filterType, setter: setFilterType },
          { label: "Tier", values: FILTER_GROUPS.tier, current: filterTier, setter: setFilterTier },
          { label: "Stage", values: FILTER_GROUPS.stage, current: filterStage, setter: setFilterStage },
        ].map((group) => (
          <div key={group.label} className="flex items-center gap-6 flex-wrap">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 w-12">
              {group.label}
            </span>
            {group.values.map((v) => (
              <button
                key={v}
                onClick={() => group.setter(v)}
                className={`text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  group.current === v
                    ? "text-foreground"
                    : "text-muted-foreground/45 hover:text-foreground/70"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* List */}
      <div>
        {loading ? (
          <p className="text-[12px] text-muted-foreground/45 italic">Loading applications…</p>
        ) : filtered.length === 0 ? (
          <p className="text-[12px] text-muted-foreground/45 italic">
            No applications matching current filters.
          </p>
        ) : (
          <ul className="divide-y divide-border/10">
            {filtered.map((row) => (
              <li key={row.id}>
                <button
                  onClick={() => openRow(row)}
                  className="w-full text-left py-5 px-1 grid grid-cols-12 gap-4 items-baseline hover:bg-muted/10 transition-colors"
                >
                  <span className="col-span-12 sm:col-span-1 font-mono text-[10px] uppercase tracking-[0.22em] text-accent/45">
                    {row.id.slice(0, 6)}
                  </span>
                  <span className="col-span-6 sm:col-span-3 font-serif text-[15px] text-foreground/90">
                    {row.name}
                  </span>
                  <span className="col-span-6 sm:col-span-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground/55">
                    {classifyType(row.services)}
                  </span>
                  <span className="col-span-6 sm:col-span-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground/45">
                    {row.lead_tier ?? "standard"}
                  </span>
                  <span className="col-span-6 sm:col-span-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground/45">
                    {stageLabel(row.deal_stage)}
                  </span>
                  <span className="col-span-12 sm:col-span-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/40 sm:text-right">
                    {formatDistanceToNow(new Date(row.updated_at), { addSuffix: true })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl bg-background border-l border-accent/20 overflow-y-auto"
        >
          {selected && (
            <>
              <SheetHeader>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/50 mb-2">
                  Application · {selected.id.slice(0, 6)}
                </p>
                <SheetTitle className="font-serif text-2xl font-light">
                  {selected.name}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 space-y-8">
                <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-[12px]">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/40">
                    Type
                  </dt>
                  <dd className="text-foreground/85">{classifyType(selected.services)}</dd>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/40">
                    Email
                  </dt>
                  <dd className="text-foreground/85 break-all">{selected.email}</dd>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/40">
                    Phone
                  </dt>
                  <dd className="text-foreground/85">{selected.phone ?? "—"}</dd>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/40">
                    Budget
                  </dt>
                  <dd className="text-foreground/85">{selected.budget_range ?? "—"}</dd>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/40">
                    Start
                  </dt>
                  <dd className="text-foreground/85">{selected.preferred_start ?? "—"}</dd>
                </dl>

                {selected.project_vision && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/40 mb-2">
                      Vision
                    </p>
                    <p className="text-[13px] text-foreground/80 leading-relaxed">
                      {selected.project_vision}
                    </p>
                  </div>
                )}

                {selected.project_details && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/40 mb-2">
                      Details
                    </p>
                    <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {selected.project_details}
                    </p>
                  </div>
                )}

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/40 mb-2">
                    Internal notes
                  </p>
                  <WriteGuard>
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      rows={4}
                      className="w-full bg-transparent border border-border/30 px-3 py-2 text-[13px] text-foreground/85 focus:border-accent/40 focus:outline-none transition-colors"
                      placeholder="Add a private note…"
                    />
                  </WriteGuard>
                </div>

                <div className="border-t border-border/10 pt-6 space-y-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/40">
                    Verdict
                  </p>
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {[
                      { label: "Good fit", v: "good_fit" as const },
                      { label: "Needs review", v: "review" as const },
                      { label: "Not aligned", v: "not_aligned" as const },
                    ].map((b) => (
                      <WriteGuard key={b.v}>
                        <button
                          onClick={() => scoreApplication(b.v)}
                          disabled={isPreview}
                          className="text-[11px] uppercase tracking-[0.2em] text-foreground/75 hover:text-foreground transition-colors"
                        >
                          {b.label} →
                        </button>
                      </WriteGuard>
                    ))}
                  </div>
                  <WriteGuard>
                    <button
                      onClick={convertToProject}
                      disabled={isPreview}
                      className="mt-4 text-[11px] uppercase tracking-[0.22em] text-accent/80 hover:text-accent transition-colors"
                    >
                      Convert to project →
                    </button>
                  </WriteGuard>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
