/**
 * Approved Cinematic Imagery — Single Source of Truth
 * --------------------------------------------------------------
 * Every project section that renders imagery MUST import from
 * this file. Do NOT inline asset imports elsewhere for these
 * projects — that's how Field Notes and Selected Works drift
 * apart and end up showing the same photo twice.
 *
 * Rules enforced here:
 *  1. Only newer approved cinematic assets are referenced.
 *  2. Each project declares distinct roles for each surface:
 *       - selectedWorks (project identity / Gallery + homepage)
 *       - fieldNotesHero (live-build hero)
 *       - fieldNotesPreview (homepage Field Notes tile)
 *       - fieldNotesGalleryA / B (Build Read pair)
 *       - caseStudyHero (project case study arrival)
 *  3. assertNoAdjacentDuplicates() guarantees no two adjacent
 *     surfaces resolve to the same asset URL.
 *
 * If you need to add a project, add it below and re-run the
 * assertion (executed at module load in dev).
 */

// ---- Covered Arena & Stables Build (active project) ----
import coveredArenaSunsetPuddles from "@/assets/field-notes/covered-competition-arena-sunset-puddles.png.asset.json";
import coveredArenaNightWorkLights from "@/assets/field-notes/covered-competition-arena-night-work-lights.png.asset.json";
import coveredArenaTruckAccessTrack from "@/assets/field-notes/covered-competition-arena-truck-access-track.png.asset.json";
import coveredArenaDrainageDetail from "@/assets/field-notes/covered-competition-arena-drainage-detail.png.asset.json";
import coveredArenaDozerStormSky from "@/assets/field-notes/covered-competition-arena-dozer-storm-sky.png.asset.json";
import approvedCurrentBuildBlackShedStorm from "@/assets/field-notes/approved-current-build-black-shed-storm.png.asset.json";
import approvedCurrentBuildEquipmentStorm from "@/assets/uploads/approved-current-build-equipment-storm.png.asset.json";
import approvedCurrentBuildRainFrameSymmetry from "@/assets/uploads/approved-current-build-rain-frame-symmetry.png.asset.json";


// Responsive webp variants for the hero/preview surfaces
import coveredArenaSunset640 from "@/assets/responsive/covered-competition-arena-sunset-puddles-640.webp.asset.json";
import coveredArenaSunset1024 from "@/assets/responsive/covered-competition-arena-sunset-puddles-1024.webp.asset.json";
import coveredArenaSunset1536 from "@/assets/responsive/covered-competition-arena-sunset-puddles-1536.webp.asset.json";

// "Real conditions" supporting visual — muddy boots + steel frame at dusk
import muddyBootsSteelFrame from "@/assets/field-notes/muddy-boots-steel-frame.png.asset.json";
import muddyBoots640 from "@/assets/responsive/muddy-boots-steel-frame-640.webp.asset.json";
import muddyBoots1024 from "@/assets/responsive/muddy-boots-steel-frame-1024.webp.asset.json";
import muddyBoots1536 from "@/assets/responsive/muddy-boots-steel-frame-1536.webp.asset.json";

// ---- Main Ridge Pavilion (completed) ----
import mainRidgeWide from "@/assets/main-ridge/main-ridge-pavilion-wide-fireplace-table.png.asset.json";
import mainRidgeFireplaceDetail from "@/assets/main-ridge/main-ridge-pavilion-brick-fireplace-detail.png.asset.json";
import mainRidgeParrillaWide from "@/assets/main-ridge/mr-parrilla-wide.png.asset.json";
import mainRidgeBeamDetail from "@/assets/main-ridge/mr-beam-detail.png.asset.json";
import mainRidgeWide640 from "@/assets/responsive/main-ridge-pavilion-wide-fireplace-table-640.webp.asset.json";
import mainRidgeWide1024 from "@/assets/responsive/main-ridge-pavilion-wide-fireplace-table-1024.webp.asset.json";
import mainRidgeWide1536 from "@/assets/responsive/main-ridge-pavilion-wide-fireplace-table-1536.webp.asset.json";

// ---- Aberdeen (completed) ----
import aberdeenHeroTwilight from "@/assets/aberdeen/approved-barn-front-twilight.png.asset.json";
import aberdeenArenaVaulted from "@/assets/uploads/approved-covered-arena-interior-night-v2.png.asset.json";
import aberdeenEntryCorridor from "@/assets/aberdeen/approved-arena-surfacing-forecourt.png.asset.json";



