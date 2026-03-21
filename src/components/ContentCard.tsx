import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardProps,
} from "@/components/ui/card";

/* ─── Image aspect presets ──────────────────────────── */

const aspectPresets = {
  video: "aspect-video",        /* 16:9 */
  square: "aspect-square",      /* 1:1  */
  portrait: "aspect-[3/4]",     /* 3:4  */
  wide: "aspect-[2/1]",         /* 2:1  */
} as const;

export interface ContentCardProps
  extends Omit<CardProps, "children"> {
  /** Card image source */
  image?: string;
  /** Alt text — required when image is provided for a11y */
  imageAlt?: string;
  /** Image aspect ratio preset */
  aspect?: keyof typeof aspectPresets;
  /** Overline label above the title (e.g. "01", category) */
  overline?: string;
  /** Card heading */
  title: string;
  /** Short description / snippet */
  description?: string;
  /** CTA label — defaults to "Learn More" */
  ctaLabel?: string;
  /** Link destination — makes the whole card a link */
  href?: string;
  /** Click handler (alternative to href) */
  onCtaClick?: () => void;
  /** Card variant — defaults to "interactive" when href is set */
  variant?: CardProps["variant"];
}

/**
 * Pre-composed content card with image, title, description, and CTA.
 * Fully accessible: semantic headings, alt text, focus-visible ring.
 *
 * ```tsx
 * <ContentCard
 *   image={barnPhoto}
 *   imageAlt="Aberdeen barn interior"
 *   overline="01"
 *   title="Custom Barns"
 *   description="Hand-built timber barns…"
 *   href="/services/barns"
 * />
 * ```
 */
export function ContentCard({
  image,
  imageAlt = "",
  aspect = "video",
  overline,
  title,
  description,
  ctaLabel = "Learn More",
  href,
  onCtaClick,
  variant,
  className,
  ...cardProps
}: ContentCardProps) {
  const resolvedVariant = variant ?? (href ? "interactive" : "default");

  const cardContent = (
    <Card
      variant={resolvedVariant}
      className={cn("group flex flex-col overflow-hidden h-full", className)}
      {...cardProps}
    >
      {/* ── Image ────────────────────────────────────── */}
      {image && (
        <div className={cn("relative overflow-hidden bg-muted/20", aspectPresets[aspect])}>
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
          />
          {/* Subtle overlay on hover */}
          <div
            className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300"
            aria-hidden="true"
          />
        </div>
      )}

      {/* ── Body ─────────────────────────────────────── */}
      <CardHeader className={cn("flex-1", !image && "pt-6")}>
        {overline && (
          <span className="text-overline text-accent mb-1 block">
            {overline}
          </span>
        )}
        <CardTitle className="text-lg sm:text-xl group-hover:text-accent transition-colors duration-300">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="line-clamp-3 mt-1.5">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      {/* ── CTA ──────────────────────────────────────── */}
      {(href || onCtaClick) && (
        <CardFooter className="pt-0">
          <span className="inline-flex items-center text-sm font-medium text-muted-foreground group-hover:text-accent transition-colors duration-300">
            {ctaLabel}
            <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </CardFooter>
      )}
    </Card>
  );

  /* Wrap in Link if href is provided */
  if (href) {
    return (
      <Link
        to={href}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
        aria-label={`${title} — ${ctaLabel}`}
      >
        {cardContent}
      </Link>
    );
  }

  if (onCtaClick) {
    return (
      <button
        onClick={onCtaClick}
        className="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
        aria-label={`${title} — ${ctaLabel}`}
      >
        {cardContent}
      </button>
    );
  }

  return cardContent;
}
