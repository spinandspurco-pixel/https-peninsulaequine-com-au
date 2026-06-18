/* ── Case Study Data — Editorial Estate Dossier ── */

// Aberdeen (Private Client)
import aberdeenStoneworkColor from "@/assets/aberdeen-stonework-color.jpg";
import aberdeenStonework from "@/assets/aberdeen-stonework.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import aberdeenStallsDetail from "@/assets/aberdeen-stalls-detail.jpg";
import aberdeenAisle from "@/assets/aberdeen-aisle.jpg";
import aberdeenDeck from "@/assets/aberdeen-deck.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";

// Main Ridge — case study deprecated. New page lives at /selected-works/main-ridge-pavilion (see pages/MainRidgePavilion.tsx).
// livingHeroWide is still referenced by other entries via the canonical surface import below.
import livingHeroWide from "@/assets/living-hero-wide.jpg";

// Equitana
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import equitanaArena2 from "@/assets/equitana-arena-2.jpg";
import equitanaArena3 from "@/assets/equitana-arena-3.jpg";
import equitanaArena4 from "@/assets/equitana-arena-4.jpg";
import equitanaArena5 from "@/assets/equitana-arena-5.jpg";

// Canonical surface system image (re-uses living hero)
import groundlockInstallation from "@/assets/living-hero-wide.jpg";

export interface CaseStudyAct {
  image: string;
  alt: string;
  label?: string;
  line?: string;
}

export interface CaseStudyImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface CaseStudyScope {
  /** Brief, performance-led description of what was built. */
  brief: string;
  /** 2-5 short scope line items. */
  items: string[];
}

export interface CaseStudyTransformation {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
}

export interface CaseStudyOutcome {
  metric: string;
  label: string;
}

export interface CaseStudyData {
  slug: string;
  /* Act 1 — Arrival */
  title: string;
  location: string;
  hero: string;
  heroAlt: string;
  /* Dossier */
  scope?: CaseStudyScope;
  transformation?: CaseStudyTransformation;
  process?: CaseStudyImage[];
  final?: CaseStudyImage[];
  outcomes?: CaseStudyOutcome[];
  /* Original 5-act narrative panels */
  understanding: CaseStudyAct;
  solution: CaseStudyAct;
  outcome: CaseStudyAct;
  closingLine: string;
}

export const CASE_STUDIES: CaseStudyData[] = [
  {
    slug: "aberdeen-farm",
    title: "Private Client",
    location: "Mornington Peninsula",
    hero: aberdeenStoneworkColor,
    heroAlt: "Hand-laid stonework stable facade at golden hour",
    scope: {
      brief:
        "A private estate stable complex resolved as a single architectural gesture — stone, timber and air, engineered to perform.",
      items: [
        "Full stable complex",
        "Hand-laid stonework façade",
        "Custom timber stalls",
        "Engineered ventilation",
        "Integrated landscape and decking",
      ],
    },
    transformation: {
      before: aberdeenStonework,
      after: aberdeenStoneworkColor,
      caption: "Raw stone, resolved façade.",
    },
    process: [
      { src: aberdeenStonework, alt: "Stonework laid by hand, course by course" },
      { src: aberdeenAisle, alt: "Aisle framing taking shape under natural light" },
      { src: aberdeenStallsDetail, alt: "Stall joinery detail in raw timber" },
    ],
    final: [
      { src: aberdeenBarnInterior, alt: "Barn interior, natural light corridors" },
      { src: aberdeenStalls, alt: "Custom timber stalls in use" },
      { src: aberdeenDeck, alt: "Decking and approach at dusk" },
      { src: aberdeenExterior, alt: "Completed stable exterior in late light" },
    ],
    outcomes: [
      { metric: "100%", label: "Hand-laid stonework" },
      { metric: "365", label: "Days of resolved use" },
      { metric: "0", label: "Snag list at handover" },
    ],
    understanding: {
      image: aberdeenBarnInterior,
      alt: "Barn interior with natural light corridors",
      line: "Full stable complex with integrated stone and timber detailing.",
    },
    solution: {
      image: aberdeenStalls,
      alt: "Custom timber stalls with engineered ventilation",
      line: "From Dirt to Dynasty.",
    },
    outcome: {
      image: aberdeenExterior,
      alt: "Completed stable exterior in late afternoon light",
      line: "Private equine estate built to hold up for generations.",
    },
    closingLine: "From Dirt to Dynasty.",
  },
  // Main Ridge case study removed — see pages/MainRidgePavilion.tsx (/selected-works/main-ridge-pavilion).
  {
    slug: "equitana",
    title: "Equitana Melbourne",
    location: "Melbourne",
    hero: equitanaArena1,
    heroAlt: "Competition arena under dramatic exhibition lighting",
    scope: {
      brief:
        "A multi-discipline competition surface delivered under exhibition conditions — built to perform under national scrutiny.",
      items: [
        "Competition-grade arena surface",
        "Engineered footing and stabilised surface system",
        "Multi-discipline configuration",
        "Delivered under live exhibition timing",
      ],
    },
    transformation: {
      before: equitanaArena2,
      after: equitanaArena4,
      caption: "Bare floor to competition surface.",
    },
    process: [
      { src: equitanaArena2, alt: "Surface preparation at exhibition scale" },
      { src: equitanaArena3, alt: "Footing laid to engineered depth" },
      { src: groundlockInstallation, alt: "Stabilised surface system in situ" },
    ],
    final: [
      { src: equitanaArena1, alt: "Arena under exhibition lighting" },
      { src: equitanaArena4, alt: "Completed competition arena" },
      { src: equitanaArena5, alt: "Surface in active competition use" },
    ],
    outcomes: [
      { metric: "National", label: "Stage delivery" },
      { metric: "Multi", label: "Discipline configuration" },
      { metric: "0", label: "Surface failures over event run" },
    ],
    understanding: {
      image: equitanaArena2,
      alt: "Arena surface preparation at competition scale",
      line: "Competition-grade surface delivered under exhibition conditions.",
    },
    solution: {
      image: groundlockInstallation,
      alt: "Stabilised arena surface at competition scale",
      line: "From Dirt to Dynasty.",
    },
    outcome: {
      image: equitanaArena4,
      alt: "Completed competition arena at Equitana Melbourne",
      line: "Multi-discipline arena built to perform under national scrutiny.",
    },
    closingLine: "From Dirt to Dynasty.",
  },
];
