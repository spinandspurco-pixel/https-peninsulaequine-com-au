// Main Ridge images
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import mainRidgeTimber from "@/assets/main-ridge-timber.jpg";
import mainRidgeWorker from "@/assets/main-ridge-worker.jpg";
import mainRidgeCiroWoodwork1 from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeCiroWoodwork2 from "@/assets/main-ridge-ciro-woodwork-2.jpg";

// Private Client — Mornington Peninsula images
import aberdeenAisle from "@/assets/aberdeen-aisle.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenDeck from "@/assets/aberdeen-deck.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";
import aberdeenMural from "@/assets/aberdeen-mural.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import aberdeenStonework from "@/assets/aberdeen-stonework.jpg";

// Equitana Melbourne images
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import equitanaArena3 from "@/assets/equitana-arena-3.jpg";
import equitanaTractors from "@/assets/equitana-tractors.jpg";

// Melbourne Cup / Caulfield
import caulfieldEvent from "@/assets/caulfield-event.jpg";
import ranchRoundupEvent from "@/assets/ranch-roundup-event.jpg";

// Arena Sand Prep
import arenaSandPrep1 from "@/assets/arena-sand-prep-1.jpg";

// Main Ridge Construction Process
import mainRidgeArenaGrading from "@/assets/main-ridge-arena-grading.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";
import mainRidgeCraneLift from "@/assets/main-ridge-crane-lift.jpg";
import mainRidgeRebarFoundation from "@/assets/main-ridge-rebar-foundation.jpg";

// Custom Builds
import steelShedDramatic from "@/assets/steel-shed-dramatic.webp";
import timberCubbyFront from "@/assets/timber-cubby-front.webp";

// Curated portfolio additions
import coveredArenaFinishedLit from "@/assets/covered-arena-finished-lit.jpg";
import coveredArenaBlackExterior from "@/assets/covered-arena-black-exterior.jpg";
import premiumStableFacade from "@/assets/premium-stable-facade.png";
import westernEntertainingZone from "@/assets/western-entertaining-zone.jpg";

// Videos
import mainRidgeWoodwork1 from "@/assets/videos/main-ridge-woodwork-1.mp4";
import mainRidgeWoodwork2 from "@/assets/videos/main-ridge-woodwork-2.mp4";
import caulfieldVideo1 from "@/assets/videos/caulfield-1.mov";
import caulfieldVideo3 from "@/assets/videos/caulfield-3.mov";
import equitanaArenaVideo from "@/assets/videos/equitana-arena.mov";

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
  { id: "equitana", name: "Equitana Melbourne" },
  { id: "caulfield", name: "Melbourne Cup" },
  { id: "custom-builds", name: "Custom Builds" },
];

export const serviceFilters = [
  { id: "all", name: "All Services" },
  { id: "arena", name: "Arenas" },
  { id: "barn", name: "Barns & Stables" },
  { id: "stonework", name: "Stonework" },
  { id: "woodwork", name: "Woodwork" },
  { id: "infrastructure", name: "Infrastructure" },
  { id: "events", name: "Events" },
];

export const locationFilters = [
  { id: "all", name: "All Locations" },
  { id: "victoria", name: "Victoria" },
];

export const allVideos: (GalleryItem & { description: string })[] = [
  { id: 103, src: mainRidgeWoodwork1, alt: "Main Ridge Timber Craftsmanship", description: "Ciro hand-crafting timber posts using traditional woodworking techniques at Main Ridge", project: "main-ridge", type: "video", thumbnail: mainRidgeCiroWoodwork1, service: "woodwork", location: "victoria" },
  { id: 104, src: mainRidgeWoodwork2, alt: "Main Ridge Woodworking Detail", description: "Precision hand-finishing of barn timber — attention to detail that lasts decades", project: "main-ridge", type: "video", thumbnail: mainRidgeCiroWoodwork2, service: "woodwork", location: "victoria" },
  { id: 105, src: caulfieldVideo1, alt: "Melbourne Cup Arena Prep — Day 1", description: "Professional arena surface preparation at Caulfield Racecourse for the Melbourne Cup carnival", project: "caulfield", type: "video", thumbnail: caulfieldEvent, service: "events", location: "victoria" },
  { id: 107, src: caulfieldVideo3, alt: "Melbourne Cup Final Touches", description: "Final surface finishing ensuring competition-ready footing for thoroughbred racing", project: "caulfield", type: "video", thumbnail: arenaSandPrep1, service: "events", location: "victoria" },
  { id: 108, src: equitanaArenaVideo, alt: "Equitana Arena Setup", description: "Competition arena preparation at Equitana Melbourne — Australia's biggest equine event", project: "equitana", type: "video", thumbnail: equitanaArena1, service: "events", location: "victoria" },
];

