import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type GalleryImage = {
  id: number;
  src: string;
  alt: string;
  project: string;
};

const projects = [
  { id: "all", name: "All Projects" },
  { id: "main-ridge", name: "Main Ridge" },
  { id: "aberdeen", name: "Aberdeen Farm" },
  { id: "queensland", name: "Queensland Facility" },
  { id: "equitana", name: "Equitana Melbourne" },
  { id: "caulfield", name: "Melbourne Cup" },
];

const galleryImages: GalleryImage[] = [
  // Main Ridge
  { id: 1, src: mainRidgeBrickwork, alt: "Main Ridge brickwork detail", project: "main-ridge" },
  { id: 2, src: mainRidgeInterior, alt: "Main Ridge barn interior", project: "main-ridge" },
  { id: 3, src: mainRidgeTimber, alt: "Main Ridge timber framing", project: "main-ridge" },
  { id: 4, src: mainRidgeWorker, alt: "Craftsman at work on Main Ridge", project: "main-ridge" },
  { id: 5, src: mainRidgeCiroWoodwork1, alt: "Ciro working timber at Main Ridge", project: "main-ridge" },
  { id: 6, src: mainRidgeCiroWoodwork2, alt: "Ciro woodworking detail", project: "main-ridge" },
  { id: 7, src: mainRidgeCiroWoodwork3, alt: "Timber craftsmanship", project: "main-ridge" },
  { id: 8, src: mainRidgeCiroWoodwork4, alt: "Hand-crafted timber work", project: "main-ridge" },

  // Aberdeen Farm
  { id: 10, src: aberdeenBarnInterior, alt: "Aberdeen barn interior with chandeliers", project: "aberdeen" },
  { id: 11, src: aberdeenStalls, alt: "Aberdeen luxury stalls", project: "aberdeen" },
  { id: 12, src: aberdeenStallsDetail, alt: "Aberdeen stall detail", project: "aberdeen" },
  { id: 13, src: aberdeenAisle, alt: "Aberdeen barn aisle", project: "aberdeen" },
  { id: 14, src: aberdeenMural, alt: "Aberdeen decorative mural", project: "aberdeen" },
  { id: 15, src: aberdeenMural2, alt: "Aberdeen mural detail", project: "aberdeen" },
  { id: 16, src: aberdeenStonework, alt: "Aberdeen stonework", project: "aberdeen" },
  { id: 17, src: aberdeenStoneworkColor, alt: "Aberdeen colored stonework", project: "aberdeen" },
  { id: 18, src: aberdeenStoneworkBw, alt: "Aberdeen stonework architectural", project: "aberdeen" },
  { id: 19, src: aberdeenInteriorStonework, alt: "Aberdeen interior stone detail", project: "aberdeen" },
  { id: 20, src: aberdeenDeck, alt: "Aberdeen deck construction", project: "aberdeen" },
  { id: 21, src: aberdeenExterior, alt: "Aberdeen exterior view", project: "aberdeen" },

  // Queensland Facility
  { id: 30, src: qldAerial1, alt: "Queensland facility aerial view", project: "queensland" },
  { id: 31, src: qldAerial2, alt: "Queensland facility from above", project: "queensland" },
  { id: 32, src: qldExterior1, alt: "Queensland facility exterior", project: "queensland" },
  { id: 33, src: qldExterior2, alt: "Queensland barn exterior", project: "queensland" },
  { id: 34, src: qldExterior3, alt: "Queensland facility buildings", project: "queensland" },
  { id: 35, src: qldCourtyard, alt: "Queensland courtyard", project: "queensland" },
  { id: 36, src: qldStalls, alt: "Queensland stalls interior", project: "queensland" },
  { id: 37, src: qldConstruction, alt: "Queensland facility under construction", project: "queensland" },

  // Equitana Melbourne
  { id: 40, src: equitanaArena1, alt: "Equitana Melbourne arena", project: "equitana" },
  { id: 41, src: equitanaArena2, alt: "Equitana arena preparation", project: "equitana" },
  { id: 42, src: equitanaArena3, alt: "Equitana competition arena", project: "equitana" },
  { id: 43, src: equitanaArena4, alt: "Equitana arena surface", project: "equitana" },
  { id: 44, src: equitanaArena5, alt: "Equitana arena detail", project: "equitana" },
  { id: 45, src: equitanaArena6, alt: "Equitana arena wide shot", project: "equitana" },
  { id: 46, src: equitanaEquipment, alt: "Equitana preparation equipment", project: "equitana" },
  { id: 47, src: equitanaTractors, alt: "Equitana tractors at work", project: "equitana" },

  // Melbourne Cup / Caulfield
  { id: 50, src: caulfieldEvent, alt: "Melbourne Cup at Caulfield", project: "caulfield" },
  { id: 51, src: arenaSandPrep1, alt: "Arena sand preparation", project: "caulfield" },
  { id: 52, src: arenaSandPrep2, alt: "Sand grading in progress", project: "caulfield" },
  { id: 53, src: arenaSandPrep3, alt: "Professional arena surface", project: "caulfield" },

  // Main Ridge Construction Process
  { id: 60, src: mainRidgeTimberPosts, alt: "Main Ridge timber post installation", project: "main-ridge" },
  { id: 61, src: mainRidgeBarnFrame, alt: "Main Ridge barn framing structure", project: "main-ridge" },
  { id: 62, src: mainRidgeCraneLift, alt: "Main Ridge crane lifting timber frame", project: "main-ridge" },
  { id: 63, src: mainRidgeFrameTrench, alt: "Main Ridge frame and foundation trench", project: "main-ridge" },
  { id: 64, src: mainRidgeRebarFoundation, alt: "Main Ridge rebar foundation preparation", project: "main-ridge" },
  { id: 65, src: mainRidgePostDepth, alt: "Main Ridge post depth measurement", project: "main-ridge" },
  { id: 66, src: mainRidgeTrenchUtilities, alt: "Main Ridge utility trench excavation", project: "main-ridge" },
  { id: 67, src: mainRidgeArenaGrading, alt: "Main Ridge arena grading", project: "main-ridge" },
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
  image,
  onClose,
}: {
  image: GalleryImage | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 text-primary-foreground/80 hover:text-primary-foreground"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="h-8 w-8" />
      </button>
      <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={image.src}
          alt={image.alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
        />
        <p className="text-center text-primary-foreground/70 mt-4 text-sm">
          {image.alt}
        </p>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [activeProject, setActiveProject] = useState("all");
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const filteredImages =
    activeProject === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.project === activeProject);

  const currentProjectName = projects.find((p) => p.id === activeProject)?.name || "All Projects";

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
                {filteredImages.length} {filteredImages.length === 1 ? "photo" : "photos"}
              </p>
            </div>
          )}

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredImages.map((image) => (
              <button
                key={image.id}
                onClick={() => setLightboxImage(image)}
                className="group aspect-square overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-muted"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredImages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No photos in this category yet.</p>
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
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </Layout>
  );
}
