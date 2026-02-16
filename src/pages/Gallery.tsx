import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X, Play, ZoomIn, Search, Download } from "lucide-react";
import { triggerHaptic } from "@/hooks/useHapticFeedback";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";
import { usePinchZoom } from "@/hooks/usePinchZoom";
import { SwipeIndicator } from "@/components/SwipeIndicator";
import { Layout } from "@/components/layout/Layout";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { PageHeader } from "@/components/PageHeader";
import { GalleryBlueprintOverlay } from "@/components/GalleryBlueprintOverlay";
import { GalleryTourForm } from "@/components/GalleryTourForm";
import logoPeMark from "@/assets/logo-pe-mark.png";

// Main Ridge images
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import mainRidgeTimber from "@/assets/main-ridge-timber.jpg";
import mainRidgeWorker from "@/assets/main-ridge-worker.jpg";
import mainRidgeCiroWoodwork1 from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeCiroWoodwork2 from "@/assets/main-ridge-ciro-woodwork-2.jpg";
import mainRidgeCiroWoodwork3 from "@/assets/main-ridge-ciro-woodwork-3.jpg";
import mainRidgeCiroWoodwork4 from "@/assets/main-ridge-ciro-woodwork-4.jpg";

// Aberdeen Farm images
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
import slowMo1 from "@/assets/videos/slow-mo-1.mp4";
import slowMo2 from "@/assets/videos/slow-mo-2.mp4";
import slowMo3 from "@/assets/videos/slow-mo-3.mp4";
import mainRidgeWoodwork1 from "@/assets/videos/main-ridge-woodwork-1.mp4";
import mainRidgeWoodwork2 from "@/assets/videos/main-ridge-woodwork-2.mp4";
import caulfieldVideo1 from "@/assets/videos/caulfield-1.mov";
import caulfieldVideo2 from "@/assets/videos/caulfield-2.mov";
import caulfieldVideo3 from "@/assets/videos/caulfield-3.mov";
import equitanaArenaVideo from "@/assets/videos/equitana-arena.mov";

type GalleryItem = {
  id: number;
  src: string;
  alt: string;
  project: string;
  type: "image" | "video";
  thumbnail?: string;
  service?: string;
  location?: string;
};

const projects = [
  { id: "all", name: "All Projects" },
  { id: "main-ridge", name: "Main Ridge" },
  { id: "aberdeen", name: "Aberdeen Farm" },
  { id: "queensland", name: "Queensland Facility" },
  { id: "equitana", name: "Equitana Melbourne" },
  { id: "caulfield", name: "Melbourne Cup" },
  { id: "videos", name: "Videos" },
];

const serviceFilters = [
  { id: "all", name: "All Services" },
  { id: "arena", name: "Arenas" },
  { id: "barn", name: "Barns & Stables" },
  { id: "stonework", name: "Stonework" },
  { id: "woodwork", name: "Woodwork" },
  { id: "infrastructure", name: "Infrastructure" },
  { id: "events", name: "Events" },
];

const locationFilters = [
  { id: "all", name: "All Locations" },
  { id: "victoria", name: "Victoria" },
  { id: "queensland", name: "Queensland" },
];

