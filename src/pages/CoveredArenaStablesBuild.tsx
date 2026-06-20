import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";

import stormSteelAsset from "@/assets/uploads/approved-current-build-steel-frame-storm.png.asset.json";
import nightWorkAsset from "@/assets/uploads/approved-current-build-rain-frame-symmetry.png.asset.json";
import truckAccessAsset from "@/assets/covered-arenas/approved-covered-arena-exterior-dusk.png.asset.json";
import wetGroundAsset from "@/assets/field-notes/covered-competition-arena-sunset-puddles.png.asset.json";
import drainageAsset from "@/assets/field-notes/covered-competition-arena-drainage-detail.png.asset.json";
import muddyBootsAsset from "@/assets/field-notes/muddy-boots-steel-frame.png.asset.json";

const stormSteel = stormSteelAsset.url;
const nightWork = nightWorkAsset.url;
const truckAccess = truckAccessAsset.url;
const wetGround = wetGroundAsset.url;
const drainage = drainageAsset.url;
const muddyBoots = muddyBootsAsset.url;

const FACTS: Array<{ label: string; value: string }> = [
  { label: "Code", value: "PE-CA-026" },
  { label: "Category", value: "Covered Arena · Stables" },
  { label: "Location", value: "Mornington Peninsula" },
  { label: "Scope", value: "Steel · Roofing · Drainage · Base" },
  { label: "Year", value: "2026" },
  { label: "Status", value: "In Progress" },
];

const DETAILS = [
  "Structural steel portals and bracing",
  "Full-span roof and weather shelter",
  "Stable precinct and circulation",
  "Falls, drainage and sub-base sequencing",
  "Red-clay site cuts and access tracks",
  "Engineered surface preparation",
];

/* ── Shared chapter overline ─────────────────────────── */
function ChapterMark({ chapter, label }: { chapter: string; label: string }) {
  return (
    <div className="flex items-baseline gap-5 mb-10 sm:mb-14">
      <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/55">
        {chapter}
      </span>
      <span aria-hidden className="h-px w-10 sm:w-16 bg-accent/30" />
      <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/45">
        {label}
      </span>
    </div>
  );
}

