import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface JobProfit {
  id: string;
  job_name: string;
  client_name: string | null;
  location: string | null;
  status: string;
  revenue: number;
  estimated_cost: number;
  actual_cost: number;
  gross_profit: number;
  margin_percentage: number;
  profit_status: string;
}

interface CostEntry {
  id: string;
  job_id: string;
  category: string;
  description: string | null;
  cost_amount: number;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  on_track: { label: "On Track", color: "bg-emerald-600/20 text-emerald-400", icon: CheckCircle },
  watch: { label: "Watch", color: "bg-amber-600/20 text-amber-400", icon: TrendingUp },
  at_risk: { label: "At Risk", color: "bg-orange-600/20 text-orange-400", icon: TrendingDown },
  critical: { label: "Critical", color: "bg-destructive/20 text-destructive", icon: AlertTriangle },
};

const COST_CATEGORIES = [
  { value: "labour", label: "Labour" },
  { value: "materials", label: "Materials" },
  { value: "machinery", label: "Machinery" },
  { value: "subcontractor", label: "Subcontractor" },
  { value: "misc", label: "Miscellaneous" },
];

const fmt = (v: number) => `$${v.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function ProjectProfitTracker() {
  const [jobs, setJobs] = useState<JobProfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [costEntries, setCostEntries] = useState<CostEntry[]>([]);
  const [addCostOpen, setAddCostOpen] = useState<string | null>(null);
  const [newCost, setNewCost] = useState({ category: "labour", description: "", cost_amount: "" });
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("jobs")
      .select("id, job_name, client_name, location, status, revenue, estimated_cost, actual_cost, gross_profit, margin_percentage, profit_status")
      .in("status", ["active", "in_progress", "completed"])
      .order("margin_percentage", { ascending: true }) as any;
    setJobs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const loadCostEntries = async (jobId: string) => {
    const { data } = await supabase
      .from("job_cost_entries")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false }) as any;
    setCostEntries(data || []);
  };

  const toggleExpand = (jobId: string) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
    } else {
      setExpandedJob(jobId);
      loadCostEntries(jobId);
    }
  };

  const addCostEntry = async () => {
    if (!addCostOpen || !newCost.cost_amount) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("job_cost_entries").insert({
        job_id: addCostOpen,
        category: newCost.category,
        description: newCost.description || null,
        cost_amount: parseFloat(newCost.cost_amount),
      } as any);
      if (error) throw error;

      await supabase.from("activity_log").insert({
        action_type: "cost_entry_added",
        title: `Cost entry: ${fmt(parseFloat(newCost.cost_amount))}`,
        description: `${newCost.category} — ${newCost.description || "No description"}`,
        category: "finance",
        entity_type: "job",
        entity_id: addCostOpen,
        action_level: "autonomous",
      } as any);

      toast.success("Cost entry added");
      setNewCost({ category: "labour", description: "", cost_amount: "" });
      setAddCostOpen(null);
      loadJobs();
      if (expandedJob === addCostOpen) loadCostEntries(addCostOpen);
    } catch (e: any) {
      toast.error(e.message || "Failed to add cost");
    }
    setSaving(false);
  };

  const updateEstimatedCost = async (jobId: string, value: number) => {
    await supabase.from("jobs").update({ estimated_cost: value } as any).eq("id", jobId);
    loadJobs();
  };

  // Summary stats
  const activeJobs = jobs.filter((j) => j.status === "active" || j.status === "in_progress");
  const atRiskJobs = jobs.filter((j) => j.profit_status === "at_risk" || j.profit_status === "critical");
  const avgMargin = activeJobs.length > 0
    ? activeJobs.reduce((s, j) => s + j.margin_percentage, 0) / activeJobs.length
    : 0;
  const totalProfit = activeJobs.reduce((s, j) => s + j.gross_profit, 0);

  const filteredJobs = statusFilter === "all" ? jobs : jobs.filter((j) => j.profit_status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">Profit Control</p>
          <h3 className="font-serif text-lg tracking-tight text-foreground">Project Margin Tracker</h3>
        </div>
        <Button variant="outline" size="sm" onClick={loadJobs} disabled={loading} className="text-[11px] uppercase tracking-wider border-border/40">
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Jobs", value: String(activeJobs.length), icon: DollarSign },
          { label: "Avg Margin", value: `${avgMargin.toFixed(1)}%`, icon: TrendingUp },
          { label: "Total Profit", value: fmt(totalProfit), icon: DollarSign },
          { label: "At Risk", value: String(atRiskJobs.length), icon: AlertTriangle, alert: atRiskJobs.length > 0 },
        ].map((s) => (
          <Card key={s.label} className={`bg-card/80 border-border/40 ${s.alert ? "border-destructive/40" : ""}`}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60">{s.label}</p>
                <s.icon className={`h-3.5 w-3.5 ${s.alert ? "text-destructive" : "text-accent/60"}`} />
              </div>
              <p className={`text-lg font-serif font-semibold mt-1 ${s.alert ? "text-destructive" : "text-foreground"}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "on_track", "watch", "at_risk", "critical"].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="text-[9px] uppercase tracking-wider h-7"
          >
            {s === "all" ? "All" : (STATUS_CONFIG[s]?.label || s)}
          </Button>
        ))}
      </div>

      {/* Job Cards */}
      <div className="space-y-2">
        {filteredJobs.length === 0 ? (
          <Card className="bg-card/80 border-border/40">
            <CardContent className="py-8 text-center">
              <p className="text-[11px] text-muted-foreground/50">No jobs found</p>
            </CardContent>
          </Card>
        ) : filteredJobs.map((job) => {
          const cfg = STATUS_CONFIG[job.profit_status] || STATUS_CONFIG.on_track;
          const StatusIcon = cfg.icon;
          const estVsActual = job.estimated_cost > 0
            ? ((job.actual_cost / job.estimated_cost) * 100).toFixed(0)
            : "—";
          const isExpanded = expandedJob === job.id;

          return (
            <Card key={job.id} className="bg-card/80 border-border/40">
              <CardContent className="py-3 px-4">
                {/* Main row */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleExpand(job.id)}>
                  <StatusIcon className={`h-4 w-4 flex-shrink-0 ${cfg.color.split(" ")[1]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{job.job_name}</p>
                      <Badge className={`${cfg.color} text-[8px] uppercase tracking-wider`}>{cfg.label}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 truncate">
                      {job.client_name || "—"} {job.location ? `· ${job.location}` : ""}
                    </p>
                  </div>

                  {/* Key metrics */}
                  <div className="hidden sm:grid grid-cols-4 gap-4 text-right flex-shrink-0">
                    <div>
                      <p className="text-[8px] uppercase text-muted-foreground/50">Revenue</p>
                      <p className="text-[11px] font-medium text-foreground">{fmt(job.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase text-muted-foreground/50">Actual Cost</p>
                      <p className="text-[11px] font-medium text-foreground">{fmt(job.actual_cost)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase text-muted-foreground/50">Profit</p>
                      <p className={`text-[11px] font-medium ${job.gross_profit >= 0 ? "text-emerald-400" : "text-destructive"}`}>{fmt(job.gross_profit)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase text-muted-foreground/50">Margin</p>
                      <p className={`text-[11px] font-bold ${job.margin_percentage >= 25 ? "text-emerald-400" : job.margin_percentage >= 15 ? "text-amber-400" : "text-destructive"}`}>
                        {job.margin_percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setAddCostOpen(job.id); }}>
                    <Plus className="h-3.5 w-3.5 text-accent" />
                  </Button>

                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/50" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />}
                </div>

                {/* Mobile metrics */}
                <div className="sm:hidden grid grid-cols-4 gap-2 mt-2 text-center">
                  <div><p className="text-[8px] text-muted-foreground/50">Rev</p><p className="text-[10px] font-medium">{fmt(job.revenue)}</p></div>
                  <div><p className="text-[8px] text-muted-foreground/50">Cost</p><p className="text-[10px] font-medium">{fmt(job.actual_cost)}</p></div>
                  <div><p className="text-[8px] text-muted-foreground/50">Profit</p><p className={`text-[10px] font-medium ${job.gross_profit >= 0 ? "text-emerald-400" : "text-destructive"}`}>{fmt(job.gross_profit)}</p></div>
                  <div><p className="text-[8px] text-muted-foreground/50">Margin</p><p className={`text-[10px] font-bold ${job.margin_percentage >= 25 ? "text-emerald-400" : job.margin_percentage >= 15 ? "text-amber-400" : "text-destructive"}`}>{job.margin_percentage.toFixed(1)}%</p></div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-border/20 space-y-3">
                    {/* Estimate bar */}
                    <div className="flex items-center gap-3">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 w-24">Est. vs Actual</p>
                      <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            Number(estVsActual) > 100 ? "bg-destructive" : Number(estVsActual) > 80 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(Number(estVsActual) || 0, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-medium text-foreground w-12 text-right">{estVsActual}%</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[8px] uppercase text-muted-foreground/50 mb-1">Estimated Cost</p>
                        <Input
                          type="number"
                          defaultValue={job.estimated_cost}
                          onBlur={(e) => updateEstimatedCost(job.id, parseFloat(e.target.value) || 0)}
                          className="h-7 text-[11px] bg-background/60 border-border/30"
                        />
                      </div>
                      <div>
                        <p className="text-[8px] uppercase text-muted-foreground/50 mb-1">Actual Cost (auto)</p>
                        <p className="text-sm font-medium text-foreground pt-1">{fmt(job.actual_cost)}</p>
                      </div>
                    </div>

                    {/* Cost entries */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Cost Entries</p>
                        <Button variant="outline" size="sm" onClick={() => setAddCostOpen(job.id)} className="h-6 text-[9px] uppercase tracking-wider">
                          <Plus className="h-3 w-3 mr-1" />Add Cost
                        </Button>
                      </div>
                      {costEntries.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground/40 text-center py-3">No cost entries recorded</p>
                      ) : (
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {costEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between py-1.5 px-2 rounded-sm bg-background/30">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[8px] uppercase">{entry.category}</Badge>
                                <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{entry.description || "—"}</span>
                              </div>
                              <span className="text-[11px] font-medium text-foreground">{fmt(entry.cost_amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Cost Dialog */}
      <Dialog open={!!addCostOpen} onOpenChange={(v) => !v && setAddCostOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-base">Add Cost Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Category</p>
              <Select value={newCost.category} onValueChange={(v) => setNewCost({ ...newCost, category: v })}>
                <SelectTrigger className="h-8 bg-background/60 border-border/50 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Amount ($)</p>
              <Input
                type="number"
                value={newCost.cost_amount}
                onChange={(e) => setNewCost({ ...newCost, cost_amount: e.target.value })}
                placeholder="0.00"
                className="h-8 bg-background/60 border-border/50 text-sm"
              />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Description</p>
              <Textarea
                value={newCost.description}
                onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
                className="bg-background/60 border-border/50 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCostOpen(null)} className="text-[11px] uppercase tracking-wider">Cancel</Button>
            <Button onClick={addCostEntry} disabled={saving || !newCost.cost_amount} className="text-[11px] uppercase tracking-wider">
              {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
