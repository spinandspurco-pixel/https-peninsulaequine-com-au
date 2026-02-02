import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEOSchema } from "@/components/SEOSchema";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import { PageTransition } from "@/components/PageTransition";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOSchema />
      <Header />
      <PageTransition>
        <main className="flex-1">{children}</main>
      </PageTransition>
      <Footer />
      <ScrollToTop />
      <FloatingContactButton />
    </div>
  );
}
