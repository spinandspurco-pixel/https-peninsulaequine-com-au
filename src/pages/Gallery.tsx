import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Layout } from "@/components/layout/Layout";

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

// All videos for dedicated sections (used in FeaturedVideoSection and VideoGallerySection)
const allVideos = [
  { id: 100, src: slowMo1, alt: "Graceful Movement", description: "Capturing the elegance of equine motion", project: "videos" as const, type: "video" as const, thumbnail: mainRidgeInterior },
  { id: 101, src: slowMo2, alt: "Power & Precision", description: "Every stride tells a story", project: "videos" as const, type: "video" as const, thumbnail: mainRidgeTimber },
  { id: 102, src: slowMo3, alt: "Natural Beauty", description: "The artistry of horse training", project: "videos" as const, type: "video" as const, thumbnail: mainRidgeBrickwork },
  { id: 103, src: mainRidgeWoodwork1, alt: "Timber Craftsmanship", description: "Traditional woodworking techniques", project: "main-ridge" as const, type: "video" as const, thumbnail: mainRidgeCiroWoodwork1 },
  { id: 104, src: mainRidgeWoodwork2, alt: "Woodworking Detail", description: "Hand-crafted precision", project: "main-ridge" as const, type: "video" as const, thumbnail: mainRidgeCiroWoodwork2 },
  { id: 105, src: caulfieldVideo1, alt: "Melbourne Cup Arena Prep", description: "Professional sand management at Caulfield", project: "caulfield" as const, type: "video" as const, thumbnail: caulfieldEvent },
  { id: 106, src: caulfieldVideo2, alt: "Caulfield Surface Work", description: "Race-day preparation in action", project: "caulfield" as const, type: "video" as const, thumbnail: arenaSandPrep1 },
  { id: 107, src: caulfieldVideo3, alt: "Racecourse Finishing", description: "Final touches for competition readiness", project: "caulfield" as const, type: "video" as const, thumbnail: arenaSandPrep2 },
  { id: 108, src: equitanaArenaVideo, alt: "Equitana Arena Setup", description: "Competition arena preparation at Australia's biggest event", project: "equitana" as const, type: "video" as const, thumbnail: equitanaArena1 },
];

