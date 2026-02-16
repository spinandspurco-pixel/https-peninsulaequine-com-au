import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Play, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { supabase } from "@/integrations/supabase/client";
import { testimonials as staticTestimonials } from "@/data/content";
import ciroWithHorse from "@/assets/ciro-with-horse.png";

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  mediaType?: "image" | "video" | null;
  mediaUrl?: string | null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function VideoEmbed({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);

  // Convert YouTube URLs to embed format
  const getEmbedUrl = (raw: string): string => {
    const ytMatch = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    const vimeoMatch = raw.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    return raw;
  };

  if (!playing) {
    return (
      <button
        onClick={() => setPlaying(true)}
        className="relative w-full aspect-video rounded-lg bg-muted/50 border border-border flex items-center justify-center group hover:border-accent/40 transition-colors overflow-hidden"
        aria-label="Play video testimonial"
      >
        <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
          <Play className="h-6 w-6 text-accent-foreground ml-0.5" />
        </div>
        <span className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-2 py-1">
          Watch video
        </span>
      </button>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-border">
      <iframe
        src={getEmbedUrl(url)}
        title="Video testimonial"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: TestimonialItem; index: number }) {
  const hasVideo = testimonial.mediaType === "video" && testimonial.mediaUrl;
  const hasImage = testimonial.mediaType === "image" && testimonial.mediaUrl;

  return (
    <SectionTransition variant="fade-up" delay={index * 80}>
      <article className="rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col h-full hover:border-accent/30 transition-colors">
        {/* Media */}
        {hasVideo && <div className="mb-6"><VideoEmbed url={testimonial.mediaUrl!} /></div>}
        {hasImage && (
          <div className="mb-6 rounded-lg overflow-hidden aspect-video">
            <img
              src={testimonial.mediaUrl!}
              alt={`Project by ${testimonial.name}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Rating */}
        <StarRating rating={testimonial.rating} />

        {/* Quote */}
        <div className="relative mt-4 flex-1">
          <Quote className="absolute -top-1 -left-1 h-6 w-6 text-accent/15" />
          <blockquote className="text-foreground leading-relaxed pl-4">
            "{testimonial.quote}"
          </blockquote>
        </div>

        {/* Attribution */}
        <div className="mt-6 pt-5 border-t border-border">
          <p className="font-serif font-semibold text-foreground">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-sm text-muted-foreground mt-0.5">{testimonial.role}</p>
          )}
        </div>
      </article>
    </SectionTransition>
  );
}

function StatsBar({ testimonials }: { testimonials: TestimonialItem[] }) {
  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : "5.0";
  const videoCount = testimonials.filter((t) => t.mediaType === "video").length;

  return (
    <section className="py-10 sm:py-12 bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <div className="flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-accent fill-accent" />
              ))}
            </div>
            <span className="text-2xl font-bold text-accent">{avgRating}</span>
            <span className="text-primary-foreground/60 text-sm">avg rating</span>
          </div>
          <div className="h-6 w-px bg-primary-foreground/20 hidden sm:block" />
          <p className="text-sm text-primary-foreground/70">
            <span className="font-semibold text-primary-foreground">{testimonials.length}</span> client reviews
            {videoCount > 0 && (
              <> · <span className="font-semibold text-primary-foreground">{videoCount}</span> video testimonials</>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("managed_testimonials")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        setTestimonials(
          data.map((t) => ({
            id: t.id,
            name: t.client_name,
            role: t.client_role ?? "",
            quote: t.quote,
            rating: t.rating,
            mediaType: (t.media_type as "image" | "video" | null) ?? null,
            mediaUrl: t.media_url ?? null,
          }))
        );
      } else {
        // Fallback to static testimonials
        setTestimonials(
          staticTestimonials.map((t) => ({
            id: String(t.id),
            name: t.name,
            role: t.role,
            quote: t.quote,
            rating: t.rating,
            mediaType: t.mediaType ?? null,
            mediaUrl: null,
          }))
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Layout>
      <PageHeader
        title="Testimonials"
        description="Don't just take our word for it — hear from clients who've trusted Peninsula Equine with their facilities."
      />

      <StatsBar testimonials={testimonials} />

      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <AnimatedDivider className="mx-auto mb-8" />
            <SectionTransition variant="fade-up">
              <h2 className="heading-section text-foreground">Client Stories</h2>
            </SectionTransition>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-8 animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-6" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                    <div className="h-3 bg-muted rounded w-4/6" />
                  </div>
                  <div className="mt-8 pt-5 border-t border-border">
                    <div className="h-4 bg-muted rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <TestimonialCard key={t.id} testimonial={t} index={i} />
              ))}
            </div>
          )}

          {/* CTA below testimonials */}
          <SectionTransition variant="fade-up" delay={300} className="text-center mt-16">
            <p className="text-muted-foreground mb-4">Ready to become our next success story?</p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/contact">
                Get a Free Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </SectionTransition>
        </div>
      </section>

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
