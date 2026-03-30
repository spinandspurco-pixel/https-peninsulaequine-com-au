import { DURATION, EASE } from "@/lib/motion";
import type { Zone } from "./masterplanData";

/* Zone images */
import imgArena from "@/assets/zone-arena.jpg";
import imgStableRow from "@/assets/zone-stable-row.jpg";
import imgWestWing from "@/assets/zone-west-wing.jpg";
import imgCourtyard from "@/assets/zone-courtyard.jpg";
import imgService from "@/assets/zone-service.jpg";
import imgTack from "@/assets/zone-tack.jpg";
import imgViewing from "@/assets/zone-viewing.jpg";

const ZONE_IMAGES: Record<string, string> = {
  "indoor-arena": imgArena,
  "stable-row": imgStableRow,
  "west-wing": imgWestWing,
  courtyard: imgCourtyard,
  "viewing-loft": imgViewing,
  "service-wing": imgService,
  "tack-rooms": imgTack,
};

export function MasterplanDetailCard({ zone, visible }: { zone: Zone | null; visible: boolean }) {
  const img = zone ? ZONE_IMAGES[zone.id] : null;

  return (
    <div
      className="pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(2px)",
        transition: `opacity 500ms cubic-bezier(0.45, 0, 0.15, 1) ${visible ? '180ms' : '0ms'}, transform 500ms cubic-bezier(0.45, 0, 0.15, 1) ${visible ? '180ms' : '0ms'}`,
        willChange: "opacity, transform",
      }}
    >
      {zone && (
        <div className="max-w-[260px]">
          {/* Zone image */}
          {img && (
            <div className="relative w-full aspect-[2.2/1] mb-4 overflow-hidden">
              <img
                src={img}
                alt={zone.label}
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.65) saturate(0.78) contrast(1.06) sepia(0.04)" }}
                loading="lazy"
                decoding="async"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, hsl(var(--background) / 0.7) 0%, transparent 55%)" }}
              />
            </div>
          )}

          {/* Zone tag */}
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-4 h-px bg-accent/10" />
            <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-accent/15">Zone</span>
          </div>

          {/* Zone name */}
          <h3 className="font-serif text-base sm:text-lg text-foreground/55 tracking-[0.03em] leading-tight mb-1.5">
            {zone.label}
          </h3>

          {/* Tagline */}
          <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-accent/18 mb-3 leading-relaxed">
            {zone.tagline}
          </p>

          {/* Description */}
          <p className="text-[11px] text-muted-foreground/22 font-serif italic leading-[1.85] mb-3.5">
            {zone.description}
          </p>

          {/* Divider */}
          <div className="w-5 h-px bg-accent/5 mb-2.5" />

          {/* Features */}
          <ul className="space-y-1.5">
            {zone.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-0.5 h-0.5 rounded-full bg-accent/10 mt-[5px] shrink-0" />
                <span className="text-[10px] text-muted-foreground/20 font-mono tracking-[0.04em] leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
