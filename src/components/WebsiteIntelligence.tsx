import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Eye, Paintbrush, Zap, Gauge, Palette, ListChecks, RefreshCw,
  CheckCircle, XCircle, Clock, ArrowRight, ChevronDown, ChevronUp,
  AlertTriangle, Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Suggestion {
  id: string;
  category: string;
  title: string;
  issue: string;
  why_it_matters: string | null;
  suggested_fix: string | null;
  priority: string;
  status: string;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface AISuggestion {
  title: string;
  issue: string;
  why_it_matters: string;
  suggested_fix: string;
  priority: string;
  category: string;
}

const AUDIT_TYPES = [
  { key: "design", label: "Design", icon: Paintbrush, desc: "Spacing, typography, composition" },
  { key: "motion", label: "Motion / UX", icon: Sparkles, desc: "Animation, transitions, interactions" },
  { key: "performance", label: "Performance", icon: Gauge, desc: "Speed, weight, layout shifts" },
  { key: "brand", label: "Brand", icon: Palette, desc: "Tone, CTAs, ecosystem consistency" },
];

const PRIORITY_STYLES: Record<string, string> = {
  High: "border-destructive/40 text-destructive",
  Medium: "border-accent/40 text-accent",
  Low: "border-border/40 text-muted-foreground",
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  suggested: { icon: Clock, color: "text-muted-foreground", label: "Suggested" },
  approved: { icon: CheckCircle, color: "text-emerald-500", label: "Approved" },
  rejected: { icon: XCircle, color: "text-destructive/60", label: "Rejected" },
  implemented: { icon: Zap, color: "text-accent", label: "Implemented" },
};

const CATEGORY_ICONS: Record<string, typeof Paintbrush> = {
  design: Paintbrush,
  motion: Sparkles,
  performance: Gauge,
  brand: Palette,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function WebsiteIntelligence() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("website_suggestions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) toast.error("Failed to load suggestions");
    else setSuggestions((data as Suggestion[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  const runAudit = async (auditType: string) => {
    setAuditLoading(auditType);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Not authenticated"); setAuditLoading(null); return; }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/website-intelligence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ audit_type: auditType }),
        }
      );

      if (resp.status === 429) { toast.error("Rate limited — try again shortly"); setAuditLoading(null); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted"); setAuditLoading(null); return; }

      const data = await resp.json();
      if (data.error) { toast.error(data.error); setAuditLoading(null); return; }

      const aiSuggestions: AISuggestion[] = data.suggestions || [];

      if (aiSuggestions.length === 0) {
        toast.info("No issues found for this audit");
        setAuditLoading(null);
        return;
      }

      // Insert suggestions into the database
      const inserts = aiSuggestions.map((s) => ({
        category: s.category || auditType,
        title: s.title,
        issue: s.issue,
        why_it_matters: s.why_it_matters,
        suggested_fix: s.suggested_fix,
        priority: s.priority || "Medium",
        status: "suggested",
      }));

      const { error } = await supabase.from("website_suggestions").insert(inserts);
      if (error) {
        toast.error("Failed to save suggestions");
      } else {
        toast.success(`${aiSuggestions.length} suggestions added from ${auditType} audit`);
        fetchSuggestions();
      }
    } catch {
      toast.error("Audit failed");
    }
    setAuditLoading(null);
  };

  const updateStatus = async (id: string, status: string) => {
    const updates: any = {
      status,
      reviewed_at: new Date().toISOString(),
    };
    if (reviewNotes.trim()) updates.reviewer_notes = reviewNotes.trim();

    const { error } = await supabase
      .from("website_suggestions")
      .update(updates)
      .eq("id", id);
    if (error) toast.error("Failed to update");
    else {
      toast.success(`Marked as ${status}`);
      setExpandedId(null);
      setReviewNotes("");
      fetchSuggestions();
    }
  };

  const filtered = suggestions.filter((s) => {
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterCategory !== "all" && s.category !== filterCategory) return false;
    return true;
  });

  const statusCounts = {
    suggested: suggestions.filter((s) => s.status === "suggested").length,
    approved: suggestions.filter((s) => s.status === "approved").length,
    rejected: suggestions.filter((s) => s.status === "rejected").length,
    implemented: suggestions.filter((s) => s.status === "implemented").length,
  };

  return (
    <Card className="bg-card/80 border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">Intelligence</p>
            <CardTitle className="text-lg font-serif">Website Intelligence</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              AI-powered design, UX, performance, and brand audits
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSuggestions} className="text-[10px] uppercase tracking-wider h-8 border-border/40">
            <RefreshCw className="h-3 w-3 mr-1.5" /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Audit Triggers */}
        <div>
          <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">Run Audit</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AUDIT_TYPES.map((audit) => {
              const isRunning = auditLoading === audit.key;
              return (
                <button
                  key={audit.key}
                  onClick={() => runAudit(audit.key)}
                  disabled={!!auditLoading}
                  className="group p-3 rounded-sm border border-border/30 bg-background/30 hover:border-accent/30 hover:bg-accent/5 transition-all duration-200 text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isRunning ? (
                      <RefreshCw className="h-3.5 w-3.5 text-accent animate-spin" />
                    ) : (
                      <audit.icon className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                    )}
                    <span className="text-sm font-medium text-foreground">{audit.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50">{audit.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Release Queue Summary */}
        <div className="flex items-stretch gap-0 rounded-sm overflow-hidden border border-border/20">
          {(["suggested", "approved", "rejected", "implemented"] as const).map((status) => {
            const cfg = STATUS_CONFIG[status];
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(isActive ? "all" : status)}
                className={`flex-1 py-3 px-2 text-center transition-all duration-200 border-r border-border/10 last:border-r-0 hover:bg-accent/5 ${isActive ? "bg-accent/10" : ""}`}
              >
                <p className={`text-lg font-serif font-semibold ${cfg.color}`}>{statusCounts[status]}</p>
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/60 mt-0.5">{cfg.label}</p>
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterCategory === "all" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilterCategory("all")}
            className="text-[9px] uppercase tracking-wider h-7"
          >
            All
          </Button>
          {AUDIT_TYPES.map((a) => (
            <Button
              key={a.key}
              variant={filterCategory === a.key ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(filterCategory === a.key ? "all" : a.key)}
              className="text-[9px] uppercase tracking-wider h-7 border-border/30"
            >
              <a.icon className="h-3 w-3 mr-1" />
              {a.label}
            </Button>
          ))}
        </div>

        {/* Suggestions List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-4 w-4 animate-spin text-accent/60" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[11px] text-muted-foreground/50">
              {suggestions.length === 0
                ? "No audits run yet. Run an audit above to get started."
                : "No suggestions match the current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => {
              const isExpanded = expandedId === s.id;
              const statusCfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.suggested;
              const CategoryIcon = CATEGORY_ICONS[s.category] || Eye;

              return (
                <div
                  key={s.id}
                  className={`border rounded-sm transition-all duration-200 ${
                    isExpanded ? "border-accent/30 bg-accent/5" : "border-border/20 bg-background/20 hover:border-border/40"
                  }`}
                >
                  <button
                    onClick={() => {
                      setExpandedId(isExpanded ? null : s.id);
                      setReviewNotes(s.reviewer_notes || "");
                    }}
                    className="w-full p-3 text-left flex items-center gap-3"
                  >
                    <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                        <Badge variant="outline" className={`text-[8px] uppercase tracking-wider shrink-0 ${PRIORITY_STYLES[s.priority] || PRIORITY_STYLES.Medium}`}>
                          {s.priority}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{s.issue}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <statusCfg.icon className={`h-3.5 w-3.5 ${statusCfg.color}`} />
                      {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground/30" /> : <ChevronDown className="h-3 w-3 text-muted-foreground/30" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 border-t border-border/10 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-1">Issue Detected</p>
                          <p className="text-[12px] text-muted-foreground leading-relaxed">{s.issue}</p>
                        </div>
                        {s.why_it_matters && (
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-1">Why It Matters</p>
                            <p className="text-[12px] text-muted-foreground leading-relaxed">{s.why_it_matters}</p>
                          </div>
                        )}
                      </div>
                      {s.suggested_fix && (
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-1">Suggested Fix</p>
                          <p className="text-[12px] text-foreground/80 leading-relaxed">{s.suggested_fix}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40">
                        <span>{format(new Date(s.created_at), "MMM d, h:mm a")}</span>
                        <span>·</span>
                        <span className="capitalize">{s.category}</span>
                        {s.reviewed_at && (
                          <>
                            <span>·</span>
                            <span>Reviewed {format(new Date(s.reviewed_at), "MMM d")}</span>
                          </>
                        )}
                      </div>

                      {/* Reviewer notes */}
                      {s.status === "suggested" && (
                        <div className="space-y-2">
                          <Textarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Optional reviewer notes…"
                            className="text-[12px] bg-background/40 border-border/30 min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateStatus(s.id, "approved")}
                              className="text-[10px] uppercase tracking-wider h-7 bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(s.id, "rejected")}
                              className="text-[10px] uppercase tracking-wider h-7 border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      )}
                      {s.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(s.id, "implemented")}
                          className="text-[10px] uppercase tracking-wider h-7 border-accent/30 text-accent"
                        >
                          <Zap className="h-3 w-3 mr-1" /> Mark Implemented
                        </Button>
                      )}
                      {s.reviewer_notes && s.status !== "suggested" && (
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-1">Reviewer Notes</p>
                          <p className="text-[12px] text-muted-foreground">{s.reviewer_notes}</p>
                        </div>
                      )}
                    </div>
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