// Gallery items for photo grid (videos are in dedicated sections above)
const galleryItems: GalleryItem[] = [
  // Main Ridge images
  { id: 1, src: mainRidgeBrickwork, alt: "Main Ridge brickwork detail", project: "main-ridge", type: "image" },
  { id: 2, src: mainRidgeInterior, alt: "Main Ridge barn interior", project: "main-ridge", type: "image" },
  { id: 3, src: mainRidgeTimber, alt: "Main Ridge timber framing", project: "main-ridge", type: "image" },
  { id: 4, src: mainRidgeWorker, alt: "Craftsman at work on Main Ridge", project: "main-ridge", type: "image" },
  { id: 5, src: mainRidgeCiroWoodwork1, alt: "Ciro working timber at Main Ridge", project: "main-ridge", type: "image" },
  { id: 6, src: mainRidgeCiroWoodwork2, alt: "Ciro woodworking detail", project: "main-ridge", type: "image" },
  { id: 7, src: mainRidgeCiroWoodwork3, alt: "Timber craftsmanship", project: "main-ridge", type: "image" },
  { id: 8, src: mainRidgeCiroWoodwork4, alt: "Hand-crafted timber work", project: "main-ridge", type: "image" },

  // Aberdeen Farm
  { id: 10, src: aberdeenBarnInterior, alt: "Aberdeen barn interior with chandeliers", project: "aberdeen", type: "image" },
  { id: 11, src: aberdeenStalls, alt: "Aberdeen luxury stalls", project: "aberdeen", type: "image" },
  { id: 12, src: aberdeenStallsDetail, alt: "Aberdeen stall detail", project: "aberdeen", type: "image" },
  { id: 13, src: aberdeenAisle, alt: "Aberdeen barn aisle", project: "aberdeen", type: "image" },
  { id: 14, src: aberdeenMural, alt: "Aberdeen decorative mural", project: "aberdeen", type: "image" },
  { id: 15, src: aberdeenMural2, alt: "Aberdeen mural detail", project: "aberdeen", type: "image" },
  { id: 16, src: aberdeenStonework, alt: "Aberdeen stonework", project: "aberdeen", type: "image" },
  { id: 17, src: aberdeenStoneworkColor, alt: "Aberdeen colored stonework", project: "aberdeen", type: "image" },
  { id: 18, src: aberdeenStoneworkBw, alt: "Aberdeen stonework architectural", project: "aberdeen", type: "image" },
  { id: 19, src: aberdeenInteriorStonework, alt: "Aberdeen interior stone detail", project: "aberdeen", type: "image" },
  { id: 20, src: aberdeenDeck, alt: "Aberdeen deck construction", project: "aberdeen", type: "image" },
  { id: 21, src: aberdeenExterior, alt: "Aberdeen exterior view", project: "aberdeen", type: "image" },

  // Queensland Facility
  { id: 30, src: qldAerial1, alt: "Queensland facility aerial view", project: "queensland", type: "image" },
  { id: 31, src: qldAerial2, alt: "Queensland facility from above", project: "queensland", type: "image" },
  { id: 32, src: qldExterior1, alt: "Queensland facility exterior", project: "queensland", type: "image" },
  { id: 33, src: qldExterior2, alt: "Queensland barn exterior", project: "queensland", type: "image" },
  { id: 34, src: qldExterior3, alt: "Queensland facility buildings", project: "queensland", type: "image" },
  { id: 35, src: qldCourtyard, alt: "Queensland courtyard", project: "queensland", type: "image" },
  { id: 36, src: qldStalls, alt: "Queensland stalls interior", project: "queensland", type: "image" },
  { id: 37, src: qldConstruction, alt: "Queensland facility under construction", project: "queensland", type: "image" },

  // Equitana Melbourne
  { id: 40, src: equitanaArena1, alt: "Equitana Melbourne arena", project: "equitana", type: "image" },
  { id: 41, src: equitanaArena2, alt: "Equitana arena preparation", project: "equitana", type: "image" },
  { id: 42, src: equitanaArena3, alt: "Equitana competition arena", project: "equitana", type: "image" },
  { id: 43, src: equitanaArena4, alt: "Equitana arena surface", project: "equitana", type: "image" },
  { id: 44, src: equitanaArena5, alt: "Equitana arena detail", project: "equitana", type: "image" },
  { id: 45, src: equitanaArena6, alt: "Equitana arena wide shot", project: "equitana", type: "image" },
  { id: 46, src: equitanaEquipment, alt: "Equitana preparation equipment", project: "equitana", type: "image" },
  { id: 47, src: equitanaTractors, alt: "Equitana tractors at work", project: "equitana", type: "image" },

  // Melbourne Cup / Caulfield
  { id: 50, src: caulfieldEvent, alt: "Melbourne Cup at Caulfield", project: "caulfield", type: "image" },
  { id: 51, src: arenaSandPrep1, alt: "Arena sand preparation", project: "caulfield", type: "image" },
  { id: 52, src: arenaSandPrep2, alt: "Sand grading in progress", project: "caulfield", type: "image" },
  { id: 53, src: arenaSandPrep3, alt: "Professional arena surface", project: "caulfield", type: "image" },

  // Main Ridge Construction Process
  { id: 60, src: mainRidgeTimberPosts, alt: "Main Ridge timber post installation", project: "main-ridge", type: "image" },
  { id: 61, src: mainRidgeBarnFrame, alt: "Main Ridge barn framing structure", project: "main-ridge", type: "image" },
  { id: 62, src: mainRidgeCraneLift, alt: "Main Ridge crane lifting timber frame", project: "main-ridge", type: "image" },
  { id: 63, src: mainRidgeFrameTrench, alt: "Main Ridge frame and foundation trench", project: "main-ridge", type: "image" },
  { id: 64, src: mainRidgeRebarFoundation, alt: "Main Ridge rebar foundation preparation", project: "main-ridge", type: "image" },
  { id: 65, src: mainRidgePostDepth, alt: "Main Ridge post depth measurement", project: "main-ridge", type: "image" },
  { id: 66, src: mainRidgeTrenchUtilities, alt: "Main Ridge utility trench excavation", project: "main-ridge", type: "image" },
  { id: 67, src: mainRidgeArenaGrading, alt: "Main Ridge arena grading", project: "main-ridge", type: "image" },
];

