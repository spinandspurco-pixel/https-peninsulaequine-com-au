import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { BlueprintLineOverlay } from "@/components/BlueprintLineOverlay";
import { PageHeader } from "@/components/PageHeader";
import { InquiryForm } from "@/components/InquiryForm";
import { siteConfig } from "@/data/content";
import { PolicyDownloadCenter } from "@/components/PolicyDownloadCenter";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";

// Background image for header parallax
import aberdeenInterior from "@/assets/aberdeen-barn-interior.jpg";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintDetail from "@/assets/blueprint-detail.png";

function ContactInfo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
          Get in Touch
        </h3>
        <ul className="space-y-4">
          <li>
            <a
              href={`tel:${siteConfig.phone}`}
              className="flex items-start gap-4 text-muted-foreground hover:text-accent transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                <Phone className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Phone</p>
                <p>{siteConfig.phone}</p>
              </div>
            </a>
          </li>
          <li>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-start gap-4 text-muted-foreground hover:text-accent transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p>{siteConfig.email}</p>
              </div>
            </a>
          </li>
          <li className="flex items-start gap-4 text-muted-foreground">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">Location</p>
              <p>
                {siteConfig.address.street}<br />
                {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4 text-muted-foreground">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">Hours</p>
              <p>{siteConfig.hours.weekdays}</p>
              <p>{siteConfig.hours.saturday}</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Map placeholder */}
      <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <MapPin className="h-8 w-8 mr-2" />
          <span>Map Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <Layout>
      <StickySubpageCTA
        ctaLabel="Call Us Now"
        ctaIcon={<Phone className="h-4 w-4" />}
        onCtaClick={() => window.location.href = `tel:${siteConfig.phone}`}
      />
      <PageHeader 
        title="Start Your Project"
        description="Tell us about your vision and we'll help you bring it to life. Complete our inquiry form to get started."
        backgroundImage={aberdeenInterior}
        dividerVariant="contact"
      />

      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="right-to-left" duration={2000} parallaxSpeed={0.06} />
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Form - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl p-6 sm:p-8 border border-border">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  Project Inquiry
                </h2>
                <p className="text-muted-foreground mb-8">
                  Complete this form and we'll get back to you with a personalized consultation.
                </p>
                <InquiryForm />
              </div>
            </div>

            {/* Contact Info - Takes 1 column */}
            <div className="space-y-8">
              <ContactInfo />
              <PolicyDownloadCenter />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
