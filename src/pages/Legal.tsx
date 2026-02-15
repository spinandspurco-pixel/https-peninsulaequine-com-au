import { Layout } from "@/components/layout/Layout";
import { siteConfig } from "@/data/content";
import logoPeMark from "@/assets/logo-pe-mark.png";

function PageHeader({ title }: { title: string }) {
  return (
    <section className="pt-32 pb-16 bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <img src={logoPeMark} alt="Peninsula Equine" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain drop-shadow-[0_2px_20px_rgba(255,255,255,0.2)]" />
          </div>
          <p className="text-primary-foreground/50 uppercase tracking-[0.2em] text-xs sm:text-sm mb-6">
            Crafting World-Class Equine Facilities
          </p>
          <h1 className="heading-display">{title}</h1>
        </div>
      </div>
    </section>
  );
}

export function Privacy() {
  return (
    <Layout>
      <PageHeader title="Privacy Policy" />
      <section className="section-padding">
        <div className="section-container max-w-3xl prose prose-slate">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4">Information We Collect</h2>
          <p className="text-muted-foreground mb-4">
            When you contact us through our website, we collect the information you provide, 
            including your name, email address, phone number, and message content. This 
            information is used solely to respond to your inquiries and provide our services.
          </p>

          <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4">How We Use Your Information</h2>
          <p className="text-muted-foreground mb-4">
            We use the information you provide to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Respond to your inquiries and service requests</li>
            <li>Provide quotes and consultations</li>
            <li>Communicate about ongoing projects</li>
            <li>Send occasional updates about our services (with your consent)</li>
          </ul>

          <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4">Information Sharing</h2>
          <p className="text-muted-foreground mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third 
            parties. We may share information with trusted partners who assist us in operating 
            our website or conducting our business, as long as those parties agree to keep 
            this information confidential.
          </p>

          <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy, please contact us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-accent hover:underline">
              {siteConfig.email}
            </a>
            .
          </p>
        </div>
      </section>
    </Layout>
  );
}

export function Terms() {
  return (
    <Layout>
      <PageHeader title="Terms of Service" />
      <section className="section-padding">
        <div className="section-container max-w-3xl prose prose-slate">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4">Agreement to Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing this website, you agree to be bound by these Terms of Service and 
            all applicable laws and regulations. If you do not agree with any of these terms, 
            you are prohibited from using or accessing this site.
          </p>

          <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4">Use License</h2>
          <p className="text-muted-foreground mb-4">
            Permission is granted to temporarily view the materials on Peninsula Equine's 
            website for personal, non-commercial use only. This license does not include 
            permission to modify, copy, or use materials for commercial purposes.
          </p>

          <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4">Disclaimer</h2>
          <p className="text-muted-foreground mb-4">
            The materials on this website are provided on an 'as is' basis. Peninsula Equine 
            makes no warranties, expressed or implied, and hereby disclaims all warranties, 
            including without limitation implied warranties of merchantability, fitness for 
            a particular purpose, or non-infringement of intellectual property.
          </p>

          <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4">Service Terms</h2>
          <p className="text-muted-foreground mb-4">
            All construction and service agreements are subject to separate written contracts. 
            Quotes provided through this website are estimates only and subject to change based 
            on site conditions, material costs, and project specifications.
          </p>

          <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about these Terms of Service, please contact us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-accent hover:underline">
              {siteConfig.email}
            </a>
            .
          </p>
        </div>
      </section>
    </Layout>
  );
}
