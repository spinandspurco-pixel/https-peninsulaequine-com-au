import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE, DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ── Variant imagery ─────────────────────────────────── */
import imgSmall from "@/assets/estate-small.jpg";
import imgMedium from "@/assets/estate-medium.jpg";
import imgLarge from "@/assets/estate-large.jpg";
import imgTerrainFlat from "@/assets/terrain-flat.jpg";
import imgTerrainGentle from "@/assets/terrain-gentle.jpg";
import imgTerrainComplex from "@/assets/terrain-complex.jpg";
import imgDisciplinePerformance from "@/assets/discipline-performance.jpg";
import imgDisciplineReining from "@/assets/discipline-reining.jpg";
import imgDisciplineMixed from "@/assets/discipline-mixed.jpg";
import imgBudgetStandard from "@/assets/budget-standard.jpg";
import imgBudgetMid from "@/assets/budget-mid.jpg";
import imgBudgetPremium from "@/assets/budget-premium.jpg";

/* ── Types ───────────────────────────────────────────── */
type LandSize = "small" | "medium" | "large";
type Terrain = "flat" | "gentle" | "complex";
type Discipline = "performance" | "reining" | "mixed";
type Budget = "essential" | "elevated" | "signature";

interface Config {
  landSize: number;
  terrain: Terrain;
  discipline: Discipline;
  budget: Budget;
}

const DEFAULT: Config = {
  landSize: 8000,
  terrain: "gentle",
  discipline: "mixed",
  budget: "elevated",
};

/* ── Variant image map ───────────────────────────────── */
const VARIANT_MAP: Record<string, string> = {
  // Land size — primary when most recently changed
  "size:small": imgSmall,
  "size:medium": imgMedium,
  "size:large": imgLarge,
  // Terrain
  "terrain:flat": imgTerrainFlat,
  "terrain:gentle": imgTerrainGentle,
  "terrain:complex": imgTerrainComplex,
  // Discipline
  "discipline:performance": imgDisciplinePerformance,
  "discipline:reining": imgDisciplineReining,
  "discipline:mixed": imgDisciplineMixed,
  // Budget
  "budget:essential": imgBudgetStandard,
  "budget:elevated": imgBudgetMid,
  "budget:signature": imgBudgetPremium,
};

/* ── Derived estate logic ────────────────────────────── */
function deriveEstate(config: Config) {
  const { landSize, terrain, discipline, budget } = config;
  const arenaW = landSize >= 12000 ? 24 : landSize >= 6000 ? 20 : 16;
  const arenaL = discipline === "reining" ? arenaW * 1.5 : arenaW * 2;
  const stableCount = landSize >= 15000 ? 8 : landSize >= 8000 ? 6 : 4;

  return {
    arenaLabel: `${arenaW} × ${arenaL}m`,
    stableCount,
    stableLayout: stableCount >= 6 ? "U-shaped courtyard" : "Linear row",
    accessType: terrain === "complex" ? "Switchback entry with graded turns" : terrain === "gentle" ? "Direct entry with gentle grade" : "Straight approach",
    drainageComplexity: terrain === "complex" ? "Multi-zone contour grading" : terrain === "gentle" ? "Cross-fall with perimeter channels" : "Simple sheet drainage",
    groundlockZones: landSize >= 10000 ? "Entry, arena, circulation, wash bay" : landSize >= 6000 ? "Entry, arena perimeter" : "Entry zone",
    surfaceType: discipline === "performance" ? "Engineered fibre-sand" : discipline === "reining" ? "Deep loam blend" : "All-purpose composite",
    finishLevel: budget === "signature" ? "Architectural-grade cladding, premium fixtures" : budget === "elevated" ? "Quality Colorbond, durable fixtures" : "Functional steel, standard fittings",
  };
}

