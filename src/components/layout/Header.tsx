import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIntroState } from "@/hooks/useIntroState";
import logoImage from "@/assets/logo-pe-mark.webp";

type NavChild = { name: string; href: string; description?: string };
type NavGroup = { label: string; items: NavChild[] };
type NavItem = {
  name: string;
  href: string;
  children?: NavChild[];
  groups?: NavGroup[];
};

const servicesGroups: NavGroup[] = [
  {
    label: "Build",
    items: [
      { name: "Arenas", href: "/arenas", description: "Dressage, jumping & covered arenas" },
      { name: "Stables & Barns", href: "/stables", description: "Custom stables and equestrian barns" },
      { name: "Equine Infrastructure", href: "/infrastructure", description: "Fencing, yards & site infrastructure" },
      { name: "Custom Rural Builds", href: "/equine-estates", description: "Pavilions, masterplans & rural homes" },
    ],
  },
  {
    label: "Ground",
    items: [
      { name: "Groundworks", href: "/infrastructure", description: "Site cuts, levels and base preparation" },
      { name: "Drainage & Surfacing", href: "/arenas", description: "Engineered drainage and arena footing" },
    ],
  },
  {
    label: "Recovery",
    items: [
      { name: "LumenArc Recovery Systems", href: "/lumenarc", description: "Considered recovery environments for equine wellbeing" },
    ],
  },
];

const servicesChildren: NavChild[] = servicesGroups.flatMap((g) => g.items);

