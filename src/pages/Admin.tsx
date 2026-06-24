import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import { Layout } from "@/components/layout/Layout";
import { hqLog, useHqMount, HQ_DEFAULT_TIMEOUT_MS } from "@/lib/hqDiagnostics";
import { HqPreviewBanner } from "@/components/hq/HqPreviewBanner";
import { CommandOverview } from "@/components/hq/CommandOverview";
import { ApplicationsInbox } from "@/components/hq/ApplicationsInbox";
import { ProjectsBoard } from "@/components/hq/ProjectsBoard";
import { WriteGuard } from "@/components/hq/WriteGuard";
import { CRMPipeline } from "@/components/crm/CRMPipeline";
import { QuoteBuilder } from "@/components/QuoteBuilder";
import { ControlRoom } from "@/components/hq/ControlRoom";
import { HqNav } from "@/components/hq/HqNav";
import { canSeeHqItem } from "@/components/hq/hqAccess";

import {
  PreviewWelcome,
  BlueprintField,
} from "@/components/hq/HqPrimitives";
import { resolveIdentity } from "@/components/hq/hqIdentity";
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
  const { user, isAdmin, loading, signOut, roles, isPreview: isPreviewRole } = useAuth();
  const { isPreview, enterPreview } = useHqMode();
  const navigate = useNavigate();
  const [quoteForInquiryId, setQuoteForInquiryId] = useState<string | null>(null);
  const effectiveRoles = isPreview && !isPreviewRole ? [...roles, "preview" as const] : roles;
  const contentTiles = CONTENT_TILES.filter((t) => {
    const key = t.to.replace("/hq/", "");
    return canSeeHqItem(effectiveRoles, key);
  });
  

  // TEMP HQ-load diagnostics
  useHqMount("Admin");
  // Log key state on every render so we can see what gate is being held.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  hqLog("Admin:render", {
    loading,
    ready: !loading,
    hasUser: !!user,
    isAdmin,
    isPreviewRole,
    isPreviewMode: isPreview,
    canAccess: isAdmin || isPreview,
    
    rolesCount: roles.length,
  });

  // 8s shell fallback — if auth says ready but we're still showing the gate
  // spinner, surface a diagnostic shell instead of an infinite loader.
  const [shellTimedOut, setShellTimedOut] = useState(false);
  useEffect(() => {
    if (!loading) {
      setShellTimedOut(false);
      return;
    }
    const t = setTimeout(() => {
      hqLog("Admin:shell-spinner-timeout", { afterMs: HQ_DEFAULT_TIMEOUT_MS, loading });
      setShellTimedOut(true);
    }, HQ_DEFAULT_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [loading]);

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
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 text-center">
          <RefreshCw className="h-5 w-5 animate-spin text-accent/60" />
          {shellTimedOut && (
            <div className="max-w-md space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/55">
                HQ shell · diagnostic
              </p>
              <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                Auth has not resolved after {Math.round(HQ_DEFAULT_TIMEOUT_MS / 1000)}s.
                Open the console and filter by <code>[hq:</code> and <code>[auth:</code> to see
                where the load is held.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-[10px] uppercase tracking-[0.22em] text-foreground/85 hover:text-accent transition-colors"
              >
                Hard reload →
              </button>
            </div>
          )}
        </div>
      </Layout>
    );
  }
  if (!canAccess) {
    hqLog("Admin:blocked-no-access", { roles, isAdmin, isPreview });
    return null;
  }

  return (
    <Layout>
      <HqPreviewBanner />
      <div className="min-h-screen bg-background">
        {(() => {
          const identity = resolveIdentity(user, { isAdmin, isPreview });
          return (
            <>
              {/* ── Masthead ──────────────────────────────── */}
              {isPreview ? (
                <header className="pt-24 sm:pt-32">
                  <PreviewWelcome identity={identity} />
                </header>
              ) : (
                <header className="pt-28 sm:pt-36 pb-12 sm:pb-16">
                  <BlueprintField intensity="soft">
                    <div className="max-w-5xl mx-auto px-6">
                      <div
                        className="opacity-0 animate-fade-in"
                        style={{ animationDelay: "100ms", animationFillMode: "both" }}
                      >
                        <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/55 mb-4">
                          Peninsula Equine · Command Centre
                        </p>
                        <h1 className="font-serif text-3xl sm:text-4xl font-light text-foreground tracking-tight leading-[1.05]">
                          {identity.role}
                        </h1>
                        {identity.handle && (
                          <p className="mt-2 font-mono text-[11px] tracking-[0.08em] text-muted-foreground/55 lowercase">
                            {identity.handle}
                          </p>
                        )}
                        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/45">
                          {format(new Date(), "EEEE · d MMMM yyyy")}
                        </p>

                        <div className="flex items-center gap-6 mt-8 flex-wrap">
                          {isAdmin && !isPreview && (
                            <button
                              onClick={enterPreview}
                              className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/55 hover:text-accent/80 transition-colors"
                            >
                              Client preview →
                            </button>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/45 hover:text-foreground/80 transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  </BlueprintField>
                </header>
              )}

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
                      ...(!isPreview
                        ? [{ id: "zone-preview", label: "06 · Client Preview" }]
                        : []),
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/45 hover:text-foreground/80 transition-colors whitespace-nowrap"
                      >
                        {item.label}
                      </button>
                    ))}
                    {isPreview && (
                      <button
                        onClick={handleSignOut}
                        className="ml-auto text-[10px] uppercase tracking-[0.22em] text-muted-foreground/45 hover:text-foreground/80 transition-colors whitespace-nowrap"
                      >
                        Sign out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        <HqNav />





        {/* ════════════════════════════════════════════ */}
        {/* 01 — COMMAND CENTRE                         */}
        {/* ════════════════════════════════════════════ */}
        <Zone
          id="zone-overview"
          number="01"
          title="Command Centre"
          subtitle="The site office, not an admin panel — today's brief, the build on the ground, the wire."
        >
          <CommandOverview />
        </Zone>

        {/* ════════════════════════════════════════════ */}
        {/* 02 — PIPELINE                               */}
        {/* ════════════════════════════════════════════ */}
        <Zone
          id="zone-pipeline"
          number="02"
          title="Pipeline"
          subtitle={
            isPreview
              ? "Every enquiry, in sequence — from first contact to resolved build."
              : "Every enquiry, in sequence — from first contact to resolved build. Move a card to advance the stage."
          }
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
          subtitle={
            isPreview
              ? "Apply to Build submissions — read in the same form they arrive."
              : "Apply to Build submissions. Read, qualify and bring the right ones through to a site assessment."
          }
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
          subtitle={
            isPreview
              ? "The public surface — services, works, field notes and supporting material."
              : "The public surface. Each tile opens its own editor."
          }
        >
          {contentTiles.length === 0 ? (
            <p className="text-[12px] text-muted-foreground/55 leading-relaxed px-6 py-8 border border-border/10">
              Your role doesn't include content authoring surfaces. Speak with an admin if you need access.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/10">
              {contentTiles.map((tile) => (
                <button
                  key={tile.label}
                  onClick={() => navigate(`${tile.to}${isPreview ? "?view=preview" : ""}`)}
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
          )}
        </Zone>

        {/* ════════════════════════════════════════════ */}
        {/* 05 — PROJECTS                               */}
        {/* ════════════════════════════════════════════ */}
        <Zone
          id="zone-projects"
          number="05"
          title="Projects"
          subtitle={
            isPreview
              ? "The live build register — scope, sequencing and where each project sits today."
              : "Live build register. Open a row for status, scope, gallery, timeline and client-facing summary."
          }
        >
          <ProjectsBoard />
        </Zone>

        {/* ════════════════════════════════════════════ */}
        {/* 06 — CLIENT PREVIEW (staff-only control panel) */}
        {/* ════════════════════════════════════════════ */}
        {!isPreview && (
          <Zone
            id="zone-preview"
            number="06"
            title="Client Preview"
            subtitle="A view-only mirror of HQ — share with clients, collaborators or project partners without exposing the working backend."
          >
            <div className="space-y-8">
              <div className="border border-accent/20 px-6 py-8 bg-background">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/55 mb-4">
                  Preview shows
                </p>
                <ul className="text-[13px] text-foreground/75 space-y-2 leading-relaxed">
                  <li>· Command Overview metrics and activity feed</li>
                  <li>· Pipeline (read-only)</li>
                  <li>· Applications inbox (no scoring or conversion)</li>
                  <li>· Content surfaces (no edits)</li>
                  <li>· Selected Works and Field Notes (read-only)</li>
                </ul>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/55 mt-8 mb-4">
                  Preview hides
                </p>
                <ul className="text-[13px] text-muted-foreground/60 space-y-2 leading-relaxed">
                  <li>· Internal team notes, commercial details and operational controls</li>
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
        )}


        {/* ════════════════════════════════════════════ */}
        {/* ∞ — CONTROL ROOM (progressive disclosure)   */}
        {/* ════════════════════════════════════════════ */}
        {!isPreview && <ControlRoom isAdmin={isAdmin} />}

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
