import { ReactNode, useRef, useState, useEffect, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BlueprintScene, type BlueprintSceneProps } from "@/components/BlueprintScene";
import { cn } from "@/lib/utils";

/* ── Spec Label — tiny monospace microtext callout ───── */
interface SpecLabelProps {
  text: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

function SpecLabel({ text, position = "top-right", className }: SpecLabelProps) {
  const posClasses = {
    "top-left": "top-6 left-6 sm:top-8 sm:left-8",
    "top-right": "top-6 right-6 sm:top-8 sm:right-8",
    "bottom-left": "bottom-6 left-6 sm:bottom-8 sm:left-8",
    "bottom-right": "bottom-6 right-6 sm:bottom-8 sm:right-8",
  };

  return (
    <span
      className={cn(
        "absolute z-[3] font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase pointer-events-none select-none",
        "text-muted-foreground/30",
        posClasses[position],
        className
      )}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}

/* ── Chapter Number — scroll-linked draw-in ─────────── */
function ChapterNumber({
  number,
  progress,
  reduced,
}: {
  number: string;
  progress: number;
  reduced: boolean;
}) {
  const opacity = reduced ? 0.06 : Math.min(0.08, progress * 0.12);
  return (
    <div
      className="absolute top-8 left-6 sm:top-12 sm:left-10 z-[3] pointer-events-none select-none"
      aria-hidden="true"
    >
      <span
        className="block font-serif text-[80px] sm:text-[120px] lg:text-[160px] font-bold leading-none"
        style={{
          opacity,
          color: "hsl(var(--accent))",
          transition: reduced ? "none" : "opacity 0.4s ease-out",
        }}
      >
        {number}
      </span>
    </div>
  );
}

/* ── Chapter Title Line — animated reveal ───────────── */
function ChapterTitle({
  title,
  progress,
  reduced,
}: {
  title: string;
  progress: number;
  reduced: boolean;
}) {
  const opacity = reduced ? 1 : Math.min(1, Math.max(0, (progress - 0.1) * 2));
  const translateY = reduced ? 0 : Math.max(0, (1 - progress) * 12);

  return (
    <div
      className="absolute top-6 right-6 sm:top-10 sm:right-10 z-[3] pointer-events-none select-none"
      aria-hidden="true"
      style={{
        opacity: opacity * 0.2,
        transform: `translateY(${translateY}px)`,
        transition: reduced ? "none" : "opacity 0.5s ease-out, transform 0.5s ease-out",
      }}
    >
      <span className="block font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-foreground/40">
        {title}
      </span>
      <div
        className="h-px bg-accent/30 mt-1.5 origin-left"
        style={{
          transform: `scaleX(${reduced ? 1 : Math.min(1, progress * 1.5)})`,
          transition: reduced ? "none" : "transform 0.8s ease-out",
        }}
      />
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */
export interface BlueprintChapterProps {
  /** Chapter number displayed as large watermark (e.g. "01") */
  chapter?: string;
  /** Chapter title shown as spec label in corner */
  chapterTitle?: string;
  /** Optional spec-label microtext callouts */
  specLabels?: SpecLabelProps[];
  /** Blueprint scene preset for background */
  scenePreset?: BlueprintSceneProps["preset"];
  /** Custom scene layers (overrides preset) */
  sceneLayers?: BlueprintSceneProps["layers"];
  /** Custom line overlays */
  sceneLineOverlays?: BlueprintSceneProps["lineOverlays"];
  /** Background class — bg-background, bg-primary, bg-card, etc. */
  bg?: string;
  /** Text color class for dark backgrounds */
  textColor?: string;
  /** Children — the actual content */
  children: ReactNode;
  /** Extra classes */
  className?: string;
  /** Whether to show the content card panel */
  cardPanel?: boolean;
}

export function BlueprintChapter({
  chapter,
  chapterTitle,
  specLabels = [],
  scenePreset,
  sceneLayers,
  sceneLineOverlays,
  bg = "bg-background",
  textColor,
  children,
  className,
  cardPanel = false,
}: BlueprintChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }

    let ticking = false;
    let lastProgress = 0;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const vh = window.innerHeight;
            const raw = 1 - rect.top / (vh * 0.85);
            const clamped = Math.max(0, Math.min(1, raw));
            // Only update state if progress changed meaningfully (>1%)
            if (Math.abs(clamped - lastProgress) > 0.01) {
              lastProgress = clamped;
              setProgress(clamped);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [prefersReducedMotion]);

  return (
    <section
      ref={ref}
      className={cn("relative overflow-hidden", bg, textColor, className)}
    >
      {/* Blueprint layers behind everything */}
      <BlueprintScene
        preset={scenePreset}
        layers={sceneLayers}
        lineOverlays={sceneLineOverlays}
      />

      {/* Chapter number watermark */}
      {chapter && (
        <ChapterNumber number={chapter} progress={progress} reduced={prefersReducedMotion} />
      )}

      {/* Chapter title spec label */}
      {chapterTitle && (
        <ChapterTitle title={chapterTitle} progress={progress} reduced={prefersReducedMotion} />
      )}

      {/* Spec labels */}
      {specLabels.map((sl, i) => (
        <SpecLabel key={i} {...sl} />
      ))}

      {/* Content */}
      <div className={cn("relative z-[2]", cardPanel && "section-container")}>
        {cardPanel ? (
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-8 sm:p-12 lg:p-16 shadow-sm">
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export { SpecLabel };