function PageHeader() {
  return (
    <section className="pt-32 pb-16 bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="max-w-3xl">
          <div className="w-16 h-0.5 bg-accent mb-6" />
          <h1 className="heading-display mb-6">Our Work</h1>
          <p className="text-lg text-primary-foreground/80">
            Explore our portfolio of premium equine facilities, from luxurious barns 
            to competition arenas at Australia's biggest events.
          </p>
        </div>
      </div>
    </section>
  );
}

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
    <section 
      ref={ref}
      className="py-16 bg-card"
    >
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
    </section>
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
    <section className="py-20 bg-background">
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
    </section>
  );
}

function Lightbox({
  item,
  onClose,
}: {
  item: GalleryItem | null;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (item?.type === "video" && videoRef.current) {
      videoRef.current.play();
    }
  }, [item]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 text-primary-foreground/80 hover:text-primary-foreground z-10"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="h-8 w-8" />
      </button>
      <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
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
          <img
            src={item.src}
            alt={item.alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
          />
        )}
        <p className="text-center text-primary-foreground/70 mt-4 text-sm">
          {item.alt}
        </p>
      </div>
    </div>
  );
}

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

  useEffect(() => {
    if (isVisible) {
      items.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems((prev) => new Set(prev).add(index));
        }, index * 50);
      });
    }
  }, [isVisible, items.length]);

  useEffect(() => {
    setVisibleItems(new Set());
  }, [items]);

  return (
    <div 
      ref={ref}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item)}
          className={`group aspect-square overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-muted relative transition-all duration-500 ${
            visibleItems.has(index)
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
          }`}
          style={{ transitionDelay: `${index * 30}ms` }}
        >
          <img
            src={item.type === "video" ? (item.thumbnail || item.src) : item.src}
            alt={item.alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {item.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/30 group-hover:bg-primary/40 transition-colors">
              <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-accent-foreground ml-1" fill="currentColor" />
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export default function Gallery() {
  const [activeProject, setActiveProject] = useState("all");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const filteredItems =
    activeProject === "all"
      ? galleryItems
      : activeProject === "videos"
      ? galleryItems.filter((item) => item.type === "video")
      : galleryItems.filter((item) => item.project === activeProject);

  const currentProjectName = projects.find((p) => p.id === activeProject)?.name || "All Projects";
  const videoCount = filteredItems.filter(i => i.type === "video").length;
  const imageCount = filteredItems.filter(i => i.type === "image").length;

  return (
    <Layout>
      <PageHeader />
      
      {/* Featured Video Section */}
      <FeaturedVideoSection onVideoClick={setLightboxItem} />
      
      {/* Video Gallery Section */}
      <VideoGallerySection onVideoClick={setLightboxItem} />

      {/* Photo Gallery Section */}
      <section className="section-padding">
        <div className="section-container">
          {/* Project Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeProject === project.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>

          {/* Project Title */}
          {activeProject !== "all" && (
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl text-foreground">{currentProjectName}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {imageCount > 0 && `${imageCount} photo${imageCount !== 1 ? "s" : ""}`}
                {imageCount > 0 && videoCount > 0 && " · "}
                {videoCount > 0 && `${videoCount} video${videoCount !== 1 ? "s" : ""}`}
              </p>
            </div>
          )}

          {/* Gallery Grid */}
          <GalleryGrid 
            items={filteredItems} 
            onItemClick={setLightboxItem}
            key={activeProject}
          />

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No media in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-card">
        <div className="section-container text-center">
          <h2 className="heading-section text-foreground mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            These projects represent our commitment to excellence. Let's discuss 
            how we can bring your vision to life.
          </p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/contact">
              Get in Touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </Layout>
  );
}
