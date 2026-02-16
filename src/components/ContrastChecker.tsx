import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, EyeOff, Check, X, AlertTriangle, Paintbrush, Wand2, ArrowRight, ClipboardCopy, FileText } from "lucide-react";

/**
 * Dev-only accessibility contrast checker + branding audit.
 * Toggle with the floating ♿ button (bottom-left) or Ctrl+Shift+A.
 *
 * Two tabs:
 *  1. Contrast – WCAG 2.1 AA/AAA scan of hero, header, footer, CTAs
 *  2. Brand – checks logo presence, alt text, and design-token consistency
 */

// ── Colour helpers ───────────────────────────────────

function parseColor(raw: string): [number, number, number] | null {
  const m = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  return null;
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

type WCAGLevel = "AAA" | "AA" | "FAIL";

function wcagLevel(ratio: number, isLargeText: boolean): WCAGLevel {
  if (isLargeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "FAIL";
  }
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "FAIL";
}

// ── Element scanning ─────────────────────────────────

type ContrastResult = {
  element: HTMLElement;
  label: string;
  fgColor: string;
  bgColor: string;
  ratio: number;
  level: WCAGLevel;
  isLargeText: boolean;
  rect: DOMRect;
};

function getEffectiveBg(el: HTMLElement): [number, number, number] {
  let current: HTMLElement | null = el;
  while (current) {
    const bg = window.getComputedStyle(current).backgroundColor;
    const parsed = parseColor(bg);
    if (parsed) {
      const alpha = bg.match(/rgba\([^)]+,\s*([\d.]+)\)/);
      if (!alpha || parseFloat(alpha[1]) > 0.1) return parsed;
    }
    current = current.parentElement;
  }
  return [255, 255, 255];
}

function isLargeText(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const size = parseFloat(style.fontSize);
  const weight = parseInt(style.fontWeight) || (style.fontWeight === "bold" ? 700 : 400);
  return size >= 24 || (size >= 18.66 && weight >= 700);
}

function scanElements(): ContrastResult[] {
  const results: ContrastResult[] = [];

  const addResults = (container: HTMLElement, prefix: string) => {
    const textEls = container.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, span, a, button");
    textEls.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) < 0.1) return;
      const fg = parseColor(style.color);
      if (!fg) return;
      const bg = getEffectiveBg(el);
      const ratio = contrastRatio(fg, bg);
      const large = isLargeText(el);
      const level = wcagLevel(ratio, large);
      const text = el.textContent?.trim().slice(0, 40) || el.tagName;
      results.push({
        element: el,
        label: `${prefix}${el.tagName.toLowerCase()}: "${text}"`,
        fgColor: style.color,
        bgColor: `rgb(${bg.join(", ")})`,
        ratio: Math.round(ratio * 100) / 100,
        level,
        isLargeText: large,
        rect: el.getBoundingClientRect(),
      });
    });
  };

  const header = document.querySelector<HTMLElement>("header");
  if (header) addResults(header, "Header › ");

  const heroes = document.querySelectorAll<HTMLElement>(
    'section:first-of-type, [class*="hero"], [class*="Hero"]'
  );
  heroes.forEach((hero) => addResults(hero, ""));

  const footer = document.querySelector<HTMLElement>("footer");
  if (footer) addResults(footer, "Footer › ");

  const ctas = document.querySelectorAll<HTMLElement>(
    'button, a[class*="button"], a[class*="btn"], [role="button"], a.bg-accent, a.bg-primary'
  );
  ctas.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) < 0.1) return;
    const fg = parseColor(style.color);
    if (!fg) return;
    const bg = getEffectiveBg(el);
    const ratio = contrastRatio(fg, bg);
    const large = isLargeText(el);
    const level = wcagLevel(ratio, large);
    const text = el.textContent?.trim().slice(0, 30) || "Button";
    results.push({
      element: el,
      label: `CTA: "${text}"`,
      fgColor: style.color,
      bgColor: `rgb(${bg.join(", ")})`,
      ratio: Math.round(ratio * 100) / 100,
      level,
      isLargeText: large,
      rect: el.getBoundingClientRect(),
    });
  });

  const seen = new Set<HTMLElement>();
  return results.filter((r) => {
    if (seen.has(r.element)) return false;
    seen.add(r.element);
    return true;
  });
}

// ── Badge colours ────────────────────────────────────

