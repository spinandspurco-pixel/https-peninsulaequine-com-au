import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import {
  getProjectImage,
  getProjectImageAlt,
} from "@/config/projectImagery";

/* Single grading filter — matches the new --grade-blueprint token */
const GRADE = "brightness(0.84) contrast(1.08) saturate(0.78)";

type Project = {
  slug: string;
  code: string;
  category: string;
  title: string;
  location: string;
  year: string;
  status: "Resolved" | "In Progress";
  thesis: string;
  image: string;
  alt: string;
  crop: string;
};

const projects: Project[] = [
  {
    slug: "/selected-works/main-ridge-pavilion",
    code: "PE-MR-024",
    category: "Pavilion · Rural Build",
    title: "Main Ridge Pavilion",
    location: "Main Ridge, VIC",
    year: "2024",
    status: "Resolved",
    thesis:
      "A working pavilion held to a residential standard. Built around the horse first, the land second, the silhouette third.",
    image: getProjectImage("main-ridge-pavilion", "selectedWorks").url,
    alt: getProjectImageAlt("main-ridge-pavilion", "selectedWorks"),
    crop: "object-[50%_55%]",
  },
  {
    slug: "/selected-works/aberdeen",
    code: "PE-AB-019",
    category: "Indoor Arena · Stable Precinct",
    title: "Aberdeen",
    location: "Mornington Peninsula",
    year: "2024",
    status: "Resolved",
    thesis:
      "An indoor arena and stable precinct resolved as one structure — drainage, light, sightlines, and movement engineered together.",
    image: getProjectImage("aberdeen", "selectedWorks").url,
    alt: getProjectImageAlt("aberdeen", "selectedWorks"),
    crop: "object-[50%_42%]",
  },
  {
    slug: "/field-notes/covered-arena-stables-build",
    code: "PE-CA-031",
    category: "Covered Arena · Stables",
    title: "Covered Arena & Stables",
    location: "Mornington Peninsula",
    year: "2025",
    status: "In Progress",
    thesis:
      "A working build, documented as it lands. Followed through field notes from ground prep to roof on.",
    image: getProjectImage("covered-arena-stables-build", "selectedWorks").url,
    alt: getProjectImageAlt("covered-arena-stables-build", "selectedWorks"),
    crop: "object-center",
  },
];

const [feature, ...rest] = projects;

/* ─────────────────────────────────────────────────────────────
   ACT I — Silent overture
   Full-bleed first frame. No buttons. No counters above the fold.
   ────────────────────────────────────────────────────────────── */
function Overture() {
  return (
    <section className="relative h-[88svh] min-h-[640px] w-full overflow-hidden bg-background">
      <img
        src={feature.image}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        {...({ fetchpriority: "high" } as any)}
        className={`absolute inset-0 w-full h-full object-cover ${feature.crop}`}
        style={{ filter: "brightness(0.55) contrast(1.05) saturate(0.7)" }}
      />
      {/* Cinematic veil — heavy bottom, soft top */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 30%, transparent 0%, hsl(var(--background) / 0.55) 60%, hsl(var(--background) / 0.95) 100%)",
        }}
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent" />

      {/* Engineering grid — barely there */}
      <div className="absolute inset-0 engineering-grid opacity-[0.025]" aria-hidden />

      {/* Chapter marks — top corners */}
      <div className="absolute top-28 sm:top-32 left-6 sm:left-10 right-6 sm:right-10 flex items-baseline justify-between z-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/55">
          PE / 07 — Selected Works
        </span>
        <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/35">
          {projects.length.toString().padStart(2, "0")} Works · 2024 — 2025
        </span>
      </div>

      {/* Centre title */}
      <div className="absolute inset-x-0 bottom-[18%] sm:bottom-[14%] px-6 sm:px-10 z-10">
        <div className="max-w-5xl">
          <RevealOnScroll direction="up" duration={1100}>
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/70">
              A closer look
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" duration={1400} delay={180}>
            <h1 className="mt-5 font-serif text-foreground/95 leading-[0.92] tracking-tight text-[clamp(2.6rem,1.4rem+5.4vw,6rem)]">
              The works that
              <br />
              speak for themselves.
            </h1>
          </RevealOnScroll>
          <RevealOnScroll direction="up" duration={1100} delay={420}>
            <p className="mt-7 max-w-md font-sans font-light text-foreground/55 text-[0.95rem] leading-[1.75]">
              Completed builds, indoor arenas, and current ground —
              presented as they were resolved on the Mornington Peninsula.
            </p>
          </RevealOnScroll>
        </div>
      </div>

      {/* Scroll cue — bottom right, restrained */}
      <div className="absolute bottom-8 right-6 sm:right-10 z-10 hidden sm:flex items-center gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/40">
          Scroll · {feature.code}
        </span>
        <span aria-hidden className="h-px w-10 bg-accent/40" />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT II — Index Manifest
   A drafting-table contents page. Hover reveals the chapter line.
   ────────────────────────────────────────────────────────────── */
