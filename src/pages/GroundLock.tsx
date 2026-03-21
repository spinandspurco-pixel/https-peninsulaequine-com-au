import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockSystemDiagram } from "@/components/GroundLockSystemDiagram";
import { GroundLockSystemLayout } from "@/components/GroundLockSystemLayout";
import { GroundLockComparison } from "@/components/GroundLockComparison";
import {
  Truck,
  Calendar,
  ArrowRight,
  Layers,
  ShieldCheck,
  HardHat,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Constants ────────────────────────────────────── */
const PANEL_SIZE = 0.3364;
const formatAUD = (val: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(val);

type ProjectType = "yard" | "stable" | "laneway" | "float";

const PROJECT_TYPES: {
  key: ProjectType;
  label: string;
  defaultArea: number;
  rates: { base: [number, number]; standard: [number, number]; premium: [number, number] };
  description: string;
}[] = [
  { key: "yard", label: "Yard", defaultArea: 250, rates: { base: [90, 120], standard: [120, 180], premium: [180, 250] }, description: "General-purpose equine yards & turnout areas" },
  { key: "stable", label: "Stable Surround", defaultArea: 150, rates: { base: [110, 140], standard: [140, 200], premium: [200, 280] }, description: "High-traffic zones around stable entries & wash bays" },
  { key: "laneway", label: "Laneway", defaultArea: 400, rates: { base: [80, 110], standard: [110, 160], premium: [160, 230] }, description: "Long, narrow access tracks & property laneways" },
  { key: "float", label: "Float Parking", defaultArea: 300, rates: { base: [100, 130], standard: [130, 190], premium: [190, 260] }, description: "Heavy-load zones for float & truck parking" },
];

const APPLICATIONS = [
  {
    title: "Front Gate Entries",
    description: "First impression, engineered beneath. Stable under daily vehicle movement and seasonal weather.",
  },
  {
    title: "Float & Truck Access",
    description: "Load-rated for heavy vehicles, turning circles, and repeated float traffic without surface failure.",
  },
  {
    title: "Estate Driveways",
    description: "Premium stone or gravel finishes over a permanent structural base — built to match the property.",
  },
  {
    title: "High-Traffic Arrival Zones",
    description: "Yards, wash bays, and stable forecourts that hold up through constant use and weather extremes.",
  },
];

/* ── Pricing Card ─────────────────────────────────── */
function PricingCard({
  tier, rate, low, high, featured,
}: {
  tier: string; rate: string; low: number; high: number; featured: boolean;
}) {
  return (
    <div
      className={cn(
        "relative p-6 border flex flex-col transition-all duration-500 hover:-translate-y-0.5",
        featured
          ? "border-accent/40 bg-accent/[0.04] ring-1 ring-accent/15"
          : "border-border bg-card"
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-mono text-[9px] font-bold px-3 py-1 uppercase whitespace-nowrap">
          Most Common
        </span>
      )}
      <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-4">
        {tier}
      </h4>
      <div className="mb-8">
        <p className="text-3xl font-serif font-bold text-foreground">{formatAUD(low)}</p>
        <p className="text-muted-foreground/50 text-sm mt-1">to {formatAUD(high)}</p>
      </div>
      <div className="mt-auto pt-6 border-t border-border/30">
        <p className="text-[10px] font-mono text-muted-foreground/40 uppercase">Per m²</p>
        <p className="text-sm font-medium text-foreground">{rate}</p>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────── */
export default function GroundLock() {
  const [projectType, setProjectType] = useState<ProjectType>("yard");
  const activeType = PROJECT_TYPES.find((t) => t.key === projectType)!;
  const [area, setArea] = useState(activeType.defaultArea);

  const handleTypeChange = (type: ProjectType) => {
    setProjectType(type);
    const newType = PROJECT_TYPES.find((t) => t.key === type)!;
    setArea(newType.defaultArea);
  };

  const stats = useMemo(() => {
    const panels = Math.ceil(area / PANEL_SIZE);
    const r = activeType.rates;
    return {
      panels,
      base: { low: area * r.base[0], high: area * r.base[1] },
      standard: { low: area * r.standard[0], high: area * r.standard[1] },
      premium: { low: area * r.premium[0], high: area * r.premium[1] },
      rateLabels: {
        base: `$${r.base[0]}–${r.base[1]}`,
        standard: `$${r.standard[0]}–${r.standard[1]}`,
        premium: `$${r.premium[0]}–${r.premium[1]}`,
      },
      materials: {
        geotextile: (area * 1.08).toFixed(1),
        subBase: (area * 0.125).toFixed(1),
        bedding: (area * 0.035).toFixed(1),
        infill: (area * 0.085).toFixed(1),
      },
    };
  }, [area, activeType]);

  const handleAreaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(50, Math.min(5000, Number(e.target.value) || 50));
    setArea(val);
  };

  const handleDownloadPDF = useCallback(async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210;
    const accent: [number, number, number] = [193, 154, 72];
    const dark: [number, number, number] = [30, 30, 30];
    let y = 20;

    doc.setFillColor(...accent);
    doc.rect(0, 0, W, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("PENINSULA EQUINE — GROUNDLOCK™ PROJECT BRIEF", W / 2, 8, { align: "center" });

    y = 28;
    doc.setTextColor(...dark);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("GroundLock™ Investment Overview", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`, 20, y);
    y += 12;

    doc.setFillColor(245, 245, 240);
    doc.rect(15, y - 4, W - 30, 26, "F");
    doc.setTextColor(...dark);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PROJECT DETAILS", 20, y + 2);
    doc.setFont("helvetica", "normal");
    doc.text(`Type: ${activeType.label}`, 20, y + 10);
    doc.text(`Area: ${area.toLocaleString()} m²`, 80, y + 10);
    doc.text(`Panels: ${stats.panels.toLocaleString()}`, 140, y + 10);
    doc.text(activeType.description, 20, y + 18);
    y += 34;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text("Investment Summary", 20, y);
    y += 8;

    const tiers = [
      { tier: "Base", rate: stats.rateLabels.base, low: stats.base.low, high: stats.base.high },
      { tier: "Standard", rate: stats.rateLabels.standard, low: stats.standard.low, high: stats.standard.high },
      { tier: "Premium", rate: stats.rateLabels.premium, low: stats.premium.low, high: stats.premium.high },
    ];

    doc.setFillColor(...accent);
    doc.rect(20, y, W - 40, 8, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("TIER", 25, y + 5.5);
    doc.text("RATE / m²", 80, y + 5.5);
    doc.text("INVESTMENT RANGE", 140, y + 5.5);
    y += 8;

    doc.setTextColor(...dark);
    tiers.forEach((t, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 245);
        doc.rect(20, y, W - 40, 8, "F");
      }
      doc.setFont("helvetica", i === 1 ? "bold" : "normal");
      doc.setFontSize(9);
      doc.text(t.tier, 25, y + 5.5);
      doc.text(t.rate, 80, y + 5.5);
      doc.text(`${formatAUD(t.low)} – ${formatAUD(t.high)}`, 140, y + 5.5);
      y += 8;
    });

    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Estimated Material Volumes", 20, y);
    y += 8;

    const mats = [
      { label: "Geotextile", value: stats.materials.geotextile, unit: "m²" },
      { label: "Sub-Base (Crushed Rock)", value: stats.materials.subBase, unit: "m³" },
      { label: "Bedding Aggregate", value: stats.materials.bedding, unit: "m³" },
      { label: "Panel Infill", value: stats.materials.infill, unit: "m³" },
    ];

    mats.forEach((m) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(m.label, 25, y + 1);
      doc.setFont("helvetica", "bold");
      doc.text(`${m.value} ${m.unit}`, 140, y + 1);
      y += 7;
    });

    y += 10;

    doc.setDrawColor(...accent);
    doc.line(20, y, W - 20, y);
    y += 6;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    const disclaimer = "Indicative investment range only. Final specification subject to site access, ground conditions, excavation depth, and regional freight. All figures in AUD excl. GST. Contact Peninsula Equine for a site-specific project brief.";
    doc.text(disclaimer, 20, y, { maxWidth: W - 40 });

    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text("Phone: 0418 585 489  |  peninsulaequine.org  |  info@peninsulaequine.org", W / 2, y, { align: "center" });

    doc.setFillColor(...accent);
    doc.rect(0, 285, W, 12, "F");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("© Peninsula Equine — Built Properly. From the Ground Up.", W / 2, 291, { align: "center" });

    doc.save(`PE-GroundLock-Brief-${area}m2-${activeType.key}.pdf`);
  }, [area, stats, activeType]);


  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-44 sm:pt-52 pb-28 sm:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 engineering-grid" />
        <div className="absolute inset-0 grain-texture" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, hsl(var(--accent) / 0.02) 0%, transparent 65%)" }}
        />

        <div className="section-container relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center gap-8">
          <div
            className="flex items-center gap-5 opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            <div className="w-8 h-px bg-accent/30" />
            <Layers className="w-3.5 h-3.5 text-accent/50" strokeWidth={1.25} />
            <p className="text-overline text-accent/60">Engineered Entry System</p>
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1400ms" }}
          >
            P.E. GroundLock™
          </h1>

          <p
            className="text-muted-foreground/40 text-sm sm:text-[15px] max-w-lg mx-auto opacity-0 animate-fade-in leading-[1.9]"
            style={{ animationDelay: "1200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            A permanent sub-surface system for gates, driveways, and high-traffic
            equine entries — engineered for drainage, stability, and float-grade load.
          </p>
        </div>
      </section>

      {/* ═══ WHY GROUNDLOCK ═══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-44 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-16" width="w-8" />
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={100}>
              <p className="text-overline mb-6">Why It Exists</p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={150}>
              <h2 className="heading-section text-foreground mb-10">
                The Ground Fails First.
              </h2>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={200}>
              <div className="space-y-5 text-sm text-muted-foreground/45 leading-[2]">
                <p>
                  Mud after rain. Ruts under float wheels. Surface washout every winter.
                  Standard gravel and compacted earth can't hold up to real equine traffic.
                </p>
                <p className="text-foreground/55">
                  GroundLock resolves it beneath the surface — permanently.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ APPLICATIONS ═════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-16 sm:mb-24">
              <RevealOnScroll direction="up">
                <p className="text-overline mb-6">Where It Fits</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <h2 className="heading-section text-foreground">
                  Built for Real Properties
                </h2>
              </RevealOnScroll>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/10">
              {APPLICATIONS.map((app, i) => (
                <RevealOnScroll key={app.title} direction="up" delay={i * 80}>
                  <div className="bg-background p-8 sm:p-10 lg:p-12">
                    <h3 className="font-serif text-[17px] font-medium text-foreground mb-3">
                      {app.title}
                    </h3>
                    <p className="text-[13px] text-muted-foreground/40 leading-[1.9] max-w-xs">
                      {app.description}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — SYSTEM DIAGRAM ════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-48 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="text-center mb-20 sm:mb-28">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">How It Works</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  Five Layers. One System.
                </h2>
              </RevealOnScroll>
            </div>

            <RevealOnScroll direction="up" delay={200}>
              <GroundLockSystemDiagram />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON ═══════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-48 relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-16" width="w-10" />
            </RevealOnScroll>
            <GroundLockComparison />
          </div>
        </div>
      </section>

      {/* ═══ FINISH OPTIONS ═══════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 bg-card relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-3xl mx-auto text-center relative z-[1]">
            <RevealOnScroll direction="up">
              <p className="text-overline mb-6">Surface Finish</p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-10">
                The Structure Is Invisible.<br />
                <span className="text-muted-foreground/30">The Finish Is Everything.</span>
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-sm text-muted-foreground/45 leading-[2] max-w-md mx-auto mb-12">
                GroundLock accepts a range of surface finishes — from premium
                natural stone and decorative gravel to hardened aggregate and cobble detailing.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={200}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/10">
                {["Natural Stone", "Decorative Gravel", "Cobble Detail", "Compacted Aggregate"].map((finish) => (
                  <div key={finish} className="bg-background py-6 px-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
                      {finish}
                    </p>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={280}>
              <p className="text-[11px] text-muted-foreground/25 mt-8 leading-relaxed max-w-sm mx-auto">
                Concrete-capable and heavy-duty infill specifications available for commercial or council-grade applications.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ ESTIMATOR ════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1]">
            {/* Header */}
            <div className="text-center mb-16 sm:mb-24 max-w-md mx-auto">
              <RevealOnScroll direction="up">
                <RevealLine className="mx-auto mb-12" width="w-10" />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={80}>
                <p className="text-overline mb-6">Investment Overview</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <h2 className="heading-section text-foreground">
                  Indicative Specification
                </h2>
              </RevealOnScroll>
            </div>

            {/* Project Type Chips */}
            <div className="max-w-7xl mx-auto mb-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">
                Project Type
              </p>
              <div className="flex flex-wrap gap-2">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => handleTypeChange(type.key)}
                    className={cn(
                      "px-4 py-2 text-xs font-mono uppercase tracking-[0.1em] border transition-all duration-300",
                      projectType === type.key
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/30 mt-2 italic">{activeType.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">
              {/* Left Column — Input */}
              <div className="lg:col-span-5 space-y-8">
                <RevealOnScroll direction="up" duration={700}>
                  <div className="bg-card border border-border border-t-2 border-t-accent/40 p-6 md:p-8">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-2 block">
                          Project Area
                        </label>
                        <div className="flex items-baseline gap-2">
                          <input
                            type="number"
                            value={area}
                            onChange={handleAreaInput}
                            min={50}
                            max={5000}
                            className="bg-transparent font-serif text-4xl font-bold text-foreground outline-none w-28 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-xl text-muted-foreground/40 font-mono">m²</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-2 block">
                          Est. Panels
                        </label>
                        <div className="text-2xl font-mono text-foreground tabular-nums">
                          {stats.panels.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <Slider
                      value={[area]}
                      min={50}
                      max={5000}
                      step={10}
                      onValueChange={([val]) => setArea(val)}
                      className="py-4"
                    />

                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground/40 font-mono">Timeline</p>
                          <p className="text-sm font-medium text-foreground">2–5 Days Onsite</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-sm">
                          <Truck className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground/40 font-mono">Delivery</p>
                          <p className="text-sm font-medium text-foreground">Rural Available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              </div>

              {/* Right Column — Investment + Materials */}
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { tier: "Base", rate: stats.rateLabels.base, data: stats.base, featured: false },
                    { tier: "Standard", rate: stats.rateLabels.standard, data: stats.standard, featured: true },
                    { tier: "Premium", rate: stats.rateLabels.premium, data: stats.premium, featured: false },
                  ].map(({ tier, rate, data, featured }) => (
                    <RevealOnScroll key={tier} direction="up" delay={featured ? 0 : 100}>
                      <PricingCard tier={tier} rate={rate} low={data.low} high={data.high} featured={featured} />
                    </RevealOnScroll>
                  ))}
                </div>

                <RevealOnScroll direction="up" delay={200}>
                  <div className="bg-card border border-border p-6 md:p-8">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-6">
                      Estimated Material Volume
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                      {[
                        { label: "Geotextile", value: stats.materials.geotextile, unit: "m²" },
                        { label: "Sub-Base", value: stats.materials.subBase, unit: "m³" },
                        { label: "Bedding", value: stats.materials.bedding, unit: "m³" },
                        { label: "Infill", value: stats.materials.infill, unit: "m³" },
                      ].map((mat) => (
                        <div key={mat.label}>
                          <p className="text-muted-foreground/40 text-[10px] uppercase font-mono mb-1">
                            {mat.label}
                          </p>
                          <p className="text-xl font-bold text-foreground font-mono tabular-nums">
                            {mat.value}{" "}
                            <span className="text-xs font-normal text-muted-foreground/40">{mat.unit}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </RevealOnScroll>

                <RevealOnScroll direction="up" delay={300}>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button asChild variant="gold" size="lg" className="flex-1">
                      <Link to="/contact">
                        Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline-light"
                      className="flex-1 text-xs uppercase tracking-[0.1em] font-mono"
                      onClick={handleDownloadPDF}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download Project Brief
                    </Button>
                  </div>
                </RevealOnScroll>

                <p className="text-[10px] text-muted-foreground/30 font-mono leading-relaxed">
                  *Indicative investment range only. Final specification subject to site access,
                  ground conditions, excavation depth, and regional freight. All figures in AUD.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCOPE & VARIABLES ════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 bg-card relative">
          <div className="absolute inset-0 contour-texture" />
          <div className="section-container max-w-5xl mx-auto relative z-[1]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
              <RevealOnScroll direction="up">
                <div>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-6 flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-accent/50" strokeWidth={1.5} /> Included Scope
                  </h3>
                  <ul className="space-y-3 text-[13px] text-muted-foreground/50 leading-[1.8]">
                    <li>• Subgrade preparation & compaction</li>
                    <li>• Non-woven geotextile separation layer</li>
                    <li>• Crushed rock sub-base & bedding</li>
                    <li>• P.E. GroundLock™ interlocking panel system</li>
                    <li>• Aggregate infill & final consolidation</li>
                    <li>• Drainage-ready installation with site fall</li>
                  </ul>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={120}>
                <div>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-6 flex items-center gap-2.5">
                    <HardHat className="w-4 h-4 text-accent/50" strokeWidth={1.5} /> Specification Variables
                  </h3>
                  <ul className="space-y-3 text-[13px] text-muted-foreground/50 leading-[1.8]">
                    <li>• Site access & machinery requirements</li>
                    <li>• Existing ground conditions & excavation depth</li>
                    <li>• Edge restraints, transitions & finish detail</li>
                    <li>• Rural freight, haulage & aggregate source</li>
                    <li>• Heavy-duty load class versus standard spec</li>
                  </ul>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-32 sm:py-44 relative">
          <div className="absolute inset-0 engineering-grid" />
          <div className="absolute inset-0 grain-texture" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 45% at 50% 50%, transparent 15%, hsl(222 20% 3% / 0.5) 100%)" }}
          />

          <div className="section-container relative z-10 text-center max-w-md mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-16" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-8">
                Enquire About GroundLock
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-sm text-muted-foreground/35 mb-12 leading-[1.9]">
                Tell us about your entry, access, or arrival zone — we'll assess the site
                and specify the right system for how it actually performs.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={250}>
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Start a GroundLock Entry Plan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══ SYSTEM LAYOUT ════════════════════════════════ */}
      <GroundLockSystemLayout />


    </Layout>
  );
}
