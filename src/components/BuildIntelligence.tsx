import { useState, useCallback, useRef } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DURATION, EASE, crossfadeStyle } from "@/lib/motion";

/* ── Layer definitions ────────────────────────────────── */
type LayerKey = "structure" | "envelope" | "finished";

const layers: { key: LayerKey; label: string; description: string }[] = [
  { key: "structure", label: "Structure", description: "The load paths, framing, and foundational logic that define the build." },
  { key: "envelope", label: "Envelope", description: "The external shell — materials, protection, and environmental response." },
  { key: "finished", label: "Finished", description: "The final form — where function and aesthetic resolve into one." },
];

/* ── SVG Layer: Structure ─────────────────────────────── */
function StructureLayer() {
  return (
    <g>
      <line x1="100" y1="400" x2="700" y2="400" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      <line x1="160" y1="400" x2="160" y2="180" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
      <line x1="640" y1="400" x2="640" y2="180" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
      <line x1="120" y1="180" x2="400" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="680" y1="180" x2="400" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="400" y1="60" x2="400" y2="400" stroke="currentColor" strokeWidth="0.4" opacity="0.1" strokeDasharray="4 6" />
      <line x1="220" y1="150" x2="580" y2="150" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      {[240, 320, 480, 560].map((x) => (
        <line key={x} x1={x} y1="400" x2={x} y2="220" stroke="currentColor" strokeWidth="0.4" opacity="0.12" />
      ))}
      <line x1="160" y1="400" x2="320" y2="220" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
      <line x1="640" y1="400" x2="480" y2="220" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
      <line x1="240" y1="220" x2="320" y2="140" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
      <line x1="560" y1="220" x2="480" y2="140" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
      {[[160, 400], [640, 400], [400, 60], [160, 180], [640, 180]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      ))}
    </g>
  );
}

/* ── SVG Layer: Envelope ──────────────────────────────── */
function EnvelopeLayer() {
  return (
    <g>
      <path d="M 120 180 L 400 60 L 680 180 Z" fill="currentColor" opacity="0.04" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.2" />
      <rect x="160" y="180" width="200" height="220" fill="currentColor" opacity="0.03" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15" />
      <rect x="440" y="180" width="200" height="220" fill="currentColor" opacity="0.03" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15" />
      <rect x="360" y="290" width="80" height="110" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
      <rect x="200" y="240" width="50" height="35" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      <rect x="550" y="240" width="50" height="35" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      <line x1="380" y1="62" x2="420" y2="62" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="120" y1="182" x2="160" y2="182" stroke="currentColor" strokeWidth="0.6" opacity="0.12" />
      <line x1="640" y1="182" x2="680" y2="182" stroke="currentColor" strokeWidth="0.6" opacity="0.12" />
      {[210, 240, 270, 300, 330, 360].map((y) => (
        <line key={`cl-${y}`} x1="162" y1={y} x2="358" y2={y} stroke="currentColor" strokeWidth="0.2" opacity="0.06" />
      ))}
      {[210, 240, 270, 300, 330, 360].map((y) => (
        <line key={`cr-${y}`} x1="442" y1={y} x2="638" y2={y} stroke="currentColor" strokeWidth="0.2" opacity="0.06" />
      ))}
    </g>
  );
}

/* ── SVG Layer: Finished ──────────────────────────────── */
function FinishedLayer() {
  return (
    <g>
      <path d="M 120 180 L 400 60 L 680 180 Z" fill="currentColor" opacity="0.06" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="160" y="180" width="480" height="220" fill="currentColor" opacity="0.04" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.2" />
      <rect x="360" y="290" width="80" height="110" fill="currentColor" opacity="0.06" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="400" y1="290" x2="400" y2="400" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
      <rect x="200" y="240" width="50" height="35" fill="currentColor" opacity="0.03" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.2" />
      <rect x="550" y="240" width="50" height="35" fill="currentColor" opacity="0.03" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.2" />
      <line x1="225" y1="240" x2="225" y2="275" stroke="currentColor" strokeWidth="0.3" opacity="0.12" />
      <line x1="575" y1="240" x2="575" y2="275" stroke="currentColor" strokeWidth="0.3" opacity="0.12" />
      <path d="M 60 402 C 150 398 250 404 400 400 C 550 396 650 403 740 400" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
      <ellipse cx="400" cy="410" rx="260" ry="8" fill="currentColor" opacity="0.03" />
      <rect x="160" y="370" width="480" height="30" fill="currentColor" opacity="0.02" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.08" />
    </g>
  );
}

