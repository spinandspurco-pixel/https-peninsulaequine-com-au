import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Calendar, FileText, RefreshCw, Lightbulb, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Deal {
  id: string;
  name: string;
  email: string;
  services: string[];
  deal_value: number;
  probability: number;
  expected_value: number;
  deal_stage: string;
  last_contact_at: string | null;
  budget_range: string | null;
  lead_tier: string | null;
}

export function DecisionPanel() {
  const [closeToday, setCloseToday] = useState<Deal[]>([]);
  const [convertNext, setConvertNext] = useState<Deal[]>([]);
  const [systemLever, setSystemLever] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    // Close Today: top 3 by expected_value, exclude low-intent
    const { data: topDeals } = await supabase
      .from("inquiries")
      .select("id, name, email, services, deal_value, probability, expected_value, deal_stage, last_contact_at, budget_range, lead_tier")
      .gt("probability", 10)
      .gt("expected_value", 0)
      .not("deal_stage", "in", '("closed","lost")')
      .order("expected_value", { ascending: false })
      .limit(3) as any;

    setCloseToday(topDeals || []);

    // Convert Next: leads going cold (no contact in 3+ days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: coldDeals } = await supabase
      .from("inquiries")
      .select("id, name, email, services, deal_value, probability, expected_value, deal_stage, last_contact_at, budget_range, lead_tier")
      .gt("probability", 10)
      .not("deal_stage", "in", '("closed","lost")')
      .lt("last_contact_at", threeDaysAgo)
      .order("expected_value", { ascending: false })
      .limit(3) as any;

    setConvertNext(coldDeals || []);
    setLoading(false);
  };

  const generateSystemLever = async () => {
    setAiLoading(true);
    try {
      const res = await supabase.functions.invoke("admin-ai-assistant", {
        body: { action: "decision_panel" },
      });
      if (res.data?.system_lever) {
        setSystemLever(res.data.system_lever);
      }
    } catch {
      toast.error("Failed to generate insight");
    }
    setAiLoading(false);
  };

  const fmt = (v: number) => `$${v.toLocaleString()}`;
  const daysSince = (d: string | null) => {
    if (!d) return "—";
    return formatDistanceToNow(new Date(d), { addSuffix: false });
  };

  const stageBadge = (stage: string) => {
    const colors: Record<string, string> = {
      new: "bg-accent/80",
      contacted: "bg-muted-foreground/60",
      site_visit: "bg-accent",
      proposal: "bg-accent/60",
      closed: "bg-emerald-600",
    };
    return (
      <Badge variant="secondary" className={`${colors[stage] || "bg-muted"} text-white text-[9px] uppercase tracking-wider`}>
        {stage.replace("_", " ")}
      </Badge>
    );
  };

  const handleAction = (action: string, deal: Deal) => {
    switch (action) {
      case "call":
        toast.info(`Call ${deal.name}`);
        break;
      case "draft":
        toast.info("Switch to AI Assistant → Draft Reply");
        break;
      case "book":
        window.open("/site-assessment", "_blank");
        break;
      case "proposal":
        toast.info(`Create proposal for ${deal.name}`);
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-4 w-4 animate-spin text-accent/60" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-t border-accent/20 pt-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">Intelligence · Decisions</p>
        <h2 className="font-serif text-xl tracking-tight text-foreground">Decision Panel</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Highest-value actions · sorted by expected revenue</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CLOSE TODAY */}
        <Card className="bg-card/80 border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-accent/60">Priority</p>
                <CardTitle className="text-sm font-medium">Close Today</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {closeToday.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-4 text-center">No active deals</p>
            ) : (
              closeToday.map((deal) => (
                <div key={deal.id} className="p-3 rounded-sm border border-border/30 bg-background/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{deal.name}</p>
                    {stageBadge(deal.deal_stage)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                    <div>
                      <p className="text-muted-foreground/50">Deal</p>
                      <p className="text-foreground font-medium">{fmt(deal.deal_value)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground/50">Prob</p>
                      <p className="text-foreground font-medium">{deal.probability}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground/50">Expected</p>
                      <p className="text-accent font-medium">{fmt(deal.expected_value)}</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground/60">
                    {deal.services.join(", ")} · Last contact: {daysSince(deal.last_contact_at)}
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase tracking-wider px-2" onClick={() => handleAction("call", deal)}>
                      <Phone className="h-3 w-3 mr-1" />Call
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase tracking-wider px-2" onClick={() => handleAction("draft", deal)}>
                      <Mail className="h-3 w-3 mr-1" />Draft
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase tracking-wider px-2" onClick={() => handleAction("book", deal)}>
                      <Calendar className="h-3 w-3 mr-1" />Book
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase tracking-wider px-2" onClick={() => handleAction("proposal", deal)}>
                      <FileText className="h-3 w-3 mr-1" />Proposal
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* CONVERT NEXT */}
        <Card className="bg-card/80 border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-amber-500/60">At Risk</p>
                <CardTitle className="text-sm font-medium">Convert Next</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {convertNext.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-4 text-center">No leads going cold</p>
            ) : (
              convertNext.map((deal) => (
                <div key={deal.id} className="p-3 rounded-sm border border-border/30 bg-background/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{deal.name}</p>
                    {stageBadge(deal.deal_stage)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                    <div>
                      <p className="text-muted-foreground/50">Expected</p>
                      <p className="text-accent font-medium">{fmt(deal.expected_value)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground/50">Stage</p>
                      <p className="text-foreground">{deal.deal_stage.replace("_", " ")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground/50">Last Contact</p>
                      <p className="text-amber-500 font-medium">{daysSince(deal.last_contact_at)} ago</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">
                    Suggested: {deal.probability >= 40 ? "Book Site Assessment" : "Send Follow-Up"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* SYSTEM LEVER */}
      <Card className="bg-card/60 border-border/30">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Lightbulb className="h-3.5 w-3.5 text-accent/60 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[9px] uppercase tracking-[0.15em] text-accent/50 mb-0.5">System Lever</p>
                {systemLever ? (
                  <p className="text-[11px] text-foreground/80 leading-relaxed">{systemLever}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/50 italic">Generate an AI insight from pipeline patterns</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateSystemLever}
              disabled={aiLoading}
              className="text-[9px] uppercase tracking-wider h-7 px-2 ml-2"
            >
              {aiLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Analyse"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
