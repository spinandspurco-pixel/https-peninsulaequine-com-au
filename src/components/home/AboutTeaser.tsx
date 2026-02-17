import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlueprintChapter } from "@/components/BlueprintChapter";
import { SectionTransition } from "@/components/SectionTransition";

export function AboutTeaser() {
  return (
    <BlueprintChapter
      chapter="01"
      chapterTitle="The Horseman"
      scenePreset="intro"
      bg="bg-background"
      specLabels={[{ text: "EST. MORNINGTON PENINSULA", position: "bottom-left" }]}
      className="section-padding"
    >
      <div id="about-teaser" className="section-container">
        <div className="max-w-3xl mx-auto text-center">
          <SectionTransition variant="fade-up" duration={600}>
            <p className="text-muted-foreground uppercase tracking-[0.25em] text-sm mb-6">
              Mornington Peninsula, Victoria
            </p>
          </SectionTransition>
          <SectionTransition variant="blur-in" delay={100} duration={800}>
            <h2 className="heading-section text-foreground mb-6">
              Where world-class equine facilities are built by the hands of a horseman
            </h2>
          </SectionTransition>
          <SectionTransition variant="fade-up" delay={200} duration={700}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Decades of experience in both riding and building. Ciro brings a horseman's
              intuition to every arena, barn, and bespoke project.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">
                Meet Ciro &amp; Our Story
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </SectionTransition>
        </div>
      </div>
    </BlueprintChapter>
  );
}
