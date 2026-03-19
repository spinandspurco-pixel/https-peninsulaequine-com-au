import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  Clock, Mail, Phone, CheckCircle, Pause, RefreshCw,
  AlertTriangle, ArrowRight, Bot, Send, Eye, Zap,
  ChevronDown, ChevronUp, DollarSign,
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [draftsRes, inquiriesRes, quotesRes] = await Promise.all([
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
    ]);

    if (draftsRes.data) setDrafts(draftsRes.data as unknown as FollowUpItem[]);
    if (inquiriesRes.data) setInquiries(inquiriesRes.data as unknown as InquiryFollowUp[]);
    if (quotesRes.data) setQuotes(quotesRes.data as unknown as QuoteFollowUp[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* -- Compute follow-up candidates -- */
  const now = new Date();

  const dueLeads = inquiries.filter(i => {
    if (i.follow_up_status === "stopped" || i.follow_up_status === "completed") return false;
    const contactDate = i.last_contact_at || i.created_at;
    const days = daysSince(contactDate);
    if (days === null) return false;
    if (i.follow_up_stage === "none" && days >= 2) return true;
    if (i.follow_up_stage === "1" && days >= 3) return true;
    if (i.follow_up_stage === "2" && days >= 5) return true;
    return false;
  });

  const overdueLeads = inquiries.filter(i => {
    const contactDate = i.last_contact_at || i.created_at;
    const days = daysSince(contactDate);
    return days !== null && days >= 10 && i.follow_up_stage !== "final" && i.follow_up_status !== "stopped" && i.follow_up_status !== "completed";
  });

  const dueQuotes = quotes.filter(q => {
    if (!q.sent_at) return false;
    const days = daysSince(q.sent_at);
    return days !== null && days >= 2;
  });

  const highValueItems = [
    ...dueLeads.filter(l => l.deal_value && l.deal_value >= 50000),
    ...dueQuotes.filter(q => q.total >= 50000),
  ];

  /* -- Generate AI draft -- */
  const generateDraft = async (entityType: "lead" | "quote", entityId: string, clientName: string, clientEmail: string, context: Record<string, unknown>) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-follow-up-draft", {
        body: { entity_type: entityType, entity_id: entityId, client_name: clientName, client_email: clientEmail, context },
      });
      if (error) throw error;
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

              {/* ---- Empty state ---- */}
              {totalDue === 0 && totalOverdue === 0 && drafts.length === 0 && (
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
                <Button size="sm" variant="ghost" className="h-6 text-[9px] text-muted-foreground/40" onClick={fetchData}>
                  <RefreshCw className="h-3 w-3 mr-1" />Refresh
                </Button>
              </div>
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
