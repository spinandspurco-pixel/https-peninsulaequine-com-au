import { useRef, useState, useEffect, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useNavigate } from "react-router-dom";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";

/* ── Assets ──────────────────────────────────────────── */
import imgArrival from "@/assets/mainridge-aerial-hero.jpg";
import imgEntry from "@/assets/mainridge-entry-logic.jpg";
import imgCourtyard from "@/assets/mainridge-courtyard-hero.jpg";
import imgStables from "@/assets/mainridge-stable-detail.jpg";
import imgStructure from "@/assets/mainridge-structure-reveal.jpg";
import imgCorridor from "@/assets/mainridge-arena-corridor.jpg";
import imgArena from "@/assets/walk-arena.jpg";
import imgLoft from "@/assets/walk-loft.jpg";
import imgDusk from "@/assets/mainridge-dusk-exterior.jpg";
import imgConnection from "@/assets/mainridge-arena-connection.jpg";

/* ── Scene data ──────────────────────────────────────── */
interface Scene {
  id: string;
  label: string;
  line: string;
  image: string;
  brightness: number;
  scale: number;
  overlayOpacity: number;
  textPosition: "bottom-left" | "center" | "bottom-right";
}

const scenes: Scene[] = [
  {
    id: "arrival",
    label: "Arrival",
    line: "A property shaped by movement",
    image: imgArrival,
    brightness: 0.7,
    scale: 1.08,
    overlayOpacity: 0.5,
    textPosition: "center",
  },
  {
    id: "entry",
    label: "Entry",
    line: "Paths resolved before use",
    image: imgEntry,
    brightness: 0.72,
    scale: 1.06,
    overlayOpacity: 0.48,
    textPosition: "bottom-left",
  },
  {
    id: "courtyard",
    label: "Courtyard",
    line: "Everything connects here",
    image: imgCourtyard,
    brightness: 0.78,
    scale: 1.06,
    overlayOpacity: 0.42,
    textPosition: "bottom-left",
  },
  {
    id: "stables",
    label: "Stable Wing",
    line: "Daily function. Simplified",
    image: imgStables,
    brightness: 0.76,
    scale: 1.05,
    overlayOpacity: 0.45,
    textPosition: "bottom-left",
  },
  {
    id: "structure",
    label: "Structure",
    line: "What carries the load",
    image: imgStructure,
    brightness: 0.82,
    scale: 1.07,
    overlayOpacity: 0.4,
    textPosition: "center",
  },
  {
    id: "corridor",
    label: "Connection",
    line: "No interruption in flow",
    image: imgCorridor,
    brightness: 0.8,
    scale: 1.06,
    overlayOpacity: 0.42,
    textPosition: "bottom-left",
  },
  {
    id: "arena",
    label: "Arena",
    line: "Consistency, under load",
    image: imgArena,
    brightness: 0.88,
    scale: 1.09,
    overlayOpacity: 0.35,
    textPosition: "center",
  },
  {
    id: "viewing",
    label: "Viewing Loft",
    line: "The system, understood",
    image: imgLoft,
    brightness: 0.72,
    scale: 1.05,
    overlayOpacity: 0.48,
    textPosition: "bottom-left",
  },
  {
    id: "system",
    label: "Whole System",
    line: "Every element aligned",
    image: imgDusk,
    brightness: 0.68,
    scale: 1.04,
    overlayOpacity: 0.55,
    textPosition: "center",
  },
  {
    id: "cta",
    label: "",
    line: "",
    image: imgConnection,
    brightness: 0.55,
    scale: 1.03,
    overlayOpacity: 0.7,
    textPosition: "center",
  },
];

