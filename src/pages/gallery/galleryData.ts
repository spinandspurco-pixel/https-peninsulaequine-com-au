// Main Ridge images
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import mainRidgeTimber from "@/assets/main-ridge-timber.jpg";
import mainRidgeWorker from "@/assets/main-ridge-worker.jpg";
import mainRidgeCiroWoodwork1 from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeCiroWoodwork2 from "@/assets/main-ridge-ciro-woodwork-2.jpg";
import mainRidgeCiroWoodwork3 from "@/assets/main-ridge-ciro-woodwork-3.jpg";
import mainRidgeCiroWoodwork4 from "@/assets/main-ridge-ciro-woodwork-4.jpg";

// Private Client — Mornington Peninsula images
import aberdeenAisle from "@/assets/aberdeen-aisle.jpg";
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenDeck from "@/assets/aberdeen-deck.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";
import aberdeenInteriorStonework from "@/assets/aberdeen-interior-stonework.jpg";
import aberdeenMural from "@/assets/aberdeen-mural.jpg";
import aberdeenMural2 from "@/assets/aberdeen-mural-2.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import aberdeenStallsDetail from "@/assets/aberdeen-stalls-detail.jpg";
import aberdeenStonework from "@/assets/aberdeen-stonework.jpg";
import aberdeenStoneworkBw from "@/assets/aberdeen-stonework-bw.jpg";
import aberdeenStoneworkColor from "@/assets/aberdeen-stonework-color.jpg";

// Queensland Facility images
import qldAerial1 from "@/assets/qld-facility-aerial-1.jpg";
import qldAerial2 from "@/assets/qld-facility-aerial-2.jpg";
import qldConstruction from "@/assets/qld-facility-construction.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";
import qldExterior1 from "@/assets/qld-facility-exterior-1.jpg";
import qldExterior2 from "@/assets/qld-facility-exterior-2.jpg";
import qldExterior3 from "@/assets/qld-facility-exterior-3.jpg";
import qldStalls from "@/assets/qld-facility-stalls.jpg";

// Equitana Melbourne images
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import equitanaArena2 from "@/assets/equitana-arena-2.jpg";
import equitanaArena3 from "@/assets/equitana-arena-3.jpg";
import equitanaArena4 from "@/assets/equitana-arena-4.jpg";
import equitanaArena5 from "@/assets/equitana-arena-5.jpg";
import equitanaArena6 from "@/assets/equitana-arena-6.jpg";
import equitanaEquipment from "@/assets/equitana-equipment.jpg";
import equitanaTractors from "@/assets/equitana-tractors.jpg";

// Melbourne Cup / Caulfield
import caulfieldEvent from "@/assets/caulfield-event.jpg";
import ranchRoundupEvent from "@/assets/ranch-roundup-event.jpg";

// Arena Sand Prep
import arenaSandPrep1 from "@/assets/arena-sand-prep-1.jpg";
import arenaSandPrep2 from "@/assets/arena-sand-prep-2.jpg";
import arenaSandPrep3 from "@/assets/arena-sand-prep-3.jpg";

// Main Ridge Construction Process
import mainRidgeArenaGrading from "@/assets/main-ridge-arena-grading.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";
import mainRidgeCraneLift from "@/assets/main-ridge-crane-lift.jpg";
import mainRidgeFrameTrench from "@/assets/main-ridge-frame-trench.jpg";
import mainRidgePostDepth from "@/assets/main-ridge-post-depth.jpg";
import mainRidgeRebarFoundation from "@/assets/main-ridge-rebar-foundation.jpg";
import mainRidgeTimberPosts from "@/assets/main-ridge-timber-posts.jpg";
import mainRidgeTrenchUtilities from "@/assets/main-ridge-trench-utilities.jpg";

// Videos
import mainRidgeWoodwork1 from "@/assets/videos/main-ridge-woodwork-1.mp4";
import mainRidgeWoodwork2 from "@/assets/videos/main-ridge-woodwork-2.mp4";
import caulfieldVideo1 from "@/assets/videos/caulfield-1.mov";
import caulfieldVideo2 from "@/assets/videos/caulfield-2.mov";
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
  { id: "queensland", name: "Queensland Facility" },
  { id: "equitana", name: "Equitana Melbourne" },
  { id: "caulfield", name: "Melbourne Cup" },
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
  { id: "queensland", name: "Queensland" },
];

