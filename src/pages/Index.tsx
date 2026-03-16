import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { ServicesHighlights } from "@/components/home/ServicesHighlights";
import { ServiceTabsSection } from "@/components/home/ServiceTabsSection";
import { GalleryTeaser } from "@/components/home/GalleryTeaser";
import { TestimonialSection } from "@/components/home/TestimonialSection";
import { VideoTestimonialCarousel } from "@/components/home/VideoTestimonialCarousel";
import { QuoteSection } from "@/components/home/QuoteSection";
import { LeadMagnetPopup } from "@/components/LeadMagnetPopup";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { HomeBookingFlow } from "@/components/home/HomeBookingFlow";

export default function Index() {
  return (
    <Layout>
      <LeadMagnetPopup />
      <FloatingContactButton />
      <HeroSection />
      <AboutTeaser />

      {/* Lead-collection contact form */}
      <section id="contact-form" className="section-padding bg-secondary/30">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <SectionTransition variant="fade-up">
              <div className="text-center mb-8">
                <AnimatedDivider className="mx-auto mb-6" />
                <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-3">Get in Touch</p>
                <h2 className="heading-section text-foreground">Let's Start a Conversation</h2>
                <p className="text-muted-foreground mt-2 text-base max-w-md mx-auto">
                  Whether you have questions or are ready to begin — we'd love to hear from you.
                </p>
              </div>
            </SectionTransition>
            <SectionTransition variant="fade-up" delay={150}>
              <LeadCaptureForm />
            </SectionTransition>
          </div>
        </div>
      </section>

      <HomeBookingFlow />
      <ServicesHighlights />
      <ServiceTabsSection />
      <GalleryTeaser />
      <TestimonialSection />
      <VideoShowcaseSection />
      <QuoteSection />
    </Layout>
  );
}