/* ── Scene component ─────────────────────────────────── */
function WalkScene({
  scene,
  index,
  reducedMotion,
}: {
  scene: Scene;
  index: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const navigate = useNavigate();
  const isCTA = scene.id === "cta";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = ref.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const viewCenter = window.innerHeight / 2;
          setParallaxY((center - viewCenter) * 0.05);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  const revealDelay = isCTA ? 600 : 400 + index * 50;

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden ${
        isCTA ? "h-[60vh] sm:h-[70vh]" : "h-[80vh] sm:h-[90vh]"
      }`}
    >
      {/* Background image with parallax */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: reducedMotion
            ? `scale(${scene.scale})`
            : `translateY(${parallaxY}px) scale(${scene.scale})`,
          transition: `transform ${DURATION.parallax}ms ${EASE.cinematic}`,
        }}
      >
        <img
          src={scene.image}
          alt={scene.label || "Main Ridge Estate"}
          className="w-full h-full object-cover"
          style={{ filter: `brightness(${scene.brightness})` }}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, hsl(var(--background) / 0.15) 0%, hsl(var(--background) / ${scene.overlayOpacity}) 45%, hsl(var(--background) / 0.75) 100%)`,
        }}
      />

      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none grain-texture" />

      {/* Content */}
      <div
        className={`absolute inset-0 z-10 flex ${
          scene.textPosition === "center"
            ? "items-center justify-center"
            : scene.textPosition === "bottom-right"
            ? "items-end justify-end"
            : "items-end justify-start"
        }`}
      >
        <div
          className={`section-container ${
            scene.textPosition === "center"
              ? "text-center"
              : scene.textPosition === "bottom-right"
              ? "text-right"
              : ""
          } ${isCTA ? "" : "pb-16 sm:pb-24 lg:pb-28"}`}
        >
          <div
            className={`${isCTA ? "" : "max-w-lg"} ${
              scene.textPosition === "center" ? "mx-auto" : ""
            }`}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translateY(0)"
                : `translateY(${DISTANCE.lg}px)`,
              transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} ${revealDelay}ms, transform ${DURATION.cinematic}ms ${EASE.cinematic} ${revealDelay}ms`,
              willChange: "opacity, transform",
            }}
          >
            {isCTA ? (
              /* ── CTA Scene ── */
              <div className="flex flex-col items-center gap-8">
                <button
                  onClick={() => navigate("/contact")}
                  className="px-8 py-3.5 border border-accent/15 text-[11px] font-mono uppercase tracking-[0.3em] text-foreground/70 hover:border-accent/30 hover:text-foreground/90 hover:bg-accent/5"
                  style={{
                    transition: "transform 250ms cubic-bezier(0.45, 0, 0.15, 1), border-color 500ms cubic-bezier(0.45, 0, 0.15, 1), color 500ms cubic-bezier(0.45, 0, 0.15, 1), background-color 500ms cubic-bezier(0.45, 0, 0.15, 1)",
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  Start Your Project
                </button>
                <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-accent/12">
                  Limited builds each year
                </p>
              </div>
            ) : (
              /* ── Narrative Scene ── */
              <>
                {/* Step counter */}
                <div
                  className={`flex items-center gap-4 mb-5 ${
                    scene.textPosition === "center"
                      ? "justify-center"
                      : scene.textPosition === "bottom-right"
                      ? "justify-end"
                      : ""
                  }`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transition: `opacity ${DURATION.slow}ms ${EASE.cinematic} ${revealDelay}ms`,
                  }}
                >
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-accent/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="w-8 h-px bg-accent/10" />
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.35em] uppercase text-accent/30">
                    {scene.label}
                  </span>
                </div>

                {/* Quote */}
                <p
                  className="font-serif text-xl sm:text-2xl lg:text-3xl italic leading-relaxed tracking-[0.01em] text-foreground/55"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : `translateY(${DISTANCE.sm}px)`,
                    transition: `opacity ${DURATION.cinematic}ms ${EASE.cinematic} ${revealDelay + 450}ms, transform ${DURATION.cinematic}ms ${EASE.cinematic} ${revealDelay + 450}ms`,
                  }}
                >
                  "{scene.line}"
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Progress indicator ──────────────────────────────── */
function WalkProgress({
  activeIndex,
  total,
}: {
  activeIndex: number;
  total: number;
}) {
  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-px transition-all duration-500"
          style={{
            height: i === activeIndex ? "20px" : "8px",
            background:
              i === activeIndex
                ? "hsl(var(--accent) / 0.35)"
                : i < activeIndex
                ? "hsl(var(--accent) / 0.12)"
                : "hsl(var(--accent) / 0.06)",
          }}
        />
      ))}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────── */
export function WalkTheProject({ onSceneChange }: { onSceneChange?: (sceneId: string) => void }) {
  const reducedMotion = useReducedMotion();
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeScene, setActiveScene] = useState(0);

  /* Track which scene is in view */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sceneRefs.current.forEach((el, idx) => {
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveScene(idx);
            onSceneChange?.(scenes[idx]?.id);
          }
        },
        { threshold: 0.5 }
      );
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [onSceneChange]);

  const setSceneRef = useCallback(
    (idx: number) => (el: HTMLDivElement | null) => {
      sceneRefs.current[idx] = el;
    },
    []
  );

  /* Preload first 3 images */
  useEffect(() => {
    scenes.slice(0, 3).forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  return (
    <section className="relative">
      {/* Section intro */}
      <div className="py-24 sm:py-32 text-center">
        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="w-10 h-px bg-accent/15" />
          <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-accent/22 font-mono">
            Walk the Build
          </p>
          <div className="w-10 h-px bg-accent/15" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/85 tracking-[0.04em]">
          Walk the Build
        </h2>
        <p className="mt-4 text-[11px] sm:text-[12px] text-muted-foreground/25 font-serif italic max-w-xs mx-auto leading-relaxed tracking-[0.02em]">
          A guided sequence through space, structure, and resolution
        </p>
      </div>

      {/* Progress indicator */}
      <WalkProgress activeIndex={activeScene} total={scenes.length} />

      {/* Scenes */}
      {scenes.map((scene, i) => (
        <div key={scene.id} ref={setSceneRef(i)}>
          <WalkScene scene={scene} index={i} reducedMotion={reducedMotion} />
        </div>
      ))}
    </section>
  );
}
