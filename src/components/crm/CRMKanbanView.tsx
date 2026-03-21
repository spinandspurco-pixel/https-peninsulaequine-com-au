import { CRMRecord, PIPELINE_STAGES, PipelineStage } from "./crmTypes";
import { format } from "date-fns";
import { DollarSign } from "lucide-react";

interface Props {
  records: CRMRecord[];
  onSelectRecord: (record: CRMRecord) => void;
  onMoveRecord: (id: string, stage: PipelineStage) => void;
}

export function CRMKanbanView({ records, onSelectRecord, onMoveRecord }: Props) {
  const getRecordsForStage = (stage: string) =>
    records.filter((r) => (r.deal_stage || "new") === stage);

  // Only show stages that have records, plus always show first 6
  const visibleStages = PIPELINE_STAGES.filter(
    (s, i) => i < 6 || getRecordsForStage(s.key).length > 0
  );

  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4">
      <div className="flex gap-3" style={{ minWidth: `${visibleStages.length * 220}px` }}>
        {visibleStages.map((stage) => {
          const stageRecords = getRecordsForStage(stage.key);
          return (
            <div
              key={stage.key}
              className="flex-1 min-w-[200px] max-w-[260px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/plain");
                if (id) onMoveRecord(id, stage.key);
              }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted-foreground/60">
                  {stage.shortLabel}
                </p>
                <span className="text-[10px] font-mono text-muted-foreground/30">
                  {stageRecords.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[120px]">
                {stageRecords.map((record) => (
                  <div
                    key={record.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", record.id)}
                    onClick={() => onSelectRecord(record)}
                    className="p-3.5 bg-card/90 border border-border/30 cursor-pointer
                      hover:border-accent/20 transition-all duration-200
                      active:scale-[0.98]"
                  >
                    <p className="text-[12px] font-medium text-foreground/80 mb-1 truncate">
                      {record.name}
                    </p>
                    {record.project_vision && (
                      <p className="text-[10px] text-muted-foreground/40 truncate mb-2">
                        {record.project_vision}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-sans text-muted-foreground/30">
                        {format(new Date(record.created_at), "d MMM")}
                      </span>
                      {record.deal_value ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-accent/60 tabular-nums">
                          <DollarSign className="h-2.5 w-2.5" />
                          {(record.deal_value / 1000).toFixed(0)}k
                        </span>
                      ) : null}
                    </div>
                    {record.lead_tier && record.lead_tier !== "standard" && (
                      <div className="mt-2">
                        <span className="text-[8px] font-sans uppercase tracking-[0.15em] text-accent/50 bg-accent/5 px-1.5 py-0.5">
                          {record.lead_tier}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {stageRecords.length === 0 && (
                  <div className="h-20 border border-dashed border-border/20 flex items-center justify-center">
                    <p className="text-[10px] text-muted-foreground/20">No records</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
