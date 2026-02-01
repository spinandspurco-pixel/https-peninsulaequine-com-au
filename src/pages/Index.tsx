import { Link } from "react-router-dom";
import { ArrowRight, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { siteConfig, services, testimonials, aboutCiro } from "@/data/content";
import { cn } from "@/lib/utils";

// Import images
import heroSunset from "@/assets/hero-sunset.png";
import ciroWithHorse from "@/assets/ciro-with-horse.png";
import horseAction from "@/assets/horse-action.png";
import hatDetail from "@/assets/hat-detail.png";
import ciroWide from "@/assets/ciro-wide.png";
import spurDetail from "@/assets/spur-detail.png";

// Featured services for homepage
const featuredServices = services.slice(0, 4);
const featuredTestimonials = testimonials.slice(0, 3);

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroSunset}
          alt="Horse silhouette at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 image-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-container w-full pt-32 pb-20">
        <div className="max-w-3xl">
          <p className="text-accent font-medium mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Expert Equine Facility Construction
          </p>
          <h1
            className="heading-display text-white mb-6 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Built by a Horseman,<br />
            <span className="text-accent">For Horsemen</span>
          </h1>
          <p
            className="text-lg sm:text-xl text-white/80 max-w-2xl mb-10 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            Premium arenas, barns, and infrastructure designed by someone who rides—
            not just builds. Ciro brings decades of construction expertise and a 
            horseman's intuition to every project.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground btn-hover-lift text-base px-8"
            >
              <Link to="/contact">
                Get a Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white text-base px-8"
            >
              <a href={`tel:${siteConfig.phone}`}>
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white/60" />
      </div>
    </section>
  );
}

function IntroSection() {
  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img
                src={ciroWithHorse}
                alt="Ciro working with a horse"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Accent frame */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-accent rounded-lg -z-10" />
          </div>

          {/* Content */}
          <div>
            <div className="divider mb-6" />
            <h2 className="heading-section text-foreground mb-6">
              The Difference a Horseman Makes
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                When Ciro walks your property, he's not just seeing construction—he's seeing 
                how your horses will move, where water will drain, and what will keep your 
                operation running smoothly for decades.
              </p>
              <p>
                That's the advantage of working with someone who doesn't just build equine 
                facilities—he lives the equestrian life. Every arena, every barn, every 
                paddock is designed with the practical insights that only come from years 
                in the saddle.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {aboutCiro.values.slice(0, 2).map((value) => (
                <div key={value.title}>
                  <h4 className="font-serif font-semibold text-foreground mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-8 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Link to="/about">
                Learn More About Ciro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="divider mx-auto mb-6" />
          <h2 className="heading-section text-foreground mb-4">
            What We Build
          </h2>
          <p className="text-muted-foreground">
            From world-class arenas to functional barns, we deliver equine facilities 
            that perform as beautifully as they look.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service, index) => (
            <Link
              key={service.id}
              to={`/services#${service.id}`}
              className={cn(
                "group p-6 rounded-lg bg-card border border-border hover:border-accent transition-all duration-300",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <div className="w-6 h-6 bg-accent rounded" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {service.shortDescription}
              </p>
              <span className="inline-flex items-center text-sm font-medium text-accent">
                Learn more
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background">
            <Link to="/services">
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function GalleryPreview() {
  const images = [
    { src: horseAction, alt: "Horse in training" },
    { src: hatDetail, alt: "Craftsmanship details" },
    { src: spurDetail, alt: "Equipment detail" },
    { src: ciroWide, alt: "Ciro with horse" },
  ];

  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
          <div>
            <div className="divider mb-6 bg-accent" />
            <h2 className="heading-section">
              Craftsmanship in Every Detail
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary shrink-0"
          >
            <Link to="/gallery">
              View Full Gallery
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="aspect-[3/4] overflow-hidden rounded-lg group cursor-pointer"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="divider mx-auto mb-6" />
          <h2 className="heading-section text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground">
            Building lasting relationships, one facility at a time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                "p-8 rounded-lg bg-card border border-border",
                "opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-accent"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-foreground mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div>
                <p className="font-serif font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <Link to="/testimonials">
              Read More Reviews
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-24 lg:py-32">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={ciroWide}
          alt="Equine facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-container text-center">
        <h2 className="heading-section text-primary-foreground mb-6">
          Ready to Build Your Dream Facility?
        </h2>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
          Let's discuss your vision. Every great equine facility starts with a conversation
          about your horses, your goals, and your property.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground btn-hover-lift text-base px-8"
          >
            <Link to="/contact">
              Schedule a Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-base px-8"
          >
            <a href={`tel:${siteConfig.phone}`}>
              <Phone className="mr-2 h-5 w-5" />
              {siteConfig.phone}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <IntroSection />
      <ServicesSection />
      <GalleryPreview />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
}
