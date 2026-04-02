import { useEffect, useState, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { InteractiveMasterplan } from "@/components/masterplan/InteractiveMasterplanV2";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { X } from "lucide-react";

import mainridgeBefore from "@/assets/mainridge-before.jpg";
import mainridgeAfter from "@/assets/mainridge-after.jpg";

import imgArena from "@/assets/zone-arena-v2.jpg";
import imgStableRow from "@/assets/zone-stable-row-v2.jpg";
import imgCourtyard from "@/assets/zone-courtyard-v2.jpg";
import imgService from "@/assets/zone-service-v2.jpg";

const ZONE_REVEAL: Record<string, { image: string; line: string; label: string }> = {
  "indoor-arena": { image: imgArena, label: "Arena", line: "Clear-span. Engineered for performance under load." },
  "stables": { image: imgStableRow, label: "Stables", line: "Cross-ventilation resolved through the corridor axis." },
  "access": { image: imgCourtyard, label: "Courtyard", line: "All movement converges here." },
  "ground-systems": { image: imgService, label: "Ground Systems", line: "Engineered surfaces. Drainage resolved at every level." },
};

/* ── Lightbox for mobile tap-to-expand ── */
function ZoneLightbox({ image, label, line, onClose }: { image: string; label: string; line: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-2 text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full max-w-3xl px-6" onClick={e => e.stopPropagation()}>
        <div className="relative overflow-hidden rounded-sm">
          <img
            src={image}
            alt={label}
            className="w-full h-auto object-cover"
            style={{ maxHeight: "70vh" }}
          />
        </div>
        <div className="mt-6 text-center">
          <p className="font-serif text-sm text-primary-foreground/60 tracking-[0.04em]">{label}</p>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.35em] text-primary-foreground/25">{line}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Build Reveal — compact image with hover/tap ── */
function BuildReveal({
  zoneId,
  onHoverZone,
  onLeaveZone,
}: {
  zoneId: string | null;
  onHoverZone?: (id: string) => void;
  onLeaveZone?: () => void;
}) {
  const isMobile = useIsMobile();
  const [displayed, setDisplayed] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
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

  const handleImageInteraction = useCallback(() => {
    if (displayed) setLightbox(displayed);
  }, [displayed]);

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          paddingTop: data ? "clamp(1.5rem, 3vw, 3rem)" : "0",
          paddingBottom: data ? "clamp(2rem, 4vw, 4rem)" : "0",
          transition: "padding 350ms cubic-bezier(0.45, 0, 0.15, 1)",
        }}
        onMouseEnter={() => displayed && onHoverZone?.(displayed)}
        onMouseLeave={() => onLeaveZone?.()}
      >
        <div
          className="max-w-2xl mx-auto px-4 sm:px-6"
          style={{
            opacity: visible && data ? 1 : 0,
            transition: "opacity 250ms cubic-bezier(0.45, 0, 0.15, 1)",
          }}
        >
          {data && (
            <>
              <div
                className="relative overflow-hidden cursor-pointer group"
                style={{ maxWidth: "540px", margin: "0 auto" }}
                onClick={handleImageInteraction}
                role="button"
                tabIndex={0}
                aria-label={`View ${data.label} detail`}
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    src={data.image}
                    alt={data.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    width={1920}
                    height={1280}
                  />
                  {/* Subtle overlay with label */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/15 transition-colors duration-500 flex items-end p-4 sm:p-5">
                    <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-primary-foreground/0 group-hover:text-primary-foreground/60 transition-colors duration-500">
                      {isMobile ? "Tap to expand" : "Click to expand"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/12 text-center">
                {data.line}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && ZONE_REVEAL[lightbox] && (
        <ZoneLightbox
          image={ZONE_REVEAL[lightbox].image}
          label={ZONE_REVEAL[lightbox].label}
          line={ZONE_REVEAL[lightbox].line}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
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
