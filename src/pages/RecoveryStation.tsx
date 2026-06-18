import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealImage, RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";
import { BlueprintContinuity } from "@/components/BlueprintContinuity";
import { LumenArcEntrance } from "@/components/lumenarc/LumenArcEntrance";
import { LumenArcBriefingDialog } from "@/components/lumenarc/LumenArcBriefingDialog";
import comingSoonAsset from "@/assets/lumenarc/coming-soon.asset.json";
import canopyAsset from "@/assets/lumenarc/canopy.asset.json";
import controlColumnAsset from "@/assets/lumenarc/control-column.asset.json";
import inUseAsset from "@/assets/lumenarc/in-use.asset.json";
import appAsset from "@/assets/lumenarc/app.asset.json";
import thermalIntelligenceAsset from "@/assets/lumenarc/thermal-intelligence.asset.json";
import recoveryMistAsset from "@/assets/lumenarc/recovery-mist.asset.json";
import wellnessPrecinctAsset from "@/assets/lumenarc/wellness-precinct.asset.json";

type LumenArcChapter = {
  number: string;
  label: string;
  title: string;
  body: string;
  notes: string[];
  image: string;
  alt: string;
  align?: "left" | "right";
  disclaimer?: string;
};

const chapters: LumenArcChapter[] = [
  {
    number: "02",
    label: "Infrared Therapy Canopy",
    title: "Targeted warmth, held within an architectural canopy.",
    body:
      "A future concept canopy designed to support warm-up, post-work comfort and quieter recovery moments through directed infrared heat, controlled airflow and a deliberately open equine-safe form.",
    notes: ["Targeted infrared heat", "Optimal airflow", "Engineered performance"],
    image: canopyAsset.url,
    alt: "LumenArc infrared canopy concept with horse standing beneath illuminated recovery canopy in a moody stable courtyard",
    align: "left",
    disclaimer: "Future concept. Features subject to refinement during design development.",
  },
  {
    number: "03",
    label: "Intelligent Control Column",
    title: "Real-time oversight, resolved into a single physical touchpoint.",
    body:
      "The control column is conceived as the operational spine of the system — bringing session timing, environmental settings, monitoring prompts and layered safety controls into one architectural object rather than scattered equipment.",
    notes: ["Session control", "Recovery monitoring", "Safety systems"],
    image: controlColumnAsset.url,
    alt: "LumenArc intelligent control column concept beside horse recovery canopy with illuminated controls and safety hardware",
    align: "right",
    disclaimer: "Interface and monitoring views shown as concept visuals only, in development.",
  },
  {
    number: "04",
    label: "In Use",
    title: "Designed for real horses, real yards and everyday use.",
    body:
      "Open-air geometry, non-slip underfoot conditions, integrated drainage and tempered airflow shape a more practical recovery environment — designed to support calm handling, cleaner circulation and equine comfort without clinical character.",
    notes: ["Open-air safety", "Non-slip flooring", "Drainage + airflow"],
    image: inUseAsset.url,
    alt: "Horse beneath the LumenArc recovery canopy in a premium stable courtyard at night",
    align: "left",
    disclaimer: "Designed to support comfort and practical post-work routines. Not presented as a medical device.",
  },
  {
    number: "05",
    label: "Future Control App",
    title: "Connected oversight, carried with the rider or stable manager.",
    body:
      "A future app layer is being explored to support horse profiles, session controls, usage history and operational visibility across the broader property — extending the architectural system into a quieter digital companion.",
    notes: ["Horse profiles", "Session controls", "Recovery insights"],
    image: appAsset.url,
    alt: "LumenArc mobile control app concept shown in hand with illuminated recovery canopy in the background",
    align: "right",
    disclaimer: "App experience shown as a future concept. Features subject to refinement.",
  },
  {
    number: "06",
    label: "Thermal Intelligence",
    title: "A smarter visual read of warmth, use and recovery conditions.",
    body:
      "Thermal mapping and session data are being developed as decision-support layers — intended to help owners and managers better understand heat distribution, comfort settings and repeatable recovery routines without overclaiming clinical outcomes.",
    notes: ["Thermal mapping", "Data-led adjustment", "Monitoring support"],
    image: thermalIntelligenceAsset.url,
    alt: "LumenArc thermal intelligence concept showing horse heat-map overlay beneath recovery canopy",
    align: "left",
    disclaimer: "Designed to support monitoring and adjustment only. No diagnostic, treatment or cure claims are made.",
  },
  {
    number: "07",
    label: "Recovery Mist Mode",
    title: "Cool-down support for summer, post-work reset and quieter comfort.",
    body:
      "Recovery Mist Mode is being studied as a lighter environmental setting within the LumenArc system — designed to support cool-down comfort, summer usability and post-work reset through fine misting and controlled ambient conditions.",
    notes: ["Summer mode", "Post-work recovery", "Comfort support"],
    image: recoveryMistAsset.url,
    alt: "LumenArc recovery mist mode concept with horse beneath illuminated canopy and fine cooling mist",
    align: "right",
    disclaimer: "Future concept in development. Features and operating modes subject to refinement.",
  },
  {
    number: "08",
    label: "Wellness Precinct",
    title: "A future Peninsula Equine precinct built around recovery, care and place.",
    body:
      "Beyond a single structure, LumenArc is positioned as a coming-soon division inside a wider facility ecosystem — where recovery, landscape, circulation, infrastructure and digital oversight are conceived as one premium equine environment.",
    notes: ["Facility ecosystem", "Premium infrastructure", "Future-focused planning"],
    image: wellnessPrecinctAsset.url,
    alt: "LumenArc wellness precinct concept showing broader premium equine facility ecosystem at night",
    align: "left",
    disclaimer: "Precinct visual shown as future direction only. Elements remain in development and subject to refinement.",
  },
];

