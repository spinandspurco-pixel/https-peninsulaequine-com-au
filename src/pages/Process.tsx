import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { siteConfig } from "@/data/content";

import blueprintBarn from "@/assets/blueprint-barn.png";
import blueprintElevation from "@/assets/blueprint-elevation.png";
import blueprintFacility from "@/assets/blueprint-facility.png";
import blueprintDetail from "@/assets/blueprint-detail.png";
import ciroWide from "@/assets/ciro-wide.png";

// Construction images for each phase
import mainRidgePostDepth from "@/assets/main-ridge-post-depth.jpg";
import mainRidgeRebarFoundation from "@/assets/main-ridge-rebar-foundation.jpg";
import mainRidgeFrameTrench from "@/assets/main-ridge-frame-trench.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import mainRidgeCraneLift from "@/assets/main-ridge-crane-lift.jpg";
import mainRidgeCiroWoodwork1 from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeArenaGrading from "@/assets/main-ridge-arena-grading.jpg";

const phases = [
  {
    number: "01",
    title: "Site Consultation & Vision",
    description:
      "Every project begins with Ciro visiting your property. He walks the land, assesses soil conditions, studies drainage patterns, and listens to your vision. This isn't a clipboard-and-clipboard visit — it's a horseman reading the terrain the way he'd read a horse.",
    details: [
      "On-site soil and drainage analysis",
      "Discussion of your discipline, herd size, and workflow",
      "Property access and utility assessment",
      "Preliminary concept sketches on the spot",
    ],
    image: mainRidgePostDepth,
    blueprint: blueprintFacility,
  },
  {
    number: "02",
    title: "Design & Engineering",
    description:
      "With site data in hand, Ciro develops detailed plans — not generic templates, but custom layouts designed around how horses actually move and how riders actually work. Engineering drawings, permit applications, and material specifications are all handled in-house.",
    details: [
      "Custom architectural drawings and 3D concepts",
      "Structural engineering and compliance",
      "Council permits and approvals managed for you",
      "Structured project brief with scope and specification",
    ],
    image: mainRidgeRebarFoundation,
    blueprint: blueprintBarn,
  },
  {
    number: "03",
    title: "Ground Preparation",
    description:
      "The foundation determines everything. We clear, grade, and prepare the site with the precision that only comes from building hundreds of equine facilities. Drainage is engineered into the ground from day one — not bolted on as an afterthought.",
    details: [
      "Land clearing and precision grading",
      "Engineered drainage systems",
      "Foundation trenching and rebar work",
      "Utility runs (water, electrical, sewer)",
    ],
    image: mainRidgeFrameTrench,
    blueprint: blueprintElevation,
  },
  {
    number: "04",
    title: "Structural Build",
    description:
      "Steel goes up, timber is set, and the skeleton of your facility takes shape. Every post is plumbed, every beam is levelled, and every connection is engineered to withstand decades of use. Ciro is on-site for every critical lift.",
    details: [
      "Steel and timber structural framing",
      "Crane lifts and precision placement",
      "Roofing and weather envelope",
      "Structural inspections at each milestone",
    ],
    image: mainRidgeBarnFrame,
    blueprint: blueprintFacility,
  },
  {
    number: "05",
    title: "Masonry & Brickwork",
    description:
      "Where applicable, our brickwork and stonework adds permanence and character. From retaining walls to stable facades, every course is laid by hand with the kind of care that machines can't replicate.",
    details: [
      "Custom brickwork and stonework",
      "Retaining walls and drainage integration",
      "Decorative stonework facades",
      "Heritage-quality craftsmanship",
    ],
    image: mainRidgeBrickwork,
    blueprint: blueprintDetail,
  },
  {
    number: "06",
    title: "Crane & Heavy Lifts",
    description:
      "Major structural elements — roof trusses, pre-fabricated panels, heavy beams — are positioned with precision crane work. Safety and accuracy define every lift.",
    details: [
      "Certified crane operations",
      "Pre-fabricated panel placement",
      "Roof truss installation",
      "Heavy beam positioning",
    ],
    image: mainRidgeCraneLift,
    blueprint: blueprintElevation,
  },
  {
    number: "07",
    title: "Fit-Out & Finishing",
    description:
      "This is where Ciro's dual expertise shines brightest. Stall configurations, tack room layouts, wash rack plumbing, ventilation systems — every detail is finished to a standard that a horseman would stake their name on.",
    details: [
      "Stall fit-out with custom joinery",
      "Electrical, plumbing, and ventilation",
      "Doors, gates, and hardware",
      "Ciro's signature timber detailing",
    ],
    image: mainRidgeCiroWoodwork1,
    blueprint: blueprintBarn,
  },
  {
    number: "08",
    title: "Arena & Footing",
    description:
      "The surface your horse works on matters more than anything. Ciro personally oversees every arena's base preparation, drainage layer, and footing installation — because he won't hand over an arena he wouldn't ride in himself.",
    details: [
      "Precision base preparation and compaction",
      "Multi-layer drainage engineering",
      "Premium footing material selection and installation",
      "Final grading, crown, and dust-control systems",
    ],
    image: mainRidgeArenaGrading,
    blueprint: blueprintFacility,
  },
];

