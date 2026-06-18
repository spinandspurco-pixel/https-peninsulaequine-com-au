/**
 * BlueprintContinuity
 * Page-wide, low-opacity drafting layer that visually binds sections
 * together so the page reads as one architectural plate rather than
 * stitched panels. Pointer-inert. Respects reduced motion.
 */
export function BlueprintContinuity() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden motion-reduce:hidden"
    >
      {/* Faint drafting grid — 80px spacing */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--accent)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Slow horizontal drafting sweep */}
      <div
        className="absolute top-0 left-0 h-full w-[18%] animate-draft-sweep-slow"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--accent) / 0.05) 50%, transparent 100%)",
        }}
      />

      {/* Hair-line vertical drafting threads, softly glowing */}
      <div className="absolute inset-y-0 left-[22%] w-px bg-accent/10 animate-measure-glow" />
      <div
        className="absolute inset-y-0 right-[14%] w-px bg-accent/10 animate-measure-glow"
        style={{ animationDelay: "2.5s" }}
      />

      {/* Slow vertical drafting band traveling down the page */}
      <div
        className="absolute left-0 right-0 h-[14%] animate-draft-sweep-v"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, hsl(var(--accent) / 0.04) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
