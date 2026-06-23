import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const LINKS: Array<{ label: string; to: string; meta?: string }> = [
  { label: "Index", to: "/", meta: "00" },
  { label: "Services", to: "/services", meta: "01" },
  { label: "Selected Works", to: "/selected-works", meta: "02" },
  { label: "Field Notes", to: "/field-notes", meta: "03" },
  { label: "About", to: "/about", meta: "04" },
  { label: "Contact", to: "/contact", meta: "05" },
];

type Props = { open: boolean; onClose: () => void };

export function OverlayNav({ open, onClose }: Props) {
  const { pathname } = useLocation();

  // Close on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock scroll + Escape to close
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label="Site navigation"
      className={cn(
        "fixed inset-0 z-[80] transition-opacity duration-700 ease-out",
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
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 sm:top-8 sm:right-10 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/55 hover:text-foreground transition-colors duration-500"
        aria-label="Close navigation"
      >
        Close ✕
      </button>

      <div className="relative h-full w-full flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/35 mb-8">
          Wayfinder
        </p>
        <ul className="space-y-2 sm:space-y-3">
          {LINKS.map((l, i) => {
            const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
            return (
              <li
                key={l.to}
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(18px)",
                  transition:
                    "opacity 800ms cubic-bezier(0.45,0,0.15,1), transform 1100ms cubic-bezier(0.45,0,0.15,1)",
                  transitionDelay: open ? `${120 + i * 80}ms` : "0ms",
                }}
              >
                <Link
                  to={l.to}
                  onClick={onClose}
                  className="group flex items-baseline gap-5 sm:gap-8"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/35 group-hover:text-accent transition-colors duration-500">
                    {l.meta}
                  </span>
                  <span
                    className={cn(
                      "font-serif text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] tracking-tight transition-colors duration-500",
                      active
                        ? "text-foreground"
                        : "text-foreground/55 group-hover:text-foreground",
                    )}
                  >
                    {l.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="absolute bottom-8 left-8 sm:left-16 lg:left-24 font-mono text-[10px] uppercase tracking-[0.45em] text-foreground/30">
          Peninsula Equine — From Dirt to Dynasty
        </p>
      </div>
    </div>
  );
}