function PhaseCard({ phase, index }: { phase: typeof phases[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {/* Image */}
      <div className={`relative ${isEven ? "lg:order-1" : "lg:order-2"}`}>
        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
          <img
            src={phase.image}
            alt={phase.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Phase number overlay */}
        <div className="absolute -top-4 -left-4 w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-lg">
          <span className="font-serif text-lg font-bold text-accent-foreground">{phase.number}</span>
        </div>
      </div>

      {/* Content */}
      <div className={isEven ? "lg:order-2" : "lg:order-1"}>
        <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-2">
          Phase {phase.number}
        </p>
        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-4">
          {phase.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {phase.description}
        </p>
        <ul className="space-y-2">
          {phase.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Process() {
  return (
    <Layout>
      <PageHeader
        title="Our Process"
        description="A structured approach to equine infrastructure — from initial assessment through to long-term outcome."
        backgroundImage={ciroWide}
        dividerVariant="structural"
      />

      {/* Process intro */}
      <section className="section-padding bg-background relative overflow-hidden">
        <BlueprintBackground image={blueprintElevation} opacity={0.025} direction="bottom-to-top" duration={2000} />
        <div className="section-container relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <AnimatedDivider className="mx-auto mb-8" />
            <SectionTransition variant="fade-up">
              <h2 className="heading-editorial text-foreground mb-4">
                Every Great Facility Starts With a Plan
              </h2>
            </SectionTransition>
            <SectionTransition variant="fade-up" delay={100}>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Unlike generic contractors who build from templates, Ciro designs every project
                around the horse — their movement, their needs, their nature. Each phase is
                executed with the precision of a builder and the intuition of a horseman.
              </p>
            </SectionTransition>
          </div>

          {/* Phase cards */}
          <div className="space-y-20 lg:space-y-28">
            {phases.map((phase, index) => (
              <PhaseCard key={phase.number} phase={phase} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline summary */}
      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <SectionTransition variant="fade-up">
              <h2 className="heading-editorial mb-4">Typical Project Timelines</h2>
              <p className="text-primary-foreground/60">
                Every project is unique, but here's what to expect.
              </p>
            </SectionTransition>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { type: "Outdoor Arena", time: "2–4 weeks", note: "From ground-breaking to first ride" },
              { type: "Barn / Stables", time: "8–16 weeks", note: "Depending on size and fit-out" },
              { type: "Full Facility", time: "4–8 months", note: "Arena, barn, fencing & infrastructure" },
            ].map((item, i) => (
              <SectionTransition key={i} variant="fade-up" delay={i * 100}>
                <div className="text-center p-6 rounded-lg border border-primary-foreground/10 bg-primary-foreground/[0.04]">
                  <p className="text-accent font-serif text-2xl font-bold mb-1">{item.time}</p>
                  <p className="font-serif text-lg text-primary-foreground mb-1">{item.type}</p>
                  <p className="text-xs text-primary-foreground/50">{item.note}</p>
                </div>
              </SectionTransition>
            ))}
          </div>
        </div>
      </section>

      <ParallaxCTA
        title="Discuss Your Project"
        description="Each project begins with an on-site assessment to ensure correct system specification and long-term performance."
        backgroundImage={ciroWide}
        primaryButtonText="Request Site Assessment"
        primaryButtonLink="/contact"
        showPhoneButton={true}
      />
    </Layout>
  );
}
