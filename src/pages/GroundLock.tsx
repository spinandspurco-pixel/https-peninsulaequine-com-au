import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockSystemDiagram } from "@/components/GroundLockSystemDiagram";
import { BlueprintScene } from "@/components/BlueprintScene";
import {
  Truck,
  Calendar,
  ArrowRight,
  Layers,
  Info,
  ShieldCheck,
  HardHat,
  ArrowDown,
  Phone,
  FileText,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Constants ────────────────────────────────────── */
const PANEL_SIZE = 0.3364; // m² per panel
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
  {
    key: "yard",
    label: "Yard",
    defaultArea: 250,
    rates: { base: [90, 120], standard: [120, 180], premium: [180, 250] },
    description: "General-purpose equine yards & turnout areas",
  },
  {
    key: "stable",
    label: "Stable Surround",
    defaultArea: 150,
    rates: { base: [110, 140], standard: [140, 200], premium: [200, 280] },
    description: "High-traffic zones around stable entries & wash bays",
  },
  {
    key: "laneway",
    label: "Laneway",
    defaultArea: 400,
    rates: { base: [80, 110], standard: [110, 160], premium: [160, 230] },
    description: "Long, narrow access tracks & property laneways",
  },
  {
    key: "float",
    label: "Float Parking",
    defaultArea: 300,
    rates: { base: [100, 130], standard: [130, 190], premium: [190, 260] },
    description: "Heavy-load zones for float & truck parking",
  },
];

/* ── Interactive Cross-Section Visual ──────────────── */
function SystemCrossSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const layers = [
    { label: "Panel + Infill", depth: "75–100mm", text: "Interlocking structure distributes load and prevents surface breakdown.", accent: true },
    { label: "Bedding Layer", depth: "25–50mm", text: "Creates a stable, level base for long-term performance.", accent: false },
    { label: "Sub-Base", depth: "100–150mm", text: "Compacted aggregate allowing water to drain while maintaining strength.", accent: false },
    { label: "Geotextile", depth: "~1mm", text: "Separates layers to prevent contamination and movement.", accent: true },
    { label: "Subgrade", depth: "Native", text: "Trimmed & compacted native soil — the foundation of everything above.", accent: false },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 flex items-center gap-2 px-1">
        <Layers className="w-3 h-3" /> System Cross-Section
      </h3>
      <div className="space-y-1.5 relative">
        {layers.map((layer, i) => {
          const isActive = activeIndex === i;
          return (
            <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={80}>
              <button
                type="button"
                className={cn(
                  "w-full text-left flex items-center gap-4 p-3.5 border transition-all duration-500 cursor-pointer",
                  isActive
                    ? "bg-accent/8 border-accent/30 shadow-[0_0_20px_-6px_hsl(var(--accent)/0.15)]"
                    : layer.accent ? "bg-accent/[0.03] border-border/40" : "bg-card/50 border-border/40",
                )}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => setActiveIndex(isActive ? null : i)}
              >
                <div className="w-20 font-mono text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
                  {layer.depth}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-500",
                    isActive ? "text-accent" : "text-foreground/80"
                  )}>
                    {layer.label}
                  </p>
                  <div className={cn(
                    "overflow-hidden transition-all duration-500",
                    isActive ? "max-h-16 opacity-100 mt-1.5" : "max-h-0 opacity-0"
                  )}>
                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{layer.text}</p>
                  </div>
                </div>
                <div className={cn(
                  "w-0.5 h-5 rounded-full transition-all duration-500 shrink-0",
                  isActive ? "bg-accent/70" : "bg-border/50"
                )} />
              </button>
            </RevealOnScroll>
          );
        })}
        {/* Fall indicator */}
        <div className="absolute -right-2 top-4 bottom-16 flex flex-col items-center justify-center">
          <div className="w-px h-full bg-accent/20 relative">
            <ArrowDown className="w-3 h-3 text-accent/50 absolute -bottom-1 -left-[5px]" />
          </div>
          <span className="font-mono text-[8px] text-accent/40 mt-1 whitespace-nowrap">1–2% fall</span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/40 italic mt-6 px-1 leading-relaxed">
        Most properties fail from the ground up.<br />
        We start where it matters.
      </p>
    </div>
  );
}

