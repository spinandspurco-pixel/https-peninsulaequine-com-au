import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, BarChart3, TrendingUp, Eye, MousePointerClick, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface VariantStats {
  variant: string;
  impressions: number;
  engages: number;
  clicks: number;
  converts: number;
  ctr: number;
  conversionRate: number;
}

interface TestStats {
  testName: string;
  variants: VariantStats[];
  totalImpressions: number;
  totalClicks: number;
  totalConverts: number;
  startDate: string | null;
}

export function ABTestStatsPanel() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<TestStats[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("ab_test_events")
      .select("test_name, variant, event_type, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch AB test stats:", error);
      setLoading(false);
      return;
    }

    // Aggregate by test → variant → event_type
    const testMap = new Map<string, Map<string, { impressions: number; engages: number; clicks: number; converts: number }>>();
    const testDates = new Map<string, string>();

    for (const row of data || []) {
      if (!testMap.has(row.test_name)) {
        testMap.set(row.test_name, new Map());
        testDates.set(row.test_name, row.created_at);
      }
      const varMap = testMap.get(row.test_name)!;
      if (!varMap.has(row.variant)) {
        varMap.set(row.variant, { impressions: 0, engages: 0, clicks: 0, converts: 0 });
      }
      const counts = varMap.get(row.variant)!;
      if (row.event_type === "impression") counts.impressions++;
      else if (row.event_type === "engage") counts.engages++;
      else if (row.event_type === "click") counts.clicks++;
      else if (row.event_type === "convert") counts.converts++;
    }

    const results: TestStats[] = [];
    for (const [testName, varMap] of testMap) {
      const variants: VariantStats[] = [];
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalConverts = 0;
      for (const [variant, counts] of varMap) {
        const ctr = counts.impressions > 0 ? (counts.clicks / counts.impressions) * 100 : 0;
        const conversionRate = counts.impressions > 0 ? (counts.converts / counts.impressions) * 100 : 0;
        variants.push({ variant, ...counts, ctr: Math.round(ctr * 100) / 100, conversionRate: Math.round(conversionRate * 100) / 100 });
        totalImpressions += counts.impressions;
        totalClicks += counts.clicks;
        totalConverts += counts.converts;
      }
      // Sort by conversion rate descending, fallback to CTR
      variants.sort((a, b) => b.conversionRate - a.conversionRate || b.ctr - a.ctr);
      results.push({
        testName,
        variants,
        totalImpressions,
        totalClicks,
        totalConverts,
        startDate: testDates.get(testName) || null,
      });
    }

    setStats(results);
    setLoading(false);
  };

  const clearTestData = async (testName: string) => {
    const { error } = await (supabase as any)
      .from("ab_test_events")
      .delete()
      .eq("test_name", testName);
    if (error) {
      toast.error("Failed to clear test data");
    } else {
      toast.success("Test data cleared");
      fetchStats();
    }
  };

  useEffect(() => {
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  if (!isAdmin) return null;

  const bestVariant = (test: TestStats) => {
    const best = test.variants[0];
    return best.impressions >= 30 ? best : null;
    return best.impressions >= 30 ? best : null; // Need minimum sample
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              A/B Test Results
            </CardTitle>
            <CardDescription>Hero CTA conversion tracking</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No A/B test data yet. Events will appear as visitors interact with the hero CTA.
          </p>
        ) : (
          <div className="space-y-6">
            {stats.map((test) => {
              const winner = bestVariant(test);
              return (
                <div key={test.testName} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{test.testName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {test.totalImpressions} views · {test.totalClicks} clicks · {test.totalConverts} conversions
                        {test.startDate && ` · Since ${new Date(test.startDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => clearTestData(test.testName)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid gap-2">
                    {test.variants.map((v) => (
                      <div
                        key={v.variant}
                        className={`rounded-md border p-3 text-sm ${
                          winner?.variant === v.variant ? "border-accent bg-accent/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{v.variant.replace(/_/g, " ")}</span>
                            {winner?.variant === v.variant && (
                              <Badge variant="secondary" className="bg-accent/20 text-accent text-[10px]">
                                <TrendingUp className="h-3 w-3 mr-0.5" />
                                Winner
                              </Badge>
                            )}
                          </div>
                          <span className="font-semibold text-foreground text-xs">
                            {v.conversionRate}% conv
                          </span>
                        </div>
                        {/* Funnel bar */}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{v.impressions}</span>
                          <span className="text-border">→</span>
                          <span>{v.engages} engage</span>
                          <span className="text-border">→</span>
                          <span className="flex items-center gap-0.5"><MousePointerClick className="h-3 w-3" />{v.clicks}</span>
                          <span className="text-border">→</span>
                          <span className="text-accent font-medium">{v.converts} conv</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!winner && test.totalImpressions > 0 && (
                    <p className="text-[11px] text-muted-foreground italic">
                      Need ≥30 impressions per variant to declare a winner
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
