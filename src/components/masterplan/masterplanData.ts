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
    id: "stable-row",
    label: "Stable Wing — S1–S4",
    shortLabel: "S1–S4",
    tagline: "Four stables. Central entry. Cross-ventilation resolved.",
    description:
      "S1–S4 span the northern wing with a central breezeway entry. Float bays flank each end. Cross-ventilation engineered through the corridor axis.",
    features: [
      "S1–S4 with central breezeway",
      "Float / garage bays at each end",
      "Direct paddock and courtyard access",
    ],
    path: "M 185 95 L 555 95 L 555 165 L 185 165 Z",
    elevation: 1,
  },
  {
    id: "west-wing",
    label: "Stable Wing — S5 & S6",
    shortLabel: "S5–S6",
    tagline: "Quieter wing. Direct paddock connection.",
    description:
      "Stables 5 and 6 form the western courtyard arm. Positioned for paddock access and separation from the service side.",
    features: [
      "Two oversized stables",
      "Paddock entry at ground level",
      "Passive ventilation design",
    ],
    path: "M 185 165 L 275 165 L 275 340 L 185 340 Z",
    elevation: 1,
  },
  {
    id: "courtyard",
    label: "Central Courtyard",
    shortLabel: "Courtyard",
    tagline: "All movement converges here.",
    description:
      "Horse. Rider. Service. Resolved. An enclosed courtyard formed by the stable wings — the circulation spine connecting all zones.",
    features: [
      "Enclosed by stable wings",
      "Central tie-up and handling",
      "All-zone circulation hub",
    ],
    path: "M 275 165 L 465 165 L 465 340 L 275 340 Z",
    elevation: 0,
  },
  {
    id: "service-wing",
    label: "Tack / Service Core",
    shortLabel: "Service",
    tagline: "Wash bay. WC. Tie-up. Positioned for efficiency.",
    description:
      "The eastern arm houses wash bay, WC, and tie-up area. Separated from paddock stables to resolve clean and dirty workflows.",
    features: [
      "Wash bay with engineered drainage",
      "WC and utility rooms",
      "Dedicated tie-up area",
    ],
    path: "M 465 165 L 555 165 L 555 340 L 465 340 Z",
    elevation: 1,
  },
  {
    id: "tack-rooms",
    label: "Tack & Accommodation",
    shortLabel: "Tack / Rooms",
    tagline: "Support spaces resolved beneath the viewing loft.",
    description:
      "Tack Room 1 and 2 flank the arena walkway. Rooms 1, 3, and service spaces at ground level. Upper level: Viewing Loft, Rooms 3–4, WC, store.",
    features: [
      "Tack Room 1 & 2 flanking walkway",
      "Rooms 1 & 3 at ground level",
      "Upper level: Viewing Loft, Rooms 3–4",
    ],
    path: "M 185 340 L 555 340 L 555 425 L 185 425 Z",
    elevation: 1,
  },
  {
    id: "viewing-loft",
    label: "Viewing Loft (Above)",
    shortLabel: "Viewing",
    tagline: "The system, understood from above.",
    description:
      "First floor above the arena walkway. Full arena oversight. Internal stair access from courtyard, connected to upper accommodation.",
    features: [
      "Full arena oversight from upper level",
      "Internal stair access from courtyard",
      "Connected to upper accommodation",
    ],
    path: "M 310 355 L 430 355 L 430 420 L 310 420 Z",
    elevation: 2,
  },
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
    path: "M 245 470 L 495 470 L 495 700 L 245 700 Z",
    elevation: 1,
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
export const TOUR_ORDER = ["stable-row", "west-wing", "courtyard", "service-wing", "tack-rooms", "indoor-arena"];
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