// All videos for dedicated sections (used in FeaturedVideoSection and VideoGallerySection)
const allVideos = [
  { id: 100, src: slowMo1, alt: "Graceful Movement", description: "Capturing natural horsemanship and the elegance of equine motion in slow motion", project: "videos" as const, type: "video" as const, thumbnail: mainRidgeInterior, service: "events", location: "victoria" },
  { id: 101, src: slowMo2, alt: "Power & Precision", description: "Every stride tells a story - showcasing the athleticism and grace of trained horses", project: "videos" as const, type: "video" as const, thumbnail: mainRidgeTimber, service: "events", location: "victoria" },
  { id: 102, src: slowMo3, alt: "Natural Beauty", description: "The artistry of horse training captured in stunning slow motion cinematography", project: "videos" as const, type: "video" as const, thumbnail: mainRidgeBrickwork, service: "events", location: "victoria" },
  { id: 103, src: mainRidgeWoodwork1, alt: "Main Ridge Timber Craftsmanship", description: "Ciro hand-crafting timber posts using traditional woodworking techniques at Main Ridge", project: "main-ridge" as const, type: "video" as const, thumbnail: mainRidgeCiroWoodwork1, service: "woodwork", location: "victoria" },
  { id: 104, src: mainRidgeWoodwork2, alt: "Main Ridge Woodworking Detail", description: "Precision hand-finishing of barn timber - attention to detail that lasts decades", project: "main-ridge" as const, type: "video" as const, thumbnail: mainRidgeCiroWoodwork2, service: "woodwork", location: "victoria" },
  { id: 105, src: caulfieldVideo1, alt: "Melbourne Cup Arena Prep - Day 1", description: "Professional arena surface preparation at Caulfield Racecourse for the Melbourne Cup carnival", project: "caulfield" as const, type: "video" as const, thumbnail: caulfieldEvent, service: "events", location: "victoria" },
  { id: 106, src: caulfieldVideo2, alt: "Melbourne Cup Surface Work - Day 2", description: "Precision grading and sand management for race-day perfection at world-class Caulfield", project: "caulfield" as const, type: "video" as const, thumbnail: arenaSandPrep1, service: "events", location: "victoria" },
  { id: 107, src: caulfieldVideo3, alt: "Melbourne Cup Final Touches - Day 3", description: "Final surface finishing ensuring competition-ready footing for thoroughbred racing", project: "caulfield" as const, type: "video" as const, thumbnail: arenaSandPrep2, service: "events", location: "victoria" },
  { id: 108, src: equitanaArenaVideo, alt: "Equitana Arena Setup", description: "Competition arena preparation at Equitana Melbourne - Australia's biggest equine event", project: "equitana" as const, type: "video" as const, thumbnail: equitanaArena1, service: "events", location: "victoria" },
];

