import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, EyeOff, Check, X, AlertTriangle } from "lucide-react";

/**
 * Dev-only accessibility contrast checker.
 * Scans hero sections & CTA buttons for WCAG 2.1 AA/AAA compliance.
 * Toggle with the floating ♿ button (bottom-left) or Ctrl+Shift+A.
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
  return [255, 255, 255]; // default white
}

function isLargeText(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const size = parseFloat(style.fontSize);
  const weight = parseInt(style.fontWeight) || (style.fontWeight === "bold" ? 700 : 400);
  return size >= 24 || (size >= 18.66 && weight >= 700);
}

function scanElements(): ContrastResult[] {
  const results: ContrastResult[] = [];

  // Scan hero sections
  const heroes = document.querySelectorAll<HTMLElement>(
    'section:first-of-type, [class*="hero"], [class*="Hero"]'
  );
  heroes.forEach((hero) => {
    const textEls = hero.querySelectorAll<HTMLElement>("h1, h2, p, span, a");
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
        label: `${el.tagName.toLowerCase()}: "${text}"`,
        fgColor: style.color,
        bgColor: `rgb(${bg.join(", ")})`,
        ratio: Math.round(ratio * 100) / 100,
        level,
        isLargeText: large,
        rect: el.getBoundingClientRect(),
      });
    });
  });

  // Scan CTAs (buttons & links styled as buttons)
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

  // Deduplicate by element reference
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

// ── Component ────────────────────────────────────────

export function ContrastChecker() {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<ContrastResult[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const runScan = useCallback(() => {
    setResults(scanElements());
  }, []);

  // Keyboard shortcut: Ctrl+Shift+A
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

  // Re-scan when opened or page scrolls
  useEffect(() => {
    if (!isOpen) return;
    runScan();
    const onScroll = () => runScan();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen, runScan]);

  // Highlight hovered element
  useEffect(() => {
    if (hoveredIdx === null) return;
    const el = results[hoveredIdx]?.element;
    if (!el) return;
    el.style.outline = "3px solid hsl(35 75% 50%)";
    el.style.outlineOffset = "2px";
    return () => {
      el.style.outline = "";
      el.style.outlineOffset = "";
    };
  }, [hoveredIdx, results]);

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.level !== "FAIL").length,
    fail: results.filter((r) => r.level === "FAIL").length,
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
        aria-label={isOpen ? "Close contrast checker" : "Open contrast checker"}
        title="Accessibility Contrast Checker (Ctrl+Shift+A)"
      >
        {isOpen ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-20 left-16 z-[9998] w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-background shadow-2xl animate-fade-in"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-sm font-semibold text-foreground">Contrast Checker</h3>
              <button
                onClick={runScan}
                className="text-xs text-accent hover:underline"
              >
                Re-scan
              </button>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-muted-foreground">{summary.total} elements</span>
              <span className="text-green-600 font-medium">{summary.pass} pass</span>
              {summary.fail > 0 && (
                <span className="text-red-600 font-medium">{summary.fail} fail</span>
              )}
            </div>
          </div>

          {/* Results */}
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
                    {/* Level badge */}
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
                          <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                            Large
                          </span>
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

          {/* Footer */}
          <div className="sticky bottom-0 bg-background border-t border-border p-3">
            <div className="flex items-start gap-2 text-[10px] text-muted-foreground">
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
              <span>
                WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text (≥18pt bold or ≥24pt).
                AAA requires 7:1 / 4.5:1.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