/* ── Planning summary phrases ────────────────────────── */
function deriveSummary(config: Config): string[] {
  const lines: string[] = [];
  const { landSize, terrain, discipline, budget } = config;

  // Size phrase
  if (landSize < 6000) lines.push("Compact, efficient planning with premium circulation logic.");
  else if (landSize < 14000) lines.push("Balanced spatial composition with clear functional separation.");
  else lines.push("Expanded estate presence with greater arrival and support depth.");

  // Terrain phrase
  if (terrain === "flat") lines.push("Clean geometry on level ground — direct and resolved.");
  else if (terrain === "gentle") lines.push("Terrain-responsive grading with controlled water movement.");
  else lines.push("Engineered land response with elegant retaining and flow logic.");

  // Discipline phrase
  if (discipline === "performance") lines.push("Arena-led configuration shaped for performance flow.");
  else if (discipline === "reining") lines.push("Layout biased toward reining practicality and movement logic.");
  else lines.push("Multi-function estate supporting flexible everyday use.");

  // Budget phrase
  if (budget === "essential") lines.push("Smart prioritisation — lean, disciplined, no compromise.");
  else if (budget === "elevated") lines.push("Enhanced spatial generosity with refined material detailing.");
  else lines.push("Full premium expression — architectural presence and elevated craft.");

  return lines;
}

/* ── Selector chip ───────────────────────────────────── */
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] border",
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

