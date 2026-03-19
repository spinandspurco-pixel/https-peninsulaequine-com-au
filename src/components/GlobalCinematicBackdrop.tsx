import { useLocation } from "react-router-dom";

const hiddenPrefixes = ["/admin", "/employee", "/bookings", "/staff", "/trainer"];

/**
 * Architectural backdrop — subtle engineering grid + grain texture.
 * Replaces video loops with lightweight static CSS textures.
 */
export function GlobalCinematicBackdrop() {
  const { pathname } = useLocation();

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Engineering grid — ultra-subtle structural reference */}
      <div className="absolute inset-0 engineering-grid" />

      {/* Grain texture for tactile depth */}
      <div className="absolute inset-0 grain-texture" />

      {/* Subtle warm vignette at edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, hsl(222 20% 3% / 0.4) 100%)`,
        }}
      />
    </div>
  );
}
