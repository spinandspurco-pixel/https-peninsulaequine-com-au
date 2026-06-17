import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import heroImg from "@/assets/main-ridge-arena-grading.jpg";

const items = [
  { k: "01", label: "Site Works & Drainage", body: "Cut, fill, contour, drain. The foundation of every later decision — done once, properly." },
  { k: "02", label: "Round Pens & Yards", body: "Permanent or relocatable. Engineered footing, properly hung gates, geometry that works the horse." },
  { k: "03", label: "Fencing & Boundaries", body: "Flex rail, post-and-rail, mesh, electric. Specified to discipline, terrain and risk." },
  { k: "04", label: "Driveways & Access", body: "All-weather entries, float circulation, hardstand zones detailed for daily use." },
  { k: "05", label: "Wash Bays & Float Bays", body: "Drainage, hardware, surface — resolved as building, not as fittings." },
  { k: "06", label: "Ongoing Maintenance", body: "Annual surface revival, fence audits, drainage clearance. The investment, protected." },
];

export default function InfrastructurePage() {
  return (
    <Layout>
      <article className="bg-background text-foreground">
        <section className="relative h-[78vh] min-h-[520px] overflow-hidden">
          <img src={heroImg} alt="Engineered site works and infrastructure" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover img-header" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/45 via-primary/15 to-primary/80" />
          <div className="absolute bottom-0 left-0 right-0 px-[clamp(1.5rem,0.75rem+3vw,4rem)] pb-[clamp(2.5rem,1.5rem+4vw,5rem)]">
            <div className="max-w-6xl space-y-[clamp(1.25rem,1rem+1vw,2rem)]">
              <RevealOnScroll direction="up" duration={900} delay={300}>
                <p className="font-mono uppercase text-accent/65 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">Capability — 05</p>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={500}>
                <h1 className="font-serif text-primary-foreground tracking-[-0.025em] leading-[0.95] text-[clamp(2.5rem,1.4rem+5.4vw,5.5rem)]">Infrastructure<br className="hidden sm:block" /> & Maintenance.</h1>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={1100} delay={800}>
                <p className="font-serif italic text-primary-foreground/55 max-w-xl leading-[1.55] text-[clamp(0.875rem,0.78rem+0.4vw,1.0625rem)]">
                  The invisible work. Done once, properly — then held by us for the life of the property.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-background">
          <div className="max-w-6xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)]">
            <RevealOnScroll direction="up">
              <div className="mb-[clamp(3rem,2rem+4vw,5rem)] max-w-xl space-y-3">
                <p className="font-mono uppercase text-accent/45 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.45em]">Scope</p>
                <h2 className="font-serif text-foreground/85 leading-[1.1] tracking-[-0.02em] text-[clamp(1.65rem,1.1rem+2.2vw,2.65rem)]">
                  Everything underneath, beside, and after the build.
                </h2>
                <RevealLine width="w-8" delay={200} />
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/[0.05]">
              {items.map((it, i) => (
                <RevealOnScroll key={it.k} direction="up" delay={(i % 3) * 100}>
                  <div className="group relative bg-background px-[clamp(1.75rem,1.25rem+2vw,2.5rem)] py-[clamp(2.5rem,1.5rem+3vw,4rem)]">
                    <span className="absolute top-0 left-0 h-px w-6 bg-accent/40 transition-all duration-[1100ms] group-hover:w-16" />
                    <p className="font-mono uppercase text-foreground/25 mb-5 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">{it.k}</p>
                    <p className="font-serif text-foreground/85 leading-[1.15] tracking-[-0.015em] text-[clamp(1.15rem,1rem+0.6vw,1.45rem)] mb-4">{it.label}</p>
                    <p className="font-sans font-light text-foreground/50 leading-[1.8] text-[clamp(0.8125rem,0.78rem+0.15vw,0.875rem)]">{it.body}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section className="py-[clamp(6rem,4rem+8vw,11rem)] bg-background text-center">
          <div className="max-w-2xl mx-auto px-[clamp(1.5rem,0.75rem+3vw,4rem)] space-y-10">
            <RevealLine className="mx-auto" width="w-10" />
            <RevealOnScroll direction="up">
              <p className="font-serif italic text-foreground/70 leading-[1.4] text-[clamp(1.25rem,0.9rem+1.4vw,1.85rem)]">
                Built properly. Held properly. Resolved completely.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={300}>
              <Link to="/contact" className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[clamp(0.5625rem,0.52rem+0.18vw,0.6875rem)] tracking-[0.4em]">
                <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
                Request Assessment
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      </article>
    </Layout>
  );
}
