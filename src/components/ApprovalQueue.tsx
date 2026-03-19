import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertTriangle, Check, X, Pencil, ChevronDown, RefreshCw, Send, Eye,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

interface ApprovalItem {
  id: string;
  created_at: string;
  action_type: string;
  priority: string;
  title: string;
  description: string | null;
  draft_content: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: any;
  status: string;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution: string | null;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/20",
  normal: "bg-accent/15 text-accent border-accent/20",
  low: "bg-muted text-muted-foreground border-border/30",
};

export function ApprovalQueue() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [reviewItem, setReviewItem] = useState<ApprovalItem | null>(null);
  const [editedDraft, setEditedDraft] = useState("");
  const [resolving, setResolving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("approval_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load approval queue");
    else setItems((data as ApprovalItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const resolveItem = async (id: string, resolution: string) => {
    setResolving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("approval_queue")
      .update({
        status: resolution === "dismissed" ? "dismissed" : "resolved",
        resolution,
        resolved_by: user?.id || null,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) toast.error("Failed to resolve item");
    else {
      toast.success(resolution === "approved" ? "Approved" : resolution === "dismissed" ? "Dismissed" : "Resolved");

      // Log to activity log
      await supabase.from("activity_log").insert({
        action_type: "approval_resolved",
        action_level: "draft-approval",
        category: "approval",
        title: `${resolution}: ${reviewItem?.title || "Queue item"}`,
        description: resolution === "edited" ? "Draft edited and approved" : undefined,
        entity_type: reviewItem?.entity_type,
        entity_id: reviewItem?.entity_id,
        performed_by: user?.email || "admin",
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      });

      setReviewItem(null);
      fetchItems();
    }
    setResolving(false);
  };

  const pendingCount = items.length;

  return (
    <>
      <Card className={`bg-card/60 border-border/30 ${pendingCount > 0 ? "border-l-2 border-l-accent/50" : ""}`}>
        <CardHeader className="cursor-pointer pb-2" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-accent" />
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <Badge variant="secondary" className="text-[9px] bg-accent/15 text-accent">
                  {pendingCount}
                </Badge>
              )}
              <ChevronDown className={`h-3 w-3 text-muted-foreground/40 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </div>
          </div>
        </CardHeader>
        {expanded && (
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex justify-center py-6">
                <RefreshCw className="h-4 w-4 animate-spin text-accent/60" />
              </div>
            ) : pendingCount === 0 ? (
              <p className="text-[11px] text-muted-foreground/40 text-center py-4">
                No items requiring review. All clear.
              </p>
            ) : (
              <div className="divide-y divide-border/10">
                {items.map(item => (
                  <div key={item.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className={`text-[8px] uppercase tracking-wider px-1.5 py-0 ${PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.normal}`}>
                          {item.priority}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground/30 uppercase tracking-wider">{item.action_type}</span>
                      </div>
                      <p className="text-[12px] font-medium text-foreground">{item.title}</p>
                      {item.description && (
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">{item.description}</p>
                      )}
                      <span className="text-[9px] text-muted-foreground/30">
                        {format(new Date(item.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-accent" onClick={() => { setReviewItem(item); setEditedDraft(item.draft_content || ""); }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-emerald-500" onClick={() => resolveItem(item.id, "approved")}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => resolveItem(item.id, "dismissed")}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewItem} onOpenChange={() => setReviewItem(null)}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-base">{reviewItem?.title}</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-[8px] uppercase tracking-wider ${PRIORITY_STYLES[reviewItem?.priority || "normal"]}`}>
                {reviewItem?.priority}
              </Badge>
              <span className="text-[10px] text-muted-foreground/50">{reviewItem?.action_type}</span>
            </div>
          </DialogHeader>

          {reviewItem?.description && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-1">Context</p>
              <p className="text-[12px] text-muted-foreground">{reviewItem.description}</p>
            </div>
          )}

          {reviewItem?.draft_content && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-1">Draft</p>
              <div className="prose prose-sm prose-invert max-w-none p-3 rounded-sm border border-border/20 bg-background/40 text-[12px]">
                <ReactMarkdown>{editedDraft}</ReactMarkdown>
              </div>
              <Textarea
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                className="mt-2 bg-background/40 border-border/30 text-[12px] min-h-[80px]"
                placeholder="Edit the draft before approving…"
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setReviewItem(null)} className="text-[10px] uppercase tracking-wider">
              Cancel
            </Button>
            <Button variant="outline" size="sm" onClick={() => reviewItem && resolveItem(reviewItem.id, "dismissed")} disabled={resolving} className="text-[10px] uppercase tracking-wider text-destructive border-destructive/30">
              <X className="h-3 w-3 mr-1" /> Dismiss
            </Button>
            <Button size="sm" onClick={() => reviewItem && resolveItem(reviewItem.id, editedDraft !== reviewItem.draft_content ? "edited" : "approved")} disabled={resolving} className="text-[10px] uppercase tracking-wider">
              {resolving ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
              {editedDraft !== reviewItem?.draft_content ? "Save & Approve" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