// Gallery items for photo grid (videos are in dedicated sections above)
const galleryItems: GalleryItem[] = [
  // Main Ridge images
  { id: 1, src: mainRidgeBrickwork, alt: "Main Ridge - Custom brickwork detail showing reclaimed brick construction", project: "main-ridge", type: "image", service: "stonework", location: "victoria" },
  { id: 2, src: mainRidgeInterior, alt: "Main Ridge - Open barn interior with natural lighting and timber framing", project: "main-ridge", type: "image", service: "barn", location: "victoria" },
  { id: 3, src: mainRidgeTimber, alt: "Main Ridge - Timber beam installation with precision joinery", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 4, src: mainRidgeWorker, alt: "Main Ridge - Ciro on-site overseeing timber construction", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 5, src: mainRidgeCiroWoodwork1, alt: "Main Ridge - Hand-shaping timber posts with traditional tools", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 6, src: mainRidgeCiroWoodwork2, alt: "Main Ridge - Detailed woodworking on barn structural elements", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 7, src: mainRidgeCiroWoodwork3, alt: "Main Ridge - Timber finishing and quality inspection", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },
  { id: 8, src: mainRidgeCiroWoodwork4, alt: "Main Ridge - Hand-crafted timber beam ready for installation", project: "main-ridge", type: "image", service: "woodwork", location: "victoria" },

  // Aberdeen Farm
  { id: 10, src: aberdeenBarnInterior, alt: "Aberdeen Farm - Luxury barn interior with chandeliers and stained timber", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 11, src: aberdeenStalls, alt: "Aberdeen Farm - Custom-built stalls with sliding gates and premium finishes", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 12, src: aberdeenStallsDetail, alt: "Aberdeen Farm - Stall door hardware and ironwork detail", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 13, src: aberdeenAisle, alt: "Aberdeen Farm - Barn aisle with natural stone flooring", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 14, src: aberdeenMural, alt: "Aberdeen Farm - Hand-painted decorative mural on barn wall", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 15, src: aberdeenMural2, alt: "Aberdeen Farm - Equestrian mural artwork detail", project: "aberdeen", type: "image", service: "barn", location: "victoria" },
  { id: 16, src: aberdeenStonework, alt: "Aberdeen Farm - Natural stonework masonry on exterior walls", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 17, src: aberdeenStoneworkColor, alt: "Aberdeen Farm - Multi-colored stonework facade detail", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 18, src: aberdeenStoneworkBw, alt: "Aberdeen Farm - Architectural stone column construction", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 19, src: aberdeenInteriorStonework, alt: "Aberdeen Farm - Interior stone wall feature with lighting", project: "aberdeen", type: "image", service: "stonework", location: "victoria" },
  { id: 20, src: aberdeenDeck, alt: "Aberdeen Farm - Timber deck construction overlooking property", project: "aberdeen", type: "image", service: "woodwork", location: "victoria" },
  { id: 21, src: aberdeenExterior, alt: "Aberdeen Farm - Complete exterior view of finished barn", project: "aberdeen", type: "image", service: "barn", location: "victoria" },

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

// Gallery uses the shared PageHeader component

function FeaturedVideoSection({ onVideoClick }: { onVideoClick: (item: GalleryItem) => void }) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({
    threshold: 0.1,
    rootMargin: "0px",
  });
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Only show first 3 (slow-mo videos) in featured section
  const featuredVideos = allVideos.slice(0, 3);
  
  const handleVideoClick = () => {
    const video = featuredVideos[activeVideo];
    onVideoClick({
      id: video.id,
      src: video.src,
      alt: video.alt,
      project: video.project,
      type: "video",
      thumbnail: video.thumbnail,
    });
  };

  return (
    <GalleryBlueprintOverlay layer="barn" bg="card" className="py-16 bg-card">
      <div ref={ref as React.RefObject<HTMLDivElement>} />
      <div className="section-container">
        <div className="text-center mb-10">
          <span className="text-accent text-sm font-medium tracking-wider uppercase">Featured</span>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mt-2">
            Horse Training in Slow Motion
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Experience the beauty and precision of natural horsemanship captured in stunning slow motion.
          </p>
        </div>

        <div className={`grid lg:grid-cols-3 gap-6 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {featuredVideos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => {
                setActiveVideo(index);
                handleVideoClick();
              }}
              aria-label={`Play video: ${video.alt}`}
              className={`group relative aspect-[4/3] overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Video thumbnail with hover preview */}
              <video
                src={video.src}
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent group-hover:from-primary/70 transition-colors" />
              
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent transition-all duration-300 shadow-lg">
                  <Play className="w-7 h-7 text-accent-foreground ml-1" fill="currentColor" />
                </div>
              </div>
              
              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                <h3 className="font-serif text-xl text-primary-foreground mb-1">{video.alt}</h3>
                <p className="text-primary-foreground/70 text-sm">{video.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </GalleryBlueprintOverlay>
  );
}


function VideoGallerySection({ onVideoClick }: { onVideoClick: (item: GalleryItem) => void }) {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.3,
  });
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: "50px",
  });
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (gridVisible) {
      allVideos.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems((prev) => new Set(prev).add(index));
        }, index * 100);
      });
    }
  }, [gridVisible]);

  return (
    <GalleryBlueprintOverlay layer="facility" bg="background" className="py-20 bg-background">
      <div className="section-container">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-12 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <span className="text-accent text-sm font-medium tracking-wider uppercase">Video Collection</span>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mt-2 mb-4">
            Behind the Craft
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Watch our work come to life through slow-motion horse training footage and 
            detailed construction videos showcasing traditional timber craftsmanship.
          </p>
        </div>

        {/* Video Grid */}
        <div 
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {allVideos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => onVideoClick(video)}
              aria-label={`Play video: ${video.alt}`}
              className={`group relative aspect-video overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-muted transition-all duration-500 ${
                visibleItems.has(index)
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-6 scale-95"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Video with hover autoplay */}
              <video
                src={video.src}
                muted
                loop
                playsInline
                poster={video.thumbnail}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300" />
              
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent transition-all duration-300 shadow-xl backdrop-blur-sm">
                  <Play className="w-6 h-6 text-accent-foreground ml-0.5" fill="currentColor" />
                </div>
              </div>
              
              {/* Video info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif text-lg text-primary-foreground mb-1">{video.alt}</h3>
                <p className="text-primary-foreground/60 text-xs uppercase tracking-wider">
                  {video.project === "videos" ? "Slow Motion" : "Construction Process"}
                </p>
              </div>
              
              {/* Category badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                  video.project === "videos" 
                    ? "bg-accent/90 text-accent-foreground" 
                    : "bg-secondary/90 text-secondary-foreground"
                }`}>
                  {video.project === "videos" ? "Slow-Mo" : "Craftsmanship"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </GalleryBlueprintOverlay>
  );
}

