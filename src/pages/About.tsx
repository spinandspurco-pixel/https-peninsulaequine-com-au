import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { FamilyVideoCarousel } from "@/components/FamilyVideoCarousel";
import { aboutCiro } from "@/data/content";

import ciroWithHorse from "@/assets/ciro-with-horse.png";
import ciroWide from "@/assets/ciro-wide.png";
import horseAction from "@/assets/horse-action.png";

// Import join-up videos
import ciroJoinUp1 from "@/assets/videos/ciro-bareback-join-up.mp4";
import ciroJoinUp2 from "@/assets/videos/ciro-bareback-join-up-2.mp4";

function PageHeader() {
  return (
    <section className="pt-32 pb-16 bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="max-w-3xl">
          <div className="w-16 h-0.5 bg-accent mb-6" />
          <h1 className="heading-display mb-6">About Peninsula Equine</h1>
          <p className="text-lg text-primary-foreground/80">
            Building world-class equine facilities with the insight that only comes 
            from a lifetime of horsemanship.
          </p>
        </div>
      </div>
    </section>
  );
}

function CiroSection() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img
                src={ciroWithHorse}
                alt="Ciro, founder of Peninsula Equine"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-accent rounded-lg -z-10" />
          </div>

          {/* Content */}
          <div>
            <div className="w-16 h-0.5 bg-accent mb-6" />
            <h2 className="heading-section text-foreground mb-2">{aboutCiro.name}</h2>
            <p className="text-accent font-medium mb-6">{aboutCiro.title}</p>
            <div className="space-y-4 text-muted-foreground">
              {aboutCiro.bio.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
          <h2 className="heading-section text-foreground mb-4">
            Our Values
          </h2>
          <p className="text-muted-foreground">
            These principles guide every project we take on and every relationship we build.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {aboutCiro.values.map((value, index) => (
            <div
              key={value.title}
              className="text-center p-6"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <span className="font-serif text-2xl font-bold text-accent">{index + 1}</span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                {value.title}
              </h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NaturalHorsemanshipSection() {
  const videos = [
    { src: ciroJoinUp1, title: "Join-Up Session" },
    { src: ciroJoinUp2, title: "Bareback Connection" },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
          <h2 className="heading-section text-foreground mb-4">
            Natural Horsemanship
          </h2>
          <p className="text-muted-foreground text-lg">
            Before Ciro picks up a hammer, he picks up a halter. His deep understanding 
            of horse behavior and natural horsemanship principles directly informs 
            every facility he builds.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {videos.map((video, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <video
                  className="w-full h-full object-cover"
                  controls
                  muted
                  playsInline
                  preload="metadata"
                >
                  <source src={video.src} type="video/mp4" />
                </video>
              </div>
              <p className="mt-3 text-center text-sm text-muted-foreground font-medium">
                {video.title}
              </p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <blockquote className="max-w-2xl mx-auto mt-12 text-center">
          <p className="font-serif text-xl sm:text-2xl text-foreground italic leading-relaxed">
            "When you understand how a horse thinks and moves, you build facilities 
            that work with their nature, not against it."
          </p>
          <footer className="mt-4 text-accent font-medium">— Ciro</footer>
        </blockquote>
      </div>
    </section>
  );
}

function ImageBreak() {
  return (
    <section className="relative h-[50vh] min-h-[400px]">
      <img
        src={horseAction}
        alt="Horse training in arena"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-primary/40" />
    </section>
  );
}

function StorySection() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-0.5 bg-accent mb-6" />
          <h2 className="heading-section text-foreground mb-8">
            Why Peninsula Equine?
          </h2>
          <div className="space-y-6 text-muted-foreground">
            <p>
              Peninsula Equine was born from a simple observation: too many equine facility 
              projects were being built by contractors who had never saddled a horse. The 
              result? Arenas with poor drainage, barns with inadequate ventilation, and 
              paddocks that didn't account for how horses actually behave.
            </p>
            <p>
              Ciro saw an opportunity to bring something different to the market—construction 
              expertise combined with genuine horsemanship. When he surveys your property, 
              he's not just measuring distances and calculating materials. He's thinking 
              about sight lines, natural movement patterns, and the thousand small details 
              that make a facility truly work for horses and their people.
            </p>
            <p>
              Today, Peninsula Equine serves the San Francisco Peninsula and surrounding 
              areas, building facilities that stand as a testament to what's possible when 
              you combine construction excellence with equestrian insight.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FamilySection() {
  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <div className="w-16 h-0.5 bg-accent mb-6" />
            <h2 className="heading-section text-foreground mb-4">
              More Than a Business
            </h2>
            <p className="text-muted-foreground mb-4">
              Peninsula Equine isn't just a company—it's a family affair. When we're 
              not building world-class equine facilities, you'll find us spending 
              time together, often with our animals.
            </p>
            <p className="text-muted-foreground">
              From custom chicken coops to matching PE caps, we bring the same 
              attention to detail and love to everything we do. This personal 
              approach is what sets us apart—we treat every client's project like 
              it's our own.
            </p>
          </div>

          {/* Video Carousel */}
          <div>
            <FamilyVideoCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute inset-0">
        <img
          src={ciroWide}
          alt="Ciro with horse"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/90" />
      </div>

      <div className="relative z-10 section-container text-center">
        <h2 className="heading-section text-primary-foreground mb-6">
          Let's Build Something Great Together
        </h2>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
          Whether you're planning a new arena, expanding your barn, or starting from 
          scratch, we'd love to hear about your project.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground btn-hover-lift"
        >
          <Link to="/contact">
            Schedule a Consultation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <Layout>
      <PageHeader />
      <CiroSection />
      <NaturalHorsemanshipSection />
      <ValuesSection />
      <FamilySection />
      <ImageBreak />
      <StorySection />
      <CTASection />
    </Layout>
  );
}
