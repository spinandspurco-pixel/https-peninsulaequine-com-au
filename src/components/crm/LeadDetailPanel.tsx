import { useState, useCallback } from "react";
import { CRMRecord, PIPELINE_STAGES, PipelineStage, TEAM_MEMBERS } from "./crmTypes";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  X, Phone, Mail, MapPin, DollarSign, Calendar,
  FileText, ChevronRight, ArrowRight, CheckCircle, AlertTriangle,
} from "lucide-react";

interface Props {
  record: CRMRecord;
  onClose: () => void;
  onUpdated: () => void;
  onCreateQuote: (inquiryId: string) => void;
}

export function LeadDetailPanel({ record, onClose, onUpdated, onCreateQuote }: Props) {
  const [stage, setStage] = useState(record.deal_stage || "new");
  const [notes, setNotes] = useState(record.notes || "");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const { error } = await supabase
      .from("inquiries")
      .update({
        deal_stage: stage,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", record.id);

    if (error) toast.error("Failed to save");
    else {
      toast.success("Record updated");
      onUpdated();
    }
    setSaving(false);
  }, [stage, notes, record.id, onUpdated]);

  const daysSinceCreated = differenceInDays(new Date(), new Date(record.created_at));
  const stageLabel = PIPELINE_STAGES.find((s) => s.key === stage)?.label || stage;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-xl bg-card border-l border-border/30 overflow-y-auto animate-in slide-in-from-right-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border/20 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-accent/50 mb-0.5">
              Lead Record
            </p>
            <h2 className="font-serif text-xl text-foreground/90">{record.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted/50 transition-colors">
            <X className="h-4 w-4 text-muted-foreground/50" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* ═══ CLIENT DETAILS ═══ */}
          <section>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-accent/40 mb-4">Client Details</p>
            <div className="space-y-2.5">
              {record.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground/30" />
                  <a href={`tel:${record.phone}`} className="text-[13px] text-foreground/70 hover:text-accent transition-colors">
                    {record.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground/30" />
                <a href={`mailto:${record.email}`} className="text-[13px] text-foreground/70 hover:text-accent transition-colors">
                  {record.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/30" />
                <p className="text-[12px] text-muted-foreground/50">
                  Enquired {format(new Date(record.created_at), "d MMMM yyyy")} · {daysSinceCreated}d ago
                </p>
              </div>
            </div>
          </section>

          {/* ═══ PROJECT SNAPSHOT ═══ */}
          <section>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-accent/40 mb-4">Project Snapshot</p>
            <div className="space-y-3">
              {record.services.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground/40 mb-1.5">Services</p>
                  <div className="flex flex-wrap gap-1.5">
                    {record.services.map((s) => (
                      <span key={s} className="text-[10px] text-muted-foreground/50 bg-muted/30 px-2 py-0.5">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {record.project_vision && (
                <div>
                  <p className="text-[10px] text-muted-foreground/40 mb-1">Vision</p>
                  <p className="text-[13px] text-foreground/60 leading-[1.8]">{record.project_vision}</p>
                </div>
              )}
              {record.project_details && (
                <div>
                  <p className="text-[10px] text-muted-foreground/40 mb-1">Details</p>
                  <p className="text-[12px] text-muted-foreground/50 leading-[1.8]">{record.project_details}</p>
                </div>
              )}
            </div>
          </section>

          {/* ═══ QUALIFICATION ═══ */}
          <section>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-accent/40 mb-4">Qualification</p>
            <div className="grid grid-cols-2 gap-4">
              {record.budget_range && (
                <div>
                  <p className="text-[10px] text-muted-foreground/40 mb-0.5">Budget Range</p>
                  <p className="text-[13px] font-medium text-foreground/70">{record.budget_range}</p>
                </div>
              )}
              {record.preferred_start && (
                <div>
                  <p className="text-[10px] text-muted-foreground/40 mb-0.5">Timeline</p>
                  <p className="text-[13px] text-foreground/70">{record.preferred_start}</p>
                </div>
              )}
              {record.lead_tier && (
                <div>
                  <p className="text-[10px] text-muted-foreground/40 mb-0.5">Lead Tier</p>
                  <span className="text-[10px] font-sans uppercase tracking-[0.12em] text-accent/60 bg-accent/5 px-2 py-0.5">
                    {record.lead_tier}
                  </span>
                </div>
              )}
              {record.deal_value != null && record.deal_value > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground/40 mb-0.5">Deal Value</p>
                  <p className="text-[13px] font-medium text-foreground/70 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-accent/40" />
                    {record.deal_value.toLocaleString("en-AU")}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ═══ PIPELINE STAGE ═══ */}
          <section>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-accent/40 mb-4">Pipeline Stage</p>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="bg-background/60 border-border/40 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key} className="text-[12px]">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          {/* ═══ INTERNAL NOTES ═══ */}
          <section>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-accent/40 mb-3">Internal Notes</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add team-only notes…"
              className="bg-background/60 border-border/40 text-[13px] min-h-[80px]"
            />
          </section>

          {/* ═══ ACTIONS ═══ */}
          <section className="border-t border-border/20 pt-6 space-y-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full text-[11px] uppercase tracking-[0.12em]"
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>

            <Button
              variant="outline"
              onClick={() => onCreateQuote(record.id)}
              className="w-full text-[11px] uppercase tracking-[0.12em] border-accent/20 text-accent hover:bg-accent/5"
            >
              <FileText className="h-3.5 w-3.5 mr-2" />
              Create Quote
            </Button>

            {stage === "won" && (
              <Button
                variant="outline"
                onClick={async () => {
                  const { error } = await supabase
                    .from("inquiries")
                    .update({ deal_stage: "live_project", updated_at: new Date().toISOString() })
                    .eq("id", record.id);
                  if (!error) {
                    toast.success("Converted to live project");
                    onUpdated();
                  }
                }}
                className="w-full text-[11px] uppercase tracking-[0.12em] border-emerald-500/20 text-emerald-600 hover:bg-emerald-50/50"
              >
                <ArrowRight className="h-3.5 w-3.5 mr-2" />
                Convert to Live Project
              </Button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
