import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle, XCircle, Send, Eye, RefreshCw, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { QuoteBuilder } from "./QuoteBuilder";
import { scheduleQuoteFollowUps, cancelScheduledMessages } from "@/lib/autoSendScheduler";

interface QuoteRow {
  id: string;
  quote_number: string;
  client_name: string;
  project_type: string;
  total: number;
  status: string;
  expiry_date: string | null;
  sent_at: string | null;
  created_at: string;
  inquiry_id: string | null;
}

interface FollowUp {
  id: string;
  quote_id: string;
  due_date: string;
  action_type: string;
  status: string;
  quotes?: { quote_number: string; client_name: string; total: number; status: string };
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  internal_review: "bg-amber-600/20 text-amber-500",
  ready_to_send: "bg-accent/20 text-accent",
  sent: "bg-accent/40 text-accent",
  viewed: "bg-accent/30 text-accent",
  follow_up_due: "bg-amber-600/20 text-amber-500",
  accepted: "bg-emerald-600/20 text-emerald-500",
  declined: "bg-destructive/20 text-destructive",
  expired: "bg-muted text-muted-foreground",
};

export function QuotesDashboard() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"list" | "builder">("list");
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [newFromInquiry, setNewFromInquiry] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [qRes, fuRes] = await Promise.all([
      supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(50) as any,
      supabase.from("quote_follow_ups").select("*, quotes(quote_number, client_name, total, status)").eq("status", "pending").order("due_date").limit(10) as any,
    ]);
    setQuotes(qRes.data || []);
    setFollowUps(fuRes.data || []);
    setLoading(false);
  };

  const openBuilder = (quoteId?: string, inquiryId?: string) => {
    setEditingQuoteId(quoteId || null);
    setNewFromInquiry(inquiryId || null);
    setActiveView("builder");
  };

  const handleBuilderSaved = () => {
    fetchData();
  };

  const handleBuilderClose = () => {
    setActiveView("list");
    setEditingQuoteId(null);
    setNewFromInquiry(null);
  };

  const updateQuoteStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "accepted") updates.accepted_at = new Date().toISOString();
    if (status === "declined") updates.declined_at = new Date().toISOString();
    if (status === "sent") updates.sent_at = new Date().toISOString();

    const { error } = await supabase.from("quotes").update(updates).eq("id", id);
    if (error) toast.error("Failed to update status");
    else { toast.success(`Quote ${status.replace("_", " ")}`); fetchData(); }
  };

  const completeFollowUp = async (id: string) => {
    const { error } = await supabase.from("quote_follow_ups").update({ status: "completed", completed_at: new Date().toISOString() } as any).eq("id", id);
    if (error) toast.error("Failed to complete follow-up");
    else { toast.success("Follow-up completed"); fetchData(); }
  };

  const filteredQuotes = statusFilter === "all" ? quotes : quotes.filter((q) => q.status === statusFilter);

  // Stats
  const thisMonth = new Date().toISOString().slice(0, 7);
  const acceptedValue = quotes
    .filter((q) => q.status === "accepted" && q.created_at.startsWith(thisMonth))
    .reduce((s, q) => s + Number(q.total), 0);
  const pendingReview = quotes.filter((q) => q.status === "internal_review").length;
  const sentActive = quotes.filter((q) => ["sent", "viewed", "follow_up_due"].includes(q.status)).length;
  const dueFollowUps = followUps.filter((f) => new Date(f.due_date) <= new Date()).length;

  if (activeView === "builder") {
    return (
      <div className="space-y-4">
        <QuoteBuilder
          quoteId={editingQuoteId}
          inquiryId={newFromInquiry}
          onSaved={handleBuilderSaved}
          onClose={handleBuilderClose}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="border-t border-accent/20 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">Operations · Quoting</p>
            <h2 className="font-serif text-xl tracking-tight text-foreground">Quote System</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Internal quote pipeline · approval-controlled</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => openBuilder()} className="text-[11px] uppercase tracking-wider border-border/40">
            <Plus className="h-3.5 w-3.5 mr-1" />New Quote
          </Button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Accepted This Month", value: `$${(acceptedValue / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-emerald-500" },
          { label: "Awaiting Review", value: pendingReview, icon: Clock, color: "text-amber-500" },
          { label: "Sent & Active", value: sentActive, icon: Send, color: "text-accent" },
          { label: "Follow-Ups Due", value: dueFollowUps, icon: RefreshCw, color: dueFollowUps > 0 ? "text-amber-500" : "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label} className="bg-card/60 border-border/30">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className={`h-3 w-3 ${s.color}`} />
                <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60">{s.label}</p>
              </div>
              <p className={`text-lg font-serif font-semibold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Follow-Ups Due */}
      {followUps.length > 0 && (
        <Card className="bg-card/80 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-500" />Quote Follow-Ups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {followUps.slice(0, 5).map((fu) => (
              <div key={fu.id} className="flex items-center justify-between p-2 rounded-sm border border-border/20 bg-background/30">
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-foreground">
                    {fu.quotes?.quote_number} — {fu.quotes?.client_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {fu.action_type.replace("_", " ")} · Due {format(new Date(fu.due_date), "MMM d")}
                    {fu.quotes?.total ? ` · $${Number(fu.quotes.total).toLocaleString()}` : ""}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => completeFollowUp(fu.id)} className="h-6 text-[9px] uppercase tracking-wider">
                  <CheckCircle className="h-3 w-3 mr-1" />Done
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Status Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {["all", "draft", "internal_review", "ready_to_send", "sent", "follow_up_due", "accepted", "declined"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className={`h-6 text-[9px] uppercase tracking-wider px-2 ${statusFilter === s ? "bg-accent/20 text-accent" : ""}`}
          >
            {s === "all" ? "All" : s.replace(/_/g, " ")}
            {s !== "all" && ` (${quotes.filter((q) => q.status === s).length})`}
          </Button>
        ))}
      </div>

      {/* Quotes List */}
      <Card className="bg-card/80 border-border/40">
        <CardContent className="py-2">
          {loading ? (
            <div className="flex items-center justify-center py-8"><RefreshCw className="h-4 w-4 animate-spin text-accent/60" /></div>
          ) : filteredQuotes.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/50 text-center py-8">No quotes found</p>
          ) : (
            <div className="divide-y divide-border/20">
              {filteredQuotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between py-3 px-1 hover:bg-background/20 transition-colors cursor-pointer" onClick={() => openBuilder(q.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[11px] font-medium text-foreground">{q.quote_number}</p>
                      <Badge className={`${STATUS_COLORS[q.status] || ""} text-[8px] uppercase tracking-wider`}>{q.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {q.client_name} · {q.project_type || "—"} · {format(new Date(q.created_at), "MMM d")}
                      {q.sent_at && ` · Sent ${formatDistanceToNow(new Date(q.sent_at), { addSuffix: true })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-serif font-medium text-foreground">${Number(q.total).toLocaleString()}</p>
                    <div className="flex gap-1">
                      {q.status === "internal_review" && (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateQuoteStatus(q.id, "ready_to_send"); }} className="h-6 text-[9px] uppercase tracking-wider px-1.5 text-accent">
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      {q.status === "sent" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateQuoteStatus(q.id, "accepted"); }} className="h-6 text-[9px] px-1.5 text-emerald-500">
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); updateQuoteStatus(q.id, "declined"); }} className="h-6 text-[9px] px-1.5 text-destructive">
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
