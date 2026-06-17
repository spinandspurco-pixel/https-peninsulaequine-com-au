import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine, RevealImage } from "@/components/RevealOnScroll";
import heroImg from "@/assets/recovery-internal-hero.jpg";
import infraredImg from "@/assets/recovery-internal-infrared.jpg";
import groomingImg from "@/assets/recovery-internal-grooming.jpg";
import inUseImg from "@/assets/recovery-internal-inuse.jpg";
import appImg from "@/assets/recovery-internal-app.jpg";
import detailsImg from "@/assets/recovery-internal-details.jpg";

const chapters = [
  {
    n: "I",
    overline: "Infrared Technology",
    title: "Controlled warmth, held by the building.",
    body:
      "Overhead infrared panels deliver calibrated, low-stress warmth — supporting drying, post-work comfort and the quiet recovery between sessions. No noise. No applied equipment. Heat held in the room itself.",
    image: infraredImg,
    align: "left" as const,
  },
  {
    n: "II",
    overline: "Grooming & Tacking",
    title: "An integrated horse care space.",
    body:
      "Brushed bronze tack walls, walnut cabinetry, dark timber and considered storage — built so grooming, tacking and daily preparation share the same architectural language as recovery. One environment, not three.",
    image: groomingImg,
    align: "right" as const,
  },
  {
    n: "III",
    overline: "In Use",
    title: "Designed for the daily rhythm of real horse people.",
    body:
      "Training, cooling down, grooming, drying and preparing for the next ride. The Recovery Station holds each of these moments inside the stable — without ceremony, without compromise.",
    image: inUseImg,
    align: "left" as const,
  },
];

const details = [
  { k: "01", label: "Infrared Panels", body: "Overhead, recessed, calibrated for comfort and drying." },
  { k: "02", label: "Ventilation", body: "Quiet cross-flow detailing tuned for warmth without stagnation." },
  { k: "03", label: "Non-Slip Flooring", body: "Textured rubber-aggregate over polished concrete — sure-footed when wet." },
  { k: "04", label: "Drainage", body: "Brushed bronze channels integrated flush with the floor line." },
  { k: "05", label: "Tack Storage", body: "Walnut and bronze cabinetry, considered as joinery, not equipment." },
  { k: "06", label: "Finishes", body: "Thermally-modified timber battens, blackened steel, bronze hardware." },
];

