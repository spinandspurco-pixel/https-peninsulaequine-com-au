/**
 * ClientQuote — Premium client-facing quote presentation.
 * Accessed via /quote/:token (no auth required).
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { GroundLockPanelSVG, PanelDefs } from "@/components/groundlock/GroundLockPanelSVG";
import { ArrowRight, Check, Phone, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LineItem {
  id: string;
  title: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
  category: string;
  sort_order: number;
}

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_email: string | null;
  property_name: string | null;
  project_type: string;
  location: string | null;
  scope_summary: string | null;
  project_overview: string | null;
  exclusions: string | null;
  subtotal: number;
  gst: number;
  total: number;
  status: string;
  expiry_date: string | null;
  created_at: string;
  groundlock_included: boolean | null;
  share_token: string;
  accepted_at: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  earthworks: "Earthworks",
  "ground-systems": "Ground Systems",
  fencing: "Fencing & Boundaries",
  construction: "Construction",
  drainage: "Drainage",
  surface: "Surface Works",
  services: "Professional Services",
  logistics: "Logistics",
  general: "General",
};

export default function ClientQuote() {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [groundlockOpen, setGroundlockOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    loadQuote();
  }, [token]);

  async function loadQuote() {
    setLoading(true);
    const { data: q, error: qErr } = await supabase
      .from("quotes")
      .select("*")
      .eq("share_token", token!)
      .single();

    if (qErr || !q) {
      setError("Quote not found or no longer available.");
      setLoading(false);
      return;
    }

    // Mark as viewed
    if (!q.viewed_at) {
      await supabase.from("quotes").update({ viewed_at: new Date().toISOString() }).eq("id", q.id);
    }

    setQuote(q as unknown as Quote);
    setAccepted(!!q.accepted_at);

    const { data: items } = await supabase
      .from("quote_line_items")
      .select("*")
      .eq("quote_id", q.id)
      .order("sort_order", { ascending: true });

    setLineItems((items || []) as unknown as LineItem[]);
    setLoading(false);
  }

  async function handleAccept() {
    if (!quote) return;
    setAccepting(true);
    
    const { error } = await supabase
      .from("quotes")
      .update({
        accepted_at: new Date().toISOString(),
        status: "accepted",
      })
      .eq("id", quote.id);

    if (error) {
      toast.error("Unable to accept quote. Please contact us directly.");
      setAccepting(false);
      return;
    }

    // Notify admin via edge function
    try {
      await supabase.functions.invoke("send-inquiry-notification", {
        body: {
          type: "quote_accepted",
          quote_number: quote.quote_number,
          client_name: quote.client_name,
          client_email: quote.client_email,
        },
      });
    } catch {
      // Non-blocking
    }

    setAccepted(true);
    setAccepting(false);
    toast.success("Quote accepted — we'll be in touch.");
  }

  // Group line items by category
  const groupedItems = lineItems.reduce<Record<string, LineItem[]>>((acc, item) => {
    const cat = item.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border border-accent/30 border-t-accent/80 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30">Loading proposal</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="font-serif text-lg text-foreground/80 mb-3">Quote Unavailable</p>
          <p className="text-[13px] text-muted-foreground/40 leading-[1.8] mb-6">{error}</p>
          <Button asChild variant="outline-light" size="sm">
            <Link to="/contact">Contact Peninsula Equine</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = quote.expiry_date && new Date(quote.expiry_date) < new Date();

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ HEADER STRIP ═════════════════════════════════ */}
      <header className="border-b border-border/10 bg-card/50">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/40 mb-0.5">Peninsula Equine</p>
            <p className="text-[10px] font-mono text-muted-foreground/25 tracking-wider">{quote.quote_number}</p>
          </div>
          {accepted ? (
            <div className="flex items-center gap-2 text-green-400/70">
              <Check className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase tracking-[0.15em]">Accepted</span>
            </div>
          ) : isExpired ? (
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/30">Expired</span>
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent/40">Active</span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        {/* ═══ CLIENT HEADER ══════════════════════════════ */}
        <section className="mb-14">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/35 mb-6">Project Proposal</p>
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground/90 mb-2" style={{ lineHeight: "1.15" }}>
            {quote.client_name}
          </h1>
          {quote.property_name && (
            <p className="text-[14px] text-muted-foreground/45 mb-1">{quote.property_name}</p>
          )}
          {quote.location && (
            <p className="text-[13px] text-muted-foreground/30">{quote.location}</p>
          )}
          <p className="text-[11px] text-muted-foreground/25 mt-3">
            {format(new Date(quote.created_at), "d MMMM yyyy")}
            {quote.expiry_date && (
              <span> · Valid until {format(new Date(quote.expiry_date), "d MMMM yyyy")}</span>
            )}
          </p>
        </section>

        {/* ═══ PROJECT OVERVIEW ═══════════════════════════ */}
        {quote.project_overview && (
          <section className="mb-14">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/30 mb-4">Project Overview</p>
            <p className="text-[14px] text-muted-foreground/50 leading-[1.9] whitespace-pre-line">
              {quote.project_overview}
            </p>
          </section>
        )}

        {quote.scope_summary && (
          <section className="mb-14">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/30 mb-4">Scope of Works</p>
            <p className="text-[13px] text-muted-foreground/40 leading-[1.9] whitespace-pre-line">
              {quote.scope_summary}
            </p>
          </section>
        )}

        {/* ═══ SCOPE — LINE ITEMS BY CATEGORY ═════════════ */}
        <section className="mb-14">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/30 mb-8">Detailed Breakdown</p>
          
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-foreground/50 mb-4 pb-2 border-b border-border/10">
                  {CATEGORY_LABELS[category] || category}
                </p>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground/65">{item.title}</p>
                        {item.description && (
                          <p className="text-[11px] text-muted-foreground/30 leading-[1.7] mt-0.5">{item.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/20 mt-0.5">
                          {item.quantity} {item.unit} × ${item.unit_price.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <p className="text-[13px] font-medium text-foreground/55 tabular-nums shrink-0">
                        ${item.line_total.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ GROUNDLOCK TOGGLE ══════════════════════════ */}
        {quote.groundlock_included !== null && (
          <section className="mb-14">
            {quote.groundlock_included ? (
              <div className="border border-accent/12 rounded-sm overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/[0.02] transition-colors"
                  onClick={() => setGroundlockOpen(!groundlockOpen)}
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 30 36" className="w-5 h-auto">
                      <PanelDefs id="cq" />
                      <GroundLockPanelSVG x={0} y={0} scale={0.3} active defsId="cq" />
                    </svg>
                    <div>
                      <p className="text-[12px] font-medium text-accent/70">GroundLock™ System Included</p>
                      <p className="text-[10px] text-muted-foreground/30">Engineered ground stabilisation</p>
                    </div>
                  </div>
                  {groundlockOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground/30" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground/30" />
                  )}
                </button>
                {groundlockOpen && (
                  <div className="px-5 pb-5 border-t border-border/8">
                    <div className="py-4">
                      <div className="flex justify-center mb-4">
                        <svg viewBox="0 0 100 120" className="w-32 h-auto opacity-60">
                          <PanelDefs id="cqv" />
                          <GroundLockPanelSVG active showTabs defsId="cqv" />
                        </svg>
                      </div>
                      <p className="text-[12px] text-muted-foreground/40 leading-[1.8] text-center max-w-sm mx-auto">
                        This project includes our proprietary horseshoe-geometry ground stabilisation system — 
                        engineered for equine traffic, drainage, and long-term surface performance.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-border/8 rounded-sm p-5">
                <p className="text-[12px] text-muted-foreground/35">
                  <span className="text-foreground/50 font-medium">Standard Surface</span> — 
                  This project uses conventional ground preparation. GroundLock™ system available upon request.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ═══ INVESTMENT SECTION ═════════════════════════ */}
        <section className="mb-14">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent/30 mb-6">Investment</p>
          
          <div className="border border-border/10 rounded-sm overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[13px] text-muted-foreground/40">Subtotal</p>
                <p className="text-[14px] text-foreground/60 tabular-nums">
                  ${quote.subtotal.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[13px] text-muted-foreground/40">GST (10%)</p>
                <p className="text-[14px] text-foreground/60 tabular-nums">
                  ${quote.gst.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="border-t border-accent/12 bg-accent/[0.03] p-6 flex justify-between items-center">
              <p className="text-[12px] font-mono uppercase tracking-[0.15em] text-foreground/60">Total Investment</p>
              <p className="font-serif text-xl text-foreground/85 tabular-nums">
                ${quote.total.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </section>

        {/* ═══ EXCLUSIONS ═════════════════════════════════ */}
        {quote.exclusions && (
          <section className="mb-14">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/25 mb-4">Exclusions & Notes</p>
            <p className="text-[12px] text-muted-foreground/30 leading-[1.8] whitespace-pre-line">
              {quote.exclusions}
            </p>
          </section>
        )}

        {/* ═══ CTA — ACCEPT / REQUEST CHANGES / CALL ═════ */}
        <section className="pt-8 border-t border-border/10">
          {accepted ? (
            <div className="text-center py-8">
              <Check className="w-8 h-8 text-green-400/60 mx-auto mb-3" />
              <p className="font-serif text-lg text-foreground/80 mb-1">Quote Accepted</p>
              <p className="text-[13px] text-muted-foreground/35">
                {quote.accepted_at && `Accepted ${format(new Date(quote.accepted_at), "d MMMM yyyy")}`}
              </p>
              <p className="text-[12px] text-muted-foreground/25 mt-3">
                We'll be in touch to confirm next steps.
              </p>
            </div>
          ) : isExpired ? (
            <div className="text-center py-8">
              <p className="font-serif text-lg text-foreground/60 mb-2">Quote Expired</p>
              <p className="text-[13px] text-muted-foreground/35 mb-6">
                This proposal is no longer valid. Contact us for an updated quote.
              </p>
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">Request Updated Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={handleAccept}
                disabled={accepting}
              >
                {accepting ? "Processing…" : "Accept This Proposal"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline-light" size="lg">
                  <a href={`mailto:info@peninsulaequine.org?subject=Quote ${quote.quote_number} — Changes Requested`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Request Changes
                  </a>
                </Button>
                <Button asChild variant="outline-light" size="lg">
                  <a href="tel:0418585489">
                    <Phone className="mr-2 h-4 w-4" />
                    Book a Call
                  </a>
                </Button>
              </div>

              <p className="text-[10px] text-center text-muted-foreground/20 pt-2">
                By accepting, you agree to the scope and investment outlined above.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* ═══ FOOTER ═══════════════════════════════════════ */}
      <footer className="border-t border-border/8 mt-12">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-[10px] font-mono text-muted-foreground/20 tracking-wider">
            Peninsula Equine · Mornington Peninsula, VIC
          </p>
          <p className="text-[10px] font-mono text-muted-foreground/15 tracking-wider">
            peninsulaequine.com.au
          </p>
        </div>
      </footer>
    </div>
  );
}
