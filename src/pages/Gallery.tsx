import { useEffect, useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { InteractiveMasterplan } from "@/components/masterplan/InteractiveMasterplanV2";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { Link } from "react-router-dom";

import transformBefore from "@/assets/transform-before.jpg";
import transformAfter from "@/assets/transform-after.jpg";

import imgArena from "@/assets/zone-arena.jpg";
import imgStableRow from "@/assets/zone-stable-row.jpg";
import imgWestWing from "@/assets/zone-west-wing.jpg";
import imgCourtyard from "@/assets/zone-courtyard.jpg";
import imgService from "@/assets/zone-service.jpg";
import imgTack from "@/assets/zone-tack.jpg";
import imgViewing from "@/assets/zone-viewing.jpg";

const ZONE_REVEAL: Record<string, { image: string; line: string; crop: string }> = {
  "indoor-arena": { image: imgArena, line: "Clear-span. Engineered for performance under load.", crop: "50% 50%" },
  "stable-row": { image: imgStableRow, line: "Cross-ventilation resolved through the corridor axis.", crop: "50% 50%" },
  "west-wing": { image: imgWestWing, line: "Quieter wing. Direct paddock connection.", crop: "50% 50%" },
  "courtyard": { image: imgCourtyard, line: "All movement converges here.", crop: "50% 40%" },
  "service-wing": { image: imgService, line: "Clean and service workflows separated.", crop: "50% 50%" },
  "tack-rooms": { image: imgTack, line: "Support spaces beneath the viewing loft.", crop: "50% 40%" },
  "viewing-loft": { image: imgViewing, line: "Full arena oversight from upper level.", crop: "50% 50%" },
};

function BuildReveal({
  zoneId,
  onHoverZone,
  onLeaveZone,
}: {
  zoneId: string | null;
  onHoverZone?: (id: string) => void;
  onLeaveZone?: () => void;
}) {
  const [displayed, setDisplayed] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (zoneId) {
      setVisible(false);
      timer.current = setTimeout(() => {
        setDisplayed(zoneId);
        setVisible(true);
      }, 350);
    } else {
      setVisible(false);
      timer.current = setTimeout(() => setDisplayed(null), 500);
    }

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [zoneId]);

  const data = displayed ? ZONE_REVEAL[displayed] : null;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        height: data ? "auto" : "0",
        paddingTop: data ? "clamp(4rem, 8vw, 8rem)" : "0",
        paddingBottom: data ? "clamp(4rem, 8vw, 8rem)" : "0",
        transition: "padding 700ms cubic-bezier(0.45, 0, 0.15, 1)",
      }}
      onMouseEnter={() => displayed && onHoverZone?.(displayed)}
      onMouseLeave={() => onLeaveZone?.()}
    >
      {data && (
        <div className="section-container max-w-5xl mx-auto">
          <div
            className="relative w-full aspect-[21/9] overflow-hidden"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 600ms cubic-bezier(0.45, 0, 0.15, 1), transform 600ms cubic-bezier(0.45, 0, 0.15, 1)",
              willChange: "opacity, transform",
            }}
          >
            <img
              src={data.image}
              alt=""
              className="w-full h-full object-cover"
              style={{
                objectPosition: data.crop,
                filter: "brightness(1.08) contrast(1.15) saturate(0.82)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(0deg, hsl(var(--accent) / 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--accent) / 0.03) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <p
            className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/15 text-center"
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 500ms cubic-bezier(0.45, 0, 0.15, 1) 200ms",
            }}
          >
            {data.line}
          </p>
        </div>
      )}
    </section>
  );
}

export default function Projects() {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [hoverSource, setHoverSource] = useState<"masterplan" | "reveal" | null>(null);

  const handleMasterplanChange = (id: string | null) => {
    setActiveZone(id);
    setHoverSource(id ? "masterplan" : null);
  };

  const handleRevealHover = (id: string) => {
    setActiveZone(id);
    setHoverSource("reveal");
  };

  const handleRevealLeave = () => {
    if (hoverSource === "reveal") {
      setActiveZone(null);
      setHoverSource(null);
    }
  };

  useEffect(() => {
    document.title = "Projects | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);

  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-48 sm:pt-56 pb-16 sm:pb-20 overflow-hidden">
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

      {/* ═══ INTERACTIVE MASTERPLAN ═════════════════════ */}
      <InteractiveMasterplan
        onZoneChange={handleMasterplanChange}
        externalActiveZone={hoverSource === "reveal" ? activeZone : undefined}
      />

      {/* ═══ BUILD REVEAL — linked to masterplan ═══════ */}
      <BuildReveal zoneId={activeZone} onHoverZone={handleRevealHover} onLeaveZone={handleRevealLeave} />

      {/* ═══ TRANSFORMATION ══════════════════════════ */}
      <section className="py-28 sm:py-40 relative overflow-hidden">
        <div className="section-container max-w-5xl mx-auto">
          <div className="flex items-center gap-5 mb-10 justify-center">
            <div className="w-6 h-px bg-accent/10" />
            <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-accent/15">
              Transformation
            </p>
            <div className="w-6 h-px bg-accent/10" />
          </div>
          <BeforeAfterSlider
            before={transformBefore}
            after={transformAfter}
            alt="Site transformation"
          />
          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/12 text-center">
            From dirt to dynasty.
          </p>
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
