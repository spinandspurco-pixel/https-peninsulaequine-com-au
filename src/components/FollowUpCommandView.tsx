import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  format, isToday, isBefore, startOfDay, endOfWeek, startOfWeek,
  addDays, parseISO, isAfter,
} from "date-fns";
import {
  CheckCircle, CalendarDays, Phone, Mail, MapPin,

  MessageSquare, ExternalLink, Clock, RefreshCw, cn,
} from "lucide-react";
import { cn as clsx } from "@/lib/utils";
import { TEAM_MEMBERS } from "@/components/crm/crmTypes";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FollowUpRecord {
  id: string;
  source: "client" | "quote";
  client_name: string;
  client_email: string;
  project_name: string | null;
  deal_stage: string | null;
  quote_status: string | null;
  followup_type: string;
  notes: string | null;
  due_date: string;
  assigned_to: string | null;
  deal_value: number | null;
  // For linking
  inquiry_id: string | null;
  quote_id: string | null;
}

type TimeGroup = "overdue" | "today" | "week";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const groupRecord = (dueDateStr: string): TimeGroup => {
  const due = startOfDay(parseISO(dueDateStr));
  const now = startOfDay(new Date());
  if (isBefore(due, now)) return "overdue";
  if (isToday(due)) return "today";
  return "week";
};

const TYPE_LABELS: Record<string, { label: string; icon: typeof Phone }> = {
  call: { label: "Call", icon: Phone },
  email: { label: "Email", icon: Mail },
  site_visit: { label: "Site Visit", icon: MapPin },
  check_viewed: { label: "Check Viewed", icon: ExternalLink },
  follow_up: { label: "Follow-Up", icon: MessageSquare },
  chase_up: { label: "Chase Up", icon: Clock },
  two_week: { label: "2-Week Check", icon: Phone },
  post_project: { label: "Post-Project", icon: CheckCircle },
};

