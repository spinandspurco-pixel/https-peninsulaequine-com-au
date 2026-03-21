import { Switch } from "@/components/ui/switch";
import { GroundLockPanelSVG, PanelDefs } from "@/components/groundlock/GroundLockPanelSVG";

interface Props {
  included: boolean | null;
  groundlockOn: boolean;
  onToggle: (v: boolean) => void;
}

export function ProposalGroundLock({ included, groundlockOn, onToggle }: Props) {
  if (included === null) return null;

  return (
    <section className="pb-24">
      <div className="border-t border-b py-18" style={{ borderColor: "rgba(43,43,43,0.05)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-18 items-start">
          {/* Left — Text */}
          <div>
            <p
              className="text-[9px] font-sans uppercase tracking-[0.22em] mb-6 font-medium"
              style={{ color: "#8C6A3B", opacity: 0.4 }}
            >
              Key Feature
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-4" style={{ color: "#2B2B2B", lineHeight: 1.1, letterSpacing: "0.01em" }}>
              GroundLock™ Ground<br />Stabilisation System
            </h2>
            <p className="text-[12px] font-sans leading-[1.95] mb-7" style={{ color: "#2B2B2B", opacity: 0.38 }}>
              Recommended for entry zones, float access, and high-traffic areas.
              These are the first areas to fail without proper ground stabilisation.
            </p>

            {/* Toggle */}
            <div className="flex items-center gap-4">
              <Switch
                checked={groundlockOn}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-[#8C6A3B]"
              />
              <span className="text-[11px] font-sans" style={{ color: "#2B2B2B", opacity: 0.45 }}>
                {groundlockOn ? "GroundLock™ included" : "Standard surface"}
              </span>
            </div>
          </div>

          {/* Right — Visual (the ONE strong visual anchor) */}
          <div className="flex items-center justify-center">
            {groundlockOn ? (
              <div
                className="w-full max-w-xs p-8 flex flex-col items-center transition-opacity duration-700"
                style={{ background: "rgba(255,255,255,0.4)" }}
              >
                <svg viewBox="0 0 100 110" className="w-44 h-auto mb-7" style={{ opacity: 0.75 }}>
                  <PanelDefs id="pq" />
                  <GroundLockPanelSVG active showTabs defsId="pq" direction="up" />
                </svg>
                <div className="space-y-2 w-full">
                  {["Controlled geometry", "Directional stability", "Drainage management", "Clean finish"].map((t) => (
                    <div key={t} className="flex items-center gap-2.5">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "#8C6A3B", opacity: 0.35 }} />
                      <p className="text-[10px] font-sans" style={{ color: "#2B2B2B", opacity: 0.38 }}>{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-xs p-8 transition-opacity duration-700" style={{ opacity: 0.6 }}>
                <p className="text-[12px] font-sans leading-[1.95]" style={{ color: "#2B2B2B", opacity: 0.32 }}>
                  Standard surface performance will apply in these areas.
                  GroundLock™ can be specified at any stage.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
