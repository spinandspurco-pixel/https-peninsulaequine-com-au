import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { InteractiveMasterplan } from "@/components/masterplan/InteractiveMasterplanV2";
import { Link } from "react-router-dom";

// Zone imagery for build detail
import imgArena from "@/assets/walk-arena.jpg";
import imgStables from "@/assets/walk-stables.jpg";
import imgCourtyard from "@/assets/walk-courtyard.jpg";
import imgLoft from "@/assets/walk-loft.jpg";

const BUILD_DETAILS: Record<string, { image: string; caption: string }> = {
  "indoor-arena": { image: imgArena, caption: "24 × 48m clear-span arena. GroundLock surface system." },
  "stable-row": { image: imgStables, caption: "S1–S4 with central breezeway. Cross-ventilation resolved." },
  "courtyard": { image: imgCourtyard, caption: "All movement converges. Horse. Rider. Service." },
  "viewing-loft": { image: imgLoft, caption: "Full arena oversight from upper level." },
  "west-wing": { image: imgStables, caption: "Quieter wing. Direct paddock connection." },
  "service-wing": { image: imgCourtyard, caption: "Wash bay. WC. Tie-up. Positioned for efficiency." },
  "tack-rooms": { image: imgLoft, caption: "Support spaces resolved beneath the viewing loft." },
};

export default function Projects() {
  const [activeDetail, setActiveDetail] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Projects | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);

  const detail = activeDetail ? BUILD_DETAILS[activeDetail] : null;

  return (
    <Layout>
      {/* ═══ SECTION 1 — HERO ═══════════════════════════ */}
      <section className="pt-48 sm:pt-64 pb-20 sm:pb-28">
        <div className="section-container max-w-3xl mx-auto text-center">
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground/90 tracking-tight leading-[0.9] opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Selected Work
          </h1>
          <div
            className="mt-8 flex items-center justify-center gap-4 opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            <div className="w-8 h-px" style={{ background: "hsl(var(--accent) / 0.15)" }} />
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-foreground/15">
              Main Ridge Estate
            </p>
            <div className="w-8 h-px" style={{ background: "hsl(var(--accent) / 0.15)" }} />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2 — INTERACTIVE MASTERPLAN ═════════ */}
      <InteractiveMasterplan
        onZoneHover={() => {}}
        onZoneLeave={() => setActiveDetail(null)}
      />

      {/* ═══ SECTION 3 — BUILD DETAIL ══════════════════ */}
      <section className="py-28 sm:py-36 relative overflow-hidden">
        <div className="section-container max-w-5xl mx-auto">
          <RevealOnScroll direction="up">
            <div className="text-center mb-16">
              <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-accent/15 mb-4">
                Build Intelligence
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground/70 tracking-tight leading-[0.95]">
                Every zone resolved.
              </h2>
            </div>
          </RevealOnScroll>

          {/* Detail grid — architectural image cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(BUILD_DETAILS).slice(0, 4).map(([zoneId, data]) => (
              <div
                key={zoneId}
                className="group relative overflow-hidden cursor-pointer"
                onMouseEnter={() => setActiveDetail(zoneId)}
                onMouseLeave={() => setActiveDetail(null)}
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    src={data.image}
                    alt={data.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                    style={{ filter: "brightness(1.05) contrast(1.12) saturate(0.85)" }}
                  />
                  {/* Blueprint overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60"
                    style={{
                      backgroundImage: `
                        linear-gradient(0deg, hsl(var(--accent) / 0.04) 1px, transparent 1px),
                        linear-gradient(90deg, hsl(var(--accent) / 0.04) 1px, transparent 1px)
                      `,
                      backgroundSize: "32px 32px",
                    }}
                  />
                  {/* Bottom caption */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/60">
                      {data.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ════════════════════════════════ */}
      <section className="py-36 sm:py-48">
        <div className="text-center">
          <Link
            to="/contact"
            className="inline-block px-12 py-4 border text-[11px] font-mono uppercase tracking-[0.3em] hover:bg-accent/[0.03] transition-colors duration-500"
            style={{
              borderColor: "hsl(var(--accent) / 0.08)",
              color: "hsl(var(--foreground) / 0.35)",
            }}
          >
            Start a Project →
          </Link>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/10">
            Selected builds only.
          </p>
        </div>
      </section>
    </Layout>
  );
}
