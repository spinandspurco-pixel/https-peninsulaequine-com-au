/**
 * LumenArcRouteFallback
 *
 * Shown by <Suspense> while the lazy /lumenarc route chunk is fetching.
 * Intentional, cinematic stand-in — no spinners, no generic indicators.
 * Mirrors the LumenArc visual language so the transition reads as part of
 * the experience rather than a loading screen.
 */
export default function LumenArcRouteFallback() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="fixed inset-0 z-[70] overflow-hidden bg-background"
    >
      {/* Soft amber breath — anchors the eye while the chunk arrives */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,hsl(var(--accent)/0.10),transparent_55%)] la-fallback-glow" />

      {/* Blueprint 80px drafting grid — matches the entrance overlay exactly */}
      <div
        className="absolute inset-0 la-fallback-grid"
        style={{
          backgroundImage:
            "linear-gradient(0deg, hsl(var(--accent)/0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)/0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          mixBlendMode: "screen",
        }}
      />

      {/* Vignette so the grid fades into pure black at the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_30%,hsl(var(--background)/0.7)_75%,hsl(var(--background))_100%)]" />

      {/* PE mark — quiet centre of gravity */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <div className="la-fallback-mark">
          <div className="font-serif text-accent/85 text-[clamp(2.4rem,1.6rem+2.4vw,3.6rem)] leading-none tracking-[0.04em]">
            PE
          </div>
          <div className="mx-auto mt-5 h-px w-16 bg-accent/45 la-fallback-rule" />
          <div className="mt-5 font-mono uppercase text-foreground/45 text-[0.55rem] tracking-[0.5em]">
            LumenArc
          </div>
        </div>
      </div>

      <style>{`
        @keyframes la-fb-glow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes la-fb-grid-in {
          0% { opacity: 0; }
          100% { opacity: 0.06; }
        }
        @keyframes la-fb-rise {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes la-fb-rule {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }

        .la-fallback-glow {
          animation: la-fb-glow 3600ms cubic-bezier(0.45, 0, 0.15, 1) infinite;
          will-change: opacity;
        }
        .la-fallback-grid {
          opacity: 0;
          animation: la-fb-grid-in 1100ms cubic-bezier(0.45, 0, 0.15, 1) 80ms forwards;
        }
        .la-fallback-mark {
          opacity: 0;
          animation: la-fb-rise 900ms cubic-bezier(0.45, 0, 0.15, 1) 160ms forwards;
        }
        .la-fallback-rule {
          transform-origin: center;
          animation: la-fb-rule 1100ms cubic-bezier(0.45, 0, 0.15, 1) 320ms both;
        }

        @media (prefers-reduced-motion: reduce) {
          .la-fallback-glow,
          .la-fallback-grid,
          .la-fallback-mark,
          .la-fallback-rule {
            animation: none;
            opacity: 1;
          }
          .la-fallback-grid { opacity: 0.06; }
        }
      `}</style>
    </div>
  );
}