export default function RecoveryStation() {
  return (
    <Layout>
      <article className="bg-background text-foreground">
        {/* ─── ARRIVAL ─────────────────────────────────────────── */}
        <section className="relative h-[92vh] min-h-[620px] overflow-hidden">
          <img
            src={heroImg}
            alt="Peninsula Equine Recovery Station — interior stable wellness bay with horse beneath warm infrared recovery panels"
            width={1792}
            height={1024}
            className="absolute inset-0 w-full h-full object-cover img-header"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/45 via-primary/10 to-primary/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_40%,transparent,hsl(var(--primary)/0.55))]" />

          {/* Top hero overline removed — was colliding with the fixed header logo & nav. */}


          <div className="absolute bottom-0 left-0 right-0 px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+5vw,6rem)] z-10">
            <div className="max-w-6xl grid grid-cols-12 gap-6 items-end">
              <div className="col-span-12 lg:col-span-9 space-y-[clamp(1.25rem,1rem+1vw,2rem)]">
                <RevealOnScroll direction="up" duration={900} delay={400}>
                  <p className="font-mono uppercase text-accent/65 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                    The Peninsula Equine Recovery Station<span className="align-super text-[0.55em] ml-1">™</span>
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1100} delay={600}>
                  <h1 className="font-serif text-primary-foreground tracking-[-0.025em] leading-[0.95] text-[clamp(2.25rem,1.2rem+5vw,5rem)]">
                    The Peninsula Equine<br className="hidden sm:block" /> Recovery Station.
                  </h1>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1100} delay={900}>
                  <p className="font-serif italic text-primary-foreground/60 max-w-xl leading-[1.55] text-[clamp(0.875rem,0.78rem+0.4vw,1.0625rem)]">
                    A premium internal recovery environment — engineered for comfort,
                    performance and care, built inside the stable itself.
                  </p>
                </RevealOnScroll>
              </div>
              <div className="hidden lg:block col-span-3">
                <RevealOnScroll direction="none" duration={1400} delay={1100}>
                  <div className="w-12 h-px bg-accent/50 mb-3" />
                  <p className="font-mono uppercase text-primary-foreground/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                    Built Properly.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PAUSE / PHILOSOPHY ──────────────────────────────── */}
        <section className="relative py-[clamp(7rem,4.5rem+9vw,13rem)] bg-background">
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-foreground/[0.04]" />
          <div className="max-w-5xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] text-center space-y-[clamp(2rem,1.25rem+2.5vw,3.5rem)]">
            <RevealOnScroll direction="none" duration={1100}>
              <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]">
                Premise
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1100} delay={150}>
              <p className="font-serif italic text-foreground/75 leading-[1.25] tracking-[-0.015em] text-[clamp(1.5rem,1rem+2.2vw,2.85rem)]">
                Recovery, grooming and daily care belong inside the stable —
                not bolted to the side of it.
              </p>
            </RevealOnScroll>
            <RevealLine className="mx-auto" width="w-10" delay={400} />
            <RevealOnScroll direction="up" duration={1000} delay={500}>
              <p className="font-sans font-light text-foreground/55 max-w-2xl mx-auto leading-[1.85] text-[clamp(0.8125rem,0.78rem+0.2vw,0.9375rem)]">
                The Recovery Station is a dedicated wellness bay built into premium
                stable areas — purpose-built for horse welfare, grooming, drying,
                winter comfort and post-work recovery support.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {chapters.map((c, i) => (
          <section
            key={c.n}
            className={`relative py-[clamp(5rem,3rem+7vw,10rem)] ${
              i % 2 === 0 ? "bg-card" : "bg-background"
            }`}
          >
            <div className="max-w-7xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] grid grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
              <div
                className={`col-span-12 lg:col-span-8 ${
                  c.align === "right" ? "lg:order-2" : ""
                }`}
              >
                <RevealImage delay={100} duration={1200}>
                  <div
                    className={`relative aspect-[16/10] overflow-hidden ${
                      c.align === "left" ? "lg:-ml-[3rem]" : "lg:-mr-[3rem]"
                    }`}
                  >
                    <img
                      src={c.image}
                      alt={`${c.overline} — Peninsula Equine Recovery Station interior`}
                      loading="lazy"
                      width={1792}
                      height={1024}
                      className="absolute inset-0 w-full h-full object-cover img-feature transition-transform duration-[2200ms] ease-[cubic-bezier(0.45,0,0.15,1)] hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 font-mono uppercase text-accent/65 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                      Chapter {c.n}
                    </span>
                  </div>
                </RevealImage>
              </div>

              <div
                className={`col-span-12 lg:col-span-4 space-y-[clamp(1.25rem,0.9rem+1.2vw,2rem)] ${
                  c.align === "right" ? "lg:order-1 lg:pr-4" : "lg:pl-4"
                }`}
              >
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                    {c.overline}
                  </p>
                </RevealOnScroll>
                <RevealOnScroll direction="up" duration={1000} delay={150}>
                  <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.65rem,1.1rem+2.2vw,2.65rem)]">
                    {c.title}
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-8" delay={300} />
                <RevealOnScroll direction="up" duration={1000} delay={400}>
                  <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.8125rem,0.78rem+0.2vw,0.9375rem)]">
                    {c.body}
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </section>
        ))}

        {/* ─── PE APP ──────────────────────────────────────────── */}
        <section className="relative py-[clamp(6rem,4rem+8vw,12rem)] bg-card">
          <div className="max-w-7xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] grid grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
            <div className="col-span-12 lg:col-span-5 space-y-[clamp(1.25rem,0.9rem+1.2vw,2rem)]">
              <RevealOnScroll direction="up" duration={900}>
                <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                  PE App — Concept
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={150}>
                <h2 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(1.65rem,1.1rem+2.2vw,2.65rem)]">
                  The room, held in the hand.
                </h2>
              </RevealOnScroll>
              <RevealLine width="w-8" delay={300} />
              <RevealOnScroll direction="up" duration={1000} delay={400}>
                <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[clamp(0.8125rem,0.78rem+0.2vw,0.9375rem)]">
                  A concept interface for monitoring session time, temperature, lighting
                  and usage history across every Recovery Station on the property —
                  designed for the rider, the groom and the stable manager.
                </p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1000} delay={550}>
                <p className="font-sans font-light italic text-foreground/35 leading-[1.7] text-[clamp(0.75rem,0.72rem+0.15vw,0.8125rem)] max-w-md">
                  A comfort and care environment — not a medical treatment device.
                </p>
              </RevealOnScroll>
            </div>
            <div className="col-span-12 lg:col-span-7">
              <RevealImage delay={100} duration={1200}>
                <div className="relative aspect-[16/10] overflow-hidden lg:-mr-[3rem]">
                  <img
                    src={appImg}
                    alt="PE Recovery Station app — concept interface for session, temperature and lighting"
                    loading="lazy"
                    width={1792}
                    height={1024}
                    className="absolute inset-0 w-full h-full object-cover img-feature"
                  />
                </div>
              </RevealImage>
            </div>
          </div>
        </section>

        {/* ─── DETAILS GRID ────────────────────────────────────── */}
        <section className="py-[clamp(6rem,4rem+8vw,12rem)] bg-background">
          <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
            <RevealOnScroll direction="up" duration={900}>
              <div className="mb-[clamp(3.5rem,2.25rem+5vw,6rem)] space-y-3 max-w-xl">
                <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">
                  Detail
                </p>
                <h3 className="font-serif text-foreground/85 leading-[1.1] tracking-[-0.02em] text-[clamp(1.5rem,1rem+2vw,2.4rem)]">
                  Considered to the millimetre.
                </h3>
                <RevealLine width="w-8" delay={200} />
              </div>
            </RevealOnScroll>

            <RevealImage delay={100} duration={1200}>
              <div className="relative aspect-[16/10] overflow-hidden mb-[clamp(3rem,2rem+3vw,5rem)]">
                <img
                  src={detailsImg}
                  alt="Peninsula Equine Recovery Station — close-up details: PE logo, infrared panel, drainage and tack hardware"
                  loading="lazy"
                  width={1792}
                  height={1024}
                  className="absolute inset-0 w-full h-full object-cover img-feature"
                />
              </div>
            </RevealImage>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/[0.05]">
              {details.map((p, i) => (
                <RevealOnScroll key={p.k} direction="up" delay={i * 90}>
                  <div className="group relative bg-background px-[clamp(1.5rem,1.1rem+1.5vw,2.25rem)] py-[clamp(2.25rem,1.5rem+3vw,3.75rem)] h-full">
                    <span className="absolute top-0 left-0 h-px w-8 bg-accent/40 transition-all duration-[1100ms] ease-[cubic-bezier(0.45,0,0.15,1)] group-hover:w-20" />
                    <p className="font-mono uppercase text-foreground/25 mb-[clamp(1rem,0.8rem+1vw,1.5rem)] text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
                      {p.k}
                    </p>
                    <p className="font-serif text-foreground/90 leading-[1.15] tracking-[-0.02em] text-[clamp(1.25rem,1rem+1vw,1.65rem)] mb-4">
                      {p.label}
                    </p>
                    <p className="font-sans font-light text-foreground/50 leading-[1.8] text-[clamp(0.8125rem,0.78rem+0.15vw,0.875rem)]">
                      {p.body}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ─── COMMISSION ──────────────────────────────────────── */}
        <section className="py-[clamp(7rem,4.5rem+9vw,13rem)] bg-background">
          <div className="max-w-3xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] text-center space-y-[clamp(2.5rem,1.5rem+3vw,3.5rem)]">
            <RevealLine className="mx-auto" width="w-10" />
            <RevealOnScroll direction="up" duration={900}>
              <p className="font-mono uppercase text-accent/55 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]">
                Limited Commissions — 2026
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={150}>
              <p className="font-serif italic text-foreground/75 leading-[1.4] tracking-[-0.01em] text-[clamp(1.25rem,0.9rem+1.4vw,1.85rem)]">
                The Recovery Station is commissioned, not configured. Each is sited
                inside the stable, detailed to the property — by application only.
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="none" duration={1200} delay={500}>
              <p
                className="font-mono uppercase italic text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.5em]"
                style={{ color: "hsl(var(--muted-foreground) / 0.18)" }}
              >
                From Dirt to Dynasty
              </p>
            </RevealOnScroll>

            <RevealOnScroll direction="up" delay={400}>
              <div className="flex flex-col sm:flex-row gap-[clamp(1.75rem,1rem+2vw,3.5rem)] justify-center items-center pt-4">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]"
                >
                  <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                  Request Assessment
                </Link>
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/40 hover:text-foreground/80 transition-colors duration-500 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]"
                >
                  Selected Work
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
