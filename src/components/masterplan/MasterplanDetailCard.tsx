import { DURATION, EASE } from "@/lib/motion";
import type { Zone } from "./masterplanData";

/* Zone images — mapped to new zone IDs */
import imgIndoor from "@/assets/walk-arena.jpg";
import imgStables from "@/assets/walk-stables.jpg";
import imgCourtyard from "@/assets/walk-courtyard.jpg";
import imgLoft from "@/assets/walk-loft.jpg";

const ZONE_IMAGES: Record<string, string> = {
  "indoor-arena": imgIndoor,
  "stable-row": imgStables,
  "west-wing": imgStables,
  courtyard: imgCourtyard,
  "viewing-loft": imgLoft,
  "service-wing": imgCourtyard,
  "tack-rooms": imgCourtyard,
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
        <div className="max-w-[280px]">
          {/* Zone image */}
          {img && (
            <div className="relative w-full aspect-[2/1] mb-4 overflow-hidden">
              <img
                src={img}
                alt={zone.label}
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.7) saturate(0.82) contrast(1.06) sepia(0.04)" }}
                loading="lazy"
                decoding="async"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, hsl(var(--background) / 0.65) 0%, transparent 50%)" }}
              />
            </div>
          )}

          {/* Zone tag */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-px bg-accent/15" />
            <span className="text-[9px] font-mono uppercase tracking-[0.35em] text-accent/20">Zone</span>
          </div>

          {/* Zone name */}
          <h3 className="font-serif text-lg sm:text-xl text-foreground/65 tracking-[0.02em] leading-tight mb-2">
            {zone.label}
          </h3>

          {/* Tagline */}
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent/25 mb-3">
            {zone.tagline}
          </p>

          {/* Description */}
          <p className="text-[12px] text-muted-foreground/28 font-serif italic leading-relaxed mb-4">
            {zone.description}
          </p>

          {/* Divider */}
          <div className="w-6 h-px bg-accent/6 mb-3" />

          {/* Features */}
          <ul className="space-y-2">
            {zone.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-0.5 h-0.5 rounded-full bg-accent/15 mt-[6px] shrink-0" />
                <span className="text-[11px] text-muted-foreground/25 font-mono tracking-wide leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
