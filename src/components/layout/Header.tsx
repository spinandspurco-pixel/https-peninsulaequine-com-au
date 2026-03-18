import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-pe-mark.png";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/gallery" },
  { name: "Services", href: "/services" },
  { name: "GroundLock™", href: "/groundlock" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-[hsl(var(--header-scrolled-bg)/0.97)] backdrop-blur-md border-b border-border/30"
          : "bg-transparent"
      )}
    >
      <div className="section-container">
        <nav className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            <div className="relative flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9">
              <img
                src={logoImage}
                alt="Peninsula Equine"
                width={36}
                height={36}
                className={cn(
                  "w-full h-full object-contain transition-all duration-500 group-hover:scale-105",
                  isScrolled ? "opacity-100" : "opacity-80 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                )}
                loading="eager"
              />
            </div>
            <div className={cn(
              "hidden sm:flex flex-col transition-colors duration-300",
              isScrolled ? "text-[hsl(var(--header-scrolled-foreground))]" : "text-[hsl(var(--header-foreground))]"
            )}>
              <span className="font-serif text-sm font-semibold tracking-wide leading-none">
                Peninsula Equine
              </span>
              <span className="text-[9px] font-sans tracking-[0.2em] uppercase text-[hsl(var(--header-active))] mt-0.5">
                Engineered Infrastructure
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-200",
                  "after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-px after:bg-[hsl(var(--header-active))] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100",
                  isActive(item.href)
                    ? "text-[hsl(var(--header-active))] after:scale-x-100"
                    : isScrolled
                    ? "text-[hsl(var(--header-scrolled-foreground))]/80 hover:text-[hsl(var(--header-active))]"
                    : "text-[hsl(var(--header-foreground))]/80 hover:text-[hsl(var(--header-active))]"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              asChild
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-[11px] font-medium px-6 h-9"
            >
              <Link to="/contact">Book Assessment</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "lg:hidden w-10 h-10 flex items-center justify-center rounded-sm transition-colors",
              isScrolled ? "text-[hsl(var(--header-scrolled-foreground))]" : "text-[hsl(var(--header-foreground))]"
            )}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="relative w-5 h-4 flex flex-col justify-between">
              <span className={cn(
                "block h-[1.5px] w-full bg-current transition-all duration-300 origin-center",
                isMobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
              )} />
              <span className={cn(
                "block h-[1.5px] w-full bg-current transition-all duration-200",
                isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"
              )} />
              <span className={cn(
                "block h-[1.5px] w-full bg-current transition-all duration-300 origin-center",
                isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
              )} />
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden bg-[hsl(var(--primary))] border-t border-border/20 overflow-hidden transition-all duration-400",
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 invisible"
        )}
      >
        <div className="section-container py-8 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "block py-3 text-sm uppercase tracking-[0.14em] font-medium transition-colors",
                isActive(item.href)
                  ? "text-[hsl(var(--header-active))]"
                  : "text-[hsl(var(--header-foreground))]/70 hover:text-[hsl(var(--header-active))]"
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-6 mt-4 border-t border-border/20 space-y-3">
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs">
              <Link to="/contact">Book Assessment</Link>
            </Button>
            <a href="tel:0418585489" className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--header-foreground))]/60 hover:text-[hsl(var(--header-active))] transition-colors">
              <Phone className="h-3.5 w-3.5" /> 0418 585 489
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
