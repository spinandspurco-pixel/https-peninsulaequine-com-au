import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { TestimonialLightbox, TestimonialMediaBadge } from "@/components/TestimonialLightbox";
import { testimonials } from "@/data/content";
import blueprintBarn from "@/assets/blueprint-barn.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import ciroWithHorse from "@/assets/ciro-with-horse.png";

// Media assets mapped by testimonial mediaKey
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import qldFacilityCourtyard from "@/assets/qld-facility-courtyard.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";

const testimonialMedia: Record<string, { type: "image" | "video"; src: string }> = {
  sarah: { type: "image", src: aberdeenBarnInterior },
  robert: { type: "video", src: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  elena: { type: "image", src: qldFacilityCourtyard },
  amanda: { type: "image", src: mainRidgeInterior },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(rating)].map((_, i) => (
        <svg key={i} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function HeroCTABlock() {
  const avgRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1);

  return (
    <section className="relative py-12 sm:py-16 bg-primary text-primary-foreground overflow-hidden">
      <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="left-to-right" duration={2400} parallaxSpeed={0.06} />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary pointer-events-none" />
      <div className="section-container relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-accent fill-accent" />
                ))}
              </div>
              <span className="text-2xl font-bold text-accent">{avgRating}</span>
            </div>
            <div className="h-8 w-px bg-primary-foreground/20 hidden sm:block" />
            <p className="text-sm sm:text-base text-primary-foreground/80 text-center sm:text-left max-w-xs">
              Trusted by <span className="font-semibold text-primary-foreground">{testimonials.length}+ clients</span> across the Mornington Peninsula
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 whitespace-nowrap"
          >
            <Link to="/book-lesson">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Book a Lesson
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Testimonials() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Build flat media list from testimonials that have a mediaKey
  const mediaItems = useMemo(() => {
    return testimonials
      .filter((t) => t.mediaKey && testimonialMedia[t.mediaKey])
      .map((t) => {
        const media = testimonialMedia[t.mediaKey!];
        return {
          type: media.type,
          src: media.src,
          caption: `${t.name} — ${t.role}`,
        };
      });
  }, []);

  // Map testimonial id → index in mediaItems
  const mediaIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    let idx = 0;
    testimonials.forEach((t) => {
      if (t.mediaKey && testimonialMedia[t.mediaKey]) {
        map.set(t.id, idx);
        idx++;
      }
    });
    return map;
  }, []);

  const openLightbox = (testimonialId: number) => {
    const idx = mediaIndexMap.get(testimonialId);
    if (idx !== undefined) setLightboxIndex(idx);
  };

  return (
    <Layout>
      <PageHeader
        title="Testimonials"
        description="Don't just take our word for it. Here's what our clients have to say about working with Peninsula Equine."
      />

      <HeroCTABlock />

      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintBarn} opacity={0.03} direction="right-to-left" duration={2000} parallaxSpeed={0.05} />
        <BlueprintBackground image={blueprintFacility} opacity={0.02} direction="left-to-right" duration={3000} parallaxSpeed={0.08} className="scale-105" />
        <BlueprintLineOverlay variant="barn" color="dark" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background pointer-events-none z-[1]" />

        <div className="section-container relative z-[2]">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => {
              const media = testimonial.mediaKey ? testimonialMedia[testimonial.mediaKey] : null;

              return (
                <div
                  key={testimonial.id}
                  className="p-8 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors flex flex-col"
                >
                  <StarRating rating={testimonial.rating} />
                  <blockquote className="mt-6 text-foreground leading-relaxed flex-1">
                    "{testimonial.quote}"
                  </blockquote>

                  {media && (
                    <TestimonialMediaBadge
                      type={media.type}
                      src={media.src}
                      onClick={() => openLightbox(testimonial.id)}
                    />
                  )}

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="font-serif font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <TestimonialLightbox
          items={mediaItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <ParallaxCTA
        title="Join Our Satisfied Clients"
        description="Ready to experience the Peninsula Equine difference? Let's discuss your project."
        backgroundImage={ciroWithHorse}
        primaryButtonText="Get a Quote"
        primaryButtonLink="/contact"
        showPhoneButton={true}
      />
    </Layout>
  );
}
