import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-pe-mark.png";
import { CartDrawer } from "@/components/CartDrawer";
import { GlobalSearch } from "@/components/GlobalSearch";
import { siteConfig } from "@/data/content";
import { PEHorseshoe } from "@/components/icons/PEIcons";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Forge", href: "/shop", icon: true },
  { name: "Portfolio", href: "/gallery" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Staff Login", href: "/login" },
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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-[hsl(var(--header-scrolled-bg)/0.95)] backdrop-blur-md border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="section-container">
        <nav className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group min-w-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            <div className="relative flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10">
              <img
                src={logoImage}
                alt="Peninsula Equine"
                width={40}
                height={40}
                className={cn(
                  "w-full h-full object-contain transition-transform duration-300 group-hover:scale-105",
                  isScrolled ? "" : "brightness-0 invert"
                )}
              />
              {/* Accent bar */}
              <span
                className={cn(
                  "absolute -right-1.5 top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all duration-300",
                  isScrolled
                    ? "h-4 sm:h-5 bg-[hsl(var(--header-active))]"
                    : "h-5 sm:h-6 bg-[hsl(var(--header-active))]/80"
                )}
              />
            </div>
            <span className={cn(
              "hidden sm:block font-sans text-xs md:text-sm font-semibold tracking-[0.2em] uppercase transition-colors duration-300",
              isScrolled ? "text-[hsl(var(--header-scrolled-foreground))]" : "text-[hsl(var(--header-foreground))]"
            )}>
              Peninsula<span className="text-[hsl(var(--header-active))]"> Equine</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative text-[10px] xl:text-xs uppercase tracking-[0.12em] xl:tracking-[0.15em] whitespace-nowrap transition-colors duration-200 hover:text-[hsl(var(--header-active))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm",
                  "after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-px after:bg-[hsl(var(--header-active))] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100",
                  location.pathname === item.href
                    ? "text-[hsl(var(--header-active))] after:scale-x-100"
                    : isScrolled
                    ? "text-[hsl(var(--header-scrolled-foreground))]"
                    : "text-[hsl(var(--header-foreground))]"
                )}
              >
                {item.icon && <PEHorseshoe size={14} className="inline-block mr-1.5 -mt-0.5" />}
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTAs + MLPGS Badge */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            <Link to="/mlpgs" className="px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase tracking-[0.12em] bg-accent/15 text-accent border border-accent/30 animate-pulse hover:bg-accent/25 transition-colors">
              MLPGS — Coming Soon
            </Link>
            <GlobalSearch />
            <CartDrawer />
            <Button
              asChild
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.1em] text-[10px] xl:text-xs px-4 xl:px-6"
            >
              <Link to="/contact">Get a Quote</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "lg:hidden relative w-10 h-10 flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              isScrolled ? "text-[hsl(var(--header-scrolled-foreground))]" : "text-[hsl(var(--header-foreground))]"
            )}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">{isMobileMenuOpen ? "Close" : "Menu"}</span>
            <span className="relative w-5 h-4 flex flex-col justify-between">
              <span className={cn(
                "block h-0.5 w-full rounded-full bg-current transition-all duration-300 origin-center",
                isMobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
              )} />
              <span className={cn(
                "block h-0.5 w-full rounded-full bg-current transition-all duration-200",
                isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
              )} />
              <span className={cn(
                "block h-0.5 w-full rounded-full bg-current transition-all duration-300 origin-center",
                isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
              )} />
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        className={cn(
          "lg:hidden bg-background border-b border-border overflow-hidden transition-all duration-300",
          isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 invisible"
        )}
      >
        <div className="section-container py-6 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "block py-3 text-sm uppercase tracking-[0.15em] transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                location.pathname === item.href
                  ? "text-accent"
                  : "text-foreground hover:text-accent"
              )}
            >
              {item.name}
            </Link>
          ))}

          <div className="flex items-center gap-4 pt-3 mt-3 border-t border-border text-sm text-muted-foreground">
            <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center gap-1.5 hover:text-accent transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              <Phone className="h-4 w-4" />
              <span>{siteConfig.phone}</span>
            </a>
            <span className="w-px h-4 bg-border" />
            <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-1.5 hover:text-accent transition-colors truncate rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{siteConfig.email}</span>
            </a>
          </div>

          <div className="flex gap-3 pt-4 mt-2">
            <Button asChild className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.1em] text-xs">
              <Link to="/contact">Get a Quote</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
