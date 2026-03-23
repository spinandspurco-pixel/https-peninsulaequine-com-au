import { useState, useCallback, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════
   VERIFIED ASSET IMPORTS — 9 states × 2 views = 18 core
   + 3 terrain overlays = 21 total
   ═══════════════════════════════════════════════════════ */

// Small × Discipline
import sim_small_performance_topdown from "@/assets/sim/sim_small_performance_topdown.jpg";
import sim_small_performance_oblique from "@/assets/sim/sim_small_performance_oblique.jpg";
import sim_small_reining_topdown from "@/assets/sim/sim_small_reining_topdown.jpg";
import sim_small_reining_oblique from "@/assets/sim/sim_small_reining_oblique.jpg";
import sim_small_mixed_topdown from "@/assets/sim/sim_small_mixed_topdown.jpg";
import sim_small_mixed_oblique from "@/assets/sim/sim_small_mixed_oblique.jpg";

// Medium × Discipline
import sim_medium_performance_topdown from "@/assets/sim/sim_medium_performance_topdown.jpg";
import sim_medium_performance_oblique from "@/assets/sim/sim_medium_performance_oblique.jpg";
import sim_medium_reining_topdown from "@/assets/sim/sim_medium_reining_topdown.jpg";
import sim_medium_reining_oblique from "@/assets/sim/sim_medium_reining_oblique.jpg";
import sim_medium_mixed_topdown from "@/assets/sim/sim_medium_mixed_topdown.jpg";
import sim_medium_mixed_oblique from "@/assets/sim/sim_medium_mixed_oblique.jpg";

// Large × Discipline
import sim_large_performance_topdown from "@/assets/sim/sim_large_performance_topdown.jpg";
import sim_large_performance_oblique from "@/assets/sim/sim_large_performance_oblique.jpg";
import sim_large_reining_topdown from "@/assets/sim/sim_large_reining_topdown.jpg";
import sim_large_reining_oblique from "@/assets/sim/sim_large_reining_oblique.jpg";
import sim_large_mixed_topdown from "@/assets/sim/sim_large_mixed_topdown.jpg";
import sim_large_mixed_oblique from "@/assets/sim/sim_large_mixed_oblique.jpg";

// Terrain overlays
import sim_terrain_flat from "@/assets/sim/sim_terrain_flat.jpg";
import sim_terrain_gentle from "@/assets/sim/sim_terrain_gentle.jpg";
import sim_terrain_complex from "@/assets/sim/sim_terrain_complex.jpg";

/* ═══════════════════════════════════════════════════════ */

type StatePair = { topdown: string; oblique: string };

const ASSET_REGISTRY: Record<string, StatePair> = {
  "small_performance":  { topdown: sim_small_performance_topdown,  oblique: sim_small_performance_oblique },
  "small_reining":      { topdown: sim_small_reining_topdown,      oblique: sim_small_reining_oblique },
  "small_mixed":        { topdown: sim_small_mixed_topdown,        oblique: sim_small_mixed_oblique },
  "medium_performance": { topdown: sim_medium_performance_topdown, oblique: sim_medium_performance_oblique },
  "medium_reining":     { topdown: sim_medium_reining_topdown,     oblique: sim_medium_reining_oblique },
  "medium_mixed":       { topdown: sim_medium_mixed_topdown,       oblique: sim_medium_mixed_oblique },
  "large_performance":  { topdown: sim_large_performance_topdown,  oblique: sim_large_performance_oblique },
  "large_reining":      { topdown: sim_large_reining_topdown,      oblique: sim_large_reining_oblique },
  "large_mixed":        { topdown: sim_large_mixed_topdown,        oblique: sim_large_mixed_oblique },
};

const ALL_STATE_KEYS = Object.keys(ASSET_REGISTRY);

const TERRAIN_REGISTRY: Record<string, string> = {
  flat: sim_terrain_flat,
  gentle: sim_terrain_gentle,
  complex: sim_terrain_complex,
};

/* ═══════════════════════════════════════════════════════
   TYPES & CONFIG
   ═══════════════════════════════════════════════════════ */

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
  terrain: "flat",
  discipline: "mixed",
  budget: "elevated",
};

/* ── Timing constants ── */
const T = {
  baseCrossfade: 1100,
  baseScale: 1400,
  terrainFade: 180,
  budgetTone: 600,
};

