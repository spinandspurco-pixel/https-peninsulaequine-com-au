import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  RefreshCw, Inbox, Mail, Clock, BarChart3, AlertTriangle,
  MessageSquare, Send, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  services: string[];
  project_vision?: string | null;
  project_details?: string | null;
  budget_range?: string | null;
  preferred_start?: string | null;
  status: string;
  notes?: string | null;
  lead_tier?: string | null;
  created_at: string;
}

type AIAction = "triage" | "draft_reply" | "follow_ups" | "daily_summary" | "alerts" | "knowledge";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AIOperationsAssistant({ inquiries }: { inquiries: Inquiry[] }) {
  const [activeTab, setActiveTab] = useState("triage");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  // Draft reply state
  const [selectedInquiry, setSelectedInquiry] = useState("");
  const [replyType, setReplyType] = useState("initial response");

  // Knowledge state
  const [question, setQuestion] = useState("");

  const callAI = async (action: AIAction, payload?: any) => {
    setLoading(true);
    setResult("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Not authenticated"); setLoading(false); return; }

      const res = await supabase.functions.invoke("admin-ai-assistant", {
        body: { action, payload },
      });

      if (res.error) {
        toast.error(res.error.message || "AI request failed");
        setLoading(false);
        return;
      }

      const data = res.data as any;
      if (data?.error) {
        toast.error(data.error);
      } else {
        setResult(data?.result || "No response generated.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to contact AI assistant");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedInq = inquiries.find((i) => i.id === selectedInquiry);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="border-t border-accent/20 pt-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">Internal · AI</p>
        <h2 className="font-serif text-xl tracking-tight text-foreground">Operations Assistant</h2>
        <p className="text-[11px] text-muted-foreground mt-1">Draft-only mode · All outputs require human review</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/60 border border-border/30 h-auto flex-wrap gap-1 p-1">
          {[
            { value: "triage", label: "Lead Triage", icon: Inbox },
            { value: "draft_reply", label: "Draft Reply", icon: Mail },
            { value: "follow_ups", label: "Follow-Ups", icon: Clock },
            { value: "daily_summary", label: "Daily Summary", icon: BarChart3 },
            { value: "alerts", label: "Alerts", icon: AlertTriangle },
            { value: "knowledge", label: "Ask PE", icon: MessageSquare },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-[11px] uppercase tracking-wider data-[state=active]:bg-accent/10 data-[state=active]:text-accent gap-1.5 px-3 py-1.5"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Lead Triage ── */}
        <TabsContent value="triage" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Lead Intelligence</p>
                  <CardTitle className="text-base font-medium">Inbox Triage</CardTitle>
                </div>
                <Button
                  variant="outline" size="sm"
                  onClick={() => callAI("triage")}
                  disabled={loading}
                  className="text-[11px] uppercase tracking-wider border-border/40"
                >
                  {loading ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Inbox className="mr-1.5 h-3.5 w-3.5" />}
                  Analyse Leads
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Reviews {inquiries.length} enquiries · classifies urgency, value, and next steps
              </p>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* ── Draft Reply ── */}
        <TabsContent value="draft_reply" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/40">
            <CardHeader className="pb-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Communication</p>
              <CardTitle className="text-base font-medium">Reply Draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Select Enquiry</label>
                  <Select value={selectedInquiry} onValueChange={setSelectedInquiry}>
                    <SelectTrigger className="h-9 bg-background/60 border-border/50 rounded-sm text-sm">
                      <SelectValue placeholder="Choose an enquiry" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiries.slice(0, 20).map((inq) => (
                        <SelectItem key={inq.id} value={inq.id}>
                          {inq.name} — {inq.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Reply Type</label>
                  <Select value={replyType} onValueChange={setReplyType}>
                    <SelectTrigger className="h-9 bg-background/60 border-border/50 rounded-sm text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial response">Initial Response</SelectItem>
                      <SelectItem value="site assessment booking">Site Assessment Booking</SelectItem>
                      <SelectItem value="follow-up">Follow-Up</SelectItem>
                      <SelectItem value="proposal chase-up">Proposal Chase-Up</SelectItem>
                      <SelectItem value="polite decline">Polite Decline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedInq && (
                <div className="p-3 rounded-sm border border-border/30 bg-background/40 text-[11px] text-muted-foreground space-y-1">
                  <p><span className="text-foreground font-medium">{selectedInq.name}</span> · {selectedInq.email}</p>
                  <p>Services: {selectedInq.services.join(", ") || "—"}</p>
                  <p>Budget: {selectedInq.budget_range || "—"} · Tier: {selectedInq.lead_tier || "standard"}</p>
                </div>
              )}
              <Button
                variant="outline" size="sm"
                onClick={() => callAI("draft_reply", { inquiry: selectedInq, replyType })}
                disabled={loading || !selectedInquiry}
                className="text-[11px] uppercase tracking-wider border-border/40"
              >
                {loading ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                Generate Draft
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Follow-Ups ── */}
        <TabsContent value="follow_ups" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Pipeline</p>
                  <CardTitle className="text-base font-medium">Follow-Up Recommendations</CardTitle>
                </div>
                <Button
                  variant="outline" size="sm"
                  onClick={() => callAI("follow_ups")}
                  disabled={loading}
                  className="text-[11px] uppercase tracking-wider border-border/40"
                >
                  {loading ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Clock className="mr-1.5 h-3.5 w-3.5" />}
                  Check Follow-Ups
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Identifies stale leads and generates follow-up drafts</p>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* ── Daily Summary ── */}
        <TabsContent value="daily_summary" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Operations</p>
                  <CardTitle className="text-base font-medium">Daily Summary</CardTitle>
                </div>
                <Button
                  variant="outline" size="sm"
                  onClick={() => callAI("daily_summary")}
                  disabled={loading}
                  className="text-[11px] uppercase tracking-wider border-border/40"
                >
                  {loading ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <BarChart3 className="mr-1.5 h-3.5 w-3.5" />}
                  Generate Summary
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Hot leads, overdue items, financial flags, and pipeline status</p>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* ── Alerts ── */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Monitoring</p>
                  <CardTitle className="text-base font-medium">Alert Scanner</CardTitle>
                </div>
                <Button
                  variant="outline" size="sm"
                  onClick={() => callAI("alerts")}
                  disabled={loading}
                  className="text-[11px] uppercase tracking-wider border-border/40"
                >
                  {loading ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />}
                  Scan Alerts
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Lead, financial, and operations alerts</p>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* ── Knowledge / SOP ── */}
        <TabsContent value="knowledge" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/40">
            <CardHeader className="pb-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Internal Knowledge</p>
              <CardTitle className="text-base font-medium">Ask PE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What is our standard follow-up sequence? What are our payment terms?"
                className="bg-background/60 border-border/50 rounded-sm text-sm min-h-[60px]"
                rows={2}
              />
              <Button
                variant="outline" size="sm"
                onClick={() => callAI("knowledge", { question })}
                disabled={loading || !question.trim()}
                className="text-[11px] uppercase tracking-wider border-border/40"
              >
                {loading ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="mr-1.5 h-3.5 w-3.5" />}
                Ask
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── AI Result Panel ── */}
      {(result || loading) && (
        <Card className="bg-card/80 border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-accent/30 text-accent">
                  AI Draft
                </Badge>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Requires human review</p>
              </div>
              {result && (
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-[11px]">
                  {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <RefreshCw className="h-4 w-4 animate-spin text-accent/60" />
                <p className="text-sm text-muted-foreground">Generating…</p>
              </div>
            ) : (
              <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90 [&_h1]:text-base [&_h1]:font-serif [&_h2]:text-sm [&_h2]:font-medium [&_h2]:uppercase [&_h2]:tracking-wider [&_h2]:text-accent/80 [&_h3]:text-sm [&_h3]:font-medium [&_ul]:space-y-1 [&_li]:text-foreground/80 [&_p]:text-foreground/80 [&_strong]:text-foreground">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
