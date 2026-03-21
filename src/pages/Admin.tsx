import { useState, useEffect } from "react";
import { RevenueStrip } from "@/components/RevenueStrip";
import { DecisionPanel } from "@/components/DecisionPanel";
import { QuotesDashboard } from "@/components/QuotesDashboard";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { ProjectProfitTracker } from "@/components/ProjectProfitTracker";
import { AdminStaffOnboarding } from "@/components/AdminStaffOnboarding";
import { CRMPipeline } from "@/components/crm/CRMPipeline";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { TodaysPlan } from "@/components/TodaysPlan";
import { FollowUpCommandView } from "@/components/FollowUpCommandView";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { LogOut, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [quoteForInquiryId, setQuoteForInquiryId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/login");
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-accent/60" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-background">

        {/* ── Masthead ──────────────────────────────── */}
        <header className="pt-32 sm:pt-40 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto px-6">
            <div
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40 mb-4">
                Control Centre
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground tracking-tight">
                Peninsula Equine HQ
              </h1>
              <div className="flex items-center gap-6 mt-4">
                <p className="text-[12px] text-muted-foreground/50">
                  {user?.email}
                </p>
                <span className="text-muted-foreground/20">·</span>
                <p className="text-[12px] text-muted-foreground/50">
                  {format(new Date(), "EEEE, d MMMM yyyy")}
                </p>
                <span className="text-muted-foreground/20">·</span>
                <button
                  onClick={handleSignOut}
                  className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/40 hover:text-foreground/70 transition-opacity duration-300"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ── Quick Actions ────────────────────────── */}
        <div className="border-t border-border/10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div
              className="flex items-center gap-8 overflow-x-auto opacity-0 animate-fade-in"
              style={{ animationDelay: "250ms", animationFillMode: "both" }}
            >
              {[
                { label: "New Enquiry", action: () => navigate("/contact") },
                { label: "Create Quote", action: () => setQuoteForInquiryId("new") },
                { label: "Pipeline", action: () => document.getElementById("zone-pipeline")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Financials", action: () => document.getElementById("zone-financial")?.scrollIntoView({ behavior: "smooth" }) },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/45 hover:text-foreground/80 transition-opacity duration-300 whitespace-nowrap flex-shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════ */}
        {/*  ZONE 1 — TODAY                             */}
        {/* ════════════════════════════════════════════ */}
        <section className="border-t border-border/10 pt-14 sm:pt-20 pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto px-6">
            <div
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: "350ms", animationFillMode: "both" }}
            >
              <div className="flex items-center gap-4 mb-10">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/35">01</span>
                <div className="w-6 h-px bg-accent/15" />
                <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground/90">Today</h2>
              </div>

              {/* Revenue inline strip */}
              <div className="mb-10">
                <RevenueStrip />
              </div>

              {/* Decision panel — minimal */}
              <div className="mb-10">
                <DecisionPanel />
              </div>

              {/* Today's plan */}
              <TodaysPlan />

              {/* Follow-ups */}
              <div className="mt-10">
                <FollowUpCommandView />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/*  ZONE 2 — PIPELINE                          */}
        {/* ════════════════════════════════════════════ */}
        <section id="zone-pipeline" className="border-t border-border/10 pt-14 sm:pt-20 pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/35">02</span>
              <div className="w-6 h-px bg-accent/15" />
              <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground/90">Pipeline</h2>
            </div>

            <div className="mb-10">
              <CRMPipeline onCreateQuote={(id) => setQuoteForInquiryId(id)} />
            </div>

            <QuotesDashboard />
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/*  ZONE 3 — FINANCIAL SNAPSHOT                */}
        {/* ════════════════════════════════════════════ */}
        <section id="zone-financial" className="border-t border-border/10 pt-14 sm:pt-20 pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/35">03</span>
              <div className="w-6 h-px bg-accent/15" />
              <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground/90">Financial Snapshot</h2>
            </div>

            <div className="mb-10">
              <ProjectProfitTracker />
            </div>

            <FinancialDashboard />
          </div>
        </section>

        {/* ── Staff (collapsed to bottom) ──────────── */}
        <section className="border-t border-border/10 pt-14 sm:pt-20 pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/35">∞</span>
              <div className="w-6 h-px bg-accent/15" />
              <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground/90">Team</h2>
            </div>
            <AdminStaffOnboarding />
          </div>
        </section>

      </div>

      {/* Quote Builder Dialog */}
      <Dialog open={!!quoteForInquiryId} onOpenChange={(v) => !v && setQuoteForInquiryId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Create Quote</DialogTitle>
          </DialogHeader>
          <QuoteBuilder inquiryId={quoteForInquiryId} onSaved={() => setQuoteForInquiryId(null)} onClose={() => setQuoteForInquiryId(null)} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
