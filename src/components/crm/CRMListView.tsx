import { CRMRecord, PIPELINE_STAGES, PipelineStage } from "./crmTypes";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ChevronRight } from "lucide-react";

interface Props {
  records: CRMRecord[];
  stageFilter: string;
  searchTerm: string;
  onSelectRecord: (record: CRMRecord) => void;
}

export function CRMListView({ records, stageFilter, searchTerm, onSelectRecord }: Props) {
  const filtered = records.filter((r) => {
    const matchesStage = stageFilter === "all" || (r.deal_stage || "new") === stageFilter;
    const matchesSearch =
      !searchTerm ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesStage && matchesSearch;
  });

  const getStageLabel = (key: string) =>
    PIPELINE_STAGES.find((s) => s.key === key)?.shortLabel || key;

  return (
    <div className="space-y-1.5">
      {/* Header row */}
      <div className="grid grid-cols-12 gap-3 px-4 py-2">
        <p className="col-span-3 text-[10px] font-sans uppercase tracking-[0.15em] text-muted-foreground/50">Client</p>
        <p className="col-span-2 text-[10px] font-sans uppercase tracking-[0.15em] text-muted-foreground/50">Type</p>
        <p className="col-span-2 text-[10px] font-sans uppercase tracking-[0.15em] text-muted-foreground/50">Stage</p>
        <p className="col-span-2 text-[10px] font-sans uppercase tracking-[0.15em] text-muted-foreground/50">Value</p>
        <p className="col-span-2 text-[10px] font-sans uppercase tracking-[0.15em] text-muted-foreground/50">Next Action</p>
        <p className="col-span-1" />
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[13px] text-muted-foreground/30">No records match your filters</p>
        </div>
      ) : (
        filtered.map((record) => (
          <div
            key={record.id}
            onClick={() => onSelectRecord(record)}
            className="grid grid-cols-12 gap-3 px-4 py-3.5 bg-card/60 border border-border/20
              hover:border-accent/15 cursor-pointer transition-all duration-200 items-center"
          >
            {/* Client */}
            <div className="col-span-3">
              <p className="text-[13px] font-medium text-foreground/80 truncate">{record.name}</p>
              <p className="text-[10px] text-muted-foreground/35 truncate">{record.email}</p>
            </div>

            {/* Type */}
            <div className="col-span-2">
              <p className="text-[11px] text-muted-foreground/50 truncate">
                {record.preferred_service || record.services?.[0] || "—"}
              </p>
            </div>

            {/* Stage */}
            <div className="col-span-2">
              <span className="text-[9px] font-sans uppercase tracking-[0.12em] text-accent/60 bg-accent/5 px-2 py-0.5 inline-block">
                {getStageLabel(record.deal_stage || "new")}
              </span>
            </div>

            {/* Value */}
            <div className="col-span-2">
              {record.deal_value ? (
                <span className="flex items-center gap-0.5 text-[12px] text-foreground/60 tabular-nums">
                  <DollarSign className="h-3 w-3 text-accent/40" />
                  {record.deal_value.toLocaleString("en-AU")}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground/20">—</span>
              )}
            </div>

            {/* Next action */}
            <div className="col-span-2">
              {record.next_follow_up_at ? (
                <p className="text-[10px] text-muted-foreground/40">
                  {format(new Date(record.next_follow_up_at), "d MMM")}
                </p>
              ) : (
                <span className="text-[11px] text-muted-foreground/20">—</span>
              )}
            </div>

            {/* Arrow */}
            <div className="col-span-1 text-right">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/20 inline-block" />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
