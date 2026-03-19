import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Percent, Plus, Trash2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Job {
  id: string;
  name: string;
  revenue: number;
  materials: number;
  labour: number;
  other: number;
}

interface CashFlowEntry {
  id: string;
  job: string;
  deposit: number;
  midPayment: number;
  finalPayment: number;
  totalInvoiced: number;
}

const uid = () => crypto.randomUUID();

const fmt = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const TH = "text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium h-10";
const INPUT = "h-9 bg-background/60 border-border/50 rounded-sm text-sm tabular-nums";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FinancialDashboard() {
  /* ---- Jobs state ---- */
  const [jobs, setJobs] = useState<Job[]>([
    { id: uid(), name: "Main Ridge Arena", revenue: 85000, materials: 22000, labour: 28000, other: 5000 },
    { id: uid(), name: "Somerville Stables", revenue: 120000, materials: 35000, labour: 42000, other: 8000 },
  ]);

  const addJob = () =>
    setJobs((prev) => [...prev, { id: uid(), name: "", revenue: 0, materials: 0, labour: 0, other: 0 }]);

  const removeJob = (id: string) => setJobs((prev) => prev.filter((j) => j.id !== id));

  const updateJob = (id: string, field: keyof Omit<Job, "id">, value: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, [field]: field === "name" ? value : Math.max(0, Number(value) || 0) }
          : j,
      ),
    );
  };

  /* ---- Cash flow state ---- */
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([
    { id: uid(), job: "Main Ridge Arena", deposit: 25000, midPayment: 30000, finalPayment: 0, totalInvoiced: 85000 },
    { id: uid(), job: "Somerville Stables", deposit: 36000, midPayment: 0, finalPayment: 0, totalInvoiced: 120000 },
  ]);

  const addCashFlow = () =>
    setCashFlow((prev) => [...prev, { id: uid(), job: "", deposit: 0, midPayment: 0, finalPayment: 0, totalInvoiced: 0 }]);

  const removeCashFlow = (id: string) => setCashFlow((prev) => prev.filter((c) => c.id !== id));

  const updateCashFlow = (id: string, field: keyof Omit<CashFlowEntry, "id">, value: string) => {
    setCashFlow((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, [field]: field === "job" ? value : Math.max(0, Number(value) || 0) }
          : c,
      ),
    );
  };

  /* ---- Pricing calculator state ---- */
  const [calc, setCalc] = useState({ materials: 30000, labour: 25000, other: 5000 });
  const [multiplier, setMultiplier] = useState("1.0");
  const [targetMargin, setTargetMargin] = useState("0.30");

  const calcTotal = calc.materials + calc.labour + calc.other;
  const calcAdjusted = calcTotal * Number(multiplier);
  const calcFinal = calcAdjusted / (1 - Number(targetMargin));

  /* ---- Derived overview ---- */
  const overview = useMemo(() => {
    const totalRevenue = jobs.reduce((s, j) => s + j.revenue, 0);
    const totalCosts = jobs.reduce((s, j) => s + j.materials + j.labour + j.other, 0);
    const netProfit = totalRevenue - totalCosts;
    const avgMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;
    return { totalRevenue, totalCosts, netProfit, avgMargin };
  }, [jobs]);

  return (
    <div className="space-y-8">
      {/* ── Section Header ── */}
      <div className="border-t border-accent/20 pt-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">Internal</p>
        <h2 className="font-serif text-xl tracking-tight text-foreground">Financial Control</h2>
      </div>

      {/* ── 1. Overview Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue (Month)", value: fmt(overview.totalRevenue), icon: DollarSign },
          { label: "Total Costs", value: fmt(overview.totalCosts), icon: TrendingUp },
          { label: "Net Profit", value: fmt(overview.netProfit), icon: DollarSign },
          { label: "Avg Margin", value: pct(overview.avgMargin), icon: Percent },
        ].map((s) => (
          <Card key={s.label} className="bg-card/80 border-border/40">
            <CardHeader className="pb-1 pt-4 px-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{s.label}</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-serif font-semibold text-foreground">{s.value}</span>
                <s.icon className="h-4 w-4 text-accent/60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 2. Job Profit Tracker ── */}
      <Card className="bg-card/80 border-border/40 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Profitability</p>
              <CardTitle className="text-base font-medium">Job Profit Tracker</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={addJob} className="text-[11px] uppercase tracking-wider border-border/40">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Job
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className={TH}>Job Name</TableHead>
                  <TableHead className={`${TH} text-right`}>Revenue</TableHead>
                  <TableHead className={`${TH} text-right`}>Materials</TableHead>
                  <TableHead className={`${TH} text-right`}>Labour</TableHead>
                  <TableHead className={`${TH} text-right`}>Other</TableHead>
                  <TableHead className={`${TH} text-right`}>Total Cost</TableHead>
                  <TableHead className={`${TH} text-right`}>Profit</TableHead>
                  <TableHead className={`${TH} text-right`}>Margin</TableHead>
                  <TableHead className={`${TH} w-10`} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((j) => {
                  const totalCost = j.materials + j.labour + j.other;
                  const profit = j.revenue - totalCost;
                  const margin = j.revenue > 0 ? profit / j.revenue : 0;
                  return (
                    <TableRow key={j.id} className="border-border/20">
                      <TableCell>
                        <Input value={j.name} onChange={(e) => updateJob(j.id, "name", e.target.value)} className={`${INPUT} w-40`} placeholder="Job name" />
                      </TableCell>
                      {(["revenue", "materials", "labour", "other"] as const).map((f) => (
                        <TableCell key={f} className="text-right">
                          <Input type="number" value={j[f] || ""} onChange={(e) => updateJob(j.id, f, e.target.value)} className={`${INPUT} w-24 text-right ml-auto`} />
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">{fmt(totalCost)}</TableCell>
                      <TableCell className={`text-right text-sm tabular-nums font-medium ${profit >= 0 ? "text-emerald-500" : "text-destructive"}`}>{fmt(profit)}</TableCell>
                      <TableCell className={`text-right text-sm tabular-nums ${margin >= 0.3 ? "text-emerald-500" : margin >= 0.2 ? "text-accent" : "text-destructive"}`}>{pct(margin)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/50 hover:text-destructive" onClick={() => removeJob(j.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Pricing Calculator ── */}
      <Card className="bg-card/80 border-border/40">
        <CardHeader className="pb-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Pricing</p>
          <CardTitle className="text-base font-medium">Quote Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-4">
              {([
                { label: "Materials Cost", key: "materials" as const },
                { label: "Labour Cost", key: "labour" as const },
                { label: "Other Costs", key: "other" as const },
              ]).map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">{f.label}</Label>
                  <Input
                    type="number"
                    value={calc[f.key] || ""}
                    onChange={(e) => setCalc((p) => ({ ...p, [f.key]: Math.max(0, Number(e.target.value) || 0) }))}
                    className={INPUT}
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Complexity Multiplier</Label>
                <Select value={multiplier} onValueChange={setMultiplier}>
                  <SelectTrigger className="h-9 bg-background/60 border-border/50 rounded-sm text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["1.0", "1.15", "1.25", "1.35", "1.5"].map((v) => (
                      <SelectItem key={v} value={v}>{v}×</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Target Margin</Label>
                <Select value={targetMargin} onValueChange={setTargetMargin}>
                  <SelectTrigger className="h-9 bg-background/60 border-border/50 rounded-sm text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { v: "0.25", l: "25%" },
                      { v: "0.30", l: "30%" },
                      { v: "0.35", l: "35%" },
                      { v: "0.40", l: "40%" },
                    ].map((m) => (
                      <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Outputs */}
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

      {/* ── 4. Cash Flow Tracker ── */}
      <Card className="bg-card/80 border-border/40 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Cash Flow</p>
              <CardTitle className="text-base font-medium">Payment Tracker</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={addCashFlow} className="text-[11px] uppercase tracking-wider border-border/40">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className={TH}>Job</TableHead>
                  <TableHead className={`${TH} text-right`}>Deposit</TableHead>
                  <TableHead className={`${TH} text-right`}>Mid Payment</TableHead>
                  <TableHead className={`${TH} text-right`}>Final Payment</TableHead>
                  <TableHead className={`${TH} text-right`}>Total Received</TableHead>
                  <TableHead className={`${TH} text-right`}>Total Invoiced</TableHead>
                  <TableHead className={`${TH} text-right`}>Remaining</TableHead>
                  <TableHead className={`${TH} w-10`} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashFlow.map((c) => {
                  const totalReceived = c.deposit + c.midPayment + c.finalPayment;
                  const remaining = c.totalInvoiced - totalReceived;
                  return (
                    <TableRow key={c.id} className="border-border/20">
                      <TableCell>
                        <Input value={c.job} onChange={(e) => updateCashFlow(c.id, "job", e.target.value)} className={`${INPUT} w-40`} placeholder="Job name" />
                      </TableCell>
                      {(["deposit", "midPayment", "finalPayment", "totalInvoiced"] as const).map((f) => (
                        <TableCell key={f} className="text-right">
                          <Input type="number" value={c[f] || ""} onChange={(e) => updateCashFlow(c.id, f, e.target.value)} className={`${INPUT} w-24 text-right ml-auto`} />
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-sm tabular-nums text-foreground">{fmt(totalReceived)}</TableCell>
                      <TableCell className={`text-right text-sm tabular-nums font-medium ${remaining > 0 ? "text-accent" : "text-emerald-500"}`}>{fmt(remaining)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/50 hover:text-destructive" onClick={() => removeCashFlow(c.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
