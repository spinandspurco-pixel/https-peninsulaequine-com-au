/**
 * EditorialPlaceholder
 *
 * Dark, architectural stand-in for a section whose image has been removed
 * because it didn't match the Peninsula Equine cinematic visual system.
 *
 * Use this instead of leaving a wrong image in place. It carries a small
 * section label so an editor can see exactly which slot is awaiting an
 * approved visual.
 *
 *   <EditorialPlaceholder
 *     code="PE / IMG"
 *     label="Awaiting approved image — covered arena interior, dusk"
 *     aspect="16/9"
 *   />
 */

import { cn } from "@/lib/utils";

type Props = {
  /** Mono section code, e.g. "PE / 03" */
  code?: string;
  /** Short editorial reason for the empty slot. */
  label: string;
  /** Tailwind aspect-ratio class fragment, e.g. "16/9", "4/5". */
  aspect?: string;
  className?: string;
};

export function EditorialPlaceholder({
  code = "PE / IMG",
  label,
  aspect = "16/9",
  className,
}: Props) {
  return (
    <div
      role="img"
      aria-label={`${label} (placeholder — no approved image)`}
      className={cn(
        "relative overflow-hidden bg-[hsl(222_20%_5%)]",
        className
      )}
      style={{ aspectRatio: aspect.replace("/", " / ") }}
    >
      {/* Faint architectural drafting grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 75% at 50% 55%, transparent 30%, hsl(222 20% 3%) 100%)",
        }}
      />
      {/* Corner brackets */}
      <span aria-hidden className="absolute top-3 left-3 w-4 h-px bg-accent/45" />
      <span aria-hidden className="absolute top-3 left-3 w-px h-4 bg-accent/45" />
      <span aria-hidden className="absolute top-3 right-3 w-4 h-px bg-accent/45" />
      <span aria-hidden className="absolute top-3 right-3 w-px h-4 bg-accent/45" />
      <span aria-hidden className="absolute bottom-3 left-3 w-4 h-px bg-accent/45" />
      <span aria-hidden className="absolute bottom-3 left-3 w-px h-4 bg-accent/45" />
      <span aria-hidden className="absolute bottom-3 right-3 w-4 h-px bg-accent/45" />
      <span aria-hidden className="absolute bottom-3 right-3 w-px h-4 bg-accent/45" />

      {/* Editorial label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
        <p className="font-mono uppercase text-accent/55 text-[9px] tracking-[0.45em]">
          {code}
        </p>
        <span className="block w-8 h-px bg-accent/35" />
        <p className="font-serif italic text-foreground/55 leading-snug text-[clamp(0.9rem,0.75rem+0.45vw,1.05rem)] max-w-sm">
          {label}
        </p>
        <p className="font-mono uppercase text-foreground/25 text-[8.5px] tracking-[0.45em]">
          Awaiting approved image
        </p>
      </div>
    </div>
  );
}

export default EditorialPlaceholder;
