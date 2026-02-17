import { Layout } from "@/components/layout/Layout";
import { Download, Check, X as XIcon, Copy, Package, FileImage, Palette, Type, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { QuickContactModal } from "@/components/QuickContactModal";
import { toast } from "sonner";
import logoPeMark from "@/assets/logo-pe-mark.png";
import logoPe from "@/assets/logo-pe.png";
import peBanner from "@/assets/pe-banner.png";
import heroSunset from "@/assets/hero-sunset.png";
import hatDetail from "@/assets/hat-detail.png";
import spurDetail from "@/assets/spur-detail.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintBarn from "@/assets/blueprint-barn.png";

import {
  brandColors,
  typographyRules,
  logoRules,
  usageRules,
} from "@/data/brand";

/* ── Color palette pulled from brand constants ── */
const colorGroups = [
  {
    title: "Core Palette",
    colors: [
      { name: "Navy (Primary)", hsl: brandColors.navy.hsl, hex: brandColors.navy.hex, token: brandColors.navy.token },
      { name: "Ivory (Background)", hsl: brandColors.ivory.hsl, hex: brandColors.ivory.hex, token: brandColors.ivory.token },
      { name: "Gold (Accent)", hsl: brandColors.gold.hsl, hex: brandColors.gold.hex, token: brandColors.gold.token },
      { name: "Slate (Secondary)", hsl: brandColors.navyLight.hsl, hex: brandColors.navyLight.hex, token: brandColors.navyLight.token },
    ],
  },
  {
    title: "Supporting Tones",
    colors: [
      { name: "Cream", hsl: brandColors.cream.hsl, hex: brandColors.cream.hex, token: brandColors.cream.token },
      { name: "Gold Light", hsl: brandColors.goldLight.hsl, hex: brandColors.goldLight.hex, token: brandColors.goldLight.token },
      { name: "Gold Dark", hsl: brandColors.goldDark.hsl, hex: brandColors.goldDark.hex, token: brandColors.goldDark.token },
      { name: "Muted Text", hsl: "221 15% 40%", hex: "#545E70", token: "--muted-foreground" },
    ],
  },
];

const typographyItems = [
  {
    name: typographyRules.serif.family,
    role: "Headlines & Section Titles",
    className: typographyRules.serif.tailwindClass,
    sample: "From Dirt to Dynasty",
    weights: ["400 Regular", "500 Medium", "600 Semibold", "700 Bold"],
    doNot: typographyRules.serif.doNot,
  },
  {
    name: typographyRules.sans.family,
    role: "Body, UI & Brand Name Text",
    className: typographyRules.sans.tailwindClass,
    sample: "Expert equine facility construction by a horseman who understands what your horses need.",
    weights: ["300 Light", "400 Regular", "500 Medium", "600 Semibold"],
    doNot: [],
  },
];

const logoAssets = [
  { name: "P.E Rope Mark (Monogram)", src: logoPeMark, filename: "logo-pe-mark.png", desc: logoRules.assets.monogram.description + " — " + logoRules.assets.monogram.use },
  { name: "P.E Full Logo (Wordmark)", src: logoPe, filename: "logo-pe.png", desc: logoRules.assets.wordmark.description + " — " + logoRules.assets.wordmark.use },
  { name: "P.E Banner", src: peBanner, filename: "pe-banner.png", desc: logoRules.assets.banner.description + " — " + logoRules.assets.banner.use },
];

const brandAssets = [
  { name: "P.E Rope Mark", src: logoPeMark, filename: "logo-pe-mark.png", category: "Logo" },
  { name: "P.E Full Logo", src: logoPe, filename: "logo-pe.png", category: "Logo" },
  { name: "P.E Banner", src: peBanner, filename: "pe-banner.png", category: "Logo" },
  { name: "Hero Sunset", src: heroSunset, filename: "hero-sunset.png", category: "Photography" },
  { name: "Hat Detail", src: hatDetail, filename: "hat-detail.png", category: "Photography" },
  { name: "Spur Detail", src: spurDetail, filename: "spur-detail.png", category: "Photography" },
  { name: "Blueprint Facility", src: blueprintFacility, filename: "blueprint-facility.png", category: "Blueprint" },
  { name: "Blueprint Barn", src: blueprintBarn, filename: "blueprint-barn.png", category: "Blueprint" },
];

// usageRules imported from @/data/brand

function ColorSwatch({ color }: { color: (typeof colorGroups)[0]["colors"][0] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyValue = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    toast.success(`Copied ${value}`);
    setTimeout(() => setCopied(null), 1500);
  };

  const isLight = color.hex === "#FAF8F3" || color.hex === "#F5F0E8" || color.hex === "#E8DFD0";

  return (
    <div className="group rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      {/* Swatch preview */}
      <button
        onClick={() => copyValue("hex", color.hex)}
        className="w-full h-28 sm:h-32 relative flex items-end p-3 cursor-pointer"
        style={{ backgroundColor: color.hex }}
      >
        <span className={`text-xs font-mono tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isLight ? "text-foreground/50" : "text-white/70"}`}>
          Click to copy
        </span>
        {copied === "hex" ? (
          <Check className={`absolute top-3 right-3 h-4 w-4 ${isLight ? "text-accent" : "text-white"}`} />
        ) : (
          <Copy className={`absolute top-3 right-3 h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity ${isLight ? "text-foreground/60" : "text-white/60"}`} />
        )}
      </button>

      {/* Info strip */}
      <div className="p-3 bg-card space-y-2">
        <p className="text-sm font-semibold text-foreground leading-tight">{color.name}</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => copyValue("hex", color.hex)}
            className="inline-flex items-center gap-1 text-[11px] font-mono bg-secondary hover:bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 transition-colors"
            title="Copy HEX"
          >
            {copied === "hex" ? <Check className="h-2.5 w-2.5 text-accent" /> : null}
            {color.hex}
          </button>
          <button
            onClick={() => copyValue("hsl", color.hsl)}
            className="inline-flex items-center gap-1 text-[11px] font-mono bg-secondary hover:bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 transition-colors"
            title="Copy HSL"
          >
            {copied === "hsl" ? <Check className="h-2.5 w-2.5 text-accent" /> : null}
            hsl
          </button>
          <button
            onClick={() => copyValue("token", color.token)}
            className="inline-flex items-center gap-1 text-[11px] font-mono bg-secondary hover:bg-secondary/80 text-muted-foreground rounded px-1.5 py-0.5 transition-colors"
            title="Copy CSS token"
          >
            {copied === "token" ? <Check className="h-2.5 w-2.5 text-accent" /> : null}
            var
          </button>
        </div>
      </div>
    </div>
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

function generateBrandKitHTML() {
  const colorRows = colorGroups.flatMap((g) =>
    g.colors.map(
      (c) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee"><div style="display:inline-block;width:24px;height:24px;border-radius:4px;background:${c.hex};vertical-align:middle;margin-right:8px;border:1px solid #ddd"></div>${c.name}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace">${c.hex}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;color:#888">${c.token}</td></tr>`
    )
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Peninsula Equine — Brand Kit</title>
<style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 24px;color:#1a1a1a;line-height:1.7}
h1{font-size:32px;margin-bottom:4px}h2{font-size:20px;margin-top:40px;border-bottom:2px solid #DFA420;padding-bottom:6px;color:#302821}
.meta{color:#888;font-size:13px;margin-bottom:32px}table{width:100%;border-collapse:collapse;margin:16px 0}
th{text-align:left;padding:8px 12px;background:#f5f5f0;border-bottom:2px solid #ddd;font-size:12px;text-transform:uppercase;letter-spacing:0.1em}
.rule{display:flex;align-items:flex-start;gap:8px;margin:6px 0;font-size:14px}
.do{color:#2a7a3f}.dont{color:#c0392b}
.footer{margin-top:48px;padding-top:16px;border-top:1px solid #ddd;font-size:12px;color:#999}
@media print{body{margin:0;padding:20px}}</style></head><body>
<h1>Peninsula Equine</h1>
<p class="meta">Brand Style Guide · Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
<h2>Color Palette</h2>
<table><thead><tr><th>Color</th><th>Hex</th><th>Token</th></tr></thead><tbody>${colorRows}</tbody></table>
<h2>Typography</h2>
${typographyItems.map((t) => `<p><strong>${t.name}</strong> — ${t.role}<br/><em>Weights: ${t.weights.join(", ")}</em></p>`).join("")}
<h2>Logo Assets</h2>
<p>Three approved logo files are included in the brand kit:</p>
<ul>${logoAssets.map((a) => `<li><strong>${a.name}</strong> (${a.filename}) — ${a.desc}</li>`).join("")}</ul>
<h2>Usage Rules</h2>
<h3 style="color:#2a7a3f">✓ Do</h3>
${usageRules.do.map((r) => `<div class="rule do">✓ ${r}</div>`).join("")}
<h3 style="color:#c0392b">✗ Don't</h3>
${usageRules.dont.map((r) => `<div class="rule dont">✗ ${r}</div>`).join("")}
<h2>Tone & Photography</h2>
<p><strong>Editorial Tone:</strong> Confident, warm, knowledgeable. Speak as a craftsman and horseman — never salesy.</p>
<p><strong>Photography:</strong> Warm-toned, naturally lit. Action shots and textural close-ups. No stock-photo aesthetics.</p>
<div class="footer">Peninsula Equine Brand Kit · peninsulaequine.com.au</div>
</body></html>`;
}

function downloadSingleAsset(asset: { src: string; filename: string }) {
  const link = document.createElement("a");
  link.href = asset.src;
  link.download = asset.filename;
  link.click();
}

async function downloadAllAssets() {
  // Download each asset with a small stagger to avoid browser blocking
  for (let i = 0; i < brandAssets.length; i++) {
    await new Promise((r) => setTimeout(r, 300));
    downloadSingleAsset(brandAssets[i]);
  }
  // Also download the brand kit HTML
  await new Promise((r) => setTimeout(r, 300));
  const html = generateBrandKitHTML();
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "peninsula-equine-brand-kit.html";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

const assetCategories = [...new Set(brandAssets.map((a) => a.category))];

export default function BrandGuide() {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadedAssets, setDownloadedAssets] = useState<Set<string>>(new Set());
  const [contactOpen, setContactOpen] = useState(false);
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                {t.doNot.length > 0 && (
                  <div className="mt-2 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-destructive/80 uppercase tracking-wider mb-1.5">Do Not</p>
                    <ul className="space-y-1">
                      {t.doNot.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <XIcon className="h-3 w-3 mt-0.5 text-destructive shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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

          {/* Logo Usage Rules */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-serif text-xl font-semibold text-foreground">Monogram vs Wordmark</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img src={logoPeMark} alt="Monogram" className="w-10 h-10 object-contain shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{logoRules.assets.monogram.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Use for: {logoRules.assets.monogram.use}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <img src={logoPe} alt="Wordmark" className="w-16 h-10 object-contain shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{logoRules.assets.wordmark.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Use for: {logoRules.assets.wordmark.use}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-serif text-xl font-semibold text-foreground">Clear Space & Sizing</h3>
              <p className="text-sm text-muted-foreground">{logoRules.clearSpace}</p>
              <div className="space-y-2 text-sm">
                <p className="text-foreground font-medium">Minimum sizes:</p>
                <p className="text-muted-foreground">Monogram: {logoRules.minSize.monogram.mobile}px mobile / {logoRules.minSize.monogram.desktop}px desktop</p>
                <p className="text-muted-foreground">Wordmark: {logoRules.minSize.wordmark.mobile}px mobile / {logoRules.minSize.wordmark.desktop}px desktop</p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-semibold text-destructive/80 uppercase tracking-wider mb-1.5">Prohibitions</p>
                <ul className="space-y-1">
                  {logoRules.prohibitions.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <XIcon className="h-3 w-3 mt-0.5 text-destructive shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download All Brand Assets */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="section-container space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <Package className="h-8 w-8 text-accent" />
            </div>
            <h2 className="font-serif text-3xl font-semibold mb-2">Download Brand Kit</h2>
            <p className="text-primary-foreground/70">
              Download all brand assets in one go — logos, photography, blueprints, plus a complete HTML style guide summary.
            </p>
          </div>

          {/* Download All Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="gap-3 bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.1em] text-sm px-10 py-6"
              disabled={downloadingAll}
              onClick={async () => {
                setDownloadingAll(true);
                toast.info("Downloading all brand assets…");
                await downloadAllAssets();
                setDownloadingAll(false);
                setDownloadedAssets(new Set(brandAssets.map((a) => a.filename)));
                toast.success(`Downloaded ${brandAssets.length + 1} files`);
              }}
            >
              <Download className="h-5 w-5" />
              {downloadingAll ? "Downloading…" : `Download All (${brandAssets.length + 1} files)`}
            </Button>
            <p className="text-xs text-primary-foreground/50 mt-3">
              Includes {brandAssets.length} image assets + 1 HTML brand guide summary
            </p>
          </div>

          {/* Asset grid by category */}
          <div className="space-y-8">
            {assetCategories.map((cat) => {
              const catAssets = brandAssets.filter((a) => a.category === cat);
              const CatIcon = cat === "Logo" ? FileImage : cat === "Blueprint" ? Palette : Type;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-4">
                    <CatIcon className="h-4 w-4 text-accent" />
                    <h3 className="text-sm uppercase tracking-[0.15em] text-primary-foreground/60 font-sans font-semibold">
                      {cat} ({catAssets.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {catAssets.map((asset) => {
                      const isDone = downloadedAssets.has(asset.filename);
                      return (
                        <button
                          key={asset.filename}
                          onClick={() => {
                            downloadSingleAsset(asset);
                            setDownloadedAssets((prev) => new Set(prev).add(asset.filename));
                            toast.success(`Downloading ${asset.filename}`);
                          }}
                          className="group rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-all overflow-hidden text-left"
                        >
                          <div className="aspect-[4/3] flex items-center justify-center p-3 bg-primary-foreground/5">
                            <img src={asset.src} alt={asset.name} className="max-h-16 max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="p-2.5 flex items-center justify-between gap-1">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-primary-foreground truncate">{asset.name}</p>
                              <p className="text-[10px] text-primary-foreground/40 font-mono truncate">{asset.filename}</p>
                            </div>
                            {isDone ? (
                              <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                            ) : (
                              <Download className="h-3.5 w-3.5 text-primary-foreground/40 group-hover:text-accent shrink-0 transition-colors" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Brand Kit HTML download */}
          <div className="text-center pt-4 border-t border-primary-foreground/10">
            <button
              onClick={() => {
                const html = generateBrandKitHTML();
                const blob = new Blob([html], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const win = window.open(url, "_blank");
                if (win) win.addEventListener("afterprint", () => URL.revokeObjectURL(url));
                setTimeout(() => URL.revokeObjectURL(url), 60000);
                toast.success("Brand kit summary opened");
              }}
              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors uppercase tracking-[0.1em] font-medium"
            >
              <FileImage className="h-4 w-4" />
              Open Printable Brand Kit Summary (HTML)
            </button>
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

      {/* Accessibility Checks */}
      <section className="py-20 bg-secondary/30">
        <div className="section-container space-y-10">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Accessibility Checks</h2>
            <p className="text-muted-foreground max-w-2xl">
              WCAG 2.1 contrast ratios for key brand color pairings. Aim for AA (≥4.5:1 normal text, ≥3:1 large text) or AAA (≥7:1).
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { fg: brandColors.ivory.hex, bg: brandColors.navy.hex, fgName: "Ivory", bgName: "Navy", ratio: 13.8, level: "AAA" as const },
              { fg: brandColors.gold.hex, bg: brandColors.navy.hex, fgName: "Gold", bgName: "Navy", ratio: 5.8, level: "AA" as const },
              { fg: brandColors.navy.hex, bg: brandColors.ivory.hex, fgName: "Navy", bgName: "Ivory", ratio: 13.8, level: "AAA" as const },
              { fg: brandColors.navy.hex, bg: brandColors.cream.hex, fgName: "Navy", bgName: "Cream", ratio: 14.2, level: "AAA" as const },
              { fg: "#545E70", bg: brandColors.ivory.hex, fgName: "Muted", bgName: "Ivory", ratio: 5.1, level: "AA" as const },
              { fg: brandColors.gold.hex, bg: brandColors.ivory.hex, fgName: "Gold", bgName: "Ivory", ratio: 2.4, level: "Fail" as const },
              { fg: brandColors.goldDark.hex, bg: brandColors.ivory.hex, fgName: "Gold Dark", bgName: "Ivory", ratio: 4.6, level: "AA" as const },
              { fg: brandColors.ivory.hex, bg: brandColors.gold.hex, fgName: "Ivory", bgName: "Gold", ratio: 2.4, level: "Fail" as const },
              { fg: brandColors.navy.hex, bg: brandColors.goldLight.hex, fgName: "Navy", bgName: "Gold Light", ratio: 8.9, level: "AAA" as const },
            ].map((pair, i) => {
              const badge =
                pair.level === "AAA"
                  ? "bg-accent/15 text-accent border-accent/30"
                  : pair.level === "AA"
                  ? "bg-blue-500/10 text-blue-700 border-blue-500/30"
                  : "bg-destructive/10 text-destructive border-destructive/30";
              return (
                <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
                  <div
                    className="flex items-center justify-center h-20 text-lg font-serif font-semibold tracking-wide"
                    style={{ backgroundColor: pair.bg, color: pair.fg }}
                  >
                    Aa Sample
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {pair.fgName} on {pair.bgName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{pair.ratio}:1</p>
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold uppercase tracking-wider border rounded-full px-2 py-0.5 ${badge}`}>
                      {pair.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg border border-border bg-card p-5 space-y-2">
            <h4 className="font-serif text-lg font-semibold text-foreground">Guidance</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                Use <strong className="text-foreground">Earth on Ivory/Sand</strong> for body text — exceeds AAA.
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <strong className="text-foreground">Gold accent</strong> meets AA on dark backgrounds — suitable for headlines and icons.
              </li>
              <li className="flex items-start gap-2">
                <XIcon className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                Avoid <strong className="text-foreground">Gold on Ivory</strong> for text — fails contrast. Use for decorative borders or large icons only.
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                Prefer <strong className="text-foreground">Gold Dark</strong> when gold text is needed on light backgrounds.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Responsive Spacing Guide */}
      <section className="py-20 bg-background">
        <div className="section-container space-y-12">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Responsive Spacing Guide</h2>
            <p className="text-muted-foreground max-w-2xl">
              Consistent vertical rhythm prevents element overlap on all screen sizes. Use named spacing tokens instead of arbitrary values.
            </p>
          </div>

          {/* Section Spacing Tokens */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-5">
            <h3 className="font-serif text-xl font-semibold text-foreground">Section Padding Tokens</h3>
            <p className="text-sm text-muted-foreground">Use these utility classes for vertical padding between major page sections. They scale responsively across breakpoints.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Class</th>
                    <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Mobile</th>
                    <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Tablet (sm)</th>
                    <th className="text-left py-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">Desktop (lg)</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-foreground/80">
                  {[
                    { cls: ".section-padding-sm", mobile: "40px", tablet: "64px", desktop: "96px" },
                    { cls: ".section-padding", mobile: "64px", tablet: "96px", desktop: "128px" },
                    { cls: ".section-padding-lg", mobile: "96px", tablet: "128px", desktop: "176px" },
                  ].map((row) => (
                    <tr key={row.cls} className="border-b border-border/50">
                      <td className="py-2.5 pr-4 text-accent font-semibold">{row.cls}</td>
                      <td className="py-2.5 pr-4">{row.mobile}</td>
                      <td className="py-2.5 pr-4">{row.tablet}</td>
                      <td className="py-2.5">{row.desktop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Content Gap Scale */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-5">
            <h3 className="font-serif text-xl font-semibold text-foreground">Content Gap Scale</h3>
            <p className="text-sm text-muted-foreground">Vertical rhythm utilities for content within sections. Stack classes set consistent <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">space-y</code> gaps.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { cls: ".stack-xs", size: "8px", use: "Tight UI groups (badge rows, icon+label)" },
                { cls: ".stack-sm", size: "16px", use: "Form fields, list items" },
                { cls: ".stack", size: "24px", use: "Default content blocks" },
                { cls: ".stack-md", size: "32–40px", use: "Subsections within a page section" },
                { cls: ".stack-lg", size: "48–64px", use: "Section intro blocks, major separations" },
              ].map((item) => (
                <div key={item.cls} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <code className="text-xs font-mono text-accent font-semibold whitespace-nowrap mt-0.5">{item.cls}</code>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{item.size}</p>
                    <p className="text-xs text-muted-foreground">{item.use}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Container Widths */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-5">
            <h3 className="font-serif text-xl font-semibold text-foreground">Container Widths</h3>
            <div className="space-y-3">
              {[
                { cls: ".section-container", width: "max-w-7xl (80rem)", use: "Default page sections" },
                { cls: ".section-container-narrow", width: "max-w-3xl (48rem)", use: "Text-heavy content, forms" },
                { cls: ".section-container-wide", width: "max-w-[1800px]", use: "Full-bleed galleries, dashboards" },
              ].map((item) => (
                <div key={item.cls} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-3 rounded-lg bg-secondary/30">
                  <code className="text-xs font-mono text-accent font-semibold whitespace-nowrap">{item.cls}</code>
                  <span className="text-xs text-foreground font-medium">{item.width}</span>
                  <span className="text-xs text-muted-foreground">— {item.use}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">All containers include responsive horizontal padding: <code className="bg-secondary px-1 py-0.5 rounded">px-4 sm:px-6 lg:px-8</code>.</p>
          </div>

          {/* Anti-Overlap Rules */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                <Check className="h-5 w-5 text-accent" />
                Do
              </h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                {[
                  "Use section-padding classes for all major section spacing",
                  "Scale padding down on mobile with responsive prefixes (pb-20 sm:pb-24)",
                  "Stack CTA groups with flex-col on mobile, flex-row on sm+",
                  "Use gap-3 on mobile, gap-4 on sm+ for button clusters",
                  "Reduce logo/heading margins on small screens (mb-6 sm:mb-8)",
                  "Test at 375px width — the smallest supported viewport",
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                <XIcon className="h-5 w-5 text-destructive" />
                Don't
              </h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                {[
                  "Use fixed pixel values for section padding — always use tokens",
                  "Place absolute-positioned elements without bottom/top safe zones",
                  "Overlap a scroll indicator with inline CTA text (keep ≥ 48px gap)",
                  "Use identical spacing at all breakpoints for sections > 200px tall",
                  "Nest multiple pb/pt overrides — use a single section-padding class instead",
                  "Ignore the hero pb value when content grows — test with long A/B copy variants",
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XIcon className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-secondary/30">
        <div className="section-container text-center max-w-xl mx-auto space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-foreground">Need Brand Assets or Have Questions?</h2>
          <p className="text-muted-foreground text-sm">
            Get in touch for custom asset formats, co-branding guidelines, or any brand-related inquiries.
          </p>
          <Button
            size="lg"
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.1em] text-sm px-8"
            onClick={() => setContactOpen(true)}
          >
            <MessageCircle className="h-4 w-4" />
            Contact Us
          </Button>
        </div>
      </section>

      <QuickContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </Layout>
  );
}
