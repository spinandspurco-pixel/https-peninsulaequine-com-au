import { useState, useCallback, useMemo, useEffect } from "react";
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
  "size:small": imgSmall,
  "size:medium": imgMedium,
  "size:large": imgLarge,
  "terrain:flat": imgTerrainFlat,
  "terrain:gentle": imgTerrainGentle,
  "terrain:complex": imgTerrainComplex,
  "discipline:performance": imgDisciplinePerformance,
  "discipline:reining": imgDisciplineReining,
  "discipline:mixed": imgDisciplineMixed,
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
    surfaceType: discipline === "performance" ? "Engineered fibre-sand" : discipline === "reining" ? "Deep loam blend" : "All-purpose composite",
  };
}

/* ── Planning summary — single poetic phrase ─────────── */
function deriveSummary(config: Config): string {
  const { landSize, terrain, discipline, budget } = config;

  // Combine the most defining characteristic into one line
  if (budget === "signature" && landSize >= 14000)
    return "Full estate expression — arrival, presence, and architectural depth.";
  if (discipline === "performance" && terrain === "flat")
    return "Arena-led geometry on level ground — direct and resolved.";
  if (discipline === "reining")
    return "Configured for movement — rider flow and arena practicality.";
  if (terrain === "complex")
    return "Engineered land response with elegant grading and flow logic.";
  if (landSize < 6000)
    return "Compact planning with premium circulation — lean, not compromised.";
  if (budget === "essential")
    return "Smart prioritisation — disciplined, efficient, no compromise.";
  if (landSize >= 14000)
    return "Expanded estate presence with greater arrival and support depth.";
  if (terrain === "gentle")
    return "Terrain-responsive grading with controlled water movement.";

  return "Balanced spatial composition — clear functional separation.";
}

/* ── Selection chip ──────────────────────────────────── */
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 text-[9px] font-mono uppercase tracking-[0.25em] border",
        active
          ? "border-accent/20 text-foreground/55 bg-accent/[0.03]"
          : "border-border/10 text-muted-foreground/20 hover:border-border/20 hover:text-muted-foreground/35"
      )}
      style={{ transition: `all ${DURATION.slow}ms ${EASE.cinematic}` }}
    >
      {label}
    </button>
  );
}

/* ── Visualisation ───────────────────────────────────── */
function EstateVisualisation({ config, lastChanged }: { config: Config; lastChanged: string }) {
  const estate = useMemo(() => deriveEstate(config), [config]);
  const summary = useMemo(() => deriveSummary(config), [config]);
  const [summaryKey, setSummaryKey] = useState(0);

  useEffect(() => {
    setSummaryKey((k) => k + 1);
  }, [config.landSize, config.terrain, config.discipline, config.budget]);

  const sizeKey = config.landSize < 6000 ? "small" : config.landSize < 14000 ? "medium" : "large";

  const primaryKey = useMemo(() => {
    switch (lastChanged) {
      case "terrain": return `terrain:${config.terrain}`;
      case "discipline": return `discipline:${config.discipline}`;
      case "budget": return `budget:${config.budget}`;
      default: return `size:${sizeKey}`;
    }
  }, [lastChanged, config.terrain, config.discipline, config.budget, sizeKey]);

  const allKeys = Object.keys(VARIANT_MAP);

  return (
    <div className="relative">
      {/* Estate image — single active variant with crossfade */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[5/6] overflow-hidden">
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
                filter: "brightness(0.38) saturate(0.68)",
                transform: isActive ? "scale(1.0)" : "scale(1.03)",
                transition: `opacity ${DURATION.crossfade}ms ${EASE.cinematic}, transform 1200ms ${EASE.cinematic}`,
              }}
              loading="lazy"
              decoding="async"
            />
          );
        })}

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, hsl(var(--background) / 0.55) 100%)`,
          }}
        />
        <div className="absolute inset-0 grain-texture opacity-35" />

        {/* Minimal floating annotation — arena only */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 lg:p-12">
          <div className="space-y-3">
            <p
              className="font-serif text-xl sm:text-2xl lg:text-3xl text-foreground/40 tracking-[-0.01em]"
              style={{ transition: `all ${DURATION.crossfade}ms ${EASE.cinematic}` }}
            >
              {estate.arenaLabel}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-6 h-px bg-accent/8" />
              <p
                className="font-mono text-[8px] uppercase tracking-[0.3em] text-accent/12"
                style={{ transition: `all ${DURATION.crossfade}ms ${EASE.cinematic}` }}
              >
                {estate.stableCount} stall · {estate.stableLayout}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Single summary phrase */}
      <div className="mt-8 px-1">
        <p
          key={summaryKey}
          className="font-serif text-[13px] sm:text-[14px] italic text-foreground/18 leading-[1.9]"
          style={{
            opacity: 0,
            animation: `fadeInUp 600ms ${EASE.cinematic} 150ms forwards`,
          }}
        >
          {summary}
        </p>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
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
      <section className="relative py-32 sm:py-40 lg:py-48 overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="section-container max-w-5xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <h1
              className="font-serif font-light text-foreground/80 leading-[1.05] mb-6"
              style={{ fontSize: "clamp(2rem, 1rem + 4vw, 3.5rem)" }}
            >
              Visualise Your Project
            </h1>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={150}>
            <p className="font-serif text-[15px] italic text-foreground/16 tracking-[0.02em]">
              Configured to your land, not forced onto it.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Simulator */}
      <section className="relative pb-32 sm:pb-40 lg:pb-48 overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-25" />
        <div className="section-container max-w-6xl mx-auto relative z-[1]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 lg:gap-16">
            {/* ── Image-led output (primary) ── */}
            <div className="order-2 lg:order-1">
              <EstateVisualisation config={config} lastChanged={lastChanged} />
            </div>

            {/* ── Quiet inputs (secondary) ── */}
            <div className="order-1 lg:order-2 space-y-12 lg:pt-4">
              {/* Land Size */}
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/20 mb-5">
                  Land Size
                </p>
                <div className="space-y-3">
                  <input
                    type="range"
                    min={2000}
                    max={25000}
                    step={500}
                    value={config.landSize}
                    onChange={(e) => updateConfig("landSize", Number(e.target.value))}
                    className="w-full accent-accent/30 h-px appearance-none bg-border/12 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent/30 [&::-webkit-slider-thumb]:border-0"
                  />
                  <p className="font-mono text-[10px] text-foreground/35 tabular-nums text-center">
                    {config.landSize.toLocaleString()} sqm
                  </p>
                </div>
              </div>

              {/* Terrain */}
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/20 mb-5">
                  Terrain
                </p>
                <div className="flex flex-col gap-2">
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
                <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/20 mb-5">
                  Discipline
                </p>
                <div className="flex flex-col gap-2">
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
                <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/20 mb-5">
                  Budget
                </p>
                <div className="flex flex-col gap-2">
                  {([
                    { key: "essential" as Budget, label: "Essential" },
                    { key: "elevated" as Budget, label: "Elevated" },
                    { key: "signature" as Budget, label: "Signature" },
                  ]).map((b) => (
                    <Chip key={b.key} label={b.label} active={config.budget === b.key} onClick={() => updateConfig("budget", b.key)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 sm:py-36 border-t border-border/6">
        <div className="absolute inset-0 grain-texture opacity-20" />
        <div className="section-container max-w-md mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-accent/12 mb-8">
              Every site begins with the ground
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
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
