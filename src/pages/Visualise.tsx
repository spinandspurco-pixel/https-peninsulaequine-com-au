import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE, DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Estate variant imagery — land-size responsive ──── */
import imgSmall from "@/assets/estate-small.jpg";
import imgMedium from "@/assets/estate-medium.jpg";
import imgLarge from "@/assets/estate-large.jpg";

/* ── Terrain variant imagery ─────────────────────────── */
import imgTerrainFlat from "@/assets/terrain-flat.jpg";
import imgTerrainGentle from "@/assets/terrain-gentle.jpg";
import imgTerrainComplex from "@/assets/terrain-complex.jpg";

/* ── Discipline variant imagery ──────────────────────── */
import imgDisciplinePerformance from "@/assets/discipline-performance.jpg";
import imgDisciplineReining from "@/assets/discipline-reining.jpg";
import imgDisciplineMixed from "@/assets/discipline-mixed.jpg";
/* ── Configuration types ─────────────────────────────── */
type Terrain = "flat" | "gentle" | "complex";
type Discipline = "performance" | "reining" | "mixed";
type Budget = "standard" | "mid" | "premium";

interface Config {
  landSize: number; // sqm
  terrain: Terrain;
  discipline: Discipline;
  budget: Budget;
}

const DEFAULT_CONFIG: Config = {
  landSize: 8000,
  terrain: "gentle",
  discipline: "mixed",
  budget: "mid",
};

/* ── Derived estate parameters ───────────────────────── */
function deriveEstate(config: Config) {
  const { landSize, terrain, discipline, budget } = config;

  // Arena sizing
  const arenaW = landSize >= 12000 ? 24 : landSize >= 6000 ? 20 : 16;
  const arenaL = discipline === "reining" ? arenaW * 1.5 : arenaW * 2;
  const arenaLabel = `${arenaW} × ${arenaL}m`;

  // Stable count
  const stableCount = landSize >= 15000 ? 8 : landSize >= 8000 ? 6 : 4;
  const stableLayout = stableCount >= 6 ? "U-shaped courtyard" : "Linear row";

  // Access
  const accessType = terrain === "complex" ? "Switchback entry with graded turns" : terrain === "gentle" ? "Direct entry with gentle grade" : "Straight approach";

  // Drainage
  const drainageComplexity = terrain === "complex" ? "Multi-zone contour grading" : terrain === "gentle" ? "Cross-fall with perimeter channels" : "Simple sheet drainage";

  // GroundLock
  const groundlockZones = landSize >= 10000 ? "Entry, arena, circulation, wash bay" : landSize >= 6000 ? "Entry, arena perimeter" : "Entry zone";

  // Surface
  const surfaceType = discipline === "performance" ? "Engineered fibre-sand" : discipline === "reining" ? "Deep loam blend" : "All-purpose composite";

  // Budget tier adjustments
  const finishLevel = budget === "premium" ? "Architectural-grade cladding, premium fixtures" : budget === "mid" ? "Quality Colorbond, durable fixtures" : "Functional steel, standard fittings";

  return {
    arenaLabel,
    arenaW,
    arenaL,
    stableCount,
    stableLayout,
    accessType,
    drainageComplexity,
    groundlockZones,
    surfaceType,
    finishLevel,
  };
}

/* ── Selector button ─────────────────────────────────── */
function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] border transition-all duration-500",
        active
          ? "border-accent/30 text-foreground/70 bg-accent/[0.04]"
          : "border-border/20 text-muted-foreground/30 hover:border-border/40 hover:text-muted-foreground/50"
      )}
      style={{ transition: `all ${DURATION.normal}ms ${EASE.cinematic}` }}
    >
      {label}
    </button>
  );
}