const levelStyles: Record<WCAGLevel, { bg: string; icon: typeof Check }> = {
  AAA: { bg: "bg-green-600", icon: Check },
  AA: { bg: "bg-amber-500", icon: Check },
  FAIL: { bg: "bg-red-600", icon: X },
};

// ── Branding Audit ───────────────────────────────────

const CANONICAL_ALT = "Peninsula Equine";
const LOGO_FILENAME = "logo-pe-mark";

type BrandCheck = {
  zone: string;
  check: string;
  pass: boolean;
  detail: string;
};

function runBrandAudit(): BrandCheck[] {
  const checks: BrandCheck[] = [];

  const zones: { name: string; selector: string }[] = [
    { name: "Header", selector: "header" },
    { name: "Footer", selector: "footer" },
    { name: "Page Header", selector: "section:first-of-type" },
  ];

  zones.forEach(({ name, selector }) => {
    const container = document.querySelector<HTMLElement>(selector);
    if (!container) {
      checks.push({ zone: name, check: "Zone present", pass: false, detail: `<${selector}> not found in DOM` });
      return;
    }

    // 1. Logo presence
    const logos = container.querySelectorAll<HTMLImageElement>("img");
    const brandLogos = Array.from(logos).filter((img) => img.src.includes(LOGO_FILENAME));
    const hasLogo = brandLogos.length > 0;
    checks.push({
      zone: name,
      check: "Logo present",
      pass: hasLogo,
      detail: hasLogo ? `Found ${brandLogos.length} rope-mark logo(s)` : "No rope-mark logo found",
    });

    // 2. Alt text consistency
    if (hasLogo) {
      const altTexts = brandLogos.map((img) => img.alt);
      const allMatch = altTexts.every((a) => a === CANONICAL_ALT);
      checks.push({
        zone: name,
        check: "Alt text matches",
        pass: allMatch,
        detail: allMatch
          ? `All logos use "${CANONICAL_ALT}"`
          : `Found: ${altTexts.map((a) => `"${a}"`).join(", ")} — expected "${CANONICAL_ALT}"`,
      });

      // 3. Missing alt
      const emptyAlt = brandLogos.filter((img) => !img.alt.trim());
      if (emptyAlt.length > 0) {
        checks.push({
          zone: name,
          check: "No empty alt",
          pass: false,
          detail: `${emptyAlt.length} logo(s) with empty alt attribute`,
        });
      }
    }

    // 4. All images have alt text
    const allImages = container.querySelectorAll<HTMLImageElement>("img");
    const missingAlt = Array.from(allImages).filter((img) => !img.alt.trim());
    checks.push({
      zone: name,
      check: "All images have alt",
      pass: missingAlt.length === 0,
      detail: missingAlt.length === 0
        ? `${allImages.length} image(s), all have alt text`
        : `${missingAlt.length}/${allImages.length} image(s) missing alt text`,
    });

    // 5. Serif font usage in headings
    const headings = container.querySelectorAll<HTMLElement>("h1, h2, h3, h4");
    const headingFonts = Array.from(headings).map((h) => {
      const ff = window.getComputedStyle(h).fontFamily;
      return { text: h.textContent?.trim().slice(0, 25) || h.tagName, hasSerif: /playfair/i.test(ff) };
    });
    const nonSerif = headingFonts.filter((h) => !h.hasSerif);
    if (headingFonts.length > 0) {
      checks.push({
        zone: name,
        check: "Headings use Playfair",
        pass: nonSerif.length === 0,
        detail: nonSerif.length === 0
          ? `${headingFonts.length} heading(s) use serif font`
          : `${nonSerif.length} heading(s) not using Playfair: ${nonSerif.map((h) => `"${h.text}"`).join(", ")}`,
      });
    }
  });

  return checks;
}

// ── Auto-Adjuster ───────────────────────────────────

type TokenFix = {
  token: string;
  label: string;
  original: string;
  adjusted: string;
  beforeRatio: number;
  afterRatio: number;
  applied: boolean;
};

/** Parse an HSL string like "30 15% 40%" into [h, s, l] numbers */
function parseHSL(value: string): [number, number, number] | null {
  const m = value.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!m) return null;
  return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
}

/** Convert HSL to RGB */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function hslStr(h: number, s: number, l: number): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

/** Check pairs of CSS tokens and suggest lightness adjustments for WCAG AA */

type TokenPairDef = { fg: string; bg: string; fgLabel: string; bgLabel: string; zone: "header" | "footer" | "core" };

