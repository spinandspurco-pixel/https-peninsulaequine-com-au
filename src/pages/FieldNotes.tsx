import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine, RevealImage } from "@/components/RevealOnScroll";

// Editorial imagery sourced from existing project library.
import heroImg from "@/assets/main-ridge-timber.jpg";
import mrFrame from "@/assets/main-ridge-barn-frame.jpg";
import mrBrick from "@/assets/main-ridge-brickwork.jpg";
import mrTimber from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mrTimber2 from "@/assets/main-ridge-ciro-woodwork-2.jpg";
import mrGround from "@/assets/main-ridge-site-prep.jpg";
import mrRebar from "@/assets/main-ridge-rebar-foundation.jpg";
import mrCrane from "@/assets/main-ridge-crane-lift.jpg";
import mrInterior from "@/assets/main-ridge-finished-interior-1.jpg";
import mrInterior2 from "@/assets/main-ridge-finished-interior-2.jpg";
import aberdeenExt from "@/assets/aberdeen-exterior.jpg";
import arenaPrep from "@/assets/arena-sand-prep-1.jpg";
import coveredArena from "@/assets/covered-arena-black-exterior.jpg";

type Status = "In Progress" | "Completed";
type Category =
  | "Arenas"
  | "Stables"
  | "Pavilions"
  | "Groundworks"
  | "Custom Details";

interface Project {
  slug: string;
  name: string;
  location: string;
  categories: Category[];
  status: Status;
  latest: string;
  image: string;
  alt: string;
}

const filters: Array<Category | Status | "All"> = [
  "All",
  "Arenas",
  "Stables",
  "Pavilions",
  "Groundworks",
  "Custom Details",
  "In Progress",
  "Completed",
];

const projects: Project[] = [
  {
    slug: "main-ridge-pavilion",
    name: "Main Ridge Pavilion",
    location: "Main Ridge, Mornington Peninsula",
    categories: ["Pavilions", "Custom Details"],
    status: "In Progress",
    latest:
      "Timber, corrugated steel, brick firebox and custom-built table details coming together.",
    image: mrTimber,
    alt: "Main Ridge Pavilion — timber framing and custom joinery in progress",
  },
  {
    slug: "private-estate-arena",
    name: "Private Estate — Covered Arena",
    location: "Red Hill, Mornington Peninsula",
    categories: ["Arenas", "Groundworks"],
    status: "In Progress",
    latest:
      "Sub-base laid, drainage tuned, structural steel arriving end of month.",
    image: arenaPrep,
    alt: "Private estate covered arena — graded sub-base and surface preparation",
  },
  {
    slug: "aberdeen-stable-complex",
    name: "Aberdeen Stable Complex",
    location: "Mornington Peninsula",
    categories: ["Stables", "Custom Details"],
    status: "Completed",
    latest:
      "Final commissioning complete. Stone, timber and bronze hardware resolved as one gesture.",
    image: aberdeenExt,
    alt: "Aberdeen stable complex — completed exterior at dusk",
  },
  {
    slug: "covered-arena-black",
    name: "Black Pavilion Arena",
    location: "Main Ridge",
    categories: ["Arenas", "Pavilions"],
    status: "Completed",
    latest:
      "Blackened steel envelope handed over — interior lighting tuned for evening sessions.",
    image: coveredArena,
    alt: "Black pavilion covered arena — completed exterior",
  },
];

const mainRidgeTimeline = [
  {
    n: "I",
    title: "The Groundwork",
    body:
      "Site stripped, levels set, drainage and services trenched. The pad is the building before the building.",
    image: mrGround,
    alt: "Main Ridge Pavilion — site preparation and grading",
  },
  {
    n: "II",
    title: "Frame & Form",
    body:
      "Foundations poured, rebar tied, posts plumbed. The pavilion's footprint becomes architecture.",
    image: mrFrame,
    alt: "Main Ridge Pavilion — timber frame and steel rising",
  },
  {
    n: "III",
    title: "Fire & Iron",
    body:
      "Brick firebox laid by hand, corrugated steel skin lifted in. Heat, mass and material take their place.",
    image: mrBrick,
    alt: "Main Ridge Pavilion — brick firebox under construction",
  },
  {
    n: "IV",
    title: "Custom Table & Finish",
    body:
      "Solid timber table fabricated on site. Joinery, bronze hardware and lighting tuned for long evenings.",
    image: mrTimber2,
    alt: "Main Ridge Pavilion — custom timber table and joinery",
  },
  {
    n: "V",
    title: "Final Reveal",
    body:
      "Photography to follow. The pavilion will be commissioned alongside the main stable in 2026.",
    image: mrInterior,
    alt: "Main Ridge Pavilion — final reveal placeholder",
  },
];

