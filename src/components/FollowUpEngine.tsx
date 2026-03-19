import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  Clock, Mail, Phone, CheckCircle, Pause, RefreshCw,
  AlertTriangle, ArrowRight, Bot, Send, Eye, Zap,
  ChevronDown, ChevronUp, DollarSign, Settings,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FollowUpItem {
  id: string;
  entity_type: "lead" | "quote";
  entity_id: string;
  stage: string;
  draft_message: string;
  subject_line: string | null;
  client_name: string;
  client_email: string;
  project_ref: string | null;
  deal_value: number | null;
  status: string;
  snoozed_until: string | null;
  created_at: string;
}

interface InquiryFollowUp {
  id: string;
  name: string;
  email: string;
  status: string;
  lead_tier: string | null;
  deal_value: number | null;
  last_contact_at: string | null;
  follow_up_stage: string;
  next_follow_up_at: string | null;
  follow_up_status: string;
  created_at: string;
  services: string[];
  project_vision: string | null;
}

interface QuoteFollowUp {
  id: string;
  quote_number: string;
  client_name: string;
  client_email: string | null;
  total: number;
  status: string;
  sent_at: string | null;
  viewed_at: string | null;
  project_type: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STAGE_LABELS: Record<string, string> = {
  none: "No Follow-Up",
  "1": "Follow-Up 1",
  "2": "Follow-Up 2",
  "3": "Follow-Up 3",
  final: "Final Follow-Up",
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  due: { bg: "bg-accent/10 border-accent/30", text: "text-accent" },
  overdue: { bg: "bg-destructive/10 border-destructive/30", text: "text-destructive" },
  pending: { bg: "bg-muted/30 border-border/30", text: "text-muted-foreground" },
  completed: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-500" },
  stopped: { bg: "bg-muted/20 border-border/20", text: "text-muted-foreground/50" },
};

const daysSince = (date: string | null): number | null => {
  if (!date) return null;
  return differenceInDays(new Date(), parseISO(date));
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FollowUpEngine() {
  const [drafts, setDrafts] = useState<FollowUpItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryFollowUp[]>([]);
  const [quotes, setQuotes] = useState<QuoteFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<Record<string, string>>({});
  const [showSettings, setShowSettings] = useState(false);

  // Timing thresholds (defaults)
  const [timing, setTiming] = useState({
    lead_day_1: 2, lead_day_2: 5, lead_day_3: 10,
    quote_day_1: 2, quote_day_2: 5, quote_day_3: 10,
  });
  // Toggles
  const [toggles, setToggles] = useState({
    follow_up_leads: true, follow_up_quotes: true,
    follow_up_lead_day_1: true, follow_up_lead_day_2: true, follow_up_lead_day_3: true,
    follow_up_quote_day_1: true, follow_up_quote_day_2: true, follow_up_quote_day_3: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [draftsRes, inquiriesRes, quotesRes, timingRes, toggleRes] = await Promise.all([
      supabase
        .from("follow_up_drafts")
        .select("*")
        .in("status", ["pending", "approved"])
        .order("created_at", { ascending: false }),
      supabase
        .from("inquiries")
        .select("id, name, email, status, lead_tier, deal_value, last_contact_at, follow_up_stage, next_follow_up_at, follow_up_status, created_at, services, project_vision")
        .in("follow_up_status", ["pending", "due", "overdue"])
        .neq("status", "archived")
        .order("next_follow_up_at", { ascending: true }),
      supabase
        .from("quotes")
        .select("id, quote_number, client_name, client_email, total, status, sent_at, viewed_at, project_type")
        .eq("status", "sent")
        .order("sent_at", { ascending: true }),
      supabase
        .from("integration_settings")
        .select("key, value")
        .like("key", "follow_up_%"),
      supabase
        .from("automation_settings")
        .select("setting_key, enabled")
        .eq("category", "follow_ups"),
    ]);

    if (draftsRes.data) setDrafts(draftsRes.data as unknown as FollowUpItem[]);
    if (inquiriesRes.data) setInquiries(inquiriesRes.data as unknown as InquiryFollowUp[]);
    if (quotesRes.data) setQuotes(quotesRes.data as unknown as QuoteFollowUp[]);

    // Parse timing settings
    if (timingRes.data) {
      const t = { ...timing };
      timingRes.data.forEach((row: { key: string; value: string }) => {
        const k = row.key.replace("follow_up_", "") as keyof typeof t;
        if (k in t) t[k] = parseInt(row.value, 10) || t[k];
      });
      setTiming(t);
    }

    // Parse toggles
    if (toggleRes.data) {
      const tg = { ...toggles };
      toggleRes.data.forEach((row: { setting_key: string; enabled: boolean }) => {
        if (row.setting_key in tg) (tg as any)[row.setting_key] = row.enabled;
      });
      setToggles(tg);
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* -- Compute follow-up candidates using dynamic thresholds -- */
  /* -- Max 3 follow-ups: stage "3" or "final" = capped, no more prompts -- */
  const MAX_FOLLOW_UP_STAGE = "3";

  const dueLeads = toggles.follow_up_leads ? inquiries.filter(i => {
    if (i.follow_up_status === "stopped" || i.follow_up_status === "completed") return false;
    // Cap at stage 3 — no further prompts unless manually extended
    if (["3", "final"].includes(i.follow_up_stage)) return false;
    const contactDate = i.last_contact_at || i.created_at;
    const days = daysSince(contactDate);
    if (days === null) return false;
    if (i.follow_up_stage === "none" && toggles.follow_up_lead_day_1 && days >= timing.lead_day_1) return true;
    if (i.follow_up_stage === "1" && toggles.follow_up_lead_day_2 && days >= timing.lead_day_2) return true;
    if (i.follow_up_stage === "2" && toggles.follow_up_lead_day_3 && days >= timing.lead_day_3) return true;
    return false;
  })
    // Sort: high-value first, low-intent last
    .sort((a, b) => {
      const tierOrder: Record<string, number> = { premium: 0, high: 1, standard: 2, starter: 3 };
      const aTier = tierOrder[a.lead_tier || "standard"] ?? 2;
      const bTier = tierOrder[b.lead_tier || "standard"] ?? 2;
      if (aTier !== bTier) return aTier - bTier;
      return (b.deal_value || 0) - (a.deal_value || 0);
    }) : [];

  const overdueLeads = toggles.follow_up_leads ? inquiries.filter(i => {
    const contactDate = i.last_contact_at || i.created_at;
    const days = daysSince(contactDate);
    return days !== null && days >= timing.lead_day_3
      && !["3", "final"].includes(i.follow_up_stage)
      && i.follow_up_status !== "stopped" && i.follow_up_status !== "completed";
  })
    .sort((a, b) => (b.deal_value || 0) - (a.deal_value || 0)) : [];

  // Leads that have exhausted all 3 follow-ups (for display)
  const cappedLeads = inquiries.filter(i =>
    ["3", "final"].includes(i.follow_up_stage)
    && i.follow_up_status !== "stopped" && i.follow_up_status !== "completed"
  );

  const dueQuotes = toggles.follow_up_quotes ? quotes
    .filter(q => {
      if (!q.sent_at) return false;
      const days = daysSince(q.sent_at);
      return days !== null && days >= timing.quote_day_1;
    })
    .sort((a, b) => b.total - a.total) : [];

  const highValueItems = [
    ...dueLeads.filter(l => l.deal_value && l.deal_value >= 50000),
    ...dueQuotes.filter(q => q.total >= 50000),
  ];

  /* -- Generate AI draft with duplicate + cap guard -- */
  const generateDraft = async (entityType: "lead" | "quote", entityId: string, clientName: string, clientEmail: string, context: Record<string, unknown>) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-follow-up-draft", {
        body: { entity_type: entityType, entity_id: entityId, client_name: clientName, client_email: clientEmail, context },
      });
      if (error) {
        // Parse edge function error message
        const errMsg = typeof error === "object" && error.message ? error.message : String(error);
        if (errMsg.includes("Maximum 3")) {
          toast.error("Maximum 3 follow-ups reached for this lead.");
        } else if (errMsg.includes("draft already exists")) {
          toast.error("A draft already exists for this follow-up stage.");
        } else {
          throw error;
        }
        setGenerating(false);
        return;
      }
      toast.success("Draft generated");
      fetchData();
    } catch {
      toast.error("Failed to generate draft");
    }
    setGenerating(false);
  };

  /* -- Actions -- */
  const approveDraft = async (id: string) => {
    const message = editingMessage[id];
    const updates: Record<string, unknown> = { status: "approved", approved_at: new Date().toISOString() };
    if (message) updates.draft_message = message;

    const { error } = await supabase.from("follow_up_drafts").update(updates).eq("id", id);
    if (error) { toast.error("Failed to approve"); return; }

    await supabase.from("activity_log").insert({
      action_type: "follow_up_approved",
      category: "communications",
      title: "Follow-up draft approved",
      description: `Approved follow-up for ${drafts.find(d => d.id === id)?.client_name}`,
      entity_id: id,
      entity_type: "follow_up_draft",
      performed_by: "admin",
    });

    toast.success("Draft approved — ready to send");
    fetchData();
  };

  const markComplete = async (entityType: "lead" | "quote", entityId: string) => {
    if (entityType === "lead") {
      await supabase.from("inquiries").update({
        follow_up_status: "completed",
        last_contact_at: new Date().toISOString(),
      }).eq("id", entityId);
    }
    await supabase.from("follow_up_drafts").update({ status: "completed" }).eq("entity_id", entityId);

    await supabase.from("activity_log").insert({
      action_type: "follow_up_completed",
      category: "communications",
      title: "Follow-up marked complete",
      entity_id: entityId,
      entity_type: entityType,
      performed_by: "admin",
    });

    toast.success("Marked complete");
    fetchData();
  };

  const snoozeDraft = async (id: string) => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + 2);

