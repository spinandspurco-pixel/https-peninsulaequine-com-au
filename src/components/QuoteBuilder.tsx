import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Send, CheckCircle, RefreshCw, FileText, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { generateQuotePDF } from "@/lib/quoteExport";

interface LineItem {
  id?: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
  category: string;
  sort_order: number;
}

interface Quote {
  id?: string;
  quote_number: string;
  inquiry_id: string | null;
  site_assessment_id: string | null;
  client_name: string;
  client_email: string;
  project_type: string;
  location: string;
  property_name: string;
  project_overview: string;
  
  scope_summary: string;
  exclusions: string;
  internal_notes: string;
  subtotal: number;
  gst: number;
  total: number;
  status: string;
  expiry_date: string;
  share_token?: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  items: any[];
}

const CATEGORIES = ["earthworks", "ground-systems", "fencing", "construction", "drainage", "surface", "services", "logistics", "general"];
const UNITS = ["system", "zone", "lm", "each", "stall", "allow", "hour", "day", "lot"];
const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "internal_review", label: "Internal Review" },
  { value: "ready_to_send", label: "Ready to Send" },
  { value: "sent", label: "Sent" },
  { value: "follow_up_due", label: "Follow-Up Due" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  internal_review: "bg-amber-600/20 text-amber-500",
  ready_to_send: "bg-accent/20 text-accent",
  sent: "bg-accent/40 text-accent",
  follow_up_due: "bg-amber-600/20 text-amber-500",
  accepted: "bg-emerald-600/20 text-emerald-500",
  declined: "bg-destructive/20 text-destructive",
  expired: "bg-muted text-muted-foreground",
};

interface QuoteBuilderProps {
  quoteId?: string | null;
  inquiryId?: string | null;
  onSaved?: () => void;
  onClose?: () => void;
}

