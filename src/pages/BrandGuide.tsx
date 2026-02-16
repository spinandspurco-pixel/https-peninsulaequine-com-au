import { Layout } from "@/components/layout/Layout";
import { Download, Check, X as XIcon, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import logoPeMark from "@/assets/logo-pe-mark.png";
import logoPe from "@/assets/logo-pe.png";
import peBanner from "@/assets/pe-banner.png";

/* ── Color palette pulled from design tokens ── */
const colorGroups = [
  {
    title: "Core Palette",
    colors: [
      { name: "Earth (Primary)", hsl: "30 20% 15%", hex: "#302821", token: "--primary" },
      { name: "Ivory (Background)", hsl: "45 40% 97%", hex: "#FAF8F3", token: "--background" },
      { name: "Gold (Accent)", hsl: "35 75% 50%", hex: "#DFA420", token: "--accent" },
      { name: "Sand (Secondary)", hsl: "38 30% 88%", hex: "#E8DFD0", token: "--secondary" },
    ],
  },
  {
    title: "Supporting Tones",
    colors: [
      { name: "Cream", hsl: "42 35% 95%", hex: "#F5F0E8", token: "--cream" },
      { name: "Gold Light", hsl: "40 65% 65%", hex: "#D4B06A", token: "--gold-light" },
      { name: "Gold Dark", hsl: "30 80% 38%", hex: "#AE6E12", token: "--gold-dark" },
      { name: "Muted Text", hsl: "30 15% 40%", hex: "#6B5E52", token: "--muted-foreground" },
    ],
  },
];

const typographyItems = [
  {
    name: "Playfair Display",
    role: "Headlines & Branding",
    className: "font-serif",
    sample: "From Dirt to Dynasty",
    weights: ["400 Regular", "600 Semibold", "700 Bold"],
  },
  {
    name: "Source Sans 3",
    role: "Body & UI",
    className: "font-sans",
    sample: "Expert equine facility construction by a horseman who understands what your horses need.",
    weights: ["300 Light", "400 Regular", "500 Medium", "600 Semibold"],
  },
];

const logoAssets = [
  { name: "P.E Rope Mark", src: logoPeMark, filename: "logo-pe-mark.png", desc: "Primary icon mark — rope circle with serif initials" },
  { name: "P.E Full Logo", src: logoPe, filename: "logo-pe.png", desc: "Full logo lockup with wordmark" },
  { name: "P.E Banner", src: peBanner, filename: "pe-banner.png", desc: "Wide banner — 'From Dirt to Dynasty' tagline" },
];

const usageRules = {
  do: [
    "Use the rope-mark logo on dark backgrounds with adequate contrast",
    "Maintain minimum clear space equal to the height of the 'P' initial",
    "Use the gold accent (#DFA420) for interactive highlights and CTAs",
    "Pair Playfair Display headlines with Source Sans 3 body text",
    "Keep imagery warm-toned and editorially composed",
  ],
  dont: [
    "Stretch, rotate, or distort the logo in any way",
    "Place the logo on busy or low-contrast backgrounds",
    "Use more than two typeface families in a single layout",
    "Replace gold accents with arbitrary bright colors",
    "Apply drop shadows or outer glows to the logo mark",
  ],
};

function ColorSwatch({ color }: { color: (typeof colorGroups)[0]["colors"][0] }) {
  const copyHex = () => {
    navigator.clipboard.writeText(color.hex);
    toast.success(`Copied ${color.hex}`);
  };

  return (
    <button
      onClick={copyHex}
      className="group flex flex-col rounded-lg overflow-hidden border border-border hover:shadow-md transition-shadow"
    >
      <div
        className="h-20 w-full relative"
        style={{ backgroundColor: color.hex }}
      >
        <Copy className="absolute top-2 right-2 h-4 w-4 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-3 bg-card text-left space-y-0.5">
        <p className="text-sm font-semibold text-foreground">{color.name}</p>
        <p className="text-xs font-mono text-muted-foreground">{color.hex}</p>
        <p className="text-xs text-muted-foreground/70">{color.token}</p>
      </div>
    </button>
  );
}

function DownloadCard({ asset }: { asset: (typeof logoAssets)[0] }) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = asset.src;
    link.download = asset.filename;
    link.click();
    toast.success(`Downloading ${asset.filename}`);
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="bg-primary flex items-center justify-center p-8 min-h-[160px]">
        <img src={asset.src} alt={asset.name} className="max-h-24 max-w-full object-contain" />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-serif text-lg font-semibold text-foreground">{asset.name}</h4>
          <p className="text-sm text-muted-foreground">{asset.desc}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
      </div>
    </div>
  );
}

