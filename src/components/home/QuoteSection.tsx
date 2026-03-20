import { BlueprintChapter } from "@/components/BlueprintChapter";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { MultiStepInquiryForm } from "@/components/MultiStepInquiryForm";

export function QuoteSection() {
  return (
    <BlueprintChapter
      chapter="05"
      chapterTitle="Start a Project"
      scenePreset="intro"
      bg="bg-background"
      specLabels={[{ text: "NO OBLIGATION · FREE ESTIMATE", position: "top-left" }]}
      className="section-padding"
    >
      <div id="free-quote" className="section-container">
        <div className="max-w-2xl mx-auto">
          <SectionTransition variant="fade-up">
            <div className="text-center mb-10">
              <AnimatedDivider className="mx-auto mb-8" />
              <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">No Obligation</p>
              <h2 className="heading-section text-foreground">Request a Free Assessment</h2>
              <p className="text-muted-foreground mt-3 text-base">
                Tell us about your project and we'll prepare a custom estimate — no strings attached.
              </p>
            </div>
          </SectionTransition>
          <SectionTransition variant="fade-up" delay={150}>
            <MultiStepInquiryForm />
          </SectionTransition>
        </div>
      </div>
    </BlueprintChapter>
  );
}