const navigation: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "Services",
    href: "/services",
    children: servicesChildren,
    groups: servicesGroups,
  },
  { name: "Selected Works", href: "/gallery" },
  { name: "Field Notes", href: "/field-notes" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();
  const { headerLogoReady, headerReady } = useIntroState();
  const closeTimer = useRef<number | null>(null);
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);
  const desktopDropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const servicesItem = navigation.find((i) => i.name === "Services");
    if (servicesItem && isParentActive(servicesItem)) {
      setMobileServicesOpen(true);
    }
  }, [isMobileMenuOpen]);

  // Global Escape: close any open menu and restore focus to the toggle when relevant.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openDropdown) {
        setOpenDropdown(null);
        return;
      }
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        setMobileServicesOpen(false);
        mobileToggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openDropdown, isMobileMenuOpen]);

  const openMenu = (name: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenDropdown(name);
  };

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenDropdown(null), 180);
  };

  const focusFirstDropdownItem = (name: string) => {
    requestAnimationFrame(() => {
      const panel = desktopDropdownRefs.current[name];
      const first = panel?.querySelector<HTMLAnchorElement>("a[href]");
      first?.focus();
    });
  };

  const handleDesktopTriggerKey = (e: KeyboardEvent<HTMLAnchorElement>, item: NavItem) => {
    if (!item.children?.length) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu(item.name);
      focusFirstDropdownItem(item.name);
    } else if (e.key === "Escape") {
      setOpenDropdown(null);
    }
  };

  const handleDropdownItemKey = (
    e: KeyboardEvent<HTMLAnchorElement>,
    name: string,
    index: number,
    total: number,
  ) => {
    const panel = desktopDropdownRefs.current[name];
    const items = panel?.querySelectorAll<HTMLAnchorElement>("a[href]");
    if (!items) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(index + 1) % total]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(index - 1 + total) % total]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[total - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpenDropdown(null);
    }
  };

  const mobileMenuId = "primary-mobile-menu";
  const mobileServicesId = "mobile-services-submenu";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out",
        isScrolled
          ? "bg-[hsl(var(--header-scrolled-bg)/0.98)] backdrop-blur-xl border-b border-accent/8"
          : "bg-transparent"
      )}
      style={{
        opacity: headerReady ? 1 : 0,
        transform: headerReady ? "none" : "translateY(-6px)",
        transition:
          "opacity 1100ms cubic-bezier(0.45,0,0.15,1), transform 1100ms cubic-bezier(0.45,0,0.15,1), background-color 700ms ease-out, backdrop-filter 700ms ease-out, border-color 700ms ease-out",
        pointerEvents: headerReady ? "auto" : "none",
      }}
    >
      <div className="section-container">
        <nav className="flex items-center justify-between h-18 sm:h-22" aria-label="Primary">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm transition-opacity duration-700 ease-out"
            style={{ opacity: headerLogoReady ? 1 : 0 }}
            aria-label="Peninsula Equine — Home"
          >
            <div className="relative flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9">
              <img
                src={logoImage}
                alt=""
                width={36}
                height={36}
                className={cn(
                  "w-full h-full object-contain transition-all duration-700 group-hover:scale-105",
                  isScrolled ? "opacity-100" : "opacity-85 drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                )}
                loading="eager"
                decoding="async"
                // @ts-expect-error — valid HTML attribute
                fetchpriority="low"
              />

            </div>
            <div className={cn(
              "hidden sm:flex flex-col transition-colors duration-500",
              "text-[hsl(var(--header-foreground))]"
            )}>
              <span className="font-serif text-sm font-semibold tracking-[0.08em] leading-none">
                Peninsula Equine
              </span>
              <span className="text-[9px] font-sans tracking-[0.25em] uppercase text-accent/55 mt-1">
                From Dirt to Dynasty
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-9 list-none m-0 p-0">
            {navigation.map((item) => {
              const hasChildren = !!item.children?.length;
              const dropdownId = `desktop-dropdown-${item.name.toLowerCase().replace(/\s+/g, "-")}`;
              const isOpen = openDropdown === item.name;
              return (
                <li
                  key={item.name}
                  className="relative"
                  onMouseEnter={hasChildren ? () => openMenu(item.name) : undefined}
                  onMouseLeave={hasChildren ? scheduleClose : undefined}
                >
                  <Link
                    to={item.href}
                    onKeyDown={(e) => handleDesktopTriggerKey(e, item)}
                    onFocus={hasChildren ? () => openMenu(item.name) : undefined}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    aria-haspopup={hasChildren ? "menu" : undefined}
                    aria-expanded={hasChildren ? isOpen : undefined}
                    aria-controls={hasChildren ? dropdownId : undefined}
                    className={cn(
                      "relative inline-flex items-center gap-1.5 transition-all duration-500 text-[10px] uppercase tracking-[0.2em] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
                      "after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-px after:bg-accent/60 after:origin-left after:scale-x-0 after:transition-transform after:duration-500 hover:after:scale-x-100",
                      isParentActive(item)
                        ? "text-[hsl(var(--header-active))] after:scale-x-100 after:bg-accent"
                        : "text-[hsl(var(--header-foreground))]/60 hover:text-[hsl(var(--header-foreground))]"
                    )}
                  >
                    {item.name}
                    {hasChildren && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-block text-[7px] leading-none transition-transform duration-500",
                          isOpen ? "rotate-180 opacity-90" : "opacity-50"
                        )}
                      >
                        ▾
                      </span>
                    )}
                  </Link>

                  {hasChildren && (
                    <div
                      id={dropdownId}
                      ref={(el) => { desktopDropdownRefs.current[item.name] = el; }}
                      role="menu"
                      aria-label={`${item.name} submenu`}
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 top-full pt-5 transition-all duration-500 ease-out",
                        isOpen
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-1 pointer-events-none"
                      )}
                    >
                      <div className="relative w-[min(34rem,calc(100vw-2.5rem))] bg-[hsl(var(--background))]/98 backdrop-blur-xl border border-accent/10 shadow-[0_28px_64px_-24px_rgba(0,0,0,0.7)]">
                        {/* Blueprint grid overlay */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-screen"
                          style={{
                            backgroundImage:
                              "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                          }}
                        />
                        {/* Thin gold rule */}
                        <span aria-hidden="true" className="absolute top-0 left-7 right-7 h-px bg-accent/30" />

                        <div className="relative px-8 py-7">
                          <div className="flex items-baseline justify-between mb-5">
                            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-accent/55">
                              {item.name}
                            </p>
                            <Link
                              to={item.href}
                              role="menuitem"
                              tabIndex={isOpen ? 0 : -1}
                              onKeyDown={(e) => {
                                const total = (desktopDropdownRefs.current[item.name]?.querySelectorAll("a[href]").length) ?? 0;
                                handleDropdownItemKey(e, item.name, 0, total);
                              }}
                              aria-current={isActive(item.href) ? "page" : undefined}
                              className="group inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/45 hover:text-foreground transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                            >
                              Overview
                              <span aria-hidden="true" className="h-px w-3 bg-accent/40 transition-all duration-500 group-hover:w-6 group-hover:bg-accent" />
                            </Link>
                          </div>

                          {item.groups?.map((group, gIdx) => {
                            // Compute the global index across all groups for arrow-key nav
                            // (+1 to account for the Overview link rendered above)
                            const priorCount = (item.groups ?? [])
                              .slice(0, gIdx)
                              .reduce((acc, g) => acc + g.items.length, 0);
                            const totalCount =
                              1 + (item.groups ?? []).reduce((acc, g) => acc + g.items.length, 0);
                            return (
                              <div
                                key={group.label}
                                className={cn("space-y-2", gIdx > 0 && "mt-5 pt-5 border-t border-accent/10")}
                              >
                                <p
                                  id={`${dropdownId}-group-${gIdx}`}
                                  className="font-mono text-[8.5px] uppercase tracking-[0.5em] text-foreground/32"
                                >
                                  {group.label}
                                </p>
                                <ul
                                  role="group"
                                  aria-labelledby={`${dropdownId}-group-${gIdx}`}
                                  className="list-none m-0 p-0 space-y-0.5"
                                >
                                  {group.items.map((child, cIdx) => {
                                    const globalIdx = 1 + priorCount + cIdx;
                                    const active = isActive(child.href);
                                    return (
                                      <li key={child.href}>
                                        <Link
                                          to={child.href}
                                          role="menuitem"
                                          tabIndex={isOpen ? 0 : -1}
                                          aria-current={active ? "page" : undefined}
                                          onKeyDown={(e) =>
                                            handleDropdownItemKey(e, item.name, globalIdx, totalCount)
                                          }
                                          className={cn(
                                            "group flex items-start gap-3 py-2 pr-2 transition-colors duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
                                            active ? "text-[hsl(var(--header-active))]" : "text-foreground/72 hover:text-foreground"
                                          )}
                                        >
                                          <span
                                            aria-hidden="true"
                                            className={cn(
                                              "mt-[0.65rem] h-px shrink-0 transition-all duration-500",
                                              active
                                                ? "w-6 bg-[hsl(var(--header-active))]"
                                                : "w-3 bg-accent/35 group-hover:w-7 group-hover:bg-accent"
                                            )}
                                          />
                                          <span className="flex-1 min-w-0">
                                            <span className={cn(
                                              "block text-[11px] uppercase tracking-[0.2em]",
                                              active ? "font-medium" : "font-normal"
                                            )}>
                                              {child.name}
                                            </span>
                                            {child.description && (
                                              <span className="block mt-1 font-sans text-[11px] font-light leading-[1.55] text-foreground/40">
                                                {child.description}
                                              </span>
                                            )}
                                          </span>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* CTA */}
          <div className="hidden lg:flex items-center">
            <Link
              to="/contact"
              className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              Apply to Build →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={mobileToggleRef}
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-11 h-11 flex items-center justify-center text-[hsl(var(--header-foreground))] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls={mobileMenuId}
          >
            <span className="relative w-5 h-4 flex flex-col justify-between" aria-hidden="true">
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
        id={mobileMenuId}
        aria-label="Mobile navigation"
        aria-hidden={!isMobileMenuOpen}
        {...(!isMobileMenuOpen ? { inert: "" as unknown as boolean } : {})}
        className={cn(
          "lg:hidden bg-[hsl(var(--background))] border-t border-border/20 overflow-hidden transition-all duration-700 ease-out",
          isMobileMenuOpen ? "max-h-[820px] opacity-100" : "max-h-0 opacity-0 invisible"
        )}
      >
        <nav className="section-container py-10" aria-label="Mobile primary">
          <ul className="space-y-1 list-none m-0 p-0">
            {navigation.map((item) => {
              const hasChildren = !!item.children?.length;
              if (!hasChildren) {
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "block py-3.5 min-h-11 text-xs uppercase tracking-[0.18em] font-medium transition-all duration-500 border-l-2 pl-4 -ml-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
                        isActive(item.href)
                          ? "text-[hsl(var(--header-active))] border-[hsl(var(--header-active))]"
                          : "text-foreground/55 border-transparent hover:text-accent"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.name}>
                  <button
                    type="button"
                    onClick={() => setMobileServicesOpen((v) => !v)}
                    className={cn(
                      "w-full flex items-center justify-between py-3.5 min-h-11 text-xs uppercase tracking-[0.18em] font-medium transition-all duration-500 border-l-2 pl-4 -ml-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
                      isParentActive(item) ? "text-[hsl(var(--header-active))] border-[hsl(var(--header-active))]" : "text-foreground/55 border-transparent hover:text-accent"
                    )}
                    aria-expanded={mobileServicesOpen}
                    aria-controls={mobileServicesId}
                  >
                    <span>{item.name}</span>
                    <span
                      className={cn(
                        "text-[9px] transition-transform duration-500",
                        mobileServicesOpen ? "rotate-180" : ""
                      )}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>
                  <div
                    id={mobileServicesId}
                    aria-hidden={!mobileServicesOpen}
                    className={cn(
                      "overflow-hidden transition-all duration-700 ease-out",
                      mobileServicesOpen ? "max-h-[40rem] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="pl-4 pb-2 ml-1 border-l border-accent/10 space-y-5 pt-2">
                      {(item.groups ?? [{ label: item.name, items: item.children ?? [] }]).map((group) => (
                        <div key={group.label} className="space-y-2">
                          <p className="font-mono text-[8.5px] uppercase tracking-[0.5em] text-foreground/30 pl-3">
                            {group.label}
                          </p>
                          <ul className="space-y-1 list-none m-0 p-0">
                            {group.items.map((child) => (
                              <li key={child.href}>
                                <Link
                                  to={child.href}
                                  tabIndex={mobileServicesOpen ? 0 : -1}
                                  aria-current={isActive(child.href) ? "page" : undefined}
                                  className={cn(
                                    "block py-2.5 min-h-11 text-[11px] uppercase tracking-[0.2em] transition-all duration-400 border-l-2 pl-3 -ml-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm",
                                    isActive(child.href)
                                      ? "text-[hsl(var(--header-active))] border-[hsl(var(--header-active))] font-medium"
                                      : "text-foreground/55 border-transparent hover:text-foreground/90"
                                  )}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                </li>
              );
            })}
          </ul>
          <div className="pt-8 mt-6 border-t border-border/20">
            <Link
              to="/contact"
              tabIndex={isMobileMenuOpen ? 0 : -1}
              className="block text-xs uppercase tracking-[0.18em] text-accent/70 hover:text-accent transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              Apply to Build →
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