export const allVideos: (GalleryItem & { description: string })[] = [
  { id: 103, src: mainRidgeWoodwork1, alt: "Main Ridge Timber Craftsmanship", description: "Ciro hand-crafting timber posts using traditional woodworking techniques at Main Ridge", project: "main-ridge", type: "video", thumbnail: mainRidgeCiroWoodwork1, service: "woodwork", location: "victoria" },
  { id: 104, src: mainRidgeWoodwork2, alt: "Main Ridge Woodworking Detail", description: "Precision hand-finishing of barn timber - attention to detail that lasts decades", project: "main-ridge", type: "video", thumbnail: mainRidgeCiroWoodwork2, service: "woodwork", location: "victoria" },
  { id: 105, src: caulfieldVideo1, alt: "Melbourne Cup Arena Prep - Day 1", description: "Professional arena surface preparation at Caulfield Racecourse for the Melbourne Cup carnival", project: "caulfield", type: "video", thumbnail: caulfieldEvent, service: "events", location: "victoria" },
  { id: 106, src: caulfieldVideo2, alt: "Melbourne Cup Surface Work - Day 2", description: "Precision grading and sand management for race-day perfection at world-class Caulfield", project: "caulfield", type: "video", thumbnail: arenaSandPrep1, service: "events", location: "victoria" },
  { id: 107, src: caulfieldVideo3, alt: "Melbourne Cup Final Touches - Day 3", description: "Final surface finishing ensuring competition-ready footing for thoroughbred racing", project: "caulfield", type: "video", thumbnail: arenaSandPrep2, service: "events", location: "victoria" },
  { id: 108, src: equitanaArenaVideo, alt: "Equitana Arena Setup", description: "Competition arena preparation at Equitana Melbourne - Australia's biggest equine event", project: "equitana", type: "video", thumbnail: equitanaArena1, service: "events", location: "victoria" },
];

