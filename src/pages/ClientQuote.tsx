/**
 * ClientQuote — Premium client-facing quote presentation.
 * Accessed via /quote/:token (no auth required).
 * Luxury architectural proposal — NOT a dashboard.
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProposalHeader } from "@/components/proposal/ProposalHeader";
import { ProposalOverview } from "@/components/proposal/ProposalOverview";
import { ProposalScope } from "@/components/proposal/ProposalScope";
import { ProposalGroundLock } from "@/components/proposal/ProposalGroundLock";
import { ProposalInvestment } from "@/components/proposal/ProposalInvestment";
import { ProposalDecision } from "@/components/proposal/ProposalDecision";
import { toast } from "sonner";

export interface QuoteData {
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

export interface LineItem {
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

export default function ClientQuote() {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [groundlockOn, setGroundlockOn] = useState(true);

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

    if (!q.viewed_at) {
      await supabase.from("quotes").update({ viewed_at: new Date().toISOString() }).eq("id", q.id);
    }

    setQuote(q as unknown as QuoteData);
    setAccepted(!!q.accepted_at);
    setGroundlockOn(q.groundlock_included !== false);

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
    const { error } = await supabase
      .from("quotes")
      .update({ accepted_at: new Date().toISOString(), status: "accepted" })
      .eq("id", quote.id);

    if (error) {
      toast.error("Unable to accept quote. Please contact us directly.");
      return;
    }

    try {
      await supabase.functions.invoke("send-inquiry-notification", {
        body: {
          type: "quote_accepted",
          quote_number: quote.quote_number,
          client_name: quote.client_name,
          client_email: quote.client_email,
        },
      });
    } catch { /* non-blocking */ }

    setAccepted(true);
    toast.success("Proposal accepted — we'll be in touch shortly.");
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F6F3EE" }}>
        <div className="text-center">
          <div className="w-5 h-5 border border-[#8C6A3B]/30 border-t-[#8C6A3B]/70 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[11px] font-sans uppercase tracking-[0.2em]" style={{ color: "#2B2B2B", opacity: 0.3 }}>
            Loading proposal
          </p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F6F3EE" }}>
        <div className="text-center max-w-sm">
          <p className="font-serif text-xl mb-3" style={{ color: "#2B2B2B" }}>Quote Unavailable</p>
          <p className="text-[13px] leading-[1.8] mb-6" style={{ color: "#2B2B2B", opacity: 0.4 }}>{error}</p>
          <a href="mailto:info@peninsulaequine.org" className="text-[12px] underline" style={{ color: "#8C6A3B" }}>
            Contact Peninsula Equine
          </a>
        </div>
      </div>
    );
  }

  const isExpired = quote.expiry_date && new Date(quote.expiry_date) < new Date();

  return (
    <div className="min-h-screen" style={{ background: "#F6F3EE", color: "#2B2B2B" }}>
      <div className="max-w-[1140px] mx-auto px-6 sm:px-10 lg:px-16">

        <ProposalHeader quote={quote} accepted={accepted} isExpired={!!isExpired} />

        <ProposalOverview overview={quote.project_overview} />

        <ProposalScope groupedItems={groupedItems} scopeSummary={quote.scope_summary} />

        <ProposalGroundLock
          included={quote.groundlock_included}
          groundlockOn={groundlockOn}
          onToggle={setGroundlockOn}
        />

        <ProposalInvestment
          quote={quote}
          lineItems={lineItems}
          groundlockOn={groundlockOn}
          exclusions={quote.exclusions}
        />

        <ProposalDecision
          quote={quote}
          accepted={accepted}
          isExpired={!!isExpired}
          onAccept={handleAccept}
        />

        {/* Footer */}
        <footer className="py-12 mt-8 border-t" style={{ borderColor: "rgba(43,43,43,0.06)" }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-sans tracking-[0.15em] uppercase" style={{ color: "rgba(43,43,43,0.25)" }}>
              Peninsula Equine · Mornington Peninsula, VIC
            </p>
            <p className="text-[10px] font-sans tracking-[0.15em]" style={{ color: "rgba(43,43,43,0.15)" }}>
              peninsulaequine.com.au
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
