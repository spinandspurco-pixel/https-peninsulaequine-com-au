import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";
import {
  getProjectImage,
  getProjectImageAlt,
} from "@/config/projectImagery";

const FILTER = "brightness(0.82) contrast(1.1) saturate(0.8)";

const projects = [
  {
    slug: "/selected-works/main-ridge-pavilion",
    category: "Pavilion / Rural Build",
    status: "Completed",
    title: "Main Ridge Pavilion",
    copy:
      "A warm rural pavilion built around timber, brick, steel, fire and view.",
    image: getProjectImage("main-ridge-pavilion", "selectedWorks").url,
    alt: getProjectImageAlt("main-ridge-pavilion", "selectedWorks"),
    crop: "object-[50%_55%]",
  },
  {
    slug: "/selected-works/aberdeen",
    category: "Indoor Arena / Stable Precinct",
    status: "Completed",
    title: "Aberdeen",
    copy:
      "A refined equine facility with indoor riding, stable detailing, viewing spaces and practical daily flow.",
    image: getProjectImage("aberdeen", "selectedWorks").url,
    alt: getProjectImageAlt("aberdeen", "selectedWorks"),
    crop: "object-[50%_42%]",
  },
  {
    slug: "/field-notes/covered-arena-stables-build",
    category: "Covered Arena / Stables",
    status: "In Progress",
    title: "Covered Arena & Stables Build",
    copy:
      "A current project documenting steel, shelter, drainage, base preparation and stable infrastructure as the build comes together.",
    image: getProjectImage("covered-arena-stables-build", "selectedWorks").url,
    alt: getProjectImageAlt("covered-arena-stables-build", "selectedWorks"),
    crop: "object-center",
  },
];

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
      <main className="bg-background text-foreground type-architectural">
        {/* Hero */}
        <section className="relative pt-44 sm:pt-52 pb-16 sm:pb-24 overflow-hidden">
          <div
            className="absolute inset-0 engineering-grid opacity-[0.03]"
            aria-hidden="true"
          />
          <div className="section-container max-w-4xl mx-auto text-center relative z-10">
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/55">
                Selected Works
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1100} delay={150}>
              <h1 className="mt-8 font-serif text-foreground leading-[0.95] tracking-tight text-[clamp(2.4rem,1.4rem+4.6vw,5.4rem)]">
                Selected Works
              </h1>
            </RevealOnScroll>
            <RevealLine width="w-10" delay={280} className="mx-auto mt-10" />
            <RevealOnScroll direction="up" duration={1000} delay={340}>
              <p className="mt-10 max-w-xl mx-auto font-sans font-light text-foreground/55 leading-[1.85] text-[14px] sm:text-[15px]">
                A closer look at the environments, structures and details shaped
                from the ground up.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* Project cards */}
        <section className="relative border-t border-accent/10">
          <div className="section-container max-w-[1480px] mx-auto">
            {projects.map((project, i) => (
              <article
                key={project.slug}
                className="py-[clamp(4rem,2.5rem+5vw,7rem)] border-b border-accent/10 last:border-b-0"
              >
                <Link to={project.slug} className="group block">
                  <RevealOnScroll direction="up" duration={1200}>
                    <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.alt}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.025] ${project.crop}`}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        style={{ filter: FILTER }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    </div>
                  </RevealOnScroll>

                  <div className="mt-8 sm:mt-10 grid grid-cols-12 gap-6 lg:gap-12 items-end">
                    <div className="col-span-12 md:col-span-7 space-y-3 sm:space-y-4">
                      <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.42em]">
                        {project.category}
                      </p>
                      <h2 className="font-serif text-foreground/92 group-hover:text-foreground transition-colors duration-500 leading-[1.02] tracking-tight text-[clamp(1.9rem,1.2rem+2.4vw,3.1rem)]">
                        {project.title}
                      </h2>
                      <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] sm:text-[15px] max-w-xl">
                        {project.copy}
                      </p>
                    </div>
                    <div className="col-span-12 md:col-span-5 md:text-right space-y-2">
                      <p className="font-mono uppercase text-accent/45 text-[9.5px] tracking-[0.42em]">
                        Status — {project.status}
                      </p>
                      <span className="inline-flex items-center gap-3 font-mono uppercase text-foreground/72 group-hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]">
                        <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                        {project.status === "In Progress"
                          ? "View Field Note"
                          : "View Project"}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
