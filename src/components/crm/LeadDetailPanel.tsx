import { useState, useCallback, useEffect } from "react";
import { CRMRecord, PIPELINE_STAGES, PipelineStage, TEAM_MEMBERS } from "./crmTypes";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  X, Phone, Mail, MapPin, DollarSign, Calendar,
  FileText, ArrowRight, CheckCircle, Zap, Lightbulb,
  Briefcase, Shield, Sparkles, Copy, Check, Send,
} from "lucide-react";
import { CommunicationTimeline } from "@/components/CommunicationTimeline";
import { scheduleLeadFollowUps } from "@/lib/autoSendScheduler";

interface Props {
  record: CRMRecord;
  onClose: () => void;
  onUpdated: () => void;
  onCreateQuote: (inquiryId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Automation prompt logic                                            */
/* ------------------------------------------------------------------ */

interface AutoPrompt {
  key: string;
  icon: typeof Zap;
  message: string;
  action?: () => void;
  actionLabel?: string;
  subtle?: boolean;
}

function getAutoPrompts(
  record: CRMRecord,
  stage: string,
  linkedQuote: any | null,
  onCreateQuote: () => void,
  onConvert: () => void,
): AutoPrompt[] {
  const prompts: AutoPrompt[] = [];

  // Qualified → suggest create quote
  if (stage === "qualified" && !linkedQuote) {
    const hasGroundLockHint =
      record.services?.some((s) => s.includes("arena") || s.includes("infrastructure") || s.includes("full-facility")) ||
      record.project_vision?.toLowerCase().includes("ground") ||
      record.project_details?.toLowerCase().includes("ground");

    prompts.push({
      key: "create-quote",
      icon: FileText,
      message: "Lead qualified — ready to create a quote.",
      action: onCreateQuote,
      actionLabel: "Create Quote",
    });

    if (hasGroundLockHint) {
      prompts.push({
        key: "groundlock-hint",
        icon: Shield,
        message: "GroundLock™ may be relevant based on project scope.",
        subtle: true,
      });
    }
  }

  // Quote sent → remind about follow-up
  if (stage === "quote_sent" && linkedQuote?.status === "sent") {
    prompts.push({
      key: "follow-up-created",
      icon: Zap,
      message: "Follow-up auto-scheduled for 3 days after quote sent.",
      subtle: true,
    });
  }

  // Won → convert to project
  if (stage === "won") {
    prompts.push({
      key: "convert-project",
      icon: Briefcase,
      message: "Quote accepted — convert to live project.",
      action: onConvert,
      actionLabel: "Convert to Project",
    });
  }

  // New → suggest qualifying
  if (stage === "new") {
    prompts.push({
      key: "qualify-hint",
      icon: Lightbulb,
      message: "Review details and move to Qualified when ready.",
      subtle: true,
    });
  }

  return prompts;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LeadDetailPanel({ record, onClose, onUpdated, onCreateQuote }: Props) {
  const [stage, setStage] = useState(record.deal_stage || "new");
  const [notes, setNotes] = useState(record.notes || "");
  const [saving, setSaving] = useState(false);
  const [linkedQuote, setLinkedQuote] = useState<any | null>(null);
  const [dealValue, setDealValue] = useState(record.deal_value?.toString() || "");
  const [probability, setProbability] = useState(record.probability?.toString() || "");
  const [aiDraft, setAiDraft] = useState<{ draft_message: string; subject_line: string } | null>(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [draftCopied, setDraftCopied] = useState(false);

  // Fetch linked quote
  useEffect(() => {
    supabase
      .from("quotes")
      .select("id, status, total, quote_number, sent_at, accepted_at, share_token")
      .eq("inquiry_id", record.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setLinkedQuote(data[0]);
      });
  }, [record.id]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const previousStage = record.deal_stage || "new";

    const { error } = await supabase
      .from("inquiries")
      .update({
        deal_stage: stage,
        notes,
        deal_value: dealValue ? parseFloat(dealValue) : null,
        probability: probability ? parseInt(probability) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", record.id);

    if (error) toast.error("Failed to save");
    else {
      // Auto-schedule lead follow-ups when moving to qualified (and no quote exists)
      if (stage === "qualified" && previousStage !== "qualified" && !linkedQuote) {
        await scheduleLeadFollowUps({
          inquiryId: record.id,
          clientName: record.name,
          clientEmail: record.email,
          clientPhone: record.phone,
        });
        toast.success("Record updated — lead follow-up sequence scheduled");
      } else {
        toast.success("Record updated");
      }
      onUpdated();
    }
    setSaving(false);
  }, [stage, notes, dealValue, probability, record.id, record.deal_stage, record.name, record.email, record.phone, linkedQuote, onUpdated]);

  const handleConvertToProject = useCallback(async () => {
    // Create job from inquiry + quote data
    const jobData: any = {
      job_name: `${record.name} — ${record.services?.[0] || "Project"}`,
      client_name: record.name,
      location: record.project_details || null,
      revenue: linkedQuote?.total || 0,
      estimated_cost: 0,
      status: "pre_start",
      notes: `Converted from inquiry. ${record.project_vision || ""}`.trim(),
    };

    const { error: jobError } = await supabase.from("jobs").insert(jobData);
    if (jobError) {
      toast.error("Failed to create project");
      return;
    }

    // Move inquiry to live_project
    await supabase
      .from("inquiries")
      .update({ deal_stage: "live_project", updated_at: new Date().toISOString() })
      .eq("id", record.id);

    toast.success("Converted to live project");
    onUpdated();
  }, [record, linkedQuote, onUpdated]);

  const daysSinceCreated = differenceInDays(new Date(), new Date(record.created_at));

  // Automation prompts
  const autoPrompts = getAutoPrompts(
    record,
    stage,
    linkedQuote,
    () => onCreateQuote(record.id),
    handleConvertToProject,
  );

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

          {/* ═══ AUTOMATION PROMPTS ═══ */}
          {autoPrompts.length > 0 && (
            <section className="space-y-2">
              {autoPrompts.map((prompt) => (
                <div
                  key={prompt.key}
                  className={`flex items-start gap-3 p-3 rounded-sm border transition-all ${
                    prompt.subtle
                      ? "border-border/20 bg-muted/20"
                      : "border-accent/20 bg-accent/[0.03]"
                  }`}
                >
                  <prompt.icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                    prompt.subtle ? "text-muted-foreground/40" : "text-accent/60"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] leading-relaxed ${
                      prompt.subtle ? "text-muted-foreground/60" : "text-foreground/70"
                    }`}>
                      {prompt.message}
                    </p>
                    {prompt.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={prompt.action}
                        className="mt-1.5 h-7 px-3 text-[10px] uppercase tracking-wider text-accent hover:text-accent/80 hover:bg-accent/5 -ml-3"
                      >
                        <ArrowRight className="h-3 w-3 mr-1.5" />
                        {prompt.actionLabel}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

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

          {/* ═══ LINKED QUOTE ═══ */}
          {linkedQuote && (
            <section>
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-accent/40 mb-3">Linked Quote</p>
              <div className="p-3 rounded-sm border border-border/20 bg-background/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-foreground/70">{linkedQuote.quote_number}</span>
                  <Badge variant="outline" className="text-[8px] uppercase tracking-wider h-4 px-1.5 border-accent/20 text-accent/60">
                    {linkedQuote.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground/50">
                  ${linkedQuote.total?.toLocaleString("en-AU") || "0"}
                  {linkedQuote.sent_at && ` · Sent ${format(new Date(linkedQuote.sent_at), "d MMM")}`}
                </p>
              </div>
            </section>
          )}

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
              <div>
                <p className="text-[10px] text-muted-foreground/40 mb-1">Deal Value</p>
                <Input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="0"
                  className="h-8 text-[12px] bg-background/60 border-border/30"
                />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/40 mb-1">Probability %</p>
                <Input
                  type="number"
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="h-8 text-[12px] bg-background/60 border-border/30"
                />
              </div>
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

          {/* ═══ COMMUNICATION TIMELINE ═══ */}
          <section>
            <CommunicationTimeline
              entityType={linkedQuote ? "quote" : "lead"}
              entityId={linkedQuote ? linkedQuote.id : record.id}
              clientName={record.name}
            />
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

            {!linkedQuote && (
              <Button
                variant="outline"
                onClick={() => onCreateQuote(record.id)}
                className="w-full text-[11px] uppercase tracking-[0.12em] border-accent/20 text-accent hover:bg-accent/5"
              >
                <FileText className="h-3.5 w-3.5 mr-2" />
                Create Quote
              </Button>
            )}

            {stage === "won" && (
              <Button
                variant="outline"
                onClick={handleConvertToProject}
                className="w-full text-[11px] uppercase tracking-[0.12em] border-emerald-500/20 text-emerald-600 hover:bg-emerald-50/50"
              >
                <Briefcase className="h-3.5 w-3.5 mr-2" />
                Convert to Live Project
              </Button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
