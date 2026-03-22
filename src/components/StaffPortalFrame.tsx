import { ReactNode, useEffect, useState } from "react";
import logoPeMark from "@/assets/logo-pe-mark.webp";

interface StaffPortalFrameProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function StaffPortalFrame({ title, subtitle, children }: StaffPortalFrameProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center bg-secondary overflow-hidden">
      {/* Architectural grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, hsl(var(--accent) / 0.06), transparent)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-16">
        {/* Branding header */}
        <div
          className="text-center mb-10"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s",
          }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-accent/10 border border-accent/20 mb-5">
            <img src={logoPeMark} alt="P.E" className="h-8 w-8 object-contain" loading="lazy" decoding="async" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-accent font-sans mb-3">
            Peninsula Equine
          </p>
          <h1 className="font-serif text-3xl text-primary-foreground tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Card slot */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.7s ease-out 0.25s, transform 0.7s ease-out 0.25s",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