function getSizeKey(landSize: number): LandSize {
  if (landSize < 6000) return "small";
  if (landSize < 14000) return "medium";
  return "large";
}

function getStateKey(landSize: number, discipline: Discipline): string {
  return `${getSizeKey(landSize)}_${discipline}`;
}

/* ── Derived estate specs ────────────────────────────── */
function deriveEstate(config: Config) {
  const { landSize, discipline } = config;
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

/* ── Budget-specific planning summaries ───── */
const BUDGET_SUMMARIES: Record<Budget, string> = {
  essential: "Smartly prioritised layout with disciplined circulation.",
  elevated: "Expanded presence with refined circulation and stable adjacency.",
  signature: "Full expression: arrival sequence, landscape framing, and support depth.",
};

function deriveSummary(config: Config): string {
  const { landSize, terrain, discipline, budget } = config;
  const budgetLine = BUDGET_SUMMARIES[budget];
  if (discipline === "performance" && landSize >= 14000)
    return "Arena-led estate with expanded training circuit. " + budgetLine;
  if (discipline === "reining")
    return "Configured for movement — rider flow and arena practicality. " + budgetLine;
  if (terrain === "complex")
    return "Engineered land response with elegant grading logic. " + budgetLine;
  if (landSize < 6000)
    return "Compact planning with premium circulation. " + budgetLine;
  if (landSize >= 14000)
    return "Expanded estate presence with greater arrival depth. " + budgetLine;
  return budgetLine;
}

const TERRAIN_LABELS: Record<Terrain, string> = {
  flat: "Level ground",
  gentle: "Gentle slope",
  complex: "Complex grade",
};

/* ═══════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════ */

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
      style={{ transition: `all ${T.budgetTone}ms ${EASE.cinematic}` }}
    >
      {label}
    </button>
  );
}

/* ── View toggle ──────────────────────────────────────── */
type ViewMode = "oblique" | "topdown";

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-4 justify-end mb-6">
      <div className="flex items-center gap-1">
        {(["oblique", "topdown"] as ViewMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "px-3 py-1.5 font-mono text-[7px] uppercase tracking-[0.3em] border transition-all",
              mode === m
                ? "border-accent/15 text-foreground/40 bg-accent/[0.03]"
                : "border-transparent text-muted-foreground/15 hover:text-muted-foreground/30"
            )}
            style={{ transition: `all ${T.budgetTone}ms ${EASE.cinematic}` }}
          >
            {m === "oblique" ? "Perspective" : "Plan"}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Preload all images ── */
function usePreloadImages() {
  useEffect(() => {
    ALL_STATE_KEYS.forEach((key) => {
      const pair = ASSET_REGISTRY[key];
      new Image().src = pair.topdown;
      new Image().src = pair.oblique;
    });
    Object.values(TERRAIN_REGISTRY).forEach((src) => {
      new Image().src = src;
    });
  }, []);
}

