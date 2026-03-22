import { DURATION, EASE } from "@/lib/motion";
import type { Zone } from "./masterplanData";

/* Zone images */
import imgIndoor from "@/assets/walk-arena.jpg";
import imgStables from "@/assets/walk-stables.jpg";
import imgCourtyard from "@/assets/walk-courtyard.jpg";
import imgLoft from "@/assets/walk-loft.jpg";

const ZONE_IMAGES: Record<string, string> = {
  "indoor-arena": imgIndoor,
  stables: imgStables,
  courtyard: imgCourtyard,
  "viewing-area": imgLoft,
  "service-wing": imgCourtyard,
  "wash-bay": imgCourtyard,
  "arena-store": imgIndoor,
};

export function MasterplanDetailCard({ zone, visible }: { zone: Zone | null; visible: boolean }) {
  const img = zone ? ZONE_IMAGES[zone.id] : null;

  return (
    <div
      className="pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${DURATION.normal}ms ${EASE.default}`,
        willChange: "opacity",
      }}
    >
      {zone && (
        <div className="max-w-[300px]">
          {/* Zone image */}
          {img && (
            <div className="relative w-full aspect-[16/9] mb-5 overflow-hidden">
              <img
                src={img}
                alt={zone.label}
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.75)" }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, hsl(var(--background) / 0.6) 0%, transparent 60%)" }}
              />
            </div>
          )}

          {/* Zone tag */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-px bg-accent/20" />
            <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-accent/25">Zone</span>
          </div>

          {/* Zone name */}
          <h3 className="font-serif text-xl sm:text-2xl text-foreground/70 tracking-[0.02em] leading-tight mb-2">
            {zone.label}
          </h3>

          {/* Tagline */}
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent/30 mb-3">
            {zone.tagline}
          </p>

          {/* Description */}
          <p className="text-[13px] text-muted-foreground/30 font-serif italic leading-relaxed mb-5">
            {zone.description}
          </p>

          {/* Divider */}
          <div className="w-8 h-px bg-accent/8 mb-4" />

          {/* Features */}
          <ul className="space-y-2.5">
            {zone.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1 h-1 rounded-full bg-accent/18 mt-[7px] shrink-0" />
                <span className="text-xs text-muted-foreground/28 font-mono tracking-wide leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