/* ── Main export ──────────────────────────────────────── */
export function BuildIntelligence() {
  const [active, setActive] = useState<LayerKey>("structure");
  const [transitioning, setTransitioning] = useState(false);
  const pendingRef = useRef<LayerKey | null>(null);
  const activeLayer = layers.find((l) => l.key === active)!;

  const handleSwitch = useCallback((key: LayerKey) => {
    if (key === active || transitioning) return;
    setTransitioning(true);
    pendingRef.current = key;
    // Brief opacity dip before switching
    setTimeout(() => {
      setActive(key);
      pendingRef.current = null;
      setTimeout(() => setTransitioning(false), 80);
    }, 70);
  }, [active, transitioning]);

  return (
    <section className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      <div className="section-container relative z-10">
        <RevealOnScroll direction="up" duration={DURATION.normal}>
          <div className="text-center mb-14 sm:mb-18 lg:mb-20">
            <div className="flex items-center justify-center gap-5 mb-5">
              <div className="w-8 h-px bg-accent/25" />
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">
                Build Intelligence
              </p>
              <div className="w-8 h-px bg-accent/25" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/90 tracking-[0.03em] mb-4">
              What You Don't See Matters Most
            </h2>
            <p className="font-serif text-sm sm:text-base italic text-muted-foreground/35 max-w-lg mx-auto leading-relaxed mb-2">
              Every build is engineered before it is seen.
            </p>
            <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-accent/25">
              Structure first. Finish second. Longevity always.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="up" duration={DURATION.normal} delay={100}>
          {/* Toggles */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-14 sm:mb-16">
            {layers.map((l) => {
              const isActive = active === l.key;
              return (
                <button
                  key={l.key}
                  onClick={() => setActive(l.key)}
                  className="relative px-5 sm:px-7 py-2.5 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-mono cursor-pointer bg-transparent border-0"
                  style={{
                    color: isActive ? "hsl(var(--accent) / 0.7)" : "hsl(var(--accent) / 0.25)",
                    transition: `color ${DURATION.fast}ms ${EASE.interactive}`,
                  }}
                >
                  {l.label}
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
                    style={{
                      width: isActive ? "60%" : "0%",
                      backgroundColor: "hsl(var(--accent) / 0.35)",
                      boxShadow: isActive ? "0 0 10px hsl(var(--accent) / 0.1)" : "none",
                      transition: `width ${DURATION.fast}ms ${EASE.interactive}, box-shadow ${DURATION.fast}ms ${EASE.interactive}`,
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* SVG illustration */}
          <div className="relative max-w-2xl mx-auto" style={{ color: "hsl(var(--accent))" }}>
            <svg viewBox="0 0 800 460" className="w-full h-auto" aria-label={`Building ${active} layer view`}>
              <defs>
                <pattern id="bi-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.04" />
                </pattern>
              </defs>
              <rect width="800" height="460" fill="url(#bi-grid)" />

              <g style={crossfadeStyle(active === "structure")}>
                <StructureLayer />
              </g>
              <g style={crossfadeStyle(active === "envelope")}>
                <EnvelopeLayer />
              </g>
              <g style={crossfadeStyle(active === "finished")}>
                <FinishedLayer />
              </g>
            </svg>
          </div>

          {/* Layer description */}
          <div className="text-center mt-10 sm:mt-12">
            <p
              className="text-xs sm:text-[13px] font-mono uppercase tracking-[0.2em] text-accent/30"
              style={{ transition: `opacity ${DURATION.fast}ms ${EASE.interactive}` }}
            >
              {activeLayer.description}
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