const TOKEN_PAIRS: TokenPairDef[] = [
  // Core design system
  { fg: "--foreground", bg: "--background", fgLabel: "Body text", bgLabel: "Background", zone: "core" },
  { fg: "--card-foreground", bg: "--card", fgLabel: "Card text", bgLabel: "Card bg", zone: "core" },
  { fg: "--muted-foreground", bg: "--background", fgLabel: "Muted text", bgLabel: "Background", zone: "core" },
  { fg: "--muted-foreground", bg: "--card", fgLabel: "Muted text", bgLabel: "Card bg", zone: "core" },
  { fg: "--accent-foreground", bg: "--accent", fgLabel: "Accent button text", bgLabel: "Accent bg", zone: "core" },
  { fg: "--primary-foreground", bg: "--primary", fgLabel: "Primary btn text", bgLabel: "Primary bg", zone: "core" },
  { fg: "--popover-foreground", bg: "--popover", fgLabel: "Popover text", bgLabel: "Popover bg", zone: "core" },
  { fg: "--destructive-foreground", bg: "--destructive", fgLabel: "Destructive text", bgLabel: "Destructive bg", zone: "core" },
  // Header color system
  { fg: "--header-foreground", bg: "--header-bg", fgLabel: "Header text", bgLabel: "Header bg", zone: "header" },
  { fg: "--header-scrolled-foreground", bg: "--header-scrolled-bg", fgLabel: "Header scrolled text", bgLabel: "Header scrolled bg", zone: "header" },
  { fg: "--header-active", bg: "--header-bg", fgLabel: "Header active link", bgLabel: "Header bg", zone: "header" },
  { fg: "--header-active", bg: "--header-scrolled-bg", fgLabel: "Header active (scrolled)", bgLabel: "Header scrolled bg", zone: "header" },
  // Footer color system
  { fg: "--footer-foreground", bg: "--footer-bg", fgLabel: "Footer text", bgLabel: "Footer bg", zone: "footer" },
  { fg: "--footer-muted", bg: "--footer-bg", fgLabel: "Footer muted text", bgLabel: "Footer bg", zone: "footer" },
  { fg: "--footer-hover", bg: "--footer-bg", fgLabel: "Footer hover/link", bgLabel: "Footer bg", zone: "footer" },
];

type ReportEntry = {
  zone: "header" | "footer" | "core";
  label: string;
  fgToken: string;
  bgToken: string;
  fgHsl: string;
  bgHsl: string;
  ratio: number;
  level: WCAGLevel;
  pass: boolean;
};

function generateReport(): ReportEntry[] {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  return TOKEN_PAIRS.map((pair) => {
    const fgVal = style.getPropertyValue(pair.fg).trim();
    const bgVal = style.getPropertyValue(pair.bg).trim();
    const fgHsl = parseHSL(fgVal);
    const bgHsl = parseHSL(bgVal);
    if (!fgHsl || !bgHsl) {
      return { zone: pair.zone, label: `${pair.fgLabel} on ${pair.bgLabel}`, fgToken: pair.fg, bgToken: pair.bg, fgHsl: fgVal || "—", bgHsl: bgVal || "—", ratio: 0, level: "FAIL" as WCAGLevel, pass: false };
    }
    const fgRgb = hslToRgb(...fgHsl);
    const bgRgb = hslToRgb(...bgHsl);
    const ratio = Math.round(contrastRatio(fgRgb, bgRgb) * 100) / 100;
    const level = wcagLevel(ratio, false);
    return { zone: pair.zone, label: `${pair.fgLabel} on ${pair.bgLabel}`, fgToken: pair.fg, bgToken: pair.bg, fgHsl: fgVal, bgHsl: bgVal, ratio, level, pass: level !== "FAIL" };
  });
}

function reportToText(entries: ReportEntry[]): string {
  const now = new Date().toISOString();
  const headerEntries = entries.filter((e) => e.zone === "header");
  const footerEntries = entries.filter((e) => e.zone === "footer");
  const coreEntries = entries.filter((e) => e.zone === "core");
  const allPass = entries.every((e) => e.pass);

  const formatSection = (title: string, items: ReportEntry[]) => {
    if (items.length === 0) return "";
    const lines = items.map((e) => `  ${e.pass ? "✅" : "❌"} ${e.label} — ${e.ratio}:1 (${e.level})`);
    const sectionPass = items.every((e) => e.pass);
    return `\n── ${title} ${sectionPass ? "PASS ✅" : "FAIL ❌"} ──\n${lines.join("\n")}`;
  };

  return `CONTRAST AUDIT REPORT\nGenerated: ${now}\nOverall: ${allPass ? "PASS ✅" : "FAIL ❌"} (${entries.filter((e) => e.pass).length}/${entries.length} pairs pass AA)\n${formatSection("HEADER", headerEntries)}${formatSection("FOOTER", footerEntries)}${formatSection("CORE", coreEntries)}\n`;
}

