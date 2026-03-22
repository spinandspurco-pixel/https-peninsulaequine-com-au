import { cn } from "@/lib/utils";
import { buildLayers, flowPaths, type BuildLayer } from "./masterplanData";

interface Props {
  buildLayer: BuildLayer;
  onBuildLayerChange: (layer: BuildLayer) => void;
  activeFlows: string[];
  onToggleFlow: (id: string) => void;
}

export function MasterplanControls({ buildLayer, onBuildLayerChange, activeFlows, onToggleFlow }: Props) {
  return (
    <div className="space-y-4">
      {/* Build layer */}
      <div>
        <p className="text-[8px] font-mono uppercase tracking-[0.3em] text-accent/14 mb-2">Build Layer</p>
        <div className="flex gap-px">
          {buildLayers.map(l => (
            <button
              key={l.id}
              onClick={() => onBuildLayerChange(l.id)}
              className={cn(
                "flex-1 py-1.5 px-2 text-[9px] font-mono uppercase tracking-[0.14em] transition-opacity duration-300",
                buildLayer === l.id
                  ? "text-accent/40 border-b border-accent/15"
                  : "text-accent/10 border-b border-transparent hover:text-accent/18"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[9px] text-muted-foreground/14 font-mono tracking-[0.04em]">
          {buildLayers.find(l => l.id === buildLayer)?.desc}
        </p>
      </div>

      {/* Movement */}
      <div>
        <p className="text-[8px] font-mono uppercase tracking-[0.3em] text-accent/14 mb-2">Movement</p>
        <div className="flex gap-3">
          {flowPaths.map(f => {
            const isActive = activeFlows.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => onToggleFlow(f.id)}
                className="flex items-center gap-2 transition-opacity duration-300"
              >
                <div
                  className="w-2.5 h-px rounded-full shrink-0"
                  style={{
                    backgroundColor: f.color,
                    opacity: isActive ? 0.4 : 0.1,
                    transition: "opacity 300ms ease",
                  }}
                />
                <span className={cn(
                  "text-[9px] font-mono uppercase tracking-[0.12em] transition-colors duration-300",
                  isActive ? "text-accent/30" : "text-accent/10"
                )}>
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
