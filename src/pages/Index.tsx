import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { ServicesHighlights } from "@/components/home/ServicesHighlights";
import { GalleryTeaser } from "@/components/home/GalleryTeaser";
import { TestimonialSection } from "@/components/home/TestimonialSection";
import { QuoteSection } from "@/components/home/QuoteSection";
import { LeadMagnetPopup } from "@/components/LeadMagnetPopup";

export default function Index() {
  return (
    <Layout>
      <LeadMagnetPopup />
      <HeroSection />
      <AboutTeaser />
      <ServicesHighlights />
      <GalleryTeaser />
      <TestimonialSection />
      <QuoteSection />
    </Layout>
  );
}
