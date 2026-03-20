// Main Ridge images
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import mainRidgeCiroWoodwork1 from "@/assets/main-ridge-ciro-woodwork-1.jpg";

// Private Client — Mornington Peninsula images
import aberdeenAisle from "@/assets/aberdeen-aisle.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenDeck from "@/assets/aberdeen-deck.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";

// Custom Builds
import steelShedDramatic from "@/assets/steel-shed-dramatic.webp";
import timberCubbyFront from "@/assets/timber-cubby-front.webp";

// Curated portfolio additions
import coveredArenaFinishedLit from "@/assets/covered-arena-finished-lit.jpg";
import premiumStableFacade from "@/assets/premium-stable-facade.png";
import westernEntertainingZone from "@/assets/western-entertaining-zone.jpg";

export type GalleryItem = {
  id: number;
  src: string;
  alt: string;
  project: string;
  type: "image" | "video";
  thumbnail?: string;
  service?: string;
  location?: string;
  description?: string;
};

export const projects = [
  { id: "all", name: "All Projects" },
  { id: "main-ridge", name: "Main Ridge" },
  { id: "aberdeen", name: "Private Client" },
  { id: "custom-builds", name: "Custom Builds" },
];

export const serviceFilters = [
  { id: "all", name: "All Services" },
  { id: "barn", name: "Barns & Stables" },
  { id: "stonework", name: "Stonework" },
  { id: "woodwork", name: "Woodwork" },
];

// Location filter removed — all current work is Victoria-based
export const locationFilters = [
  { id: "all", name: "All Locations" },
];

// All videos removed — still imagery carries the portfolio
export const allVideos: (GalleryItem & { description: string })[] = [];

export const galleryItems: GalleryItem[] = [
  // ── Main Ridge — Pavilion & Barn ──
  { id: 1, src: mainRidgeBrickwork, alt: "Main Ridge — Custom reclaimed brickwork detail", project: "main-ridge", type: "image", service: "stonework", location: "victoria" },
  { id: 2, src: mainRidgeInterior, alt: "Main Ridge — Open barn interior with timber framing", project: "main-ridge", type: "image", service: "barn", location: "victoria" },
  { id: 5, src: mainRidgeCiroWoodwork1, alt: "Main Ridge — Hand-shaping timber posts", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },

  // ── Private Client — Mornington Peninsula ──
  { id: 10, src: aberdeenBarnInterior, alt: "Private Client — Luxury barn interior with chandeliers", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 11, src: aberdeenStalls, alt: "Private Client — Custom stalls with premium finishes", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 13, src: aberdeenAisle, alt: "Private Client — Barn aisle with natural stone flooring", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 20, src: aberdeenDeck, alt: "Private Client — Timber deck overlooking property", project: "aberdeen", type: "image", service: "woodwork", location: "victoria" },
  { id: 21, src: aberdeenExterior, alt: "Private Client — Completed barn exterior", project: "aberdeen", type: "image", service: "barn", location: "victoria" },

  // ── Custom Builds ──
  { id: 70, src: steelShedDramatic, alt: "Custom colorbond barn — dramatic sky", project: "custom-builds", type: "image", service: "barn", location: "victoria" },
  { id: 71, src: timberCubbyFront, alt: "Bespoke western-style timber cubby", project: "custom-builds", type: "image", service: "woodwork", location: "victoria" },
  { id: 80, src: coveredArenaFinishedLit, alt: "Covered arena — finished and lit at dusk", project: "custom-builds", type: "image", service: "barn", location: "victoria" },
  { id: 82, src: premiumStableFacade, alt: "Premium stable — architectural facade", project: "custom-builds", type: "image", service: "barn", location: "victoria" },
  { id: 83, src: westernEntertainingZone, alt: "Western entertaining zone — timber and stone", project: "custom-builds", type: "image", service: "woodwork", location: "victoria" },
];

export const quickTags = [
  { label: "Barns", service: "barn", project: "all" },
  { label: "Stonework", service: "stonework", project: "all" },
  { label: "Woodwork", service: "woodwork", project: "all" },
];

export const testimonialServiceMap: Record<string, number[]> = {
  barn: [0, 2],
  woodwork: [0],
  stonework: [0],
};
