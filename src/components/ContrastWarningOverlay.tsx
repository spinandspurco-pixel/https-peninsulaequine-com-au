import { useState, useEffect, useCallback, useRef } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Real-time contrast warning overlay for header/footer elements.
 * Scans text elements inside <header> and <footer> and renders
 * floating warning badges on elements that fail WCAG AA contrast.
 *
 * Only active in development (import.meta.env.DEV).
 * Toggle with Ctrl+Shift+W.
 */

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
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

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

type Warning = {
  rect: DOMRect;
  ratio: number;
  text: string;
  zone: "header" | "footer";
};

function scanZone(container: HTMLElement, zone: "header" | "footer"): Warning[] {
  const warnings: Warning[] = [];
  const els = container.querySelectorAll<HTMLElement>("h1,h2,h3,h4,p,span,a,button,li");

  els.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) < 0.1) return;
    // Skip elements with children that contain text (avoid duplicates)
    if (el.children.length > 0 && !el.textContent?.trim()) return;

    const fg = parseColor(style.color);
    if (!fg) return;
    const bg = getEffectiveBg(el);
    const ratio = contrastRatio(fg, bg);
    const large = isLargeText(el);
    const threshold = large ? 3 : 4.5;

    if (ratio < threshold) {
      warnings.push({
        rect: el.getBoundingClientRect(),
        ratio: Math.round(ratio * 100) / 100,
        text: el.textContent?.trim().slice(0, 25) || el.tagName,
        zone,
      });
    }
  });

  return warnings;
}

export function ContrastWarningOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const rafRef = useRef<number>(0);

  // Toggle shortcut
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "W") {
        e.preventDefault();
        setEnabled((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const scan = useCallback(() => {
    const results: Warning[] = [];
    const header = document.querySelector<HTMLElement>("header");
    if (header) results.push(...scanZone(header, "header"));
    const footer = document.querySelector<HTMLElement>("footer");
    if (footer) results.push(...scanZone(footer, "footer"));
    setWarnings(results);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setWarnings([]);
      return;
    }

    // Scan on enable, scroll, resize, and periodically
    scan();
    const onUpdate = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(scan);
    };

    window.addEventListener("scroll", onUpdate, { passive: true });
    window.addEventListener("resize", onUpdate, { passive: true });
    const interval = setInterval(scan, 2000);

    return () => {
      window.removeEventListener("scroll", onUpdate);
      window.removeEventListener("resize", onUpdate);
      clearInterval(interval);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, scan]);

  if (!import.meta.env.DEV) return null;

  return (
    <>
      {/* Toggle indicator */}
      <button
        onClick={() => setEnabled((p) => !p)}
        className="fixed bottom-32 left-4 z-[9999] w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-border"
        style={{
          backgroundColor: enabled
            ? warnings.length > 0
              ? "hsl(0 70% 50%)"
              : "hsl(140 60% 40%)"
            : "hsl(30 20% 15%)",
          color: "hsl(45 40% 97%)",
        }}
        title={`Contrast warnings ${enabled ? "ON" : "OFF"} (Ctrl+Shift+W) ${warnings.length > 0 ? `— ${warnings.length} issue(s)` : ""}`}
        aria-label="Toggle contrast warnings"
      >
        <AlertTriangle className="w-5 h-5" />
        {enabled && warnings.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {warnings.length}
          </span>
        )}
      </button>

      {/* Warning badges rendered on failing elements */}
      {enabled &&
        warnings.map((w, i) => (
          <div
            key={`${w.zone}-${i}`}
            className="fixed z-[9998] pointer-events-none animate-fade-in"
            style={{
              top: w.rect.top - 2,
              left: w.rect.right + 4,
            }}
          >
            <div className="pointer-events-auto bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1 whitespace-nowrap">
              <AlertTriangle className="w-3 h-3" />
              {w.ratio}:1
              <span className="text-red-200 font-normal ml-0.5 max-w-[80px] truncate">
                {w.zone}
              </span>
            </div>
          </div>
        ))}

      {/* Summary bar when active with warnings */}
      {enabled && warnings.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[9997] bg-red-600/95 text-white text-xs text-center py-1.5 font-medium backdrop-blur-sm">
          ⚠ {warnings.length} contrast {warnings.length === 1 ? "failure" : "failures"} in{" "}
          {[...new Set(warnings.map((w) => w.zone))].join(" & ")} — WCAG AA requires 4.5:1
        </div>
      )}
    </>
  );
}
