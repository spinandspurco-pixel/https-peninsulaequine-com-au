import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-pe-mark.png";
import { CartDrawer } from "@/components/CartDrawer";
import { siteConfig } from "@/data/content";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Boarding", href: "/boarding" },
  { name: "About", href: "/about" },
  { name: "Gallery", href: "/gallery" },
  { name: "The Forge", href: "/shop" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const t = setTimeout(() => setLogoLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
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
        <nav className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logoImage} 
              alt="Peninsula Equine" 
              className={cn(
                "h-10 w-10 sm:h-12 sm:w-12 transition-all duration-700 group-hover:scale-105",
                isScrolled ? "" : "brightness-0 invert",
                logoLoaded
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-75 -rotate-[15deg]"
              )}
            />
            <span className={cn(
              "hidden sm:block font-serif text-lg tracking-[0.1em] uppercase transition-colors",
              isScrolled ? "text-[hsl(var(--header-scrolled-foreground))]" : "text-[hsl(var(--header-foreground))]"
            )}>
              Peninsula<span className="text-[hsl(var(--header-active))]">Equine</span>
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm uppercase tracking-[0.15em] transition-colors hover:text-[hsl(var(--header-active))]",
                  location.pathname === item.href
                    ? "text-[hsl(var(--header-active))]"
                    : isScrolled
                    ? "text-[hsl(var(--header-scrolled-foreground))]"
                    : "text-[hsl(var(--header-foreground))]/90"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA + Cart - Right */}
          <div className="hidden lg:flex items-center gap-3">
            <CartDrawer />
            <Button 
              asChild 
              className={cn(
                "uppercase tracking-[0.1em] text-xs px-6",
                isScrolled 
                  ? "bg-[hsl(var(--header-active))] hover:bg-[hsl(var(--header-active))]/90 text-accent-foreground"
                  : "bg-white/10 backdrop-blur-sm border border-[hsl(var(--header-foreground))]/30 text-[hsl(var(--header-foreground))] hover:bg-[hsl(var(--header-foreground))] hover:text-[hsl(var(--header-bg))]"
              )}
            >
              <Link to="/contact">Inquire</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "lg:hidden p-2 rounded-md transition-colors",
              isScrolled ? "text-[hsl(var(--header-scrolled-foreground))]" : "text-[hsl(var(--header-foreground))]"
            )}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden bg-background border-b border-border overflow-hidden transition-all duration-300 relative",
          isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {/* Blueprint SVG overlay inside mobile menu */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Horizontal grid lines */}
          {[80, 160, 240, 320, 400].map((y, i) => (
            <line key={`mh${i}`} x1="10" y1={y} x2="390" y2={y}
              stroke="hsl(30 15% 18% / 0.04)" strokeWidth="0.5" />
          ))}
          {/* Vertical grid lines */}
          {[40, 120, 200, 280, 360].map((x, i) => (
            <line key={`mv${i}`} x1={x} y1="10" x2={x} y2="590"
              stroke="hsl(30 15% 18% / 0.04)" strokeWidth="0.5" />
          ))}
          {/* Corner brackets */}
          <path d="M 15,15 L 15,45 M 15,15 L 45,15" fill="none" stroke="hsl(30 15% 18% / 0.06)" strokeWidth="0.6" />
          <path d="M 385,15 L 385,45 M 385,15 L 355,15" fill="none" stroke="hsl(30 15% 18% / 0.06)" strokeWidth="0.6" />
          <path d="M 15,585 L 15,555 M 15,585 L 45,585" fill="none" stroke="hsl(30 15% 18% / 0.06)" strokeWidth="0.6" />
          <path d="M 385,585 L 385,555 M 385,585 L 355,585" fill="none" stroke="hsl(30 15% 18% / 0.06)" strokeWidth="0.6" />
          {/* Centre cross */}
          <line x1="195" y1="290" x2="205" y2="290" stroke="hsl(42 60% 50% / 0.06)" strokeWidth="0.5" />
          <line x1="200" y1="285" x2="200" y2="295" stroke="hsl(42 60% 50% / 0.06)" strokeWidth="0.5" />
        </svg>

        <div className="section-container py-6 space-y-1 relative z-10">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "block py-3 text-sm uppercase tracking-[0.15em] transition-colors",
                location.pathname === item.href
                  ? "text-accent"
                  : "text-foreground hover:text-accent"
              )}
            >
              {item.name}
            </Link>
          ))}

          {/* Contact quick-access row */}
          <div className="flex items-center gap-4 pt-3 mt-3 border-t border-border text-sm text-muted-foreground">
            <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center gap-1.5 hover:text-accent transition-colors">
              <Phone className="h-3.5 w-3.5" />
              <span>{siteConfig.phone}</span>
            </a>
            <span className="w-px h-4 bg-border" />
            <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-1.5 hover:text-accent transition-colors truncate">
              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{siteConfig.email}</span>
            </a>
          </div>

          <div className="pt-4 mt-2">
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.1em]">
              <Link to="/contact">Inquire</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