// -----------------------------------------------------------------
// Crop-safety contract
// -----------------------------------------------------------------
// When an image contains critical focal elements that must never be
// cropped (e.g. boots at the bottom-left + steel frame at the right),
// the consuming component MUST enforce ALL of the following:
//
//   1. Container aspectRatio locked to the source image's native ratio
//      (e.g. style={{ aspectRatio: "3 / 2" }} for a 3:2 photo).
//   2. object-contain (NOT object-cover) so a future container override
//      letterboxes instead of clipping.
//   3. Intrinsic width / height attributes so the browser reserves the
//      correct box before decode (prevents transient crop / CLS).
//   4. object-center (or a conservative position that never shifts the
//      crop window toward an edge with critical detail).
//
// If you change any of the four rules above for a "conditions" or
// hero surface, you risk cropping boots, steel, machinery or other
// edge-dominant focal points on mobile.
// -----------------------------------------------------------------

export type AssetPointer = { url: string };
export type ResponsiveAsset = {
  src: string;
  srcSet: string;
  sizes?: string;
  /** intrinsic widths available, smallest -> largest */
  widths: number[];
};

export type ProjectSurface =
  | "selectedWorks"
  | "fieldNotesHero"
  | "fieldNotesPreview"
  | "fieldNotesConditions"
  | "fieldNotesGalleryA"
  | "fieldNotesGalleryB"
  | "caseStudyHero";

export interface ProjectImagery {
  slug: string;
  title: string;
  status: "in-progress" | "completed";
  surfaces: Partial<Record<ProjectSurface, AssetPointer>>;
  responsive?: Partial<Record<ProjectSurface, ResponsiveAsset>>;
  alt: Partial<Record<ProjectSurface, string>>;
}

// -----------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------

const buildSrcSet = (
  a: AssetPointer,
  b: AssetPointer,
  c: AssetPointer,
  sizes = "100vw",
): ResponsiveAsset => ({
  src: c.url,
  srcSet: `${a.url} 640w, ${b.url} 1024w, ${c.url} 1536w`,
  sizes,
  widths: [640, 1024, 1536],
});

// -----------------------------------------------------------------
// Project assignments — distinct per surface, no adjacent duplicates
// -----------------------------------------------------------------

