import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  format, parseISO, isBefore, isToday, addDays, startOfDay,
  differenceInBusinessDays,
} from "date-fns";
import {
  Mail, Phone, CheckCircle, Pause, SkipForward, Send,
  Clock, CalendarDays, Eye, Play, X,
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
/*  Status config                                                       */
/* ------------------------------------------------------------------ */

const STATUS_META: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "text-muted-foreground border-border/40" },
  due_soon: { label: "Due Soon", className: "text-foreground/80 border-accent/30 bg-accent/5" },
  ready: { label: "Ready to Send", className: "text-accent border-accent/40 bg-accent/10" },
  sent: { label: "Sent", className: "text-muted-foreground/60 border-border/20 bg-muted/30" },
  paused: { label: "Paused", className: "text-muted-foreground border-border/30" },
  skipped: { label: "Skipped", className: "text-muted-foreground/50 border-border/20 line-through" },
  overdue: { label: "Overdue", className: "text-foreground font-medium border-foreground/20" },
  cancelled: { label: "Cancelled", className: "text-muted-foreground/40 border-border/20" },
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

  /* compute display status */
  const computeStatus = (msg: ScheduledMessage): string => {
    if (msg.status === "sent" || msg.status === "paused" || msg.status === "skipped" || msg.status === "cancelled") return msg.status;
    const now = startOfDay(new Date());
    const scheduled = startOfDay(parseISO(msg.scheduled_at));
    if (isBefore(scheduled, now)) return "overdue";
    if (isToday(scheduled)) return "ready";
    const diff = differenceInBusinessDays(scheduled, now);
    if (diff <= 1) return "due_soon";
    return "scheduled";
  };

  const updateStatus = async (id: string, status: string, extra: Record<string, any> = {}) => {
    const { error } = await supabase
      .from("scheduled_messages")
      .update({ status, ...extra })
      .eq("id", id);
    if (error) toast.error("Failed to update");
    else {
      toast.success(`Message ${status}`);
      fetchMessages();
    }
  };

  const handleSendNow = (msg: ScheduledMessage) => {
    updateStatus(msg.id, "sent", { sent_at: new Date().toISOString() });
  };

  const handlePause = (msg: ScheduledMessage) => {
    updateStatus(msg.id, "paused", { paused_at: new Date().toISOString() });
  };

  const handleResume = (msg: ScheduledMessage) => {
    updateStatus(msg.id, "scheduled", { paused_at: null });
  };

  const handleSkip = (msg: ScheduledMessage) => {
    updateStatus(msg.id, "skipped", { skipped_at: new Date().toISOString() });
  };

  const handleCancel = (msg: ScheduledMessage) => {
    updateStatus(msg.id, "cancelled", { cancelled_at: new Date().toISOString() });
  };

  const handleReschedule = async (msg: ScheduledMessage, days: number) => {
    const newDate = addDays(parseISO(msg.scheduled_at), days);
    const { error } = await supabase
      .from("scheduled_messages")
      .update({ scheduled_at: newDate.toISOString(), status: "scheduled" })
      .eq("id", msg.id);
    if (error) toast.error("Failed to reschedule");
    else {
      toast.success(`Rescheduled +${days} days`);
      fetchMessages();
    }
  };

  const handleEditSave = async (id: string) => {
    const { error } = await supabase
      .from("scheduled_messages")
      .update({ message_body: editBody })
      .eq("id", id);
    if (error) toast.error("Failed to save");
    else {
      toast.success("Message updated");
      setEditingId(null);
      fetchMessages();
    }
  };

  if (loading) return <div className="text-[11px] text-muted-foreground/50 py-3">Loading timeline…</div>;
  if (messages.length === 0) return null;

  const activeCount = messages.filter((m) => !["sent", "skipped", "cancelled"].includes(m.status)).length;
  const sentCount = messages.filter((m) => m.status === "sent").length;
  const nextDue = messages.find((m) => !["sent", "skipped", "cancelled", "paused"].includes(m.status));

  return (
    <div className="space-y-3">
      {/* Summary strip */}
      <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
        <span>Communication Timeline</span>
        <span className="text-muted-foreground/40">·</span>
        <span>{sentCount} sent</span>
        <span className="text-muted-foreground/40">·</span>
        <span>{activeCount} remaining</span>
        {nextDue && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <span>Next: {format(parseISO(nextDue.scheduled_at), "MMM d")}</span>
          </>
        )}
      </div>

      {/* Timeline items */}
      <div className="space-y-2">
        {messages.map((msg) => {
          const displayStatus = computeStatus(msg);
          const meta = STATUS_META[displayStatus] || STATUS_META.scheduled;
          const isActive = !["sent", "skipped", "cancelled"].includes(displayStatus);
          const isPaused = displayStatus === "paused";

          return (
            <div
              key={msg.id}
              className={cn(
                "border rounded-sm p-3 transition-all duration-200",
                meta.className,
                !isActive && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {msg.channel === "sms" ? (
                    <Phone className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                  ) : (
                    <Mail className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-foreground/90 truncate">
                      Step {msg.step_number}: {TEMPLATE_LABELS[msg.template_type] || msg.template_type}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      {format(parseISO(msg.scheduled_at), "EEE, MMM d · h:mma")}
                      {msg.sent_at && ` — Sent ${format(parseISO(msg.sent_at), "MMM d")}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant="outline" className="text-[8px] uppercase tracking-wider px-1.5 py-0">
                    {meta.label}
                  </Badge>
                  <Badge variant="outline" className="text-[8px] uppercase tracking-wider px-1.5 py-0 text-muted-foreground/40">
                    {msg.automation_mode}
                  </Badge>
                </div>
              </div>

              {/* Preview / Edit */}
              {editingId === msg.id ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="text-[11px] min-h-[60px] bg-background/40 border-border/30"
                  />
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => handleEditSave(msg.id)} className="text-[10px] h-6 px-2">
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-[10px] h-6 px-2">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : msg.message_body ? (
                <p className="text-[11px] text-muted-foreground/60 mt-1.5 line-clamp-2">{msg.message_body}</p>
              ) : null}

              {/* Actions — only for active messages */}
              {isActive && (
                <div className="flex items-center gap-1 mt-2">
                  {!isPaused && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendNow(msg)}
                        className="text-[10px] h-6 px-2 text-accent hover:text-accent/80"
                      >
                        <Send className="h-3 w-3 mr-1" /> Send Now
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingId(msg.id); setEditBody(msg.message_body || ""); }}
                        className="text-[10px] h-6 px-2"
                      >
                        <Eye className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePause(msg)}
                        className="text-[10px] h-6 px-2"
                      >
                        <Pause className="h-3 w-3 mr-1" /> Pause
                      </Button>
                    </>
                  )}
                  {isPaused && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResume(msg)}
                      className="text-[10px] h-6 px-2 text-accent"
                    >
                      <Play className="h-3 w-3 mr-1" /> Resume
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleReschedule(msg, 2)}
                    className="text-[10px] h-6 px-2"
                  >
                    <CalendarDays className="h-3 w-3 mr-1" /> +2d
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSkip(msg)}
                    className="text-[10px] h-6 px-2 text-muted-foreground/50"
                  >
                    <SkipForward className="h-3 w-3 mr-1" /> Skip
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