export default function BrandGuide() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground pt-32 pb-20">
        <div className="section-container text-center space-y-4">
          <p className="text-accent uppercase tracking-[0.2em] text-sm font-sans">Brand Identity</p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold">Style Guide</h1>
          <p className="max-w-xl mx-auto text-primary-foreground/70 text-lg">
            Guidelines for maintaining a consistent, premium Peninsula Equine brand across every touchpoint.
          </p>
        </div>
      </section>

      {/* Color Palette */}
      <section className="py-20 bg-background">
        <div className="section-container space-y-12">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Color Palette</h2>
            <p className="text-muted-foreground max-w-2xl">
              Warm earth tones anchored by deep charcoal-brown and golden amber accents. Click any swatch to copy its hex value.
            </p>
          </div>
          {colorGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-sans text-sm uppercase tracking-[0.15em] text-muted-foreground mb-4">{group.title}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {group.colors.map((c) => (
                  <ColorSwatch key={c.token} color={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="py-20 bg-secondary/30">
        <div className="section-container space-y-12">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Typography</h2>
            <p className="text-muted-foreground max-w-2xl">
              Two typefaces create a refined editorial hierarchy — a distinctive serif for impact, paired with a clean sans-serif for readability.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {typographyItems.map((t) => (
              <div key={t.name} className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div>
                  <h3 className={`${t.className} text-2xl font-semibold text-foreground`}>{t.name}</h3>
                  <p className="text-sm text-accent font-sans uppercase tracking-wider">{t.role}</p>
                </div>
                <p className={`${t.className} text-xl text-foreground/80 leading-relaxed`}>{t.sample}</p>
                <div className="flex flex-wrap gap-2">
                  {t.weights.map((w) => (
                    <span key={w} className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">{w}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo Assets */}
      <section className="py-20 bg-background">
        <div className="section-container space-y-12">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Logo Assets</h2>
            <p className="text-muted-foreground max-w-2xl">
              Download approved logo files for print and digital use. Always use provided assets — never recreate the logo.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {logoAssets.map((a) => (
              <DownloadCard key={a.filename} asset={a} />
            ))}
          </div>
        </div>
      </section>

      {/* Usage Rules */}
      <section className="py-20 bg-secondary/30">
        <div className="section-container space-y-12">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Usage Rules</h2>
            <p className="text-muted-foreground max-w-2xl">
              Follow these guidelines to keep the brand consistent and professional across all applications.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Do */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-foreground">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-accent/20 text-accent">
                  <Check className="h-4 w-4" />
                </span>
                Do
              </h3>
              <ul className="space-y-3">
                {usageRules.do.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
            {/* Don't */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-foreground">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-destructive/20 text-destructive">
                  <XIcon className="h-4 w-4" />
                </span>
                Don't
              </h3>
              <ul className="space-y-3">
                {usageRules.dont.map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <XIcon className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing & Layout note */}
      <section className="py-20 bg-background">
        <div className="section-container space-y-8">
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Spacing & Tone</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="font-serif text-lg font-semibold text-foreground mb-2">Editorial Tone</h4>
              <p className="text-sm text-muted-foreground">
                Confident, warm, and knowledgeable. Speak as a craftsman and horseman — never salesy. Let the work speak through imagery.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="font-serif text-lg font-semibold text-foreground mb-2">Layout Rhythm</h4>
              <p className="text-sm text-muted-foreground">
                Generous whitespace, full-bleed hero imagery, and blueprint watermark textures create a sense of craft and intentionality.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="font-serif text-lg font-semibold text-foreground mb-2">Photography</h4>
              <p className="text-sm text-muted-foreground">
                Warm-toned, naturally lit. Favour action shots and textural close-ups (stonework, timber, sand). Avoid stock-photo aesthetics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
