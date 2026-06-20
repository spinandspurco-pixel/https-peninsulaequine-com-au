import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import { Layout } from "@/components/layout/Layout";
import { HqPreviewBanner } from "@/components/hq/HqPreviewBanner";
import { CommandOverview } from "@/components/hq/CommandOverview";
import { ApplicationsInbox } from "@/components/hq/ApplicationsInbox";
import { ProjectsBoard } from "@/components/hq/ProjectsBoard";
import { WriteGuard } from "@/components/hq/WriteGuard";
import { CRMPipeline } from "@/components/crm/CRMPipeline";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { AdminStaffOnboarding } from "@/components/AdminStaffOnboarding";
import { WholePropertyInbox } from "@/components/admin/WholePropertyInbox";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { TodaysPlan } from "@/components/TodaysPlan";
import { FollowUpCommandView } from "@/components/FollowUpCommandView";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";

const CONTENT_TILES = [
  { label: "Services", note: "Capabilities, pricing, FAQ", to: "/hq/services" },
  { label: "Testimonials", note: "Client voices and approvals", to: "/hq/testimonials" },
  { label: "Events", note: "Clinics, RSVPs, capacity", to: "/hq/events" },
  { label: "Documents", note: "Client packs, field notes", to: "/hq/documents" },
  { label: "Selected Works", note: "Case-study chapters, scope, summary", to: "/hq/selected-works" },
  { label: "Field Notes", note: "Editorial dispatches from the build", to: "/hq/field-notes" },
];

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { isPreview, enterPreview } = useHqMode();
  const navigate = useNavigate();
  const [quoteForInquiryId, setQuoteForInquiryId] = useState<string | null>(null);
  const [opsOpen, setOpsOpen] = useState(false);

  // Allow signed-in users with preview role too (handled by useHqMode)
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  // Block non-admin / non-preview from any write surfaces
  const canAccess = isAdmin || isPreview;

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
  if (!canAccess) return null;

  return (
    <Layout>
      <HqPreviewBanner />
      <div className="min-h-screen bg-background">
        {/* ── Masthead ──────────────────────────────── */}
        <header className="pt-28 sm:pt-36 pb-10 sm:pb-14">
          <div className="max-w-5xl mx-auto px-6">
            <div className="opacity-0 animate-fade-in" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/45 mb-4">
                Command Centre
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground tracking-tight">
                Peninsula Equine HQ
              </h1>
              <div className="flex items-center gap-5 mt-4 flex-wrap">
                <p className="text-[11px] text-muted-foreground/50">{user?.email}</p>
                <span className="text-muted-foreground/20">·</span>
                <p className="text-[11px] text-muted-foreground/50">
                  {format(new Date(), "EEEE, d MMMM yyyy")}
                </p>
                <span className="text-muted-foreground/20">·</span>
                {isAdmin && !isPreview && (
                  <button
                    onClick={enterPreview}
                    className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/45 hover:text-accent/80 transition-colors"
                  >
                    Enter client preview
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/45 hover:text-foreground/80 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Quick rail */}
        <div className="border-t border-border/10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center gap-8 overflow-x-auto">
              {[
                { id: "zone-overview", label: "01 · Overview" },
                { id: "zone-pipeline", label: "02 · Pipeline" },
                { id: "zone-applications", label: "03 · Applications" },
                { id: "zone-content", label: "04 · Content" },
                { id: "zone-projects", label: "05 · Projects" },
                { id: "zone-preview", label: "06 · Client Preview" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                  className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/45 hover:text-foreground/80 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* 01 — COMMAND OVERVIEW                       */}
        {/* ════════════════════════════════════════════ */}
        <Zone id="zone-overview" number="01" title="Command Overview">
          <CommandOverview />
        </Zone>

        {/* ════════════════════════════════════════════ */}
        {/* 02 — PIPELINE                               */}
        {/* ════════════════════════════════════════════ */}
        <Zone
          id="zone-pipeline"
          number="02"
          title="Pipeline"
          subtitle="From new enquiry through to archived. Move a card to advance the stage."
        >
          <CRMPipeline onCreateQuote={(id) => !isPreview && setQuoteForInquiryId(id)} />
        </Zone>

        {/* ════════════════════════════════════════════ */}
        {/* 03 — APPLICATIONS                           */}
        {/* ════════════════════════════════════════════ */}
        <Zone
          id="zone-applications"
          number="03"
          title="Applications"
          subtitle="Apply to Build submissions. Score, note, and convert qualified leads into projects."
        >
          <ApplicationsInbox />
        </Zone>

        {/* ════════════════════════════════════════════ */}
        {/* 04 — CONTENT                                */}
        {/* ════════════════════════════════════════════ */}
        <Zone
          id="zone-content"
          number="04"
          title="Content"
          subtitle="The public surface. Each tile opens its own editor."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/10">
            {CONTENT_TILES.map((tile) => (
              <button
                key={tile.label}
                onClick={() => navigate(tile.to)}
                className="group bg-background text-left px-6 py-8 hover:bg-muted/20 transition-colors duration-500"
              >
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-serif text-lg font-light text-foreground/90 group-hover:text-foreground transition-colors">
                    {tile.label}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/30 group-hover:text-accent/60 transition-colors">
                    Open →
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground/55 leading-relaxed">{tile.note}</p>
              </button>
            ))}
          </div>
        </Zone>

        {/* ════════════════════════════════════════════ */}
        {/* 05 — PROJECTS                               */}
        {/* ════════════════════════════════════════════ */}
        <Zone
          id="zone-projects"
          number="05"
          title="Projects"
          subtitle="Live build register. Open a row for status, scope, gallery, timeline and client-facing summary."
        >
          <ProjectsBoard />
        </Zone>

        {/* ════════════════════════════════════════════ */}
        {/* 06 — CLIENT PREVIEW                         */}
        {/* ════════════════════════════════════════════ */}
        <Zone
          id="zone-preview"
          number="06"
          title="Client Preview"
          subtitle="A view-only version of HQ — share with prospects, sponsors or future clients without exposing the working backend."
        >
          <div className="space-y-8">
            <div className="border border-accent/20 px-6 py-8 bg-background">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/55 mb-4">
                What preview shows
              </p>
              <ul className="text-[13px] text-foreground/75 space-y-2 leading-relaxed">
                <li>· Command Overview metrics and activity feed</li>
                <li>· Pipeline (read-only)</li>
                <li>· Applications inbox (no scoring or conversion)</li>
                <li>· Content surfaces (no edits)</li>
                <li>· Selected Works and Field Notes (read-only)</li>
              </ul>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/55 mt-8 mb-4">
                What stays hidden
              </p>
              <ul className="text-[13px] text-muted-foreground/60 space-y-2 leading-relaxed">
                <li>· Team, financial and operational drawers</li>
                <li>· Database, secrets, user management</li>
              </ul>
            </div>

            {isAdmin && (
              <div className="flex flex-wrap items-center gap-8">
                <button
                  onClick={enterPreview}
                  className="text-[11px] uppercase tracking-[0.22em] text-foreground/85 hover:text-accent transition-colors"
                >
                  Enter preview here →
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/hq?view=preview`;
                    navigator.clipboard.writeText(url);
                  }}
                  className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/55 hover:text-foreground/80 transition-colors"
                >
                  Copy share link →
                </button>
              </div>
            )}
          </div>
        </Zone>

        {/* ════════════════════════════════════════════ */}
        {/* ∞ — OPERATIONS (collapsed)                  */}
        {/* ════════════════════════════════════════════ */}
        {!isPreview && (
          <section className="border-t border-border/10 pt-14 sm:pt-20 pb-20 sm:pb-28">
            <div className="max-w-5xl mx-auto px-6">
              <button
                onClick={() => setOpsOpen((v) => !v)}
                className="flex items-center gap-4 mb-10 group"
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/35">∞</span>
                <div className="w-6 h-px bg-accent/15" />
                <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground/90 group-hover:text-foreground transition-colors">
                  Operations
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/40 ml-3">
                  {opsOpen ? "Collapse −" : "Expand +"}
                </span>
              </button>

              {opsOpen && (
                <div className="space-y-16">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-6">
                      Today
                    </p>
                    <TodaysPlan />
                    <div className="mt-10">
                      <FollowUpCommandView />
                    </div>
                  </div>

                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-6">
                      Whole-Property Inbox
                    </p>
                    <WholePropertyInbox />
                  </div>

                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-6">
                      Financial Snapshot
                    </p>
                    <FinancialDashboard />
                  </div>

                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40 mb-6">
                      Team
                    </p>
                    <AdminStaffOnboarding />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <Dialog open={!!quoteForInquiryId} onOpenChange={(v) => !v && setQuoteForInquiryId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Create Quote</DialogTitle>
          </DialogHeader>
          <QuoteBuilder
            inquiryId={quoteForInquiryId}
            onSaved={() => setQuoteForInquiryId(null)}
            onClose={() => setQuoteForInquiryId(null)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function Zone({
  id,
  number,
  title,
  subtitle,
  children,
}: {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-border/10 pt-14 sm:pt-20 pb-20 sm:pb-28">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/40">{number}</span>
          <div className="w-6 h-px bg-accent/20" />
          <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground/90">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-[12px] text-muted-foreground/60 max-w-xl mb-10 leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className={subtitle ? "" : "mt-10"}>{children}</div>
      </div>
    </section>
  );
}