export default function CoveredArenaStablesBuild() {
  useEffect(() => {
    document.title = "Covered Arena & Stables | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Covered Arena & Stables — structural steel, roofing and stable infrastructure in progress across the Mornington Peninsula.",
    );
    return () => {
      document.title = "Peninsula Equine";
      if (meta && prev) meta.setAttribute("content", prev);
    };
  }, []);

  return (
    <Layout>
      <article className="bg-background text-foreground overflow-x-clip">
        {/* ─────────────────────────────────────────────
            ACT I — Overture (full-bleed cinematic hero)
            ───────────────────────────────────────────── */}
        <section className="relative h-[92svh] min-h-[640px] w-full overflow-hidden bg-background">
          <img
            src={stormSteel}
            alt="Steel arena frame raised beneath a charged storm sky — crane and panels mid-lift"
            loading="eager"
            decoding="async"
            {...({ fetchpriority: "high" } as any)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: "52% 48%",
              filter: "brightness(0.6) contrast(1.12) saturate(0.78)",
            }}
          />
          {/* Cinematic veil */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 30%, transparent 0%, hsl(var(--background) / 0.45) 65%, hsl(var(--background) / 0.95) 100%)",
            }}
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 engineering-grid opacity-[0.025]" aria-hidden />

          {/* Top marks */}
          <div className="absolute top-28 sm:top-32 left-6 sm:left-10 right-6 sm:right-10 flex items-baseline justify-between z-10">
            <Link
              to="/selected-works"
              className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/55 hover:text-accent"
              style={{ transition: "color var(--pe-dur-hold) var(--pe-ease)" }}
            >
              ← Selected Works
            </Link>
            <span className="hidden sm:flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/35">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-subtle" />
              PE-CA-026 · Chapter 03 · Live
            </span>
          </div>

          {/* Title — bottom anchor */}
          <div className="absolute inset-x-0 bottom-[16%] sm:bottom-[12%] px-6 sm:px-10 z-10">
            <div className="max-w-5xl">
              <RevealOnScroll direction="up" duration={1100}>
                <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/70">
                  Covered Arena · Stables · In Progress
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1400} delay={180}>
                <h1 className="mt-5 font-serif text-foreground/95 leading-[0.92] tracking-tight text-[clamp(2.6rem,1.4rem+5.4vw,6rem)]">
                  Covered Arena
                  <br />
                  &amp; Stables.
                </h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={420}>
                <p className="mt-7 max-w-md font-sans font-light text-foreground/55 text-[0.95rem] leading-[1.75]">
                  Steel rising, red clay underfoot — the honest middle of a build,
                  documented while the work is still in motion.
                </p>
              </RevealOnScroll>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-8 right-6 sm:right-10 z-10 hidden sm:flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-foreground/40">
              Scroll · Begin Chapter
            </span>
            <span aria-hidden className="h-px w-10 bg-accent/40" />
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            ACT II — Manifest (project facts strip)
            ───────────────────────────────────────────── */}
        <section className="relative border-t border-accent/10 pe-pause-sm">
          <div className="section-container max-w-[1280px]">
            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-6 border-t border-accent/15 pt-10">
              {FACTS.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-3">
                  <dt className="font-mono uppercase text-accent/55 text-[9px] tracking-[0.45em]">
                    {fact.label}
                  </dt>
                  <dd className="font-serif text-foreground/85 text-[clamp(0.95rem,0.85rem+0.3vw,1.15rem)] leading-[1.3]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            ACT III — Brief (thesis)
            ───────────────────────────────────────────── */}
        <section className="relative border-t border-accent/10 pe-pause-lg">
          <div className="section-container max-w-[1280px]">
            <ChapterMark chapter="Chapter 03 · Brief" label="The Ask" />
            <div className="grid grid-cols-12 gap-x-10 gap-y-8">
              <div className="col-span-12 md:col-span-5">
                <RevealOnScroll direction="up" duration={1100}>
                  <h2 className="font-serif text-foreground/95 leading-[0.98] tracking-tight text-[clamp(1.9rem,1.3rem+2.4vw,3.2rem)]">
                    A working arena,
                    <br />
                    resolved from the ground up.
                  </h2>
                </RevealOnScroll>
              </div>
              <div className="col-span-12 md:col-span-6 md:col-start-7">
                <RevealOnScroll direction="up" duration={1100} delay={120}>
                  <p className="font-serif italic text-foreground/70 text-[clamp(1.1rem,0.95rem+0.6vw,1.4rem)] leading-[1.5]">
                    Built for weather, scale and year-round use — without compromise below the surface.
                  </p>
                  <p className="mt-8 font-sans font-light text-foreground/55 text-[0.98rem] leading-[1.85] max-w-xl">
                    The brief was clear — a covered arena and stable precinct
                    that performs in every condition. Drainage, falls and base
                    sequencing decided first. Steel, roof and shelter built to
                    match. Stables held to the same standard. Nothing carried
                    forward unresolved.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            ACT IV — Built (craftsmanship slab)
            ───────────────────────────────────────────── */}
        <section className="relative border-t border-accent/10 pe-pause-lg">
          <div className="section-container max-w-[1480px]">
            <ChapterMark chapter="Chapter 03 · Built" label="Steel, Shelter, Sequence" />

            <div className="grid grid-cols-12 gap-y-10 gap-x-8 lg:gap-x-12 items-stretch">
              {/* Portrait detail */}
              <div className="col-span-12 md:col-span-3 relative aspect-[3/4] md:aspect-auto md:min-h-[520px] overflow-hidden bg-card">
                <img
                  src={muddyBoots}
                  alt="Worn boots standing in red clay beside the steel frame of the covered arena"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: "50% 50%",
                    filter: "brightness(0.84) contrast(1.08) saturate(0.78)",
                  }}
                />
              </div>

              {/* Text column */}
              <div className="col-span-12 md:col-span-4 flex flex-col justify-between gap-10">
                <RevealOnScroll direction="up" duration={1100}>
                  <p className="font-mono uppercase text-accent/65 text-[10px] tracking-[0.45em]">
                    Built Around
                  </p>
                  <h3 className="mt-5 font-serif text-foreground/92 leading-[1.02] tracking-tight text-[clamp(1.6rem,1.1rem+1.8vw,2.4rem)]">
                    Steel, shelter
                    <br />
                    and sequence.
                  </h3>
                  <p className="mt-7 font-sans font-light text-foreground/55 text-[0.98rem] leading-[1.8] max-w-md">
                    Every layer chosen and ordered with intent — site cuts,
                    drainage falls, structural steel, full-span roof and stable
                    precinct, finished with engineered surface preparation that
                    decides how the building performs for decades.
                  </p>
                </RevealOnScroll>

                <RevealOnScroll direction="up" duration={1100} delay={200}>
                  <ul className="divide-y divide-accent/10 border-t border-accent/15">
                    {DETAILS.map((d) => (
                      <li
                        key={d}
                        className="py-3 flex items-baseline gap-4 font-sans font-light text-foreground/75 text-[0.95rem]"
                      >
                        <span aria-hidden className="h-px w-4 bg-accent/45 shrink-0 translate-y-[-3px]" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </RevealOnScroll>
              </div>

              {/* Wide interior */}
              <div className="col-span-12 md:col-span-5 relative aspect-[4/3] md:aspect-auto md:min-h-[520px] overflow-hidden bg-card">
                <img
                  src={truckAccess}
                  alt="Covered arena interior under construction — roof glazing, structural steel and unfinished surface"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: "50% 50%",
                    filter: "brightness(0.84) contrast(1.1) saturate(0.78)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/85 to-transparent"
                />
                <figcaption className="absolute bottom-5 left-5 right-5">
                  <p className="font-serif italic text-foreground/80 text-[0.95rem] leading-[1.5]">
                    Light, span and shelter — the structure begins to read as a room.
                  </p>
                </figcaption>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            ACT IV.b — Editorial Triptych (conditions)
            ───────────────────────────────────────────── */}
        <section className="relative border-t border-accent/10 pe-pause-md">
          <div className="section-container max-w-[1480px]">
            <ChapterMark chapter="Chapter 03 · Field" label="Conditions on Site" />
            <div className="grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
              <RevealOnScroll direction="up" duration={1100} className="col-span-12 md:col-span-7">
                <div className="relative overflow-hidden aspect-[16/10]">
                  <img
                    src={nightWork}
                    alt="Rain-marked interior arena frame with symmetrical roof span and tracked footing lines"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ filter: "brightness(0.74) contrast(1.1) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/45 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={140} className="col-span-12 md:col-span-5">
                <div className="relative overflow-hidden aspect-[16/10]">
                  <img
                    src={wetGround}
                    alt="Wet ground and puddles across the covered arena footprint at sunset, roof overhead"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: "54% 50%", filter: "brightness(0.78) contrast(1.1) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </RevealOnScroll>

              <RevealOnScroll direction="up" duration={1100} delay={260} className="col-span-12 md:col-span-12">
                <div className="relative overflow-hidden aspect-[21/8]">
                  <img
                    src={drainage}
                    alt="Drainage detail and base preparation channel cut into the red clay site"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: "52% 50%", filter: "brightness(0.78) contrast(1.1) saturate(0.78)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/45 to-transparent" />
                  <figcaption className="absolute bottom-5 left-5 right-5">
                    <p className="font-serif italic text-foreground/75 text-[0.95rem] leading-[1.5]">
                      Falls, drainage and base — the unseen layers that decide everything above.
                    </p>
                  </figcaption>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            ACT V — Intermission (material breath)
            ───────────────────────────────────────────── */}
        <section className="relative border-t border-accent/10 pe-pause-md">
          <div className="section-container max-w-3xl text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/45">
              Method · Standard
            </p>
            <p className="mt-6 font-serif italic text-foreground/75 text-[clamp(1.3rem,1rem+1.2vw,1.95rem)] leading-[1.45]">
              Honest progress now.
              <br />
              Finished work later.
            </p>
            <RevealLine width="w-10" className="mx-auto mt-8" />
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            ACT VI — Resolved + Next Chapter handoff
            ───────────────────────────────────────────── */}
        <section className="relative border-t border-accent/10 pe-pause-lg">
          <div className="section-container max-w-[1280px]">
            <div className="grid grid-cols-12 gap-10">
              {/* Resolved */}
              <div className="col-span-12 md:col-span-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/55">
                  End of chapter · 03
                </p>
                <h2 className="mt-6 font-serif text-foreground/95 leading-[0.96] tracking-tight text-[clamp(1.9rem,1.3rem+2.4vw,3.2rem)]">
                  From red clay
                  <br />
                  <span className="text-foreground/55 italic font-normal">
                    to working ground.
                  </span>
                </h2>
                <p className="mt-6 font-sans font-light text-foreground/55 text-[0.95rem] leading-[1.8] max-w-md">
                  Stay with the build, or speak with Peninsula Equine about
                  arena and stable infrastructure resolved to the same standard.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-baseline gap-6 sm:gap-10">
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
                    to="/selected-works"
                    className="font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/55 hover:text-foreground"
                    style={{ transition: "color var(--pe-dur-hold) var(--pe-ease)" }}
                  >
                    ← Back to Selected Works
                  </Link>
                </div>
              </div>

              {/* Next chapter handoff — loop back to Main Ridge */}
              <div className="col-span-12 md:col-span-5 md:col-start-8">
                <Link
                  to="/selected-works/main-ridge-pavilion"
                  className="group block relative aspect-[4/5] overflow-hidden bg-card border-l border-accent/20"
                >
                  <img
                    src={truckAccess}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-45"
                    style={{
                      filter: "brightness(0.6) contrast(1.05) saturate(0.7)",
                      transition: "opacity var(--pe-dur-cinematic) var(--pe-ease)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
                  <div className="relative z-10 h-full flex flex-col justify-between p-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/65">
                      Return to chapter · 01
                    </p>
                    <div>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.45em] text-foreground/45">
                        Pavilion · Rural Build
                      </p>
                      <h3 className="mt-3 font-serif text-foreground/95 leading-[0.98] tracking-tight text-[clamp(1.6rem,1.1rem+1.8vw,2.4rem)]">
                        Main Ridge.
                      </h3>
                      <div
                        className="mt-5 inline-flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/65 group-hover:text-accent"
                        style={{ transition: "color var(--pe-dur-hold) var(--pe-ease)" }}
                      >
                        <span>Open</span>
                        <span
                          aria-hidden
                          className="h-px w-10 bg-accent/50 group-hover:w-20 group-hover:bg-accent"
                          style={{
                            transition:
                              "width var(--pe-dur-hold) var(--pe-ease), background-color var(--pe-dur-hold) var(--pe-ease)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>
    </Layout>
  );
}