const mainRidgeGallery = [
  { src: mrGround, alt: "Site preparation" },
  { src: mrRebar, alt: "Rebar foundation detail" },
  { src: mrCrane, alt: "Crane lift — frame raising" },
  { src: mrFrame, alt: "Timber frame closeup" },
  { src: mrBrick, alt: "Brick firebox detail" },
  { src: mrTimber, alt: "Timber joinery in progress" },
  { src: mrTimber2, alt: "Custom table fabrication" },
  { src: mrInterior2, alt: "Pavilion interior — finishing" },
];

export default function FieldNotes() {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("All");
  const [openProject, setOpenProject] = useState<string | null>(
    "main-ridge-pavilion",
  );

  const visible = useMemo(() => {
    if (activeFilter === "All") return projects;
    return projects.filter((p) =>
      activeFilter === "In Progress" || activeFilter === "Completed"
        ? p.status === activeFilter
        : p.categories.includes(activeFilter as Category),
    );
  }, [activeFilter]);

  return (
    <Layout>
      <article className="bg-background text-foreground">
        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="relative h-[92vh] min-h-[620px] overflow-hidden">
          <img
            src={heroImg}
            alt="Peninsula Equine Field Notes — timber and steel pavilion frame at dusk"
            width={1792}
            height={1024}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.7) contrast(1.15) saturate(0.78)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_45%,transparent,rgba(0,0,0,0.6))]" />

          <div className="absolute bottom-0 left-0 right-0 px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+5vw,6rem)] z-10">
            <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6 items-end">
              <div className="col-span-12 lg:col-span-9 space-y-[clamp(1.25rem,1rem+1vw,2rem)]">
                <RevealOnScroll direction="up" duration={900} delay={200}>
                  <p className="font-mono uppercase text-[hsl(38_45%_70%)]/70 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                    Field Notes — Live From the Ground
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1100} delay={400}>
                  <h1 className="font-serif text-white tracking-[-0.025em] leading-[0.95] text-[clamp(2.25rem,1.2rem+5vw,5rem)]">
                    From Dirt to Dynasty<br className="hidden sm:block" /> — Current Projects.
                  </h1>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1100} delay={700}>
                  <p className="font-serif italic text-white/65 max-w-xl leading-[1.55] text-[clamp(0.875rem,0.78rem+0.4vw,1.0625rem)]">
                    Follow current Peninsula Equine builds as they move from raw
                    site work to finished equine environments — through progress
                    imagery, material details, video updates and behind-the-scenes
                    craftsmanship.
                  </p>
                </RevealOnScroll>
              </div>
              <div className="hidden lg:block col-span-3">
                <RevealOnScroll direction="none" duration={1400} delay={900}>
                  <div className="w-12 h-px bg-[hsl(38_45%_70%)]/60 mb-3" />
                  <p className="font-mono uppercase text-white/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                    Updated Regularly.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FILTERS ──────────────────────────────────────── */}
        <section className="relative bg-card border-y border-foreground/[0.06]">
          <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] py-[clamp(1.5rem,1rem+1.5vw,2.5rem)]">
            <div className="flex flex-wrap items-center gap-x-[clamp(1.25rem,0.75rem+1.5vw,2.5rem)] gap-y-3">
              <p className="font-mono uppercase text-foreground/35 text-[10px] tracking-[0.45em] mr-2">
                Filter
              </p>
              {filters.map((f) => {
                const active = activeFilter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setActiveFilter(f)}
                    className={`group inline-flex items-center gap-2 font-mono uppercase text-[10px] tracking-[0.32em] transition-colors duration-500 ${
                      active
                        ? "text-[hsl(38_45%_65%)]"
                        : "text-foreground/45 hover:text-foreground/80"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`h-px transition-all duration-500 ${
                        active
                          ? "w-6 bg-[hsl(38_45%_65%)]"
                          : "w-3 bg-foreground/25 group-hover:w-5"
                      }`}
                    />
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── PROJECT CARDS ────────────────────────────────── */}
        <section className="relative py-[clamp(5rem,3rem+6vw,9rem)] bg-background">
          <div className="max-w-7xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
            {visible.length === 0 ? (
              <p className="font-serif italic text-foreground/50 text-center py-20">
                No projects in this category right now. Check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(2rem,1.5rem+2vw,3.5rem)]">
                {visible.map((p, i) => {
                  const isOpen = openProject === p.slug;
                  return (
                    <RevealOnScroll
                      key={p.slug}
                      direction="up"
                      duration={1000}
                      delay={i * 100}
                    >
                      <article className="group flex flex-col h-full">
                        <div className="relative aspect-[4/3] overflow-hidden bg-card">
                          <img
                            src={p.image}
                            alt={p.alt}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2200ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:scale-[1.04]"
                            style={{
                              filter:
                                "brightness(0.82) contrast(1.12) saturate(0.78)",
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                          <span
                            className={`absolute top-4 left-4 inline-flex items-center gap-2 font-mono uppercase text-[10px] tracking-[0.32em] px-3 py-1.5 backdrop-blur-sm ${
                              p.status === "In Progress"
                                ? "bg-[hsl(38_45%_60%)]/15 text-[hsl(38_55%_80%)]"
                                : "bg-white/10 text-white/80"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.status === "In Progress"
                                  ? "bg-[hsl(38_55%_70%)] animate-pulse"
                                  : "bg-white/70"
                              }`}
                            />
                            {p.status}
                          </span>
                        </div>

                        <div className="pt-7 space-y-4 flex-1 flex flex-col">
                          <p className="font-mono uppercase text-foreground/35 text-[10px] tracking-[0.4em]">
                            {p.location}
                          </p>
                          <h2 className="font-serif text-foreground/90 leading-[1.1] tracking-[-0.02em] text-[clamp(1.4rem,1rem+1.4vw,1.9rem)]">
                            {p.name}
                          </h2>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {p.categories.map((c) => (
                              <span
                                key={c}
                                className="font-mono uppercase text-[hsl(38_35%_55%)]/70 text-[10px] tracking-[0.3em]"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                          <RevealLine width="w-6" />
                          <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] flex-1">
                            {p.latest}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenProject(isOpen ? null : p.slug)
                            }
                            className="group/cta inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-[hsl(38_55%_70%)] transition-colors duration-500 text-[10px] tracking-[0.4em] pt-2 self-start"
                            aria-expanded={isOpen}
                            aria-controls={`detail-${p.slug}`}
                          >
                            <span className="w-6 h-px bg-[hsl(38_45%_60%)]/60 transition-all duration-700 group-hover/cta:w-12 group-hover/cta:bg-[hsl(38_55%_70%)]" />
                            {isOpen ? "Hide Progress" : "View Progress"}
                          </button>
                        </div>
                      </article>
                    </RevealOnScroll>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ─── EXPANDED DETAIL: Main Ridge Pavilion ──────────── */}
        {openProject === "main-ridge-pavilion" && (
          <section
            id="detail-main-ridge-pavilion"
            className="relative bg-card border-t border-foreground/[0.06]"
          >
            <div className="max-w-7xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] py-[clamp(5rem,3rem+7vw,10rem)] space-y-[clamp(4rem,2.5rem+5vw,7rem)]">
              {/* Snapshot */}
              <div className="grid grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-end">
                <div className="col-span-12 lg:col-span-7 space-y-5">
                  <RevealOnScroll direction="up" duration={900}>
                    <p className="font-mono uppercase text-[hsl(38_45%_60%)]/70 text-[10px] tracking-[0.45em]">
                      Project Journal — Main Ridge Pavilion
                    </p>
                  </RevealOnScroll>
                  <RevealOnScroll direction="up" duration={1000} delay={150}>
                    <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.85rem,1.2rem+2.6vw,3rem)]">
                      A pavilion built around fire, timber and the long table.
                    </h2>
                  </RevealOnScroll>
                  <RevealLine width="w-8" delay={300} />
                  <RevealOnScroll direction="up" duration={1000} delay={400}>
                    <p className="font-sans font-light text-foreground/55 leading-[1.9] text-[14px] max-w-xl">
                      An open-air pavilion paired with a brick parrilla, sited
                      between the stable and the arena. Built from solid timber,
                      blackened steel and corrugated cladding — a place for long
                      evenings between work and rest.
                    </p>
                  </RevealOnScroll>
                </div>
                <div className="col-span-12 lg:col-span-5">
                  <dl className="grid grid-cols-2 gap-px bg-foreground/[0.06]">
                    {[
                      ["Location", "Main Ridge"],
                      ["Category", "Pavilion / Parrilla"],
                      ["Status", "In Progress"],
                      ["Reveal", "2026"],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-card p-5">
                        <dt className="font-mono uppercase text-foreground/35 text-[10px] tracking-[0.4em] mb-2">
                          {k}
                        </dt>
                        <dd className="font-serif text-foreground/85 text-[clamp(0.95rem,0.85rem+0.3vw,1.1rem)] tracking-[-0.01em]">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Timeline chapters */}
              <div className="space-y-[clamp(3rem,2rem+3vw,5rem)]">
                <div className="space-y-3 max-w-xl">
                  <p className="font-mono uppercase text-foreground/35 text-[10px] tracking-[0.45em]">
                    Progress Timeline
                  </p>
                  <h3 className="font-serif text-foreground/85 leading-[1.1] tracking-[-0.02em] text-[clamp(1.5rem,1rem+1.8vw,2.2rem)]">
                    Five chapters, one pavilion.
                  </h3>
                </div>

                <ol className="relative space-y-[clamp(2.5rem,1.5rem+3vw,4rem)]">
                  {mainRidgeTimeline.map((c, i) => (
                    <RevealOnScroll
                      key={c.n}
                      direction="up"
                      duration={1000}
                      delay={i * 80}
                    >
                      <li className="grid grid-cols-12 gap-[clamp(1.5rem,1rem+1.5vw,3rem)] items-start">
                        <div className="col-span-12 md:col-span-2 md:sticky md:top-32 space-y-2">
                          <p className="font-mono uppercase text-[hsl(38_45%_60%)]/70 text-[10px] tracking-[0.45em]">
                            Chapter {c.n}
                          </p>
                          <p className="font-serif text-foreground/40 text-[clamp(2rem,1.5rem+2vw,3rem)] leading-none tracking-[-0.03em]">
                            0{i + 1}
                          </p>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                          <RevealImage delay={120}>
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img
                                src={c.image}
                                alt={c.alt}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{
                                  filter:
                                    "brightness(0.82) contrast(1.12) saturate(0.78)",
                                }}
                              />
                            </div>
                          </RevealImage>
                        </div>
                        <div className="col-span-12 md:col-span-4 space-y-4 md:pt-2">
                          <h4 className="font-serif text-foreground/90 leading-[1.1] tracking-[-0.02em] text-[clamp(1.25rem,0.95rem+1vw,1.65rem)]">
                            {c.title}
                          </h4>
                          <RevealLine width="w-6" />
                          <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[13.5px]">
                            {c.body}
                          </p>
                        </div>
                      </li>
                    </RevealOnScroll>
                  ))}
                </ol>
              </div>

              {/* Detail gallery */}
              <div className="space-y-[clamp(2rem,1.25rem+2vw,3.5rem)]">
                <div className="space-y-3 max-w-xl">
                  <p className="font-mono uppercase text-foreground/35 text-[10px] tracking-[0.45em]">
                    Detail Gallery
                  </p>
                  <h3 className="font-serif text-foreground/85 leading-[1.1] tracking-[-0.02em] text-[clamp(1.5rem,1rem+1.8vw,2.2rem)]">
                    Material, joint, finish.
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-foreground/[0.06]">
                  {mainRidgeGallery.map((g) => (
                    <div
                      key={g.src}
                      className="relative aspect-square overflow-hidden bg-card group"
                    >
                      <img
                        src={g.src}
                        alt={g.alt}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2200ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:scale-[1.05]"
                        style={{
                          filter:
                            "brightness(0.82) contrast(1.12) saturate(0.78)",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Final reveal placeholder */}
              <div className="relative overflow-hidden aspect-[21/9]">
                <img
                  src={mrInterior}
                  alt="Main Ridge Pavilion — final reveal coming 2026"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter:
                      "brightness(0.55) contrast(1.15) saturate(0.75) blur(2px)",
                  }}
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 space-y-4">
                  <p className="font-mono uppercase text-[hsl(38_55%_75%)]/80 text-[10px] tracking-[0.5em]">
                    Final Reveal — 2026
                  </p>
                  <p className="font-serif italic text-white/85 leading-[1.3] tracking-[-0.015em] text-[clamp(1.25rem,0.9rem+1.4vw,1.85rem)] max-w-xl">
                    Photography to follow on commissioning.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── CLOSING ──────────────────────────────────────── */}
        <section className="relative py-[clamp(6rem,4rem+8vw,11rem)] bg-background">
          <div className="max-w-3xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] text-center space-y-[clamp(2rem,1.25rem+2.5vw,3rem)]">
            <RevealLine className="mx-auto" width="w-10" />
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono uppercase text-[hsl(38_45%_60%)]/70 text-[10px] tracking-[0.5em]">
                Live From the Ground
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={150}>
              <p className="font-serif italic text-foreground/75 leading-[1.4] tracking-[-0.01em] text-[clamp(1.25rem,0.9rem+1.4vw,1.85rem)]">
                New entries posted as the work progresses. Return often.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={300}>
              <div className="flex flex-col sm:flex-row gap-[clamp(1.75rem,1rem+2vw,3.5rem)] justify-center items-center pt-2">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.4em]"
                >
                  <span className="w-6 h-px bg-[hsl(38_45%_60%)]/60 transition-all duration-700 group-hover:w-12 group-hover:bg-[hsl(38_55%_70%)]" />
                  Request Assessment
                </Link>
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/40 hover:text-foreground/80 transition-colors duration-500 text-[10px] tracking-[0.4em]"
                >
                  Explore Selected Works
                  <span className="w-6 h-px bg-foreground/20 transition-all duration-700 group-hover:w-12 group-hover:bg-foreground/60" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </article>
    </Layout>
  );
}
