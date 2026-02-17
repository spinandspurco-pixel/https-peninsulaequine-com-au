import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlueprintScene } from "@/components/BlueprintScene";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { useABTest } from "@/hooks/useABTest";
import { useState, useRef, useCallback, useEffect } from "react";

import heroVideoA from "@/assets/videos/pavilion-grill-1.mp4";
import heroVideoB from "@/assets/videos/pavilion-grill-2.mp4";
import peLogo from "@/assets/pe-logo-new.png";

// ── Trim ranges: only play these segments (seconds) ─────────
// Adjust start/end to skip walking/shaky parts and keep smooth footage
const VIDEO_CLIPS = [
  { src: heroVideoA, start: 3, end: 18 },   // Video A: skip first 3s walk-in, end before shaky outro
  { src: heroVideoB, start: 2, end: 16 },   // Video B: skip opening walk, cut before camera pan
];

// ── A/B test copy variants ──────────────────────────────────

const HERO_COPY: Record<string, { headline: string; sub: string; cta: string }> = {
  control: {
    headline: "From Dirt to Dynasty",
    sub: "World-class arenas, barns & facilities — designed by a horseman, built to last.",
    cta: "Get a Free Quote",
  },
  urgency: {
    headline: "Your Dream Facility Starts Here",
    sub: "Limited build slots available — secure your project timeline today.",
    cta: "Claim Your Free Quote",
  },
  social_proof: {
    headline: "Trusted by 200+ Horse Owners",
    sub: "Australia's leading equine facility builder — see why owners choose Peninsula Equine.",
    cta: "Start Your Free Quote",
  },
};

export function HeroSection() {
  const { variant, trackStep } = useABTest({
    testName: "hero_cta_2026",
    variants: ["control", "urgency", "social_proof"],
  });

  const copy = HERO_COPY[variant] || HERO_COPY.control;

  // ── Dual-video crossfade with trim ranges ─────────────────
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  const getRef = useCallback((idx: number) => idx === 0 ? videoARef : videoBRef, []);

  // Start a clip at its trim start point
  const startClip = useCallback((idx: number) => {
    const video = getRef(idx).current;
    const clip = VIDEO_CLIPS[idx];
    if (video && clip) {
      video.currentTime = clip.start;
      video.play().catch(() => {});
    }
  }, [getRef]);

  // When current clip reaches its trim end → crossfade to next
  const handleTimeUpdate = useCallback((idx: number) => {
    const video = getRef(idx).current;
    const clip = VIDEO_CLIPS[idx];
    if (!video || !clip || idx !== activeIdx || fading) return;
    if (video.currentTime >= clip.end) {
      video.pause();
      setFading(true);
      const nextIdx = (idx + 1) % VIDEO_CLIPS.length;
      startClip(nextIdx);
      setTimeout(() => {
        setActiveIdx(nextIdx);
        setFading(false);
      }, 1200);
    }
  }, [activeIdx, fading, getRef, startClip]);

  // Initial play
  useEffect(() => {
    startClip(0);
  }, [startClip]);

  const handleQuoteClick = () => {
    trackCtaClick("hero_get_quote", { variant });
    trackStep("click", { cta: copy.cta });
    document.getElementById("free-quote")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleViewWorkClick = () => {
    trackStep("engage", { action: "view_work" });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-primary pb-20 sm:pb-24">
      {/* Video A — trimmed + zoomed + smoothed */}
      <video
        ref={videoARef}
        muted playsInline preload="auto"
        onTimeUpdate={() => handleTimeUpdate(0)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out will-change-transform"
        style={{
          opacity: activeIdx === 0 ? 1 : fading && activeIdx === 1 ? 0 : 0,
          transform: "scale(1.12)",
          transformOrigin: "center center",
          filter: "contrast(1.04) saturate(1.05)",
        }}
        aria-hidden="true"
      >
        <source src={VIDEO_CLIPS[0].src} type="video/mp4" />
      </video>
      {/* Video B — trimmed + zoomed + smoothed */}
      <video
        ref={videoBRef}
        muted playsInline preload="auto"
        onTimeUpdate={() => handleTimeUpdate(1)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out will-change-transform"
        style={{
          opacity: activeIdx === 1 ? 1 : fading && activeIdx === 0 ? 0 : 0,
          transform: "scale(1.12)",
          transformOrigin: "center center",
          filter: "contrast(1.04) saturate(1.05)",
        }}
        aria-hidden="true"
      >
        <source src={VIDEO_CLIPS[1].src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-primary/70" />
      <BlueprintScene preset="hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--primary))_85%)]" />

      <div className="relative z-10 text-center px-4 sm:px-6">
        <img
          src={peLogo}
          alt="Peninsula Equine"
          loading="eager"
          className="w-20 h-20 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 drop-shadow-[0_4px_30px_hsl(var(--accent)/0.3)]"
        />
        <div className="w-16 h-px mx-auto mb-5 sm:mb-8 bg-accent" />
        <h1 className="font-sans tracking-[0.25em] uppercase text-primary-foreground leading-[1.3] mb-4"
            style={{ fontSize: 'clamp(1.5rem, 1rem + 1.6vw, 2.25rem)' }}
        >
          Peninsula <span className="text-accent">Equine</span>
        </h1>
        <p className="font-sans tracking-[0.4em] uppercase text-primary-foreground/50 mb-3"
           style={{ fontSize: 'clamp(0.7rem, 0.6rem + 0.3vw, 0.875rem)' }}
        >
          {copy.headline}
        </p>
        <p className="text-primary-foreground/70 max-w-lg mx-auto mb-6 sm:mb-8 leading-relaxed"
           style={{ fontSize: 'clamp(0.875rem, 0.8rem + 0.2vw, 1rem)' }}
        >
          {copy.sub}
        </p>

        {/* Primary CTA cluster */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Button
            size="lg"
            variant="gold"
            className="text-sm px-10"
            onClick={handleQuoteClick}
          >
            {copy.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            asChild
            variant="outline-light"
            size="lg"
            className="text-sm px-10"
          >
            <Link to="/services" onClick={handleViewWorkClick}>View Our Work</Link>
          </Button>
        </div>

        {/* Secondary micro-CTA */}
        <a
          href="tel:0412345678"
          onClick={() => {
            trackCtaClick("hero_call_now", { variant });
            trackStep("click", { cta: "call_now" });
          }}
          className="inline-flex items-center gap-2 text-primary-foreground/50 hover:text-accent text-xs tracking-widest uppercase transition-colors mb-6 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <Phone className="h-3.5 w-3.5" />
          Or Call Us Now
        </a>
      </div>

      <button
        onClick={() => document.getElementById("about-teaser")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-6 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        aria-label="Scroll to content"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-sans">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </button>
    </section>
  );
}
