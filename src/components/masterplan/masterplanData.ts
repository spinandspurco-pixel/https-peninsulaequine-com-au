/* ── Main Ridge Estate — zone & flow data ─────────────
 *  Reconstructed from architectural drawings A03–A11
 *  Akehurst Owen Cimino — Stables and Arena
 *  47 Main Creek Road, Main Ridge VIC 3928
 * ─────────────────────────────────────────────────────── */

export interface Zone {
  id: string;
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  features: string[];
  /** SVG path within 740×820 viewBox */
  path: string;
  /** Elevation tier for 3D depth — 0 = ground, 1 = structure, 2 = upper */
  elevation: number;
}

/*
 * Layout reference (from A03 — Proposed Ground Floor Plan):
 *
 *  ┌─────────────────────────────────────────────┐  y=95
 *  │ FLOAT │ S1 │ S2 │  ENTRY  │ S3 │ S4 │ FLOAT│
 *  ├───────┼────┴────┴─────────┴────┴────┼───────┤  y=165
 *  │  S5   │                             │ WASH  │
 *  │       │                             │  BAY  │
 *  │───────│        COURTYARD            │───────│
 *  │  S6   │                             │  WC   │
 *  │       │                             │TIE-UP │
 *  ├───────┼─────┬───────────┬───────────┼───────┤  y=340
 *  │ RM 1  │TACK │  WALKWAY  │  TACK     │ RM /  │
 *  │ RM 3  │ 1   │  / STAIR  │   2       │ENTRY  │
 *  └───────┴─────┴─────┬─────┴───────────┴───────┘  y=425
 *                      │ CORRIDOR │
 *            ┌─────────┴──────────┴─────────┐       y=470
 *            │                              │
 *            │       INDOOR ARENA           │
 *            │         24 × 48 m            │
 *            │                              │
 *            │                              │
 *            ├──────────────────────────────┤       y=700
 *            │        ARENA STORE           │
 *            └──────────────────────────────┘       y=740
 */

export const zones: Zone[] = [
  {
    id: "indoor-arena",
    label: "Indoor Arena — 24 × 48",
    shortLabel: "Arena",
    tagline: "Clear-span. Engineered for performance under load.",
    description:
      "Fully enclosed riding arena connected via covered corridor. Clear-span steel structure, no internal columns. GroundLock surface system beneath.",
    features: [
      "24 × 48 m clear-span structure",
      "GroundLock surface system",
      "Connected via covered corridor",
    ],
    path: "M 245 470 L 495 470 L 495 740 L 245 740 Z",
    elevation: 1,
  },
  {
    id: "stables",
    label: "Stable Wings — S1–S6",
    shortLabel: "Stables",
    tagline: "Six stables. Cross-ventilation resolved.",
    description:
      "S1–S4 span the northern wing with a central breezeway entry. S5–S6 form the western arm with direct paddock access. Float bays flank each end.",
    features: [
      "S1–S4 with central breezeway",
      "S5–S6 with paddock access",
      "Float / garage bays at each end",
    ],
    path: "M 185 95 L 555 95 L 555 165 L 275 165 L 275 340 L 185 340 Z",
    elevation: 1,
  },
  {
    id: "access",
    label: "Courtyard & Circulation",
    shortLabel: "Access",
    tagline: "All movement converges here.",
    description:
      "The central courtyard and service core form the circulation spine — connecting stables, tack, wash bay, and arena walkway.",
    features: [
      "Enclosed courtyard hub",
      "Wash bay and service wing",
      "Tack rooms flanking arena walkway",
    ],
    path: "M 275 165 L 555 165 L 555 425 L 185 425 L 185 340 L 275 340 Z",
    elevation: 0,
  },
  {
    id: "ground-systems",
    label: "Ground Systems",
    shortLabel: "Ground",
    tagline: "Engineered surfaces. Drainage resolved at every level.",
    description:
      "GroundLock stabilisation beneath the arena surface. Graded drainage across the courtyard. Every surface considered for load, water, and use.",
    features: [
      "GroundLock panel system",
      "Engineered drainage falls",
      "Surface grading across all zones",
    ],
    path: "M 245 700 L 495 700 L 495 740 L 245 740 Z",
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
    d: "M 370 95 L 370 165 L 370 260 L 370 340 L 370 425 L 370 470 L 370 600",
  },
  {
    id: "rider",
    label: "Rider",
    color: "hsl(200 35% 50%)",
    d: "M 370 95 L 370 165 L 310 250 L 275 300 L 275 380 L 310 425 L 370 425 L 370 470 M 370 260 L 465 260 L 510 300",
  },
  {
    id: "vehicle",
    label: "Vehicle",
    color: "hsl(0 0% 50%)",
    d: "M 210 75 L 210 95 M 530 75 L 530 95",
  },
];

/* ── Build layer definitions ─────────────────────── */
export type BuildLayer = "structure" | "envelope" | "finished";

export const buildLayers: { id: BuildLayer; label: string; desc: string }[] = [
  { id: "structure", label: "Structure", desc: "Column grid · steel frame · load paths · foundation logic" },
  { id: "envelope", label: "Envelope", desc: "Wall lines · pitched roof form · enclosure geometry" },
  { id: "finished", label: "Finished", desc: "Resolved materials · premium presentation" },
];

/* ── Tour sequence ─────────────────────────────────── */
export const TOUR_ORDER = ["indoor-arena", "stables", "access", "ground-systems"];
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
