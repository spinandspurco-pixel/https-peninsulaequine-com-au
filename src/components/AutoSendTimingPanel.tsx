import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  format, parseISO, isBefore, isToday, startOfDay,
} from "date-fns";
import {
  Clock, Mail, Phone, Send, Pause, SkipForward,
  Play, CheckCircle, Settings, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ScheduledMsg {
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
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TEMPLATE_LABELS: Record<string, string> = {
  soft_check_in: "Soft Check-In",
  value_reframe: "Value Reframe",
  decision_prompt: "Decision Prompt",
  close_loop: "Close Loop",
  scope_check_in: "Scope Check-In",
  invitation_to_proceed: "Invitation to Proceed",
};

const computeStatus = (msg: ScheduledMsg): string => {
  if (["sent", "paused", "skipped", "cancelled"].includes(msg.status)) return msg.status;
  const now = startOfDay(new Date());
  const scheduled = startOfDay(parseISO(msg.scheduled_at));
  if (isBefore(scheduled, now)) return "overdue";
  if (isToday(scheduled)) return "ready";
  return msg.status;
};

/* ------------------------------------------------------------------ */
/*  Admin Controls Component                                           */
/* ------------------------------------------------------------------ */

export function AutoSendSettingsPanel() {
  const [defaultMode, setDefaultMode] = useState("assisted");
  const [pauseAll, setPauseAll] = useState(false);
  const [emailPriority, setEmailPriority] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("automation_settings")
      .select("setting_key, enabled, description")
      .in("setting_key", ["auto_send_mode", "pause_all_auto_send", "email_priority_over_sms"])
      .then(({ data }) => {
        if (data) {
          const mode = data.find((s) => s.setting_key === "auto_send_mode");
          const pause = data.find((s) => s.setting_key === "pause_all_auto_send");
          const email = data.find((s) => s.setting_key === "email_priority_over_sms");
          if (mode?.description) setDefaultMode(mode.description);
          if (pause) setPauseAll(pause.enabled);
          if (email) setEmailPriority(email.enabled);
        }
      });
  }, []);

  const saveSetting = async (key: string, enabled: boolean, description?: string) => {
    setSaving(true);
    await supabase
      .from("automation_settings")
      .upsert(
        { setting_key: key, enabled, description: description || null, category: "auto_send" },
        { onConflict: "setting_key" }
      );
    setSaving(false);
    toast.success("Setting updated");
  };

  return (
    <Card className="bg-card/80 border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-accent/60" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-0.5">Automation</p>
            <CardTitle className="text-sm font-medium">Auto-Send Timing</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pause All */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium">Pause All Auto-Send</p>
            <p className="text-[10px] text-muted-foreground/60">Stops all scheduled messages</p>
          </div>
          <Switch
            checked={pauseAll}
            onCheckedChange={(v) => {
              setPauseAll(v);
              saveSetting("pause_all_auto_send", v);
            }}
          />
        </div>

        {/* Default Mode */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium">Default Mode</p>
            <p className="text-[10px] text-muted-foreground/60">How new follow-ups behave</p>
          </div>
          <Select
            value={defaultMode}
            onValueChange={(v) => {
              setDefaultMode(v);
              saveSetting("auto_send_mode", true, v);
            }}
          >
            <SelectTrigger className="w-[130px] h-8 text-[11px] bg-background/40 border-border/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual" className="text-[11px]">Manual</SelectItem>
              <SelectItem value="assisted" className="text-[11px]">Assisted</SelectItem>
              <SelectItem value="auto_send" className="text-[11px]">Auto-Send</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Email Priority */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium">Email Priority</p>
            <p className="text-[10px] text-muted-foreground/60">Prefer email over SMS</p>
          </div>
          <Switch
            checked={emailPriority}
            onCheckedChange={(v) => {
              setEmailPriority(v);
              saveSetting("email_priority_over_sms", v);
            }}
          />
        </div>

        {/* Send Windows */}
        <div className="border-t border-border/20 pt-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-2">Send Windows</p>
          <div className="text-[11px] text-muted-foreground/60 space-y-1">
            <p>Monday–Friday only</p>
            <p>9:30 AM – 4:30 PM local time</p>
            <p className="text-[10px] italic text-muted-foreground/40">Messages outside this window are rescheduled automatically</p>
          </div>
        </div>

        {/* Mode Descriptions */}
        <div className="border-t border-border/20 pt-3 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-1">Mode Guide</p>
          {[
            { mode: "Manual", desc: "Reminders only — team sends manually" },
            { mode: "Assisted", desc: "Preloaded templates, one-click send" },
            { mode: "Auto-Send", desc: "System sends at scheduled time" },
          ].map((m) => (
            <div key={m.mode} className="flex items-start gap-2">
              <Badge variant="outline" className="text-[8px] uppercase tracking-wider px-1.5 py-0 mt-0.5 flex-shrink-0">
                {m.mode}
              </Badge>
              <p className="text-[10px] text-muted-foreground/50">{m.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview Panel — shows all upcoming across entities                 */
/* ------------------------------------------------------------------ */

export function AutoSendOverviewPanel() {
  const [messages, setMessages] = useState<ScheduledMsg[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("scheduled_messages")
      .select("*")
      .in("status", ["scheduled", "due_soon", "ready", "overdue"])
      .order("scheduled_at", { ascending: true })
      .limit(20);
    setMessages((data as ScheduledMsg[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleAction = async (id: string, status: string, extra: Record<string, any> = {}) => {
    await supabase.from("scheduled_messages").update({ status, ...extra }).eq("id", id);
    toast.success(`Message ${status}`);
    fetchMessages();
  };

  if (loading) return null;
  if (messages.length === 0) return null;

  const overdueCount = messages.filter((m) => computeStatus(m) === "overdue").length;
  const readyCount = messages.filter((m) => computeStatus(m) === "ready").length;

  return (
    <Card className="bg-card/80 border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent/60" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-0.5">Auto-Send</p>
              <CardTitle className="text-sm font-medium">Scheduled Messages</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <Badge variant="outline" className="text-[9px] font-medium">{overdueCount} overdue</Badge>
            )}
            {readyCount > 0 && (
              <Badge variant="outline" className="text-[9px] text-accent border-accent/30">{readyCount} ready</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {messages.map((msg) => {
          const displayStatus = computeStatus(msg);
          const isOverdue = displayStatus === "overdue";
          const isReady = displayStatus === "ready";

          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-center justify-between gap-3 p-2.5 rounded-sm border transition-all duration-200",
                isOverdue ? "border-foreground/15 bg-foreground/[0.02]" :
                isReady ? "border-accent/20 bg-accent/[0.03]" :
                "border-border/30 bg-background/30"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {msg.channel === "sms" ? (
                  <Phone className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                ) : (
                  <Mail className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-medium truncate">
                    {msg.client_name}
                    <span className="text-muted-foreground/40 font-normal ml-1.5">
                      {TEMPLATE_LABELS[msg.template_type] || msg.template_type}
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground/50">
                    {format(parseISO(msg.scheduled_at), "EEE, MMM d · h:mma")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {(isReady || isOverdue) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAction(msg.id, "sent", { sent_at: new Date().toISOString() })}
                    className="text-[10px] h-6 px-2 text-accent hover:text-accent/80"
                  >
                    <Send className="h-3 w-3 mr-1" /> Send
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAction(msg.id, "skipped", { skipped_at: new Date().toISOString() })}
                  className="text-[10px] h-6 px-1.5 text-muted-foreground/40"
                >
                  <SkipForward className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
