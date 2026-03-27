import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { LogOut, MapPin, Layers, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface PortalProject {
  id: string;
  project_name: string;
  client_name: string;
  build_stage: string;
  stage_label: string | null;
  property_layout_notes: string | null;
  groundlock_included: boolean;
  system_notes: string | null;
  contact_note: string | null;
}

interface PortalUpdate {
  id: string;
  image_url: string | null;
  note: string | null;
  update_type: string;
  created_at: string;
}

interface PortalZone {
  id: string;
  zone_name: string;
  zone_type: string;
  description: string | null;
  sort_order: number;
}

const STAGES = ["planning", "in_progress", "completion"] as const;
const STAGE_LABELS: Record<string, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  completion: "Completion",
};

/* ── Timeline ── */
function BuildTimeline({ stage, label }: { stage: string; label?: string | null }) {
  const activeIdx = STAGES.indexOf(stage as any);
  return (
    <div className="flex items-center gap-0 w-full max-w-sm">
      {STAGES.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-700",
                i <= activeIdx ? "bg-accent/50" : "bg-primary-foreground/10"
              )}
            />
            <p className={cn(
              "text-[9px] font-mono uppercase tracking-[0.2em] mt-2 transition-colors duration-500",
              i === activeIdx ? "text-accent/60" : "text-primary-foreground/20"
            )}>
              {label && i === activeIdx ? label : STAGE_LABELS[s]}
            </p>
          </div>
          {i < STAGES.length - 1 && (
            <div className={cn(
              "h-px flex-1 mx-1 transition-colors duration-700",
              i < activeIdx ? "bg-accent/25" : "bg-primary-foreground/6"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main Portal ── */
export default function ClientPortal() {
  const { user, loading, signOut } = useAuth();
  const [project, setProject] = useState<PortalProject | null>(null);
  const [updates, setUpdates] = useState<PortalUpdate[]>([]);
  const [zones, setZones] = useState<PortalZone[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Fetch project
      const { data: projects } = await supabase
        .from("client_portal_projects")
        .select("*")
        .eq("active", true)
        .limit(1);

      if (projects && projects.length > 0) {
        const p = projects[0] as unknown as PortalProject;
        setProject(p);

        // Fetch updates & zones in parallel
        const [uRes, zRes] = await Promise.all([
          supabase
            .from("client_portal_updates")
            .select("*")
            .eq("project_id", p.id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("client_portal_zones")
            .select("*")
            .eq("project_id", p.id)
            .order("sort_order", { ascending: true }),
        ]);
        setUpdates((uRes.data || []) as unknown as PortalUpdate[]);
        setZones((zRes.data || []) as unknown as PortalZone[]);
      }
      setFetching(false);
    })();
  }, [user]);

  /* Loading state */
  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse" />
      </div>
    );
  }

  /* Not logged in — redirect handled by ProtectedRoute, but fallback */
  if (!user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-6">
        <p className="text-primary-foreground/30 text-sm font-mono">Access required.</p>
      </div>
    );
  }

  /* No project assigned */
  if (!project) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <BlueprintLineOverlay variant="dimensions" color="light" />
        </div>
        <div className="text-center relative z-10 space-y-4">
          <p className="font-serif text-lg text-primary-foreground/50">
            Your project is being prepared.
          </p>
          <p className="text-[11px] text-primary-foreground/20 font-mono tracking-[0.2em]">
            We'll notify you when your portal is ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-primary-foreground relative overflow-hidden">
      {/* Blueprint overlay */}
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none z-0">
        <BlueprintLineOverlay variant="dimensions" color="light" />
      </div>
      <div className="fixed inset-0 grain-texture opacity-[0.015] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary-foreground/[0.04] bg-primary/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-accent/40">
              Client Portal
            </p>
            <p className="font-serif text-sm text-primary-foreground/70 mt-0.5">
              {project.project_name}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="text-primary-foreground/15 hover:text-primary-foreground/40 transition-colors duration-300"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* ═══ 1. PROJECT DASHBOARD ═══ */}
        <section className="py-16 sm:py-24">
          <RevealOnScroll direction="up">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-6 h-px bg-accent/20" />
              <p className="text-overline text-accent/35">Project Status</p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <h1 className="font-serif text-2xl sm:text-3xl text-primary-foreground/85 tracking-tight leading-[1.1] mb-10">
              {project.project_name}
            </h1>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <BuildTimeline stage={project.build_stage} label={project.stage_label} />
          </RevealOnScroll>
        </section>

        <div className="w-full h-px bg-primary-foreground/[0.04]" />

        {/* ═══ 2. LAND OVERVIEW ═══ */}
        {zones.length > 0 && (
          <section className="py-16 sm:py-24">
            <RevealOnScroll direction="up">
              <div className="flex items-center gap-4 mb-10">
                <MapPin className="w-3.5 h-3.5 text-accent/30" />
                <p className="text-overline text-accent/35">Land Overview</p>
              </div>
            </RevealOnScroll>

            {project.property_layout_notes && (
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-[13px] text-primary-foreground/35 leading-[1.8] mb-10 max-w-md">
                  {project.property_layout_notes}
                </p>
              </RevealOnScroll>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((zone, i) => (
                <RevealOnScroll key={zone.id} direction="up" delay={100 + i * 60}>
                  <div className="bg-primary-foreground/[0.03] border border-primary-foreground/[0.04] p-6 rounded-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                      <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary-foreground/45">
                        {zone.zone_name}
                      </p>
                    </div>
                    {zone.description && (
                      <p className="text-[12px] text-primary-foreground/25 leading-[1.7]">
                        {zone.description}
                      </p>
                    )}
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </section>
        )}

        {zones.length > 0 && <div className="w-full h-px bg-primary-foreground/[0.04]" />}

        {/* ═══ 3. PROGRESS UPDATES ═══ */}
        {updates.length > 0 && (
          <section className="py-16 sm:py-24">
            <RevealOnScroll direction="up">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-6 h-px bg-accent/20" />
                <p className="text-overline text-accent/35">Progress</p>
              </div>
            </RevealOnScroll>

            <div className="space-y-8">
              {updates.map((update, i) => (
                <RevealOnScroll key={update.id} direction="up" delay={i * 60}>
                  <div className="flex gap-6 items-start">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                      {i < updates.length - 1 && (
                        <div className="w-px flex-1 bg-primary-foreground/[0.04] mt-2 min-h-[40px]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono text-primary-foreground/20 mb-2">
                        {new Date(update.created_at).toLocaleDateString("en-AU", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                      {update.image_url && (
                        <img
                          src={update.image_url}
                          alt="Progress update"
                          className="w-full max-w-md rounded-sm mb-3"
                          loading="lazy"
                        />
                      )}
                      {update.note && (
                        <p className="text-[13px] text-primary-foreground/40 leading-[1.7]">
                          {update.note}
                        </p>
                      )}
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </section>
        )}

        {updates.length > 0 && <div className="w-full h-px bg-primary-foreground/[0.04]" />}

        {/* ═══ 4. SYSTEM DETAILS ═══ */}
        {(project.groundlock_included || project.system_notes) && (
          <section className="py-16 sm:py-24">
            <RevealOnScroll direction="up">
              <div className="flex items-center gap-4 mb-10">
                <Layers className="w-3.5 h-3.5 text-accent/30" />
                <p className="text-overline text-accent/35">System Details</p>
              </div>
            </RevealOnScroll>

            {project.groundlock_included && (
              <RevealOnScroll direction="up" delay={80}>
                <div className="bg-primary-foreground/[0.03] border border-accent/8 p-7 rounded-sm mb-6 max-w-md">
                  <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-accent/40 mb-3">
                    GroundLock™ System
                  </p>
                  <p className="text-[12px] text-primary-foreground/35 leading-[1.7]">
                    Integrated into your project for long-term ground stabilisation.
                  </p>
                </div>
              </RevealOnScroll>
            )}

            {project.system_notes && (
              <RevealOnScroll direction="up" delay={160}>
                <p className="text-[13px] text-primary-foreground/30 leading-[1.8] max-w-md">
                  {project.system_notes}
                </p>
              </RevealOnScroll>
            )}
          </section>
        )}

        {(project.groundlock_included || project.system_notes) && (
          <div className="w-full h-px bg-primary-foreground/[0.04]" />
        )}

        {/* ═══ 5. DIRECT CONTACT ═══ */}
        <section className="py-16 sm:py-24">
          <RevealOnScroll direction="up">
            <div className="flex items-center gap-4 mb-10">
              <MessageSquare className="w-3.5 h-3.5 text-accent/30" />
              <p className="text-overline text-accent/35">Contact</p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={80}>
            <div className="max-w-md space-y-6">
              {project.contact_note ? (
                <p className="text-[13px] text-primary-foreground/40 leading-[1.8]">
                  {project.contact_note}
                </p>
              ) : (
                <p className="text-[13px] text-primary-foreground/40 leading-[1.8]">
                  For project enquiries, contact your project lead directly.
                </p>
              )}
              <a
                href="mailto:projects@peninsulaequine.com.au"
                className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-accent/40 hover:text-accent/60 transition-colors duration-300 border-b border-accent/10 pb-0.5"
              >
                projects@peninsulaequine.com.au
              </a>
            </div>
          </RevealOnScroll>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-primary-foreground/[0.04]">
          <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-primary-foreground/10">
            Peninsula Equine — Private Client Portal
          </p>
        </footer>
      </div>
    </div>
  );
}