/* ── Visualisation panel ─────────────────────────────── */
function EstateVisualisation({ config }: { config: Config }) {
  const estate = useMemo(() => deriveEstate(config), [config]);
  const summary = useMemo(() => deriveSummary(config), [config]);
  const [summaryKey, setSummaryKey] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("oblique");

  const stateKey = getStateKey(config.landSize, config.discipline);

  useEffect(() => {
    setSummaryKey((k) => k + 1);
  }, [config.landSize, config.terrain, config.discipline, config.budget]);

  const budgetBrightness = config.budget === "signature" ? 0.42 : config.budget === "essential" ? 0.34 : 0.38;
  const budgetSaturate = config.budget === "signature" ? 0.76 : config.budget === "essential" ? 0.62 : 0.68;

  return (
    <div className="relative space-y-10">
      <ViewToggle mode={viewMode} onChange={setViewMode} />

      {/* ── Primary view ── */}
      <div className={cn(
        "relative overflow-hidden",
        viewMode === "oblique" ? "aspect-[16/10]" : "aspect-square"
      )} style={{ transition: `aspect-ratio 500ms ${EASE.cinematic}` }}>

        {/* Oblique layers — all rendered, opacity-switched for crossfade */}
        {ALL_STATE_KEYS.map((key) => (
          <img
            key={`oblique-${key}`}
            src={ASSET_REGISTRY[key].oblique}
            alt=""
            className="absolute inset-0 w-full h-full object-cover img-immersive"
            style={{
              opacity: viewMode === "oblique" && key === stateKey ? 1 : 0,
              transform: key === stateKey ? "scale(1.0)" : "scale(1.02)",
              filter: `brightness(${budgetBrightness}) saturate(${budgetSaturate})`,
              transition: `opacity ${T.baseCrossfade}ms ${EASE.cinematic}, transform ${T.baseScale}ms ${EASE.cinematic}, filter ${T.budgetTone}ms ${EASE.cinematic}`,
            }}
            loading="lazy"
            decoding="async"
          />
        ))}

        {/* Topdown layers */}
        {ALL_STATE_KEYS.map((key) => (
          <img
            key={`topdown-${key}`}
            src={ASSET_REGISTRY[key].topdown}
            alt=""
            className="absolute inset-0 w-full h-full object-cover img-immersive"
            style={{
              opacity: viewMode === "topdown" && key === stateKey ? 1 : 0,
              filter: "brightness(0.36) saturate(0.65)",
              transition: `opacity ${T.baseCrossfade}ms ${EASE.cinematic}`,
            }}
            loading="lazy"
            decoding="async"
          />
        ))}

        {/* Terrain overlays — topdown only */}
        {(["flat", "gentle", "complex"] as const).map((t) => (
          <img
            key={`terrain-${t}`}
            src={TERRAIN_REGISTRY[t]}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              opacity: viewMode === "topdown" && config.terrain === t ? 0.08 : 0,
              mixBlendMode: "screen",
              filter: "brightness(0.5) saturate(0.4)",
              transition: `opacity ${T.terrainFade}ms ${EASE.cinematic}`,
            }}
            loading="lazy"
            decoding="async"
          />
        ))}
        <div className="absolute inset-0" style={{
          background: viewMode === "oblique"
            ? `radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, hsl(var(--background) / 0.5) 100%)`
            : `radial-gradient(ellipse 85% 85% at 50% 50%, transparent 0%, hsl(var(--background) / 0.45) 100%)`,
        }} />
        <div className={cn("absolute inset-0 grain-texture", viewMode === "oblique" ? "opacity-30" : "opacity-35")} />

        {/* Oblique annotations */}
        <div className="absolute bottom-0 left-0 p-8 sm:p-10" style={{
          opacity: viewMode === "oblique" ? 1 : 0,
          transition: `opacity ${T.baseCrossfade}ms ${EASE.cinematic}`,
        }}>
          <p className="font-serif text-xl sm:text-2xl lg:text-3xl text-foreground/40 tracking-[-0.01em]">
            {estate.arenaLabel}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-5 h-px bg-accent/8" />
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-accent/12">
              {estate.stableCount} stall · {estate.stableLayout}
            </p>
          </div>
        </div>

        {/* Topdown annotations */}
        <div className="absolute top-0 left-0 p-6" style={{
          opacity: viewMode === "topdown" ? 1 : 0,
          transition: `opacity ${T.terrainFade}ms ${EASE.cinematic}`,
        }}>
          <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-accent/15">
            {TERRAIN_LABELS[config.terrain]}
          </p>
        </div>
        <div className="absolute bottom-0 right-0 p-6" style={{
          opacity: viewMode === "topdown" ? 1 : 0,
          transition: `opacity ${T.budgetTone}ms ${EASE.cinematic}`,
        }}>
          <p className="font-mono text-[7px] uppercase tracking-[0.3em] text-accent/10 text-right">
            {estate.surfaceType}
          </p>
        </div>
      </div>

      {/* ── Planning summary — always active ── */}
      <div className="px-1">
        <p
          key={summaryKey}
          className="font-serif text-[13px] sm:text-[14px] italic text-foreground/16 leading-[1.9]"
          style={{
            opacity: 0,
            animation: `fadeInUp 500ms ${EASE.cinematic} 100ms forwards`,
          }}
        >
          {summary}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */

export default function Visualise() {
  const [config, setConfig] = useState<Config>(DEFAULT);
  usePreloadImages();

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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 lg:gap-16">
            <div className="order-2 lg:order-1">
              <EstateVisualisation config={config} />
            </div>

            <div className="order-1 lg:order-2 space-y-12 lg:pt-4">
              {/* Land Size */}
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/20 mb-5">Land Size</p>
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
                <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/20 mb-5">Terrain</p>
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
                <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/20 mb-5">Discipline</p>
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
                <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/20 mb-5">Budget</p>
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