function Lightbox({
  item,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
  allItems,
  onNavigateTo,
}: {
  item: GalleryItem | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCount: number;
  allItems: GalleryItem[];
  onNavigateTo: (index: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isZooming, setIsZooming] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Pinch-to-zoom for images
  const pinchZoom = usePinchZoom({
    minScale: 1,
    maxScale: 4,
    onZoomStart: () => setIsZooming(true),
    onZoomEnd: () => setIsZooming(false),
  });

  // Reset zoom when item changes
  useEffect(() => {
    pinchZoom.reset();
  }, [item?.id]);

  // Lock body scroll, auto-focus, and focus trap
  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleTab);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener("keydown", handleTab);
    };
  }, [item]);

  useEffect(() => {
    if (item?.type === "video" && videoRef.current) {
      videoRef.current.play();
    }
    if (item?.type === "image") {
      setIsImageLoading(true);
    }
  }, [item]);

  // Keyboard navigation (arrows, Home, End, Escape)
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (hasPrevious) onPrevious();
          break;
        case "ArrowRight":
          if (hasNext) onNext();
          break;
        case "Home":
          e.preventDefault();
          onNavigateTo(0);
          break;
        case "End":
          e.preventDefault();
          onNavigateTo(totalCount - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose, onPrevious, onNext, hasPrevious, hasNext, onNavigateTo, totalCount]);

  // Touch swipe handlers (only when not zoomed)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (pinchZoom.isZoomed || e.touches.length > 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pinchZoom.isZoomed || e.touches.length > 1) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (pinchZoom.isZoomed) return;
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (swipeDistance > minSwipeDistance && hasNext) {
      triggerHaptic("light");
      onNext();
    } else if (swipeDistance < -minSwipeDistance && hasPrevious) {
      triggerHaptic("light");
      onPrevious();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Desktop mouse drag-to-pan when zoomed
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!pinchZoom.isZoomed) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pinchZoom.translateX, y: e.clientY - pinchZoom.translateY };
  }, [pinchZoom.isZoomed, pinchZoom.translateX, pinchZoom.translateY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    pinchZoom.setTranslate(newX, newY);
  }, [isDragging, pinchZoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Double-click to zoom on desktop
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pinchZoom.isZoomed) {
      pinchZoom.reset();
    } else {
      const rect = pinchZoom.containerRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        pinchZoom.zoomTo(2, centerX - e.clientX, centerY - e.clientY);
      } else {
        pinchZoom.zoomTo(2, 0, 0);
      }
    }
  }, [pinchZoom]);

  if (!item) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-roledescription="Image lightbox"
      aria-label={`${item.alt} — ${currentIndex + 1} of ${totalCount}`}
      className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center p-4"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip links for keyboard users */}
      <nav aria-label="Lightbox skip links" className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-2 focus-within:left-2 focus-within:z-20 focus-within:flex focus-within:flex-col focus-within:gap-1">
        <a href="#lightbox-close" className="bg-accent text-accent-foreground px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">
          Skip to close button
        </a>
        <a href="#lightbox-media" className="bg-accent text-accent-foreground px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">
          Skip to media content
        </a>
        <a href="#lightbox-thumbnails" className="bg-accent text-accent-foreground px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">
          Skip to thumbnail navigation
        </a>
      </nav>

      {/* Live region for screen reader navigation announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing {item.type === "video" ? "video" : "image"} {currentIndex + 1} of {totalCount}: {item.alt}
      </div>

      {/* Swipe indicator for first-time users */}
      <SwipeIndicator show={!!item && totalCount > 1} />

      {/* Download & Close buttons */}
      {item.type === "image" && (
        <a
          href={item.src}
          download={`peninsula-equine-${item.id}.jpg`}
          className="absolute top-6 right-20 text-primary-foreground/60 hover:text-primary-foreground z-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-1"
          onClick={(e) => e.stopPropagation()}
          aria-label="Download image"
        >
          <Download className="h-7 w-7" />
        </a>
      )}
      <button
        ref={closeButtonRef}
        id="lightbox-close"
        className="absolute top-6 right-6 text-primary-foreground/80 hover:text-primary-foreground z-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-full p-1"
        onClick={onClose}
        aria-label="Close lightbox (Escape)"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Previous button */}
      {hasPrevious && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/60 hover:text-primary-foreground z-10 p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          aria-label={`Previous ${item?.type === "video" ? "video" : "image"} (Left Arrow)`}
        >
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/60 hover:text-primary-foreground z-10 p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label={`Next ${item?.type === "video" ? "video" : "image"} (Right Arrow)`}
        >
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div id="lightbox-media" className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        {item.type === "video" ? (
          <video
            ref={videoRef}
            src={item.src}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
          />
        ) : (
          <div 
            ref={pinchZoom.containerRef}
            className={`relative overflow-hidden touch-none ${pinchZoom.isZoomed ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
            {...pinchZoom.handlers}
            onTouchEnd={(e) => {
              pinchZoom.handlers.onTouchEnd(e);
              pinchZoom.handleDoubleTap(e);
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          >
            {/* Loading spinner */}
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={item.src}
              alt={item.alt}
              className={`max-w-full max-h-[85vh] object-contain rounded-lg mx-auto transition-all duration-200 select-none ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              style={{ transform: pinchZoom.transform }}
              onLoad={() => setIsImageLoading(false)}
              draggable={false}
            />
            {/* Zoom indicator */}
            {pinchZoom.isZoomed && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/80 text-primary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <ZoomIn className="w-3 h-3" />
                {Math.round(pinchZoom.scale * 100)}%
              </div>
            )}
            {/* Zoom hint */}
            {!pinchZoom.isZoomed && !isImageLoading && (
              <>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/60 text-primary-foreground/70 text-xs px-3 py-1.5 rounded-full sm:hidden">
                  Pinch to zoom • Double-tap to zoom
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/60 text-primary-foreground/70 text-xs px-3 py-1.5 rounded-full hidden sm:block">
                  Double-click to zoom • Drag to pan
                </div>
              </>
            )}
          </div>
        )}
        {/* Structured caption */}
        <div className="text-center mt-4 space-y-1">
          {item.alt.includes(" - ") ? (
            <>
              <p className="text-primary-foreground/90 text-sm font-serif">
                {item.alt.split(" - ").slice(1).join(" - ")}
              </p>
              <p className="text-primary-foreground/50 text-xs uppercase tracking-widest">
                {item.alt.split(" - ")[0]}
              </p>
            </>
          ) : (
            <p className="text-primary-foreground/70 text-sm">{item.alt}</p>
          )}
        </div>

        {/* Thumbnail strip */}
        <div id="lightbox-thumbnails" className="mt-6 px-4" role="navigation" aria-label="Image thumbnails">
          <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent">
            {allItems.map((thumbItem, index) => (
              <button
                key={thumbItem.id}
                onClick={() => onNavigateTo(index)}
                className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden transition-all duration-300 ${
                  index === currentIndex 
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-primary scale-105" 
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                }`}
                aria-label={`Go to ${thumbItem.type === "video" ? "video" : "image"} ${index + 1}: ${thumbItem.alt}`}
              >
                <img
                  src={thumbItem.type === "video" ? thumbItem.thumbnail : thumbItem.src}
                  alt={thumbItem.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {thumbItem.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                )}
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-accent/10" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation hint */}
        <p className="text-primary-foreground/40 text-xs mt-4 text-center">
          <span className="hidden sm:inline">← → navigate · Home/End first/last · Esc close</span>
          <span className="sm:hidden">Swipe to navigate · Tap outside to close</span>
        </p>
      </div>
    </div>
  );
}

function VideoGridItem({
  item,
  onClick,
  isVisible,
  delay,
}: {
  item: GalleryItem;
  onClick: () => void;
  isVisible: boolean;
  delay: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked, fail silently
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`Play video: ${item.alt}`}
      className={`group aspect-square overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-muted relative transition-all duration-500 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Thumbnail image */}
      <img
        src={item.thumbnail || item.src}
        alt={item.alt}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isHovering ? "opacity-0" : "opacity-100"
        } group-hover:scale-105`}
        loading="lazy"
      />
      
      {/* Video preview on hover */}
      <video
        ref={videoRef}
        src={item.src}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
        muted
        playsInline
        loop
        preload="none"
      />
      
      {/* Play icon overlay */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
        isHovering ? "bg-primary/20" : "bg-primary/30 group-hover:bg-primary/40"
      }`}>
        <div className={`w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center transition-all duration-300 ${
          isHovering ? "scale-90 opacity-70" : "group-hover:scale-110"
        }`}>
          <Play className="w-6 h-6 text-accent-foreground ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Video caption overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary/80 to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-primary-foreground text-xs leading-snug line-clamp-1">{item.alt}</p>
      </div>
    </button>
  );
}

