import { useState } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";

/* ── Layer definitions ────────────────────────────────── */
type LayerKey = "structure" | "envelope" | "finished";

const layers: { key: LayerKey; label: string }[] = [
  { key: "structure", label: "Structure" },
  { key: "envelope", label: "Envelope" },
  { key: "finished", label: "Finished" },
];

/* ── SVG Layer: Structure — skeletal wireframe ────────── */
function StructureLayer() {
  return (
    <g>
      {/* Foundation */}
      <line x1="100" y1="400" x2="700" y2="400" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      {/* Left wall */}
      <line x1="160" y1="400" x2="160" y2="180" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
      {/* Right wall */}
      <line x1="640" y1="400" x2="640" y2="180" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
      {/* Roof left */}
      <line x1="120" y1="180" x2="400" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Roof right */}
      <line x1="680" y1="180" x2="400" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Ridge beam */}
      <line x1="400" y1="60" x2="400" y2="400" stroke="currentColor" strokeWidth="0.4" opacity="0.1" strokeDasharray="4 6" />
      {/* Collar ties */}
      <line x1="220" y1="150" x2="580" y2="150" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      {/* Stud walls */}
      {[240, 320, 480, 560].map((x) => (
        <line key={x} x1={x} y1="400" x2={x} y2="220" stroke="currentColor" strokeWidth="0.4" opacity="0.12" />
      ))}
      {/* Cross bracing */}
      <line x1="160" y1="400" x2="320" y2="220" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
      <line x1="640" y1="400" x2="480" y2="220" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
      {/* Truss details */}
      <line x1="240" y1="220" x2="320" y2="140" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
      <line x1="560" y1="220" x2="480" y2="140" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
      {/* Annotation dots */}
      {[[160, 400], [640, 400], [400, 60], [160, 180], [640, 180]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      ))}
    </g>
  );
}

/* ── SVG Layer: Envelope — cladding, roof, openings ───── */
function EnvelopeLayer() {
  return (
    <g>
      {/* Roof surface */}
      <path
        d="M 120 180 L 400 60 L 680 180 Z"
        fill="currentColor"
        opacity="0.04"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeOpacity="0.2"
      />
      {/* Wall panels left */}
      <rect x="160" y="180" width="200" height="220" fill="currentColor" opacity="0.03" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15" />
      {/* Wall panels right */}
      <rect x="440" y="180" width="200" height="220" fill="currentColor" opacity="0.03" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.15" />
      {/* Door opening */}
      <rect x="360" y="290" width="80" height="110" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
      {/* Windows */}
      <rect x="200" y="240" width="50" height="35" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      <rect x="550" y="240" width="50" height="35" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
      {/* Roof ridge cap */}
      <line x1="380" y1="62" x2="420" y2="62" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      {/* Gutter lines */}
      <line x1="120" y1="182" x2="160" y2="182" stroke="currentColor" strokeWidth="0.6" opacity="0.12" />
      <line x1="640" y1="182" x2="680" y2="182" stroke="currentColor" strokeWidth="0.6" opacity="0.12" />
      {/* Cladding texture lines */}
      {[210, 240, 270, 300, 330, 360].map((y) => (
        <line key={`cl-${y}`} x1="162" y1={y} x2="358" y2={y} stroke="currentColor" strokeWidth="0.2" opacity="0.06" />
      ))}
      {[210, 240, 270, 300, 330, 360].map((y) => (
        <line key={`cr-${y}`} x1="442" y1={y} x2="638" y2={y} stroke="currentColor" strokeWidth="0.2" opacity="0.06" />
      ))}
    </g>
  );
}

