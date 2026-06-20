import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";

import heroAsset from "@/assets/main-ridge/main-ridge-pavilion-wide-fireplace-table.png.asset.json";
import fireplacePortrait from "@/assets/main-ridge/main-ridge-pavilion-brick-fireplace-detail.png.asset.json";
import parrillaWide from "@/assets/main-ridge/mr-parrilla-wide.png.asset.json";

const FACTS: Array<{ label: string; value: string }> = [
  { label: "Code", value: "PE-MR-024" },
  { label: "Category", value: "Custom Rural Build" },
  { label: "Location", value: "Main Ridge, VIC" },
  { label: "Scope", value: "Pavilion · Parrilla · Setting" },
  { label: "Year", value: "2024" },
  { label: "Status", value: "Resolved" },
];

const DETAILS = [
  "Brick parrilla grill and firebox",
  "Heavy timber posts and framing",
  "Corrugated steel lining",
  "Handcrafted dining table and benches",
  "Open rural outlook",
  "Practical, hard-wearing finishes",
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

export default function MainRidgePavilion() {
  useEffect(() => {
    document.title = "Main Ridge Pavilion | Peninsula Equine";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") || "";
    meta?.setAttribute(
      "content",
      "Main Ridge Pavilion — a custom rural pavilion with brick parrilla, heavy timber framing and handcrafted dining setting, built by Peninsula Equine.",
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
            src={heroAsset.url}
            alt="Main Ridge Pavilion at dusk — handcrafted timber table with candle lanterns, brick fireplace and open rural outlook"
            loading="eager"
            decoding="async"
            {...({ fetchpriority: "high" } as any)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: "50% 52%",
              filter: "brightness(0.62) contrast(1.08) saturate(0.78)",
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
              className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/55 hover:text-accent transition-colors"
              style={{ transition: "color var(--pe-dur-hold) var(--pe-ease)" }}
            >
              ← Selected Works
            </Link>
            <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/35">
              PE-MR-024 · Chapter 01
            </span>
          </div>

          {/* Title — bottom anchor */}
          <div className="absolute inset-x-0 bottom-[16%] sm:bottom-[12%] px-6 sm:px-10 z-10">
            <div className="max-w-5xl">
              <RevealOnScroll direction="up" duration={1100}>
                <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/70">
                  Pavilion · Rural Build
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1400} delay={180}>
                <h1 className="mt-5 font-serif text-foreground/95 leading-[0.92] tracking-tight text-[clamp(2.6rem,1.4rem+5.4vw,6rem)]">
                  Main Ridge
                  <br />
                  Pavilion.
                </h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={420}>
                <p className="mt-7 max-w-md font-sans font-light text-foreground/55 text-[0.95rem] leading-[1.75]">
                  Pavilion, parrilla grill and handcrafted dining setting —
                  built around fire, view, and function.
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
            <ChapterMark chapter="Chapter 01 · Brief" label="The Ask" />
            <div className="grid grid-cols-12 gap-x-10 gap-y-8">
              <div className="col-span-12 md:col-span-5">
                <RevealOnScroll direction="up" duration={1100}>
                  <h2 className="font-serif text-foreground/95 leading-[0.98] tracking-tight text-[clamp(1.9rem,1.3rem+2.4vw,3.2rem)]">
                    A working pavilion,
                    <br />
                    held to a residential standard.
                  </h2>
                </RevealOnScroll>
              </div>
              <div className="col-span-12 md:col-span-6 md:col-start-7">
                <RevealOnScroll direction="up" duration={1100} delay={120}>
                  <p className="font-serif italic text-foreground/70 text-[clamp(1.1rem,0.95rem+0.6vw,1.4rem)] leading-[1.5]">
                    Built around the horse first, the land second, the silhouette third.
                  </p>
                  <p className="mt-8 font-sans font-light text-foreground/55 text-[0.98rem] leading-[1.85] max-w-xl">
                    The brief was open — make a place for gathering that didn't
                    fight the paddock. Fire at the centre. Materials that
                    weather honestly. A table heavy enough to live there. The
                    pavilion was resolved as one move: structure, hearth,
                    setting.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            ACT IV — Built Around (craftsmanship slab)
            ───────────────────────────────────────────── */}
        <section className="relative border-t border-accent/10 pe-pause-lg">
          <div className="section-container max-w-[1480px]">
            <ChapterMark chapter="Chapter 02 · Built" label="Fire, Timber, Function" />

            <div className="grid grid-cols-12 gap-y-10 gap-x-8 lg:gap-x-12 items-stretch">
              {/* Portrait detail */}
              <div className="col-span-12 md:col-span-3 relative aspect-[3/4] md:aspect-auto md:min-h-[520px] overflow-hidden bg-card">
                <img
                  src={fireplacePortrait.url}
                  alt="Brick wall and bronze wall light detail inside the Main Ridge Pavilion"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: "55% 50%",
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
                    Fire, timber
                    <br />
                    and function.
                  </h3>
                  <p className="mt-7 font-sans font-light text-foreground/55 text-[0.98rem] leading-[1.8] max-w-md">
                    Every detail was chosen for purpose — heavy timber structure,
                    corrugated steel, brickwork, open views, fire, and a
                    handcrafted table setting made to sit naturally within
                    the space.
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

              {/* Wide parrilla */}
              <div className="col-span-12 md:col-span-5 relative aspect-[4/3] md:aspect-auto md:min-h-[520px] overflow-hidden bg-card">
                <img
                  src={parrillaWide.url}
                  alt="Wide view of the brick parrilla grill and fireplace anchoring the Main Ridge Pavilion"
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
                    The parrilla anchors the room — practical, warm, made to
                    feed people.
                  </p>
                </figcaption>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            ACT V — Intermission (material breath)
            ───────────────────────────────────────────── */}
        <section className="relative border-t border-accent/10 pe-pause-md">
          <div className="section-container max-w-3xl text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/45">
              Materials · Standard
            </p>
            <p className="mt-6 font-serif italic text-foreground/75 text-[clamp(1.3rem,1rem+1.2vw,1.95rem)] leading-[1.45]">
              Timber. Brick. Steel. Fire. View.
              <br />
              Kept honest. Built to be used.
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
                  End of chapter · 01
                </p>
                <h2 className="mt-6 font-serif text-foreground/95 leading-[0.96] tracking-tight text-[clamp(1.9rem,1.3rem+2.4vw,3.2rem)]">
                  From groundwork
                  <br />
                  <span className="text-foreground/55 italic font-normal">
                    to gathering place.
                  </span>
                </h2>
                <p className="mt-6 font-sans font-light text-foreground/55 text-[0.95rem] leading-[1.8] max-w-md">
                  Talk to Peninsula Equine about your next rural build.
                  Selection begins with a written brief.
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

              {/* Next chapter handoff */}
              <div className="col-span-12 md:col-span-5 md:col-start-8">
                <Link
                  to="/selected-works/aberdeen"
                  className="group block relative aspect-[4/5] overflow-hidden bg-card border-l border-accent/20"
                >
                  <img
                    src="/og.png"
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40"
                    style={{
                      filter: "brightness(0.6) contrast(1.05) saturate(0.7)",
                      transition: "opacity var(--pe-dur-cinematic) var(--pe-ease)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
                  <div className="relative z-10 h-full flex flex-col justify-between p-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/65">
                      Next chapter · 02
                    </p>
                    <div>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.45em] text-foreground/45">
                        Indoor Arena · Stable Precinct
                      </p>
                      <h3 className="mt-3 font-serif text-foreground/95 leading-[0.98] tracking-tight text-[clamp(1.6rem,1.1rem+1.8vw,2.4rem)]">
                        Aberdeen.
                      </h3>
                      <div className="mt-5 inline-flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/65 group-hover:text-accent" style={{ transition: "color var(--pe-dur-hold) var(--pe-ease)" }}>
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
