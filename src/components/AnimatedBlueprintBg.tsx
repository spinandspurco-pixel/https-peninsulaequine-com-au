import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedBlueprintBgProps {
  /** The blueprint image to use as the base layer */
  image: string;
  /** Overall opacity of the image layer (0–1) */
  imageOpacity?: number;
  /** Whether to show animated SVG overlay lines */
  showLines?: boolean;
  /** Variant controls which set of SVG paths to render */
  variant?: "hero" | "section-a" | "section-b";
  /** Extra classes on the wrapper */
  className?: string;
}

/**
 * Animated blueprint background that draws SVG lines, dimensions,
 * and architectural marks as the user scrolls into view.
 * Respects prefers-reduced-motion.
 */
export function AnimatedBlueprintBg({
  image,
  imageOpacity = 0.08,
  showLines = true,
  variant = "hero",
  className = "",
}: AnimatedBlueprintBgProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Scroll-driven progress (0 → 1) based on element position in viewport
  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const vh = window.innerHeight;
            // Progress: 0 when bottom of element enters viewport, 1 when top exits
            const raw = 1 - (rect.top / vh);
            setProgress(Math.max(0, Math.min(1, raw)));
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

  const paths = getPathsForVariant(variant);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Base blueprint image */}
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: imageOpacity,
          filter: "saturate(0.3) brightness(0.8)",
        }}
      />

      {/* Animated SVG overlay */}
      {showLines && (
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.12 }}
        >
          {paths.map((p, i) => (
            <AnimatedPath
              key={i}
              d={p.d}
              progress={progress}
              delay={p.delay}
              color={p.color ?? "hsl(35, 75%, 50%)"}
              strokeWidth={p.strokeWidth ?? 1}
            />
          ))}

          {/* Dimension labels that fade in */}
          {variant === "hero" && (
            <>
              <AnimatedText x={180} y={340} progress={progress} delay={0.4} text="24'-0&quot;" />
              <AnimatedText x={1400} y={280} progress={progress} delay={0.5} text="36'-0&quot;" />
              <AnimatedText x={960} y={820} progress={progress} delay={0.6} text="EST. 20XX" />
              <AnimatedText x={300} y={700} progress={progress} delay={0.55} text="28'-0" />
              <AnimatedText x={1600} y={600} progress={progress} delay={0.65} text="7910" />
            </>
          )}
          {variant === "section-a" && (
            <>
              <AnimatedText x={200} y={200} progress={progress} delay={0.3} text="34'-0&quot;" />
              <AnimatedText x={1700} y={400} progress={progress} delay={0.45} text="24&apos;-1&quot;" />
              <AnimatedText x={960} y={900} progress={progress} delay={0.5} text="SECTION A-A" />
            </>
          )}
          {variant === "section-b" && (
            <>
              <AnimatedText x={150} y={300} progress={progress} delay={0.35} text="ELEVATION" />
              <AnimatedText x={1500} y={250} progress={progress} delay={0.4} text="30'-0&quot;" />
              <AnimatedText x={800} y={850} progress={progress} delay={0.55} text="DETAIL B" />
            </>
          )}
        </svg>
      )}
    </div>
  );
}

