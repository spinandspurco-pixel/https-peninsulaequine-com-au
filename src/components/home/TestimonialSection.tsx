import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlueprintChapter } from "@/components/BlueprintChapter";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { testimonials } from "@/data/content";

const topQuotes = testimonials.slice(0, 3);

export function TestimonialSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });

  return (
    <BlueprintChapter
      chapter="04"
      chapterTitle="Testimonials"
      scenePreset="barn"
      bg="bg-card"
      specLabels={[{ text: "CLIENT REVIEWS", position: "top-right" }]}
      className="section-padding overflow-hidden"
    >
      <div ref={ref} className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedDivider className="mx-auto mb-8" />
          <SectionTransition variant="blur-in">
            <h2 className="heading-editorial mb-4">What Our Clients Say</h2>
          </SectionTransition>
        </div>

        <div
          className={`grid-cards transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {topQuotes.map((t, i) => (
            <Card
              key={t.id}
              variant="interactive"
              className={`p-7 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <blockquote className="text-foreground leading-relaxed mb-5 font-serif italic text-sm">
                "{t.quote.length > 120 ? t.quote.slice(0, 120) + "…" : t.quote}"
              </blockquote>
              <div className="pt-4 border-t border-border">
                <p className="font-serif font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Dual CTA: social proof → conversion */}
        <SectionTransition variant="fade-up" delay={300} className="text-center mt-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gold"
              size="lg"
              className="text-sm px-10"
              onClick={() => {
                trackCtaClick("testimonials_start_project");
                document.getElementById("free-quote")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Start Your Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/testimonials">
                Read All Reviews <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </SectionTransition>
      </div>
    </BlueprintChapter>
  );
}
