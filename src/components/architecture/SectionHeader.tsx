import { ReactNode } from "react";

type Align = "left" | "center";

interface SectionHeaderProps {
  /** Two-digit section number, e.g. "03". */
  number?: string;
  /** Small uppercase mono label, e.g. "Discipline" or "Field Notes". */
  label?: string;
  /** Main serif heading. */
  title: ReactNode;
  /** Optional body lede beneath the title. */
  lede?: ReactNode;
  /** Alignment — "left" (default, architectural) or "center" (chapter pause). */
  align?: Align;
  /** Optional extra class on the wrapping element. */
  className?: string;
  /** Show the thin accent divider below title (default true). */
  divider?: boolean;
}

/**
 * SectionHeader — Peninsula Equine architectural plate header.
 *
 * Renders a numbered, label-prefixed serif heading with a thin
 * accent rule and optional lede. Used to replace generic marketing
 * card headers with blueprint-style hierarchy.
 */
export function SectionHeader({
  number,
  label,
  title,
  lede,
  align = "left",
  className = "",
  divider = true,
}: SectionHeaderProps) {
  const alignment =
    align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const meta = align === "center" ? "justify-center" : "justify-start";
  return (
    <header className={`flex flex-col gap-6 ${alignment} ${className}`}>
      {(number || label) && (
        <div className={`flex w-full items-baseline gap-5 ${meta}`}>
          {number && (
            <span className="font-mono text-accent/55 text-[0.7rem] tracking-[0.32em] tabular-nums">
              {number}
            </span>
          )}
          {number && label && (
            <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
          )}
          {label && (
            <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.45em]">
              {label}
            </span>
          )}
        </div>
      )}
      <h2 className="font-serif text-foreground/92 leading-[1.02] tracking-[0.01em] text-[clamp(1.95rem,1.3rem+2.2vw,3.2rem)] max-w-3xl">
        {title}
      </h2>
      {divider && <span className="h-px w-10 bg-accent/45" />}
      {lede && (
        <p className="font-sans font-light text-foreground/56 leading-[1.9] text-[clamp(0.86rem,0.82rem+0.16vw,0.95rem)] max-w-2xl">
          {lede}
        </p>
      )}
    </header>
  );
}

interface TechnicalDividerProps {
  /** Optional small label rendered above the rule (mono uppercase). */
  label?: string;
  /** Optional plate number rendered at the right (mono tabular). */
  number?: string;
  className?: string;
}

/**
 * TechnicalDivider — full-width thin rule with optional drafting label.
 * Replaces heavy section breaks with a single architectural pen-line.
 */
export function TechnicalDivider({ label, number, className = "" }: TechnicalDividerProps) {
  return (
    <div className={`w-full ${className}`}>
      {(label || number) && (
        <div className="flex items-baseline justify-between mb-3">
          {label ? (
            <span className="font-mono uppercase text-accent/45 text-[0.58rem] tracking-[0.5em]">
              {label}
            </span>
          ) : (
            <span />
          )}
          {number && (
            <span className="font-mono text-foreground/30 text-[0.62rem] tracking-[0.3em] tabular-nums">
              {number}
            </span>
          )}
        </div>
      )}
      <div className="h-px w-full bg-[linear-gradient(90deg,transparent,hsl(var(--accent)/0.35)_15%,hsl(var(--accent)/0.35)_85%,transparent)]" />
    </div>
  );
}

interface BlueprintLabelProps {
  children: ReactNode;
  className?: string;
}

/**
 * BlueprintLabel — small uppercase mono label, used as a section overline,
 * field caption, or technical marker. Replaces button-shaped chips.
 */
export function BlueprintLabel({ children, className = "" }: BlueprintLabelProps) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.45em] ${className}`}
    >
      <span className="h-px w-6 bg-accent/35" />
      {children}
    </span>
  );
}
