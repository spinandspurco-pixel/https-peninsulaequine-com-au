import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";
import { useAmbientSound, type AmbientScene } from "@/hooks/useAmbientSound";

import { InteractiveMasterplan } from "@/components/masterplan/InteractiveMasterplanV2";
import { WalkTheProject } from "@/components/WalkTheProject";
import { BuildTimeline } from "@/components/BuildTimeline";

import imgHero from "@/assets/mainridge-aerial-hero.jpg";

/* ── Act labels for the side nav ─────────────────────── */
const acts = [
  { id: "hero", label: "Introduction" },
  { id: "masterplan", label: "Understand" },
  { id: "walk", label: "Experience" },
  { id: "timeline", label: "Construction" },
  { id: "synthesis", label: "Resolution" },
];

/* ── Side progress nav ───────────────────────────────── */
function ActNav({ activeAct }: { activeAct: string }) {
  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-3">
      {acts.map((act) => {
        const isActive = activeAct === act.id;
        return (
          <button
            key={act.id}
            onClick={() => {
              document
                .getElementById(`etb-${act.id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="group flex items-center gap-3"
            aria-label={act.label}
          >
            <span
              className="text-[8px] font-mono uppercase tracking-[0.3em] transition-opacity duration-700"
              style={{
                opacity: isActive ? 0.4 : 0,
                color: "hsl(var(--accent))",
              }}
            >
              {act.label}
            </span>
            <div
              className="transition-all duration-700"
              style={{
                width: "1px",
                height: isActive ? "24px" : "8px",
                background: isActive
                  ? "hsl(var(--accent) / 0.35)"
                  : "hsl(var(--accent) / 0.08)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ── Cinematic transition between acts ───────────────── */
function ActTransition({ line }: { line: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="py-28 sm:py-40 lg:py-52 text-center">
      <p
        className="font-serif text-sm sm:text-base lg:text-lg italic text-foreground/20 max-w-sm mx-auto leading-relaxed tracking-[0.02em] px-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : `translateY(${DISTANCE.md}px)`,
          transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 300ms, transform ${DURATION.cinematic}ms ${EASE.cinematic} 300ms`,
        }}
      >
        {line}
      </p>
    </div>
  );
}

/* ── Opening hero ────────────────────────────────────── */
function ExperienceHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id="etb-hero"
      className="relative w-full min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={imgHero}
          alt="Main Ridge Estate aerial view"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.45)" }}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, hsl(var(--background) / 0.4) 0%, hsl(var(--background) / 0.6) 50%, hsl(var(--background) / 0.85) 100%)`,
        }}
      />

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none grain-texture" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg">
        <div
          className="flex items-center justify-center gap-5 mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${DURATION.slow}ms ${EASE.cinematic} 800ms`,
          }}
        >
          <div className="w-10 h-px bg-accent/12" />
          <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-accent/20 font-mono">
            Main Ridge Estate
          </p>
          <div className="w-10 h-px bg-accent/12" />
        </div>

        <h2
          className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground/85 tracking-[0.03em] leading-tight"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : `translateY(${DISTANCE.lg}px)`,
            transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 1200ms, transform ${DURATION.cinematic}ms ${EASE.cinematic} 1200ms`,
          }}
        >
          Experience the Build
        </h2>

        <p
          className="mt-6 text-[11px] sm:text-[12px] text-muted-foreground/25 font-serif italic max-w-xs mx-auto leading-relaxed tracking-[0.02em]"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 1800ms`,
          }}
        >
          Architecture. Movement. Construction. One system.
        </p>
      </div>
    </div>
  );
}

/* ── Final synthesis + CTA ───────────────────────────── */
function Synthesis() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id="etb-synthesis"
      className="py-32 sm:py-44 lg:py-56 text-center"
    >
      <div
        className="max-w-md mx-auto px-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : `translateY(${DISTANCE.lg}px)`,
          transition: `opacity ${DURATION.extended}ms ${EASE.cinematic} 400ms, transform ${DURATION.extended}ms ${EASE.cinematic} 400ms`,
        }}
      >
        <div
          className="flex items-center justify-center gap-5 mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 400ms`,
          }}
        >
          <div className="w-8 h-px bg-accent/10" />
          <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-accent/15">
            One System
          </p>
          <div className="w-8 h-px bg-accent/10" />
        </div>

        <p
          className="font-serif text-xl sm:text-2xl lg:text-3xl italic text-foreground/45 leading-relaxed tracking-[0.01em]"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${DURATION.extended}ms ${EASE.cinematic} 900ms`,
          }}
        >
          Built properly. From the ground up.
        </p>

        <p
          className="mt-4 mb-12 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.42em]"
          style={{
            color: "hsl(var(--accent))",
            opacity: visible ? 0.22 : 0,
            transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 1500ms`,
          }}
        >
          From Dirt to Dynasty
        </p>

        <button
          onClick={() => navigate("/contact")}
          className="px-10 py-4 border border-accent/15 text-[11px] font-mono uppercase tracking-[0.3em] text-foreground/65 hover:border-accent/30 hover:text-foreground/85 hover:bg-accent/5"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 1400ms, transform 250ms cubic-bezier(0.45, 0, 0.15, 1), border-color 500ms cubic-bezier(0.45, 0, 0.15, 1), color 500ms cubic-bezier(0.45, 0, 0.15, 1), background-color 500ms cubic-bezier(0.45, 0, 0.15, 1)`,
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Start Your Project
        </button>

        <p
          className="mt-10 text-[9px] font-mono uppercase tracking-[0.3em] text-accent/8 leading-relaxed"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} 1900ms`,
          }}
        >
          Performance held in every layer
        </p>
      </div>
    </div>
  );
}

