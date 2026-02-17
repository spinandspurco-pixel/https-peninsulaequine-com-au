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
    // Find CTA cluster by looking for the flex-col container with buttons
    const clusters = document.querySelectorAll(".flex.flex-col");
    const ctaCluster = Array.from(clusters).find(
      (el) => el.className.includes("sm:flex-row") && el.querySelectorAll("button, a").length >= 2
    );
    expect(ctaCluster).toBeTruthy();
    expect(ctaCluster?.className).toMatch(/flex-col/);
    expect(ctaCluster?.className).toMatch(/sm:flex-row/);
  });
});

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
