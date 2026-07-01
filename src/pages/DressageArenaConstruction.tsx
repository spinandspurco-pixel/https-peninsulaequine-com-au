import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { usePageMeta } from "@/lib/usePageMeta";
import heroAsset from "@/assets/covered-arenas/approved-covered-arena-interior-night.png.asset.json";

const heroImg = heroAsset.url;

const META_TITLE =
  "Dressage Arena Construction — Engineered Footing, Drainage, Base | Peninsula Equine";
const META_DESCRIPTION =
  "A technical guide to dressage arena construction: 20×60m geometry, sub-grade and drainage, geotextile sand footing blends, kickboards and lighting. Built for Mornington Peninsula conditions.";
const CANONICAL = "https://peninsulaequine.systems/guides/dressage-arena-construction";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is the standard size of a dressage arena?",
    a: "A standard competition dressage arena is 20m × 60m. A small arena (used for preliminary tests) is 20m × 40m. We always recommend building to the full 20×60 internal dimension, with a 1.5–2m surfaced perimeter for safe schooling and judging access.",
  },
  {
    q: "What is the best footing for a dressage arena?",
    a: "A washed silica sand at 0.06–0.5mm grain, mixed with a geotextile fibre or felt additive, gives the elastic-but-supportive ride dressage horses need. Blend depth typically sits at 100–120mm, laid over a compacted aggregate base and a textile separation layer.",
  },
  {
    q: "How much does a dressage arena cost to build?",
    a: "On the Mornington Peninsula, a fully engineered 20×60 outdoor dressage arena typically sits between AUD $80k and $180k depending on earthworks, base depth, footing blend and drainage. Covered structures sit above that range. We confirm the figure on-site during a paid site assessment.",
  },
  {
    q: "How deep should the base of a dressage arena be?",
    a: "A compacted aggregate base of 150–200mm over a prepared sub-grade is standard, increased on soft or reactive soils. The base is graded with a 1–1.5% fall for drainage and topped with a non-woven geotextile before the surface blend goes down.",
  },
  {
    q: "Do I need planning approval for a dressage arena?",
    a: "On the Mornington Peninsula, most outdoor dressage arenas fall within standard rural-zone provisions, but lighting, covered structures, and proximity to neighbours can trigger a planning permit. We confirm requirements with the relevant council during the site assessment.",
  },
];

const SECTIONS = [
  {
    k: "01",
    label: "Geometry & Setout",
    body:
      "20m × 60m internal, with a surfaced 1.5–2m apron for safe entry, judging vehicles and warm-up. Long axis oriented to morning sun where possible — softer shadow on the centre line. Setout pegged from a single benchmark to keep diagonals true.",
  },
  {
    k: "02",
    label: "Sub-grade & Earthworks",
    body:
      "Strip topsoil to firm natural ground, proof-roll, and replace soft pockets with stabilised fill. Build a 1–1.5% cross-fall into the sub-grade — surface drainage starts here, not at the top. On reactive clays we install a cement-modified capping layer.",
  },
  {
    k: "03",
    label: "Drainage",
    body:
      "Slotted ag drains at 5–6m centres in a herringbone or perimeter pattern, wrapped in geotextile sock, bedded in clean 7mm aggregate. Discharge to a soak well or vegetated swale, never to a neighbour's boundary. Drainage is non-negotiable in dressage — water in the base is the first cause of an inconsistent surface.",
  },
  {
    k: "04",
    label: "Base Layer",
    body:
      "150–200mm of crushed rock (typically 20mm Class 3) placed in two lifts and compacted to 95% standard. Laser-graded to the design cross-fall. A non-woven geotextile (typically a bidim A29 or equivalent) sits between base and footing, preventing migration of the surface into the base.",
  },
  {
    k: "05",
    label: "Footing Blend",
    body:
      "Washed silica sand (0.06–0.5mm, sub-angular grain) blended with 6–12% geotextile fibre or felt by volume, depending on rider discipline and frequency of use. Spread to 100–120mm uncompacted, then rolled to a consistent ride depth. Tested by riding, not by spec sheet alone.",
  },
  {
    k: "06",
    label: "Kickboards & Perimeter",
    body:
      "Treated hardwood kickboards at 1.2m, raked outward at 5° to deflect a horse off the rail. Letter markers set into the board face, not pegged into the surface. Gate openings sized for a tractor and harrow, not just a horse.",
  },
  {
    k: "07",
    label: "Lighting & Cover (Optional)",
    body:
      "For all-weather work, a clear-span covered structure removes wind, rain and glare. LED lighting at 200–300 lux on the surface, mounted to eliminate cast shadow on the centre line. Specified as part of the build, not retrofitted.",
  },
  {
    k: "08",
    label: "Maintenance Plan",
    body:
      "A maintenance schedule is handed over with the arena — daily drag pattern, weekly deep-grade, seasonal top-up of fibre and water. Most footing failures we see on other people's arenas are maintenance failures, not material failures.",
  },
];