/* ── Pricing Card ─────────────────────────────────── */
function PricingCard({
  tier,
  rate,
  low,
  high,
  featured,
}: {
  tier: string;
  rate: string;
  low: number;
  high: number;
  featured: boolean;
}) {
  return (
    <div
      className={cn(
        "relative p-6 border flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-lg",
        featured
          ? "border-accent/50 bg-accent/5 shadow-md ring-1 ring-accent/20"
          : "border-border bg-card"
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-mono text-[10px] font-bold px-3 py-1 uppercase whitespace-nowrap">
          Most Popular
        </span>
      )}
      <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
        {tier} Install
      </h4>
      <div className="mb-8">
        <p className="text-3xl font-serif font-bold text-foreground">{formatAUD(low)}</p>
        <p className="text-muted-foreground text-sm mt-1">to {formatAUD(high)}</p>
      </div>
      <div className="mt-auto pt-6 border-t border-border/50">
        <p className="text-[10px] font-mono text-muted-foreground uppercase">Rate per m²</p>
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

    // Header bar
    doc.setFillColor(...accent);
    doc.rect(0, 0, W, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("PENINSULA EQUINE — GROUNDLOCK™ ESTIMATE", W / 2, 8, { align: "center" });

    y = 28;
    doc.setTextColor(...dark);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("GroundLock™ Cost Estimate", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`, 20, y);
    y += 12;

    // Project details
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

    // Pricing table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text("Pricing Summary", 20, y);
    y += 8;

    const tiers = [
      { tier: "Base", rate: stats.rateLabels.base, low: stats.base.low, high: stats.base.high },
      { tier: "Standard", rate: stats.rateLabels.standard, low: stats.standard.low, high: stats.standard.high },
      { tier: "Premium", rate: stats.rateLabels.premium, low: stats.premium.low, high: stats.premium.high },
    ];

    // Table header
    doc.setFillColor(...accent);
    doc.rect(20, y, W - 40, 8, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("TIER", 25, y + 5.5);
    doc.text("RATE / m²", 80, y + 5.5);
    doc.text("ESTIMATED RANGE", 140, y + 5.5);
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

    // Materials
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

    // Disclaimer
    doc.setDrawColor(...accent);
    doc.line(20, y, W - 20, y);
    y += 6;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    const disclaimer = "Estimates are indicative only. Final pricing subject to site access, ground conditions, excavation depth, and regional freight costs. All prices in AUD excl. GST. Contact Peninsula Equine for an itemised site-specific quotation.";
    doc.text(disclaimer, 20, y, { maxWidth: W - 40 });

    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text("Phone: 0418 585 489  |  peninsulaequine.com.au  |  info@peninsulaequine.com.au", W / 2, y, { align: "center" });

    // Footer bar
    doc.setFillColor(...accent);
    doc.rect(0, 285, W, 12, "F");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("© Peninsula Equine — From Dirt to Dynasty", W / 2, 291, { align: "center" });

    doc.save(`PE-GroundLock-Estimate-${area}m2-${activeType.key}.pdf`);
  }, [area, stats, activeType]);


  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-40 sm:pt-48 pb-24 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 engineering-grid" />
        <div className="absolute inset-0 grain-texture" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--accent) / 0.02) 0%, transparent 70%)" }}
        />

        <div className="section-container relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center gap-8">
          <div
            className="flex items-center gap-5 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="w-8 h-px bg-accent/40" />
            <p className="text-overline text-accent/70">Proprietary System</p>
            <div className="w-8 h-px bg-accent/40" />
          </div>

          <h1
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "400ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            P.E. GroundLock™
          </h1>

          <p
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-muted-foreground/30 opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both" }}
          >
            Ground Stabilisation Systems
          </p>

          <p
            className="text-muted-foreground/45 text-sm sm:text-base max-w-md mx-auto opacity-0 animate-fade-in leading-[1.9]"
            style={{ animationDelay: "950ms", animationFillMode: "both" }}
          >
            Engineered stabilisation for equine yards, stable surrounds,
            float parking, laneways, and high-traffic zones.
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-44 sm:py-64 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.025]" />
        <div className="section-container max-w-xl mx-auto text-center relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/40 mx-auto mb-12" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-[0.01em] leading-[1.2] mb-14">
              Most Properties Fail<br />From the Ground Up
            </h2>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <div className="space-y-8 text-sm sm:text-[15px] text-muted-foreground/60 leading-[2] font-sans">
              <p>
                Drainage issues, unstable footing, and surface breakdown<br />
                are rarely surface problems.
              </p>
              <p className="text-foreground/60">
                They're structural.
              </p>
              <p className="text-foreground/35 italic">
                GroundLock™ is designed to solve that —<br />
                properly, from the base layer up.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Interactive System Diagram */}
      <section className="py-44 sm:py-64 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.025]" />
        <div className="section-container max-w-6xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <GroundLockSystemDiagram />
          </RevealOnScroll>
        </div>
      </section>

      {/* Estimator */}
      <section className="py-24 sm:py-36 bg-background">
        <div className="section-container">
          {/* Project Type Chips */}
          <div className="max-w-7xl mx-auto mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
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
                      ? "bg-accent text-accent-foreground border-accent shadow-md"
                      : "bg-card text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">{activeType.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">
            {/* Left Column — Input + Cross-Section */}
            <div className="lg:col-span-5 space-y-8">
              <RevealOnScroll direction="up" duration={700}>
                <div className="bg-card border border-border border-t-2 border-t-accent/50 p-6 md:p-8 shadow-lg">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
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
                        <span className="text-xl text-muted-foreground font-mono">m²</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
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

                  <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-mono">Timeline</p>
                        <p className="text-sm font-medium text-foreground">2–5 Days Onsite</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-sm">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-mono">Availability</p>
                        <p className="text-sm font-medium text-foreground">Rural Delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              
            </div>

            {/* Right Column — Pricing + Materials */}
            <div className="lg:col-span-7 space-y-6">
              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { tier: "Base", rate: stats.rateLabels.base, data: stats.base, featured: false },
                  { tier: "Standard", rate: stats.rateLabels.standard, data: stats.standard, featured: true },
                  { tier: "Premium", rate: stats.rateLabels.premium, data: stats.premium, featured: false },
                ].map(({ tier, rate, data, featured }) => (
                  <RevealOnScroll key={tier} direction="up" delay={featured ? 0 : 100}>
                    <PricingCard
                      tier={tier}
                      rate={rate}
                      low={data.low}
                      high={data.high}
                      featured={featured}
                    />
                  </RevealOnScroll>
                ))}
              </div>

              {/* Material Snapshot */}
              <RevealOnScroll direction="up" delay={200}>
                <div className="bg-card border border-border p-6 md:p-8 shadow-lg">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-6">
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
                        <p className="text-muted-foreground text-[10px] uppercase font-mono mb-1">
                          {mat.label}
                        </p>
                        <p className="text-xl font-bold text-foreground font-mono tabular-nums">
                          {mat.value}{" "}
                          <span className="text-xs font-normal text-muted-foreground">{mat.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>

              {/* CTAs */}
              <RevealOnScroll direction="up" delay={300}>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button asChild size="lg" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.1em] text-xs">
                    <Link to="/contact">
                      Book Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="flex-1">
                    <a href="tel:0418585489">
                      <Phone className="mr-2 h-4 w-4" /> Call 0418 585 489
                    </a>
                  </Button>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full mt-3 text-xs uppercase tracking-[0.1em] font-mono"
                  onClick={handleDownloadPDF}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Estimate PDF
                </Button>
              </RevealOnScroll>

              <p className="text-[10px] text-muted-foreground/60 font-mono leading-relaxed">
                *Estimates are indicative only. Final pricing subject to site access,
                ground conditions, excavation depth, and regional freight costs. All prices in AUD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scope & Variables */}
      <section className="py-24 sm:py-36 bg-card border-t border-border">
        <div className="section-container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <RevealOnScroll direction="up" stagger={0} staggerInterval={120}>
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" /> Included Scope
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground font-medium">
                  <li>• Subgrade preparation &amp; compaction</li>
                  <li>• Non-woven geotextile separation layer</li>
                  <li>• Crushed rock sub-base &amp; bedding</li>
                  <li>• P.E. GroundLock™ interlocking panel system</li>
                  <li>• Aggregate infill &amp; final consolidation</li>
                  <li>• Drainage-ready installation with site fall</li>
                </ul>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" stagger={1} staggerInterval={120}>
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-accent" /> Pricing Variables
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground font-medium">
                  <li>• Site access &amp; machinery requirements</li>
                  <li>• Existing ground conditions &amp; excavation depth</li>
                  <li>• Edge restraints, transitions &amp; finish detail</li>
                  <li>• Rural freight, haulage &amp; aggregate source</li>
                  <li>• Heavy-duty load class versus standard spec</li>
                </ul>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="up" stagger={2} staggerInterval={120}>
              <div className="bg-background p-6 border border-border">
                <p className="text-foreground/80 text-sm leading-relaxed italic font-serif">
                  "The GroundLock system isn't just about mud management; it's about
                  protecting the skeletal health of elite athletes through consistent,
                  engineered footing."
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase text-muted-foreground">
                  — Peninsula Equine Engineering Team
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-44 sm:py-64 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="absolute inset-0 bg-primary/92" />
        <div className="absolute inset-0 pointer-events-none grain-texture opacity-[0.03]" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(var(--primary)) 100%)" }} />

        <div className="section-container relative z-10 text-center max-w-lg mx-auto">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/40 mx-auto mb-12" />
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={80}>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-foreground tracking-[0.01em] leading-[1.2] mb-6">
              Request Site Assessment
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={150}>
            <p className="text-primary-foreground/40 text-sm leading-[1.8] max-w-sm mx-auto mb-10">
              We assess each property based on ground conditions,<br />
              use, and long-term performance.
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={250}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift px-10 py-3.5"
              >
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5 uppercase tracking-[0.14em] text-xs font-medium px-10 py-3.5"
              >
                <Link to="/groundlock">Estimate a Project</Link>
              </Button>
            </div>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={350}>
            <p className="text-primary-foreground/18 text-[11px] tracking-[0.15em]">
              We take on a limited number of projects each season.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <StickySubpageCTA ctaLabel="Request Assessment" ctaHref="/contact" />
    </Layout>
  );
}
