import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlueprintChapter } from "@/components/BlueprintChapter";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { services } from "@/data/content";

const featuredServices = services.slice(0, 4);

export function ServicesHighlights() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <BlueprintChapter
      chapter="02"
      chapterTitle="What We Build"
      scenePreset="services"
      bg="bg-primary"
      textColor="text-primary-foreground"
      specLabels={[{ text: "DWG-SV01 · SERVICES", position: "bottom-right" }]}
      className="section-padding overflow-hidden"
    >
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedDivider className="mx-auto mb-8 bg-accent" />
          <SectionTransition variant="fade-up">
            <p className="text-primary-foreground/50 uppercase tracking-[0.2em] text-sm mb-4">What We Build</p>
          </SectionTransition>
          <SectionTransition variant="blur-in" delay={100}>
            <h2 className="heading-editorial mb-4">Built for Horses, Designed by a Horseman</h2>
          </SectionTransition>
        </div>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-primary-foreground/10">
          {featuredServices.map((service, i) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              className={`group p-8 bg-primary hover:bg-primary-foreground/[0.06] transition-all duration-700 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="font-serif text-xl text-primary-foreground mb-2 group-hover:text-accent transition-colors">
                {service.title}
              </h3>
              <p className="text-primary-foreground/55 text-sm leading-relaxed mb-3 line-clamp-2">
                {service.shortDescription}
              </p>
              <span className="inline-flex items-center text-sm text-primary-foreground/70 group-hover:text-accent transition-colors">
                Details <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        {/* Dual CTA row */}
        <SectionTransition variant="fade-up" delay={300} className="text-center mt-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gold"
              size="lg"
              className="text-sm px-10"
              onClick={() => {
                trackCtaClick("services_get_quote");
                document.getElementById("free-quote")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Request a Free Estimate
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              asChild
              variant="outline-light"
              size="lg"
              className="text-sm px-10"
            >
              <Link to="/services">
                View All Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </SectionTransition>
      </div>
    </BlueprintChapter>
  );
}
