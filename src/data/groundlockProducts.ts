/**
 * GroundLock™ Product System — Local product data
 * Used as fallback when Shopify API is unavailable and as
 * the canonical source of tier metadata, copy, and structure.
 */

export type ProductTier = "starter" | "pro" | "complete";

export interface GroundLockProduct {
  handle: string;
  tier: ProductTier;
  title: string;
  subtitle: string;
  headline: string;
  problem: string;
  solution: string;
  price: number; // AUD
  compareAtPrice?: number;
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
  price: number;
  description: string;
  compatibleTiers: ProductTier[];
}

export const GROUNDLOCK_TIERS: Record<ProductTier, { label: string; color: string; description: string }> = {
  starter: {
    label: "Starter",
    color: "hsl(var(--muted-foreground))",
    description: "Entry-level engineered ground system",
  },
  pro: {
    label: "Pro",
    color: "hsl(var(--accent))",
    description: "Full arena system — most popular",
  },
  complete: {
    label: "Complete",
    color: "hsl(var(--accent-light))",
    description: "Premium system — full build pathway",
  },
};

export const GROUNDLOCK_PRODUCTS: GroundLockProduct[] = [
  {
    handle: "groundlock-base-system",
    tier: "starter",
    title: "GroundLock™ Base System",
    subtitle: "Starter Configuration",
    headline: "Stop fighting your footing. Start riding on engineered ground.",
    problem:
      "Poorly drained arenas create inconsistent footing, increased injury risk, and constant maintenance — most fail within 2–3 years.",
    solution:
      "The Base System delivers engineered drainage and stabilisation for small arenas and round pens — designed to outperform conventional builds from day one.",
    price: 4950,
    includes: [
      "GroundLock™ base grid panels (up to 20m × 40m)",
      "Integrated sub-surface drainage layer",
      "Geotextile separation membrane",
      "Compaction-rated edge restraints",
      "Installation specification guide",
      "12-month system warranty",
    ],
    specs: [
      { label: "Coverage", value: "Up to 800m²" },
      { label: "Drainage", value: "≥ 50mm/hr" },
      { label: "Load Rating", value: "Standard equine" },
      { label: "Warranty", value: "12 months" },
    ],
    ctaPrimary: "Configure System",
    ctaSecondary: "Get Build Ready",
    trustLine: "Same ground engineering used in Peninsula Equine's private arena builds.",
  },
  {
    handle: "groundlock-arena-system",
    tier: "pro",
    title: "GroundLock™ Arena System",
    subtitle: "Pro Configuration",
    badge: "Most Popular",
    headline: "The arena system serious riders choose. Engineered for decades of performance.",
    problem:
      "Standard arena builds use generic materials with no consideration for drainage or long-term surface integrity — leading to rutting, pooling, and costly resurfacing.",
    solution:
      "A fully engineered ground configuration — drainage, stabilisation, and surface integration designed as one complete system, not assembled from parts.",
    price: 12500,
    compareAtPrice: 15000,
    includes: [
      "GroundLock™ interlocking grid system (up to 40m × 60m)",
      "Dual-layer engineered drainage network",
      "Geotextile + geocomposite separation layers",
      "Heavy-duty perimeter restraint system",
      "Surface integration specification (sand/fibre/wax)",
      "Remote consultation with P.E. ground systems engineer",
      "Installation specification + maintenance guide",
      "24-month system warranty",
    ],
    specs: [
      { label: "Coverage", value: "Up to 2,400m²" },
      { label: "Drainage", value: "≥ 80mm/hr" },
      { label: "Load Rating", value: "Heavy equine + vehicle" },
      { label: "Warranty", value: "24 months" },
    ],
    ctaPrimary: "Configure System",
    ctaSecondary: "Get Build Ready",
    trustLine: "Our most requested configuration — the same system spec used across Peninsula Equine facility projects.",
  },
  {
    handle: "groundlock-full-system",
    tier: "complete",
    title: "GroundLock™ Full System",
    subtitle: "Complete Configuration",
    badge: "Premium",
    headline: "The complete engineered arena — built to last generations, not seasons.",
    problem:
      "High-performance arenas demand more than good materials. Without integrated engineering, even premium builds degrade under use.",
    solution:
      "Our most comprehensive configuration: full ground engineering, on-site commissioning, and a direct pathway into a Peninsula Equine managed build.",
    price: 28500,
    compareAtPrice: 34000,
    includes: [
      "GroundLock™ full-coverage interlocking system",
      "Triple-layer engineered drainage with fall calculation",
      "Premium geotextile + geocomposite + capillary break layers",
      "Reinforced perimeter and transition zones",
      "Certified surface material specification (sand/fibre/wax)",
      "On-site system commissioning by P.E. ground engineer",
      "Full installation supervision + sign-off",
      "Ongoing maintenance schedule + support hotline",
      "60-month system warranty",
      "Priority pathway to Peninsula Equine full build services",
    ],
    specs: [
      { label: "Coverage", value: "Custom — unlimited" },
      { label: "Drainage", value: "≥ 120mm/hr" },
      { label: "Load Rating", value: "Commercial grade" },
      { label: "Warranty", value: "60 months" },
      { label: "Support", value: "On-site + remote" },
    ],
    ctaPrimary: "Configure System",
    ctaSecondary: "Get Build Ready",
    trustLine: "Includes on-site commissioning and priority access to Peninsula Equine's full infrastructure services.",
  },
];

export const GROUNDLOCK_ADDONS: GroundLockAddOn[] = [
  {
    handle: "groundlock-connector-pack",
    title: "Connector Pack",
    subtitle: "System Expansion",
    price: 890,
    description:
      "Additional interlocking connectors for extending your GroundLock™ system beyond standard coverage. Includes edge adapters and transition joints.",
    compatibleTiers: ["starter", "pro", "complete"],
  },
  {
    handle: "groundlock-expansion-module",
    title: "Expansion Module",
    subtitle: "Coverage Extension",
    price: 2450,
    description:
      "Add up to 400m² of additional grid coverage with matched drainage integration. For warm-up areas, lunging rings, or secondary zones.",
    compatibleTiers: ["pro", "complete"],
  },
  {
    handle: "groundlock-reinforcement-kit",
    title: "Reinforcement Kit",
    subtitle: "Heavy-Duty Upgrade",
    price: 1650,
    description:
      "Upgrade load rating for vehicle access, heavy machinery, or commercial traffic. Includes reinforced panels and upgraded edge restraints.",
    compatibleTiers: ["starter", "pro", "complete"],
  },
];

export function getProductByHandle(handle: string): GroundLockProduct | undefined {
  return GROUNDLOCK_PRODUCTS.find((p) => p.handle === handle);
}

export function getAddOnsByTier(tier: ProductTier): GroundLockAddOn[] {
  return GROUNDLOCK_ADDONS.filter((a) => a.compatibleTiers.includes(tier));
}