function computeTokenFixes(): TokenFix[] {
  const root = document.documentElement;
  const style = getComputedStyle(root);

  const fixes: TokenFix[] = [];

  TOKEN_PAIRS.forEach(({ fg, bg, fgLabel, bgLabel }) => {
    const fgVal = style.getPropertyValue(fg).trim();
    const bgVal = style.getPropertyValue(bg).trim();
    const fgHsl = parseHSL(fgVal);
    const bgHsl = parseHSL(bgVal);
    if (!fgHsl || !bgHsl) return;

    const fgRgb = hslToRgb(...fgHsl);
    const bgRgb = hslToRgb(...bgHsl);
    const ratio = contrastRatio(fgRgb, bgRgb);

    if (ratio >= 4.5) return;

    const bgLum = relativeLuminance(bgRgb);
    let newL = fgHsl[2];
    const step = bgLum < 0.5 ? 2 : -2;

    for (let i = 0; i < 50; i++) {
      newL += step;
      if (newL < 0 || newL > 100) break;
      const testRgb = hslToRgb(fgHsl[0], fgHsl[1], newL);
      const testRatio = contrastRatio(testRgb, bgRgb);
      if (testRatio >= 4.5) break;
    }
    newL = Math.max(0, Math.min(100, newL));

    const adjustedVal = hslStr(fgHsl[0], fgHsl[1], newL);
    const adjustedRgb = hslToRgb(fgHsl[0], fgHsl[1], newL);
    const afterRatio = contrastRatio(adjustedRgb, bgRgb);

    if (afterRatio <= ratio) return;

    fixes.push({
      token: fg,
      label: `${fgLabel} on ${bgLabel}`,
      original: fgVal,
      adjusted: adjustedVal,
      beforeRatio: Math.round(ratio * 100) / 100,
      afterRatio: Math.round(afterRatio * 100) / 100,
      applied: false,
    });
  });

  return fixes;
}

// ── Component ────────────────────────────────────────

type Tab = "contrast" | "brand" | "fix" | "report";

