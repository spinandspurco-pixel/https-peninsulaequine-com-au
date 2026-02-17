import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function wrap(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

// ── Header layout tests ─────────────────────────────────────

describe("Header spacing", () => {
  it("renders as fixed with z-50", () => {
    wrap(<Header />);
    const header = document.querySelector("header");
    expect(header).toBeInTheDocument();
    expect(header?.className).toMatch(/fixed/);
    expect(header?.className).toMatch(/z-50/);
  });

  it("has nav height classes for mobile clearance (h-16 sm:h-20)", () => {
    wrap(<Header />);
    const nav = document.querySelector("nav");
    expect(nav?.className).toMatch(/h-16/);
    expect(nav?.className).toMatch(/sm:h-20/);
  });

  it("hamburger button has aria-expanded=false by default", () => {
    wrap(<Header />);
    const btn = document.querySelector('button[aria-label="Open menu"]');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("mobile menu is hidden by default (max-h-0)", () => {
    wrap(<Header />);
    const mobileMenu = document.getElementById("mobile-menu");
    expect(mobileMenu).toBeInTheDocument();
    expect(mobileMenu?.className).toMatch(/max-h-0/);
  });
});

// ── Hero section spacing tests ──────────────────────────────

describe("Hero section spacing", () => {
  it("renders a full-height section with bottom padding", () => {
    wrap(<HeroSection />);
    const section = document.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section?.className).toMatch(/h-screen/);
    expect(section?.className).toMatch(/pb-/);
  });

  it("hero content wrapper has px-4 for 360px safety", () => {
    wrap(<HeroSection />);
    const contentDiv = document.querySelector(".z-10.text-center");
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv?.className).toMatch(/px-4/);
  });

  it("scroll indicator has bottom-6 minimum clearance", () => {
    wrap(<HeroSection />);
    const scrollBtn = document.querySelector('button[aria-label="Scroll to content"]');
    expect(scrollBtn).toBeInTheDocument();
    expect(scrollBtn?.className).toMatch(/bottom-6/);
  });

  it("CTA buttons stack vertically on mobile (flex-col then sm:flex-row)", () => {
    wrap(<HeroSection />);
    const clusters = document.querySelectorAll(".flex.flex-col");
    const ctaCluster = Array.from(clusters).find(
      (el) => el.className.includes("sm:flex-row") && el.querySelectorAll("button, a").length >= 2
    );
    expect(ctaCluster).toBeTruthy();
    expect(ctaCluster?.className).toMatch(/flex-col/);
    expect(ctaCluster?.className).toMatch(/sm:flex-row/);
  });
});

// ── Header + Hero z-index stacking ──────────────────────────

describe("Header + Hero z-index stacking", () => {
  it("header z-50 is above hero content z-10", () => {
    wrap(
      <>
        <Header />
        <HeroSection />
      </>
    );
    const header = document.querySelector("header");
    const heroContent = document.querySelector(".z-10.text-center");
    expect(header?.className).toMatch(/z-50/);
    expect(heroContent?.className).toMatch(/z-10/);
  });
});

// ── 360px edge-case tests ───────────────────────────────────

describe("360px edge-case safety", () => {
  it("hero section does not use fixed pixel widths that would overflow at 360px", () => {
    wrap(<HeroSection />);
    const section = document.querySelector("section");
    // Ensure no min-w- or w-[>360px] classes that could cause horizontal overflow
    expect(section?.className).not.toMatch(/min-w-\[/);
    expect(section?.className).not.toMatch(/w-\[\d{4,}/); // no 4+ digit fixed widths
  });

  it("hero content max-width is capped with max-w-lg for narrow viewports", () => {
    wrap(<HeroSection />);
    // The subtitle paragraph uses max-w-lg to prevent text overflow on small screens
    const subtitle = document.querySelector(".max-w-lg");
    expect(subtitle).toBeInTheDocument();
  });

  it("CTA buttons use responsive padding (px-10 won't overflow in flex-col)", () => {
    wrap(<HeroSection />);
    const buttons = document.querySelectorAll("button, a[class]");
    const ctaButtons = Array.from(buttons).filter((b) => b.className.includes("px-10"));
    // Buttons with px-10 must be inside a flex-col container on mobile so they stack
    ctaButtons.forEach((btn) => {
      const parent = btn.closest(".flex-col");
      expect(parent).toBeTruthy();
    });
  });

  it("header nav items are hidden on mobile (hidden lg:flex)", () => {
    wrap(<Header />);
    const desktopNav = document.querySelector(".hidden.lg\\:flex");
    expect(desktopNav).toBeInTheDocument();
  });

  it("header CTA buttons are hidden on mobile (hidden lg:flex)", () => {
    wrap(<Header />);
    // There should be at least 2 containers with hidden lg:flex (nav links + CTA buttons)
    const hiddenDesktop = document.querySelectorAll(".hidden.lg\\:flex");
    expect(hiddenDesktop.length).toBeGreaterThanOrEqual(2);
  });

  it("mobile menu provides touch-friendly tap targets (py-3 on links)", () => {
    wrap(<Header />);
    const mobileMenu = document.getElementById("mobile-menu");
    const links = mobileMenu?.querySelectorAll("a");
    // At least some mobile links should have py-3 for 48px+ tap targets
    const hasTapTargets = Array.from(links || []).some((l) => l.className.includes("py-3"));
    expect(hasTapTargets).toBe(true);
  });

  it("logo image has explicit width/height to prevent CLS on 360px", () => {
    wrap(<Header />);
    const logoImg = document.querySelector('img[alt="Peninsula Equine"]');
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("width");
    expect(logoImg).toHaveAttribute("height");
  });
});

// ── Container-query readiness tests ─────────────────────────

describe("Container-query readiness", () => {
  it("hero section uses overflow-hidden to contain children", () => {
    wrap(<HeroSection />);
    const section = document.querySelector("section");
    expect(section?.className).toMatch(/overflow-hidden/);
  });

  it("hero inner content uses relative positioning for container context", () => {
    wrap(<HeroSection />);
    const contentDiv = document.querySelector(".z-10.text-center");
    expect(contentDiv?.className).toMatch(/relative/);
  });

  it("header uses section-container for consistent inline padding", () => {
    wrap(<Header />);
    const container = document.querySelector("header .section-container");
    expect(container).toBeInTheDocument();
  });

  it("scroll-to-content button is absolutely positioned within hero", () => {
    wrap(<HeroSection />);
    const scrollBtn = document.querySelector('button[aria-label="Scroll to content"]');
    expect(scrollBtn?.className).toMatch(/absolute/);
    expect(scrollBtn?.className).toMatch(/left-1\/2/);
    expect(scrollBtn?.className).toMatch(/-translate-x-1\/2/);
  });
});
