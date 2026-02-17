import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlueprintChapter } from "@/components/BlueprintChapter";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { fetchMergedTestimonials, TRAINER_PROFILES, type TestimonialItem } from "@/lib/testimonials";
import { testimonials as staticTestimonials } from "@/data/content";

const AUTO_ROTATE_MS = 5000;

export function TestimonialSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Fetch featured testimonials (pinned first, then highest rated)
  useEffect(() => {
    fetchMergedTestimonials().then((all) => {
      const pinned = all.filter((t) => t.pinned);
      const rest = all.filter((t) => !t.pinned).sort((a, b) => b.rating - a.rating);
      const featured = pinned.length >= 5 ? pinned.slice(0, 6) : [...pinned, ...rest].slice(0, 6);
      setItems(featured.length > 0 ? featured : all.slice(0, 6));
    });
  }, []);

  // Fallback to static if nothing loaded
  const displayItems = useMemo(() => {
    if (items.length > 0) return items;
    return staticTestimonials.slice(0, 3).map((t) => ({
      id: `static-${t.id}`,
      name: t.name,
      role: t.role,
      quote: t.quote,
      rating: t.rating,
      serviceTags: [],
      trainer: null,
      mediaType: null,
      mediaUrl: null,
    })) as TestimonialItem[];
  }, [items]);

  const count = displayItems.length;

  const next = useCallback(() => setActive((p) => (p + 1) % count), [count]);
  const prev = useCallback(() => setActive((p) => (p - 1 + count) % count), [count]);

  // Auto-rotate
  useEffect(() => {
    if (paused || !isVisible || count <= 1) return;
    const timer = setInterval(next, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, isVisible, count, next]);

  const current = displayItems[active];
  if (!current) return null;

  const trainerProfile = current.trainer ? TRAINER_PROFILES[current.trainer] : undefined;

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

        {/* Featured carousel */}
        <div
          className={`max-w-2xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Card variant="interactive" className="p-8 sm:p-10 relative">
            {/* Nav arrows */}
            {count > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Content with crossfade */}
            <div key={current.id} className="animate-fade-in text-center">
              {/* Stars */}
              <div className="flex justify-center gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className={`w-5 h-5 ${j < current.rating ? "text-accent fill-accent" : "text-muted-foreground/20"}`}
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground leading-relaxed font-serif italic text-base sm:text-lg mb-6 px-6">
                "{current.quote.length > 200 ? current.quote.slice(0, 200) + "…" : current.quote}"
              </blockquote>

              {/* Attribution with trainer portrait */}
              <div className="flex items-center justify-center gap-3 pt-5 border-t border-border">
                {trainerProfile && (
                  <img
                    src={trainerProfile.portrait}
                    alt={current.trainer!}
                    className="w-10 h-10 rounded-full object-cover border-2 border-accent/30"
                  />
                )}
                <div className={trainerProfile ? "text-left" : "text-center"}>
                  <p className="font-serif font-semibold text-foreground">{current.name}</p>
                  {current.role && (
                    <p className="text-xs text-muted-foreground mt-0.5">{current.role}</p>
                  )}
                  {current.trainer && (
                    <p className="text-[11px] text-accent mt-0.5">
                      Trainer: {current.trainer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Dot indicators */}
          {count > 1 && (
            <div className="flex justify-center gap-2 mt-5">
              {displayItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === active
                      ? "bg-accent w-6"
                      : "bg-muted-foreground/25 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Dual CTA */}
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
