import { Layout } from "@/components/layout/Layout";
import { Download, Check, X as XIcon, Copy, Package, FileImage, Palette, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import logoPeMark from "@/assets/logo-pe-mark.png";
import logoPe from "@/assets/logo-pe.png";
import peBanner from "@/assets/pe-banner.png";
import heroSunset from "@/assets/hero-sunset.png";
import hatDetail from "@/assets/hat-detail.png";
import spurDetail from "@/assets/spur-detail.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintBarn from "@/assets/blueprint-barn.png";

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
    </Layout>
  );
}
