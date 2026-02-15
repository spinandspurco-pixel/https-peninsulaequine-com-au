import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEOSchema } from "@/components/SEOSchema";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import { PageTransition } from "@/components/PageTransition";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import blueprintFacility from "@/assets/blueprint-facility.png";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Site-wide subtle blueprint watermark */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
        style={{
          backgroundImage: `url(${blueprintFacility})`,
          backgroundSize: "120% auto",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Site-wide scroll-revealing blueprint line animation */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]">
        <BlueprintLineOverlay variant="dimensions" color="dark" />
      </div>
      <SEOSchema />
      <Header />
      <PageTransition>
        <main className="flex-1 relative z-[1]">{children}</main>
      </PageTransition>
      <Footer />
      <ScrollToTop />
      <FloatingContactButton />
    </div>
  );
}
