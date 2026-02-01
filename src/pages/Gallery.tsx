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

const galleryItems: GalleryItem[] = [
  // Videos first for prominence
  { id: 100, src: slowMo1, alt: "Slow motion equine footage", project: "videos", type: "video", thumbnail: mainRidgeInterior },
  { id: 101, src: slowMo2, alt: "Horse in slow motion", project: "videos", type: "video", thumbnail: mainRidgeTimber },
  { id: 102, src: slowMo3, alt: "Equine slow motion detail", project: "videos", type: "video", thumbnail: mainRidgeBrickwork },
  { id: 103, src: mainRidgeWoodwork1, alt: "Main Ridge woodworking process", project: "main-ridge", type: "video", thumbnail: mainRidgeCiroWoodwork1 },
  { id: 104, src: mainRidgeWoodwork2, alt: "Timber craftsmanship video", project: "main-ridge", type: "video", thumbnail: mainRidgeCiroWoodwork2 },

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
