import { ReactNode } from "react";
import peBrandSplitHero from "@/assets/pe-brand-split-hero.png";
import peRopeRing from "@/assets/pe-rope-ring.png";
import { BlueprintScene } from "@/components/BlueprintScene";

interface StaffPortalFrameProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function StaffPortalFrame({ title, subtitle, children }: StaffPortalFrameProps) {
  return (
    <div className="relative min-h-[84vh] overflow-hidden">
      <img
        src={peBrandSplitHero}
        alt="Peninsula Equine blueprint and construction backdrop"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-primary/70" />

      <BlueprintScene
        preset="hero"
        className="absolute inset-0"
        gradient="linear-gradient(180deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.56))"
      />

      <div className="relative z-10 section-container section-padding-lg grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-5 text-primary-foreground max-w-xl">
          <p className="text-overline text-primary-foreground/80">Staff Access</p>
          <h1 className="heading-section text-primary-foreground">{title}</h1>
          <p className="text-body-lg text-primary-foreground/80">{subtitle}</p>
          <img
            src={peRopeRing}
            alt="Decorative rope emblem"
            className="h-28 w-28 object-contain animate-rope-drift"
            loading="lazy"
          />
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
