import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo-pe-mark.png";
import { CartDrawer } from "@/components/CartDrawer";

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
          "lg:hidden bg-background border-b border-border overflow-hidden transition-all duration-300",
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="section-container py-6 space-y-1">
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
          <div className="pt-4 mt-4 border-t border-border">
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.1em]">
              <Link to="/contact">Inquire</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
