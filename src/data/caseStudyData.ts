/* ── Case Study Data — Editorial Estate Dossier ── */

// Approved cinematic asset library only.
// Legacy bright-daytime phone photos (aberdeen-*.jpg, covered-arena-finished-lit,
// main-ridge-finished-interior, living-hero-wide) have been removed. Slots
// without an approved equivalent are filled by neighbouring approved frames
// rather than off-direction imagery.

// Aberdeen (Private Client) — approved set
import aberdeenExteriorDuskAsset from "@/assets/uploads/approved-aberdeen-exterior-dusk-frontage.png.asset.json";
import aberdeenRiderStormAsset from "@/assets/uploads/approved-aberdeen-rider-exterior-storm.png.asset.json";
import aberdeenViewingLoungeAsset from "@/assets/uploads/approved-aberdeen-viewing-lounge.png.asset.json";
import stableAisleWarmAsset from "@/assets/uploads/approved-stable-aisle-detail-warm-light.png.asset.json";
import stableStallSymmetricAsset from "@/assets/uploads/approved-stable-stall-interior-symmetric.png.asset.json";
import tackRoomJoineryAsset from "@/assets/uploads/approved-tack-room-joinery.png.asset.json";
import currentBuildSteelStormAsset from "@/assets/uploads/approved-current-build-steel-frame-storm.png.asset.json";

// Equitana / arena programme — approved covered arena + field-notes set
import coveredArenaInteriorNightAsset from "@/assets/covered-arenas/approved-covered-arena-interior-night.png.asset.json";
import coveredArenaInteriorDawnAsset from "@/assets/covered-arenas/approved-covered-arena-interior-construction-dawn.png.asset.json";
import timberKickboardAsset from "@/assets/covered-arenas/approved-timber-kickboard-detail.png.asset.json";
import compArenaDrainageAsset from "@/assets/field-notes/covered-competition-arena-drainage-detail.png.asset.json";
import compArenaNightWorkAsset from "@/assets/field-notes/covered-competition-arena-night-work-lights.png.asset.json";
import compArenaSunsetPuddlesAsset from "@/assets/field-notes/covered-competition-arena-sunset-puddles.png.asset.json";
import compArenaTruckAccessAsset from "@/assets/field-notes/covered-competition-arena-truck-access-track.png.asset.json";
import muddyBootsSteelFrameAsset from "@/assets/field-notes/muddy-boots-steel-frame.png.asset.json";

const aberdeenExteriorDusk = aberdeenExteriorDuskAsset.url;
const aberdeenRiderStorm = aberdeenRiderStormAsset.url;
const aberdeenViewingLounge = aberdeenViewingLoungeAsset.url;
const stableAisleWarm = stableAisleWarmAsset.url;
const stableStallSymmetric = stableStallSymmetricAsset.url;
const tackRoomJoinery = tackRoomJoineryAsset.url;
const currentBuildSteelStorm = currentBuildSteelStormAsset.url;

const coveredArenaInteriorNight = coveredArenaInteriorNightAsset.url;
const coveredArenaInteriorDawn = coveredArenaInteriorDawnAsset.url;
const timberKickboard = timberKickboardAsset.url;
const compArenaDrainage = compArenaDrainageAsset.url;
const compArenaNightWork = compArenaNightWorkAsset.url;
const compArenaSunsetPuddles = compArenaSunsetPuddlesAsset.url;
const compArenaTruckAccess = compArenaTruckAccessAsset.url;
const muddyBootsSteelFrame = muddyBootsSteelFrameAsset.url;


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
    hero: aberdeenExteriorDusk,
    heroAlt: "Aberdeen stables — full frontage at dusk",
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
      before: currentBuildSteelStorm,
      after: aberdeenExteriorDusk,
      caption: "Raw frame to resolved frontage.",
    },
    process: [
      { src: currentBuildSteelStorm, alt: "Primary steel under a working storm sky" },
      { src: stableAisleWarm, alt: "Stable aisle taking shape in warm low light" },
      { src: tackRoomJoinery, alt: "Tack room joinery, ordered and architectural" },
    ],
    final: [
      { src: stableStallSymmetric, alt: "Stall interior, symmetric joinery" },
      { src: stableAisleWarm, alt: "Stable aisle in warm light" },
      { src: aberdeenViewingLounge, alt: "Viewing lounge, sheltered and elevated" },
      { src: aberdeenExteriorDusk, alt: "Completed exterior at dusk" },
    ],
    outcomes: [
      { metric: "100%", label: "Hand-laid stonework" },
      { metric: "365", label: "Days of resolved use" },
      { metric: "0", label: "Snag list at handover" },
    ],
    understanding: {
      image: aberdeenRiderStorm,
      alt: "Rider arriving at Aberdeen frontage under storm light",
      line: "Full stable complex with integrated stone and timber detailing.",
    },
    solution: {
      image: stableStallSymmetric,
      alt: "Custom timber stalls with engineered ventilation",
      line: "From Dirt to Dynasty.",
    },
    outcome: {
      image: aberdeenExteriorDusk,
      alt: "Completed stable exterior at dusk",
      line: "Private equine estate built to hold up for generations.",
    },
    closingLine: "From Dirt to Dynasty.",
  },
  // Main Ridge case study removed — see pages/MainRidgePavilion.tsx (/selected-works/main-ridge-pavilion).
  {
    slug: "equitana",
    title: "Equitana Melbourne",
    location: "Melbourne",
    hero: coveredArenaInteriorNight,
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
      before: compArenaTruckAccess,
      after: coveredArenaInteriorNight,
      caption: "Bare access track to competition surface.",
    },
    process: [
      { src: compArenaTruckAccess, alt: "Surface preparation and access at exhibition scale" },
      { src: compArenaDrainage, alt: "Subsurface drainage cut to engineered depth" },
      { src: muddyBootsSteelFrame, alt: "Boots on the ground, structure rising" },
    ],
    final: [
      { src: coveredArenaInteriorNight, alt: "Arena under exhibition lighting" },
      { src: coveredArenaInteriorDawn, alt: "Interior at dawn, fit-out complete" },
      { src: timberKickboard, alt: "Timber kickboard detail at the surface line" },
    ],
    outcomes: [
      { metric: "National", label: "Stage delivery" },
      { metric: "Multi", label: "Discipline configuration" },
      { metric: "0", label: "Surface failures over event run" },
    ],
    understanding: {
      image: compArenaSunsetPuddles,
      alt: "Surface integrity after rain, sunset puddles holding line",
      line: "Competition-grade surface delivered under exhibition conditions.",
    },
    solution: {
      image: compArenaDrainage,
      alt: "Stabilised arena drainage and base course",
      line: "From Dirt to Dynasty.",
    },
    outcome: {
      image: compArenaNightWork,
      alt: "Night work lights over completed competition arena",
      line: "Multi-discipline arena built to perform under national scrutiny.",
    },
    closingLine: "From Dirt to Dynasty.",
  },
];

