import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIntroState } from "@/hooks/useIntroState";
import logoImage from "@/assets/logo-pe-mark.webp";

type NavItem = {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
};

const navigation: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  {
    name: "Services",
    href: "/services",
    children: [
      { name: "Arenas", href: "/arenas" },
      { name: "Stables", href: "/stables" },
      { name: "Equine Estates", href: "/equine-estates" },
      { name: "Infrastructure & Maintenance", href: "/infrastructure" },
    ],
  },
  { name: "Recovery Station", href: "/recovery-stations" },
  { name: "Projects", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();
  const { headerLogoReady } = useIntroState();
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const isParentActive = (item: NavItem) =>
    isActive(item.href) || (item.children?.some((c) => isActive(c.href)) ?? false);

  const openMenu = (name: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenDropdown(name);
  };

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenDropdown(null), 180);
  };

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
                Premium Equine Environments
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-9">
            {navigation.map((item) => {
              const hasChildren = !!item.children?.length;
              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={hasChildren ? () => openMenu(item.name) : undefined}
                  onMouseLeave={hasChildren ? scheduleClose : undefined}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "relative inline-flex items-center gap-1.5 transition-all duration-500 text-[10px] uppercase tracking-[0.2em] font-medium",
                      "after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-px after:bg-accent/60 after:origin-left after:scale-x-0 after:transition-transform after:duration-500 hover:after:scale-x-100",
                      isParentActive(item)
                        ? "text-accent after:scale-x-100"
                        : "text-[hsl(var(--header-foreground))]/60 hover:text-[hsl(var(--header-foreground))]"
                    )}
                  >
                    {item.name}
                    {hasChildren && (
                      <span
                        aria-hidden
                        className={cn(
                          "inline-block text-[7px] leading-none transition-transform duration-500",
                          openDropdown === item.name ? "rotate-180 opacity-90" : "opacity-50"
                        )}
                      >
                        ▾
                      </span>
                    )}
                  </Link>

                  {hasChildren && (
                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 top-full pt-5 transition-all duration-500 ease-out",
                        openDropdown === item.name
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-1 pointer-events-none"
                      )}
                    >
                      <div className="min-w-[18rem] bg-[hsl(var(--background))]/98 backdrop-blur-xl border border-accent/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)]">
                        <div className="px-7 py-6 space-y-1">
                          <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/45 pb-3 border-b border-accent/10 mb-3">
                            {item.name}
                          </p>
                          {item.children!.map((child) => (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={cn(
                                "group flex items-center gap-3 py-2.5 text-[11px] uppercase tracking-[0.18em] transition-colors duration-400",
                                isActive(child.href)
                                  ? "text-accent"
                                  : "text-foreground/55 hover:text-foreground"
                              )}
                            >
                              <span className="w-4 h-px bg-accent/30 transition-all duration-500 group-hover:w-8 group-hover:bg-accent" />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center">
            <Link
              to="/contact"
              className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors duration-500"
            >
              Apply to Build →
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
          isMobileMenuOpen ? "max-h-[820px] opacity-100" : "max-h-0 opacity-0 invisible"
        )}
      >
        <div className="section-container py-10 space-y-1">
          {navigation.map((item) => {
            const hasChildren = !!item.children?.length;
            if (!hasChildren) {
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "block py-3.5 text-xs uppercase tracking-[0.18em] font-medium transition-all duration-500",
                    isActive(item.href)
                      ? "text-accent"
                      : "text-foreground/55 hover:text-accent"
                  )}
                >
                  {item.name}
                </Link>
              );
            }
            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((v) => !v)}
                  className={cn(
                    "w-full flex items-center justify-between py-3.5 text-xs uppercase tracking-[0.18em] font-medium transition-colors duration-500",
                    isParentActive(item) ? "text-accent" : "text-foreground/55 hover:text-accent"
                  )}
                  aria-expanded={mobileServicesOpen}
                >
                  <span>{item.name}</span>
                  <span
                    className={cn(
                      "text-[9px] transition-transform duration-500",
                      mobileServicesOpen ? "rotate-180" : ""
                    )}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-out",
                    mobileServicesOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="pl-4 pb-2 space-y-1 border-l border-accent/10 ml-1">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          "block py-2.5 text-[11px] uppercase tracking-[0.18em] transition-colors duration-400",
                          isActive(child.href)
                            ? "text-accent"
                            : "text-foreground/40 hover:text-foreground/85"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="pt-8 mt-6 border-t border-border/20">
            <Link to="/contact" className="block text-xs uppercase tracking-[0.18em] text-accent/70 hover:text-accent transition-colors duration-500">
              Apply to Build →
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