/* ── Visualisation panel ─────────────────────────────── */
function EstateVisualisation({ config, lastChanged }: { config: Config; lastChanged: string }) {
  const estate = useMemo(() => deriveEstate(config), [config]);
  const summary = useMemo(() => deriveSummary(config), [config]);
  const [scaleKey, setScaleKey] = useState(0);

  // Trigger subtle scale drift on any config change
  useEffect(() => {
    setScaleKey((k) => k + 1);
  }, [config.landSize, config.terrain, config.discipline, config.budget]);

  const sizeKey: LandSize = config.landSize < 6000 ? "small" : config.landSize < 14000 ? "medium" : "large";

  // Determine which image layer is PRIMARY vs secondary based on last-changed input
  const primaryKey = useMemo(() => {
    switch (lastChanged) {
      case "terrain": return `terrain:${config.terrain}`;
      case "discipline": return `discipline:${config.discipline}`;
      case "budget": return `budget:${config.budget}`;
      default: return `size:${sizeKey}`;
    }
  }, [lastChanged, config.terrain, config.discipline, config.budget, sizeKey]);

  // All variant keys for crossfade
  const allKeys = Object.keys(VARIANT_MAP);

  return (
    <div className="relative">
      {/* Visual state panel */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-square overflow-hidden">
        {/* All variant images — only the active primary is visible */}
        {allKeys.map((key) => {
          const isActive = key === primaryKey;
          return (
            <img
              key={key}
              src={VARIANT_MAP[key]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover img-immersive"
              style={{
                opacity: isActive ? 1 : 0,
                filter: "brightness(0.42) saturate(0.72)",
                transform: isActive ? "scale(1.02)" : "scale(1.06)",
                transition: `opacity 400ms ${EASE.cinematic}, transform 800ms ${EASE.cinematic}`,
              }}
              loading="lazy"
              decoding="async"
            />
          );
        })}

        {/* Atmospheric vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, hsl(var(--background) / 0.6) 100%)`,
          }}
        />
        <div className="absolute inset-0 grain-texture opacity-40" />

        {/* Floating annotations */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          {/* Top-left: quiet context */}
          <div className="space-y-2">
            <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-accent/20">
              Every site begins with the ground
            </p>
            <p
              className="font-serif text-lg sm:text-xl text-foreground/45 leading-tight"
              style={{ transition: `all 400ms ${EASE.cinematic}` }}
            >
              {(config.landSize / 10000).toFixed(1)} hectares
            </p>
          </div>

          {/* Centre: arena specification */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="space-y-1">
              <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-accent/18">Arena</p>
              <p
                className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/55 tracking-[-0.01em]"
                style={{ transition: `all 400ms ${EASE.cinematic}` }}
              >
                {estate.arenaLabel}
              </p>
            </div>
            <div className="w-8 h-px bg-accent/8" />
            <p
              className="font-mono text-[8px] uppercase tracking-[0.25em] text-accent/12 max-w-[200px]"
              style={{ transition: `all 400ms ${EASE.cinematic}` }}
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
              <div key={item.label} className="space-y-1" style={{ transition: `all 400ms ${EASE.cinematic}` }}>
                <p className="font-mono text-[7px] uppercase tracking-[0.3em] text-accent/15">{item.label}</p>
                <p className="text-[10px] text-foreground/25 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Planning summary — elegant phrases */}
      <div className="mt-6 space-y-2 px-2">
        {summary.map((line, i) => (
          <p
            key={`${line}-${scaleKey}`}
            className="font-serif text-[12px] sm:text-[13px] italic text-foreground/20 leading-[1.8]"
            style={{
              opacity: 0,
              animation: `fadeInUp 500ms ${EASE.cinematic} ${100 + i * 80}ms forwards`,
            }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Finish level strip */}
      <div className="mt-5 py-3 px-6 border-t border-border/8">
        <p
          className="font-mono text-[7px] uppercase tracking-[0.35em] text-accent/12 text-center"
          style={{ transition: `all 400ms ${EASE.cinematic}` }}
        >
          {estate.finishLevel}
        </p>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────── */
export default function Visualise() {
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [lastChanged, setLastChanged] = useState("landSize");

  const updateConfig = useCallback(
    <K extends keyof Config>(key: K, value: Config[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
      setLastChanged(key);
    },
    []
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="section-container max-w-5xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-10 h-px bg-accent/20" />
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent/35">
                Project Simulator
              </p>
              <div className="w-10 h-px bg-accent/20" />
            </div>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <h1
              className="font-serif font-light text-foreground/80 leading-[1.1] mb-6"
              style={{ fontSize: "clamp(2rem, 1rem + 4vw, 3.5rem)" }}
            >
              Visualise Your Project
            </h1>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <p className="font-serif text-[14px] italic text-foreground/18 tracking-[0.02em]">
              Configured to your land, not forced onto it.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Simulator */}
      <section className="relative pb-28 sm:pb-36 lg:pb-44 overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-30" />
        <div className="section-container max-w-6xl mx-auto relative z-[1]">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-14">
            {/* ── Inputs ── */}
            <div className="space-y-10">
              {/* Land Size */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.3em] text-accent/28 mb-4">
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
                    <span className="font-mono text-[9px] text-muted-foreground/22">2,000 sqm</span>
                    <span className="font-mono text-[11px] text-foreground/45 tabular-nums">
                      {config.landSize.toLocaleString()} sqm
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground/22">25,000 sqm</span>
                  </div>
                </div>
              </div>

              {/* Terrain */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.3em] text-accent/28 mb-4">
                  Terrain
                </label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: "flat" as Terrain, label: "Flat" },
                    { key: "gentle" as Terrain, label: "Gentle Slope" },
                    { key: "complex" as Terrain, label: "Complex Grade" },
                  ]).map((t) => (
                    <Chip key={t.key} label={t.label} active={config.terrain === t.key} onClick={() => updateConfig("terrain", t.key)} />
                  ))}
                </div>
              </div>

              {/* Discipline */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.3em] text-accent/28 mb-4">
                  Discipline
                </label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: "performance" as Discipline, label: "Performance" },
                    { key: "reining" as Discipline, label: "Reining" },
                    { key: "mixed" as Discipline, label: "Mixed Use" },
                  ]).map((d) => (
                    <Chip key={d.key} label={d.label} active={config.discipline === d.key} onClick={() => updateConfig("discipline", d.key)} />
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.3em] text-accent/28 mb-4">
                  Budget Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: "essential" as Budget, label: "Essential" },
                    { key: "elevated" as Budget, label: "Elevated" },
                    { key: "signature" as Budget, label: "Signature" },
                  ]).map((b) => (
                    <Chip key={b.key} label={b.label} active={config.budget === b.key} onClick={() => updateConfig("budget", b.key)} />
                  ))}
                </div>
              </div>

              {/* Trust line */}
              <div className="pt-4 border-t border-border/8">
                <p className="text-[10px] text-muted-foreground/18 leading-[2] italic">
                  This simulator reflects the design logic Peninsula Equine applies to every project.
                  Actual specifications are determined during your site assessment.
                </p>
              </div>
            </div>

            {/* ── Output ── */}
            <div>
              <EstateVisualisation config={config} lastChanged={lastChanged} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32 border-t border-border/8">
        <div className="absolute inset-0 grain-texture opacity-20" />
        <div className="section-container max-w-md mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/10 mx-auto mb-10" />
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <h2 className="heading-section text-foreground mb-4 leading-[1.1]">
              Start your project.
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={150}>
            <p className="text-[12px] text-muted-foreground/22 mb-10 leading-[2]">
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
