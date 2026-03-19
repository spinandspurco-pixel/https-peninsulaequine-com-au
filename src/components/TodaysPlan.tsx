import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Zap, RefreshCw, Clock, Sun, Sunset } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

export function TodaysPlan() {
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        setLoading(false);
        return;
      }

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

      if (resp.status === 429) {
        toast.error("Rate limited. Try again shortly.");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted.");
        setLoading(false);
        return;
      }

      const data = await resp.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setPlan(data.result);
        setLastGenerated(new Date());
      }
    } catch {
      toast.error("Failed to generate plan");
    }
    setLoading(false);
  };

  return (
    <Card className="bg-card/80 border-border/40">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-accent" />
            <div>
              <CardTitle className="text-sm font-medium">Today's Plan</CardTitle>
              <CardDescription className="text-[11px]">
                {format(new Date(), "EEEE, MMMM d")} — Daily operating guide
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastGenerated && (
              <span className="text-[9px] text-muted-foreground/50">
                {format(lastGenerated, "h:mm a")}
              </span>
            )}
            <Clock className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="border-t border-border/30 pt-4 space-y-4">
          {/* Time block indicators */}
          {!plan && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Sun, label: "Morning", desc: "Admin + Follow-Ups", time: "7am–11am" },
                  { icon: Clock, label: "Midday", desc: "Site Visits", time: "11am–2pm" },
                  { icon: Sunset, label: "Afternoon", desc: "Decisions + Proposals", time: "2pm–5pm" },
                ].map((block) => (
                  <div key={block.label} className="p-3 rounded-sm border border-border/20 bg-background/30 text-center">
                    <block.icon className="h-4 w-4 text-accent/50 mx-auto mb-1.5" />
                    <p className="text-[10px] uppercase tracking-[0.15em] text-accent/70 font-medium">{block.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{block.desc}</p>
                    <p className="text-[9px] text-muted-foreground/40 mt-0.5">{block.time}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Button onClick={generatePlan} disabled={loading} className="text-[11px] uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5 mr-2" />
                  Generate Today's Plan
                </Button>
                <p className="text-[10px] text-muted-foreground/40 mt-2">
                  Analyses leads, bookings, finances, and follow-ups to build your daily action plan.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="h-5 w-5 text-accent/60 mx-auto animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Building your daily plan…</p>
              <p className="text-[10px] text-muted-foreground/40 mt-1">Analysing leads, bookings, and financial data</p>
            </div>
          )}

          {plan && !loading && (
            <div className="space-y-4">
              <div className="prose prose-sm prose-invert max-w-none
                prose-headings:font-serif prose-headings:text-foreground prose-headings:font-medium
                prose-h2:text-sm prose-h2:uppercase prose-h2:tracking-[0.1em] prose-h2:border-b prose-h2:border-border/20 prose-h2:pb-2 prose-h2:mb-3
                prose-p:text-muted-foreground prose-p:text-[13px] prose-p:leading-relaxed
                prose-li:text-muted-foreground prose-li:text-[13px]
                prose-strong:text-accent prose-strong:font-medium
                prose-ul:space-y-1
              ">
                <ReactMarkdown>{plan}</ReactMarkdown>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">
                  Generated {lastGenerated ? format(lastGenerated, "h:mm a") : ""}
                </p>
                <Button variant="outline" size="sm" onClick={generatePlan} disabled={loading} className="text-[10px] uppercase tracking-wider h-7">
                  <RefreshCw className="h-3 w-3 mr-1.5" /> Regenerate
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
