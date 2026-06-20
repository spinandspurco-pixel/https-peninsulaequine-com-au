import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import {
  getProjectImage,
  getProjectImageAlt,
} from "@/config/projectImagery";

const FILTER = "brightness(0.82) contrast(1.1) saturate(0.8)";

type Project = {
  slug: string;
  code: string;
  category: string;
  title: string;
  location: string;
  year: string;
  status: "Resolved" | "In Progress";
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
    image: getProjectImage("aberdeen", "selectedWorks").url,
    alt: getProjectImageAlt("aberdeen", "selectedWorks"),
    crop: "object-[50%_42%]",
  },
  {
    slug: "/field-notes/covered-arena-stables-build",
    code: "PE-CA-031",
    category: "Covered Arena · Stables",
    title: "Covered Arena & Stables Build",
    location: "Mornington Peninsula",
    year: "2025",
    status: "In Progress",
    image: getProjectImage("covered-arena-stables-build", "selectedWorks").url,
    alt: getProjectImageAlt("covered-arena-stables-build", "selectedWorks"),
    crop: "object-center",
  },
];

const [feature, ...rest] = projects;

function ProjectCard({
  project,
  align,
  index,
}: {
  project: Project;
  align: "left" | "right";
  index: number;
}) {
  return (
    <RevealOnScroll direction="up" duration={1100} delay={index * 120}>
      <Link
        to={project.slug}
        className={`group block relative ${
          align === "right" ? "md:translate-x-6 lg:translate-x-12" : "md:-translate-x-6 lg:-translate-x-12"
        }`}
        aria-label={`${project.title} — ${project.location}`}
      >
        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-background">
          <img
            src={project.image}
            alt={project.alt}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover ${project.crop} will-change-transform transition-[transform,filter] duration-[1100ms] ease-[cubic-bezier(0.45,0,0.15,1)] scale-100 group-hover:scale-[1.02] group-hover:saturate-[0.55]`}
            style={{ filter: FILTER }}
          />
          {/* Bottom-weighted scrim for caption legibility */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />

          {/* Architectural corner ticks */}
          <span aria-hidden className="absolute top-3 left-3 w-4 h-px bg-accent/55" />
          <span aria-hidden className="absolute top-3 left-3 w-px h-4 bg-accent/55" />
          <span aria-hidden className="absolute bottom-3 right-3 w-4 h-px bg-accent/55" />
          <span aria-hidden className="absolute bottom-3 right-3 w-px h-4 bg-accent/55" />

          {/* Overline — top */}
          <div className="absolute top-5 left-5 right-5 flex items-baseline justify-between gap-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.42em] text-foreground/65">
              {project.code}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.42em] text-foreground/45">
              {project.year}
            </p>
          </div>

          {/* Caption — bottom, lifts on hover */}
          <div className="absolute bottom-6 left-6 right-6 transition-transform duration-700 ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:-translate-y-2">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.42em] text-accent/70 mb-2">
              {project.category}
            </p>
            <h3 className="font-serif text-foreground leading-[1.02] tracking-tight text-[clamp(1.6rem,1rem+1.8vw,2.4rem)]">
              {project.title}
            </h3>
            <div className="mt-3 flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.4em] text-foreground/55">
              <span
                aria-hidden
                className={`h-px bg-accent/55 transition-all duration-700 ${
                  project.status === "In Progress" ? "w-5" : "w-8"
                } group-hover:w-14 group-hover:bg-accent`}
              />
              <span>{project.location}</span>
              <span className="text-foreground/30">·</span>
              <span className={project.status === "In Progress" ? "text-accent/75" : "text-foreground/45"}>
                {project.status}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </RevealOnScroll>
  );
}

function FeatureCard({ project }: { project: Project }) {
  return (
    <RevealOnScroll direction="up" duration={1300}>
      <Link to={project.slug} className="group block relative" aria-label={`${project.title} — feature project`}>
        <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden bg-background">
          <img
            src={project.image}
            alt={project.alt}
            loading="eager"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover ${project.crop} will-change-transform transition-[transform,filter] duration-[1300ms] ease-[cubic-bezier(0.45,0,0.15,1)] scale-100 group-hover:scale-[1.02] group-hover:saturate-[0.6]`}
            style={{ filter: FILTER }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />

          {/* Corner brackets — larger for feature */}
          <span aria-hidden className="absolute top-4 left-4 w-6 h-px bg-accent/55" />
          <span aria-hidden className="absolute top-4 left-4 w-px h-6 bg-accent/55" />
          <span aria-hidden className="absolute top-4 right-4 w-6 h-px bg-accent/55" />
          <span aria-hidden className="absolute top-4 right-4 w-px h-6 bg-accent/55" />
          <span aria-hidden className="absolute bottom-4 left-4 w-6 h-px bg-accent/55" />
          <span aria-hidden className="absolute bottom-4 left-4 w-px h-6 bg-accent/55" />
          <span aria-hidden className="absolute bottom-4 right-4 w-6 h-px bg-accent/55" />
          <span aria-hidden className="absolute bottom-4 right-4 w-px h-6 bg-accent/55" />

          <div className="absolute top-6 left-6 right-6 flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/70">
              Feature · {project.code}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/50">
              {project.year}
            </p>
          </div>

          <div className="absolute bottom-8 left-6 right-6 sm:left-10 sm:right-10 max-w-3xl transition-transform duration-700 ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:-translate-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/75 mb-3">
              {project.category}
            </p>
            <h2 className="font-serif text-foreground leading-[0.96] tracking-tight text-[clamp(2.4rem,1.4rem+4.2vw,5.2rem)]">
              {project.title}
            </h2>
            <div className="mt-5 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.42em] text-foreground/65">
              <span aria-hidden className="h-px w-10 bg-accent/55 transition-all duration-700 group-hover:w-20 group-hover:bg-accent" />
              <span>{project.location}</span>
              <span className="text-foreground/30">·</span>
              <span className="text-foreground/50">{project.status}</span>
            </div>
          </div>
        </div>
      </Link>
    </RevealOnScroll>
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
      <main className="bg-background text-foreground type-architectural overflow-x-hidden">
        {/* Page header — engineering grid + bg/55 standard */}
        <section className="relative pt-44 sm:pt-52 pb-20 sm:pb-28 overflow-hidden bg-background/55">
          <div
            className="absolute inset-0 engineering-grid opacity-[0.03]"
            aria-hidden="true"
          />
          <div className="section-container max-w-4xl mx-auto text-center relative z-10">
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/60">
                Selected Works
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1100} delay={150}>
              <h1 className="mt-8 font-serif text-foreground leading-[0.95] tracking-tight text-[clamp(2.4rem,1.4rem+4.6vw,5.4rem)]">
                A closer look at the work.
              </h1>
            </RevealOnScroll>
            <RevealLine width="w-10" delay={280} className="mx-auto mt-10" />
          </div>
        </section>

        {/* Feature project — full bleed */}
        <section className="relative border-t border-accent/10 py-[clamp(3rem,2rem+4vw,6rem)]">
          <div className="section-container max-w-[1480px] mx-auto">
            <FeatureCard project={feature} />
          </div>
        </section>

        {/* Remaining projects — asymmetric grid */}
        <section className="relative border-t border-accent/10 py-[clamp(4rem,3rem+5vw,8rem)]">
          <div className="section-container max-w-[1480px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[clamp(3rem,2rem+4vw,6rem)] gap-x-[clamp(2rem,1rem+3vw,5rem)] items-start">
              {rest.map((project, i) => (
                <div key={project.slug} className={i % 2 === 1 ? "md:mt-24" : ""}>
                  <ProjectCard
                    project={project}
                    align={i % 2 === 0 ? "left" : "right"}
                    index={i}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