const ITEMS_PER_PAGE = 20;

function GalleryGrid({
  items,
  onItemClick,
}: {
  items: GalleryItem[];
  onItemClick: (item: GalleryItem) => void;
}) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.05,
    rootMargin: "50px",
  });
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && displayCount < items.length) {
          setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, items.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [displayCount, items.length]);

  // Reset when items change (filter change)
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
    setVisibleItems(new Set());
  }, [items]);

  // Staggered reveal
  useEffect(() => {
    if (isVisible) {
      const displayed = items.slice(0, displayCount);
      displayed.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems((prev) => new Set(prev).add(index));
        }, index * 50);
      });
    }
  }, [isVisible, displayCount, items]);

  const displayedItems = items.slice(0, displayCount);

  return (
    <>
      <div
        ref={ref}
        className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance]"
      >
        {displayedItems.map((item, index) =>
          item.type === "video" ? (
            <div key={item.id} className="break-inside-avoid mb-3 sm:mb-4">
              <VideoGridItem
                item={item}
                onClick={() => onItemClick(item)}
                isVisible={visibleItems.has(index)}
                delay={Math.min(index, 12) * 30}
              />
            </div>
          ) : (
            <button
              key={item.id}
              onClick={() => onItemClick(item)}
              className={`group w-full overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-muted relative transition-all duration-500 break-inside-avoid mb-3 sm:mb-4 block ${
                visibleItems.has(index)
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-95"
              }`}
              style={{ transitionDelay: `${Math.min(index, 12) * 30}ms` }}
              aria-label={`View ${item.alt}`}
            >
              {/* Skeleton placeholder */}
              <div className="absolute inset-0 bg-muted animate-pulse" aria-hidden="true" />
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 relative z-[1]"
                loading="lazy"
                onLoad={(e) => {
                  const skeleton = (e.currentTarget.parentElement?.querySelector('.animate-pulse') as HTMLElement);
                  if (skeleton) skeleton.style.display = 'none';
                }}
              />
              {/* Auto-caption overlay */}
              <div className="absolute bottom-0 inset-x-0 z-[2] bg-gradient-to-t from-primary/80 via-primary/40 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-primary-foreground text-xs leading-snug line-clamp-2">
                  {item.alt.includes(" - ") ? item.alt.split(" - ").slice(1).join(" - ") : item.alt}
                </p>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-wider mt-1">
                  {item.alt.includes(" - ") ? item.alt.split(" - ")[0] : "Peninsula Equine"}
                </p>
              </div>
            </button>
          )
        )}
      </div>
      {/* Infinite scroll sentinel */}
      {displayCount < items.length && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}

