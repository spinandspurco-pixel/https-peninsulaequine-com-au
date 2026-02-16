import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Star, Quote, ChevronLeft, ChevronRight, Play, Volume2, VolumeX, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { fetchMergedTestimonials, type TestimonialItem } from "@/lib/testimonials";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function TestimonialHighlightStrip() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.15 });

  const { data: items = [], isLoading } = useQuery<TestimonialItem[]>({
    queryKey: ["testimonial-highlight-strip"],
    queryFn: fetchMergedTestimonials,
    staleTime: 60_000,
  });

  // Pick top 6 (pinned first)
  const highlights = items.slice(0, 6);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % Math.max(highlights.length, 1));
    setVideoPlaying(false);
  }, [highlights.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + highlights.length) % Math.max(highlights.length, 1));
    setVideoPlaying(false);
  }, [highlights.length]);

  // Auto-rotate every 6s unless watching video
  useEffect(() => {
    if (videoPlaying || highlights.length <= 1) return;
    intervalRef.current = setInterval(next, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoPlaying, next, highlights.length]);

  if (isLoading) {
    return (
      <section className="bg-primary text-primary-foreground py-14 sm:py-16 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center gap-1 mb-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-primary-foreground/10 rounded animate-pulse" />
            ))}
          </div>
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="h-5 bg-primary-foreground/10 rounded w-full animate-pulse" />
            <div className="h-5 bg-primary-foreground/10 rounded w-4/5 mx-auto animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (highlights.length === 0) return null;

  const current = highlights[currentIndex % highlights.length];
  const hasVideo = current.mediaType === "video" && current.mediaUrl;

  const handlePlayVideo = () => {
    setVideoPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <section
      ref={sectionRef}
      className={cn(
        "bg-primary text-primary-foreground py-14 sm:py-16 overflow-hidden transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Label */}
        <p className="text-center text-[10px] uppercase tracking-[0.3em] text-primary-foreground/40 mb-8">
          Client Testimonials
        </p>

        <div className="grid lg:grid-cols-5 gap-8 items-center">
          {/* Quote — spans 3 cols */}
          <div className="lg:col-span-3 text-center lg:text-left">
            <div key={current.id} className="animate-fade-in">
              {/* Stars */}
              <div className="flex justify-center lg:justify-start gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < current.rating ? "text-accent fill-accent" : "text-primary-foreground/20"
                    )}
                  />
                ))}
              </div>

              <Quote className="h-5 w-5 text-accent/30 mb-3 hidden lg:block" />

              <blockquote className="font-serif text-lg sm:text-xl lg:text-2xl leading-relaxed italic text-primary-foreground/90 mb-5">
                "{current.quote.length > 180 ? current.quote.slice(0, 180) + "…" : current.quote}"
              </blockquote>

              <p className="font-serif font-semibold text-primary-foreground text-sm">{current.name}</p>
              {current.role && (
                <p className="text-xs text-primary-foreground/50 mt-0.5">{current.role}</p>
              )}
            </div>

            {/* Nav controls */}
            <div className="flex items-center gap-3 mt-6 justify-center lg:justify-start">
              <button
                onClick={prev}
                className="w-8 h-8 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/50 hover:text-primary-foreground hover:border-accent/40 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Dots */}
              <div className="flex gap-1.5">
                {highlights.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIndex(i); setVideoPlaying(false); }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === currentIndex % highlights.length
                        ? "bg-accent scale-125"
                        : "bg-primary-foreground/20 hover:bg-primary-foreground/40"
                    )}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-8 h-8 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/50 hover:text-primary-foreground hover:border-accent/40 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Video / visual — spans 2 cols */}
          <div className="lg:col-span-2">
            {hasVideo ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-primary-foreground/5 border border-primary-foreground/10">
                {videoPlaying ? (
                  <>
                    <video
                      ref={videoRef}
                      src={current.mediaUrl!}
                      muted={videoMuted}
                      autoPlay
                      playsInline
                      onEnded={() => setVideoPlaying(false)}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setVideoMuted(!videoMuted)}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-primary/60 backdrop-blur-sm flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                      aria-label={videoMuted ? "Unmute" : "Mute"}
                    >
                      {videoMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handlePlayVideo}
                    className="w-full h-full flex flex-col items-center justify-center gap-3 group"
                    aria-label="Play video testimonial"
                  >
                    <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                      <Play className="h-6 w-6 text-accent ml-0.5" />
                    </div>
                    <span className="text-xs text-primary-foreground/50 uppercase tracking-widest">
                      Watch Testimonial
                    </span>
                  </button>
                )}
              </div>
            ) : (
              /* Decorative card when no video */
              <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 sm:p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-7 w-7 text-accent fill-accent" />
                </div>
                <p className="text-3xl font-serif font-bold text-accent mb-1">5.0</p>
                <p className="text-xs text-primary-foreground/50 uppercase tracking-widest mb-4">Average Rating</p>
                <Link
                  to="/testimonials"
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 uppercase tracking-widest transition-colors"
                >
                  Read All Reviews
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}