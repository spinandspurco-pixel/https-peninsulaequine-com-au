import { useEffect, useState } from "react";
import comingSoonAsset from "@/assets/lumenarc/coming-soon.asset.json";

const SESSION_KEY = "lumenarc-entrance-seen";

/**
 * Cinematic entrance overlay for the LumenArc page.
 *
 * Visual continuity rules — matches the rest of the site:
 *  - Coming Soon backdrop uses the same image-bleed + radial vignette + edge
 *    fades as LumenArcChapterSection so it dissolves into the page, not a card.
 *  - Blueprint 80px drafting grid matches the chapter overlay exactly.
 *  - Same SAME amber breath, hero gradient stack and easing curve as the
 *    page hero, so when the overlay fades out the visual lineage continues.
 *  - Animations stay lightweight: opacity + transform only, ~2.4s total.
 */
export function LumenArcEntrance() {
  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return false;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
      return true;
    } catch {
      return true;
    }
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!active) return;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    const fadeAt = window.setTimeout(() => setFading(true), 2400);
    const removeAt = window.setTimeout(() => setActive(false), 3500);
    return () => {
      window.clearTimeout(fadeAt);
      window.clearTimeout(removeAt);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[80] pointer-events-none overflow-hidden bg-background transition-opacity duration-1000 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.45, 0, 0.15, 1)" }}
    >
      {/* Coming Soon backdrop — contained so the baked-in lockup never clips on narrow viewports */}
      <img
        src={comingSoonAsset.url}
        alt=""
        className="absolute inset-0 h-full w-full object-contain object-center image-bleed la-entrance-bg"
        style={{ filter: "brightness(0.78) contrast(1.08) saturate(0.8)" }}
        decoding="async"
        fetchPriority="high"
      />

      {/* Cinematic vignette stack — mirrors the LumenArc hero section */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_35%,hsl(var(--background)/0.55)_80%,hsl(var(--background))_100%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,hsl(var(--background)/0.7)_0%,transparent_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[18%] bg-[linear-gradient(90deg,hsl(var(--background))_0%,transparent_100%)]" />
      <div className="absolute inset-y-0 right-0 w-[18%] bg-[linear-gradient(270deg,hsl(var(--background))_0%,transparent_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-[linear-gradient(0deg,hsl(var(--background))_0%,hsl(var(--background)/0.75)_45%,transparent_100%)]" />

      {/* Restrained amber breath */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,hsl(var(--accent)/0.1),transparent_55%)] la-entrance-glow" />

      {/* Blueprint 80px drafting grid — matches chapter section overlay exactly */}
      <div
        className="absolute inset-0 la-entrance-grid"
        style={{
          backgroundImage:
            "linear-gradient(0deg, hsl(var(--accent)/0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)/0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          mixBlendMode: "screen",
        }}
      />

      {/* Blueprint perimeter — thin gold frame that draws in */}
      <svg
        className="absolute inset-0 h-full w-full la-entrance-lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line x1="6" y1="6" x2="94" y2="6" stroke="hsl(var(--accent) / 0.42)" strokeWidth="0.05" pathLength={1} />
        <line x1="94" y1="6" x2="94" y2="94" stroke="hsl(var(--accent) / 0.42)" strokeWidth="0.05" pathLength={1} />
        <line x1="94" y1="94" x2="6" y2="94" stroke="hsl(var(--accent) / 0.42)" strokeWidth="0.05" pathLength={1} />
        <line x1="6" y1="94" x2="6" y2="6" stroke="hsl(var(--accent) / 0.42)" strokeWidth="0.05" pathLength={1} />
      </svg>

      {/* PE mark + LumenArc lockup */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <div className="la-entrance-mark">
          <div className="font-serif text-accent/85 text-[clamp(2.4rem,1.6rem+2.4vw,3.6rem)] leading-none tracking-[0.04em]">
            PE
          </div>
          <div className="mx-auto mt-5 h-px w-16 bg-accent/45 la-entrance-rule" />
        </div>
        <div className="la-entrance-lockup mt-7">
          <div className="font-mono uppercase text-foreground/55 text-[0.62rem] tracking-[0.55em]">
            Peninsula Equine
          </div>
          <h1 className="mt-3 font-serif text-foreground/92 text-[clamp(2rem,1.4rem+2.4vw,3.4rem)] leading-[1.02] tracking-[0.02em]">
            LumenArc
          </h1>
          <div className="mt-4 font-mono uppercase text-accent/55 text-[0.58rem] tracking-[0.5em]">
            In Development
          </div>
        </div>
      </div>

      <style>{`
        @keyframes la-bg-in {
          0% { opacity: 0; transform: scale(1.035); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes la-glow-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes la-grid-in {
          0% { opacity: 0; }
          100% { opacity: 0.07; }
        }
        @keyframes la-line-draw {
          0% { stroke-dashoffset: 1; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes la-rise {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes la-rule-in {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }

        .la-entrance-bg {
          animation: la-bg-in 1400ms cubic-bezier(0.45, 0, 0.15, 1) both;
          will-change: opacity, transform;
        }
        .la-entrance-glow {
          animation: la-glow-in 1600ms cubic-bezier(0.45, 0, 0.15, 1) 200ms both;
        }
        .la-entrance-grid {
          opacity: 0;
          animation: la-grid-in 1400ms cubic-bezier(0.45, 0, 0.15, 1) 250ms both;
        }
        .la-entrance-lines line {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: la-line-draw 1400ms cubic-bezier(0.45, 0, 0.15, 1) 300ms both;
          vector-effect: non-scaling-stroke;
        }
        .la-entrance-lines line:nth-child(2) { animation-delay: 420ms; }
        .la-entrance-lines line:nth-child(3) { animation-delay: 540ms; }
        .la-entrance-lines line:nth-child(4) { animation-delay: 660ms; }

        .la-entrance-mark {
          animation: la-rise 1100ms cubic-bezier(0.45, 0, 0.15, 1) 800ms both;
        }
        .la-entrance-rule {
          transform-origin: center;
          animation: la-rule-in 1000ms cubic-bezier(0.45, 0, 0.15, 1) 1150ms both;
        }
        .la-entrance-lockup {
          animation: la-rise 1200ms cubic-bezier(0.45, 0, 0.15, 1) 1300ms both;
        }
      `}</style>
    </div>
  );
}