function LumenArcChapterSection({
  number,
  label,
  title,
  body,
  notes,
  image,
  alt,
  align = "left",
  disclaimer,
}: LumenArcChapter) {
  const imageOrder = align === "right" ? "lg:order-2" : "";
  const copyOrder = align === "right" ? "lg:order-1" : "";
  const imageBleed = align === "right" ? "lg:-mr-[3rem]" : "lg:-ml-[3rem]";

  return (
    <section className="relative py-[clamp(5.5rem,3.5rem+7vw,10rem)]">
      <div className="section-container relative z-10 grid grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4.5rem)] items-center">
        <div className={`col-span-12 lg:col-span-7 ${imageOrder}`}>
          <RevealImage delay={100} duration={1200}>
            <div className={`relative aspect-[16/10] overflow-hidden ${imageBleed}`}>
              <img
                src={image}
                alt={alt}
                loading="lazy"
                width={1400}
                height={1000}
                className="absolute inset-0 h-full w-full object-cover image-bleed"
                style={{ filter: "brightness(0.86) contrast(1.08) saturate(0.82)" }}
              />
              {/* Edge fades — dissolve image into the page rather than sit as a card */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,hsl(var(--background)/0.55)_100%)]" />
              <div
                className={`pointer-events-none absolute inset-y-0 w-1/3 ${
                  align === "right" ? "right-0 bg-[linear-gradient(270deg,hsl(var(--background))_0%,transparent_100%)]" : "left-0 bg-[linear-gradient(90deg,hsl(var(--background))_0%,transparent_100%)]"
                }`}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,hsl(var(--background))_0%,transparent_100%)]" />
              {/* Subtle blueprint plate overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen"
                style={{
                  backgroundImage:
                    "linear-gradient(0deg, hsl(var(--accent)/0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)/0.6) 1px, transparent 1px)",
                  backgroundSize: "80px 80px",
                }}
              />
            </div>
          </RevealImage>
        </div>


        <div className={`col-span-12 lg:col-span-5 ${copyOrder}`}>
          <div className="space-y-8 lg:max-w-[28rem]">
            <RevealOnScroll direction="up" duration={900}>
              <div className="flex items-baseline gap-5">
                <span className="font-mono text-accent/55 text-[0.7rem] tracking-[0.32em] tabular-nums">
                  {number}
                </span>
                <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
                <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">
                  {label}
                </span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" duration={1000} delay={120}>
              <h2 className="font-serif text-foreground/92 leading-[0.98] tracking-[0.01em] text-[clamp(1.95rem,1.35rem+2.1vw,3.2rem)]">
                {title}
              </h2>
            </RevealOnScroll>

            <RevealLine width="w-10" delay={220} />

            <RevealOnScroll direction="up" duration={1000} delay={260}>
              <p className="font-sans font-light text-foreground/56 leading-[1.9] text-[clamp(0.86rem,0.82rem+0.16vw,0.95rem)]">
                {body}
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" duration={1000} delay={340}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 pt-5">
                {notes.map((note) => (
                  <p
                    key={note}
                    className="font-mono uppercase text-accent/62 text-[0.62rem] tracking-[0.32em] leading-[1.7]"
                  >
                    {note}
                  </p>
                ))}
              </div>
            </RevealOnScroll>

            {disclaimer && (
              <RevealOnScroll direction="up" duration={950} delay={400}>
                <p className="font-sans font-light italic text-foreground/34 leading-[1.75] text-[0.76rem] max-w-md">
                  {disclaimer}
                </p>
              </RevealOnScroll>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function RecoveryStation() {
  const [briefingOpen, setBriefingOpen] = useState(false);
  return (
    <Layout>
      <LumenArcEntrance />
      <article className="relative bg-background text-foreground type-architectural">
        {/* Continuous drafting layer — binds every section into one architectural plate */}
        <BlueprintContinuity />

        <section className="relative h-[85svh] md:h-[100svh] overflow-hidden">
          <img
            src={comingSoonAsset.url}
            alt="LumenArc coming soon teaser visual — premium equine recovery canopy concept with blueprint-led detailing"
            width={1536}
            height={1024}
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ filter: "brightness(0.82) contrast(1.06) saturate(0.8)" }}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          {/* Cinematic vignette — image reads as full-bleed scene, not a card */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_35%,hsl(var(--background)/0.55)_80%,hsl(var(--background))_100%)]" />
          {/* Subtle top gradient for navigation readability */}
          <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,hsl(var(--background)/0.7)_0%,transparent_100%)]" />
          {/* Side fades blend hero into background continuation */}
          <div className="absolute inset-y-0 left-0 w-[18%] bg-[linear-gradient(90deg,hsl(var(--background))_0%,transparent_100%)]" />
          <div className="absolute inset-y-0 right-0 w-[18%] bg-[linear-gradient(270deg,hsl(var(--background))_0%,transparent_100%)]" />
          {/* Long bottom gradient so the artwork dissolves into the next chapter */}
          <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-[linear-gradient(0deg,hsl(var(--background))_0%,hsl(var(--background)/0.75)_45%,transparent_100%)]" />
          {/* Restrained amber breath */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_60%,hsl(var(--accent)/0.07),transparent_55%)]" />
        </section>


        {chapters.map((chapter, index) => (
          <LumenArcChapterSection key={chapter.number} {...chapter} align={index % 2 === 0 ? chapter.align ?? "left" : chapter.align ?? "right"} />
        ))}

        <section className="relative py-[clamp(5rem,3.5rem+6vw,8rem)]">
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_35%,hsl(var(--accent)/0.08),transparent_52%)]" />
          <div className="section-container relative z-10">
            <div className="mx-auto max-w-3xl text-center space-y-7">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/55 text-[0.62rem] tracking-[0.5em]">
                  In Development
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={120}>
                <h2 className="font-serif text-foreground/90 leading-[1.02] tracking-[0.01em] text-[clamp(1.9rem,1.3rem+2.2vw,3rem)]">
                  Built to support performance, comfort and the next era of Peninsula Equine environments.
                </h2>
              </RevealOnScroll>
              <RevealLine className="mx-auto" width="w-12" delay={260} />
              <RevealOnScroll direction="up" duration={1050} delay={320}>
                <p className="mx-auto max-w-2xl font-sans font-light text-foreground/48 leading-[1.95] text-[0.86rem]">
                  LumenArc is in development. Imagery and controls communicate design direction only and may evolve through specification and prototyping.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={420}>
                <div className="flex flex-col items-center justify-center gap-5 pt-4 sm:flex-row sm:gap-10">
                  <button
                    type="button"
                    onClick={() => setBriefingOpen(true)}
                    className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[0.64rem] tracking-[0.42em]"
                  >
                    <span className="h-px w-8 bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                    Request Advance Briefing
                  </button>
                  <Link
                    to="/field-notes"
                    className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/42 hover:text-foreground/78 transition-colors duration-500 text-[0.64rem] tracking-[0.42em]"
                  >
                    Explore Field Notes
                    <span className="h-px w-8 bg-foreground/20 transition-all duration-700 group-hover:w-14 group-hover:bg-foreground/58" />
                  </Link>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>
      </article>
      <LumenArcBriefingDialog open={briefingOpen} onClose={() => setBriefingOpen(false)} />
    </Layout>
  );
}