export const projectImagery: Record<string, ProjectImagery> = {
  "covered-arena-stables-build": {
    slug: "covered-arena-stables-build",
    title: "Covered Arena & Stables Build",
    status: "in-progress",
    surfaces: {
      // Selected Works = structural symmetry in rain
      selectedWorks: approvedCurrentBuildRainFrameSymmetry,
      // Field Notes hero = equipment arrival under storm light
      fieldNotesHero: approvedCurrentBuildEquipmentStorm,
      // Homepage Field Notes preview matches the Field Notes hero on purpose
      fieldNotesPreview: approvedCurrentBuildEquipmentStorm,
      // Build Read pair — distinct conditions, no repetition
      fieldNotesGalleryA: coveredArenaTruckAccessTrack,
      fieldNotesGalleryB: coveredArenaDrainageDetail,
      // Real conditions divider — muddy boots + steel frame at dusk
      fieldNotesConditions: muddyBootsSteelFrame,
      caseStudyHero: approvedCurrentBuildRainFrameSymmetry,

    },
    responsive: {
      fieldNotesHero: buildSrcSet(
        coveredArenaSunset640,
        coveredArenaSunset1024,
        coveredArenaSunset1536,
        "100vw",
      ),
      fieldNotesPreview: buildSrcSet(
        coveredArenaSunset640,
        coveredArenaSunset1024,
        coveredArenaSunset1536,
        "(min-width: 1480px) 1480px, 100vw",
      ),
      fieldNotesConditions: buildSrcSet(
        muddyBoots640,
        muddyBoots1024,
        muddyBoots1536,
        "100vw",
      ),
    },
    alt: {
      selectedWorks:
        "Covered Arena & Stables Build — rain-soaked structural frame aligned on axis with the wider barn form beyond",
      fieldNotesHero:
        "Current build convoy arriving beside the black-clad structure under a heavy storm sky",
      fieldNotesPreview:
        "Current build convoy arriving beside the black-clad structure under a heavy storm sky",
      fieldNotesGalleryA:
        "Wide site view of the current arena build showing steel span, machinery placement and open ground conditions",
      fieldNotesGalleryB:
        "Drainage detail and wet red clay around the active covered arena and stables build",
      fieldNotesConditions:
        "Muddy work boots in red clay with excavator, dump truck and steel-frame arena rising under a storm-lit dusk sky",
      caseStudyHero:
        "Covered Arena & Stables Build — rain-soaked structural frame aligned on axis with the wider barn form beyond",

    },
  },

  "main-ridge-pavilion": {
    slug: "main-ridge-pavilion",
    title: "Main Ridge Pavilion",
    status: "completed",
    surfaces: {
      selectedWorks: mainRidgeWide,
      caseStudyHero: mainRidgeWide,
      fieldNotesGalleryA: mainRidgeFireplaceDetail,
      fieldNotesGalleryB: mainRidgeParrillaWide,
    },
    responsive: {
      selectedWorks: buildSrcSet(
        mainRidgeWide640,
        mainRidgeWide1024,
        mainRidgeWide1536,
        "(min-width: 1480px) 1480px, 100vw",
      ),
    },
    alt: {
      selectedWorks:
        "Main Ridge pavilion — wide interior with fireplace, handcrafted timber table and warm dusk light",
      caseStudyHero:
        "Main Ridge pavilion — wide interior with fireplace, handcrafted timber table and warm dusk light",
      fieldNotesGalleryA:
        "Main Ridge pavilion — handcrafted brick fireplace detail in warm firelight",
      fieldNotesGalleryB:
        "Main Ridge parrilla — wide kitchen view with steel grill and timber bench",
    },
  },

  aberdeen: {
    slug: "aberdeen",
    title: "Aberdeen",
    status: "completed",
    surfaces: {
      selectedWorks: aberdeenHeroTwilight,
      caseStudyHero: aberdeenHeroTwilight,
      fieldNotesGalleryA: aberdeenArenaVaulted,
      fieldNotesGalleryB: aberdeenEntryCorridor,
    },
    alt: {
      selectedWorks:
        "Aberdeen — stable and barn structure at twilight with warm entry glow",
      caseStudyHero:
        "Aberdeen — stable and barn structure at twilight with warm entry glow",
      fieldNotesGalleryA:
        "Aberdeen indoor arena with black steel frame, warm overhead lighting and prepared riding surface",
      fieldNotesGalleryB:
        "Aberdeen arena surfacing forecourt with the long barn form beyond",

    },
  },
};

// -----------------------------------------------------------------
// Public lookup API — use these in components
// -----------------------------------------------------------------

export function getProjectImage(
  slug: string,
  surface: ProjectSurface,
): AssetPointer {
  const project = projectImagery[slug];
  if (!project) throw new Error(`[projectImagery] Unknown project slug: ${slug}`);
  const asset = project.surfaces[surface];
  if (!asset)
    throw new Error(
      `[projectImagery] No "${surface}" surface defined for "${slug}". Add one in src/config/projectImagery.ts.`,
    );
  return asset;
}

export function getProjectImageAlt(slug: string, surface: ProjectSurface): string {
  return projectImagery[slug]?.alt[surface] ?? projectImagery[slug]?.title ?? "";
}

export function getProjectResponsive(
  slug: string,
  surface: ProjectSurface,
): ResponsiveAsset | undefined {
  return projectImagery[slug]?.responsive?.[surface];
}

// -----------------------------------------------------------------
// Adjacency guard — fails loud in dev if two surfaces that render
// near each other resolve to the same image.
// -----------------------------------------------------------------

const ADJACENCY: Array<[ProjectSurface, ProjectSurface]> = [
  // Field Notes page renders these in vertical sequence
  ["fieldNotesHero", "fieldNotesGalleryA"],
  ["fieldNotesGalleryA", "fieldNotesGalleryB"],
  // Homepage renders Selected Works tile above Field Notes preview
  ["selectedWorks", "fieldNotesPreview"],
];

export function assertNoAdjacentDuplicates(): void {
  for (const project of Object.values(projectImagery)) {
    for (const [a, b] of ADJACENCY) {
      const ua = project.surfaces[a]?.url;
      const ub = project.surfaces[b]?.url;
      if (ua && ub && ua === ub) {
        // eslint-disable-next-line no-console
        console.warn(
          `[projectImagery] Adjacent duplicate on "${project.slug}": ` +
            `${a} and ${b} both use ${ua}. Pick a distinct approved asset.`,
        );
      }
    }
  }
}

if (import.meta.env?.DEV) {
  assertNoAdjacentDuplicates();
}
