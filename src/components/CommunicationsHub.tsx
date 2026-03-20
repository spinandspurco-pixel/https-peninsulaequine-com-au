import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
  Inbox, Send, Clock, CheckCircle, RefreshCw, Mail, Bot,
  MessageSquare, ArrowRight, Search, MailOpen, Reply,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  lastMessage: string;
  timestamp: string;
  source: "inquiry" | "follow_up";
  status: "new" | "pending" | "sent" | "resolved";
  sourceId: string;
  entityType?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommunicationsHub() {
  const [items, setItems] = useState<CommItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<CommItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);

  const fetchComms = useCallback(async () => {
    setLoading(true);
    try {
      const [inquiryRes, followUpRes] = await Promise.all([
        supabase
          .from("inquiries")
          .select("id, name, email, services, project_vision, status, created_at, updated_at, notes")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("follow_up_drafts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      const commItems: CommItem[] = [];

      // Map inquiries
      (inquiryRes.data || []).forEach((inq) => {
        commItems.push({
          id: `inq-${inq.id}`,
          name: inq.name,
          email: inq.email,
          subject: inq.services?.length
            ? `Enquiry: ${inq.services.slice(0, 2).join(", ")}`
            : "New Enquiry",
          lastMessage: inq.project_vision || inq.notes || "No message provided",
          timestamp: inq.created_at,
          source: "inquiry",
          status: inq.status === "new" ? "new" : ["won", "lost"].includes(inq.status) ? "resolved" : "pending",
          sourceId: inq.id,
        });
      });

      // Map follow-up drafts
      (followUpRes.data || []).forEach((fu) => {
        commItems.push({
          id: `fu-${fu.id}`,
          name: fu.client_name,
          email: fu.client_email,
          subject: fu.subject_line || `Follow-up: Stage ${fu.stage}`,
          lastMessage: fu.draft_message.slice(0, 200),
          timestamp: fu.created_at,
          source: "follow_up",
          status: fu.status === "sent" ? "sent" : fu.status === "approved" ? "sent" : "pending",
          sourceId: fu.id,
          entityType: fu.entity_type,
        });
      });

      // Sort by timestamp descending
      commItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setItems(commItems);
    } catch {
      toast.error("Failed to load communications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComms();
  }, [fetchComms]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "new") return matchesSearch && item.status === "new";
    if (activeTab === "pending") return matchesSearch && item.status === "pending";
    if (activeTab === "sent") return matchesSearch && item.status === "sent";
    if (activeTab === "resolved") return matchesSearch && item.status === "resolved";
    return matchesSearch;
  });

  const counts = {
    all: items.length,
    new: items.filter((i) => i.status === "new").length,
    pending: items.filter((i) => i.status === "pending").length,
    sent: items.filter((i) => i.status === "sent").length,
    resolved: items.filter((i) => i.status === "resolved").length,
  };

  const handleReply = async () => {
    if (!selectedItem || !replyText.trim()) return;
    // For now, open the user's email client with pre-filled content
    const mailtoUrl = `mailto:${selectedItem.email}?subject=Re: ${encodeURIComponent(selectedItem.subject)}&body=${encodeURIComponent(replyText)}`;
    window.open(mailtoUrl, "_blank");
    toast.success("Opening email client");
    setSelectedItem(null);
    setReplyText("");
  };

  const handleAIDraft = async () => {
    if (!selectedItem) return;
    setAiDrafting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-ai-assistant", {
        body: {
          action: "draft_reply",
          payload: {
            inquiry_name: selectedItem.name,
            inquiry_email: selectedItem.email,
            inquiry_services: selectedItem.subject,
            inquiry_vision: selectedItem.lastMessage,
            reply_type: "initial response",
          },
        },
      });
      if (error) throw error;
      setReplyText(data?.result || "Unable to generate draft.");
    } catch {
      toast.error("AI draft failed");
    } finally {
      setAiDrafting(false);
    }
  };

  const handleMarkResolved = async (item: CommItem) => {
    try {
      if (item.source === "inquiry") {
        await supabase
          .from("inquiries")
          .update({ status: "won", updated_at: new Date().toISOString() })
          .eq("id", item.sourceId);
      } else {
        await supabase
          .from("follow_up_drafts")
          .update({ status: "sent", updated_at: new Date().toISOString() })
          .eq("id", item.sourceId);
      }
      toast.success("Marked as resolved");
      fetchComms();
    } catch {
      toast.error("Failed to update");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      new: { bg: "bg-accent text-accent-foreground", label: "New" },
      pending: { bg: "bg-muted-foreground/60 text-white", label: "Pending" },
      sent: { bg: "bg-accent/60 text-accent-foreground", label: "Sent" },
      resolved: { bg: "bg-emerald-600 text-white", label: "Resolved" },
    };
    const cfg = map[status] || map.pending;
    return (
      <Badge className={`${cfg.bg} text-[9px] uppercase tracking-wider font-medium`}>
        {cfg.label}
      </Badge>
    );
  };

  return (
    <>
      <Card className="bg-card/80 border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-accent/60" />
              <div>
                <CardTitle className="text-sm font-medium">Communications Hub</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Enquiries, follow-ups & sent messages — all in one place
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchComms}
              disabled={loading}
              className="text-[11px] text-muted-foreground hover:text-accent"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <Input
              placeholder="Search by name, email, or subject…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 bg-background/60 border-border/40 rounded-sm text-sm"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/30 border border-border/30 h-8">
              {[
                { value: "all", label: "All", icon: Inbox, count: counts.all },
                { value: "new", label: "New", icon: MailOpen, count: counts.new },
                { value: "pending", label: "Replies", icon: Clock, count: counts.pending },
                { value: "sent", label: "Sent", icon: Send, count: counts.sent },
                { value: "resolved", label: "Resolved", icon: CheckCircle, count: counts.resolved },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-[10px] uppercase tracking-wider data-[state=active]:bg-accent data-[state=active]:text-accent-foreground gap-1 px-2.5 h-7"
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="text-[9px] opacity-70">({tab.count})</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Content — shared across all tabs */}
            <div className="mt-3 space-y-1.5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-5 w-5 animate-spin text-accent/60" />
                </div>
              ) : filteredItems.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No messages found
                </p>
              ) : (
                filteredItems.slice(0, 20).map((item) => (
                  <div
                    key={item.id}
                    className={`group flex items-start gap-3 p-3 rounded-sm border transition-all duration-200 cursor-pointer hover:border-accent/30 ${
                      item.status === "new"
                        ? "border-accent/20 bg-accent/[0.03]"
                        : "border-border/30 bg-background/40"
                    }`}
                    onClick={() => {
                      setSelectedItem(item);
                      setReplyText("");
                    }}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 rounded-sm p-1.5 ${
                      item.source === "inquiry" ? "bg-accent/10" : "bg-muted/60"
                    }`}>
                      {item.source === "inquiry" ? (
                        <MessageSquare className="h-3.5 w-3.5 text-accent" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                        {statusBadge(item.status)}
                        <Badge variant="outline" className="text-[8px] uppercase tracking-wider border-border/30 text-muted-foreground/60">
                          {item.source === "inquiry" ? "Enquiry" : "Follow-up"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 truncate">{item.email}</p>
                      <p className="text-[12px] font-medium text-foreground/80 mt-0.5 truncate">{item.subject}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.lastMessage}</p>
                    </div>

                    {/* Timestamp + Actions */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:text-accent"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setReplyText("");
                          }}
                          title="Reply"
                        >
                          <Reply className="h-3 w-3" />
                        </Button>
                        {item.status !== "resolved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:text-emerald-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkResolved(item);
                            }}
                            title="Mark resolved"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {filteredItems.length > 20 && (
                <p className="text-center text-[11px] text-muted-foreground/50 pt-2">
                  Showing 20 of {filteredItems.length} items
                </p>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reply / Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent/60" />
              {selectedItem?.name}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-muted-foreground">{selectedItem?.email}</span>
              {selectedItem && statusBadge(selectedItem.status)}
            </div>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Message preview */}
              <div className="p-3 rounded-sm bg-muted/30 border border-border/30">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">
                  {selectedItem.subject}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {selectedItem.lastMessage}
                </p>
                <p className="text-[10px] text-muted-foreground/40 mt-2">
                  {format(new Date(selectedItem.timestamp), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>

              {/* Reply area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Reply</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAIDraft}
                    disabled={aiDrafting}
                    className="text-[10px] uppercase tracking-wider text-accent hover:text-accent/80 h-7"
                  >
                    {aiDrafting ? (
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Bot className="h-3 w-3 mr-1" />
                    )}
                    AI Draft
                  </Button>
                </div>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply…"
                  className="bg-background/60 border-border/40 rounded-sm text-sm min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedItem?.status !== "resolved" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedItem) handleMarkResolved(selectedItem);
                  setSelectedItem(null);
                }}
                className="text-[11px] uppercase tracking-wider border-emerald-600/30 text-emerald-600 hover:bg-emerald-600/10"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Resolve
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)} className="text-[11px] uppercase tracking-wider">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="text-[11px] uppercase tracking-wider"
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                Send via Email
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
