interface ImagePlaceholderProps {
  label: string;
  className?: string;
}

/**
 * Clean dark placeholder for image slots awaiting final approved assets.
 * Matches the Peninsula Equine dark architectural aesthetic.
 */
export function ImagePlaceholder({ label, className = "" }: ImagePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center bg-[hsl(222_20%_5%)] ${className}`}
      aria-label={`Image placeholder: ${label}`}
    >
      <span className="font-mono uppercase text-[9px] tracking-[0.42em] text-foreground/10">
        {label}
      </span>
    </div>
  );
}
