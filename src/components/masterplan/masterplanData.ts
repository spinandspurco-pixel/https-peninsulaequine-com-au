/* ── Main Ridge Estate — zone & flow data ─────────── */

export interface Zone {
  id: string;
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  features: string[];
  /** SVG path within 740×700 viewBox */
  path: string;
  /** Elevation tier for 3D depth — 0 = ground, 1 = structure, 2 = upper */
  elevation: number;
}

export const zones: Zone[] = [
  {
    id: "indoor-arena",
    label: "Indoor Arena",
    shortLabel: "Arena",
    tagline: "Built for performance. Engineered for consistency.",
    description: "Fully enclosed 24 × 48 m riding space — clear-span structure, year-round use under load.",
    features: ["24 × 48 m clear span", "GroundLock surface system", "Column-free interior"],
    path: "M 200 440 L 540 440 L 540 600 L 200 600 Z",
    elevation: 1,
  },
  {
    id: "stables",
    label: "Stable Block S1–S6",
    shortLabel: "Stables",
    tagline: "Daily function simplified for horse and handler.",
    description: "Six stables across two wings with central corridor — cross-ventilation, float access at each entry.",
    features: ["Six stables (S1–S6)", "Central breezeway corridor", "Cross-ventilation design"],
    path: "M 200 130 L 540 130 L 540 270 L 200 270 Z",
    elevation: 1,
  },
  {
    id: "courtyard",
    label: "Central Courtyard",
    shortLabel: "Courtyard",
    tagline: "The central connection point of the estate.",
    description: "Operational spine connecting stables, arena, tack, and wash — controlled axis for all movement.",
    features: ["Tie-up stations", "Direct arena access", "All-zone circulation"],
    path: "M 275 270 L 465 270 L 465 390 L 275 390 Z",
    elevation: 0,
  },
  {
    id: "viewing-area",
    label: "Viewing Loft",
    shortLabel: "Viewing",
    tagline: "The line where the full system becomes visible.",
    description: "Elevated mezzanine with full arena oversight, dormer windows, and internal stair access.",
    features: ["Full arena oversight", "Dormer windows", "Internal stair access"],
    path: "M 465 270 L 540 270 L 540 390 L 465 390 Z",
    elevation: 2,
  },
  {
    id: "service-wing",
    label: "Tack & Service Wing",
    shortLabel: "Tack / WC",
    tagline: "Support spaces resolved for practical daily use.",
    description: "Tack room, WC, and store positioned between stables and arena for efficient daily flow.",
    features: ["Dual tack rooms", "WC and storage", "Direct courtyard access"],
    path: "M 200 270 L 275 270 L 275 440 L 200 440 Z",
    elevation: 1,
  },
  {
    id: "wash-bay",
    label: "Wash Bay",
    shortLabel: "Wash",
    tagline: "Post-work care positioned for natural workflow.",
    description: "Adjacent to courtyard and arena — drainage and hard-standing engineered for daily use.",
    features: ["Hard-standing surface", "Drainage engineered", "Arena adjacent"],
    path: "M 465 390 L 540 390 L 540 440 L 465 440 Z",
    elevation: 0,
  },
];

/* ── Movement flow paths ─────────────────────────── */
export interface FlowPath {
  id: string;
  label: string;
  color: string;
  /** SVG path string */
  d: string;
}

export const flowPaths: FlowPath[] = [
  {
    id: "horse",
    label: "Horse",
    color: "hsl(38 50% 50%)",
    d: "M 370 105 L 370 200 L 370 330 L 370 440 L 370 520",
  },
  {
    id: "rider",
    label: "Rider",
    color: "hsl(200 35% 50%)",
    d: "M 310 105 L 310 200 L 310 330 L 275 370 L 240 420 M 310 330 L 420 330 L 500 330",
  },
  {
    id: "vehicle",
    label: "Vehicle",
    color: "hsl(0 0% 50%)",
    d: "M 225 80 L 225 128 M 515 80 L 515 128",
  },
];

/* ── Build layer definitions ─────────────────────── */
export type BuildLayer = "structure" | "envelope" | "finished";

export const buildLayers: { id: BuildLayer; label: string; desc: string }[] = [
  { id: "structure", label: "Structure", desc: "Load paths · column grid · foundational geometry" },
  { id: "envelope", label: "Envelope", desc: "Wall lines · roof form · enclosure logic" },
  { id: "finished", label: "Finished", desc: "Resolved presentation" },
];

/* ── Tour sequence ─────────────────────────────────── */
export const TOUR_ORDER = ["stables", "courtyard", "service-wing", "viewing-area", "indoor-arena"];
export const TOUR_DWELL = 3200;
export const TOUR_DISSOLVE = 600;

/* ── Helpers ─────────────────────────────────────── */
export function getCenter(path: string): { x: number; y: number } {
  const nums = path.match(/[\d.]+/g)?.map(Number) || [];
  if (nums.length < 4) return { x: 0, y: 0 };
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
}
