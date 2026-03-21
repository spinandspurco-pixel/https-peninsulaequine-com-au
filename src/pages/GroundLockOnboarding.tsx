import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Layers } from "lucide-react";
import { OnboardingStepIndicator } from "@/components/groundlock/OnboardingStepIndicator";
import { SetupStep } from "@/components/groundlock/SetupStep";
import { ReviewStep } from "@/components/groundlock/ReviewStep";
import { SummaryStep } from "@/components/groundlock/SummaryStep";
import { CompletionStep } from "@/components/groundlock/CompletionStep";

export type ProjectSetup = {
  id: string;
  workflow_step: string;
  project_location: string;
  ground_conditions: string;
  primary_use: string;
  traffic_level: string;
  estimated_area: string | null;
  notes: string | null;
  attachment_urls: string[] | null;
  status: string;
  review_notes: string | null;
  system_zones: string[] | null;
  system_summary: string | null;
  key_notes: string | null;
  completion_photo_urls: string[] | null;
  completed_at: string | null;
  created_at: string;
};

const STEPS = ["setup", "review", "summary", "completion"] as const;
const STEP_LABELS = ["Project Setup", "Internal Review", "System Summary", "Completion"];

export default function GroundLockOnboarding() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectSetup | null>(null);

  async function fetchProject() {
    if (!user) return;
    const { data } = await supabase
      .from("groundlock_project_setups")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setProject(data as ProjectSetup | null);
    setLoading(false);
  }

  useEffect(() => {
    fetchProject();
  }, [user]);

  const currentStepIndex = project
    ? STEPS.indexOf(project.workflow_step as typeof STEPS[number])
    : 0;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent/50" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="relative pt-44 sm:pt-52 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 engineering-grid" />
        <div className="absolute inset-0 grain-texture" />

        <div className="section-container relative z-10 text-center max-w-xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-5 opacity-0 animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "1200ms" }}>
            <div className="w-8 h-px bg-accent/30" />
            <Layers className="w-3.5 h-3.5 text-accent/50" strokeWidth={1.25} />
            <p className="text-overline text-accent/60">Partner Onboarding</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1 className="heading-display text-foreground opacity-0 animate-fade-in" style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1400ms" }}>
            GroundLock Onboarding
          </h1>

          <p className="text-sm text-muted-foreground/40 max-w-md mx-auto opacity-0 animate-fade-in leading-[1.9]" style={{ animationDelay: "1000ms", animationFillMode: "both", animationDuration: "1000ms" }}>
            A structured workflow from project setup through to completion.
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-8 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-2xl mx-auto relative z-[1]">
            <OnboardingStepIndicator
              steps={STEP_LABELS}
              currentStep={currentStepIndex >= 0 ? currentStepIndex : 0}
            />
          </div>
        </div>
      </section>

      {/* Active Step Content */}
      <section className="relative overflow-hidden">
        <div className="py-20 sm:py-28 bg-background relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto relative z-[1]">
            {(!project || project.workflow_step === "setup") && (
              <SetupStep project={project} onComplete={fetchProject} />
            )}
            {project?.workflow_step === "review" && (
              <ReviewStep project={project} />
            )}
            {project?.workflow_step === "summary" && (
              <SummaryStep project={project} />
            )}
            {project?.workflow_step === "completion" && (
              <CompletionStep project={project} onComplete={fetchProject} />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