/* ── Visualisation output ────────────────────────────── */
function EstateVisualisation({ config }: { config: Config }) {
  const estate = useMemo(() => deriveEstate(config), [config]);

  // Select variant images — land size drives the base, terrain overlays on top
  const sizeKey = useMemo(() => {
    if (config.landSize < 6000) return "small" as const;
    if (config.landSize < 14000) return "medium" as const;
    return "large" as const;
  }, [config.landSize]);

  const sizeImages = [
    { key: "small" as const, src: imgSmall },
    { key: "medium" as const, src: imgMedium },
    { key: "large" as const, src: imgLarge },
  ];

  const terrainImages = [
    { key: "flat" as const, src: imgTerrainFlat },
    { key: "gentle" as const, src: imgTerrainGentle },
    { key: "complex" as const, src: imgTerrainComplex },
  ];

  return (
    <div className="relative">
      {/* Estate imagery — land-size base + terrain overlay */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-square overflow-hidden">
        {/* Land-size base layer */}
        {sizeImages.map((variant) => (
          <img
            key={variant.key}
            src={variant.src}
            alt={`${variant.key} estate configuration`}
            className="absolute inset-0 w-full h-full object-cover img-immersive"
            style={{
              opacity: sizeKey === variant.key ? 1 : 0,
              filter: `brightness(0.45) saturate(0.75)`,
              transition: `opacity ${DURATION.crossfade}ms ${EASE.cinematic}`,
            }}
            loading="lazy"
            decoding="async"
          />
        ))}

        {/* Terrain overlay layer — blended on top */}
        {terrainImages.map((variant) => (
          <img
            key={variant.key}
            src={variant.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: config.terrain === variant.key ? 0.35 : 0,
              mixBlendMode: "screen",
              filter: `brightness(0.5) saturate(0.6)`,
              transition: `opacity ${DURATION.crossfade}ms ${EASE.cinematic}`,
            }}
            loading="lazy"
            decoding="async"
          />
        ))}

        {/* Atmospheric overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, hsl(var(--background) / 0.65) 100%)`,
          }}
        />
        <div className="absolute inset-0 grain-texture opacity-40" />

        {/* Floating annotations */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          {/* Top: estate overview */}
          <div className="space-y-2">
            <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/25">
              Configured Estate
            </p>
            <p
              className="font-serif text-lg sm:text-xl text-foreground/50 leading-tight"
              style={{ transition: `all ${DURATION.slow}ms ${EASE.cinematic}` }}
            >
              {(config.landSize / 10000).toFixed(1)} hectares
            </p>
          </div>

          {/* Centre: primary specification */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/20">
                Arena
              </p>
              <p
                className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/60 tracking-[-0.01em]"
                style={{ transition: `all ${DURATION.slow}ms ${EASE.cinematic}` }}
              >
                {estate.arenaLabel}
              </p>
            </div>
            <div className="w-8 h-px bg-accent/10" />
            <p
              className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/15 max-w-[200px]"
              style={{ transition: `all ${DURATION.slow}ms ${EASE.cinematic}` }}
            >
              {estate.surfaceType}
            </p>
          </div>

          {/* Bottom: key parameters */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {[
              { label: "Stables", value: `${estate.stableCount} stall · ${estate.stableLayout}` },
              { label: "Access", value: estate.accessType },
              { label: "Drainage", value: estate.drainageComplexity },
              { label: "GroundLock", value: estate.groundlockZones },
            ].map((item) => (
              <div
                key={item.label}
                className="space-y-1"
                style={{ transition: `all ${DURATION.slow}ms ${EASE.cinematic}` }}
              >
                <p className="font-mono text-[7px] uppercase tracking-[0.3em] text-accent/18">
                  {item.label}
                </p>
                <p className="text-[10px] text-foreground/30 leading-relaxed">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Finish level strip */}
      <div className="mt-4 py-3 px-6 border-t border-border/10">
        <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-accent/15 text-center">
          {estate.finishLevel}
        </p>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────── */
export default function Visualise() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  const updateConfig = useCallback(
    <K extends keyof Config>(key: K, value: Config[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 sm:py-40 lg:py-48 overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="section-container max-w-5xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-10 h-px bg-accent/20" />
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/40">
                Project Simulator
              </p>
              <div className="w-10 h-px bg-accent/20" />
            </div>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <h1
              className="font-serif font-light text-foreground/80 leading-[1.1] mb-6"
              style={{ fontSize: "clamp(2rem, 1rem + 4vw, 4rem)" }}
            >
              Every site begins with the ground.
            </h1>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <p className="font-serif text-[14px] italic text-foreground/20 tracking-[0.02em]">
              Configured to your land, not forced onto it.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Simulator */}
      <section className="relative pb-32 sm:pb-40 lg:pb-48 overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-30" />
        <div className="section-container max-w-6xl mx-auto relative z-[1]">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 lg:gap-14">
            {/* ── Inputs ── */}
            <div className="space-y-10">
              {/* Land Size */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.3em] text-accent/30 mb-4">
                  Land Size
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min={2000}
                    max={25000}
                    step={500}
                    value={config.landSize}
                    onChange={(e) => updateConfig("landSize", Number(e.target.value))}
                    className="w-full accent-accent/40 h-px appearance-none bg-border/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent/40 [&::-webkit-slider-thumb]:border-0"
                  />
                  <div className="flex justify-between">
                    <span className="font-mono text-[9px] text-muted-foreground/25">2,000 sqm</span>
                    <span className="font-mono text-[11px] text-foreground/50 tabular-nums">
                      {config.landSize.toLocaleString()} sqm
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground/25">25,000 sqm</span>
                  </div>
                </div>
              </div>

              {/* Terrain */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.3em] text-accent/30 mb-4">
                  Terrain
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["flat", "gentle", "complex"] as Terrain[]).map((t) => (
                    <Chip
                      key={t}
                      label={t === "complex" ? "Complex Grade" : t === "gentle" ? "Gentle Slope" : "Flat"}
                      active={config.terrain === t}
                      onClick={() => updateConfig("terrain", t)}
                    />
                  ))}
                </div>
              </div>

              {/* Discipline */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.3em] text-accent/30 mb-4">
                  Discipline
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["performance", "reining", "mixed"] as Discipline[]).map((d) => (
                    <Chip
                      key={d}
                      label={d === "mixed" ? "Mixed Use" : d.charAt(0).toUpperCase() + d.slice(1)}
                      active={config.discipline === d}
                      onClick={() => updateConfig("discipline", d)}
                    />
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.3em] text-accent/30 mb-4">
                  Budget Range
                  <span className="text-muted-foreground/15 ml-2 normal-case tracking-normal">optional</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["standard", "mid", "premium"] as Budget[]).map((b) => (
                    <Chip
                      key={b}
                      label={b === "mid" ? "Mid-Range" : b.charAt(0).toUpperCase() + b.slice(1)}
                      active={config.budget === b}
                      onClick={() => updateConfig("budget", b)}
                    />
                  ))}
                </div>
              </div>

              {/* Trust line */}
              <div className="pt-4 border-t border-border/10">
                <p className="text-[10px] text-muted-foreground/20 leading-[2] italic">
                  This simulator reflects the design logic Peninsula Equine applies to every project.
                  Actual specifications are determined during your site assessment.
                </p>
              </div>
            </div>

            {/* ── Output ── */}
            <div>
              <EstateVisualisation config={config} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32 border-t border-border/10">
        <div className="absolute inset-0 grain-texture opacity-20" />
        <div className="section-container max-w-md mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/12 mx-auto mb-10" />
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <h2 className="heading-section text-foreground mb-4 leading-[1.1]">
              Start your project.
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={150}>
            <p className="text-[12px] text-muted-foreground/25 mb-10 leading-[2]">
              Every build begins with a site assessment.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <Button asChild variant="gold" size="lg" className="px-8">
              <Link to="/site-assessment">
                Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
