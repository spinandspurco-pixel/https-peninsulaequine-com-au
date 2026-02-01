import { Link } from "react-router-dom";
import { ArrowRight, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { MajorEventsSection } from "@/components/MajorEventsSection";
import { siteConfig, services, testimonials, aboutCiro } from "@/data/content";

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
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Full-bleed Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroSunset}
          alt="Horse silhouette at sunset"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/60" />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 text-center px-4">
        <div className="divider mx-auto mb-8 bg-accent/80" />
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-[0.15em] uppercase font-normal text-shadow-editorial mb-6">
          Peninsula Equine
        </h1>
        <p className="font-sans text-sm sm:text-base tracking-[0.3em] uppercase text-white/80 mb-4">
          Facility Construction • Training • Excellence
        </p>
        
        {/* Circular Logo Mark */}
        <div className="mt-12 mb-16">
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <span className="font-serif text-white text-3xl sm:text-4xl tracking-wider">PE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button 
        onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
        aria-label="Scroll to content"
      >
        <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </button>
    </section>
  );
}

function IntroSection() {
  return (
    <section id="intro" className="bg-background">
      {/* Location tagline */}
      <div className="section-padding border-b border-border">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground uppercase tracking-[0.25em] text-sm mb-8">
              Mornington Peninsula, Victoria
            </p>
            <h2 className="heading-section text-foreground mb-8">
              Where world-class equine facilities are built by the hands of a horseman
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Peninsula Equine is a construction company specializing in premium arenas, barns, 
              and equestrian infrastructure. With decades of experience in both riding and building, 
              Ciro brings a horseman's intuition to every project.
            </p>
          </div>
        </div>
      </div>

      {/* Large editorial image */}
      <div className="relative h-[70vh] min-h-[500px]">
        <img
          src={ciroWithHorse}
          alt="Ciro working with a horse"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 image-overlay-subtle" />
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="lg:col-span-5">
            <div className="divider mb-8" />
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">
              Our Mission
            </p>
            <h2 className="heading-editorial text-foreground mb-8">
              Built by a horseman,<br />
              <span className="text-accent">for horsemen</span>
            </h2>
            <blockquote className="text-xl sm:text-2xl text-foreground font-serif italic leading-relaxed mb-8">
              "The finest facilities come from understanding both the craft of construction 
              and the soul of the horse."
            </blockquote>
            <p className="text-muted-foreground leading-relaxed mb-8">
              When Ciro walks your property, he's not just seeing construction—he's seeing 
              how your horses will move, where water will drain, and what will keep your 
              operation running smoothly for decades.
            </p>
            <Link 
              to="/about" 
              className="inline-flex items-center text-foreground font-medium hover:text-accent transition-colors group"
            >
              <span className="border-b border-foreground group-hover:border-accent transition-colors pb-1">
                Learn more about Ciro
              </span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Image */}
          <div className="lg:col-span-7">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={horseAction}
                alt="Horse in training"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="divider mx-auto mb-8" />
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-4">
            Our Services
          </p>
          <h2 className="heading-section text-foreground">
            What We Build
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 gap-px bg-border">
          {featuredServices.map((service) => (
            <Link
              key={service.id}
              to={`/services#${service.id}`}
              className="group p-10 sm:p-12 lg:p-16 bg-background hover:bg-card transition-colors"
            >
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-4">
                {service.id.replace(/-/g, ' ')}
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl text-foreground mb-4 group-hover:text-accent transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {service.shortDescription}
              </p>
              <span className="inline-flex items-center text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                <span className="border-b border-current pb-0.5">Learn more</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="border-foreground text-foreground hover:bg-foreground hover:text-background"
          >
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

function GallerySection() {
  const images = [
    { src: hatDetail, alt: "Craftsmanship details" },
    { src: spurDetail, alt: "Equipment detail" },
    { src: ciroWide, alt: "Ciro with horse" },
  ];

  return (
    <section className="bg-primary text-primary-foreground">
      {/* Full-width image strip */}
      <div className="grid grid-cols-3 h-[40vh] min-h-[300px]">
        {images.map((image, index) => (
          <div key={index} className="overflow-hidden">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        ))}
      </div>

      {/* Gallery CTA */}
      <div className="section-padding">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="divider mx-auto mb-8 bg-accent" />
            <h2 className="heading-editorial mb-6">
              Craftsmanship in Every Detail
            </h2>
            <p className="text-primary-foreground/70 mb-10 leading-relaxed">
              We invite you to explore our portfolio of completed projects, showcasing 
              the artistry and precision that defines Peninsula Equine.
            </p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link to="/gallery">
                View Gallery
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const featured = featuredTestimonials[0];

  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="divider mx-auto mb-8" />
          
          {/* Stars */}
          <div className="flex gap-1 justify-center mb-8">
            {[...Array(featured.rating)].map((_, i) => (
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

          <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground leading-relaxed mb-8">
            "{featured.quote}"
          </blockquote>
          
          <div>
            <p className="font-serif font-semibold text-foreground text-lg">{featured.name}</p>
            <p className="text-muted-foreground">{featured.role}</p>
          </div>

          <div className="mt-12">
            <Link 
              to="/testimonials" 
              className="inline-flex items-center text-foreground font-medium hover:text-accent transition-colors group"
            >
              <span className="border-b border-foreground group-hover:border-accent transition-colors pb-1">
                Read more reviews
              </span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-32 lg:py-40">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={ciroWide}
          alt="Equine facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-container text-center">
        <div className="max-w-3xl mx-auto">
          <div className="divider mx-auto mb-8 bg-accent" />
          <p className="text-primary-foreground/70 uppercase tracking-[0.2em] text-sm mb-4">
            We invite you to join us
          </p>
          <h2 className="heading-section text-primary-foreground mb-8">
            Ready to Build Your Dream Facility?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-12 leading-relaxed">
            Every great equine facility starts with a conversation about your horses, 
            your goals, and your property. Let's discuss your vision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground btn-hover-lift text-base px-10"
            >
              <Link to="/contact">
                Get in Touch
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-base px-10"
            >
              <a href={`tel:${siteConfig.phone}`}>
                <Phone className="mr-2 h-5 w-5" />
                {siteConfig.phone}
              </a>
            </Button>
          </div>
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
      <MissionSection />
      <MajorEventsSection />
      <ServicesSection />
      <GallerySection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
}
