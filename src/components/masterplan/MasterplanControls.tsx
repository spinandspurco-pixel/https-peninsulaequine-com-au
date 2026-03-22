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
    <div className="space-y-6">
      {/* Build layer toggles */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-accent/25 mb-3">Build Layer</p>
        <div className="flex gap-1">
          {buildLayers.map(l => (
            <button
              key={l.id}
              onClick={() => onBuildLayerChange(l.id)}
              className={cn(
                "flex-1 py-2 px-2.5 text-[10px] font-mono uppercase tracking-[0.15em] transition-all duration-300 border",
                buildLayer === l.id
                  ? "border-accent/25 bg-accent/8 text-accent/60"
                  : "border-transparent bg-transparent text-accent/20 hover:text-accent/35"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground/25 font-mono">
          {buildLayers.find(l => l.id === buildLayer)?.description}
        </p>
      </div>

      {/* Movement flow toggles */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-accent/25 mb-3">Movement Flow</p>
        <div className="space-y-1.5">
          {flowPaths.map(f => {
            const isActive = activeFlows.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => onToggleFlow(f.id)}
                className={cn(
                  "w-full flex items-center gap-3 py-2 px-3 text-left transition-all duration-300 border",
                  isActive
                    ? "border-accent/15 bg-accent/5"
                    : "border-transparent hover:bg-accent/3"
                )}
              >
                <div
                  className="w-4 h-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: f.color,
                    opacity: isActive ? 0.6 : 0.2,
                    transition: "opacity 300ms ease",
                  }}
                />
                <span className={cn(
                  "text-[10px] font-mono uppercase tracking-[0.15em] transition-colors duration-300",
                  isActive ? "text-accent/50" : "text-accent/20"
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
