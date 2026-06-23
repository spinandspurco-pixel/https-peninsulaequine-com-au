import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

type PrimaryLink = { label: string; to: string; meta: string };

const PRIMARY: PrimaryLink[] = [
  { label: "Services", to: "/services", meta: "01" },
  { label: "Selected Works", to: "/selected-works", meta: "02" },
  { label: "Field Notes", to: "/field-notes", meta: "03" },
  { label: "About", to: "/about", meta: "04" },
  { label: "Contact", to: "/contact", meta: "05" },
];

const SERVICES_GROUPS: Array<{
  label: string;
  items: Array<{ name: string; to: string }>;
}> = [
  {
    label: "Build",
    items: [
      { name: "Covered Arenas", to: "/services#covered-arenas" },
      { name: "Stables & Barn Structures", to: "/services#stables-barn-structures" },
      { name: "Pavilions & Rural Builds", to: "/services#pavilions-rural-builds" },
    ],
  },
  {
    label: "Ground",
    items: [
      { name: "Groundworks & Site Preparation", to: "/services#groundworks-site-preparation" },
      { name: "Drainage & Surfacing", to: "/services#drainage-surfacing" },
      { name: "Equine Infrastructure", to: "/services#equine-infrastructure" },
    ],
  },
  {
    label: "Systems",
    items: [
      { name: "LumenArc Recovery Systems", to: "/services#lumenarc-recovery-systems" },
    ],
  },
];

type Props = { open: boolean; onClose: () => void };

export function OverlayNav({ open, onClose }: Props) {
  const { pathname } = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Body scroll lock + Escape close
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Reset collapsed state when overlay closes
  useEffect(() => {
    if (!open) setServicesOpen(false);
  }, [open]);

  return (
    <div
      id="site-overlay-nav"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label="Site navigation"
      onClick={(e) => {
        // Click on the backdrop (not the inner panel) closes the menu
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "fixed inset-0 z-[80] transition-opacity duration-700 ease-out overflow-y-auto overscroll-contain",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
      style={{
        background: "hsl(var(--background) / 0.97)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        transitionTimingFunction: "cubic-bezier(0.45, 0, 0.15, 1)",
      }}
    >
      {/* Blueprint grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Close — high stacking layer so the inner panel never intercepts it */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-5 right-5 sm:top-7 sm:right-9 z-[90] font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.45em] text-foreground/65 hover:text-foreground transition-colors duration-500 py-2 px-2"
        aria-label="Close navigation"
      >
        Close ✕
      </button>

      <div
        ref={panelRef}
        className="relative min-h-full w-full flex flex-col justify-start sm:justify-center px-6 sm:px-12 lg:px-24 pt-24 pb-16 sm:py-20"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/35 mb-6 sm:mb-10">
          Wayfinder
        </p>

        <ul className="space-y-1 sm:space-y-2 max-w-4xl">
          {PRIMARY.map((l, i) => {
            const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
            const isServices = l.to === "/services";
            return (
              <li
                key={l.to}
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(18px)",
                  transition:
                    "opacity 700ms cubic-bezier(0.45,0,0.15,1), transform 1000ms cubic-bezier(0.45,0,0.15,1)",
                  transitionDelay: open ? `${120 + i * 70}ms` : "0ms",
                }}
              >
                <div className="flex items-baseline gap-4 sm:gap-8 py-2 sm:py-1">
                  <Link
                    to={l.to}
                    onClick={onClose}
                    className="group flex-1 flex items-baseline gap-4 sm:gap-8 min-h-[44px]"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/35 group-hover:text-accent transition-colors duration-500 w-8 shrink-0">
                      {l.meta}
                    </span>
                    <span
                      className={cn(
                        "font-serif text-[clamp(2.1rem,6.5vw,5.25rem)] leading-[0.98] tracking-tight transition-colors duration-500",
                        active
                          ? "text-foreground"
                          : "text-foreground/55 group-hover:text-foreground",
                      )}
                    >
                      {l.label}
                    </span>
                  </Link>

                  {isServices && (
                    <button
                      type="button"
                      onClick={() => setServicesOpen((s) => !s)}
                      aria-expanded={servicesOpen}
                      aria-controls="services-subgroups"
                      className="shrink-0 font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/50 hover:text-foreground transition-colors duration-500 py-3 px-2 min-h-[44px]"
                    >
                      {servicesOpen ? "Hide" : "Expand"}
                    </button>
                  )}
                </div>

                {isServices && (
                  <div
                    id="services-subgroups"
                    className="overflow-hidden transition-[max-height,opacity] duration-700 ease-out pl-12 sm:pl-16"
                    style={{
                      maxHeight: servicesOpen ? "1200px" : "0px",
                      opacity: servicesOpen ? 1 : 0,
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 py-6 sm:py-8 border-t border-accent/10 mt-3">
                      {SERVICES_GROUPS.map((g) => (
                        <div key={g.label}>
                          <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-accent/65 mb-4">
                            {g.label}
                          </p>
                          <ul className="space-y-1">
                            {g.items.map((item) => (
                              <li key={item.to}>
                                <Link
                                  to={item.to}
                                  onClick={onClose}
                                  className="block py-2 font-serif text-[0.98rem] sm:text-[1rem] leading-[1.45] text-foreground/70 hover:text-foreground transition-colors duration-500 min-h-[40px]"
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}

          {/* Apply to Build — distinct, last */}
          <li
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(18px)",
              transition:
                "opacity 700ms cubic-bezier(0.45,0,0.15,1), transform 1000ms cubic-bezier(0.45,0,0.15,1)",
              transitionDelay: open ? `${120 + PRIMARY.length * 70}ms` : "0ms",
            }}
            className="pt-6 sm:pt-8 mt-4 border-t border-accent/12"
          >
            <Link
              to="/contact?intent=apply"
              onClick={onClose}
              className="group flex items-baseline gap-4 sm:gap-8 min-h-[44px]"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent/70 w-8 shrink-0">
                06
              </span>
              <span className="font-serif italic text-[clamp(1.8rem,5.2vw,3.6rem)] leading-[1] tracking-tight text-foreground/85 group-hover:text-foreground transition-colors duration-500">
                Apply to Build
              </span>
            </Link>
          </li>
        </ul>

        <p className="mt-12 sm:mt-16 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/30">
          Peninsula Equine — From Dirt to Dynasty
        </p>
      </div>
    </div>
  );
}
