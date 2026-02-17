import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Phone, Settings, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlueprintScene } from "@/components/BlueprintScene";
import { trackCtaClick } from "@/hooks/useCtaTracking";
import { useABTest } from "@/hooks/useABTest";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";

import heroVideoA from "@/assets/videos/pavilion-grill-1.mp4";
import heroVideoB from "@/assets/videos/pavilion-grill-2.mp4";
import peLogo from "@/assets/pe-logo-new.png";

// ── Default trim ranges ─────────────────────────────────────
const DEFAULT_CLIPS = [
  { start: 3, end: 18 },
  { start: 2, end: 16 },
];
const VIDEO_SRCS = [heroVideoA, heroVideoB];
const STORAGE_KEY = "pe_hero_video_clips";

function loadClips(): { start: number; end: number }[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_CLIPS;
}

function saveClips(clips: { start: number; end: number }[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
}

// ── Floating editor panel (admin-only) ──────────────────────
function ClipEditor({
  clips,
  activeIdx,
  videoRefs,
  onChange,
  onReset,
  onClose,
}: {
  clips: { start: number; end: number }[];
  activeIdx: number;
  videoRefs: React.RefObject<HTMLVideoElement | null>[];
  onChange: (clips: { start: number; end: number }[]) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const currentTime = (idx: number) => videoRefs[idx]?.current?.currentTime?.toFixed(1) ?? "—";

  const update = (idx: number, field: "start" | "end", value: number) => {
    const next = clips.map((c, i) => (i === idx ? { ...c, [field]: value } : c));
    onChange(next);
    saveClips(next);
  };

  return (
    <div className="absolute top-4 left-4 z-50 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-4 w-72 text-sm animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif font-semibold text-foreground text-xs tracking-wider uppercase">Hero Video Clips</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => {
            const preset = [{ start: 3, end: 22 }, { start: 2, end: 20 }];
            onChange(preset);
            saveClips(preset);
            videoRefs.forEach((ref) => {
              if (ref.current) { ref.current.playbackRate = 0.35; }
            });
          }}
          className="flex-1 px-2 py-1.5 rounded-md border border-accent/40 bg-accent/10 text-accent text-[11px] font-medium tracking-wider uppercase hover:bg-accent/20 transition-colors"
        >
          🎬 Cinematic
        </button>
        <button
          onClick={() => {
            onChange(DEFAULT_CLIPS);
            saveClips(DEFAULT_CLIPS);
            videoRefs.forEach((ref) => {
              if (ref.current) { ref.current.playbackRate = 0.5; }
            });
          }}
          className="flex-1 px-2 py-1.5 rounded-md border border-border bg-card text-muted-foreground text-[11px] font-medium tracking-wider uppercase hover:bg-muted transition-colors"
        >
          Standard
        </button>
      </div>
      {clips.map((clip, i) => (
        <div
          key={i}
          className={`rounded-lg border p-3 mb-2 ${
            i === activeIdx ? "border-accent bg-accent/5" : "border-border"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-foreground text-xs">Video {i + 1}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Now: {currentTime(i)}s
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Start (s)</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={clip.start}
                onChange={(e) => update(i, "start", parseFloat(e.target.value) || 0)}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
            <label className="block">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">End (s)</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={clip.end}
                onChange={(e) => update(i, "end", parseFloat(e.target.value) || 0)}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
          </div>
        </div>
      ))}
      <button
        onClick={() => { onReset(); saveClips(DEFAULT_CLIPS); }}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mt-1 transition-colors"
      >
        <RotateCcw className="h-3 w-3" /> Reset to defaults
      </button>
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
  const [showEditor, setShowEditor] = useState(false);

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
      video.playbackRate = 0.5; // slo-mo
      video.play().catch(() => {});
    }
  }, [getRef, clips]);

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
      {/* Admin clip editor */}
      {isAdmin && showEditor && (
        <ClipEditor
          clips={clips}
          activeIdx={activeIdx}
          videoRefs={videoRefs}
          onChange={(c) => { setClips(c); }}
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
      {/* Video A — trimmed + zoomed + smoothed */}
      <video
        ref={videoARef}
        muted playsInline preload="auto"
        onTimeUpdate={() => handleTimeUpdate(0)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out will-change-transform"
        style={{
          opacity: activeIdx === 0 ? 1 : fading && activeIdx === 1 ? 0 : 0,
          transform: "scale(1.15)",
          transformOrigin: "center center",
          filter: "contrast(1.08) saturate(1.1) brightness(1.02)",
        }}
        aria-hidden="true"
      >
        <source src={VIDEO_SRCS[0]} type="video/mp4" />
      </video>
      {/* Video B — trimmed + zoomed + smoothed */}
      <video
        ref={videoBRef}
        muted playsInline preload="auto"
        onTimeUpdate={() => handleTimeUpdate(1)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out will-change-transform"
        style={{
          opacity: activeIdx === 1 ? 1 : fading && activeIdx === 0 ? 0 : 0,
          transform: "scale(1.15)",
          transformOrigin: "center center",
          filter: "contrast(1.08) saturate(1.1) brightness(1.02)",
        }}
        aria-hidden="true"
      >
        <source src={VIDEO_SRCS[1]} type="video/mp4" />
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
