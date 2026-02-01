import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { services, lessonInfo, siteConfig } from "@/data/content";

// Page header component
function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <section className="pt-32 pb-16 bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="max-w-3xl">
          <div className="w-16 h-0.5 bg-accent mb-6" />
          <h1 className="heading-display mb-6">{title}</h1>
          <p className="text-lg text-primary-foreground/80">{description}</p>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  return (
    <div
      id={service.id}
      className="scroll-mt-24 grid lg:grid-cols-2 gap-8 lg:gap-16 items-start py-16 border-b border-border last:border-0"
    >
      <div className={index % 2 === 1 ? "lg:order-2" : ""}>
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
          <div className="w-8 h-8 bg-accent rounded" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-4">
          {service.title}
        </h2>
        <p className="text-muted-foreground mb-6">
          {service.description}
        </p>
        <ul className="space-y-3 mb-8">
          {service.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link to="/contact">
            Request a Quote
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className={index % 2 === 1 ? "lg:order-1" : ""}>
        <div className="aspect-[4/3] bg-secondary rounded-lg overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {/* Placeholder for service image */}
            <span className="text-sm">{service.title} Photo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonsSection() {
  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
          <h2 className="heading-section text-foreground mb-4">
            Lessons & Training
          </h2>
          <p className="text-accent font-medium mb-4">{lessonInfo.trainer}</p>
          <p className="text-muted-foreground mb-6">
            {lessonInfo.description}
          </p>
          <p className="text-muted-foreground mb-8">
            {lessonInfo.contact}
          </p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/contact">
              Inquire About Lessons
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Services() {
  return (
    <Layout>
      <PageHeader
        title="Our Services"
        description="From custom arenas to complete barn construction, we deliver equine facilities built to last. Every project reflects our commitment to quality and our understanding of what horses—and their owners—truly need."
      />

      <section className="section-container">
        {services.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </section>

      <LessonsSection />

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="section-container text-center">
          <h2 className="heading-section mb-6">
            Let's Discuss Your Project
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Every great facility starts with a conversation. Tell us about your vision, 
            and we'll show you how to make it reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/contact">
                Get a Free Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <a href={`tel:${siteConfig.phone}`}>Call {siteConfig.phone}</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
