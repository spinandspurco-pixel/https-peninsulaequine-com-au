import { ReactNode, useEffect, useState, useRef } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEOSchema } from "@/components/SEOSchema";
import { PageTransition } from "@/components/PageTransition";
import { GlobalCinematicBackdrop } from "@/components/GlobalCinematicBackdrop";

interface LayoutProps {
  children: ReactNode;
}

/** Scroll progress bar — thin gold line across top of viewport */
function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const el = barRef.current;
        if (!el) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
        el.style.transform = `scaleX(${progress})`;
        el.style.opacity = progress > 0.01 ? "1" : "0";
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-[60] origin-left pointer-events-none"
      style={{ transform: "scaleX(0)", opacity: 0, transition: "opacity 200ms ease" }}
      aria-hidden="true"
    />
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOSchema />
      <GlobalCinematicBackdrop />
      <ScrollProgress />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md focus:bg-accent focus:text-accent-foreground focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <Header />
      <PageTransition>
        <main id="main-content" className="flex-1 relative z-[1]" tabIndex={-1}>{children}</main>
      </PageTransition>
      <Footer />
    </div>
  );
}