export const galleryItems: GalleryItem[] = [
  // Main Ridge images
  { id: 1, src: mainRidgeBrickwork, alt: "Main Ridge - Custom brickwork detail showing reclaimed brick construction", project: "main-ridge", type: "image", service: "stonework", location: "victoria" },
  { id: 2, src: mainRidgeInterior, alt: "Main Ridge - Open barn interior with natural lighting and timber framing", project: "main-ridge", type: "image", service: "barn", location: "victoria" },
  { id: 3, src: mainRidgeTimber, alt: "Main Ridge - Timber beam installation with precision joinery", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 4, src: mainRidgeWorker, alt: "Main Ridge - Ciro on-site overseeing timber construction", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 5, src: mainRidgeCiroWoodwork1, alt: "Main Ridge - Hand-shaping timber posts with traditional tools", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 6, src: mainRidgeCiroWoodwork2, alt: "Main Ridge - Detailed woodworking on barn structural elements", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 7, src: mainRidgeCiroWoodwork3, alt: "Main Ridge - Timber finishing and quality inspection", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 8, src: mainRidgeCiroWoodwork4, alt: "Main Ridge - Hand-crafted timber beam ready for installation", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },

  // Private Client — Mornington Peninsula
  { id: 10, src: aberdeenBarnInterior, alt: "Private Client — Mornington Peninsula - Luxury barn interior with chandeliers and stained timber", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 11, src: aberdeenStalls, alt: "Private Client — Mornington Peninsula - Custom-built stalls with sliding gates and premium finishes", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 12, src: aberdeenStallsDetail, alt: "Private Client — Mornington Peninsula - Stall door hardware and ironwork detail", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 13, src: aberdeenAisle, alt: "Private Client — Mornington Peninsula - Barn aisle with natural stone flooring", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 14, src: aberdeenMural, alt: "Private Client — Mornington Peninsula - Hand-painted decorative mural on barn wall", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 15, src: aberdeenMural2, alt: "Private Client — Mornington Peninsula - Equestrian mural artwork detail", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 16, src: aberdeenStonework, alt: "Private Client — Mornington Peninsula - Natural stonework masonry on exterior walls", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 17, src: aberdeenStoneworkColor, alt: "Private Client — Mornington Peninsula - Multi-colored stonework facade detail", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 18, src: aberdeenStoneworkBw, alt: "Private Client — Mornington Peninsula - Architectural stone column construction", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 19, src: aberdeenInteriorStonework, alt: "Private Client — Mornington Peninsula - Interior stone wall feature with lighting", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 20, src: aberdeenDeck, alt: "Private Client — Mornington Peninsula - Timber deck construction overlooking property", project: "aberdeen", type: "image", service: "woodwork", location: "victoria" },
  { id: 21, src: aberdeenExterior, alt: "Private Client — Mornington Peninsula - Complete exterior view of finished barn", project: "aberdeen", type: "image", service: "barn", location: "victoria" },

  // Queensland Facility
  { id: 30, src: qldAerial1, alt: "Queensland Facility - Aerial view showing full property layout and arena", project: "queensland", type: "image", service: "infrastructure", location: "queensland" },
  { id: 31, src: qldAerial2, alt: "Queensland Facility - Drone perspective of barn complex and paddocks", project: "queensland", type: "image", service: "infrastructure", location: "queensland" },
  { id: 32, src: qldExterior1, alt: "Queensland Facility - Main barn exterior with covered walkways", project: "queensland", type: "image", service: "barn", location: "queensland" },
  { id: 33, src: qldExterior2, alt: "Queensland Facility - Barn entrance with tropical landscaping", project: "queensland", type: "image", service: "barn", location: "queensland" },
  { id: 34, src: qldExterior3, alt: "Queensland Facility - Multi-building layout with connecting paths", project: "queensland", type: "image", service: "infrastructure", location: "queensland" },
  { id: 35, src: qldCourtyard, alt: "Queensland Facility - Central courtyard with water features", project: "queensland", type: "image", service: "infrastructure", location: "queensland" },
  { id: 36, src: qldStalls, alt: "Queensland Facility - Climate-controlled stall interior", project: "queensland", type: "image", service: "barn", location: "queensland" },
  { id: 37, src: qldConstruction, alt: "Queensland Facility - Construction phase showing steel frame erection", project: "queensland", type: "image", service: "infrastructure", location: "queensland" },

  // Equitana Melbourne
  { id: 40, src: equitanaArena1, alt: "Equitana Melbourne - Main competition arena during event setup", project: "equitana", type: "image", service: "arena", location: "victoria" },
  { id: 41, src: equitanaArena2, alt: "Equitana Melbourne - Arena surface grading and leveling", project: "equitana", type: "image", service: "arena", location: "victoria" },
  { id: 42, src: equitanaArena3, alt: "Equitana Melbourne - Competition arena with spectator seating", project: "equitana", type: "image", service: "arena", location: "victoria" },
  { id: 43, src: equitanaArena4, alt: "Equitana Melbourne - Sand footing preparation detail", project: "equitana", type: "image", service: "arena", location: "victoria" },
  { id: 44, src: equitanaArena5, alt: "Equitana Melbourne - Arena maintenance equipment at work", project: "equitana", type: "image", service: "arena", location: "victoria" },
  { id: 45, src: equitanaArena6, alt: "Equitana Melbourne - Wide shot of completed competition arena", project: "equitana", type: "image", service: "arena", location: "victoria" },
  { id: 46, src: equitanaEquipment, alt: "Equitana Melbourne - Professional arena grooming equipment", project: "equitana", type: "image", service: "events", location: "victoria" },
  { id: 47, src: equitanaTractors, alt: "Equitana Melbourne - Tractor team preparing arena surface", project: "equitana", type: "image", service: "events", location: "victoria" },

  // Melbourne Cup / Caulfield
  { id: 50, src: caulfieldEvent, alt: "Melbourne Cup - Caulfield Racecourse arena ready for racing", project: "caulfield", type: "image", service: "events", location: "victoria" },
  { id: 51, src: arenaSandPrep1, alt: "Melbourne Cup - Sand distribution and base preparation", project: "caulfield", type: "image", service: "arena", location: "victoria" },
  { id: 52, src: arenaSandPrep2, alt: "Melbourne Cup - Precision grading for optimal drainage", project: "caulfield", type: "image", service: "arena", location: "victoria" },
  { id: 53, src: arenaSandPrep3, alt: "Melbourne Cup - Finished competition-grade surface", project: "caulfield", type: "image", service: "arena", location: "victoria" },

  // Main Ridge Construction Process
  { id: 60, src: mainRidgeTimberPosts, alt: "Main Ridge - Timber post installation with concrete footings", project: "main-ridge", type: "image", service: "infrastructure", location: "victoria" },
  { id: 61, src: mainRidgeBarnFrame, alt: "Main Ridge - Complete barn timber frame structure", project: "main-ridge", type: "image", service: "barn", location: "victoria" },
  { id: 62, src: mainRidgeCraneLift, alt: "Main Ridge - Crane lifting large timber frame into position", project: "main-ridge", type: "image", service: "infrastructure", location: "victoria" },
  { id: 63, src: mainRidgeFrameTrench, alt: "Main Ridge - Foundation trench with frame assembly", project: "main-ridge", type: "image", service: "infrastructure", location: "victoria" },
  { id: 64, src: mainRidgeRebarFoundation, alt: "Main Ridge - Reinforced steel rebar for concrete foundation", project: "main-ridge", type: "image", service: "infrastructure", location: "victoria" },
  { id: 65, src: mainRidgePostDepth, alt: "Main Ridge - Post hole depth measurement for stability", project: "main-ridge", type: "image", service: "infrastructure", location: "victoria" },
  { id: 66, src: mainRidgeTrenchUtilities, alt: "Main Ridge - Underground utility trench excavation", project: "main-ridge", type: "image", service: "infrastructure", location: "victoria" },
  { id: 67, src: mainRidgeArenaGrading, alt: "Main Ridge - Arena surface grading and leveling", project: "main-ridge", type: "image", service: "arena", location: "victoria" },
];

export const quickTags = [
  { label: "Barns", service: "barn", project: "all" },
  { label: "Arenas", service: "arena", project: "all" },
  { label: "Stonework", service: "stonework", project: "all" },
  { label: "Woodwork", service: "woodwork", project: "all" },
  { label: "Events", service: "events", project: "all" },
  { label: "Videos", service: "all", project: "all" },
  { label: "Queensland", service: "all", project: "queensland" },
];

export const testimonialServiceMap: Record<string, number[]> = {
  barn: [0, 2],
  arena: [1],
  woodwork: [0],
  stonework: [0],
  infrastructure: [2],
  events: [5],
};
