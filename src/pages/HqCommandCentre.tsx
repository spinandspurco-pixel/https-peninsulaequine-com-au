import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import { Layout } from "@/components/layout/Layout";
import { HqNav } from "@/components/hq/HqNav";
import { HqLoadingState } from "@/components/hq/HqLoadingState";
import { resolveCommandView, hasWidget } from "@/lib/commandCentre/roleView";
import { MorningBrief } from "@/components/hq/command/MorningBrief";
import { WorkQueue } from "@/components/hq/command/WorkQueue";
import { ActivityFeed } from "@/components/hq/command/ActivityFeed";
import { Watchlist } from "@/components/hq/command/Watchlist";
import { DeployStatusWidget } from "@/components/hq/DeployStatusWidget";
import { trackAuthFunnel } from "@/lib/authFunnel";

/**
 * HQ Command Centre — the page that answers
 *   "If I open HQ at 7:00am, what do I need to know and what should I do next?"
 *
 * Four bands, top to bottom:
 *   1. Morning Brief    (on load)
 *   2. Priority cards   (60s refetch via react-query)
 *   3. Activity         (30s refetch)
 *   4. Watchlist        (60s refetch)
 *
 * Every widget is a doorway to an existing HQ surface. No writes happen on
 * this page.
 */
export default function HqCommandCentre() {
  const { user, loading, roles, isAdmin, isPreview: isPreviewRole } = useAuth();
  const { isPreview } = useHqMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user) {
      trackAuthFunnel("auth_hq_reached", { userId: user.id, roles });
    }
  }, [loading, user, roles]);

  if (loading) {
    return (
      <Layout>
        <HqLoadingState label="Preparing HQ…" />
      </Layout>
    );
  }

  const canAccess = isAdmin || isPreview || roles.length > 0;
  if (!canAccess) return null;

  const effectiveRoles =
    isPreview && !isPreviewRole ? [...roles, "preview" as const] : roles;
  const view = resolveCommandView(effectiveRoles, user?.email ?? null);
  const includeOpsSignals = hasWidget(view, "ops-signals");

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Masthead */}
        <header className="pt-24 sm:pt-28 pb-4 sm:pb-6">
          <div className="max-w-5xl mx-auto px-6">
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/55">
              Peninsula Equine · Command Centre
            </p>
          </div>
        </header>

        <HqNav />

        {/* Band 1 — Morning Brief */}
        <section
          aria-labelledby="brief-heading"
          className="border-t border-border/10"
        >
          <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
            <h2
              id="brief-heading"
              className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55 mb-6"
            >
              Today
            </h2>
            <MorningBrief userId={user?.id ?? null} />
          </div>
        </section>

        {/* Band 2 — Work queue (ranked: what should I do first?) */}
        <section
          aria-labelledby="priority-heading"
          className="border-t border-border/10"
        >
          <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <h2
                  id="priority-heading"
                  className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55"
                >
                  Priorities
                </h2>
                <p className="mt-2 text-[11px] text-muted-foreground/50 italic">
                  What should I do first?
                </p>
              </div>
              <a
                href="/hq/inquiries"
                className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 hover:text-accent transition-colors"
              >
                View all →
              </a>
            </div>
            <WorkQueue includeOpsSignals={includeOpsSignals} />
          </div>
        </section>

        {/* Bands 3 + 4 — side-by-side on desktop, stacked on mobile */}
        <section
          aria-labelledby="signal-heading"
          className="border-t border-border/10"
        >
          <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
            <h2 id="signal-heading" className="sr-only">
              Recent signal
            </h2>
            <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
              <div>
                <div className="flex items-baseline justify-between mb-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55">
                    Activity
                  </p>
                  <a
                    href="/hq/activity"
                    className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 hover:text-accent transition-colors"
                  >
                    View all →
                  </a>
                </div>
                <ActivityFeed includeOpsSignals={includeOpsSignals} />
              </div>
              {hasWidget(view, "watchlist") && (
                <div>
                  <div className="flex items-baseline justify-between mb-6">
                    <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55">
                      Watchlist
                    </p>
                    <a
                      href="/hq/activity"
                      className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 hover:text-accent transition-colors"
                    >
                      View all →
                    </a>
                  </div>
                  <Watchlist includeOpsSignals={includeOpsSignals} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* System health — admin only */}
        {hasWidget(view, "system-health") && (
          <section
            aria-labelledby="health-heading"
            className="border-t border-border/10"
          >
            <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
              <h2
                id="health-heading"
                className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55 mb-6"
              >
                System health
              </h2>
              <div className="mb-8">
                <DeployStatusWidget />
              </div>
              <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 text-[12px] leading-snug">
                <li>
                  <a
                    href="/hq/graph-smoke"
                    className="text-foreground/80 hover:text-accent transition-colors"
                  >
                    Graph Smoke Test →
                  </a>
                  <p className="text-muted-foreground/55 mt-1">
                    Run the C.1b knowledge-graph integrity check on demand.
                  </p>
                </li>
                <li>
                  <a
                    href="/hq/activity"
                    className="text-foreground/80 hover:text-accent transition-colors"
                  >
                    Full activity log →
                  </a>
                  <p className="text-muted-foreground/55 mt-1">
                    Audited record of every action across HQ.
                  </p>
                </li>
                <li>
                  <a
                    href="/hq/dns-verify"
                    className="text-foreground/80 hover:text-accent transition-colors"
                  >
                    DNS verification →
                  </a>
                  <p className="text-muted-foreground/55 mt-1">
                    Google Workspace TXT and domain status.
                  </p>
                </li>
                <li>
                  <a
                    href="/hq/legacy"
                    className="text-foreground/80 hover:text-accent transition-colors"
                  >
                    Legacy HQ overview →
                  </a>
                  <p className="text-muted-foreground/55 mt-1">
                    The previous /hq long-page surface, preserved during the C.1c transition.
                  </p>
                </li>
              </ul>
            </div>
          </section>
        )}

        <div className="h-24" />
      </div>
    </Layout>
  );
}