/* ── Sound toggle ────────────────────────────────────── */
function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="fixed left-4 sm:left-6 bottom-6 z-50 flex items-center gap-2 group"
      aria-label={enabled ? "Mute ambient sound" : "Enable ambient sound"}
    >
      {/* Speaker icon */}
      <div className="relative w-4 h-4">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="w-full h-full"
          style={{ opacity: 0.2 }}
        >
          <path
            d="M3 5.5h2l3-2.5v10l-3-2.5H3a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5z"
            fill="currentColor"
            className="text-accent"
          />
          {enabled && (
            <>
              <path d="M10 5.5c.8.6 1.3 1.5 1.3 2.5s-.5 1.9-1.3 2.5" stroke="currentColor" strokeWidth="1" className="text-accent" strokeLinecap="round" />
              <path d="M11.5 3.8c1.2.9 2 2.3 2 3.7 0 1.5-.8 2.9-2 3.8" stroke="currentColor" strokeWidth="1" className="text-accent" strokeLinecap="round" opacity="0.5" />
            </>
          )}
          {!enabled && (
            <path d="M10 5l4 6M14 5l-4 6" stroke="currentColor" strokeWidth="1" className="text-accent" strokeLinecap="round" />
          )}
        </svg>
      </div>
      <span
        className="text-[8px] font-mono uppercase tracking-[0.3em] text-accent/12 transition-opacity duration-500 group-hover:text-accent/25"
      >
        {enabled ? "Sound on" : "Sound off"}
      </span>
    </button>
  );
}

/* ── Scene-to-ambient mapping ────────────────────────── */
const WALK_SCENE_MAP: Record<string, AmbientScene> = {
  arrival: "walk-arrival",
  entry: "walk-entry",
  courtyard: "walk-courtyard",
  stables: "walk-stables",
  structure: "walk-structure",
  corridor: "walk-corridor",
  arena: "walk-arena",
  viewing: "walk-viewing",
  system: "walk-system",
  cta: "walk-cta",
};

const TIMELINE_PHASE_MAP: Record<string, AmbientScene> = {
  "site-prep": "timeline-site",
  groundlock: "timeline-ground",
  structure: "timeline-structure",
  envelope: "timeline-envelope",
  finished: "timeline-finished",
};

/* ── Main export ─────────────────────────────────────── */
export function ExperienceTheBuild() {
  const [activeAct, setActiveAct] = useState("hero");
  const {
    enabled: soundEnabled,
    toggle: toggleSound,
    transitionTo,
    playHoverTone,
    stopHoverTone,
    playToggleTone,
    playPressTone,
  } = useAmbientSound();

  /* Track which act is in view */
  useEffect(() => {
    const ids = acts.map((a) => `etb-${a.id}`);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveAct(id.replace("etb-", ""));
          }
        },
        { threshold: 0.15 }
      );
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* Ambient sound: act-level transitions */
  useEffect(() => {
    const actToScene: Record<string, AmbientScene> = {
      hero: "hero",
      masterplan: "masterplan",
      synthesis: "synthesis",
    };
    if (actToScene[activeAct]) {
      transitionTo(actToScene[activeAct]);
    }
  }, [activeAct, transitionTo]);

  /* Ambient sound: Walk scene tracking */
  const handleWalkScene = useCallback(
    (sceneId: string) => {
      const scene = WALK_SCENE_MAP[sceneId];
      if (scene) transitionTo(scene);
    },
    [transitionTo]
  );

  /* Ambient sound: Timeline phase tracking */
  const handleTimelinePhase = useCallback(
    (phaseId: string) => {
      const scene = TIMELINE_PHASE_MAP[phaseId];
      if (scene) transitionTo(scene);
    },
    [transitionTo]
  );

  return (
    <div className="relative">
      {/* Sound toggle */}
      <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />

      {/* Side nav */}
      <ActNav activeAct={activeAct} />

      {/* ACT 0 — Hero */}
      <ExperienceHero />

      {/* Transition into Act 1 */}
      <ActTransition line="Understand how every space connects — before anything is built." />

      {/* ACT 1 — Masterplan */}
      <div id="etb-masterplan">
        <InteractiveMasterplan />
      </div>

      {/* Transition into Act 2 */}
      <ActTransition line="Now walk through it." />

      {/* ACT 2 — Walk the Build */}
      <div id="etb-walk">
        <WalkTheProject onSceneChange={handleWalkScene} />
      </div>

      {/* Transition into Act 3 */}
      <ActTransition line="See how it's built — layer by layer, from the ground up." />

      {/* ACT 3 — Build Timeline */}
      <div id="etb-timeline">
        <BuildTimeline onPhaseChange={handleTimelinePhase} />
      </div>

      {/* Final synthesis */}
      <Synthesis />
    </div>
  );
}
