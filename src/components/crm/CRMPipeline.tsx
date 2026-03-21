import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CRMRecord, PIPELINE_STAGES, PipelineStage } from "./crmTypes";
import { CRMSummaryCards } from "./CRMSummaryCards";
import { CRMKanbanView } from "./CRMKanbanView";
import { CRMListView } from "./CRMListView";
import { LeadDetailPanel } from "./LeadDetailPanel";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, LayoutGrid, List, RefreshCw } from "lucide-react";

interface Props {
  onCreateQuote: (inquiryId: string) => void;
}

type ViewMode = "kanban" | "list";

export function CRMPipeline({ onCreateQuote }: Props) {
  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [quotes, setQuotes] = useState<{ status: string; accepted_at: string | null }[]>([]);
  const [followUps, setFollowUps] = useState<{ status: string; due_date: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<CRMRecord | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [inquiryRes, quoteRes, followUpRes] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("quotes").select("status, accepted_at"),
      supabase.from("quote_follow_ups").select("status, due_date"),
    ]);

    if (inquiryRes.data) setRecords(inquiryRes.data as unknown as CRMRecord[]);
    if (quoteRes.data) setQuotes(quoteRes.data);
    if (followUpRes.data) setFollowUps(followUpRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMoveRecord = useCallback(
    async (id: string, newStage: PipelineStage) => {
      // Optimistic update
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, deal_stage: newStage } : r))
      );

      const { error } = await supabase
        .from("inquiries")
        .update({ deal_stage: newStage, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        toast.error("Failed to move record");
        fetchData();
      }
    },
    [fetchData]
  );

  const handleRecordUpdated = useCallback(() => {
    fetchData();
    setSelectedRecord(null);
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <CRMSummaryCards records={records} quotes={quotes} followUps={followUps} />

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
            <Input
              placeholder="Search client or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 bg-card/60 border-border/30 text-[12px]"
            />
          </div>
          {viewMode === "list" && (
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[160px] h-9 bg-card/60 border-border/30 text-[11px]">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[11px]">All Stages</SelectItem>
                {PIPELINE_STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key} className="text-[11px]">{s.shortLabel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 hover:bg-muted/50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground/40 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* View toggle */}
          <div className="flex border border-border/30 bg-card/60">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 transition-colors ${
                viewMode === "kanban"
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground/40 hover:text-muted-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground/40 hover:text-muted-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline label */}
      <div>
        <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-accent/40 mb-4">Pipeline</p>
      </div>

      {/* View */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-accent/40" />
        </div>
      ) : viewMode === "kanban" ? (
        <CRMKanbanView
          records={records.filter((r) =>
            !searchTerm ||
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          onSelectRecord={setSelectedRecord}
          onMoveRecord={handleMoveRecord}
        />
      ) : (
        <CRMListView
          records={records}
          stageFilter={stageFilter}
          searchTerm={searchTerm}
          onSelectRecord={setSelectedRecord}
        />
      )}

      {/* Detail panel */}
      {selectedRecord && (
        <LeadDetailPanel
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdated={handleRecordUpdated}
          onCreateQuote={onCreateQuote}
        />
      )}
    </div>
  );
}
