/* ── Case Study Data — 5-Act Cinematic Structure ── */

// Aberdeen (Private Client)
import aberdeenStoneworkColor from "@/assets/aberdeen-stonework-color.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";

// Main Ridge
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import mainRidgeCiroWoodwork from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeTimber from "@/assets/main-ridge-timber.jpg";
import livingHeroWide from "@/assets/living-hero-wide.jpg";

// Equitana
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import equitanaArena2 from "@/assets/equitana-arena-2.jpg";
import equitanaArena4 from "@/assets/equitana-arena-4.jpg";

// System / GroundLock — canonical horseshoe
import groundlockInstallation from "@/assets/groundlock-horseshoe-canonical.jpg";
import groundlockInsitu from "@/assets/groundlock-horseshoe-canonical.jpg";

export interface CaseStudyAct {
  image: string;
  alt: string;
  label?: string;
  line?: string;
}

export interface CaseStudyData {
  slug: string;
  /* Act 1 — Arrival */
  title: string;
  location: string;
  hero: string;
  heroAlt: string;
  /* Act 2 — Understanding */
  understanding: CaseStudyAct;
  /* Act 3 — Solution */
  solution: CaseStudyAct;
  /* Act 4 — Outcome */
  outcome: CaseStudyAct;
  /* Act 5 — Close */
  closingLine: string;
}

export const CASE_STUDIES: CaseStudyData[] = [
  {
    slug: "aberdeen-farm",
    title: "Private Client",
    location: "Mornington Peninsula",
    hero: aberdeenStoneworkColor,
    heroAlt: "Hand-laid stonework stable facade at golden hour",
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
  {
    slug: "main-ridge",
    title: "Main Ridge",
    location: "Mornington Peninsula",
    hero: mainRidgeInterior,
    heroAlt: "Main Ridge barn interior with exposed timber framing",
    understanding: {
      image: mainRidgeCiroWoodwork,
      alt: "Hand-crafted timber joinery",
      line: "Full property transformation with integrated footing system.",
    },
    solution: {
      image: groundlockInsitu,
      alt: "Stabilised arena surface in use",
      line: "From Dirt to Dynasty.",
    },
    outcome: {
      image: livingHeroWide,
      alt: "Arena in use with horse and rider at golden hour",
      line: "Private performance arena built for high-load use.",
    },
    closingLine: "From Dirt to Dynasty.",
  },
  {
    slug: "equitana",
    title: "Equitana Melbourne",
    location: "Melbourne",
    hero: equitanaArena1,
    heroAlt: "Competition arena under dramatic exhibition lighting",
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
