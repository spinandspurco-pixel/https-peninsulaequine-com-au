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
    <div className="space-y-5">
      {/* Build layer */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-accent/20 mb-2.5">Build Layer</p>
        <div className="flex gap-px">
          {buildLayers.map(l => (
            <button
              key={l.id}
              onClick={() => onBuildLayerChange(l.id)}
              className={cn(
                "flex-1 py-1.5 px-2 text-[10px] font-mono uppercase tracking-[0.12em] transition-opacity duration-300",
                buildLayer === l.id
                  ? "text-accent/50 border-b border-accent/20"
                  : "text-accent/15 border-b border-transparent hover:text-accent/25"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground/20 font-mono">
          {buildLayers.find(l => l.id === buildLayer)?.desc}
        </p>
      </div>

      {/* Movement */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-accent/20 mb-2.5">Movement</p>
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
                  className="w-3 h-px rounded-full shrink-0"
                  style={{
                    backgroundColor: f.color,
                    opacity: isActive ? 0.5 : 0.15,
                    transition: "opacity 300ms ease",
                  }}
                />
                <span className={cn(
                  "text-[10px] font-mono uppercase tracking-[0.1em] transition-colors duration-300",
                  isActive ? "text-accent/40" : "text-accent/15"
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
