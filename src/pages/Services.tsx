import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { services, lessonInfo, siteConfig } from "@/data/content";
import { useStaggeredAnimation } from "@/hooks/useScrollAnimation";

// Main Ridge construction process images
import mainRidgeArenaGrading from "@/assets/main-ridge-arena-grading.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";
import mainRidgeCraneLift from "@/assets/main-ridge-crane-lift.jpg";
import mainRidgeFrameTrench from "@/assets/main-ridge-frame-trench.jpg";
import mainRidgePostDepth from "@/assets/main-ridge-post-depth.jpg";
import mainRidgeRebarFoundation from "@/assets/main-ridge-rebar-foundation.jpg";
import mainRidgeTimberPosts from "@/assets/main-ridge-timber-posts.jpg";
import mainRidgeTrenchUtilities from "@/assets/main-ridge-trench-utilities.jpg";

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

const constructionSteps = [
  { image: mainRidgeTrenchUtilities, title: "Site Preparation", description: "Trenching for utilities and drainage" },
  { image: mainRidgeRebarFoundation, title: "Foundation Work", description: "Reinforced concrete foundations built to last" },
  { image: mainRidgePostDepth, title: "Post Installation", description: "Deep-set posts for structural integrity" },
  { image: mainRidgeFrameTrench, title: "Frame Layout", description: "Precise framing aligned to specifications" },
  { image: mainRidgeTimberPosts, title: "Timber Framework", description: "Quality timber posts and structural elements" },
  { image: mainRidgeBarnFrame, title: "Barn Framing", description: "Complete structural framework taking shape" },
  { image: mainRidgeCraneLift, title: "Heavy Lifting", description: "Precision crane work for large components" },
  { image: mainRidgeArenaGrading, title: "Arena Grading", description: "Perfectly leveled arena surfaces" },
];

type ConstructionStep = {
  image: string;
  title: string;
  description: string;
};

function ConstructionLightbox({
  step,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  total,
}: {
  step: ConstructionStep | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  total: number;
}) {
  if (!step) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 text-primary-foreground/80 hover:text-primary-foreground z-10"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="h-8 w-8" />
      </button>
      
      {/* Navigation arrows */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-accent/20 hover:bg-accent/40 flex items-center justify-center text-primary-foreground transition-colors"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous image"
      >
        <ArrowRight className="h-6 w-6 rotate-180" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-accent/20 hover:bg-accent/40 flex items-center justify-center text-primary-foreground transition-colors"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next image"
      >
        <ArrowRight className="h-6 w-6" />
      </button>

      <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={step.image}
          alt={step.title}
          className="max-w-full max-h-[75vh] object-contain rounded-lg mx-auto"
        />
        <div className="text-center mt-6">
          <p className="text-accent text-sm font-medium mb-1">
            Step {currentIndex + 1} of {total}
          </p>
          <h3 className="font-serif text-xl text-primary-foreground mb-2">
            {step.title}
          </h3>
          <p className="text-primary-foreground/70 text-sm">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function ConstructionProcessSection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { containerRef, visibleItems } = useStaggeredAnimation(constructionSteps.length);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const goToNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % constructionSteps.length);
    }
  };
  
  const goToPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + constructionSteps.length) % constructionSteps.length);
    }
  };

  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
          <h2 className="heading-section text-foreground mb-4">
            Our Construction Process
          </h2>
          <p className="text-muted-foreground">
            Quality equine facilities don't happen by accident. Here's a behind-the-scenes 
            look at how we bring your vision to life—from ground-breaking to grand opening.
          </p>
        </div>

        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {constructionSteps.map((step, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className={`group text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg transition-all duration-700 ${
                visibleItems[index]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-foreground text-sm">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <ConstructionLightbox
        step={lightboxIndex !== null ? constructionSteps[lightboxIndex] : null}
        onClose={closeLightbox}
        onNext={goToNext}
        onPrev={goToPrev}
        currentIndex={lightboxIndex ?? 0}
        total={constructionSteps.length}
      />
    </section>
  );
}

function LessonsSection() {
  return (
    <section className="section-padding bg-background">
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

      <ConstructionProcessSection />

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
