import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Phone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlueprintScene } from "@/components/BlueprintScene";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { useABTest } from "@/hooks/useABTest";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { HeroClipEditor, loadClips, loadQuality, saveQuality, DEFAULT_CLIPS, QUALITY_PROFILES, type VideoQuality } from "./HeroClipEditor";
import { useHeroMediaLoader } from "@/hooks/useHeroMediaLoader";

import heroVideoA from "@/assets/videos/pavilion-grill-1.mp4";
import heroVideoB from "@/assets/videos/pavilion-grill-2.mp4";
import peLogo from "@/assets/pe-logo-new.png";

const VIDEO_SRCS = [heroVideoA, heroVideoB];

// ── Loading shimmer overlay ─────────────────────────────────
function HeroLoadingOverlay({ stage, videosReady }: { stage: string; videosReady: boolean[] }) {
  if (stage === "ready") return null;

  const readyCount = videosReady.filter(Boolean).length;
  const total = videosReady.length;
  const pct = total > 0 ? Math.round((readyCount / total) * 100) : 0;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-primary transition-opacity duration-700"
      style={{ opacity: stage === "ready" ? 0 : 1 }}
    >
      {/* Shimmer background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, hsl(var(--accent) / 0.04) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Progress indicator */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <img
          src={peLogo}
          alt=""
          className="w-16 h-16 opacity-40 animate-pulse"
          aria-hidden="true"
        />
        <div className="w-32 h-1 bg-primary-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent/50 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] text-primary-foreground/30 tracking-[0.3em] uppercase font-sans">
          {stage === "idle" ? "Preparing" : `Loading media${readyCount > 0 ? ` ${readyCount}/${total}` : ""}`}
        </span>
      </div>
    </div>
  );
}

// ── Admin performance badge ─────────────────────────────────
function PerfBadge({ loadTimeMs, budgetStatus }: { loadTimeMs: number | null; budgetStatus: string }) {
  if (loadTimeMs === null) return null;

  const colors = {
    good: "bg-green-500/20 text-green-400 border-green-500/30",
    fair: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    over: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div
      className={`absolute top-4 right-4 z-50 px-2.5 py-1 rounded-md border text-[10px] font-mono tracking-wider backdrop-blur-sm ${colors[budgetStatus as keyof typeof colors] || colors.good}`}
    >
      {(loadTimeMs / 1000).toFixed(1)}s
      <span className="ml-1 opacity-70">
        {budgetStatus === "good" ? "✓" : budgetStatus === "fair" ? "⚠" : "✗"}
      </span>
    </div>
  );
}

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
  const { isAdmin } = useAuth();

  const copy = HERO_COPY[variant] || HERO_COPY.control;

  // ── Clip state (persisted to localStorage) ────────────────
  const [clips, setClips] = useState(loadClips);
  const [quality, setQuality] = useState<VideoQuality>(loadQuality);
  const [showEditor, setShowEditor] = useState(false);

  const qProfile = QUALITY_PROFILES[quality];

  // ── Dual-video crossfade with trim ranges ─────────────────
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const videoRefs = useMemo(() => [videoARef, videoBRef], []);

  const getRef = useCallback((idx: number) => idx === 0 ? videoARef : videoBRef, []);

  const startClip = useCallback((idx: number) => {
    const video = getRef(idx).current;
    const clip = clips[idx];
    if (video && clip) {
      video.currentTime = clip.start;
      video.playbackRate = qProfile.playbackRate;
      video.play().catch(() => {});
    }
  }, [getRef, clips, qProfile.playbackRate]);

  const handleTimeUpdate = useCallback((idx: number) => {
    const video = getRef(idx).current;
    const clip = clips[idx];
    if (!video || !clip || idx !== activeIdx || fading) return;
    if (video.currentTime >= clip.end) {
      video.pause();
      setFading(true);
      const nextIdx = (idx + 1) % clips.length;
      startClip(nextIdx);
      setTimeout(() => {
        setActiveIdx(nextIdx);
        setFading(false);
      }, 1200);
    }
  }, [activeIdx, fading, getRef, startClip, clips]);

  // ── Progressive media loader ──────────────────────────────
  const onAllReady = useCallback(() => {
    startClip(0);
  }, [startClip]);

  const { stage, videosReady, loadTimeMs, budgetStatus } = useHeroMediaLoader(
    videoRefs,
    VIDEO_SRCS,
    onAllReady,
  );

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
      {/* Progressive loading overlay */}
      <HeroLoadingOverlay stage={stage} videosReady={videosReady} />

      {/* Admin performance badge */}
      {isAdmin && stage === "ready" && (
        <PerfBadge loadTimeMs={loadTimeMs} budgetStatus={budgetStatus} />
      )}

      {/* Admin clip editor */}
      {isAdmin && showEditor && (
        <HeroClipEditor
          clips={clips}
          activeIdx={activeIdx}
          videoRefs={videoRefs}
          videoSrcs={VIDEO_SRCS}
          quality={quality}
          onChange={(c) => { setClips(c); }}
          onQualityChange={(q) => { setQuality(q); saveQuality(q); }}
          onReset={() => setClips(DEFAULT_CLIPS)}
          onClose={() => setShowEditor(false)}
        />
      )}
      {isAdmin && !showEditor && (
        <button
          onClick={() => setShowEditor(true)}
          className="absolute top-4 left-4 z-50 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/90 transition-colors"
          aria-label="Edit video clip ranges"
        >
          <Settings className="h-4 w-4" />
        </button>
      )}
      {/* Accessible description for background videos */}
      <div className="sr-only" role="img" aria-label="Background video showing Peninsula Equine's handcrafted pavilion and outdoor grill area at golden hour, played in slow motion">
        Cinematic slow-motion footage of Peninsula Equine facilities — a timber pavilion with stone detailing surrounded by paddocks at sunset.
      </div>

      {/* Video A — trimmed + zoomed + smoothed */}
      <video
        ref={videoARef}
        muted playsInline preload="metadata"
        onTimeUpdate={() => handleTimeUpdate(0)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out will-change-transform"
        style={{
          opacity: activeIdx === 0 ? 1 : fading && activeIdx === 1 ? 0 : 0,
          transform: `scale(${qProfile.scale})`,
          transformOrigin: "center center",
          filter: qProfile.filter,
        }}
        aria-hidden="true"
        aria-label="Pavilion exterior slow-motion footage"
      >
        <source src={VIDEO_SRCS[0]} type="video/mp4" />
      </video>
      {/* Video B — trimmed + zoomed + smoothed */}
      <video
        ref={videoBRef}
        muted playsInline preload="metadata"
        onTimeUpdate={() => handleTimeUpdate(1)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out will-change-transform"
        style={{
          opacity: activeIdx === 1 ? 1 : fading && activeIdx === 0 ? 0 : 0,
          transform: `scale(${qProfile.scale})`,
          transformOrigin: "center center",
          filter: qProfile.filter,
        }}
        aria-hidden="true"
        aria-label="Grill and pavilion detail slow-motion footage"
      >
        <source src={VIDEO_SRCS[1]} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-primary/70" />
      <BlueprintScene preset="hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--primary))_85%)]" />

      <div className="relative z-10 text-center px-4 sm:px-6">
        <img
          src={peLogo}
          alt="Peninsula Equine logo — gold horseshoe emblem on dark background"
          loading="eager"
          width={128}
          height={128}
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