export default function DressageArenaConstruction() {
  usePageMeta({
    title: META_TITLE,
    description: META_DESCRIPTION,
    path: "/guides/dressage-arena-construction",
    ogType: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: "Dressage Arena Construction — A Technical Guide",
        description: META_DESCRIPTION,
        author: { "@type": "Organization", name: "Peninsula Equine" },
        publisher: { "@type": "Organization", name: "Peninsula Equine" },
        mainEntityOfPage: CANONICAL,
        inLanguage: "en-AU",
        about: "Dressage arena construction, footing, drainage and engineering",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://peninsulaequine.systems/" },
          { "@type": "ListItem", position: 2, name: "Arenas", item: "https://peninsulaequine.systems/arenas" },
          { "@type": "ListItem", position: 3, name: "Dressage Arena Construction", item: CANONICAL },
        ],
      },
    ],
  });


  return (
    <Layout>
      <article className="bg-background text-foreground type-architectural">
        {/* Hero */}
        <section className="relative h-[72vh] min-h-[520px] overflow-hidden">
          <img
            src={heroImg}
            alt="Engineered indoor dressage arena interior at evening, with even footing and clear-span roof"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover img-header"
            style={{ objectPosition: "50% 52%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/45 via-primary/15 to-primary/80" />
          <div className="absolute bottom-0 left-0 right-0 px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+4vw,5rem)]">
            <div className="max-w-6xl space-y-[clamp(1.25rem,1rem+1vw,2rem)]">
              <RevealOnScroll direction="up" duration={900} delay={300}>
                <p className="font-mono uppercase text-accent/65 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                  Field Note — Dressage
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={500}>
                <h1 className="font-serif text-primary-foreground tracking-[-0.025em] leading-[0.95] text-[clamp(2.25rem,1.3rem+4.8vw,5rem)] max-w-4xl">
                  Dressage Arena Construction.
                </h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={800}>
                <p className="font-serif italic text-primary-foreground/55 max-w-xl leading-[1.55] text-[clamp(0.875rem,0.78rem+0.4vw,1.0625rem)]">
                  A technical guide. Geometry, drainage, base, footing — written for the rider who has to live on the surface.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-background">
          <div className="max-w-5xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2.5rem,1.5rem+3vw,5rem)]">
            <div className="lg:col-span-5 space-y-6">
              <RevealOnScroll direction="up">
                <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                  Discipline · Surface
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={150}>
                <h2 className="font-serif text-foreground/85 leading-[1.1] tracking-[-0.02em] text-[clamp(1.65rem,1.1rem+2.2vw,2.65rem)]">
                  The surface is the discipline.
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-8" delay={300} />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <RevealOnScroll direction="up" delay={200}>
                <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.875rem,0.82rem+0.2vw,1rem)]">
                  Dressage exposes a surface faster than any other discipline. A 5mm deviation in footing depth is felt in the half-pass. Water sitting 100mm down in the base reads as a heavy front leg by week three. The work below the sand decides what the horse is asked to do above it.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={350}>
                <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.875rem,0.82rem+0.2vw,1rem)]">
                  This guide covers the eight layers we build every time, in the order we build them. It applies whether the arena is 20×60 outdoor on a hilltop in Main Ridge, or covered and lit on a flat in Moorooduc.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* Sections */}
        <section className="py-[clamp(5rem,3rem+6vw,9rem)] bg-card">
          <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/[0.05]">
              {SECTIONS.map((c, i) => (
                <RevealOnScroll key={c.k} direction="up" delay={Math.min(i * 80, 480)}>
                  <div className="group relative bg-card px-[clamp(1.75rem,1.25rem+2vw,2.5rem)] py-[clamp(2.5rem,1.75rem+3vw,4rem)] h-full">
                    <span className="absolute top-0 left-0 h-px w-8 bg-accent/40 transition-all duration-1000 group-hover:w-20" />
                    <p className="font-mono uppercase text-foreground/25 mb-[clamp(1.25rem,1rem+1vw,1.75rem)] text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
                      {c.k}
                    </p>
                    <h3 className="font-serif text-foreground/90 leading-[1.1] tracking-[-0.02em] text-[clamp(1.35rem,1rem+1.2vw,1.75rem)] mb-5">
                      {c.label}
                    </h3>
                    <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.8125rem,0.78rem+0.15vw,0.9375rem)]">
                      {c.body}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-background">
          <div className="max-w-4xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
            <RevealOnScroll direction="up">
              <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em] mb-8">
                Questions we are asked
              </p>
            </RevealOnScroll>
            <div className="divide-y divide-foreground/10 border-y border-foreground/10">
              {FAQS.map((f) => (
                <RevealOnScroll key={f.q} direction="up">
                  <details className="group py-7">
                    <summary className="cursor-pointer list-none flex items-baseline justify-between gap-6">
                      <h3 className="font-serif text-foreground/85 leading-[1.2] tracking-[-0.015em] text-[clamp(1.05rem,0.9rem+0.5vw,1.35rem)]">
                        {f.q}
                      </h3>
                      <span className="font-mono text-accent/60 text-xs tracking-[0.3em] shrink-0 transition-transform duration-500 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-5 font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.875rem,0.82rem+0.2vw,1rem)] max-w-3xl">
                      {f.a}
                    </p>
                  </details>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-card text-center">
          <div className="max-w-2xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] space-y-10">
            <RevealLine className="mx-auto" width="w-10" />
            <RevealOnScroll direction="up">
              <p className="font-serif italic text-foreground/70 leading-[1.4] text-[clamp(1.25rem,0.9rem+1.4vw,1.85rem)]">
                Built to ride for thirty years. Not five.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={300}>
              <Link
                to="/site-assessment"
                className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]"
              >
                <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                Request a Site Assessment
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      </article>
    </Layout>
  );
}
