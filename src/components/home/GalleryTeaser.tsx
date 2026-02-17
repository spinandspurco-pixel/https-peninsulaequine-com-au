import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGrid } from "@/components/CardGrid";
import { ContentCard } from "@/components/ContentCard";
import { BlueprintChapter } from "@/components/BlueprintChapter";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";

const images = [
  { src: aberdeenBarnInterior, alt: "Aberdeen Farm — luxury barn interior" },
  { src: mainRidgeInterior, alt: "Main Ridge — open barn with natural light" },
  { src: qldCourtyard, alt: "Queensland Facility — courtyard" },
];

export function GalleryTeaser() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <BlueprintChapter
      chapter="03"
      chapterTitle="Portfolio"
      scenePreset="gallery"
      bg="bg-background"
      specLabels={[{ text: "SCALE 1:100 · PORTFOLIO", position: "top-right" }]}
      className="section-padding overflow-hidden"
    >
      <div ref={ref} className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedDivider className="mx-auto mb-8" />
          <SectionTransition variant="fade-up">
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">Portfolio</p>
          </SectionTransition>
          <SectionTransition variant="blur-in" delay={100}>
            <h2 className="heading-editorial mb-4">Craftsmanship in Every Detail</h2>
          </SectionTransition>
        </div>

        <CardGrid columns="3" gap="sm" className="mb-10">
          {images.map((img, i) => (
            <ContentCard
              key={i}
              image={img.src}
              imageAlt={img.alt}
              aspect="portrait"
              title={img.alt.split("—")[0].trim()}
              description={img.alt.split("—")[1]?.trim()}
              href="/gallery"
              ctaLabel="View Gallery"
              variant="elevated"
              className={`transition-all duration-700 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            />
          ))}
        </CardGrid>

        <SectionTransition variant="fade-up" delay={300} className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/gallery">
              View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </SectionTransition>
      </div>
    </BlueprintChapter>
  );
}
