import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { OverlayNav } from "./OverlayNav";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSiteChrome } from "@/hooks/useSiteChrome";

/**
 * Minimalist global wayfinder rail.
 *
 *  - On lg+ screens: a 56px fixed left rail with a vertical PE mark, a 1px
 *    scroll-progress thread, and a bare hamburger glyph that opens the
 *    OverlayNav. No boxes, no borders.
 *  - Below lg: just the hamburger glyph in the top-left, which also opens
 *    the overlay.
 *  - Hidden on private / HQ / portal surfaces.
 *
 *  Scroll progress is written through a CSS custom property via rAF — never
 *  React state per frame.
 */
export function SiteRail() {
  const { showSiteRail } = useSiteChrome();
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const threadRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!showSiteRail) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? Math.min(Math.max(y / h, 0), 1) : 0;
        const t = threadRef.current;
        if (t) t.style.transform = `scaleY(${p})`;
        setPastHero(y > Math.min(window.innerHeight * 0.6, 480));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [showSiteRail]);

  if (!showSiteRail) return null;

  return (
    <>
      {/* Desktop rail */}
      <aside
        aria-label="Wayfinder"
        className="hidden lg:flex fixed top-0 left-0 z-[55] h-screen w-[56px] flex-col items-center justify-between py-8 pointer-events-none"
      >
        <Link
          to="/"
          className="pointer-events-auto font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/55 hover:text-foreground transition-colors duration-700"
          aria-label="Peninsula Equine — Home"
          style={{ writingMode: "vertical-rl" }}
        >
          PE — Mornington Peninsula
        </Link>

        {/* Scroll thread */}
        <div className="relative flex-1 mx-auto my-6 w-px overflow-hidden">
          <span className="absolute inset-0 bg-foreground/10" aria-hidden="true" />
          <span
            ref={threadRef}
            aria-hidden="true"
            className="absolute inset-0 bg-accent origin-top"
            style={{
              transform: "scaleY(0)",
              transition: reduce ? "none" : "transform 200ms linear",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Open navigation"
          className="pointer-events-auto group flex flex-col items-center gap-[5px] py-2"
        >
          <span className="block h-px w-5 bg-foreground/60 group-hover:bg-accent transition-all duration-500" />
          <span className="block h-px w-3 bg-foreground/60 group-hover:bg-accent transition-all duration-500 group-hover:w-5" />
          <span className="block h-px w-5 bg-foreground/60 group-hover:bg-accent transition-all duration-500" />
          <span className="sr-only">Menu</span>
        </button>
      </aside>

      {/* Mobile / post-scroll trigger — bare glyph, no box */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open navigation"
        className="fixed top-5 left-5 z-[55] lg:hidden flex flex-col items-start gap-[5px] py-2 px-2"
        style={{
          opacity: pastHero ? 1 : 0.85,
          transition: "opacity 500ms ease-out",
        }}
      >
        <span className="block h-px w-6 bg-foreground/70" />
        <span className="block h-px w-4 bg-foreground/70" />
        <span className="block h-px w-6 bg-foreground/70" />
        <span className="sr-only">Menu</span>
      </button>

      <OverlayNav open={open} onClose={() => setOpen(false)} />
    </>
  );
}