const SECTION_CONFIG: Record<TimeGroup, { title: string; desc: string; weight: string }> = {
  overdue: { title: "Overdue", desc: "Needs immediate attention", weight: "font-semibold" },
  today: { title: "Due Today", desc: "Action required today", weight: "font-medium" },
  week: { title: "This Week", desc: "Upcoming follow-ups", weight: "font-normal" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FollowUpCommandView() {
  const [records, setRecords] = useState<FollowUpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [showNote, setShowNote] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>();

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);

    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    // Fetch client followups (pending/overdue, due within this week or overdue)
    const [clientRes, quoteRes] = await Promise.all([
      supabase
        .from("client_followups")
        .select("*")
        .in("status", ["pending", "overdue"])
        .lte("due_date", weekEnd)
        .order("due_date", { ascending: true }),
      supabase
        .from("quote_follow_ups")
        .select("*, quotes!inner(client_name, client_email, project_type, status, total, property_name, inquiry_id)")
        .in("status", ["pending"])
        .lte("due_date", weekEnd)
        .order("due_date", { ascending: true }),
    ]);

    const merged: FollowUpRecord[] = [];

    // Client followups
    (clientRes.data || []).forEach((r: any) => {
      merged.push({
        id: `cf-${r.id}`,
        source: "client",
        client_name: r.client_name,
        client_email: r.client_email,
        project_name: r.project_name || null,
        deal_stage: r.deal_stage || null,
        quote_status: r.quote_status || null,
        followup_type: r.followup_type || "call",
        notes: r.notes,
        due_date: r.due_date,
        assigned_to: r.assigned_to || null,
        deal_value: r.deal_value || null,
        inquiry_id: r.inquiry_id,
        quote_id: null,
      });
    });

    // Quote followups
    (quoteRes.data || []).forEach((r: any) => {
      const q = r.quotes;
      merged.push({
        id: `qf-${r.id}`,
        source: "quote",
        client_name: q?.client_name || "Unknown",
        client_email: q?.client_email || "",
        project_name: q?.property_name || q?.project_type || null,
        deal_stage: null,
        quote_status: q?.status || null,
        followup_type: r.action_type || "follow_up",
        notes: r.notes,
        due_date: r.due_date,
        assigned_to: null,
        deal_value: q?.total || null,
        inquiry_id: q?.inquiry_id || null,
        quote_id: r.quote_id,
      });
    });

    // Sort by due_date
    merged.sort((a, b) => a.due_date.localeCompare(b.due_date));

    setRecords(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  /* ---- Actions ---- */

  const handleComplete = async (rec: FollowUpRecord) => {
    const realId = rec.id.split("-").slice(1).join("-");
    if (rec.source === "client") {
      await supabase.from("client_followups").update({
        status: "completed",
        completed_at: new Date().toISOString(),
      }).eq("id", realId);
    } else {
      await supabase.from("quote_follow_ups").update({
        status: "completed",
        completed_at: new Date().toISOString(),
      }).eq("id", realId);
    }
    toast.success(`Follow-up for ${rec.client_name} completed`);
    fetchFollowUps();
  };

  const handleReschedule = async () => {
    if (!rescheduleId || !rescheduleDate) return;
    const rec = records.find((r) => r.id === rescheduleId);
    if (!rec) return;
    const realId = rec.id.split("-").slice(1).join("-");
    const newDate = format(rescheduleDate, "yyyy-MM-dd");

    if (rec.source === "client") {
      await supabase.from("client_followups").update({ due_date: newDate, status: "pending" }).eq("id", realId);
    } else {
      await supabase.from("quote_follow_ups").update({ due_date: newDate, status: "pending" }).eq("id", realId);
    }
    toast.success(`Rescheduled to ${format(rescheduleDate, "MMM d")}`);
    setRescheduleId(null);
    setRescheduleDate(undefined);
    fetchFollowUps();
  };

  const handleAddNote = async (rec: FollowUpRecord) => {
    const note = noteEdits[rec.id];
    if (!note?.trim()) return;
    const realId = rec.id.split("-").slice(1).join("-");
    if (rec.source === "client") {
      await supabase.from("client_followups").update({ notes: note.trim() }).eq("id", realId);
    } else {
      await supabase.from("quote_follow_ups").update({ notes: note.trim() }).eq("id", realId);
    }
    toast.success("Note saved");
    setShowNote(null);
    setNoteEdits((prev) => ({ ...prev, [rec.id]: "" }));
    fetchFollowUps();
  };

  /* ---- Grouping ---- */

  const groups: Record<TimeGroup, FollowUpRecord[]> = { overdue: [], today: [], week: [] };
  records.forEach((r) => {
    groups[groupRecord(r.due_date)].push(r);
  });

  const totalCount = records.length;
  const overdueCount = groups.overdue.length;

  /* ---- Render ---- */

  return (
    <Card className="bg-card/80 border-border/40">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Action Board</p>
            <CardTitle className="text-base font-medium tracking-tight">Follow-Ups</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {totalCount} pending{overdueCount > 0 && ` · ${overdueCount} overdue`}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchFollowUps} disabled={loading} className="text-[11px]">
            <RefreshCw className={clsx("h-3.5 w-3.5 mr-1", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : totalCount === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-8 w-8 text-accent/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">All clear — no follow-ups due</p>
          </div>
        ) : (
          (["overdue", "today", "week"] as TimeGroup[]).map((group) => {
            const items = groups[group];
            if (items.length === 0) return null;
            const config = SECTION_CONFIG[group];

            return (
              <div key={group}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <h3 className={clsx("text-sm tracking-tight", config.weight,
                      group === "overdue" && "text-foreground",
                      group === "today" && "text-foreground",
                      group === "week" && "text-muted-foreground"
                    )}>
                      {config.title}
                      <span className="ml-2 text-[10px] text-muted-foreground font-normal">({items.length})</span>
                    </h3>
                    <p className="text-[10px] text-muted-foreground/50">{config.desc}</p>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {items.map((rec) => {
                    const typeInfo = TYPE_LABELS[rec.followup_type] || TYPE_LABELS.follow_up;
                    const TypeIcon = typeInfo.icon;
                    const teamMember = TEAM_MEMBERS.find((t) => t.id === rec.assigned_to);

                    return (
                      <div
                        key={rec.id}
                        className={clsx(
                          "rounded-sm border p-3.5 transition-all duration-200",
                          group === "overdue" && "border-foreground/15 bg-foreground/[0.02]",
                          group === "today" && "border-accent/20 bg-accent/[0.02]",
                          group === "week" && "border-border/30 bg-background/40",
                        )}
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className={clsx(
                                "text-sm truncate",
                                group === "overdue" ? "font-semibold text-foreground" : "font-medium text-foreground"
                              )}>
                                {rec.client_name}
                              </p>
                              {rec.deal_value && rec.deal_value > 0 && (
                                <span className="text-[10px] text-accent/70 font-medium">
                                  ${rec.deal_value.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Meta row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {rec.project_name && (
                                <span className="text-[10px] text-muted-foreground">{rec.project_name}</span>
                              )}
                              {rec.deal_stage && (
                                <Badge variant="outline" className="text-[8px] uppercase tracking-wider px-1.5 py-0 h-4 border-border/30">
                                  {rec.deal_stage}
                                </Badge>
                              )}
                              {rec.quote_status && (
                                <Badge variant="outline" className="text-[8px] uppercase tracking-wider px-1.5 py-0 h-4 border-accent/20 text-accent/70">
                                  Quote: {rec.quote_status}
                                </Badge>
                              )}
                              {rec.source === "quote" && (
                                <Badge variant="outline" className="text-[8px] uppercase tracking-wider px-1.5 py-0 h-4 border-accent/20 text-accent/60">
                                  Quote Follow-Up
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Type + date */}
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 justify-end mb-0.5">
                              <TypeIcon className="h-3 w-3 text-muted-foreground/60" />
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{typeInfo.label}</span>
                            </div>
                            <p className={clsx(
                              "text-[11px]",
                              group === "overdue" ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>
                              {format(parseISO(rec.due_date), "MMM d")}
                            </p>
                          </div>
                        </div>

                        {/* Notes */}
                        {rec.notes && (
                          <p className="text-[11px] text-muted-foreground/70 mt-2 line-clamp-1 italic">
                            "{rec.notes}"
                          </p>
                        )}

                        {/* Assigned */}
                        {teamMember && (
                          <p className="text-[10px] text-muted-foreground/50 mt-1">
                            Assigned: {teamMember.name}
                          </p>
                        )}

                        {/* Inline note editor */}
                        {showNote === rec.id && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              placeholder="Add a note..."
                              value={noteEdits[rec.id] || rec.notes || ""}
                              onChange={(e) => setNoteEdits((prev) => ({ ...prev, [rec.id]: e.target.value }))}
                              className="h-16 text-[11px] bg-background/60 border-border/40 resize-none"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAddNote(rec)} className="text-[10px] h-7 px-3 uppercase tracking-wider">
                                Save Note
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setShowNote(null)} className="text-[10px] h-7 px-3">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Reschedule picker */}
                        {rescheduleId === rec.id && (
                          <div className="mt-3 space-y-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="text-[11px] h-8 w-full justify-start">
                                  <CalendarDays className="h-3.5 w-3.5 mr-2" />
                                  {rescheduleDate ? format(rescheduleDate, "MMM d, yyyy") : "Pick new date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={rescheduleDate}
                                  onSelect={setRescheduleDate}
                                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleReschedule} disabled={!rescheduleDate} className="text-[10px] h-7 px-3 uppercase tracking-wider">
                                Confirm
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setRescheduleId(null); setRescheduleDate(undefined); }} className="text-[10px] h-7 px-3">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Action bar */}
                        {showNote !== rec.id && rescheduleId !== rec.id && (
                          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/20">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleComplete(rec)}
                              className="text-[10px] h-7 px-2.5 uppercase tracking-wider text-accent hover:text-accent/80"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setRescheduleId(rec.id); setRescheduleDate(undefined); }}
                              className="text-[10px] h-7 px-2.5 uppercase tracking-wider text-muted-foreground"
                            >
                              <CalendarDays className="h-3 w-3 mr-1" />
                              Reschedule
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowNote(rec.id)}
                              className="text-[10px] h-7 px-2.5 uppercase tracking-wider text-muted-foreground"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Note
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
