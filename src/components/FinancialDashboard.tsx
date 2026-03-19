import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DollarSign, TrendingUp, Percent, Plus, Trash2, Pencil, Save,
  RefreshCw, AlertCircle, Filter,
} from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Job {
  id: string;
  created_at: string;
  job_name: string;
  client_name: string | null;
  location: string | null;
  status: string;
  revenue: number;
  materials_cost: number;
  labour_cost: number;
  other_costs: number;
  notes: string | null;
}

interface CashFlowRow {
  id: string;
  job_id: string;
  deposit_received: number;
  mid_payment: number;
  final_payment: number;
  jobs?: { job_name: string; revenue: number } | null;
}

interface PricingCalc {
  id: string;
  created_at: string;
  calculation_name: string | null;
  materials_cost: number;
  labour_cost: number;
  other_costs: number;
  complexity_multiplier: number;
  target_margin: number;
  notes: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmt = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const TH = "text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium h-10";
const INPUT = "h-9 bg-background/60 border-border/50 rounded-sm text-sm tabular-nums";

const jobTotal = (j: Job) => j.materials_cost + j.labour_cost + j.other_costs;
const jobProfit = (j: Job) => j.revenue - jobTotal(j);
const jobMargin = (j: Job) => (j.revenue > 0 ? jobProfit(j) / j.revenue : 0);

type DateRange = "month" | "last_month" | "all";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FinancialDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Job dialog
  const [jobDialog, setJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<Job> & { id?: string }>({});
  const [savingJob, setSavingJob] = useState(false);
  const [deleteJob, setDeleteJob] = useState<Job | null>(null);

  // Cash flow dialog
  const [cfDialog, setCfDialog] = useState(false);
  const [editingCf, setEditingCf] = useState<Partial<CashFlowRow> & { id?: string }>({});
  const [savingCf, setSavingCf] = useState(false);
  const [deleteCf, setDeleteCf] = useState<CashFlowRow | null>(null);

  // Pricing calculator
  const [calc, setCalc] = useState({ materials: 30000, labour: 25000, other: 5000 });
  const [multiplier, setMultiplier] = useState("1.0");
  const [targetMargin, setTargetMargin] = useState("0.30");
  const [calcName, setCalcName] = useState("");
  const [savingCalc, setSavingCalc] = useState(false);

  /* ---- Fetch ---- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [jobRes, cfRes] = await Promise.all([
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("cashflow").select("*, jobs(job_name, revenue)").order("created_at", { ascending: false }),
    ]);
    if (jobRes.error) toast.error("Failed to load jobs");
    else setJobs((jobRes.data as Job[]) || []);
    if (cfRes.error) toast.error("Failed to load cash flow");
    else setCashFlows((cfRes.data as CashFlowRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ---- Date filter ---- */
  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (dateRange === "month") {
      const s = startOfMonth(new Date()).toISOString();
      const e = endOfMonth(new Date()).toISOString();
      list = list.filter((j) => j.created_at >= s && j.created_at <= e);
    } else if (dateRange === "last_month") {
      const prev = subMonths(new Date(), 1);
      const s = startOfMonth(prev).toISOString();
      const e = endOfMonth(prev).toISOString();
      list = list.filter((j) => j.created_at >= s && j.created_at <= e);
    }
    if (statusFilter !== "all") {
      list = list.filter((j) => j.status === statusFilter);
    }
    return list;
  }, [jobs, dateRange, statusFilter]);

  /* ---- Overview ---- */
  const overview = useMemo(() => {
    const totalRevenue = filteredJobs.reduce((s, j) => s + j.revenue, 0);
    const totalCosts = filteredJobs.reduce((s, j) => s + jobTotal(j), 0);
    const netProfit = totalRevenue - totalCosts;
    const avgMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;
    const totalOutstanding = cashFlows.reduce((s, c) => {
      const received = c.deposit_received + c.mid_payment + c.final_payment;
      const invoiced = (c.jobs as any)?.revenue || 0;
      return s + Math.max(0, invoiced - received);
    }, 0);
    return { totalRevenue, totalCosts, netProfit, avgMargin, totalOutstanding };
  }, [filteredJobs, cashFlows]);

  /* ---- Job CRUD ---- */
  const openNewJob = () => {
    setEditingJob({ job_name: "", client_name: "", location: "", status: "active", revenue: 0, materials_cost: 0, labour_cost: 0, other_costs: 0, notes: "" });
    setJobDialog(true);
  };
  const openEditJob = (j: Job) => { setEditingJob({ ...j }); setJobDialog(true); };

  const handleSaveJob = async () => {
    if (!editingJob.job_name?.trim()) { toast.error("Job name is required"); return; }
    setSavingJob(true);
    const payload = {
      job_name: editingJob.job_name!.trim(),
      client_name: editingJob.client_name || null,
      location: editingJob.location || null,
      status: editingJob.status || "active",
      revenue: Number(editingJob.revenue) || 0,
      materials_cost: Number(editingJob.materials_cost) || 0,
      labour_cost: Number(editingJob.labour_cost) || 0,
      other_costs: Number(editingJob.other_costs) || 0,
      notes: editingJob.notes || null,
    };
    let err;
    if (editingJob.id) {
      ({ error: err } = await supabase.from("jobs").update(payload).eq("id", editingJob.id));
    } else {
      ({ error: err } = await supabase.from("jobs").insert(payload));
    }
    setSavingJob(false);
    if (err) toast.error("Failed to save job");
    else { toast.success(editingJob.id ? "Job updated" : "Job created"); setJobDialog(false); fetchAll(); }
  };

  const handleDeleteJob = async () => {
    if (!deleteJob) return;
    const { error } = await supabase.from("jobs").delete().eq("id", deleteJob.id);
    if (error) toast.error("Failed to delete job");
    else { toast.success("Job deleted"); setDeleteJob(null); fetchAll(); }
  };

  /* ---- Cash flow CRUD ---- */
  const openNewCf = () => {
    setEditingCf({ job_id: jobs[0]?.id || "", deposit_received: 0, mid_payment: 0, final_payment: 0 });
    setCfDialog(true);
  };
  const openEditCf = (c: CashFlowRow) => { setEditingCf({ ...c }); setCfDialog(true); };

  const handleSaveCf = async () => {
    if (!editingCf.job_id) { toast.error("Select a job"); return; }
    setSavingCf(true);
    const payload = {
      job_id: editingCf.job_id!,
      deposit_received: Number(editingCf.deposit_received) || 0,
      mid_payment: Number(editingCf.mid_payment) || 0,
      final_payment: Number(editingCf.final_payment) || 0,
    };
    let err;
    if (editingCf.id) {
      ({ error: err } = await supabase.from("cashflow").update(payload).eq("id", editingCf.id));
    } else {
      ({ error: err } = await supabase.from("cashflow").insert(payload));
    }
    setSavingCf(false);
    if (err) toast.error("Failed to save cash flow entry");
    else { toast.success(editingCf.id ? "Updated" : "Created"); setCfDialog(false); fetchAll(); }
  };

  const handleDeleteCf = async () => {
    if (!deleteCf) return;
    const { error } = await supabase.from("cashflow").delete().eq("id", deleteCf.id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); setDeleteCf(null); fetchAll(); }
  };

  /* ---- Pricing calc ---- */
  const calcTotal = calc.materials + calc.labour + calc.other;
  const calcAdjusted = calcTotal * Number(multiplier);
  const calcFinal = calcAdjusted / (1 - Number(targetMargin));

  const handleSaveCalc = async () => {
    setSavingCalc(true);
    const { error } = await supabase.from("pricing_calculations").insert({
      calculation_name: calcName.trim() || null,
      materials_cost: calc.materials,
      labour_cost: calc.labour,
      other_costs: calc.other,
      complexity_multiplier: Number(multiplier),
      target_margin: Number(targetMargin),
    });
    setSavingCalc(false);
    if (error) toast.error("Failed to save calculation");
    else { toast.success("Calculation saved"); setCalcName(""); }
  };

  /* ---- Render ---- */
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-t border-accent/20 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">Internal</p>
            <h2 className="font-serif text-xl tracking-tight text-foreground">Financial Control</h2>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="h-9 w-[140px] bg-card/60 border-border/40 rounded-sm text-[11px]">
                <Filter className="mr-1.5 h-3 w-3 text-muted-foreground/50" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[120px] bg-card/60 border-border/40 rounded-sm text-[11px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="h-9 border-border/40 text-[11px] uppercase tracking-wider">
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* 1. Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Revenue", value: fmt(overview.totalRevenue), icon: DollarSign },
          { label: "Total Costs", value: fmt(overview.totalCosts), icon: TrendingUp },
          { label: "Net Profit", value: fmt(overview.netProfit), icon: DollarSign, color: overview.netProfit >= 0 ? "text-emerald-500" : "text-destructive" },
          { label: "Avg Margin", value: pct(overview.avgMargin), icon: Percent },
          { label: "Outstanding", value: fmt(overview.totalOutstanding), icon: AlertCircle, color: overview.totalOutstanding > 0 ? "text-accent" : "text-emerald-500" },
        ].map((s) => (
          <Card key={s.label} className="bg-card/80 border-border/40">
            <CardHeader className="pb-1 pt-4 px-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{s.label}</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <span className={`text-xl font-serif font-semibold ${s.color || "text-foreground"}`}>{s.value}</span>
                <s.icon className="h-4 w-4 text-accent/60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Job Profit Tracker */}
      <Card className="bg-card/80 border-border/40 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Profitability</p>
              <CardTitle className="text-base font-medium">Job Profit Tracker</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={openNewJob} className="text-[11px] uppercase tracking-wider border-border/40">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Job
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-accent/60" /></div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No jobs found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className={TH}>Job</TableHead>
                    <TableHead className={TH}>Client</TableHead>
                    <TableHead className={TH}>Status</TableHead>
                    <TableHead className={`${TH} text-right`}>Revenue</TableHead>
                    <TableHead className={`${TH} text-right`}>Total Cost</TableHead>
                    <TableHead className={`${TH} text-right`}>Profit</TableHead>
                    <TableHead className={`${TH} text-right`}>Margin</TableHead>
                    <TableHead className={`${TH} w-20`} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((j) => {
                    const tc = jobTotal(j);
                    const p = jobProfit(j);
                    const m = jobMargin(j);
                    return (
                      <TableRow key={j.id} className="border-border/20 hover:bg-accent/[0.03]">
                        <TableCell className="text-sm font-medium">{j.job_name}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">{j.client_name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-border/40">{j.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{fmt(j.revenue)}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">{fmt(tc)}</TableCell>
                        <TableCell className={`text-right text-sm tabular-nums font-medium ${p >= 0 ? "text-emerald-500" : "text-destructive"}`}>{fmt(p)}</TableCell>
                        <TableCell className={`text-right text-sm tabular-nums ${m >= 0.3 ? "text-emerald-500" : m >= 0.2 ? "text-accent" : "text-destructive"}`}>{pct(m)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-accent" onClick={() => openEditJob(j)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/50 hover:text-destructive" onClick={() => setDeleteJob(j)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Pricing Calculator */}
      <Card className="bg-card/80 border-border/40">
        <CardHeader className="pb-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Pricing</p>
          <CardTitle className="text-base font-medium">Quote Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {([
                { label: "Materials Cost", key: "materials" as const },
                { label: "Labour Cost", key: "labour" as const },
                { label: "Other Costs", key: "other" as const },
              ]).map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">{f.label}</Label>
                  <Input type="number" value={calc[f.key] || ""} onChange={(e) => setCalc((p) => ({ ...p, [f.key]: Math.max(0, Number(e.target.value) || 0) }))} className={INPUT} />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Complexity Multiplier</Label>
                <Select value={multiplier} onValueChange={setMultiplier}>
                  <SelectTrigger className="h-9 bg-background/60 border-border/50 rounded-sm text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["1.0", "1.15", "1.25", "1.35", "1.5"].map((v) => (<SelectItem key={v} value={v}>{v}×</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Target Margin</Label>
                <Select value={targetMargin} onValueChange={setTargetMargin}>
                  <SelectTrigger className="h-9 bg-background/60 border-border/50 rounded-sm text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[{ v: "0.25", l: "25%" }, { v: "0.30", l: "30%" }, { v: "0.35", l: "35%" }, { v: "0.40", l: "40%" }].map((m) => (<SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 pt-2">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Save As</Label>
                <div className="flex gap-2">
                  <Input value={calcName} onChange={(e) => setCalcName(e.target.value)} placeholder="Calculation name (optional)" className={`${INPUT} flex-1`} />
                  <Button size="sm" onClick={handleSaveCalc} disabled={savingCalc} className="h-9 text-[11px] uppercase tracking-wider">
                    {savingCalc ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />} Save
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              {[
                { label: "Total Cost", value: fmt(calcTotal) },
                { label: "Adjusted Cost", value: fmt(calcAdjusted) },
                { label: "Final Price", value: fmt(calcFinal), highlight: true },
              ].map((o) => (
                <div key={o.label} className={`p-4 rounded-sm border ${o.highlight ? "border-accent/30 bg-accent/[0.04]" : "border-border/30 bg-background/40"}`}>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">{o.label}</p>
                  <p className={`text-2xl font-serif font-semibold ${o.highlight ? "text-accent" : "text-foreground"}`}>{o.value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Cash Flow Tracker */}
      <Card className="bg-card/80 border-border/40 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Cash Flow</p>
              <CardTitle className="text-base font-medium">Payment Tracker</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={openNewCf} disabled={jobs.length === 0} className="text-[11px] uppercase tracking-wider border-border/40">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-accent/60" /></div>
          ) : cashFlows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No cash flow entries</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className={TH}>Job</TableHead>
                    <TableHead className={`${TH} text-right`}>Deposit</TableHead>
                    <TableHead className={`${TH} text-right`}>Mid Payment</TableHead>
                    <TableHead className={`${TH} text-right`}>Final Payment</TableHead>
                    <TableHead className={`${TH} text-right`}>Total Received</TableHead>
                    <TableHead className={`${TH} text-right`}>Remaining</TableHead>
                    <TableHead className={`${TH} w-20`} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlows.map((c) => {
                    const received = c.deposit_received + c.mid_payment + c.final_payment;
                    const invoiced = (c.jobs as any)?.revenue || 0;
                    const remaining = invoiced - received;
                    return (
                      <TableRow key={c.id} className="border-border/20 hover:bg-accent/[0.03]">
                        <TableCell className="text-sm font-medium">{(c.jobs as any)?.job_name || "—"}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{fmt(c.deposit_received)}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{fmt(c.mid_payment)}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{fmt(c.final_payment)}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-foreground font-medium">{fmt(received)}</TableCell>
                        <TableCell className={`text-right text-sm tabular-nums font-medium ${remaining > 0 ? "text-accent" : "text-emerald-500"}`}>{fmt(remaining)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-accent" onClick={() => openEditCf(c)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/50 hover:text-destructive" onClick={() => setDeleteCf(c)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Job Dialog ── */}
      <Dialog open={jobDialog} onOpenChange={setJobDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">{editingJob.id ? "Edit Job" : "New Job"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Job Name *</Label>
              <Input value={editingJob.job_name || ""} onChange={(e) => setEditingJob((p) => ({ ...p, job_name: e.target.value }))} className={INPUT} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Client</Label>
                <Input value={editingJob.client_name || ""} onChange={(e) => setEditingJob((p) => ({ ...p, client_name: e.target.value }))} className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Location</Label>
                <Input value={editingJob.location || ""} onChange={(e) => setEditingJob((p) => ({ ...p, location: e.target.value }))} className={INPUT} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Status</Label>
              <Select value={editingJob.status || "active"} onValueChange={(v) => setEditingJob((p) => ({ ...p, status: v }))}>
                <SelectTrigger className="h-9 bg-background/60 border-border/50 rounded-sm text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {([
                { label: "Revenue", key: "revenue" },
                { label: "Materials Cost", key: "materials_cost" },
                { label: "Labour Cost", key: "labour_cost" },
                { label: "Other Costs", key: "other_costs" },
              ] as const).map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">{f.label}</Label>
                  <Input type="number" value={editingJob[f.key] ?? ""} onChange={(e) => setEditingJob((p) => ({ ...p, [f.key]: Math.max(0, Number(e.target.value) || 0) }))} className={INPUT} />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Notes</Label>
              <Textarea value={editingJob.notes || ""} onChange={(e) => setEditingJob((p) => ({ ...p, notes: e.target.value }))} className="bg-background/60 border-border/50 rounded-sm text-sm" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobDialog(false)} className="text-[11px] uppercase tracking-wider">Cancel</Button>
            <Button onClick={handleSaveJob} disabled={savingJob} className="text-[11px] uppercase tracking-wider">
              {savingJob ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-2" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cash Flow Dialog ── */}
      <Dialog open={cfDialog} onOpenChange={setCfDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">{editingCf.id ? "Edit Payment" : "New Payment Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Job *</Label>
              <Select value={editingCf.job_id || ""} onValueChange={(v) => setEditingCf((p) => ({ ...p, job_id: v }))}>
                <SelectTrigger className="h-9 bg-background/60 border-border/50 rounded-sm text-sm"><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>
                  {jobs.map((j) => (<SelectItem key={j.id} value={j.id}>{j.job_name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {([
              { label: "Deposit Received", key: "deposit_received" as const },
              { label: "Mid Payment", key: "mid_payment" as const },
              { label: "Final Payment", key: "final_payment" as const },
            ]).map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">{f.label}</Label>
                <Input type="number" value={editingCf[f.key] ?? ""} onChange={(e) => setEditingCf((p) => ({ ...p, [f.key]: Math.max(0, Number(e.target.value) || 0) }))} className={INPUT} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCfDialog(false)} className="text-[11px] uppercase tracking-wider">Cancel</Button>
            <Button onClick={handleSaveCf} disabled={savingCf} className="text-[11px] uppercase tracking-wider">
              {savingCf ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-2" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmations ── */}
      <AlertDialog open={!!deleteJob} onOpenChange={() => setDeleteJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Job</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">Delete "{deleteJob?.job_name}"? This will also remove linked cash flow entries. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[11px] uppercase tracking-wider">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[11px] uppercase tracking-wider">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteCf} onOpenChange={() => setDeleteCf(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Payment Entry</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">Delete this cash flow entry? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[11px] uppercase tracking-wider">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCf} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[11px] uppercase tracking-wider">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
