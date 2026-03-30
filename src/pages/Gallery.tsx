import { useEffect, useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { InteractiveMasterplan } from "@/components/masterplan/InteractiveMasterplanV2";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { Link } from "react-router-dom";

import mainridgeBefore from "@/assets/mainridge-before.jpg";
import mainridgeAfter from "@/assets/mainridge-after.jpg";

import imgArena from "@/assets/zone-arena.jpg";
import imgStableRow from "@/assets/zone-stable-row.jpg";
import imgCourtyard from "@/assets/zone-courtyard.jpg";
import imgService from "@/assets/zone-service.jpg";

const ZONE_REVEAL: Record<string, { image: string; line: string; crop: string }> = {
  "indoor-arena": { image: imgArena, line: "Clear-span. Engineered for performance under load.", crop: "50% 50%" },
  "stables": { image: imgStableRow, line: "Cross-ventilation resolved through the corridor axis.", crop: "50% 50%" },
  "access": { image: imgCourtyard, line: "All movement converges here.", crop: "50% 40%" },
  "ground-systems": { image: imgService, line: "Engineered surfaces. Drainage resolved at every level.", crop: "50% 50%" },
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
      setDisplayed(zoneId);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      timer.current = setTimeout(() => setDisplayed(null), 200);
    }

    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [zoneId]);

  const data = displayed ? ZONE_REVEAL[displayed] : null;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        paddingTop: data ? "clamp(2rem, 4vw, 4rem)" : "0",
        paddingBottom: data ? "clamp(4rem, 8vw, 8rem)" : "0",
        transition: "padding 350ms cubic-bezier(0.45, 0, 0.15, 1)",
      }}
      onMouseEnter={() => displayed && onHoverZone?.(displayed)}
      onMouseLeave={() => onLeaveZone?.()}
    >
      <div
        className="max-w-5xl mx-auto px-4 sm:px-6"
        style={{
          opacity: visible && data ? 1 : 0,
          transition: "opacity 250ms cubic-bezier(0.45, 0, 0.15, 1)",
        }}
      >
        {data && (
          <>
            <div className="relative w-full aspect-[21/9] overflow-hidden">
              <img
                src={data.image}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  objectPosition: data.crop,
                  filter: "brightness(1.08) contrast(1.15) saturate(0.82)",
                }}
              />
            </div>

            <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/12 text-center">
              {data.line}
            </p>
          </>
        )}
      </div>
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
            className="heading-display text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Selected Work
          </h1>
          <p
            className="mt-10 font-serif italic text-sm tracking-[0.04em] text-foreground/[0.12] opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Every build is resolved at plan level.
          </p>
        </div>
      </section>

      {/* ═══ INTERACTIVE MASTERPLAN ═════════════════════ */}
      <InteractiveMasterplan
        onZoneChange={handleMasterplanChange}
        externalActiveZone={hoverSource === "reveal" ? activeZone : undefined}
      />

      {/* ═══ BUILD REVEAL — linked to masterplan ═══════ */}
      <BuildReveal zoneId={activeZone} onHoverZone={handleRevealHover} onLeaveZone={handleRevealLeave} />

      {/* ═══ TRANSFORMATION — Main Ridge ═════════════ */}
      <section className="py-28 sm:py-40 relative overflow-hidden">
        <div className="section-container max-w-5xl mx-auto">
          <div className="flex items-center gap-5 mb-10 justify-center">
            <div className="w-6 h-px bg-accent/10" />
            <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-accent/15">
              Main Ridge — Transformation
            </p>
            <div className="w-6 h-px bg-accent/10" />
          </div>
          <BeforeAfterSlider
            before={mainridgeBefore}
            after={mainridgeAfter}
            alt="Main Ridge Estate — site to build"
          />
          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/12 text-center">
            From dirt to dynasty.
          </p>
        </div>
      </section>

      {/* ═══ CLOSING STATEMENT ═══════════════════════ */}
      <section className="pt-32 sm:pt-48 pb-20 sm:pb-28">
        <p className="text-center font-serif italic text-sm sm:text-base tracking-[0.04em] text-foreground/[0.15]">
          Every line resolves in the build.
        </p>
      </section>

      {/* ═══ FINAL CTA ════════════════════════════════ */}
      <section className="pb-36 sm:pb-48">
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
        </div>
      </section>
    </Layout>
  );
}
