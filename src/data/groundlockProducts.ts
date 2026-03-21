/**
 * GroundLock™ System Tiers — Local system data
 * Used as fallback when Shopify API is unavailable and as
 * the canonical source of tier metadata, copy, and structure.
 *
 * NOTE: No per-m² pricing. All positioning is system-based,
 * project-scoped, and outcome-focused.
 */

export type ProductTier = "essential" | "performance" | "estate";

export interface GroundLockProduct {
  handle: string;
  tier: ProductTier;
  title: string;
  subtitle: string;
  headline: string;
  problem: string;
  solution: string;
  badge?: string;
  includes: string[];
  specs: { label: string; value: string }[];
  ctaPrimary: string;
  ctaSecondary: string;
  trustLine: string;
}

export interface GroundLockAddOn {
  handle: string;
  title: string;
  subtitle: string;
  description: string;
  compatibleTiers: ProductTier[];
}

export const GROUNDLOCK_TIERS: Record<ProductTier, { label: string; color: string; description: string }> = {
  essential: {
    label: "Essential",
    color: "hsl(var(--muted-foreground))",
    description: "Targeted ground stabilisation for key zones",
  },
  performance: {
    label: "Performance",
    color: "hsl(var(--accent))",
    description: "Full system integration — most requested",
  },
  estate: {
    label: "Estate",
    color: "hsl(var(--accent-light))",
    description: "Complete property-wide system specification",
  },
};

/* ── Builder / Distribution Packages ─────────────── */

export type BuilderPackage = "supply" | "supply-guidance" | "full-package";

export const BUILDER_PACKAGES: Record<BuilderPackage, { label: string; description: string; includes: string[] }> = {
  supply: {
    label: "System Supply",
    description: "GroundLock system components supplied to approved builders for self-managed installation.",
    includes: [
      "Full GroundLock system components",
      "Installation specification documentation",
      "Technical reference pack",
    ],
  },
  "supply-guidance": {
    label: "System + Guidance",
    description: "System supply with remote technical guidance throughout the installation process.",
    includes: [
      "Full GroundLock system components",
      "Installation specification documentation",
      "Remote technical guidance sessions",
      "Method verification checkpoints",
    ],
  },
  "full-package": {
    label: "Full System Package",
    description: "Complete system supply, on-site guidance, and commissioning by Peninsula Equine.",
    includes: [
      "Full GroundLock system components",
      "On-site installation guidance",
      "System commissioning and sign-off",
      "Ongoing performance support",
      "Priority access to Peninsula Equine services",
    ],
  },
};

export const GROUNDLOCK_PRODUCTS: GroundLockProduct[] = [
  {
    handle: "groundlock-essential",
    tier: "essential",
    title: "GroundLock™ Essential",
    subtitle: "Targeted Application",
    headline: "Ground stabilisation where it matters most.",
    problem:
      "Localised ground failure in high-traffic zones — wash bays, stable surrounds, and entry points — leads to ongoing surface breakdown and maintenance.",
    solution:
      "The Essential tier delivers engineered stabilisation to targeted zones, preventing failure at the most critical points of your property.",
    includes: [
      "Ground stabilisation system for key traffic zones",
      "Integrated sub-surface drainage layer",
      "Geotextile separation membrane",
      "Edge restraint system",
      "Installation specification guide",
      "12-month system performance warranty",
    ],
    specs: [
      { label: "Application", value: "Key zones & access points" },
      { label: "Drainage", value: "Engineered sub-surface" },
      { label: "Load Rating", value: "Standard equine traffic" },
      { label: "Warranty", value: "12 months" },
    ],
    ctaPrimary: "Request Assessment",
    ctaSecondary: "Learn More",
    trustLine: "The same ground engineering used across Peninsula Equine builds.",
  },
  {
    handle: "groundlock-performance",
    tier: "performance",
    title: "GroundLock™ Performance",
    subtitle: "Standard Application",
    badge: "Most Requested",
    headline: "Full system integration for arenas, access routes, and working areas.",
    problem:
      "Standard arena and access builds use generic materials with no engineered system — leading to inconsistent drainage, surface degradation, and recurring repair costs.",
    solution:
      "A fully integrated ground system — drainage, stabilisation, and surface specification engineered as one continuous system across all working zones.",
    includes: [
      "Ground stabilisation system integrated across key zones",
      "Dual-layer engineered drainage network",
      "Geotextile and geocomposite separation layers",
      "Heavy-duty perimeter restraint system",
      "Surface integration specification",
      "Remote consultation with P.E. ground systems engineer",
      "Installation specification and maintenance guide",
      "24-month system performance warranty",
    ],
    specs: [
      { label: "Application", value: "Arenas, access & working zones" },
      { label: "Drainage", value: "Dual-layer engineered network" },
      { label: "Load Rating", value: "Heavy equine + vehicle" },
      { label: "Warranty", value: "24 months" },
    ],
    ctaPrimary: "Request Assessment",
    ctaSecondary: "Learn More",
    trustLine: "Our most requested specification — the standard across Peninsula Equine facility projects.",
  },
  {
    handle: "groundlock-estate",
    tier: "estate",
    title: "GroundLock™ Estate",
    subtitle: "Full System Integration",
    badge: "Premium",
    headline: "Complete property-wide ground engineering — built for generations.",
    problem:
      "High-performance properties demand integrated ground engineering across every zone. Without a unified system, even premium builds degrade under sustained use.",
    solution:
      "Full property integration: ground engineering across arenas, circulation, access, and transition zones — with on-site commissioning and a direct pathway into a Peninsula Equine managed build.",
    includes: [
      "Full property ground stabilisation system",
      "Triple-layer engineered drainage with fall calculation",
      "Premium separation and capillary break layers",
      "Reinforced perimeter and transition zones",
      "Certified surface material specification",
      "On-site system commissioning by P.E. ground engineer",
      "Full installation supervision and sign-off",
      "Ongoing maintenance schedule and performance support",
      "60-month system performance warranty",
      "Priority pathway to Peninsula Equine full build services",
    ],
    specs: [
      { label: "Application", value: "Full property integration" },
      { label: "Drainage", value: "Triple-layer engineered system" },
      { label: "Load Rating", value: "Commercial grade" },
      { label: "Warranty", value: "60 months" },
      { label: "Support", value: "On-site + remote" },
    ],
    ctaPrimary: "Request Assessment",
    ctaSecondary: "Learn More",
    trustLine: "Includes on-site commissioning and priority access to Peninsula Equine's full infrastructure services.",
  },
];

export const GROUNDLOCK_ADDONS: GroundLockAddOn[] = [
  {
    handle: "groundlock-zone-extension",
    title: "Zone Extension",
    subtitle: "System Expansion",
    description:
      "Extend GroundLock coverage to additional zones — warm-up areas, lunging rings, or secondary circulation routes. Matched drainage integration included.",
    compatibleTiers: ["performance", "estate"],
  },
  {
    handle: "groundlock-load-upgrade",
    title: "Load Upgrade",
    subtitle: "Heavy-Duty Specification",
    description:
      "Upgrade system specification for vehicle access, heavy machinery, or commercial traffic zones. Includes reinforced panels and upgraded restraints.",
    compatibleTiers: ["essential", "performance", "estate"],
  },
];

export function getProductByHandle(handle: string): GroundLockProduct | undefined {
  return GROUNDLOCK_PRODUCTS.find((p) => p.handle === handle);
}

export function getAddOnsByTier(tier: ProductTier): GroundLockAddOn[] {
  return GROUNDLOCK_ADDONS.filter((a) => a.compatibleTiers.includes(tier));
}
