import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEOSchema } from "@/components/SEOSchema";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import { PageTransition } from "@/components/PageTransition";
import { ContrastChecker } from "@/components/ContrastChecker";
import { ContrastWarningOverlay } from "@/components/ContrastWarningOverlay";
import { FloatingPEWatermark } from "@/components/FloatingPEWatermark";
import { ParallaxDepthToggle } from "@/components/ParallaxDepthToggle";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOSchema />
      <Header />
      <PageTransition>
        <main className="flex-1 relative z-[1]">{children}</main>
      </PageTransition>
      <Footer />
      <ScrollToTop />
      <FloatingContactButton />
      <StickySubpageCTA showAfter={400} ctaLabel="Get a Free Quote" ctaHref="/contact" />
      <FloatingPEWatermark />
      <ParallaxDepthToggle />
      <ContrastChecker />
      <ContrastWarningOverlay />
    </div>
  );
}
