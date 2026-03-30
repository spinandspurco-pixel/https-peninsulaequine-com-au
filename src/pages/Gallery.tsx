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

const BUILD_DETAILS: { zoneId: string; image: string; label: string; caption: string; crop: string; span?: string }[] = [
  { zoneId: "indoor-arena", image: imgArena, label: "Arena", caption: "24 × 48m clear-span. GroundLock surface system.", crop: "50% 60%", span: "sm:col-span-2" },
  { zoneId: "stable-row", image: imgStables, label: "S1–S4", caption: "Central breezeway. Cross-ventilation resolved.", crop: "40% 30%" },
  { zoneId: "courtyard", image: imgCourtyard, label: "Courtyard", caption: "All movement converges here.", crop: "50% 50%" },
  { zoneId: "west-wing", image: imgStables, label: "S5–S6", caption: "Quieter wing. Direct paddock connection.", crop: "60% 70%" },
  { zoneId: "service-wing", image: imgCourtyard, label: "Service", caption: "Wash bay. WC. Tie-up. Efficiency resolved.", crop: "30% 40%" },
  { zoneId: "tack-rooms", image: imgLoft, label: "Tack / Rooms", caption: "Support spaces beneath the viewing loft.", crop: "50% 30%" },
  { zoneId: "viewing-loft", image: imgLoft, label: "Viewing Loft", caption: "Full arena oversight from upper level.", crop: "50% 50%", span: "sm:col-span-2" },
];

export default function Projects() {
  const [activeDetail, setActiveDetail] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Projects | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);

  return (
    <Layout>
      {/* ═══ SECTION 1 — HERO ═══════════════════════════ */}
      <section className="relative pt-48 sm:pt-56 pb-24 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 engineering-grid opacity-[0.03]" aria-hidden="true" />
        <div className="section-container max-w-3xl mx-auto text-center relative z-10">
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground/85 tracking-tight leading-[0.9] opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Selected Work
          </h1>
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

          {/* Detail grid — all 7 zones with varied layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BUILD_DETAILS.map((data) => (
              <div
                key={data.zoneId}
                className={`group relative overflow-hidden cursor-pointer ${data.span || ""}`}
                onMouseEnter={() => setActiveDetail(data.zoneId)}
                onMouseLeave={() => setActiveDetail(null)}
              >
                <div className={`${data.span ? "aspect-[21/9]" : "aspect-[16/10]"} relative overflow-hidden`}>
                  <img
                    src={data.image}
                    alt={data.caption}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                    style={{
                      objectPosition: data.crop,
                      filter: "brightness(1.05) contrast(1.12) saturate(0.85)",
                    }}
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
                  {/* Zone label + caption */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-white/40 mb-1">
                      {data.label}
                    </p>
                    <p className="font-serif text-[11px] italic text-white/55 tracking-wide">
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
