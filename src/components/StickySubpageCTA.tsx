import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, CalendarIcon, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-pe-mark.webp";

interface StickySubpageCTAProps {
  /** Pixel scroll threshold before the bar appears */
  showAfter?: number;
  /** CTA button label */
  ctaLabel?: string;
  /** CTA link destination */
  ctaHref?: string;
  /** Or use onClick instead of link */
  onCtaClick?: () => void;
  /** Optional icon before label */
  ctaIcon?: React.ReactNode;
  /** Hide the secondary "Book Lesson" link */
  hideSecondary?: boolean;
}

export function StickySubpageCTA({
  showAfter = 500,
  ctaLabel = "Request Assessment",
  ctaHref = "/contact",
  onCtaClick,
  ctaIcon,
}: StickySubpageCTAProps) {
  const [visible, setVisible] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLogoLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  const location = useLocation();
  // Hide on pages that already have heavy booking UI
  const hideOn = ["/book-lesson", "/contact"];
  if (hideOn.includes(location.pathname)) return null;

  const ctaContent = (
    <>
      {ctaIcon}
      <span>{ctaLabel}</span>
      <ArrowRight className="h-3.5 w-3.5" />
    </>
  );

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-40 transition-all duration-500",
        "bottom-0 lg:bottom-auto lg:top-20",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full lg:-translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="bg-primary/95 backdrop-blur-md border-t lg:border-t-0 lg:border-b border-accent/20 shadow-[0_-4px_20px_-4px_hsl(var(--primary)/0.5)] lg:shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Branding — logo mark + accent bar + wordmark */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative flex-shrink-0 flex items-center w-7 h-7 sm:w-8 sm:h-8">
              <img
                src={logoImage}
                alt="Peninsula Equine"
                width={32}
                height={32}
                className={cn(
                  "w-full h-full object-contain transition-all duration-500",
                  logoLoaded ? "opacity-100 scale-100" : "opacity-0 scale-75"
                )}
              />
              <span
                className={cn(
                  "absolute -right-1 top-1/2 -translate-y-1/2 w-[2px] rounded-full bg-accent transition-all duration-500",
                  "h-4 sm:h-5",
                  logoLoaded ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                )}
              />
            </div>
            <span className="hidden sm:block text-xs font-sans font-medium tracking-[0.25em] uppercase text-primary-foreground/90 truncate pl-0.5 leading-none">
              Peninsula<span className="text-accent"> Equine</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Book a Lesson — secondary */}
            <Link
              to="/book-lesson"
              className={cn(
              "hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium",
                "border border-primary-foreground/20 text-primary-foreground hover:text-primary-foreground hover:border-accent/40",
                "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Book Lesson
            </Link>

            {/* Primary CTA */}
            {onCtaClick ? (
              <button
                onClick={onCtaClick}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium",
                  "bg-accent text-accent-foreground hover:bg-accent/90",
                  "transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_16px_hsl(var(--accent)/0.4)]",
                  "whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                )}
              >
                {ctaContent}
              </button>
            ) : (
              <Link
                to={ctaHref}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium",
                  "bg-accent text-accent-foreground hover:bg-accent/90",
                  "transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_16px_hsl(var(--accent)/0.4)]",
                  "whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                )}
              >
                {ctaContent}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