function IndexManifest() {
  return (
    <section className="relative border-t border-accent/10 pe-pause-md">
      <div className="section-container max-w-[1280px]">
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/55">
              Index · 001
            </p>
            <p className="mt-4 font-serif italic text-foreground/70 text-[clamp(1.1rem,0.9rem+0.4vw,1.35rem)] leading-[1.4]">
              What follows is a record, not a portfolio.
            </p>
          </div>
          <ol className="col-span-12 md:col-span-9 divide-y divide-accent/10 border-t border-accent/15">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <a
                  href={`#${p.code}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(p.code)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="group grid grid-cols-12 items-baseline gap-4 py-5 sm:py-6 transition-colors"
                  style={{ transitionDuration: "var(--pe-dur-hold)", transitionTimingFunction: "var(--pe-ease)" }}
                >
                  <span className="col-span-1 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/35 group-hover:text-accent">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="col-span-6 sm:col-span-5 font-serif text-foreground/85 text-[clamp(1.15rem,0.95rem+0.7vw,1.6rem)] tracking-tight leading-tight group-hover:text-foreground">
                    {p.title}
                  </span>
                  <span className="hidden sm:block col-span-3 font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/45">
                    {p.location}
                  </span>
                  <span className="col-span-3 sm:col-span-2 text-right font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/45">
                    {p.year}
                  </span>
                  <span className="col-span-2 sm:col-span-1 text-right font-mono text-[10px] uppercase tracking-[0.4em] text-accent/55 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT III — Project Chapter
   Each project as a full-width slab. Image and text held in
   asymmetric balance; alternating side at desktop.
   ────────────────────────────────────────────────────────────── */
function ProjectChapter({
  project,
  index,
  isFeature = false,
}: {
  project: Project;
  index: number;
  isFeature?: boolean;
}) {
  const flip = index % 2 === 1;
  return (
    <section
      id={project.code}
      className="relative border-t border-accent/10 pe-pause-lg scroll-mt-24"
    >
      <div className="section-container max-w-[1480px]">
        {/* Chapter overline */}
        <div className="flex items-baseline justify-between mb-10 sm:mb-14">
          <div className="flex items-baseline gap-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/55">
              {isFeature ? "Feature" : `Chapter ${index.toString().padStart(2, "0")}`}
            </span>
            <span aria-hidden className="h-px w-10 sm:w-16 bg-accent/30" />
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/45">
              {project.code}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/35">
            {project.year}
          </span>
        </div>

        <div
          className={`grid grid-cols-12 gap-y-10 gap-x-8 lg:gap-x-12 items-end ${
            flip ? "md:[direction:rtl]" : ""
          }`}
        >
          {/* Image — 8 cols, full bleed feature gets 12 */}
          <div className={`col-span-12 ${isFeature ? "" : "md:col-span-8"} [direction:ltr]`}>
            <Link
              to={project.slug}
              className="group block relative"
              aria-label={`${project.title} — ${project.location}`}
            >
              <div
                className={`relative overflow-hidden bg-card ${
                  isFeature ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[4/5] md:aspect-[5/6]"
                }`}
              >
                <img
                  src={project.image}
                  alt={project.alt}
                  loading={isFeature ? "eager" : "lazy"}
                  decoding="async"
                  className={`absolute inset-0 w-full h-full object-cover ${project.crop} will-change-transform group-hover:scale-[1.025]`}
                  style={{
                    filter: GRADE,
                    transition:
                      "transform var(--pe-dur-cinematic) var(--pe-ease), filter var(--pe-dur-cinematic) var(--pe-ease)",
                  }}
                />
                {/* Soft veil only on hover for image lift */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    transition: "opacity var(--pe-dur-hold) var(--pe-ease)",
                    background:
                      "linear-gradient(180deg, transparent 60%, hsl(var(--background) / 0.45) 100%)",
                  }}
                />

                {/* Corner brackets — only on feature */}
                {isFeature && (
                  <>
                    <span aria-hidden className="absolute top-4 left-4 w-6 h-px bg-accent/55" />
                    <span aria-hidden className="absolute top-4 left-4 w-px h-6 bg-accent/55" />
                    <span aria-hidden className="absolute top-4 right-4 w-6 h-px bg-accent/55" />
                    <span aria-hidden className="absolute top-4 right-4 w-px h-6 bg-accent/55" />
                    <span aria-hidden className="absolute bottom-4 left-4 w-6 h-px bg-accent/55" />
                    <span aria-hidden className="absolute bottom-4 left-4 w-px h-6 bg-accent/55" />
                    <span aria-hidden className="absolute bottom-4 right-4 w-6 h-px bg-accent/55" />
                    <span aria-hidden className="absolute bottom-4 right-4 w-px h-6 bg-accent/55" />
                  </>
                )}

                {/* Status badge — only In Progress, top-left */}
                {project.status === "In Progress" && (
                  <div className="absolute top-5 left-5 z-10 flex items-center gap-2 bg-background/60 backdrop-blur-sm px-3 py-1.5 border-l border-accent/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-subtle" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/80">
                      Live · In Progress
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Caption — 4 cols beside, or full-width for feature */}
          <div
            className={`col-span-12 ${
              isFeature ? "md:col-span-12 max-w-3xl" : "md:col-span-4"
            } [direction:ltr]`}
          >
            <RevealOnScroll direction="up" duration={1100}>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.45em] text-accent/70">
                {project.category}
              </p>
              <h2
                className={`mt-5 font-serif text-foreground leading-[0.96] tracking-tight ${
                  isFeature
                    ? "text-[clamp(2.4rem,1.4rem+4vw,4.8rem)]"
                    : "text-[clamp(1.75rem,1.2rem+1.8vw,2.6rem)]"
                }`}
              >
                {project.title}
              </h2>
              <p
                className={`mt-6 font-serif italic text-foreground/65 leading-[1.5] ${
                  isFeature
                    ? "text-[clamp(1.05rem,0.9rem+0.6vw,1.35rem)] max-w-2xl"
                    : "text-[0.98rem]"
                }`}
              >
                {project.thesis}
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6 max-w-md font-mono text-[10px] uppercase tracking-[0.4em]">
                <dt className="text-foreground/35">Location</dt>
                <dd className="text-foreground/70">{project.location}</dd>
                <dt className="text-foreground/35">Year</dt>
                <dd className="text-foreground/70">{project.year}</dd>
                <dt className="text-foreground/35">Status</dt>
                <dd className={project.status === "In Progress" ? "text-accent/85" : "text-foreground/70"}>
                  {project.status}
                </dd>
              </dl>

              <Link
                to={project.slug}
                className="group mt-10 inline-flex items-baseline gap-4 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/70 hover:text-accent"
                style={{ transition: "color var(--pe-dur-hold) var(--pe-ease)" }}
              >
                <span>Open Chapter</span>
                <span
                  aria-hidden
                  className="h-px w-10 bg-accent/40 group-hover:w-20 group-hover:bg-accent"
                  style={{
                    transition:
                      "width var(--pe-dur-hold) var(--pe-ease), background-color var(--pe-dur-hold) var(--pe-ease)",
                  }}
                />
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Interstitial — italic serif breath
   ────────────────────────────────────────────────────────────── */
function Pause({ children, mark }: { children: React.ReactNode; mark: string }) {
  return (
    <section className="relative border-t border-accent/10 pe-pause-md">
      <div className="section-container max-w-3xl text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/45">{mark}</p>
        <p className="mt-6 font-serif italic text-foreground/75 text-[clamp(1.3rem,1rem+1.2vw,1.95rem)] leading-[1.45]">
          {children}
        </p>
        <RevealLine width="w-10" className="mx-auto mt-8" />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACT V — Closing
   ────────────────────────────────────────────────────────────── */
function Closing() {
  return (
    <section className="relative border-t border-accent/10 pe-pause-lg">
      <div className="section-container max-w-4xl">
        <div className="flex flex-col items-start gap-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/55">
            End of record · 002
          </p>
          <h2 className="font-serif text-foreground/95 leading-[0.96] tracking-tight text-[clamp(2rem,1.3rem+2.6vw,3.5rem)] max-w-2xl">
            More ground in progress.
            <br />
            <span className="text-foreground/55 italic font-normal">Resolved as it lands.</span>
          </h2>
          <p className="font-sans font-light text-foreground/55 text-[0.95rem] leading-[1.75] max-w-md">
            We take on a small number of builds each year on the Mornington
            Peninsula. Selection begins with a written brief.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-6 sm:gap-10 mt-2">
            <Link
              to="/contact"
              className="group inline-flex items-baseline gap-4 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground hover:text-accent"
              style={{ transition: "color var(--pe-dur-hold) var(--pe-ease)" }}
            >
              <span>Apply to Build</span>
              <span
                aria-hidden
                className="h-px w-12 bg-accent/55 group-hover:w-24 group-hover:bg-accent"
                style={{
                  transition:
                    "width var(--pe-dur-hold) var(--pe-ease), background-color var(--pe-dur-hold) var(--pe-ease)",
                }}
              />
            </Link>
            <Link
              to="/field-notes"
              className="font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/55 hover:text-foreground transition-colors"
              style={{ transition: "color var(--pe-dur-hold) var(--pe-ease)" }}
            >
              Read Field Notes →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SelectedWorks() {
  useEffect(() => {
    document.title = "Selected Works | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Selected Works from Peninsula Equine — completed rural builds, indoor arenas and current equine projects across the Mornington Peninsula.",
    );
    return () => {
      document.title = "Peninsula Equine";
      if (meta && prev) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <Layout>
      <main className="bg-background text-foreground type-architectural overflow-x-clip">
        <Overture />
        <IndexManifest />
        <ProjectChapter project={feature} index={1} isFeature />
        <Pause mark="Intermission · 001">
          Function before noise. Resolved before presented.
        </Pause>
        {rest.map((project, i) => (
          <ProjectChapter key={project.slug} project={project} index={i + 2} />
        ))}
        <Closing />
      </main>
    </Layout>
  );
}