export function QuoteBuilder({ quoteId, inquiryId, onSaved, onClose }: QuoteBuilderProps) {
  const [quote, setQuote] = useState<Quote>({
    quote_number: "",
    inquiry_id: inquiryId || null,
    site_assessment_id: null,
    client_name: "",
    client_email: "",
    project_type: "",
    location: "",
    property_name: "",
    project_overview: "",
    
    scope_summary: "",
    exclusions: "• Access to site assumed available\n• Council permits not included\n• Rock removal not included unless specified\n• Variations require written approval and updated pricing",
    internal_notes: "",
    subtotal: 0,
    gst: 0,
    total: 0,
    status: "draft",
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
    if (quoteId) loadQuote(quoteId);
    else if (inquiryId) prefillFromInquiry(inquiryId);
  }, [quoteId, inquiryId]);

  const recalcTotals = useCallback((items: LineItem[]) => {
    const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const gst = subtotal * 0.1;
    setQuote((q) => ({ ...q, subtotal, gst, total: subtotal + gst }));
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase.from("pricing_templates").select("*").eq("active", true).order("name") as any;
    setTemplates(data || []);
  };

  const loadQuote = async (id: string) => {
    const [qRes, liRes] = await Promise.all([
      supabase.from("quotes").select("*").eq("id", id).single() as any,
      supabase.from("quote_line_items").select("*").eq("quote_id", id).order("sort_order") as any,
    ]);
    if (qRes.data) {
      setQuote({
        ...qRes.data,
        expiry_date: qRes.data.expiry_date || "",
        property_name: qRes.data.property_name || "",
        project_overview: qRes.data.project_overview || "",
        
        share_token: qRes.data.share_token || undefined,
      });
    }
    if (liRes.data) {
      setLineItems(liRes.data);
    }
  };

  const prefillFromInquiry = async (id: string) => {
    const { data: inq } = await supabase.from("inquiries").select("*").eq("id", id).single();
    if (inq) {
      setQuote((q) => ({
        ...q,
        inquiry_id: id,
        client_name: inq.name,
        client_email: inq.email,
        project_type: (inq.services || []).join(", "),
        scope_summary: inq.project_vision || inq.project_details || "",
      }));
    }
    // Check for linked site assessment
    const { data: sa } = await supabase.from("site_assessments").select("*").eq("inquiry_id", id).order("created_at", { ascending: false }).limit(1);
    if (sa?.[0]) {
      setQuote((q) => ({
        ...q,
        site_assessment_id: sa[0].id,
        location: sa[0].location || q.location,
        project_type: sa[0].project_type || q.project_type,
      }));
    }
  };

  const loadTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return;
    const newItems: LineItem[] = (tmpl.items || []).map((item: any, idx: number) => ({
      title: item.title || "",
      description: item.description || "",
      quantity: item.quantity || 1,
      unit: item.unit || "each",
      unit_price: item.unit_price || 0,
      line_total: (item.quantity || 1) * (item.unit_price || 0),
      category: item.category || "general",
      sort_order: lineItems.length + idx,
    }));
    const merged = [...lineItems, ...newItems];
    setLineItems(merged);
    recalcTotals(merged);
    toast.success(`Loaded ${tmpl.name}`);
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      title: "", description: "", quantity: 1, unit: "each",
      unit_price: 0, line_total: 0, category: "general", sort_order: lineItems.length,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (idx: number, field: string, value: any) => {
    const updated = [...lineItems];
    (updated[idx] as any)[field] = value;
    if (field === "quantity" || field === "unit_price") {
      updated[idx].line_total = updated[idx].quantity * updated[idx].unit_price;
    }
    setLineItems(updated);
    recalcTotals(updated);
  };

  const removeLineItem = (idx: number) => {
    const updated = lineItems.filter((_, i) => i !== idx);
    setLineItems(updated);
    recalcTotals(updated);
  };

  const saveQuote = async (newStatus?: string) => {
    setSaving(true);
    const status = newStatus || quote.status;
    const quoteData = {
      ...quote,
      status,
      quote_number: quote.quote_number || "",
      expiry_date: quote.expiry_date || null,
      inquiry_id: quote.inquiry_id || null,
      site_assessment_id: quote.site_assessment_id || null,
    };
    delete (quoteData as any).id;

    try {
      let savedId = quoteId || quote.id;
      if (savedId) {
        const { error } = await supabase.from("quotes").update(quoteData as any).eq("id", savedId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("quotes").insert(quoteData as any).select("id, quote_number").single();
        if (error) throw error;
        savedId = data.id;
        setQuote((q) => ({ ...q, id: data.id, quote_number: data.quote_number }));
      }

      // Save line items
      if (savedId) {
        await supabase.from("quote_line_items").delete().eq("quote_id", savedId);
        if (lineItems.length > 0) {
          const items = lineItems.map((li, idx) => ({
            quote_id: savedId,
            title: li.title,
            description: li.description || null,
            quantity: li.quantity,
            unit: li.unit,
            unit_price: li.unit_price,
            line_total: li.quantity * li.unit_price,
            category: li.category,
            sort_order: idx,
          }));
          const { error } = await supabase.from("quote_line_items").insert(items as any);
          if (error) throw error;
        }
      }

      // Log activity
      await supabase.from("activity_log").insert({
        action_type: quoteId ? "quote_updated" : "quote_created",
        title: `Quote ${quote.quote_number || "new"} ${newStatus ? `→ ${newStatus}` : "saved"}`,
        description: `${quote.client_name} · $${quote.total.toLocaleString()}`,
        category: "quotes",
        entity_type: "quote",
        entity_id: savedId,
        action_level: newStatus === "sent" || newStatus === "accepted" ? "approval_required" : "autonomous",
      } as any);

      toast.success(newStatus ? `Quote ${newStatus.replace("_", " ")}` : "Quote saved");
      onSaved?.();
    } catch (e: any) {
      toast.error(e.message || "Failed to save quote");
    }
    setSaving(false);
  };

  const generateScopeDraft = async () => {
    if (!quote.client_name) { toast.error("Add client details first"); return; }
    setAiLoading(true);
    try {
      const res = await supabase.functions.invoke("admin-ai-assistant", {
        body: {
          action: "knowledge",
          payload: {
            question: `Draft a scope summary for: Client: ${quote.client_name}, Project: ${quote.project_type}, Location: ${quote.location}. Keep it under 5 sentences. Professional, technical, no filler.`,
          },
        },
      });
      if (res.data?.result) {
        setQuote((q) => ({ ...q, scope_summary: res.data.result }));
        toast.success("Scope draft generated");
      }
    } catch {
      toast.error("Failed to generate scope");
    }
    setAiLoading(false);
  };

  const fmt = (v: number) => `$${v.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-sans mb-1">Quote Builder</p>
          <h3 className="font-serif text-lg tracking-tight text-foreground">
            {quote.quote_number || "New Quote"} {quote.id && <Badge className={STATUS_COLORS[quote.status] || ""}>{quote.status.replace("_", " ")}</Badge>}
          </h3>
        </div>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-[11px] uppercase tracking-wider">Cancel</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => generateQuotePDF(quote, lineItems)} className="text-[11px] uppercase tracking-wider border-border/40">
            <Download className="h-3.5 w-3.5 mr-1" />Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => saveQuote()} disabled={loading} className="text-[11px] uppercase tracking-wider border-border/40">
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            Save Draft
          </Button>
        </div>
      </div>

      {/* Client / Project */}
      <Card className="bg-card/80 border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Client & Project</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Client Name</label>
            <Input value={quote.client_name} onChange={(e) => setQuote({ ...quote, client_name: e.target.value })} className="h-8 bg-background/60 border-border/50 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Email</label>
            <Input value={quote.client_email} onChange={(e) => setQuote({ ...quote, client_email: e.target.value })} className="h-8 bg-background/60 border-border/50 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Project Type</label>
            <Input value={quote.project_type} onChange={(e) => setQuote({ ...quote, project_type: e.target.value })} className="h-8 bg-background/60 border-border/50 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Location</label>
            <Input value={quote.location} onChange={(e) => setQuote({ ...quote, location: e.target.value })} className="h-8 bg-background/60 border-border/50 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Expiry Date</label>
            <Input type="date" value={quote.expiry_date} onChange={(e) => setQuote({ ...quote, expiry_date: e.target.value })} className="h-8 bg-background/60 border-border/50 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Property Name</label>
            <Input value={quote.property_name} onChange={(e) => setQuote({ ...quote, property_name: e.target.value })} className="h-8 bg-background/60 border-border/50 text-sm" placeholder="e.g. Willowbrook Estate" />
          </div>
          <div className="space-y-1 pt-4" />

        </CardContent>
      </Card>

      {/* Project Overview */}
      <Card className="bg-card/80 border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Project Overview</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={quote.project_overview} onChange={(e) => setQuote({ ...quote, project_overview: e.target.value })} rows={3} className="bg-background/60 border-border/50 text-sm" placeholder="High-level project description for client..." />
        </CardContent>
      </Card>

      {/* Share Link */}
      {quote.id && quote.share_token && (
        <Card className="bg-card/80 border-border/40">
          <CardContent className="py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-0.5">Client Link</p>
              <p className="text-[11px] text-muted-foreground/40 font-mono truncate max-w-[300px]">
                {window.location.origin}/quote/{quote.share_token}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] uppercase tracking-wider border-border/40"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/quote/${quote.share_token}`);
                toast.success("Link copied");
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Scope Summary */}
      <Card className="bg-card/80 border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Scope Summary</CardTitle>
            <Button variant="ghost" size="sm" onClick={generateScopeDraft} disabled={aiLoading} className="text-[9px] uppercase tracking-wider h-6 px-2">
              {aiLoading ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
              AI Draft
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea value={quote.scope_summary} onChange={(e) => setQuote({ ...quote, scope_summary: e.target.value })} rows={4} className="bg-background/60 border-border/50 text-sm" placeholder="Project scope description..." />
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="bg-card/80 border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Line Items</CardTitle>
            <div className="flex gap-2">
              <Select onValueChange={loadTemplate}>
                <SelectTrigger className="h-7 w-[160px] text-[10px] bg-background/60 border-border/50">
                  <SelectValue placeholder="Load template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={addLineItem} className="h-7 text-[10px] uppercase tracking-wider">
                <Plus className="h-3 w-3 mr-1" />Add
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {lineItems.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/50 text-center py-6">No line items. Add manually or load a template.</p>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[1fr_80px_60px_60px_90px_90px_30px] gap-2 text-[9px] uppercase tracking-wider text-muted-foreground/50 px-1">
                <span>Item</span><span>Category</span><span>Qty</span><span>Unit</span><span>Unit Price</span><span>Total</span><span></span>
              </div>
              {lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_80px_60px_60px_90px_90px_30px] gap-2 p-2 rounded-sm border border-border/20 bg-background/30">
                  <Input value={item.title} onChange={(e) => updateLineItem(idx, "title", e.target.value)} placeholder="Item title" className="h-7 text-[11px] bg-transparent border-border/30" />
                  <Select value={item.category} onValueChange={(v) => updateLineItem(idx, "category", v)}>
                    <SelectTrigger className="h-7 text-[10px] bg-transparent border-border/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" value={item.quantity} onChange={(e) => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)} className="h-7 text-[11px] bg-transparent border-border/30 text-right" />
                  <Select value={item.unit} onValueChange={(v) => updateLineItem(idx, "unit", v)}>
                    <SelectTrigger className="h-7 text-[10px] bg-transparent border-border/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" value={item.unit_price} onChange={(e) => updateLineItem(idx, "unit_price", parseFloat(e.target.value) || 0)} className="h-7 text-[11px] bg-transparent border-border/30 text-right" />
                  <div className="flex items-center justify-end text-[11px] font-medium text-foreground pr-1">
                    {fmt(item.quantity * item.unit_price)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeLineItem(idx)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Exclusions & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/80 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Exclusions & Assumptions</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={quote.exclusions} onChange={(e) => setQuote({ ...quote, exclusions: e.target.value })} rows={4} className="bg-background/60 border-border/50 text-sm" />
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Internal Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={quote.internal_notes} onChange={(e) => setQuote({ ...quote, internal_notes: e.target.value })} rows={4} className="bg-background/60 border-border/50 text-sm" placeholder="Internal only — not visible to client" />
          </CardContent>
        </Card>
      </div>

      {/* Totals + Actions */}
      <Card className="bg-card/80 border-border/40">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1 text-right sm:text-left">
              <div className="flex justify-between gap-8 text-[11px]">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{fmt(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-8 text-[11px]">
                <span className="text-muted-foreground">GST (10%)</span>
                <span className="font-medium text-foreground">{fmt(quote.gst)}</span>
              </div>
              <div className="flex justify-between gap-8 text-sm border-t border-border/30 pt-1 mt-1">
                <span className="font-medium text-foreground">Total (inc. GST)</span>
                <span className="font-serif font-semibold text-accent">{fmt(quote.total)}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => saveQuote("draft")} disabled={loading} className="text-[10px] uppercase tracking-wider border-border/40">
                <Save className="h-3 w-3 mr-1" />Save Draft
              </Button>
              <Button variant="outline" size="sm" onClick={() => saveQuote("internal_review")} disabled={loading} className="text-[10px] uppercase tracking-wider border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                <CheckCircle className="h-3 w-3 mr-1" />Submit for Review
              </Button>
              <Button variant="outline" size="sm" onClick={() => saveQuote("ready_to_send")} disabled={loading} className="text-[10px] uppercase tracking-wider border-accent/30 text-accent hover:bg-accent/10">
                <Send className="h-3 w-3 mr-1" />Mark Ready
              </Button>
              <Button variant="outline" size="sm" onClick={() => saveQuote("sent")} disabled={loading} className="text-[10px] uppercase tracking-wider border-accent/50 text-accent hover:bg-accent/10">
                <Send className="h-3 w-3 mr-1" />Mark Sent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
