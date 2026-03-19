import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Activity, RefreshCw, ChevronDown, Filter } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface ActivityEntry {
  id: string;
  created_at: string;
  action_type: string;
  action_level: string;
  category: string;
  title: string;
  description: string | null;
  entity_type: string | null;
  performed_by: string;
  approved_by: string | null;
  approved_at: string | null;
}

const LEVEL_STYLES: Record<string, string> = {
  autonomous: "bg-emerald-600/15 text-emerald-500 border-emerald-600/20",
  "draft-approval": "bg-accent/15 text-accent border-accent/20",
  "human-only": "bg-destructive/15 text-destructive border-destructive/20",
  system: "bg-muted text-muted-foreground border-border/30",
};

export function ActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(20);
  const [expanded, setExpanded] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    let query = supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filter !== "all") {
      query = query.eq("action_level", filter);
    }

    const { data, error } = await query;
    if (error) toast.error("Failed to load activity log");
    else setEntries((data as ActivityEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, [filter, limit]);

  return (
    <Card className="bg-card/60 border-border/30">
      <CardHeader className="cursor-pointer pb-2" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-muted-foreground/60" />
            <CardTitle className="text-sm font-medium">Activity Log</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] border-border/30">
              {entries.length} entries
            </Badge>
            <ChevronDown className={`h-3 w-3 text-muted-foreground/40 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-7 w-[140px] bg-background/40 border-border/30 text-[10px]">
                <Filter className="h-3 w-3 mr-1 text-muted-foreground/40" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="autonomous">Autonomous</SelectItem>
                <SelectItem value="draft-approval">Draft / Approval</SelectItem>
                <SelectItem value="human-only">Human Only</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={fetchEntries} className="h-7 text-[10px]">
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <RefreshCw className="h-4 w-4 animate-spin text-accent/60" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/40 text-center py-4">
              No activity recorded yet. Actions will appear here as the system operates.
            </p>
          ) : (
            <div className="space-y-1">
              {entries.map(entry => (
                <div key={entry.id} className="flex items-start gap-2 py-2 border-b border-border/10 last:border-0">
                  <div className="shrink-0 mt-0.5">
                    <Badge variant="outline" className={`text-[8px] uppercase tracking-wider px-1.5 py-0 ${LEVEL_STYLES[entry.action_level] || LEVEL_STYLES.system}`}>
                      {entry.action_level === "draft-approval" ? "draft" : entry.action_level}
                    </Badge>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-foreground">{entry.title}</p>
                    {entry.description && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{entry.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground/30">
                        {format(new Date(entry.created_at), "MMM d, h:mm a")}
                      </span>
                      <span className="text-[9px] text-muted-foreground/30">·</span>
                      <span className="text-[9px] text-muted-foreground/30">{entry.performed_by}</span>
                      {entry.approved_by && (
                        <>
                          <span className="text-[9px] text-muted-foreground/30">·</span>
                          <span className="text-[9px] text-emerald-500/60">approved</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {entries.length >= limit && (
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setLimit(l => l + 20)}
                  className="w-full text-[10px] text-muted-foreground/40 h-7"
                >
                  Load more
                </Button>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
