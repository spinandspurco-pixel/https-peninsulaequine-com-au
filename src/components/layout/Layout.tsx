import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEOSchema } from "@/components/SEOSchema";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";
import { GlobalCinematicBackdrop } from "@/components/GlobalCinematicBackdrop";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <SEOSchema />
      <GlobalCinematicBackdrop />
      {/* Skip-to-content link for keyboard users */}
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
      <ScrollToTop />
    </div>
  );
}
