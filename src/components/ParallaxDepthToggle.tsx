import { Layers, LayersIcon } from "lucide-react";
import { useParallaxDepthStore } from "@/stores/parallaxDepthStore";
import { cn } from "@/lib/utils";

export function ParallaxDepthToggle() {
  const { enabled, toggle } = useParallaxDepthStore();

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? "Disable parallax depth" : "Enable parallax depth"}
      title={enabled ? "Parallax depth: ON" : "Parallax depth: OFF"}
      className={cn(
        "fixed bottom-20 left-4 z-30 w-10 h-10 rounded-full flex items-center justify-center",
        "border shadow-md transition-all duration-300",
        enabled
          ? "bg-accent/15 border-accent/40 text-accent hover:bg-accent/25"
          : "bg-muted/80 border-border text-muted-foreground hover:bg-muted"
      )}
    >
      <Layers className={cn("h-4 w-4 transition-transform duration-300", enabled && "scale-110")} />
    </button>
  );
}
