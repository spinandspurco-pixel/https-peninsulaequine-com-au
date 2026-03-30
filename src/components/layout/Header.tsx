import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIntroState } from "@/hooks/useIntroState";
import logoImage from "@/assets/logo-pe-mark.webp";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/gallery" },
  { name: "Services", href: "/services" },
  { name: "GroundLock™", href: "/groundlock" },
  { name: "About", href: "/about" },
  { name: "Visualise", href: "/visualise", subtle: true },
  { name: "Equus Ridge", href: "/equus-ridge", subtle: true },
  { name: "The Standard", href: "/the-standard", subtle: true },
  
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { headerLogoReady } = useIntroState();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out",
        isScrolled
          ? "bg-[hsl(var(--header-scrolled-bg)/0.98)] backdrop-blur-xl border-b border-accent/8"
          : "bg-transparent"
      )}
    >
      <div className="section-container">
        <nav className="flex items-center justify-between h-18 sm:h-22">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm transition-opacity duration-700 ease-out"
            style={{ opacity: headerLogoReady ? 1 : 0 }}
          >
            <div className="relative flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9">
              <img
                src={logoImage}
                alt="Peninsula Equine"
                width={36}
                height={36}
                className={cn(
                  "w-full h-full object-contain transition-all duration-700 group-hover:scale-105",
                  isScrolled ? "opacity-100" : "opacity-85 drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                )}
                loading="eager"
              />
            </div>
            <div className={cn(
              "hidden sm:flex flex-col transition-colors duration-500",
              "text-[hsl(var(--header-foreground))]"
            )}>
              <span className="font-serif text-sm font-semibold tracking-[0.08em] leading-none">
                Peninsula Equine
              </span>
              <span className="text-[9px] font-sans tracking-[0.25em] uppercase text-accent/70 mt-1">
                Engineered Infrastructure
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative transition-all duration-500",
                  item.subtle
                    ? "text-[10px] italic tracking-[0.08em] font-normal text-muted-foreground/50 hover:text-accent/80"
                    : cn(
                        "text-[10px] uppercase tracking-[0.18em] font-medium",
                        "after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-px after:bg-accent/60 after:origin-left after:scale-x-0 after:transition-transform after:duration-500 hover:after:scale-x-100",
                        isActive(item.href)
                          ? "text-accent after:scale-x-100"
                          : "text-[hsl(var(--header-foreground))]/60 hover:text-[hsl(var(--header-foreground))]"
                      )
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/contact"
              className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--header-foreground))]/50 hover:text-[hsl(var(--header-foreground))] transition-opacity duration-300"
            >
              Contact
            </Link>
            <Link
              to="/site-assessment"
              className="text-[10px] uppercase tracking-[0.18em] text-accent/60 hover:text-accent transition-colors duration-500"
            >
              Start a Project →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-[hsl(var(--header-foreground))] transition-colors duration-300"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="relative w-5 h-4 flex flex-col justify-between">
              <span className={cn(
                "block h-[1px] w-full bg-current transition-all duration-500 origin-center",
                isMobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
              )} />
              <span className={cn(
                "block h-[1px] w-full bg-current transition-all duration-300",
                isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"
              )} />
              <span className={cn(
                "block h-[1px] w-full bg-current transition-all duration-500 origin-center",
                isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
              )} />
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden bg-[hsl(var(--background))] border-t border-border/20 overflow-hidden transition-all duration-700 ease-out",
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 invisible"
        )}
      >
        <div className="section-container py-10 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "block py-3.5 text-xs uppercase tracking-[0.18em] font-medium transition-all duration-500",
                isActive(item.href)
                  ? "text-accent"
                  : "text-foreground/50 hover:text-accent"
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-8 mt-6 border-t border-border/20 space-y-4">
            <Button asChild variant="gold" className="w-full">
              <Link to="/contact">Request Assessment</Link>
            </Button>
            <a href="tel:0418585489" className="flex items-center justify-center gap-2.5 text-xs text-muted-foreground hover:text-accent transition-colors duration-500">
              <Phone className="h-3.5 w-3.5" /> 0418 585 489
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
