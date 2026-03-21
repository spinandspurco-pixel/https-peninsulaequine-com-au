import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  format, parseISO, isBefore, isToday, addDays, startOfDay,
  differenceInBusinessDays,
} from "date-fns";
import {
  Mail, Phone, Send, Clock, CalendarDays, Eye, Play,
  Pause, SkipForward, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ScheduledMessage {
  id: string;
  entity_type: string;
  entity_id: string;
  step_number: number;
  channel: string;
  template_type: string;
  scheduled_at: string;
  status: string;
  automation_mode: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  subject_line: string | null;
  message_body: string | null;
  sent_at: string | null;
  notes: string | null;
}

interface Props {
  entityType: "quote" | "lead";
  entityId: string;
  clientName?: string;
}

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const STATUS_WEIGHT: Record<string, { label: string; tone: string }> = {
  scheduled:  { label: "Scheduled",      tone: "text-muted-foreground/50" },
  due_soon:   { label: "Due Soon",       tone: "text-foreground/70" },
  ready:      { label: "Ready to Send",  tone: "text-foreground/80 font-medium" },
  sent:       { label: "Sent",           tone: "text-muted-foreground/40" },
  paused:     { label: "Paused",         tone: "text-muted-foreground/50 italic" },
  skipped:    { label: "Skipped",        tone: "text-muted-foreground/35 line-through" },
  overdue:    { label: "Overdue",        tone: "text-foreground font-semibold" },
  cancelled:  { label: "Cancelled",      tone: "text-muted-foreground/30" },
};

const TEMPLATE_LABELS: Record<string, string> = {
  soft_check_in: "Soft Check-In",
  value_reframe: "Value Reframe",
  decision_prompt: "Decision Prompt",
  close_loop: "Close Loop",
  scope_check_in: "Scope Check-In",
  invitation_to_proceed: "Invitation to Proceed",
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function CommunicationTimeline({ entityType, entityId, clientName }: Props) {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("step_number", { ascending: true });
    if (!error) setMessages((data as ScheduledMessage[]) || []);
    setLoading(false);
  }, [entityType, entityId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  /* ---- compute display status ---- */
  const computeStatus = (msg: ScheduledMessage): string => {
    if (["sent", "paused", "skipped", "cancelled"].includes(msg.status)) return msg.status;
    const now = startOfDay(new Date());
    const scheduled = startOfDay(parseISO(msg.scheduled_at));
    if (isBefore(scheduled, now)) return "overdue";
    if (isToday(scheduled)) return "ready";
    const diff = differenceInBusinessDays(scheduled, now);
    if (diff <= 1) return "due_soon";
    return "scheduled";
  };

  /* ---- actions ---- */
  const updateStatus = async (id: string, status: string, extra: Record<string, any> = {}) => {
    const { error } = await supabase
      .from("scheduled_messages")
      .update({ status, ...extra })
      .eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(`Message ${status}`); fetchMessages(); }
  };

  const handleSendNow = (msg: ScheduledMessage) =>
    updateStatus(msg.id, "sent", { sent_at: new Date().toISOString() });
  const handlePause = (msg: ScheduledMessage) =>
    updateStatus(msg.id, "paused", { paused_at: new Date().toISOString() });
  const handleResume = (msg: ScheduledMessage) =>
    updateStatus(msg.id, "scheduled", { paused_at: null });
  const handleSkip = (msg: ScheduledMessage) =>
    updateStatus(msg.id, "skipped", { skipped_at: new Date().toISOString() });

  const handleReschedule = async (msg: ScheduledMessage, days: number) => {
    const newDate = addDays(parseISO(msg.scheduled_at), days);
    const { error } = await supabase
      .from("scheduled_messages")
      .update({ scheduled_at: newDate.toISOString(), status: "scheduled" })
      .eq("id", msg.id);
    if (error) toast.error("Failed to reschedule");
    else { toast.success(`Rescheduled +${days} days`); fetchMessages(); }
  };

  const handleEditSave = async (id: string) => {
    const { error } = await supabase
      .from("scheduled_messages")
      .update({ message_body: editBody })
      .eq("id", id);
    if (error) toast.error("Failed to save");
    else { toast.success("Message updated"); setEditingId(null); fetchMessages(); }
  };

  /* ---- loading / empty ---- */
  if (loading) return (
    <div className="text-[11px] text-muted-foreground/40 py-4 tracking-wide">Loading timeline…</div>
  );

  if (messages.length === 0) return (
    <div className="py-6">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-2">
        Communication Timeline
      </p>
      <p className="text-[12px] text-muted-foreground/50 italic">
        No client-facing communication recorded yet.
      </p>
    </div>
  );

  /* ---- derived data ---- */
  const sentMessages = messages.filter(m => m.status === "sent");
  const upcomingMessages = messages.filter(m => !["sent", "skipped", "cancelled"].includes(computeStatus(m)));
  const pastMessages = messages.filter(m => ["sent", "skipped", "cancelled"].includes(computeStatus(m)));
  const nextDue = upcomingMessages[0];
  const lastSent = sentMessages.length > 0 ? sentMessages[sentMessages.length - 1] : null;
  const currentMode = messages[0]?.automation_mode || "assisted";

  return (
    <div className="py-2">
      {/* ═══ Section header ═══ */}
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-4">
        Communication Timeline
      </p>

      {/* ═══ Summary strip ═══ */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[10px] tracking-wide text-muted-foreground/50 mb-5 pb-4 border-b border-border/20">
        <span>
          Last contact:{" "}
          <span className="text-foreground/60">
            {lastSent ? format(parseISO(lastSent.sent_at!), "MMM d") : "—"}
          </span>
        </span>
        <span>
          Next scheduled:{" "}
          <span className="text-foreground/60">
            {nextDue ? format(parseISO(nextDue.scheduled_at), "MMM d") : "—"}
          </span>
        </span>
        <span>
          Mode:{" "}
          <span className="text-foreground/60 capitalize">{currentMode}</span>
        </span>
        <span>
          {sentMessages.length} sent · {upcomingMessages.length} remaining
        </span>
      </div>

      {/* ═══ Upcoming ═══ */}
      {upcomingMessages.length > 0 && (
        <div className="mb-6">
          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/35 mb-3">
            Upcoming
          </p>
          <div className="relative pl-4">
            {/* vertical line */}
            <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border/30" />

            {upcomingMessages.map((msg, i) => {
              const displayStatus = computeStatus(msg);
              const meta = STATUS_WEIGHT[displayStatus] || STATUS_WEIGHT.scheduled;
              const isPaused = displayStatus === "paused";
              const isExpanded = expandedId === msg.id;
              const isEditing = editingId === msg.id;

              return (
                <div key={msg.id} className="relative mb-4 last:mb-0">
                  {/* dot marker */}
                  <div className={cn(
                    "absolute -left-4 top-[5px] w-[10px] h-[10px] rounded-full border-2 bg-background",
                    displayStatus === "overdue" ? "border-foreground/60" :
                    displayStatus === "ready" ? "border-foreground/40" :
                    displayStatus === "due_soon" ? "border-foreground/30" :
                    "border-border/50"
                  )} />

                  <div className="ml-2">
                    {/* title row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {msg.channel === "sms" ? (
                            <Phone className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                          ) : (
                            <Mail className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                          )}
                          <span className={cn("text-[12px]", meta.tone)}>
                            Step {msg.step_number}: {TEMPLATE_LABELS[msg.template_type] || msg.template_type}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5 ml-5">
                          {format(parseISO(msg.scheduled_at), "EEE, MMM d · h:mma")}
                        </p>
                      </div>
                      <span className={cn("text-[9px] uppercase tracking-[0.12em] whitespace-nowrap mt-0.5", meta.tone)}>
                        {meta.label}
                      </span>
                    </div>

                    {/* expand toggle for preview */}
                    {msg.message_body && !isEditing && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-opacity mt-1 ml-5"
                      >
                        {isExpanded ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                        {isExpanded ? "Hide preview" : "Preview message"}
                      </button>
                    )}

                    {/* message preview */}
                    {isExpanded && !isEditing && msg.message_body && (
                      <div className="mt-2 ml-5 pl-3 border-l border-border/20">
                        {msg.subject_line && (
                          <p className="text-[10px] text-foreground/50 font-medium mb-1">{msg.subject_line}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground/50 leading-relaxed whitespace-pre-line">
                          {msg.message_body}
                        </p>
                      </div>
                    )}

                    {/* edit mode */}
                    {isEditing && (
                      <div className="mt-2 ml-5 space-y-2">
                        <Textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="text-[11px] min-h-[60px] bg-background/40 border-border/20 focus:border-border/40"
                        />
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => handleEditSave(msg.id)}
                            className="text-[10px] h-6 px-2 border-border/20">
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                            className="text-[10px] h-6 px-2">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* actions — tucked, subtle */}
                    <div className="flex items-center gap-0.5 mt-1.5 ml-5 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
                      style={{ opacity: (displayStatus === "ready" || displayStatus === "overdue") ? 0.8 : undefined }}>
                      {!isPaused && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleSendNow(msg)}
                            className="text-[9px] h-5 px-1.5 text-foreground/60 hover:text-foreground/80">
                            <Send className="h-2.5 w-2.5 mr-0.5" /> Send
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => { setEditingId(msg.id); setEditBody(msg.message_body || ""); setExpandedId(null); }}
                            className="text-[9px] h-5 px-1.5 text-muted-foreground/50">
                            <Eye className="h-2.5 w-2.5 mr-0.5" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handlePause(msg)}
                            className="text-[9px] h-5 px-1.5 text-muted-foreground/50">
                            <Pause className="h-2.5 w-2.5 mr-0.5" /> Pause
                          </Button>
                        </>
                      )}
                      {isPaused && (
                        <Button size="sm" variant="ghost" onClick={() => handleResume(msg)}
                          className="text-[9px] h-5 px-1.5 text-foreground/60">
                          <Play className="h-2.5 w-2.5 mr-0.5" /> Resume
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleReschedule(msg, 2)}
                        className="text-[9px] h-5 px-1.5 text-muted-foreground/40">
                        <CalendarDays className="h-2.5 w-2.5 mr-0.5" /> +2d
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleSkip(msg)}
                        className="text-[9px] h-5 px-1.5 text-muted-foreground/35">
                        <SkipForward className="h-2.5 w-2.5 mr-0.5" /> Skip
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ History ═══ */}
      {pastMessages.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/30 mb-3">
            History
          </p>
          <div className="relative pl-4">
            <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border/15" />

            {pastMessages.map((msg) => {
              const displayStatus = computeStatus(msg);
              const meta = STATUS_WEIGHT[displayStatus] || STATUS_WEIGHT.sent;

              return (
                <div key={msg.id} className="relative mb-3 last:mb-0">
                  <div className={cn(
                    "absolute -left-4 top-[5px] w-[10px] h-[10px] rounded-full border-2 bg-background",
                    displayStatus === "sent" ? "border-muted-foreground/20" : "border-border/20"
                  )} />

                  <div className="ml-2 opacity-60">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {msg.channel === "sms" ? (
                            <Phone className="h-3 w-3 text-muted-foreground/30 flex-shrink-0" />
                          ) : (
                            <Mail className="h-3 w-3 text-muted-foreground/30 flex-shrink-0" />
                          )}
                          <span className={cn("text-[11px]", meta.tone)}>
                            Step {msg.step_number}: {TEMPLATE_LABELS[msg.template_type] || msg.template_type}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/30 mt-0.5 ml-5">
                          {msg.sent_at
                            ? `Sent ${format(parseISO(msg.sent_at), "MMM d · h:mma")}`
                            : format(parseISO(msg.scheduled_at), "MMM d")}
                        </p>
                      </div>
                      <span className={cn("text-[9px] uppercase tracking-[0.12em] whitespace-nowrap mt-0.5", meta.tone)}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