    await supabase.from("follow_up_drafts").update({
      snoozed_until: snoozeDate.toISOString(),
      status: "pending",
    }).eq("id", id);

    toast.success("Snoozed for 2 days");
    fetchData();
  };

  const stopFollowUp = async (entityId: string) => {
    await supabase.from("inquiries").update({ follow_up_status: "stopped" }).eq("id", entityId);
    await supabase.from("follow_up_drafts").update({ status: "stopped" }).eq("entity_id", entityId);

    await supabase.from("activity_log").insert({
      action_type: "follow_up_stopped",
      category: "communications",
      title: "Follow-up stopped",
      entity_id: entityId,
      entity_type: "lead",
      performed_by: "admin",
    });

    toast.success("Follow-up stopped for this lead");
    fetchData();
  };

  const totalDue = dueLeads.length + dueQuotes.length;
  const totalOverdue = overdueLeads.length;

  return (
    <Card className="bg-card/60 border-border/30" id="follow-ups">
      <CardHeader className="cursor-pointer pb-2" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent/70" />
            <CardTitle className="text-sm font-medium">Follow-Up Engine</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {totalOverdue > 0 && (
              <Badge variant="destructive" className="text-[9px]">{totalOverdue} overdue</Badge>
            )}
            {totalDue > 0 && (
              <Badge variant="outline" className="text-[9px] border-accent/30 text-accent">{totalDue} due</Badge>
            )}
            <Badge variant="outline" className="text-[9px] border-border/30">{drafts.length} drafts</Badge>
            {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground/40" /> : <ChevronDown className="h-3 w-3 text-muted-foreground/40" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-4 w-4 animate-spin text-accent/60" />
            </div>
          ) : (
            <>
              {/* ---- High-Value Follow-Ups ---- */}
              {highValueItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-accent/10">
                    <DollarSign className="h-3 w-3 text-accent/60" />
                    <p className="text-[9px] uppercase tracking-[0.15em] text-accent/70 font-medium">High-Value Follow-Ups</p>
                  </div>
                  {highValueItems.map((item) => {
                    const isLead = "email" in item;
                    const id = item.id;
                    const name = isLead ? (item as InquiryFollowUp).name : (item as QuoteFollowUp).client_name;
                    const value = isLead ? (item as InquiryFollowUp).deal_value : (item as QuoteFollowUp).total;
                    const days = isLead
                      ? daysSince((item as InquiryFollowUp).last_contact_at || (item as InquiryFollowUp).created_at)
                      : daysSince((item as QuoteFollowUp).sent_at);

                    return (
                      <div key={id} className="flex items-center justify-between py-2 px-3 rounded-sm bg-accent/5 border border-accent/10">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{name}</p>
                            <Badge variant="outline" className="text-[9px] border-accent/30 text-accent shrink-0">
                              ${(value || 0).toLocaleString()}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {isLead ? "Lead" : "Quote"} · {days}d since contact
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="gold"
                          className="h-7 text-[9px]"
                          disabled={generating}
                          onClick={() => {
                            if (isLead) {
                              const lead = item as InquiryFollowUp;
                              generateDraft("lead", lead.id, lead.name, lead.email, {
                                stage: lead.follow_up_stage,
                                tier: lead.lead_tier,
                                services: lead.services,
                                vision: lead.project_vision,
                                days_since_contact: days,
                              });
                            } else {
                              const q = item as QuoteFollowUp;
                              generateDraft("quote", q.id, q.client_name, q.client_email || "", {
                                quote_number: q.quote_number,
                                total: q.total,
                                viewed: !!q.viewed_at,
                                project_type: q.project_type,
                                days_since_sent: days,
                              });
                            }
                          }}
                        >
                          <Bot className="h-3 w-3 mr-1" />Draft
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ---- Overdue ---- */}
              {overdueLeads.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-destructive/10">
                    <AlertTriangle className="h-3 w-3 text-destructive/60" />
                    <p className="text-[9px] uppercase tracking-[0.15em] text-destructive/70 font-medium">Overdue</p>
                  </div>
                  {overdueLeads.map((lead) => (
                    <FollowUpRow
                      key={lead.id}
                      type="lead"
                      name={lead.name}
                      email={lead.email}
                      daysSince={daysSince(lead.last_contact_at || lead.created_at)}
                      stage={lead.follow_up_stage}
                      tier={lead.lead_tier}
                      value={lead.deal_value}
                      isOverdue
                      onGenerate={() => generateDraft("lead", lead.id, lead.name, lead.email, {
                        stage: lead.follow_up_stage, tier: lead.lead_tier, services: lead.services,
                        vision: lead.project_vision, days_since_contact: daysSince(lead.last_contact_at || lead.created_at),
                      })}
                      onComplete={() => markComplete("lead", lead.id)}
                      onStop={() => stopFollowUp(lead.id)}
                      generating={generating}
                    />
                  ))}
                </div>
              )}

              {/* ---- Due Today ---- */}
              {(dueLeads.length > 0 || dueQuotes.length > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-border/10">
                    <Clock className="h-3 w-3 text-muted-foreground/40" />
                    <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium">Due</p>
                  </div>
                  {dueLeads.filter(l => !overdueLeads.find(o => o.id === l.id)).map((lead) => (
                    <FollowUpRow
                      key={lead.id}
                      type="lead"
                      name={lead.name}
                      email={lead.email}
                      daysSince={daysSince(lead.last_contact_at || lead.created_at)}
                      stage={lead.follow_up_stage}
                      tier={lead.lead_tier}
                      value={lead.deal_value}
                      onGenerate={() => generateDraft("lead", lead.id, lead.name, lead.email, {
                        stage: lead.follow_up_stage, tier: lead.lead_tier, services: lead.services,
                        vision: lead.project_vision, days_since_contact: daysSince(lead.last_contact_at || lead.created_at),
                      })}
                      onComplete={() => markComplete("lead", lead.id)}
                      onStop={() => stopFollowUp(lead.id)}
                      generating={generating}
                    />
                  ))}
                  {dueQuotes.map((q) => (
                    <FollowUpRow
                      key={q.id}
                      type="quote"
                      name={q.client_name}
                      email={q.client_email || ""}
                      daysSince={daysSince(q.sent_at)}
                      stage={q.viewed_at ? "viewed" : "not_viewed"}
                      value={q.total}
                      extra={q.quote_number}
                      onGenerate={() => generateDraft("quote", q.id, q.client_name, q.client_email || "", {
                        quote_number: q.quote_number, total: q.total, viewed: !!q.viewed_at,
                        project_type: q.project_type, days_since_sent: daysSince(q.sent_at),
                      })}
                      onComplete={() => markComplete("quote", q.id)}
                      generating={generating}
                    />
                  ))}
                </div>
              )}

              {/* ---- Pending Drafts ---- */}
              {drafts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-border/10">
                    <Mail className="h-3 w-3 text-muted-foreground/40" />
                    <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium">
                      Drafts Awaiting Approval ({drafts.length})
                    </p>
                  </div>
                  {drafts.map((draft) => {
                    const isOpen = expandedDraft === draft.id;
                    return (
                      <div key={draft.id} className="border border-border/20 rounded-sm overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between py-2 px-3 hover:bg-background/30 transition-colors"
                          onClick={() => setExpandedDraft(isOpen ? null : draft.id)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="h-3 w-3 text-accent/50 shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">{draft.client_name}</span>
                            <Badge variant="outline" className="text-[9px] border-border/30 shrink-0">
                              {draft.entity_type} · {STAGE_LABELS[draft.stage] || draft.stage}
                            </Badge>
                            {draft.status === "approved" && (
                              <Badge className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shrink-0">approved</Badge>
                            )}
                          </div>
                          {isOpen ? <ChevronUp className="h-3 w-3 text-muted-foreground/40" /> : <ChevronDown className="h-3 w-3 text-muted-foreground/40" />}
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3 pt-1 space-y-3 border-t border-border/10">
                            {draft.subject_line && (
                              <p className="text-[11px] text-muted-foreground">
                                <span className="text-muted-foreground/50">Subject:</span> {draft.subject_line}
                              </p>
                            )}
                            <Textarea
                              value={editingMessage[draft.id] ?? draft.draft_message}
                              onChange={(e) => setEditingMessage(prev => ({ ...prev, [draft.id]: e.target.value }))}
                              className="text-sm bg-background/40 border-border/30 min-h-[100px]"
                            />
                            <div className="flex items-center gap-2 flex-wrap">
                              {draft.status !== "approved" && (
                                <Button size="sm" variant="gold" className="h-7 text-[9px]" onClick={() => approveDraft(draft.id)}>
                                  <CheckCircle className="h-3 w-3 mr-1" />Approve
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="h-7 text-[9px] border-border/30" onClick={() => snoozeDraft(draft.id)}>
                                <Pause className="h-3 w-3 mr-1" />Snooze 2d
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-[9px] border-border/30" onClick={() => markComplete(draft.entity_type as "lead" | "quote", draft.entity_id)}>
                                <CheckCircle className="h-3 w-3 mr-1" />Complete
                              </Button>
                              <a href={`mailto:${draft.client_email}`} className="ml-auto">
                                <Button size="sm" variant="outline" className="h-7 text-[9px] border-accent/30 text-accent">
                                  <Send className="h-3 w-3 mr-1" />Open Email
                                </Button>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ---- Capped — exhausted follow-ups ---- */}
              {cappedLeads.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-border/10">
                    <Pause className="h-3 w-3 text-muted-foreground/30" />
                    <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/40 font-medium">
                      Max Follow-Ups Reached ({cappedLeads.length})
                    </p>
                  </div>
                  {cappedLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between py-2 px-3 rounded-sm bg-muted/10 border border-border/10">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-muted-foreground">{lead.name}</p>
                          <Badge variant="outline" className="text-[8px] border-border/20 text-muted-foreground/50">3/3 sent</Badge>
                          {lead.deal_value && lead.deal_value > 0 && (
                            <span className="text-[10px] text-muted-foreground/40">${lead.deal_value.toLocaleString()}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground/40">
                          {daysSince(lead.last_contact_at || lead.created_at)}d since contact · No further auto-prompts
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <Button size="sm" variant="ghost" className="h-7 text-[9px] text-muted-foreground/40" onClick={() => markComplete("lead", lead.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />Complete
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-[9px] text-muted-foreground/40" onClick={() => stopFollowUp(lead.id)}>
                          <Pause className="h-3 w-3 mr-1" />Stop
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---- Empty state ---- */}
              {totalDue === 0 && totalOverdue === 0 && drafts.length === 0 && cappedLeads.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-6 w-6 text-emerald-500/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground/60">All follow-ups are current</p>
                  <p className="text-[10px] text-muted-foreground/30 mt-1">No leads or quotes need attention right now</p>
                </div>
              )}

              {/* ---- Footer ---- */}
              <div className="pt-2 border-t border-border/10 flex items-center justify-between">
                <p className="text-[9px] text-muted-foreground/30 uppercase tracking-wider">
                  Draft-only · All messages require approval
                </p>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-6 text-[9px] text-muted-foreground/40" onClick={() => setShowSettings(!showSettings)}>
                    <Settings className="h-3 w-3 mr-1" />Settings
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[9px] text-muted-foreground/40" onClick={fetchData}>
                    <RefreshCw className="h-3 w-3 mr-1" />Refresh
                  </Button>
                </div>
              </div>

              {/* ---- Settings Panel ---- */}
              {showSettings && (
                <FollowUpSettingsPanel
                  timing={timing}
                  toggles={toggles}
                  onTimingChange={(k, v) => setTiming(prev => ({ ...prev, [k]: v }))}
                  onToggleChange={(k, v) => setToggles(prev => ({ ...prev, [k]: v }))}
                  saving={savingSettings}
                  onSave={async () => {
                    setSavingSettings(true);
                    try {
                      // Save timing values
                      const timingUpdates = Object.entries(timing).map(([k, v]) =>
                        supabase.from("integration_settings").update({ value: String(v), updated_at: new Date().toISOString() }).eq("key", `follow_up_${k}`)
                      );
                      // Save toggles
                      const toggleUpdates = Object.entries(toggles).map(([k, v]) =>
                        supabase.from("automation_settings").update({ enabled: v, updated_at: new Date().toISOString() }).eq("setting_key", k)
                      );
                      await Promise.all([...timingUpdates, ...toggleUpdates]);
                      toast.success("Follow-up settings saved");
                    } catch {
                      toast.error("Failed to save settings");
                    }
                    setSavingSettings(false);
                  }}
                />
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Row sub-component                                                  */
/* ------------------------------------------------------------------ */

function FollowUpRow({
  type, name, email, daysSince: days, stage, tier, value, extra, isOverdue,
  onGenerate, onComplete, onStop, generating,
}: {
  type: "lead" | "quote";
  name: string;
  email: string;
  daysSince: number | null;
  stage: string;
  tier?: string | null;
  value?: number | null;
  extra?: string;
  isOverdue?: boolean;
  onGenerate: () => void;
  onComplete: () => void;
  onStop?: () => void;
  generating: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded-sm border ${isOverdue ? "bg-destructive/5 border-destructive/10" : "bg-background/20 border-border/10"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          {tier && (
            <Badge variant="outline" className="text-[9px] border-border/20 shrink-0">{tier}</Badge>
          )}
          {value && value > 0 && (
            <span className="text-[10px] text-accent/70">${value.toLocaleString()}</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          {type === "lead" ? "Lead" : "Quote"}{extra ? ` · ${extra}` : ""} · {STAGE_LABELS[stage] || stage} · {days}d ago
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <a href={`tel:${email}`}>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Phone className="h-3 w-3" /></Button>
        </a>
        <Button size="sm" variant="outline" className="h-7 text-[9px] border-border/20" disabled={generating} onClick={onGenerate}>
          <Bot className="h-3 w-3 mr-1" />Draft
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-500" onClick={onComplete}>
          <CheckCircle className="h-3 w-3" />
        </Button>
        {onStop && (
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground/40" onClick={onStop}>
            <Pause className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings sub-panel                                                 */
/* ------------------------------------------------------------------ */

function FollowUpSettingsPanel({
  timing, toggles, onTimingChange, onToggleChange, saving, onSave,
}: {
  timing: Record<string, number>;
  toggles: Record<string, boolean>;
  onTimingChange: (key: string, val: number) => void;
  onToggleChange: (key: string, val: boolean) => void;
  saving: boolean;
  onSave: () => void;
}) {
  const TIMING_ROWS = [
    { section: "Lead Follow-Ups", toggleKey: "follow_up_leads", items: [
      { label: "First follow-up", timingKey: "lead_day_1", toggleKey: "follow_up_lead_day_1" },
      { label: "Second follow-up", timingKey: "lead_day_2", toggleKey: "follow_up_lead_day_2" },
      { label: "Final follow-up", timingKey: "lead_day_3", toggleKey: "follow_up_lead_day_3" },
    ]},
    { section: "Quote Follow-Ups", toggleKey: "follow_up_quotes", items: [
      { label: "First check-in", timingKey: "quote_day_1", toggleKey: "follow_up_quote_day_1" },
      { label: "Reinforce value", timingKey: "quote_day_2", toggleKey: "follow_up_quote_day_2" },
      { label: "Close loop", timingKey: "quote_day_3", toggleKey: "follow_up_quote_day_3" },
    ]},
  ];

  return (
    <div className="border border-border/20 rounded-sm p-4 space-y-4 bg-background/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-3.5 w-3.5 text-accent/60" />
          <p className="text-sm font-medium text-foreground">Follow-Up Timing</p>
        </div>
        <Button size="sm" variant="gold" className="h-7 text-[9px]" disabled={saving} onClick={onSave}>
          {saving ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
          Save Settings
        </Button>
      </div>

      {TIMING_ROWS.map((group) => {
        const groupEnabled = toggles[group.toggleKey] ?? true;
        return (
          <div key={group.section} className="space-y-2">
            <div className="flex items-center justify-between border-b border-border/10 pb-1.5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium">{group.section}</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground/40">{groupEnabled ? "Active" : "Paused"}</span>
                <Switch
                  checked={groupEnabled}
                  onCheckedChange={(v) => onToggleChange(group.toggleKey, v)}
                  className="scale-75"
                />
              </div>
            </div>
            {groupEnabled && group.items.map((item) => {
              const itemEnabled = toggles[item.toggleKey] ?? true;
              return (
                <div key={item.timingKey} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Switch
                      checked={itemEnabled}
                      onCheckedChange={(v) => onToggleChange(item.toggleKey, v)}
                      className="scale-75 shrink-0"
                    />
                    <span className={`text-[12px] ${itemEnabled ? "text-foreground" : "text-muted-foreground/40"}`}>
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground/40">Day</span>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={timing[item.timingKey] || 0}
                      onChange={(e) => onTimingChange(item.timingKey, parseInt(e.target.value, 10) || 1)}
                      disabled={!itemEnabled}
                      className="w-14 h-7 text-center text-sm bg-background/50 border-border/30"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <p className="text-[9px] text-muted-foreground/30 pt-1 border-t border-border/10">
        Changes take effect immediately after saving. Follow-ups remain draft-only.
      </p>
    </div>
  );
}
