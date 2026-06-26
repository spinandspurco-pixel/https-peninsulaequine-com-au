import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { OverlayNav } from "./OverlayNav";
import { useSiteChrome } from "@/hooks/useSiteChrome";

/**
 * Single global top chrome for public marketing surfaces.
 *
 *  - Top-left: brand wordmark linking home.
 *  - Top-right: single Menu trigger that opens the OverlayNav.
 *  - Optional decorative page indicator (PE / 0X — Section) sits centred on
 *    desktop only and is non-interactive.
 *
 *  No left vertical rail, no secondary hamburger. This is the ONLY primary
 *  nav system for desktop, tablet and mobile.
 *
 *  Hidden on private / HQ / portal surfaces via useSiteChrome.
 */

const PAGE_INDEX: Record<string, { code: string; label: string }> = {
  "/": { code: "00", label: "Index" },
  "/services": { code: "01", label: "Services" },
  "/selected-works": { code: "02", label: "Selected Works" },
  "/field-notes": { code: "03", label: "Field Notes" },
  "/about": { code: "04", label: "About" },
  "/contact": { code: "05", label: "Contact" },
};

function pageIndicatorFor(pathname: string) {
  if (PAGE_INDEX[pathname]) return PAGE_INDEX[pathname];
  // Match the closest top-level prefix
  const top = "/" + pathname.split("/").filter(Boolean)[0];
  return PAGE_INDEX[top] ?? null;
}

export function SiteRail() {
  const { showSiteRail } = useSiteChrome();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!showSiteRail) return;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showSiteRail]);

  if (!showSiteRail) return null;

  const indicator = pageIndicatorFor(pathname);

  return (
    <>
      {/* Top chrome — the only primary nav surface */}
      <header
        aria-label="Site chrome"
        className="fixed top-0 left-0 right-0 z-[55] pointer-events-none"
        style={{
          transition: "background-color 600ms cubic-bezier(0.45,0,0.15,1)",
          backgroundColor: scrolled ? "hsl(var(--background) / 0.55)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        }}
      >
        <div className="relative flex items-center justify-between px-5 sm:px-8 lg:px-10 h-[64px] sm:h-[72px]">
          {/* Brand mark — top left */}
          <Link
            to="/"
            aria-label="Peninsula Equine — Home"
            className="pointer-events-auto font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.45em] text-foreground/75 hover:text-foreground transition-colors duration-500"
          >
            Peninsula <span className="text-accent/80">Equine</span>
          </Link>

          {/* Decorative page indicator — desktop only, non-interactive */}
          {indicator && (
            <span
              aria-hidden="true"
              className="hidden lg:block absolute left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/35 select-none"
            >
              PE / {indicator.code} — {indicator.label}
            </span>
          )}

          {/* Single Menu trigger — top right */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="site-overlay-nav"
            aria-label="Menu — open navigation"
            className="pointer-events-auto group inline-flex items-center gap-2 py-2 -mr-1 px-2"
          >
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.42em] text-foreground/75 group-hover:text-foreground transition-colors duration-500">
              Menu
            </span>
            <span className="flex flex-col items-end gap-[5px]" aria-hidden="true">
              <span className="block h-px w-6 bg-foreground/65 group-hover:bg-accent transition-all duration-500" />
              <span className="block h-px w-4 bg-foreground/65 group-hover:bg-accent group-hover:w-6 transition-all duration-500" />
            </span>
          </button>
        </div>
      </header>

      <OverlayNav open={open} onClose={() => setOpen(false)} />
    </>
  );
}
