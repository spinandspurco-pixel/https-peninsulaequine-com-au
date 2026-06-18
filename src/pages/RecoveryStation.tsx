import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealImage, RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";
import { BlueprintContinuity } from "@/components/BlueprintContinuity";
import { LumenArcEntrance } from "@/components/lumenarc/LumenArcEntrance";
import { LumenArcBriefingDialog } from "@/components/lumenarc/LumenArcBriefingDialog";
import comingSoonAsset from "@/assets/lumenarc/coming-soon.asset.json";
import canopyAsset from "@/assets/lumenarc/canopy.asset.json";
import controlColumnAsset from "@/assets/lumenarc/control-column.asset.json";
import appAsset from "@/assets/lumenarc/app.asset.json";
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

// Five chapters. Fewer, stronger, more breathing room.
// Luxury reveals less, not more.
const chapters: LumenArcChapter[] = [
  {
    number: "01",
    label: "The Pavilion",
    title: "An architectural canopy built around the horse.",
    body:
      "Directed infrared, tempered airflow and equine-safe geometry resolved into one quiet structure — engineered for warm-up, post-work comfort and everyday use in real yards.",
    notes: ["Infrared canopy", "Open-air safety", "Engineered for daily use"],
    image: canopyAsset.url,
    alt: "LumenArc infrared canopy concept with horse standing beneath illuminated recovery canopy in a moody stable courtyard",
    align: "left",
    disclaimer: "Future concept. Designed to support comfort and routine. Not a medical device.",
  },
  {
    number: "02",
    label: "The Intelligence",
    title: "Oversight resolved into a single architectural touchpoint.",
    body:
      "The control column consolidates session timing, thermal mapping and safety logic into one object — replacing scattered equipment with a deliberate, readable instrument.",
    notes: ["Session control", "Thermal mapping", "Layered safety"],
    image: controlColumnAsset.url,
    alt: "LumenArc intelligent control column concept beside horse recovery canopy with illuminated controls and safety hardware",
    align: "right",
    disclaimer: "Interface and monitoring views shown as concept visuals in development.",
  },
  {
    number: "03",
    label: "The Companion",
    title: "A quieter digital extension of the system.",
    body:
      "A future app layer carries horse profiles, session controls and usage history with the rider or stable manager — extending the architecture without intruding on it.",
    notes: ["Horse profiles", "Session controls", "Usage history"],
    image: appAsset.url,
    alt: "LumenArc mobile control app concept shown in hand with illuminated recovery canopy in the background",
    align: "left",
    disclaimer: "App experience shown as a future concept. Features subject to refinement.",
  },
  {
    number: "04",
    label: "Recovery Modes",
    title: "Conditions tuned for season, work and quieter moments.",
    body:
      "Mist, cooling, air quality and further environmental modes are being developed as lighter settings inside the same canopy — supporting summer cool-down, post-work reset and future recovery systems.",
    notes: ["Recovery mist", "Cooling + air quality", "Future modes"],
    image: recoveryMistAsset.url,
    alt: "LumenArc recovery mist mode concept with horse beneath illuminated canopy and fine cooling mist",
    align: "right",
    disclaimer: "Operating modes in development. No diagnostic or treatment claims are made.",
  },
  {
    number: "05",
    label: "The Precinct",
    title: "A future Peninsula Equine ecosystem, built around recovery.",
    body:
      "Beyond a single structure, LumenArc sits inside a wider facility direction — where landscape, infrastructure, circulation and oversight are conceived as one premium equine environment.",
    notes: ["Facility ecosystem", "Premium infrastructure", "Long-horizon planning"],
    image: wellnessPrecinctAsset.url,
    alt: "LumenArc wellness precinct concept showing broader premium equine facility ecosystem at night",
    align: "left",
    disclaimer: "Precinct visual shown as future direction only. Elements remain in development.",
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
  // Deeper directional bleed — image escapes its column on the outer edge
  // and dissolves into the page, never reads as a card.
  const imageBleed =
    align === "right"
      ? "lg:-mr-[5.5rem] xl:-mr-[8rem]"
      : "lg:-ml-[5.5rem] xl:-ml-[8rem]";

  return (
    <section
      className="relative py-[clamp(6rem,4rem+8vw,12rem)] la-chapter-section group/chapter outline-none"
      tabIndex={0}
      aria-label={`${label} — chapter ${number}`}
    >
      {/* Interactive blueprint overlay — revealed on hover/focus, respects reduced motion */}
      <div
        aria-hidden="true"
        className="la-chapter-overlay pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-[1200ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover/chapter:opacity-100 group-focus-within/chapter:opacity-100"
      >
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-screen"
          style={{
            backgroundImage:
              "linear-gradient(0deg, hsl(var(--accent)/0.55) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)/0.55) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <svg
          className="la-overlay-lines absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line x1="0" y1="14" x2="100" y2="14" stroke="hsl(var(--accent)/0.35)" strokeWidth="0.12" vectorEffect="non-scaling-stroke" pathLength={1} />
          <line x1="0" y1="86" x2="100" y2="86" stroke="hsl(var(--accent)/0.35)" strokeWidth="0.12" vectorEffect="non-scaling-stroke" pathLength={1} />
          <line x1={align === "right" ? "78" : "22"} y1="0" x2={align === "right" ? "78" : "22"} y2="100" stroke="hsl(var(--accent)/0.22)" strokeWidth="0.1" vectorEffect="non-scaling-stroke" pathLength={1} />
        </svg>
        <div className="absolute top-6 right-6 flex items-baseline gap-3 font-mono text-accent/60 text-[0.55rem] tracking-[0.42em] tabular-nums uppercase">
          <span className="h-px w-6 bg-accent/40" />
          <span>LA · {number}</span>
        </div>
        <div className="absolute bottom-6 left-6 font-mono text-accent/55 text-[0.55rem] tracking-[0.42em] uppercase">
          {label}
        </div>
      </div>

      <div className="section-container relative z-10 grid grid-cols-12 gap-[clamp(2rem,1.5rem+2.4vw,5rem)] items-center">
        <div className={`col-span-12 lg:col-span-8 ${imageOrder}`}>
          <RevealImage delay={100} duration={1400}>
            {/* Larger, more cinematic plate — taller on mobile, wider on lg */}
            <div
              className={`relative aspect-[4/5] sm:aspect-[3/2] lg:aspect-[16/11] overflow-hidden ${imageBleed} la-chapter-plate`}
            >
              <img
                src={image}
                alt={alt}
                loading="lazy"
                width={1600}
                height={1100}
                className="absolute inset-0 h-full w-full object-cover image-bleed la-chapter-img"
                style={{ filter: "brightness(0.84) contrast(1.1) saturate(0.8)" }}
              />
              {/* Deeper cinematic vignette */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,hsl(var(--background)/0.65)_100%)]" />
              {/* Directional dissolve into the page on the inner edge */}
              <div
                className={`pointer-events-none absolute inset-y-0 w-2/5 ${
                  align === "right"
                    ? "right-0 bg-[linear-gradient(270deg,hsl(var(--background))_0%,transparent_100%)]"
                    : "left-0 bg-[linear-gradient(90deg,hsl(var(--background))_0%,transparent_100%)]"
                }`}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(0deg,hsl(var(--background))_0%,transparent_100%)]" />
              {/* Blueprint plate overlay — drafting grid screen-blended */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
                style={{
                  backgroundImage:
                    "linear-gradient(0deg, hsl(var(--accent)/0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)/0.6) 1px, transparent 1px)",
                  backgroundSize: "80px 80px",
                }}
              />
              {/* Blueprint corner ticks — drawn-in architectural frame */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full la-chapter-ticks"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* TL */}
                <polyline
                  points="2,8 2,2 8,2"
                  fill="none"
                  stroke="hsl(var(--accent) / 0.55)"
                  strokeWidth="0.18"
                  vectorEffect="non-scaling-stroke"
                  pathLength={1}
                />
                {/* BR */}
                <polyline
                  points="92,98 98,98 98,92"
                  fill="none"
                  stroke="hsl(var(--accent) / 0.55)"
                  strokeWidth="0.18"
                  vectorEffect="non-scaling-stroke"
                  pathLength={1}
                />
              </svg>
              {/* Edge-anchored chapter number — engineering plate label */}
              <div
                className={`pointer-events-none absolute bottom-4 ${
                  align === "right" ? "right-5" : "left-5"
                } font-mono text-accent/65 text-[0.6rem] tracking-[0.5em] tabular-nums la-chapter-plate-label`}
              >
                LA · {number}
              </div>
            </div>
          </RevealImage>
        </div>

        <div className={`col-span-12 lg:col-span-4 ${copyOrder}`}>
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

/**
 * BlueprintTransition
 *
 * Thin architectural seam between chapters — a hairline drafting thread with
 * a centred tick and the next chapter number. Draws in on scroll so each
 * chapter feels stitched into the same plate rather than stacked as separate
 * pages. Mirrors LumenArcEntrance / BlueprintContinuity language.
 */
function BlueprintTransition({ next }: { next: string }) {
  return (
    <div
      aria-hidden="true"
      className="relative py-[clamp(2rem,1.25rem+2vw,4rem)]"
    >
      <div className="section-container">
        <div className="relative mx-auto flex items-center justify-center la-chapter-seam">
          {/* Left hairline */}
          <span className="h-px flex-1 max-w-[28rem] bg-[linear-gradient(90deg,transparent_0%,hsl(var(--accent)/0.32)_85%,hsl(var(--accent)/0.5)_100%)] la-seam-line-l" />
          {/* Centre tick + number */}
          <span className="relative mx-4 flex items-center gap-3">
            <span className="block h-[6px] w-px bg-accent/55" />
            <span className="font-mono text-accent/55 text-[0.58rem] tracking-[0.45em] tabular-nums la-seam-number">
              {next}
            </span>
            <span className="block h-[6px] w-px bg-accent/55" />
          </span>
          {/* Right hairline */}
          <span className="h-px flex-1 max-w-[28rem] bg-[linear-gradient(270deg,transparent_0%,hsl(var(--accent)/0.32)_85%,hsl(var(--accent)/0.5)_100%)] la-seam-line-r" />
        </div>
      </div>
    </div>
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
            className="absolute inset-0 h-full w-full object-contain md:object-cover object-center"
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
          <Fragment key={chapter.number}>
            <LumenArcChapterSection
              {...chapter}
              align={index % 2 === 0 ? chapter.align ?? "left" : chapter.align ?? "right"}
            />
            {index < chapters.length - 1 && (
              <BlueprintTransition next={chapters[index + 1].number} />
            )}
          </Fragment>
        ))}

        {/* Closing seam into the briefing CTA */}
        <BlueprintTransition next="06" />

        <style>{`
          @keyframes la-chapter-img-in {
            0% { transform: scale(1.06); filter: brightness(0.7) contrast(1.1) saturate(0.78); }
            100% { transform: scale(1); filter: brightness(0.84) contrast(1.1) saturate(0.8); }
          }
          @keyframes la-chapter-tick-draw {
            0% { stroke-dashoffset: 1; opacity: 0; }
            100% { stroke-dashoffset: 0; opacity: 1; }
          }
          @keyframes la-chapter-label-in {
            0% { opacity: 0; transform: translateY(4px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes la-seam-line-in {
            0% { transform: scaleX(0); opacity: 0; }
            100% { transform: scaleX(1); opacity: 1; }
          }
          @keyframes la-seam-number-in {
            0% { opacity: 0; letter-spacing: 0.6em; }
            100% { opacity: 1; letter-spacing: 0.45em; }
          }

          .la-chapter-img {
            animation: la-chapter-img-in 1800ms cubic-bezier(0.45, 0, 0.15, 1) both;
            transform-origin: center;
          }
          .la-chapter-ticks polyline {
            stroke-dasharray: 1;
            animation: la-chapter-tick-draw 1400ms cubic-bezier(0.45, 0, 0.15, 1) 400ms both;
          }
          .la-chapter-plate-label {
            animation: la-chapter-label-in 900ms cubic-bezier(0.45, 0, 0.15, 1) 900ms both;
          }
          .la-seam-line-l { transform-origin: right center; animation: la-seam-line-in 1100ms cubic-bezier(0.45, 0, 0.15, 1) both; }
          .la-seam-line-r { transform-origin: left center;  animation: la-seam-line-in 1100ms cubic-bezier(0.45, 0, 0.15, 1) both; }
          .la-seam-number  { animation: la-seam-number-in 1100ms cubic-bezier(0.45, 0, 0.15, 1) 200ms both; }

          @keyframes la-overlay-line-draw {
            0% { stroke-dashoffset: 1; }
            100% { stroke-dashoffset: 0; }
          }
          .la-chapter-overlay .la-overlay-lines line {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
          }
          .la-chapter-section:hover .la-overlay-lines line,
          .la-chapter-section:focus-within .la-overlay-lines line {
            animation: la-overlay-line-draw 1400ms cubic-bezier(0.45, 0, 0.15, 1) forwards;
          }
          .la-chapter-section:hover .la-overlay-lines line:nth-child(2),
          .la-chapter-section:focus-within .la-overlay-lines line:nth-child(2) {
            animation-delay: 120ms;
          }
          .la-chapter-section:hover .la-overlay-lines line:nth-child(3),
          .la-chapter-section:focus-within .la-overlay-lines line:nth-child(3) {
            animation-delay: 240ms;
          }

          @media (prefers-reduced-motion: reduce) {
            .la-chapter-img,
            .la-chapter-ticks polyline,
            .la-chapter-plate-label,
            .la-seam-line-l,
            .la-seam-line-r,
            .la-seam-number {
              animation: none;
              opacity: 1;
              transform: none;
              filter: none;
              stroke-dashoffset: 0;
              letter-spacing: 0.45em;
            }
            .la-chapter-overlay {
              transition: none !important;
            }
            .la-chapter-overlay .la-overlay-lines line {
              stroke-dashoffset: 0;
              animation: none !important;
            }
          }
        `}</style>

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
