import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

/* ── Project data ────────────────────────────── */
import aberdeenStoneworkColor from "@/assets/aberdeen-stonework-color.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import aberdeenAisle from "@/assets/aberdeen-aisle.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";
import aberdeenInteriorStonework from "@/assets/aberdeen-interior-stonework.jpg";

import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import mainRidgeCiroWoodwork1 from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeTimber from "@/assets/main-ridge-timber.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";
import mainRidgeArenaGrading from "@/assets/main-ridge-arena-grading.jpg";
import mainRidgeFrameWide from "@/assets/main-ridge-frame-wide.jpg";
import mainRidgeFrameAngle from "@/assets/main-ridge-frame-angle.jpg";
import mainRidgeFoundationPour from "@/assets/main-ridge-foundation-pour.jpg";


import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import equitanaArena2 from "@/assets/equitana-arena-2.jpg";
import equitanaArena3 from "@/assets/equitana-arena-3.jpg";
import equitanaArena4 from "@/assets/equitana-arena-4.jpg";

export interface CaseStudyData {
  slug: string;
  title: string;
  subtitle: string;
  hero: string;
  problem: string;
  build: string;
  outcome: string;
  images: { src: string; alt: string }[];
  closingLine: string;
}

export const CASE_STUDIES: CaseStudyData[] = [
  {
    slug: "aberdeen-farm",
    title: "Private Client — Mornington Peninsula",
    subtitle: "Stables · Stonework · Interior Fit-Out",
    hero: aberdeenStoneworkColor,
    problem:
      "The existing stables were deteriorating — poor ventilation, cramped stalls, and stonework crumbling after decades of neglect. The owners needed a complete rebuild that honoured the property's heritage.",
    build:
      "Full structural rebuild incorporating hand-laid stonework, custom timber stalls, and engineered airflow systems. Every detail was designed around equine comfort and long-term durability.",
    outcome:
      "A facility that performs as well as it presents — improved airflow, wider stalls, and stonework built to outlast the next generation.",
    images: [
      { src: aberdeenBarnInterior, alt: "Barn interior with timber framing" },
      { src: aberdeenStalls, alt: "Custom timber stall detail" },
      { src: aberdeenAisle, alt: "Central aisle with natural light" },
      { src: aberdeenExterior, alt: "Exterior stonework facade" },
      { src: aberdeenInteriorStonework, alt: "Interior stonework detail" },
    ],
    closingLine: "Built to honour. Built to last.",
  },
  {
    slug: "main-ridge",
    title: "Main Ridge",
    subtitle: "Arena · Barn · Ground Systems",
    hero: mainRidgeInterior,
    problem:
      "The site suffered from poor drainage and inconsistent footing, limiting usability year-round. The barn needed structural reinforcement and the arena surface was unusable after rain.",
    build:
      "Full ground regrading, engineered drainage installation, and surface system built for consistent performance across seasons. Custom timber barn with hand-crafted joinery by Ciro.",
    outcome:
      "A stable, high-performance arena that maintains ride quality in all conditions — paired with a barn that's as functional as it is beautiful.",
    images: [
      { src: mainRidgeFrameWide, alt: "Main Ridge timber frame build phase" },
      { src: mainRidgeFrameAngle, alt: "Timber frame angle detail" },
      { src: mainRidgeFoundationPour, alt: "Concrete foundation pour" },
      { src: mainRidgeCiroWoodwork1, alt: "Ciro hand-crafting timber" },
      { src: mainRidgeBrickwork, alt: "Precision brickwork foundation" },
      { src: mainRidgeBarnFrame, alt: "Barn frame raising" },
      { src: mainRidgeArenaGrading, alt: "Arena surface grading" },
    ],
    closingLine: "Built to perform. Built to last.",
  },
  {
    slug: "equitana",
    title: "Equitana Melbourne",
    subtitle: "Competition Arena · Surface Engineering",
    hero: equitanaArena1,
    problem:
      "Australia's largest equestrian expo needed a competition-grade arena built to international standards — on a tight timeline with complex logistics inside an exhibition centre.",
    build:
      "Precision surface installation engineered for multi-discipline use. Drainage, base preparation, and footing calibrated for consistency across the entire arena footprint.",
    outcome:
      "A world-class competition surface delivered on time, performing flawlessly across all disciplines throughout the event.",
    images: [
      { src: equitanaArena2, alt: "Arena preparation" },
      { src: equitanaArena3, alt: "Surface grading" },
      { src: equitanaArena4, alt: "Completed competition arena" },
    ],
    closingLine: "Built to compete. Built to impress.",
  },
];

export default function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const study = CASE_STUDIES.find((s) => s.slug === slug);

  if (!study) return <Navigate to="/gallery" replace />;

  return (
    <Layout>
      {/* ── Hero ─────────────────────── */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <img
          src={study.hero}
          alt={study.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-10">
          <div className="section-container max-w-5xl">
            <RevealOnScroll direction="up">
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-accent mb-4 hover:text-accent/80 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Selected Work
              </Link>
              <h1 className="heading-display text-primary-foreground mb-2">
                {study.title}
              </h1>
              <p className="text-sm text-primary-foreground/50 tracking-wide">
                {study.subtitle}
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── Problem / Build / Outcome ── */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="section-container max-w-3xl mx-auto space-y-20">
          {/* The Problem */}
          <RevealOnScroll direction="up">
            <div className="space-y-4">
              <p className="text-[10px] font-mono tracking-[0.3em] text-accent/50 uppercase">The Problem</p>
              <RevealLine width="w-8" />
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {study.problem}
              </p>
            </div>
          </RevealOnScroll>

          {/* The Build */}
          <RevealOnScroll direction="up">
            <div className="space-y-4">
              <p className="text-[10px] font-mono tracking-[0.3em] text-accent/50 uppercase">The Build</p>
              <RevealLine width="w-8" />
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {study.build}
              </p>
            </div>
          </RevealOnScroll>

          {/* The Outcome */}
          <RevealOnScroll direction="up">
            <div className="space-y-4">
              <p className="text-[10px] font-mono tracking-[0.3em] text-accent/50 uppercase">The Outcome</p>
              <RevealLine width="w-8" />
              <p className="text-base sm:text-lg text-foreground leading-relaxed font-medium">
                {study.outcome}
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Image Strip ───────────── */}
      <section className="py-4 bg-card">
        <div className="section-container max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {study.images.map((img, i) => (
              <RevealOnScroll key={i} direction="up" stagger={i} staggerInterval={80}>
                <div className="relative aspect-[4/3] overflow-hidden group">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-colors duration-500" />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing Line ──────────── */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="section-container max-w-3xl mx-auto text-center space-y-8">
          <RevealLine className="mx-auto" width="w-10" />
          <RevealOnScroll direction="up" duration={900}>
            <p className="font-serif text-xl sm:text-2xl text-foreground italic">
              {study.closingLine}
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={200}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-accent text-accent-foreground hover:bg-accent/90 uppercase tracking-[0.14em] text-xs font-medium btn-hover-lift"
              >
                <Link to="/contact">
                  Start Your Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="uppercase tracking-[0.1em] text-xs">
                <Link to="/gallery">More Projects</Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