/* ── SVG Layer: Finished — polished, material detail ──── */
function FinishedLayer() {
  return (
    <g>
      {/* Filled roof with subtle gradient feel */}
      <path
        d="M 120 180 L 400 60 L 680 180 Z"
        fill="currentColor"
        opacity="0.06"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.25"
      />
      {/* Solid walls */}
      <rect x="160" y="180" width="480" height="220" fill="currentColor" opacity="0.04" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.2" />
      {/* Door — timber detail */}
      <rect x="360" y="290" width="80" height="110" fill="currentColor" opacity="0.06" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="400" y1="290" x2="400" y2="400" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
      {/* Windows with glazing */}
      <rect x="200" y="240" width="50" height="35" fill="currentColor" opacity="0.03" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.2" />
      <rect x="550" y="240" width="50" height="35" fill="currentColor" opacity="0.03" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.2" />
      {/* Window cross bars */}
      <line x1="225" y1="240" x2="225" y2="275" stroke="currentColor" strokeWidth="0.3" opacity="0.12" />
      <line x1="575" y1="240" x2="575" y2="275" stroke="currentColor" strokeWidth="0.3" opacity="0.12" />
      {/* Landscaping ground line */}
      <path
        d="M 60 402 C 150 398 250 404 400 400 C 550 396 650 403 740 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.1"
      />
      {/* Shadow beneath structure */}
      <ellipse cx="400" cy="410" rx="260" ry="8" fill="currentColor" opacity="0.03" />
      {/* Material highlight — stone base */}
      <rect x="160" y="370" width="480" height="30" fill="currentColor" opacity="0.02" stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.08" />
    </g>
  );
}

/* ── Main export ──────────────────────────────────────── */
export function BuildIntelligence() {
  const [active, setActive] = useState<LayerKey>("structure");

  return (
    <section className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      <div className="section-container relative z-10">
        <RevealOnScroll direction="up" duration={700}>
          {/* Header */}
          <div className="text-center mb-14 sm:mb-18">
            <div className="flex items-center justify-center gap-5 mb-6">
              <div className="w-8 h-px bg-accent/30" />
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/40 font-mono">
                Build Intelligence
              </p>
              <div className="w-8 h-px bg-accent/30" />
            </div>
            <p className="font-serif text-lg sm:text-xl lg:text-2xl italic text-muted-foreground/40 max-w-lg mx-auto leading-relaxed">
              "Every build is engineered before it is seen."
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll direction="up" duration={800} delay={100}>
          {/* Toggles */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16">
            {layers.map((l) => {
              const isActive = active === l.key;
              return (
                <button
                  key={l.key}
                  onClick={() => setActive(l.key)}
                  className="relative px-5 sm:px-7 py-2.5 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-mono transition-all duration-300 cursor-pointer bg-transparent border-0"
                  style={{
                    color: isActive
                      ? "rgba(198,168,107,0.8)"
                      : "rgba(198,168,107,0.3)",
                  }}
                >
                  {l.label}
                  {/* Active glow underline */}
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px transition-all duration-300 ease-out"
                    style={{
                      width: isActive ? "60%" : "0%",
                      backgroundColor: "rgba(198,168,107,0.4)",
                      boxShadow: isActive
                        ? "0 0 12px rgba(198,168,107,0.15)"
                        : "none",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* SVG illustration with layer transitions */}
          <div className="relative max-w-2xl mx-auto" style={{ color: "hsl(var(--accent))" }}>
            <svg
              viewBox="0 0 800 460"
              className="w-full h-auto"
              aria-label={`Building ${active} layer view`}
            >
              {/* Faint grid */}
              <defs>
                <pattern id="bi-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.05" />
                </pattern>
              </defs>
              <rect width="800" height="460" fill="url(#bi-grid)" />

              {/* Layer 1: Structure */}
              <g
                className="transition-opacity duration-300 ease-out"
                style={{ opacity: active === "structure" ? 1 : 0.05 }}
              >
                <StructureLayer />
              </g>

              {/* Layer 2: Envelope */}
              <g
                className="transition-opacity duration-300 ease-out"
                style={{ opacity: active === "envelope" ? 1 : 0.05 }}
              >
                <EnvelopeLayer />
              </g>

              {/* Layer 3: Finished */}
              <g
                className="transition-opacity duration-300 ease-out"
                style={{ opacity: active === "finished" ? 1 : 0.05 }}
              >
                <FinishedLayer />
              </g>
            </svg>
          </div>

          {/* Layer description */}
          <div className="text-center mt-10 sm:mt-12">
            <p
              className="text-xs sm:text-[13px] font-mono uppercase tracking-[0.2em] transition-all duration-300 ease-out"
              style={{ color: "rgba(198,168,107,0.35)" }}
            >
              {active === "structure" && "Steel + timber framework — the skeleton of every build"}
              {active === "envelope" && "Cladding, openings + weatherproofing — the protective shell"}
              {active === "finished" && "Materials, landscaping + final detail — the resolved form"}
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
