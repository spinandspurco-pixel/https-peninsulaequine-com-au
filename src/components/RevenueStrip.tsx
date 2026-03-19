import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Target, AlertTriangle, DollarSign } from "lucide-react";

interface RevenueData {
  committed: number;
  projected: number;
  target: number;
  gap: number;
}

export function RevenueStrip() {
  const [data, setData] = useState<RevenueData>({ committed: 0, projected: 0, target: 150000, gap: 150000 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const [jobsRes, dealsRes] = await Promise.all([
      supabase
        .from("jobs")
        .select("revenue")
        .eq("status", "completed")
        .gte("updated_at", monthStart)
        .lte("updated_at", monthEnd),
      supabase
        .from("inquiries")
        .select("expected_value, deal_stage")
        .not("deal_stage", "in", '("closed","lost")') as any,
    ]);

    const committed = (jobsRes.data || []).reduce((s: number, j: any) => s + Number(j.revenue || 0), 0);
    const projected = (dealsRes.data || []).reduce((s: number, d: any) => s + Number(d.expected_value || 0), 0);
    const target = 150000; // configurable
    const gap = Math.max(0, target - committed - projected);

    setData({ committed, projected, target, gap });
    setLoading(false);
  };

  const fmt = (v: number) => {
    if (v >= 1000) return `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return `$${v.toLocaleString()}`;
  };

  const metrics = [
    { label: "Committed", value: data.committed, icon: DollarSign, color: "text-emerald-500" },
    { label: "Projected", value: data.projected, icon: TrendingUp, color: "text-accent" },
    { label: "Monthly Target", value: data.target, icon: Target, color: "text-muted-foreground" },
    { label: "Gap to Target", value: data.gap, icon: AlertTriangle, color: data.gap > 0 ? "text-amber-500" : "text-emerald-500" },
  ];

  return (
    <div className="border border-border/40 bg-card/60 rounded-sm">
      <div className="px-4 py-2 border-b border-border/20">
        <p className="text-[9px] uppercase tracking-[0.2em] text-accent/70 font-sans">Revenue Intelligence · {new Date().toLocaleDateString("en-AU", { month: "long", year: "numeric" })}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/20">
        {metrics.map((m) => (
          <div key={m.label} className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <m.icon className={`h-3 w-3 ${m.color}`} />
              <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60">{m.label}</p>
            </div>
            <p className={`text-lg font-serif font-semibold ${m.color}`}>
              {loading ? "—" : fmt(m.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
