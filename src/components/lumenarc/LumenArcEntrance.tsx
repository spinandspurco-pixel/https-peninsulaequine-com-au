import { useEffect, useState } from "react";
import comingSoonAsset from "@/assets/lumenarc/coming-soon.asset.json";

const SESSION_KEY = "lumenarc-entrance-seen";

/**
 * Cinematic entrance overlay for the LumenArc page.
 * - Coming Soon backdrop fades in
 * - Soft amber vignette + restrained gold-dust drift
 * - Blueprint line-draw animation
 * - PE mark + LumenArc lockup slowly reveal
 * - Dissolves into page content after ~2.6s
 */
export function LumenArcEntrance() {
  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(SESSION_KEY) !== "1";
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
    const fadeAt = window.setTimeout(() => setFading(true), 2600);
    const removeAt = window.setTimeout(() => setActive(false), 3800);
    return () => {
      window.clearTimeout(fadeAt);
      window.clearTimeout(removeAt);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[80] pointer-events-none overflow-hidden bg-background transition-opacity duration-[1100ms] ease-out ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.45, 0, 0.15, 1)" }}
    >
      {/* Coming Soon backdrop — slow fade-in */}
      <img
        src={comingSoonAsset.url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center la-entrance-bg"
        style={{ filter: "brightness(0.7) contrast(1.08) saturate(0.78)" }}
        decoding="async"
        fetchPriority="high"
      />

      {/* Vignette + amber glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background)/0.55)_70%,hsl(var(--background))_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,hsl(var(--accent)/0.12),transparent_55%)] la-entrance-glow" />

      {/* Restrained gold dust */}
      <div className="absolute inset-0 la-entrance-dust" />

      {/* Blueprint line-draw frame */}
      <svg
        className="absolute inset-0 h-full w-full la-entrance-lines"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line x1="8" y1="8" x2="92" y2="8" stroke="hsl(var(--accent) / 0.35)" strokeWidth="0.05" pathLength={1} />
        <line x1="92" y1="8" x2="92" y2="92" stroke="hsl(var(--accent) / 0.35)" strokeWidth="0.05" pathLength={1} />
        <line x1="92" y1="92" x2="8" y2="92" stroke="hsl(var(--accent) / 0.35)" strokeWidth="0.05" pathLength={1} />
        <line x1="8" y1="92" x2="8" y2="8" stroke="hsl(var(--accent) / 0.35)" strokeWidth="0.05" pathLength={1} />
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
            Coming Soon — Future Concept
          </div>
        </div>
      </div>

      <style>{`
        @keyframes la-entrance-bg-in {
          0% { opacity: 0; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes la-entrance-glow-in {
          0% { opacity: 0; }
          60% { opacity: 1; }
          100% { opacity: 0.85; }
        }
        @keyframes la-entrance-dust-drift {
          0% { background-position: 0 0, 0 0; opacity: 0; }
          30% { opacity: 0.55; }
          100% { background-position: 80px -40px, -60px 50px; opacity: 0.45; }
        }
        @keyframes la-entrance-line-draw {
          0% { stroke-dashoffset: 1; opacity: 0; }
          20% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes la-entrance-mark-in {
          0% { opacity: 0; transform: translateY(8px); letter-spacing: 0.12em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.04em; }
        }
        @keyframes la-entrance-rule-in {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes la-entrance-lockup-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .la-entrance-bg {
          animation: la-entrance-bg-in 1600ms cubic-bezier(0.45, 0, 0.15, 1) both;
        }
        .la-entrance-glow {
          animation: la-entrance-glow-in 1800ms cubic-bezier(0.45, 0, 0.15, 1) 200ms both;
        }
        .la-entrance-dust {
          background-image:
            radial-gradient(circle at 20% 30%, hsl(var(--accent) / 0.18) 0, transparent 1.2px),
            radial-gradient(circle at 70% 60%, hsl(var(--accent) / 0.14) 0, transparent 1.2px);
          background-size: 140px 140px, 180px 180px;
          animation: la-entrance-dust-drift 3600ms cubic-bezier(0.45, 0, 0.15, 1) 400ms both;
          mix-blend-mode: screen;
        }
        .la-entrance-lines line {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: la-entrance-line-draw 1600ms cubic-bezier(0.45, 0, 0.15, 1) 350ms both;
          vector-effect: non-scaling-stroke;
        }
        .la-entrance-lines line:nth-child(2) { animation-delay: 500ms; }
        .la-entrance-lines line:nth-child(3) { animation-delay: 650ms; }
        .la-entrance-lines line:nth-child(4) { animation-delay: 800ms; }

        .la-entrance-mark {
          animation: la-entrance-mark-in 1200ms cubic-bezier(0.45, 0, 0.15, 1) 900ms both;
        }
        .la-entrance-rule {
          transform-origin: center;
          animation: la-entrance-rule-in 1100ms cubic-bezier(0.45, 0, 0.15, 1) 1300ms both;
        }
        .la-entrance-lockup {
          animation: la-entrance-lockup-in 1300ms cubic-bezier(0.45, 0, 0.15, 1) 1500ms both;
        }

        @media (prefers-reduced-motion: reduce) {
          .la-entrance-bg,
          .la-entrance-glow,
          .la-entrance-dust,
          .la-entrance-lines line,
          .la-entrance-mark,
          .la-entrance-rule,
          .la-entrance-lockup {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  );
}
