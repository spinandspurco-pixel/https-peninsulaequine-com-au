import { useMemo } from "react";

/**
 * HeroAtmosphere
 * - Slowly pulsing blueprint grid + dimension lines (14s loop).
 * - Drifting warm dust particles.
 * Purely decorative; pointer-events disabled.
 */
export function HeroAtmosphere() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const left = Math.round((i * 67 + 13) % 100);
        const delay = (i * 1.7) % 18;
        const dur = 18 + ((i * 3) % 12);
        const drift = (((i * 37) % 60) - 30) / 10; // -3vw → 3vw
        const size = i % 4 === 0 ? 3 : 2;
        return { left, delay, dur, drift, size, key: i };
      }),
    []
  );

  return (
    <>
      {/* Blueprint overlay — pulses slowly */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          mixBlendMode: "screen",
          animation: "heroBlueprintPulse 14s ease-in-out infinite",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <pattern id="hero-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="rgba(180,210,230,0.35)"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="1600" height="900" fill="url(#hero-grid)" />
          {/* Dimension lines */}
          <g stroke="rgba(200,220,235,0.5)" strokeWidth="0.6" fill="none">
            <line x1="120" y1="140" x2="1480" y2="140" strokeDasharray="2 6" />
            <line x1="120" y1="120" x2="120" y2="160" />
            <line x1="1480" y1="120" x2="1480" y2="160" />
            <line x1="120" y1="760" x2="1480" y2="760" strokeDasharray="2 6" />
            <line x1="800" y1="120" x2="800" y2="780" strokeDasharray="1 8" opacity="0.6" />
          </g>
          {/* Corner crosshairs */}
          <g stroke="rgba(220,235,245,0.6)" strokeWidth="0.7">
            {[
              [120, 140],
              [1480, 140],
              [120, 760],
              [1480, 760],
            ].map(([x, y], i) => (
              <g key={i}>
                <line x1={x - 8} y1={y} x2={x + 8} y2={y} />
                <line x1={x} y1={y - 8} x2={x} y2={y + 8} />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Drifting warm dust */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <span
            key={p.key}
            className="hero-particle"
            style={{
              left: `${p.left}%`,
              bottom: `-2vh`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              ["--dust-x" as string]: `${p.drift}vw`,
            }}
          />
        ))}
      </div>

      {/* Warm golden-hour cast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(210,165,105,0.07) 0%, transparent 60%), linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </>
  );
}