export default function Gallery() {
  const [activeProject, setActiveProject] = useState("all");
  const [activeService, setActiveService] = useState("all");
  const [activeLocation, setActiveLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Convert allVideos to GalleryItem format for filtering
  const videoGalleryItems: GalleryItem[] = allVideos.map((v) => ({
    id: v.id,
    src: v.src,
    alt: v.alt,
    project: v.project,
    type: v.type,
    thumbnail: v.thumbnail,
    service: v.service,
    location: v.location,
  }));

  // Filtered items with search, service, location
  const filteredItems = useMemo(() => {
    let items: GalleryItem[] =
      activeProject === "all"
        ? galleryItems
        : activeProject === "videos"
        ? videoGalleryItems
        : galleryItems.filter((item) => item.project === activeProject);

    if (activeService !== "all") {
      items = items.filter((item) => item.service === activeService);
    }

    if (activeLocation !== "all") {
      items = items.filter((item) => item.location === activeLocation);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.alt.toLowerCase().includes(q) ||
          item.project.toLowerCase().includes(q) ||
          (item.service && item.service.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q))
      );
    }

    return items;
  }, [activeProject, activeService, activeLocation, searchQuery, videoGalleryItems]);

  const activeFilterCount =
    (activeService !== "all" ? 1 : 0) +
    (activeLocation !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setActiveProject("all");
    setActiveService("all");
    setActiveLocation("all");
    setSearchQuery("");
  };

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Combine all navigable items (gallery items + videos from allVideos)
  const allNavigableItems: GalleryItem[] = [
    ...galleryItems,
    ...allVideos.map((v) => ({
      id: v.id,
      src: v.src,
      alt: v.alt,
      project: v.project,
      type: v.type,
      thumbnail: v.thumbnail,
      service: v.service,
      location: v.location,
    })),
  ];

  // Find current index for navigation
  const currentIndex = lightboxItem
    ? allNavigableItems.findIndex((item) => item.id === lightboxItem.id)
    : -1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setLightboxItem(allNavigableItems[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < allNavigableItems.length - 1) {
      setLightboxItem(allNavigableItems[currentIndex + 1]);
    }
  };

  const currentProjectName = projects.find((p) => p.id === activeProject)?.name || "All Projects";
  const videoCount = filteredItems.filter(i => i.type === "video").length;
  const imageCount = filteredItems.filter(i => i.type === "image").length;

  return (
    <Layout>
      <PageHeader
        title="Our Work"
        description="Explore our portfolio of premium equine facilities, from luxurious barns to competition arenas at Australia's biggest events."
        backgroundImage={aberdeenBarnInterior}
        dividerVariant="structural"
      />
      
      {/* Featured Video Section */}
      <FeaturedVideoSection onVideoClick={setLightboxItem} />
      
      {/* Video Gallery Section */}
      <VideoGallerySection onVideoClick={setLightboxItem} />

      {/* Photo Gallery Section */}
      <GalleryBlueprintOverlay layer="elevation" bg="background" className="section-padding">
        <div className="section-container">
          {/* Search & Filter Bar */}
          <div className="mb-8 space-y-5" role="search" aria-label="Gallery search and filters">
            {/* Search input */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by project, service, or location… (press /)"
                className="w-full pl-11 pr-10 py-3 rounded-full border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
                aria-label="Search gallery by keyword"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Inline filter row */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {/* Service pills */}
              <div className="flex flex-wrap gap-1.5 items-center" role="radiogroup" aria-label="Filter by service type">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1 hidden sm:inline">Service</span>
                {serviceFilters.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveService(s.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activeService === s.id
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                    }`}
                    role="radio"
                    aria-checked={activeService === s.id}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              <span className="hidden sm:block w-px h-5 bg-border" aria-hidden="true" />

              {/* Location pills */}
              <div className="flex flex-wrap gap-1.5 items-center" role="radiogroup" aria-label="Filter by location">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1 hidden sm:inline">Location</span>
                {locationFilters.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setActiveLocation(l.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activeLocation === l.id
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                    }`}
                    role="radio"
                    aria-checked={activeLocation === l.id}
                  >
                    {l.name}
                  </button>
                ))}
              </div>

              {/* Clear all */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

          </div>

          {/* Project Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center" role="tablist" aria-label="Filter by project">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeProject === project.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                role="tab"
                aria-selected={activeProject === project.id}
              >
                {project.name}
              </button>
            ))}
          </div>

          {/* Project Title & Count */}
          <div className="text-center mb-8">
            {activeProject !== "all" && (
              <h2 className="font-serif text-2xl text-foreground">{currentProjectName}</h2>
            )}
            <p className="text-muted-foreground text-sm mt-1" aria-live="polite">
              {filteredItems.length === 0
                ? "No results found"
                : <>
                    {imageCount > 0 && `${imageCount} photo${imageCount !== 1 ? "s" : ""}`}
                    {imageCount > 0 && videoCount > 0 && " · "}
                    {videoCount > 0 && `${videoCount} video${videoCount !== 1 ? "s" : ""}`}
                  </>
              }
            </p>
          </div>

          {/* Gallery Grid */}
          <GalleryGrid 
            items={filteredItems} 
            onItemClick={setLightboxItem}
            key={`${activeProject}-${activeService}-${activeLocation}-${searchQuery}`}
          />

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No media matches your filters.</p>
              <button
                onClick={clearAllFilters}
                className="text-accent hover:text-accent/80 text-sm underline underline-offset-2"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </GalleryBlueprintOverlay>

      {/* Gallery Tour Lead Form */}
      <section className="section-padding bg-card border-y border-border">
        <div className="section-container">
          <GalleryTourForm />
        </div>
      </section>

      {/* CTA with Parallax */}
      <ParallaxCTA
        title="Ready to Start Your Project?"
        description="These projects represent our commitment to excellence. Let's discuss how we can bring your vision to life."
        backgroundImage={aberdeenBarnInterior}
        primaryButtonText="Get in Touch"
        primaryButtonLink="/contact"
        showPhoneButton={false}
      />

      {/* Lightbox */}
      <Lightbox
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < allNavigableItems.length - 1}
        currentIndex={currentIndex}
        totalCount={allNavigableItems.length}
        allItems={allNavigableItems}
        onNavigateTo={(index) => setLightboxItem(allNavigableItems[index])}
      />
    </Layout>
  );
}
