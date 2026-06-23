import * as React from "react";
import { Link } from "react-router-dom";
import { useInView } from "./useInView";

/**
 * Standardised page closer — the next drawing sheet in the set.
 *
 * Replaces ad-hoc end-of-page CTAs with a single architectural pattern:
 * sheet number → label → headline → bronze hairline → directional link.
 * Every public page hands off to the next this way, so the site reads
 * as one continuous construction set instead of separate documents.
 */
export function PageHandoff({
  sheet,
  label,
  headline,
  detail,
  to,
  cta,
  align = "left",
  className = "",
}: {
  sheet: string;
  label: string;
  headline: string;
  detail?: string;
  to: string;
  cta: string;
  align?: "left" | "center";
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const center = align === "center";

  return (
    <section
      ref={ref}
      data-bp-armed={String(inView)}
      className={`relative ${className}`}
    >
      <div className={`max-w-5xl ${center ? "mx-auto text-center" : ""} px-6 md:px-10 py-24 md:py-32`}>
        <div className={`flex items-center gap-4 ${center ? "justify-center" : ""}`}>
          <span className="bp-mark font-mono text-[10px] uppercase tracking-[0.45em] text-accent/70">
            {sheet}
          </span>
          <div
            className="bp-rule bp-delay-1 h-px bg-gradient-to-r from-accent/45 via-accent/15 to-transparent"
            style={{ width: 72 }}
          />
          <span className="bp-mark bp-delay-1 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/55">
            {label}
          </span>
        </div>

        <h2 className="bp-mark bp-delay-2 mt-8 font-serif text-3xl md:text-5xl leading-[1.05] text-foreground/90 max-w-3xl">
          {headline}
        </h2>

        {detail && (
          <p className={`bp-mark bp-delay-3 mt-6 max-w-xl text-sm md:text-base text-foreground/55 font-light leading-relaxed ${center ? "mx-auto" : ""}`}>
            {detail}
          </p>
        )}

        <div className={`bp-rule bp-delay-3 mt-12 h-px w-full bg-gradient-to-r from-accent/35 via-accent/10 to-transparent`} />

        <Link
          to={to}
          className={`bp-mark bp-delay-4 group mt-8 inline-flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.4em] text-foreground/80 hover:text-accent transition-colors`}
          style={{ transitionDuration: "var(--bp-resolve)", transitionTimingFunction: "var(--bp-ease-settle)" }}
        >
          <span className="border-l border-t border-accent/50 w-2.5 h-2.5" aria-hidden />
          <span>{cta}</span>
          <span
            className="inline-block w-10 h-px bg-accent/55 transition-all group-hover:w-16"
            style={{ transitionDuration: "var(--bp-resolve)", transitionTimingFunction: "var(--bp-ease-settle)" }}
          />
          <span className="border-r border-b border-accent/50 w-2.5 h-2.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