export function ContrastChecker() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("contrast");
  const [results, setResults] = useState<ContrastResult[]>([]);
  const [brandChecks, setBrandChecks] = useState<BrandCheck[]>([]);
  const [tokenFixes, setTokenFixes] = useState<TokenFix[]>([]);
  const [reportEntries, setReportEntries] = useState<ReportEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const runScan = useCallback(() => {
    setResults(scanElements());
    setBrandChecks(runBrandAudit());
    setTokenFixes(computeTokenFixes());
    setReportEntries(generateReport());
    setCopied(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    runScan();
    const onScroll = () => runScan();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen, runScan]);

  useEffect(() => {
    if (hoveredIdx === null || tab !== "contrast") return;
    const el = results[hoveredIdx]?.element;
    if (!el) return;
    el.style.outline = "3px solid hsl(35 75% 50%)";
    el.style.outlineOffset = "2px";
    return () => {
      el.style.outline = "";
      el.style.outlineOffset = "";
    };
  }, [hoveredIdx, results, tab]);

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.level !== "FAIL").length,
    fail: results.filter((r) => r.level === "FAIL").length,
  };

  const brandSummary = {
    total: brandChecks.length,
    pass: brandChecks.filter((c) => c.pass).length,
    fail: brandChecks.filter((c) => !c.pass).length,
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="fixed bottom-20 left-4 z-[9999] w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-border"
        style={{
          backgroundColor: isOpen ? "hsl(35 75% 50%)" : "hsl(30 20% 15%)",
          color: isOpen ? "hsl(30 20% 10%)" : "hsl(45 40% 97%)",
        }}
        aria-label={isOpen ? "Close audit panel" : "Open audit panel"}
        title="Accessibility & Brand Audit (Ctrl+Shift+A)"
      >
        {isOpen ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-20 left-16 z-[9998] w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-background shadow-2xl animate-fade-in"
        >
          {/* Tab bar */}
          <div className="sticky top-0 bg-background border-b border-border z-10">
            <div className="flex">
              <button
                onClick={() => setTab("contrast")}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  tab === "contrast"
                    ? "text-accent border-b-2 border-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                Contrast
              </button>
              <button
                onClick={() => setTab("brand")}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  tab === "brand"
                    ? "text-accent border-b-2 border-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                Brand
                {brandSummary.fail > 0 && (
                  <span className="ml-1 bg-red-600 text-white text-[9px] px-1 py-0.5 rounded-full">{brandSummary.fail}</span>
                )}
              </button>
              <button
                onClick={() => setTab("fix")}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  tab === "fix"
                    ? "text-accent border-b-2 border-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                Fix
                {tokenFixes.filter((f) => !f.applied).length > 0 && (
                  <span className="ml-1 bg-amber-500 text-white text-[9px] px-1 py-0.5 rounded-full">
                    {tokenFixes.filter((f) => !f.applied).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTab("report")}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  tab === "report"
                    ? "text-accent border-b-2 border-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                Report
                {reportEntries.some((e) => !e.pass) && (
                  <span className="ml-1 bg-red-600 text-white text-[9px] px-1 py-0.5 rounded-full">
                    {reportEntries.filter((e) => !e.pass).length}
                  </span>
                )}
              </button>
            </div>
            {/* Sub-header stats */}
            <div className="px-4 py-2 flex items-center justify-between">
              {tab === "contrast" ? (
                <>
                  <span className="text-xs text-muted-foreground">{summary.total} elements</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-600 font-medium">{summary.pass} pass</span>
                    {summary.fail > 0 && <span className="text-red-600 font-medium">{summary.fail} fail</span>}
                  </div>
                </>
              ) : tab === "brand" ? (
                <>
                  <span className="text-xs text-muted-foreground">{brandSummary.total} checks</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-600 font-medium">{brandSummary.pass} pass</span>
                    {brandSummary.fail > 0 && <span className="text-red-600 font-medium">{brandSummary.fail} fail</span>}
                  </div>
                </>
              ) : tab === "report" ? (
                <>
                  <span className="text-xs text-muted-foreground">{reportEntries.length} token pairs</span>
                  <div className="flex gap-3 text-xs">
                    <span className={`font-medium ${reportEntries.every((e) => e.pass) ? "text-green-600" : "text-red-600"}`}>
                      {reportEntries.every((e) => e.pass) ? "ALL PASS" : `${reportEntries.filter((e) => !e.pass).length} FAIL`}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground">{tokenFixes.length} token pair(s)</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-600 font-medium">{tokenFixes.filter((f) => f.applied).length} applied</span>
                  </div>
                </>
              )}
              <button onClick={runScan} className="text-xs text-accent hover:underline">Re-scan</button>
            </div>
          </div>

          {/* Contrast tab */}
          {tab === "contrast" && (
            <div className="p-2 space-y-1">
              {results.length === 0 && (
                <p className="text-xs text-muted-foreground p-3 text-center">
                  No scannable elements found. Navigate to a page with hero sections or CTA buttons.
                </p>
              )}
              {results.map((r, i) => {
                const { bg, icon: Icon } = levelStyles[r.level];
                return (
                  <button
                    key={i}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => r.element.scrollIntoView({ behavior: "smooth", block: "center" })}
                    className="w-full text-left rounded-lg p-3 hover:bg-card transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <span className={`${bg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 mt-0.5`}>
                        <Icon className="w-3 h-3" />
                        {r.level}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground font-medium truncate">{r.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            Ratio: <strong className="text-foreground">{r.ratio}:1</strong>
                          </span>
                          {r.isLargeText && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">Large</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: r.fgColor }} />
                            <span className="text-[10px] text-muted-foreground">fg</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: r.bgColor }} />
                            <span className="text-[10px] text-muted-foreground">bg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Brand tab */}
          {tab === "brand" && (
            <div className="p-2 space-y-1">
              {brandChecks.length === 0 && (
                <p className="text-xs text-muted-foreground p-3 text-center">
                  No zones found to audit. Ensure the page has a header, footer, or page-header section.
                </p>
              )}
              {brandChecks.map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3 hover:bg-card transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`${c.pass ? "bg-green-600" : "bg-red-600"} text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 mt-0.5`}
                    >
                      {c.pass ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {c.pass ? "OK" : "FAIL"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground font-medium">
                        <span className="text-muted-foreground">{c.zone} ›</span> {c.check}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{c.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fix tab */}
          {tab === "fix" && (
            <div className="p-2 space-y-1">
              {tokenFixes.length === 0 && (
                <div className="p-4 text-center">
                  <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    All color token pairs pass WCAG AA contrast. No adjustments needed.
                  </p>
                </div>
              )}
              {tokenFixes.map((fix, i) => (
                <div key={i} className="rounded-lg p-3 hover:bg-card transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground font-medium">{fix.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{fix.token}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: `hsl(${fix.original})` }} />
                          <span className="text-[10px] text-muted-foreground">{fix.beforeRatio}:1</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: `hsl(${fix.adjusted})` }} />
                          <span className="text-[10px] text-green-600 font-medium">{fix.afterRatio}:1</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const root = document.documentElement;
                        if (fix.applied) {
                          root.style.setProperty(fix.token, fix.original);
                        } else {
                          root.style.setProperty(fix.token, fix.adjusted);
                        }
                        setTokenFixes((prev) =>
                          prev.map((f, j) => (j === i ? { ...f, applied: !f.applied } : f))
                        );
                      }}
                      className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                        fix.applied
                          ? "bg-green-600 text-white"
                          : "bg-accent/10 text-accent hover:bg-accent/20"
                      }`}
                    >
                      {fix.applied ? "Undo" : "Apply"}
                    </button>
                  </div>
                </div>
              ))}
              {tokenFixes.length > 0 && (
                <div className="px-3 pt-2 pb-1">
                  <button
                    onClick={() => {
                      const root = document.documentElement;
                      const allApplied = tokenFixes.every((f) => f.applied);
                      tokenFixes.forEach((fix) => {
                        root.style.setProperty(fix.token, allApplied ? fix.original : fix.adjusted);
                      });
                      setTokenFixes((prev) => prev.map((f) => ({ ...f, applied: !allApplied })));
                    }}
                    className="w-full text-xs font-medium py-2 px-3 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors"
                  >
                    {tokenFixes.every((f) => f.applied) ? "Revert All" : "Apply All Fixes"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Report tab */}
          {tab === "report" && (
            <div className="p-2 space-y-3">
              {/* Copy button */}
              <div className="px-2 pt-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(reportToText(reportEntries));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full text-xs font-medium py-2 px-3 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ClipboardCopy className="w-3.5 h-3.5" />
                  {copied ? "Copied to clipboard!" : "Copy Report to Clipboard"}
                </button>
              </div>

              {/* Overall verdict */}
              <div className={`mx-2 rounded-lg p-3 text-center ${reportEntries.every((e) => e.pass) ? "bg-green-600/10 border border-green-600/30" : "bg-red-600/10 border border-red-600/30"}`}>
                <p className={`text-sm font-bold ${reportEntries.every((e) => e.pass) ? "text-green-600" : "text-red-600"}`}>
                  {reportEntries.every((e) => e.pass) ? "✅ ALL PAIRS PASS AA" : "❌ CONTRAST FAILURES DETECTED"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {reportEntries.filter((e) => e.pass).length}/{reportEntries.length} token pairs meet WCAG AA 4.5:1
                </p>
              </div>

              {/* Sections */}
              {(["header", "footer", "core"] as const).map((zone) => {
                const items = reportEntries.filter((e) => e.zone === zone);
                if (items.length === 0) return null;
                const sectionPass = items.every((e) => e.pass);
                return (
                  <div key={zone} className="mx-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                        {zone === "core" ? "Core Tokens" : `${zone.charAt(0).toUpperCase() + zone.slice(1)} Tokens`}
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sectionPass ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                        {sectionPass ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {items.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-md p-2 hover:bg-card transition-colors">
                          <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${entry.pass ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                            {entry.level}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-foreground font-medium truncate">{entry.label}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: `hsl(${entry.fgHsl})` }} />
                                <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: `hsl(${entry.bgHsl})` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">{entry.ratio}:1</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-background border-t border-border p-3">
            <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
              <span>
                {tab === "contrast"
                  ? "WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text (≥18pt bold or ≥24pt). AAA requires 7:1 / 4.5:1."
                  : tab === "brand"
                  ? `Brand audit checks for rope-mark logo presence, consistent "${CANONICAL_ALT}" alt text, and Playfair Display in headings.`
                  : tab === "report"
                  ? "Report shows pass/fail status for all header, footer, and core token pairs. Copy to clipboard to share or archive."
                  : "Auto-adjuster modifies CSS custom properties in real-time. Changes are session-only — copy adjusted HSL values to index.css to persist."}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
