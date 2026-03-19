import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import {
  Zap, RefreshCw, Users, MapPin, Clock, DollarSign, Percent,
  AlertCircle, ChevronRight, Plus, Calculator, BarChart3, Bot,
  Eye, Mail, ArrowRight, TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  services: string[];
  status: string;
  budget_range?: string | null;
  lead_tier?: string | null;
  lead_tags?: string[] | null;
  project_vision?: string | null;
  created_at: string;
  updated_at: string;
}

interface SiteAssessment {
  id: string;
  client_name: string;
  location: string;
  slot_date: string;
  slot_time: string;
  project_type: string;
  status: string;
  project_notes?: string | null;
}

interface Job {
  id: string;
  job_name: string;
  client_name: string | null;
  status: string;
  revenue: number;
  materials_cost: number;
  labour_cost: number;
  other_costs: number;
}

interface CashFlowRow {
  id: string;
  deposit_received: number;
  mid_payment: number;
  final_payment: number;
  jobs?: { job_name: string; revenue: number } | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const PIPELINE_STAGES = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "in_progress", label: "Site Visit" },
  { key: "quoted", label: "Proposal" },
  { key: "won", label: "Closed" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OperationsCommandCentre() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [assessments, setAssessments] = useState<SiteAssessment[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlowRow[]>([]);
  const [loading, setLoading] = useState(true);

  // AI briefing
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [lastBriefing, setLastBriefing] = useState<Date | null>(null);

  // Pipeline expand
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const [inqRes, assessRes, jobRes, cfRes] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("site_assessments").select("*").gte("slot_date", today).order("slot_date", { ascending: true }).limit(10),
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("cashflow").select("*, jobs(job_name, revenue)").order("created_at", { ascending: false }),
    ]);
    setInquiries((inqRes.data as Inquiry[]) || []);
    setAssessments((assessRes.data as SiteAssessment[]) || []);
    setJobs((jobRes.data as Job[]) || []);
    setCashFlows((cfRes.data as CashFlowRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const generateBriefing = async () => {
    setBriefingLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Not authenticated"); setBriefingLoading(false); return; }
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: "daily_plan" }),
        }
      );
      if (resp.status === 429) { toast.error("Rate limited"); setBriefingLoading(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted"); setBriefingLoading(false); return; }
      const data = await resp.json();
      if (data.error) toast.error(data.error);
      else { setBriefing(data.result); setLastBriefing(new Date()); }
    } catch { toast.error("Failed to generate briefing"); }
    setBriefingLoading(false);
  };

  /* ---- Derived data ---- */
  const hotLeads = useMemo(() =>
    inquiries.filter(i =>
      i.lead_tier === "premium" || i.lead_tier === "high" ||
      (i.lead_tags && (i.lead_tags.includes("full-build") || i.lead_tags.includes("construction")))
    ).slice(0, 5),
  [inquiries]);

  const todayAssessments = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return assessments.filter(a => a.slot_date === today);
  }, [assessments]);

  const staleLeads = useMemo(() => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    return inquiries.filter(i =>
      (i.status === "new" && i.created_at < twoDaysAgo) ||
      (i.status === "contacted" && i.updated_at < twoDaysAgo)
    ).slice(0, 5);
  }, [inquiries]);

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PIPELINE_STAGES.forEach(s => { counts[s.key] = inquiries.filter(i => i.status === s.key).length; });
    counts["lost"] = inquiries.filter(i => i.status === "lost").length;
    return counts;
  }, [inquiries]);

  const financials = useMemo(() => {
    const totalRevenue = jobs.reduce((s, j) => s + j.revenue, 0);
    const totalCosts = jobs.reduce((s, j) => s + j.materials_cost + j.labour_cost + j.other_costs, 0);
    const netProfit = totalRevenue - totalCosts;
    const avgMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;
    const totalOutstanding = cashFlows.reduce((s, c) => {
      const received = c.deposit_received + c.mid_payment + c.final_payment;
      const invoiced = (c.jobs as any)?.revenue || 0;
      return s + Math.max(0, invoiced - received);
    }, 0);
    const lowMarginJobs = jobs.filter(j => {
      const cost = j.materials_cost + j.labour_cost + j.other_costs;
      return j.revenue > 0 && (j.revenue - cost) / j.revenue < 0.25;
    });
    return { totalRevenue, netProfit, avgMargin, totalOutstanding, lowMarginJobs };
  }, [jobs, cashFlows]);

  const overduePayments = useMemo(() =>
    cashFlows.filter(c => {
      const received = c.deposit_received + c.mid_payment + c.final_payment;
      const invoiced = (c.jobs as any)?.revenue || 0;
      return invoiced > 0 && (invoiced - received) > invoiced * 0.5;
    }),
  [cashFlows]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-5 w-5 animate-spin text-accent/60" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">Operations</p>
          <h2 className="font-serif text-xl tracking-tight text-foreground">Command Centre</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} className="text-[10px] uppercase tracking-wider h-8 border-border/40">
            <RefreshCw className="h-3 w-3 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Add Job", icon: Plus, to: "#financial" },
          { label: "Add Lead", icon: Users, to: "#leads" },
          { label: "Pricing", icon: Calculator, to: "#financial" },
          { label: "Financials", icon: BarChart3, to: "#financial" },
          { label: "AI Assistant", icon: Bot, to: "#ai" },
        ].map(action => (
          <a key={action.label} href={action.to}>
            <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-wider h-8 border-border/30 hover:border-accent/30 gap-1.5">
              <action.icon className="h-3 w-3" />
              {action.label}
            </Button>
          </a>
        ))}
      </div>

      {/* Snapshot counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Hot Leads", value: hotLeads.length, icon: Zap, color: "text-accent" },
          { label: "Site Visits Today", value: todayAssessments.length, icon: MapPin, color: "text-foreground" },
          { label: "Follow-Ups Due", value: staleLeads.length, icon: Clock, color: staleLeads.length > 0 ? "text-accent" : "text-foreground" },
          { label: "Financial Alerts", value: overduePayments.length + financials.lowMarginJobs.length, icon: AlertCircle, color: overduePayments.length > 0 ? "text-destructive" : "text-foreground" },
        ].map(s => (
          <Card key={s.label} className="bg-card/60 border-border/30">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60">{s.label}</p>
                  <p className={`text-2xl font-serif font-semibold mt-0.5 ${s.color}`}>{s.value}</p>
                </div>
                <s.icon className="h-4 w-4 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Briefing */}
      <Card className="bg-card/60 border-border/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-accent" />
              <CardTitle className="text-sm font-medium">Founder Briefing</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {lastBriefing && (
                <span className="text-[9px] text-muted-foreground/40">{format(lastBriefing, "h:mm a")}</span>
              )}
              <Button
                variant="outline" size="sm"
                onClick={generateBriefing}
                disabled={briefingLoading}
                className="text-[10px] uppercase tracking-wider h-7 border-border/30"
              >
                {briefingLoading ? <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" /> : <Zap className="h-3 w-3 mr-1.5" />}
                {briefing ? "Refresh" : "Generate"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {briefingLoading && (
            <div className="text-center py-6">
              <RefreshCw className="h-4 w-4 text-accent/60 mx-auto animate-spin mb-2" />
              <p className="text-[11px] text-muted-foreground">Building briefing…</p>
            </div>
          )}
          {!briefing && !briefingLoading && (
            <p className="text-[11px] text-muted-foreground/50 text-center py-4">
              Generate a briefing to see today's priorities, actions, and alerts.
            </p>
          )}
          {briefing && !briefingLoading && (
            <div className="prose prose-sm prose-invert max-w-none
              prose-headings:font-serif prose-headings:text-foreground prose-headings:font-medium
              prose-h2:text-sm prose-h2:uppercase prose-h2:tracking-[0.1em] prose-h2:border-b prose-h2:border-border/20 prose-h2:pb-2 prose-h2:mb-3
              prose-p:text-muted-foreground prose-p:text-[12px] prose-p:leading-relaxed
              prose-li:text-muted-foreground prose-li:text-[12px]
              prose-strong:text-accent prose-strong:font-medium
              prose-ul:space-y-0.5
            ">
              <ReactMarkdown>{briefing}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main grid: Priority (left) + Financial (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: Priority Panel — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Hot Leads */}
          <Card className="bg-card/60 border-border/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                </div>
                <Badge variant="outline" className="text-[9px] border-accent/30 text-accent">{hotLeads.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {hotLeads.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/50 py-2">No hot leads at the moment.</p>
              ) : (
                <div className="divide-y divide-border/20">
                  {hotLeads.map(lead => (
                    <div key={lead.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                          <Badge variant="secondary" className="text-[8px] uppercase tracking-wider bg-accent/15 text-accent shrink-0">
                            {lead.lead_tier}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {lead.services.slice(0, 2).join(", ")} {lead.budget_range ? `· ${lead.budget_range}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link to="/admin" state={{ viewInquiry: lead.id }}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-accent">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <a href={`mailto:${lead.email}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-accent">
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Site Visits */}
          <Card className="bg-card/60 border-border/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-accent/70" />
                  <CardTitle className="text-sm font-medium">Today's Site Visits</CardTitle>
                </div>
                <Badge variant="outline" className="text-[9px] border-border/30">{todayAssessments.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {todayAssessments.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/50 py-2">No site visits scheduled today.</p>
              ) : (
                <div className="divide-y divide-border/20">
                  {todayAssessments.map(a => (
                    <div key={a.id} className="py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{a.client_name}</p>
                        <span className="text-[11px] text-accent tabular-nums">{a.slot_time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{a.location} · {a.project_type}</p>
                      {a.project_notes && <p className="text-[10px] text-muted-foreground/50 mt-0.5">{a.project_notes}</p>}
                    </div>
                  ))}
                </div>
              )}
              {assessments.length > todayAssessments.length && (
                <div className="pt-2 border-t border-border/10">
                  <p className="text-[10px] text-muted-foreground/40">
                    {assessments.length - todayAssessments.length} upcoming assessment{assessments.length - todayAssessments.length !== 1 ? "s" : ""} scheduled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow-Ups Due */}
          <Card className="bg-card/60 border-border/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <CardTitle className="text-sm font-medium">Follow-Ups Due</CardTitle>
                </div>
                <Badge variant="outline" className={`text-[9px] ${staleLeads.length > 0 ? "border-accent/30 text-accent" : "border-border/30"}`}>
                  {staleLeads.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {staleLeads.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/50 py-2">All follow-ups are current.</p>
              ) : (
                <div className="divide-y divide-border/20">
                  {staleLeads.map(lead => {
                    const daysStale = Math.floor((Date.now() - new Date(lead.updated_at).getTime()) / 86400000);
                    const stage = daysStale <= 2 ? "Day 2" : daysStale <= 5 ? "Day 5" : "Day 10";
                    return (
                      <div key={lead.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                            <Badge variant="outline" className="text-[8px] uppercase tracking-wider border-border/30 shrink-0">
                              {stage}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {lead.status} · {daysStale}d since update
                          </p>
                        </div>
                        <a href={`mailto:${lead.email}`}>
                          <Button variant="outline" size="sm" className="text-[9px] uppercase tracking-wider h-7 border-border/30 hover:border-accent/30">
                            <Mail className="h-3 w-3 mr-1" /> Reply
                          </Button>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Financial Snapshot — 1 col */}
        <div className="space-y-4">
          <Card className="bg-card/60 border-border/30">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-accent/70" />
                <CardTitle className="text-sm font-medium">Financial Snapshot</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                { label: "Revenue", value: fmt(financials.totalRevenue), icon: TrendingUp },
                { label: "Net Profit", value: fmt(financials.netProfit), icon: DollarSign, color: financials.netProfit >= 0 ? "text-emerald-500" : "text-destructive" },
                { label: "Margin", value: pct(financials.avgMargin), icon: Percent },
                { label: "Outstanding", value: fmt(financials.totalOutstanding), icon: AlertCircle, color: financials.totalOutstanding > 0 ? "text-accent" : "text-emerald-500" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-3 w-3 text-muted-foreground/30" />
                    <span className="text-[11px] text-muted-foreground">{item.label}</span>
                  </div>
                  <span className={`text-sm font-serif font-semibold tabular-nums ${item.color || "text-foreground"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Financial Alerts */}
          {(overduePayments.length > 0 || financials.lowMarginJobs.length > 0) && (
            <Card className="bg-card/60 border-border/30 border-l-2 border-l-destructive/40">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-destructive/70" />
                  <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {overduePayments.map(c => (
                  <div key={c.id} className="text-[11px] text-muted-foreground">
                    <span className="text-destructive/80">⚠</span>{" "}
                    {(c.jobs as any)?.job_name || "Unknown"} — {">"}50% outstanding
                  </div>
                ))}
                {financials.lowMarginJobs.map(j => (
                  <div key={j.id} className="text-[11px] text-muted-foreground">
                    <span className="text-accent/80">⚠</span>{" "}
                    {j.job_name} — margin below 25%
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick nav to full financial */}
          <a href="#financial">
            <Button variant="outline" className="w-full text-[10px] uppercase tracking-wider h-8 border-border/30 hover:border-accent/30 justify-between">
              View Full Financials
              <ArrowRight className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>

      {/* Pipeline Strip */}
      <Card className="bg-card/60 border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-stretch gap-0 rounded-sm overflow-hidden border border-border/20">
            {PIPELINE_STAGES.map((stage, i) => {
              const count = pipelineCounts[stage.key] || 0;
              const isExpanded = expandedStage === stage.key;
              return (
                <button
                  key={stage.key}
                  onClick={() => setExpandedStage(isExpanded ? null : stage.key)}
                  className={`flex-1 py-3 px-2 text-center transition-all duration-200 border-r border-border/10 last:border-r-0 hover:bg-accent/5 ${isExpanded ? "bg-accent/10" : ""}`}
                >
                  <p className="text-lg font-serif font-semibold text-foreground">{count}</p>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/60 mt-0.5">{stage.label}</p>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground/20 mx-auto mt-1" />
                  )}
                </button>
              );
            })}
          </div>
          {/* Expanded stage list */}
          {expandedStage && (
            <div className="mt-3 border-t border-border/20 pt-3">
              <div className="space-y-1.5">
                {inquiries.filter(i => i.status === expandedStage).slice(0, 8).map(i => (
                  <div key={i.id} className="flex items-center justify-between py-1.5 px-2 rounded-sm hover:bg-background/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{i.name}</p>
                      <p className="text-[10px] text-muted-foreground">{i.services.slice(0, 2).join(", ")}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50">{format(new Date(i.created_at), "MMM d")}</span>
                  </div>
                ))}
                {inquiries.filter(i => i.status === expandedStage).length > 8 && (
                  <p className="text-[10px] text-muted-foreground/40 px-2">
                    +{inquiries.filter(i => i.status === expandedStage).length - 8} more
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