/* ── Individual animated SVG path ── */
function AnimatedPath({
  d,
  progress,
  delay = 0,
  color,
  strokeWidth,
}: {
  d: string;
  progress: number;
  delay?: number;
  color: string;
  strokeWidth: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(1000);

  useEffect(() => {
    if (pathRef.current) {
      setLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  // Apply delay to progress
  const adjustedProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
  const dashOffset = length * (1 - adjustedProgress);

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={length}
      strokeDashoffset={dashOffset}
      style={{ transition: "stroke-dashoffset 0.1s linear" }}
    />
  );
}

/* ── Animated dimension text ── */
function AnimatedText({
  x,
  y,
  text,
  progress,
  delay = 0,
}: {
  x: number;
  y: number;
  text: string;
  progress: number;
  delay?: number;
}) {
  const adjustedProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
  const opacity = Math.min(1, adjustedProgress * 3); // Faster fade-in

  return (
    <text
      x={x}
      y={y}
      fill="hsl(35, 75%, 50%)"
      fontSize="14"
      fontFamily="monospace"
      letterSpacing="2"
      opacity={opacity}
      style={{ transition: "opacity 0.3s ease-out" }}
    >
      {text}
    </text>
  );
}

/* ── Path sets per variant ── */
interface PathConfig {
  d: string;
  delay: number;
  color?: string;
  strokeWidth?: number;
}

function getPathsForVariant(variant: string): PathConfig[] {
  const gold = "hsl(35, 75%, 50%)";
  const goldFaint = "hsl(35, 60%, 45%)";

  if (variant === "hero") {
    return [
      // Horizontal structural lines
      { d: "M 100 300 L 600 300", delay: 0.05, color: gold, strokeWidth: 0.8 },
      { d: "M 1300 280 L 1820 280", delay: 0.1, color: gold, strokeWidth: 0.8 },
      { d: "M 100 700 L 500 700", delay: 0.15, color: goldFaint, strokeWidth: 0.6 },
      { d: "M 1400 600 L 1820 600", delay: 0.2, color: goldFaint, strokeWidth: 0.6 },
      // Vertical lines
      { d: "M 150 250 L 150 750", delay: 0.12, color: gold, strokeWidth: 0.5 },
      { d: "M 1780 230 L 1780 650", delay: 0.18, color: gold, strokeWidth: 0.5 },
      // Dimension arrows
      { d: "M 160 330 L 180 340 L 160 350", delay: 0.3, color: gold, strokeWidth: 0.7 },
      { d: "M 580 290 L 600 300 L 580 310", delay: 0.32, color: gold, strokeWidth: 0.7 },
      // Cross-hatching / detail marks
      { d: "M 200 500 L 220 480 M 220 500 L 240 480 M 240 500 L 260 480", delay: 0.25, color: goldFaint, strokeWidth: 0.4 },
      // Roof line sketch
      { d: "M 700 200 L 960 100 L 1220 200", delay: 0.08, color: gold, strokeWidth: 0.7 },
      { d: "M 700 200 L 700 500 L 1220 500 L 1220 200", delay: 0.1, color: goldFaint, strokeWidth: 0.5 },
      // Circle detail marker
      { d: "M 330 800 A 20 20 0 1 1 330 760 A 20 20 0 1 1 330 800", delay: 0.4, color: gold, strokeWidth: 0.6 },
      // Bottom dimension line
      { d: "M 100 850 L 1820 850", delay: 0.35, color: goldFaint, strokeWidth: 0.3 },
      // Diagonal brace
      { d: "M 800 200 L 960 400 L 1120 200", delay: 0.22, color: goldFaint, strokeWidth: 0.4 },
    ];
  }

  if (variant === "section-a") {
    return [
      { d: "M 100 200 L 800 200", delay: 0.05, color: gold, strokeWidth: 0.7 },
      { d: "M 1100 400 L 1820 400", delay: 0.1, color: gold, strokeWidth: 0.7 },
      { d: "M 200 150 L 200 600", delay: 0.08, color: goldFaint, strokeWidth: 0.5 },
      { d: "M 1700 350 L 1700 800", delay: 0.15, color: goldFaint, strokeWidth: 0.5 },
      { d: "M 500 300 L 700 150 L 900 300", delay: 0.12, color: gold, strokeWidth: 0.6 },
      { d: "M 500 300 L 500 600 L 900 600 L 900 300", delay: 0.18, color: goldFaint, strokeWidth: 0.4 },
      { d: "M 100 850 L 1820 850", delay: 0.3, color: goldFaint, strokeWidth: 0.3 },
      { d: "M 1200 200 L 1500 100 L 1800 200", delay: 0.2, color: gold, strokeWidth: 0.5 },
      { d: "M 960 900 A 15 15 0 1 1 960 870 A 15 15 0 1 1 960 900", delay: 0.35, color: gold, strokeWidth: 0.5 },
    ];
  }

  // section-b
  return [
    { d: "M 100 350 L 900 350", delay: 0.05, color: gold, strokeWidth: 0.6 },
    { d: "M 1000 250 L 1820 250", delay: 0.1, color: gold, strokeWidth: 0.6 },
    { d: "M 150 200 L 150 800", delay: 0.08, color: goldFaint, strokeWidth: 0.5 },
    { d: "M 1750 200 L 1750 700", delay: 0.12, color: goldFaint, strokeWidth: 0.5 },
    { d: "M 300 400 L 300 700 L 700 700 L 700 400 L 500 250 L 300 400", delay: 0.15, color: gold, strokeWidth: 0.5 },
    { d: "M 100 900 L 1820 900", delay: 0.25, color: goldFaint, strokeWidth: 0.3 },
    { d: "M 1100 300 L 1300 180 L 1500 300 L 1500 600 L 1100 600 L 1100 300", delay: 0.2, color: goldFaint, strokeWidth: 0.4 },
    { d: "M 800 850 A 12 12 0 1 1 800 826 A 12 12 0 1 1 800 850", delay: 0.3, color: gold, strokeWidth: 0.5 },
  ];
}
