import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { useParallaxDepthStore } from "@/stores/parallaxDepthStore";
import { cn } from "@/lib/utils";

export function ParallaxDepthToggle() {
  const { enabled, toggle } = useParallaxDepthStore();
  const [announced, setAnnounced] = useState<string | null>(null);

  // Keyboard shortcut: Alt+P to toggle parallax
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  // Announce state change to screen readers
  useEffect(() => {
    setAnnounced(enabled ? "Parallax depth enabled" : "Parallax depth disabled");
    const t = setTimeout(() => setAnnounced(null), 2000);
    return () => clearTimeout(t);
  }, [enabled]);

  return (
    <>
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announced}
      </div>

      <button
        onClick={toggle}
        aria-label={enabled ? "Disable parallax depth (Alt+P)" : "Enable parallax depth (Alt+P)"}
        aria-pressed={enabled}
        title={enabled ? "Parallax depth: ON (Alt+P)" : "Parallax depth: OFF (Alt+P)"}
        className={cn(
          "fixed bottom-20 left-4 z-30 w-10 h-10 rounded-full flex items-center justify-center",
          "border shadow-md transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          enabled
            ? "bg-accent/15 border-accent/40 text-accent hover:bg-accent/25"
            : "bg-muted/80 border-border text-muted-foreground hover:bg-muted"
        )}
      >
        <Layers className={cn("h-4 w-4 transition-transform duration-300", enabled && "scale-110")} />
      </button>
    </>
  );
}