export const galleryItems: GalleryItem[] = [
  // ── Main Ridge — Pavilion & Barn ──
  { id: 1, src: mainRidgeBrickwork, alt: "Main Ridge — Custom reclaimed brickwork detail", project: "main-ridge", type: "image", service: "stonework", location: "victoria" },
  { id: 2, src: mainRidgeInterior, alt: "Main Ridge — Open barn interior with timber framing", project: "main-ridge", type: "image", service: "barn", location: "victoria" },
  { id: 3, src: mainRidgeTimber, alt: "Main Ridge — Timber beam installation", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 4, src: mainRidgeWorker, alt: "Main Ridge — Ciro overseeing construction", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 5, src: mainRidgeCiroWoodwork1, alt: "Main Ridge — Hand-shaping timber posts", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },

  // ── Private Client — Mornington Peninsula ──
  { id: 10, src: aberdeenBarnInterior, alt: "Private Client — Luxury barn interior with chandeliers", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 11, src: aberdeenStalls, alt: "Private Client — Custom stalls with premium finishes", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 13, src: aberdeenAisle, alt: "Private Client — Barn aisle with natural stone flooring", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 14, src: aberdeenMural, alt: "Private Client — Hand-painted equestrian mural", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 16, src: aberdeenStonework, alt: "Private Client — Natural stonework masonry", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 20, src: aberdeenDeck, alt: "Private Client — Timber deck overlooking property", project: "aberdeen", type: "image", service: "woodwork", location: "victoria" },
  { id: 21, src: aberdeenExterior, alt: "Private Client — Completed barn exterior", project: "aberdeen", type: "image", service: "barn", location: "victoria" },

  // ── Equitana Melbourne ──
  { id: 40, src: equitanaArena1, alt: "Equitana Melbourne — Competition arena setup", project: "equitana", type: "image", service: "arena", location: "victoria" },
  { id: 42, src: equitanaArena3, alt: "Equitana Melbourne — Arena with spectator seating", project: "equitana", type: "image", service: "arena", location: "victoria" },
  { id: 47, src: equitanaTractors, alt: "Equitana Melbourne — Tractor team at work", project: "equitana", type: "image", service: "events", location: "victoria" },

  // ── Melbourne Cup / Caulfield ──
  { id: 50, src: caulfieldEvent, alt: "Melbourne Cup — Caulfield Racecourse arena", project: "caulfield", type: "image", service: "events", location: "victoria" },
  { id: 51, src: arenaSandPrep1, alt: "Melbourne Cup — Sand distribution and base prep", project: "caulfield", type: "image", service: "arena", location: "victoria" },
  { id: 54, src: ranchRoundupEvent, alt: "Caulfield Ranch Roundup — Event arena setup", project: "caulfield", type: "image", service: "events", location: "victoria" },

  // ── Main Ridge Construction Process ──
  { id: 61, src: mainRidgeBarnFrame, alt: "Main Ridge — Complete barn timber frame", project: "main-ridge", type: "image", service: "barn", location: "victoria" },
  { id: 62, src: mainRidgeCraneLift, alt: "Main Ridge — Crane lifting frame into position", project: "main-ridge", type: "image", service: "infrastructure", location: "victoria" },
  { id: 64, src: mainRidgeRebarFoundation, alt: "Main Ridge — Reinforced steel rebar foundation", project: "main-ridge", type: "image", service: "infrastructure", location: "victoria" },
  { id: 67, src: mainRidgeArenaGrading, alt: "Main Ridge — Arena surface grading", project: "main-ridge", type: "image", service: "arena", location: "victoria" },

  // ── Custom Builds ──
  { id: 70, src: steelShedDramatic, alt: "Custom colorbond barn — dramatic sky", project: "custom-builds", type: "image", service: "barn", location: "victoria" },
  { id: 71, src: timberCubbyFront, alt: "Bespoke western-style timber cubby", project: "custom-builds", type: "image", service: "woodwork", location: "victoria" },

  // ── Covered Arenas & Stables ──
  { id: 80, src: coveredArenaFinishedLit, alt: "Covered arena — finished and lit at dusk", project: "custom-builds", type: "image", service: "arena", location: "victoria" },
  { id: 81, src: coveredArenaBlackExterior, alt: "Covered arena — black exterior cladding", project: "custom-builds", type: "image", service: "arena", location: "victoria" },
  { id: 82, src: premiumStableFacade, alt: "Premium stable — architectural facade", project: "custom-builds", type: "image", service: "barn", location: "victoria" },
  { id: 83, src: westernEntertainingZone, alt: "Western entertaining zone — timber and stone", project: "custom-builds", type: "image", service: "woodwork", location: "victoria" },
];

export const quickTags = [
  { label: "Barns", service: "barn", project: "all" },
  { label: "Arenas", service: "arena", project: "all" },
  { label: "Stonework", service: "stonework", project: "all" },
  { label: "Woodwork", service: "woodwork", project: "all" },
  { label: "Events", service: "events", project: "all" },
  { label: "Videos", service: "all", project: "all" },
];

export const testimonialServiceMap: Record<string, number[]> = {
  barn: [0, 2],
  arena: [1],
  woodwork: [0],
  stonework: [0],
  infrastructure: [2],
  events: [5],
};
