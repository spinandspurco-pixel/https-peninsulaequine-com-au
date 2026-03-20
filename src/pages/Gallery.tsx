import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { ArrowRight, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useParallax } from "@/hooks/useParallax";

// Hero & feature images
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import qldAerial1 from "@/assets/qld-facility-aerial-1.jpg";
import qldExterior1 from "@/assets/qld-facility-exterior-1.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";
import mainRidgeInterior from "@/assets/main-ridge-interior.jpg";
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import mainRidgeTimber from "@/assets/main-ridge-timber.jpg";
import mainRidgeWorker from "@/assets/main-ridge-worker.jpg";
import mainRidgeCraneLift from "@/assets/main-ridge-crane-lift.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import aberdeenStonework from "@/assets/aberdeen-stonework.jpg";
import aberdeenAisle from "@/assets/aberdeen-aisle.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";
import aberdeenStoneworkColor from "@/assets/aberdeen-stonework-color.jpg";
import aberdeenInteriorStonework from "@/assets/aberdeen-interior-stonework.jpg";
import aberdeenStallsDetail from "@/assets/aberdeen-stalls-detail.jpg";
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import equitanaArena3 from "@/assets/equitana-arena-3.jpg";
import equitanaArena5 from "@/assets/equitana-arena-5.jpg";
import arenaSandPrep1 from "@/assets/arena-sand-prep-1.jpg";
import arenaSandPrep3 from "@/assets/arena-sand-prep-3.jpg";
import mainRidgeRebarFoundation from "@/assets/main-ridge-rebar-foundation.jpg";
import mainRidgeArenaGrading from "@/assets/main-ridge-arena-grading.jpg";

import {
  type GalleryItem,
  galleryItems,
  allVideos,
} from "./gallery/galleryData";
import { GalleryLightbox } from "./gallery/GalleryLightbox";
import { GalleryGrid } from "./gallery/GalleryGrid";
import { GalleryFilters } from "./gallery/GalleryFilters";

/* ────────────────────────────────────────────────────────
   EDITORIAL IMAGE — reusable cinematic image with hover
   ──────────────────────────────────────────────────────── */
function EditorialImage({
  src,
  alt,
  className = "",
  aspect = "aspect-[4/3]",
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  aspect?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden bg-muted/20 ${aspect} ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.03] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}
      {/* Subtle hover overlay */}
      {onClick && (
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   MAIN GALLERY PAGE
   ──────────────────────────────────────────────────────── */
export default function Gallery() {
  const { isAdmin } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [activeProject, setActiveProject] = useState("all");
  const [activeService, setActiveService] = useState("all");
  const [activeLocation, setActiveLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement>();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const heroRef = useRef<HTMLDivElement>(null);
  const parallax = useParallax<HTMLDivElement>({ speed: 0.25 });

  const videoGalleryItems: GalleryItem[] = allVideos.map((v) => ({
    id: v.id, src: v.src, alt: v.alt, project: v.project, type: v.type,
    thumbnail: v.thumbnail, service: v.service, location: v.location,
  }));

  const allNavigableItems: GalleryItem[] = useMemo(() => [
    ...galleryItems,
    ...videoGalleryItems,
  ], [videoGalleryItems]);

  const filteredItems = useMemo(() => {
    let items: GalleryItem[] =
      activeProject === "all" ? [...galleryItems, ...videoGalleryItems]
        : galleryItems.filter((item) => item.project === activeProject)
          .concat(videoGalleryItems.filter((item) => item.project === activeProject));
    if (activeService !== "all") items = items.filter((item) => item.service === activeService);
    if (activeLocation !== "all") items = items.filter((item) => item.location === activeLocation);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter((item) =>
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

  const isFiltered = activeProject !== "all" || activeService !== "all" || activeLocation !== "all" || searchQuery.trim() !== "";

  useEffect(() => { setSelectedIds(new Set()); }, [activeProject, activeService, activeLocation, searchQuery]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const clearAllFilters = () => {
    setActiveProject("all"); setActiveService("all"); setActiveLocation("all"); setSearchQuery("");
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault(); setShowFilters(true); setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const currentIndex = lightboxItem ? allNavigableItems.findIndex((item) => item.id === lightboxItem.id) : -1;
  const handlePrevious = () => { if (currentIndex > 0) setLightboxItem(allNavigableItems[currentIndex - 1]); };
  const handleNext = () => { if (currentIndex < allNavigableItems.length - 1) setLightboxItem(allNavigableItems[currentIndex + 1]); };

  const videoCount = filteredItems.filter((i) => i.type === "video").length;
  const imageCount = filteredItems.filter((i) => i.type === "image").length;

  // Find gallery item by src for lightbox
  const openLightbox = (src: string) => {
    const item = allNavigableItems.find(i => i.src === src);
    if (item) setLightboxItem(item);
  };

  return (
    <Layout>
      {/* ═══════════════════════════════════════════════════
          1. HERO — full-width cinematic with parallax
          ═══════════════════════════════════════════════════ */}
      <section className="relative h-[85vh] sm:h-[90vh] overflow-hidden">
        <div
          ref={parallax.ref}
          className="absolute inset-0 scale-110"
          style={{ transform: `translateY(${parallax.offset * 0.4}px) scale(1.1)` }}
        >
          <img
            src={qldAerial1}
            alt="Queensland equine facility — aerial view"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />

        {/* Hero text */}
        <div className="absolute inset-0 flex items-end z-10">
          <div className="section-container pb-16 sm:pb-24 lg:pb-28 max-w-3xl">
            <RevealOnScroll direction="up" duration={800}>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/50 font-mono mb-4 sm:mb-5">
                Portfolio
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={900} delay={100}>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-foreground font-medium leading-[1.08] tracking-[0.03em] mb-5 sm:mb-6">
                Projects
              </h1>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={800} delay={200}>
              <p className="text-sm sm:text-base text-muted-foreground/40 leading-relaxed max-w-md font-serif italic">
                Built with precision. Designed to last.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          2. FEATURE PROJECT — Aberdeen Farm (70/30 split)
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-20 sm:py-28 lg:py-36 relative">
          <div className="section-container-wide relative z-[1]">
            <RevealOnScroll direction="up" duration={700}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
                {/* Large image — 70% */}
                <div className="lg:col-span-8">
                  <EditorialImage
                    src={aberdeenBarnInterior}
                    alt="Aberdeen Farm — luxury barn interior"
                    aspect="aspect-[16/10]"
                    onClick={() => openLightbox(aberdeenBarnInterior)}
                  />
                </div>
                {/* Project details — 30% */}
                <div className="lg:col-span-4 py-4 lg:py-8">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-accent/40 font-mono mb-4">
                    Featured Project
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl text-foreground/90 font-normal tracking-[0.02em] mb-4">
                    Aberdeen Farm
                  </h2>
                  <div className="w-10 h-px bg-accent/30 mb-6" />
                  <dl className="space-y-3 mb-8">
                    <div>
                      <dt className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/25 font-mono">Location</dt>
                      <dd className="text-sm text-muted-foreground/50 mt-0.5">Mornington Peninsula, Victoria</dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/25 font-mono">Scope</dt>
                      <dd className="text-sm text-muted-foreground/50 mt-0.5">Stables, stonework, timber joinery, arena</dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/25 font-mono">Duration</dt>
                      <dd className="text-sm text-muted-foreground/50 mt-0.5">Full facility build</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-muted-foreground/30 leading-[1.8] font-serif italic">
                    Premium equine facility featuring hand-laid stonework, bespoke stall systems, and architectural timber detailing throughout.
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          3. EDITORIAL GRID — asymmetric, mixed sizes
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="pb-20 sm:pb-28 lg:pb-36 relative">
          <div className="section-container-wide relative z-[1]">
            {/* Row 1 — 3 images: large left, two stacked right */}
            <RevealOnScroll direction="up" duration={800}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div className="lg:col-span-7">
                  <EditorialImage
                    src={mainRidgeInterior}
                    alt="Main Ridge — open barn interior"
                    aspect="aspect-[4/3]"
                    onClick={() => openLightbox(mainRidgeInterior)}
                  />
                </div>
                <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
                  <EditorialImage
                    src={aberdeenStalls}
                    alt="Aberdeen Farm — custom stalls"
                    aspect="aspect-[16/10]"
                    onClick={() => openLightbox(aberdeenStalls)}
                  />
                  <EditorialImage
                    src={mainRidgeBrickwork}
                    alt="Main Ridge — reclaimed brickwork"
                    aspect="aspect-[16/10]"
                    onClick={() => openLightbox(mainRidgeBrickwork)}
                  />
                </div>
              </div>
            </RevealOnScroll>

            {/* Row 2 — offset pair with negative margin overlap */}
            <RevealOnScroll direction="up" duration={700} delay={80}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div className="lg:col-span-5 lg:mt-8">
                  <EditorialImage
                    src={aberdeenStonework}
                    alt="Aberdeen Farm — stonework masonry"
                    aspect="aspect-[3/4]"
                    onClick={() => openLightbox(aberdeenStonework)}
                  />
                </div>
                <div className="lg:col-span-7 lg:-mt-6">
                  <EditorialImage
                    src={equitanaArena5}
                    alt="Equitana Melbourne — competition arena"
                    aspect="aspect-[16/9]"
                    onClick={() => openLightbox(equitanaArena5)}
                  />
                </div>
              </div>
            </RevealOnScroll>

            {/* Row 3 — three equal with generous gap */}
            <RevealOnScroll direction="up" duration={700} delay={120}>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <EditorialImage
                  src={qldExterior1}
                  alt="Queensland — barn exterior"
                  aspect="aspect-[4/3]"
                  onClick={() => openLightbox(qldExterior1)}
                />
                <EditorialImage
                  src={mainRidgeTimber}
                  alt="Main Ridge — timber beam joinery"
                  aspect="aspect-[4/3]"
                  onClick={() => openLightbox(mainRidgeTimber)}
                />
                <div className="col-span-2 lg:col-span-1">
                  <EditorialImage
                    src={aberdeenAisle}
                    alt="Aberdeen Farm — stone aisle"
                    aspect="aspect-[4/3]"
                    onClick={() => openLightbox(aberdeenAisle)}
                  />
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          4. SYSTEM STRIP — GroundLock feature
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="relative h-[50vh] sm:h-[55vh]">
          <img
            src={arenaSandPrep3}
            alt="GroundLock ground stabilisation system"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center max-w-lg px-6">
              <RevealOnScroll direction="up" duration={800}>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/40 font-mono mb-4">
                  Proprietary System
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/90 font-normal tracking-[0.03em] mb-4">
                  GroundLock™
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground/30 leading-relaxed font-serif italic">
                  Interlocking ground stabilisation engineered for equine performance surfaces.
                </p>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          5. PROJECT BLOCKS — alternating left/right
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-20 sm:py-28 lg:py-36 relative">
          <div className="section-container-wide relative z-[1] space-y-16 sm:space-y-24 lg:space-y-32">

            {/* Block A — Main Ridge: image left, text right */}
            <RevealOnScroll direction="up" duration={800}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-7">
                  <EditorialImage
                    src={mainRidgeBarnFrame}
                    alt="Main Ridge — timber frame structure"
                    aspect="aspect-[16/10]"
                    onClick={() => openLightbox(mainRidgeBarnFrame)}
                  />
                </div>
                <div className="lg:col-span-5">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-accent/40 font-mono mb-3">Main Ridge</p>
                  <h3 className="font-serif text-xl sm:text-2xl text-foreground/80 font-normal tracking-[0.02em] mb-3">
                    Barn & Arena Complex
                  </h3>
                  <div className="w-8 h-px bg-accent/25 mb-5" />
                  <p className="text-xs text-muted-foreground/30 leading-[1.9]">
                    Full facility construction including timber-framed barn, competition arena, drainage systems, and hand-crafted stonework detailing. Mornington Peninsula, Victoria.
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            {/* Block B — Queensland: text left, image right */}
            <RevealOnScroll direction="up" duration={800}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-5 order-2 lg:order-1">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-accent/40 font-mono mb-3">Queensland Facility</p>
                  <h3 className="font-serif text-xl sm:text-2xl text-foreground/80 font-normal tracking-[0.02em] mb-3">
                    Multi-Structure Complex
                  </h3>
                  <div className="w-8 h-px bg-accent/25 mb-5" />
                  <p className="text-xs text-muted-foreground/30 leading-[1.9]">
                    Large-scale equine facility featuring multiple barns, covered walkways, climate-controlled stalls, and integrated paddock systems. Queensland.
                  </p>
                </div>
                <div className="lg:col-span-7 order-1 lg:order-2">
                  <EditorialImage
                    src={qldCourtyard}
                    alt="Queensland — central courtyard"
                    aspect="aspect-[16/10]"
                    onClick={() => openLightbox(qldCourtyard)}
                  />
                </div>
              </div>
            </RevealOnScroll>

            {/* Block C — Equitana: image left, text right */}
            <RevealOnScroll direction="up" duration={800}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-7">
                  <EditorialImage
                    src={equitanaArena3}
                    alt="Equitana Melbourne — competition arena"
                    aspect="aspect-[16/10]"
                    onClick={() => openLightbox(equitanaArena3)}
                  />
                </div>
                <div className="lg:col-span-5">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-accent/40 font-mono mb-3">Equitana Melbourne</p>
                  <h3 className="font-serif text-xl sm:text-2xl text-foreground/80 font-normal tracking-[0.02em] mb-3">
                    Competition Infrastructure
                  </h3>
                  <div className="w-8 h-px bg-accent/25 mb-5" />
                  <p className="text-xs text-muted-foreground/30 leading-[1.9]">
                    Full arena preparation and surface engineering for Australia's premier equine event. Melbourne, Victoria.
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          6. DETAIL STRIP — texture-focused, no text
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <RevealOnScroll direction="up" duration={700}>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6">
            {[
              { src: aberdeenStallsDetail, alt: "Stall ironwork detail" },
              { src: mainRidgeRebarFoundation, alt: "Rebar foundation detail" },
              { src: aberdeenStoneworkColor, alt: "Stonework colour detail" },
              { src: aberdeenInteriorStonework, alt: "Interior stone feature" },
              { src: mainRidgeArenaGrading, alt: "Arena grading detail" },
              { src: mainRidgeWorker, alt: "On-site craftsmanship" },
            ].map((img, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden group cursor-pointer"
                onClick={() => openLightbox(img.src)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-background/10 group-hover:bg-transparent transition-colors duration-700" />
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* ═══════════════════════════════════════════════════
          7. BROWSE ALL — expandable filter grid
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-20 sm:py-28 relative">
          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up" duration={600}>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground/20 font-mono mb-2">
                    Complete Archive
                  </p>
                  <h2 className="font-serif text-xl sm:text-2xl text-foreground/80 font-normal tracking-[0.02em]">
                    Browse All Work
                  </h2>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-accent/60 transition-colors duration-500"
                >
                  <Filter className="w-3.5 h-3.5" />
                  {showFilters ? "Hide Filters" : "Filter"}
                </button>
              </div>
            </RevealOnScroll>

            {showFilters && (
              <RevealOnScroll direction="up" duration={500}>
                <GalleryFilters
                  activeProject={activeProject}
                  setActiveProject={setActiveProject}
                  activeService={activeService}
                  setActiveService={setActiveService}
                  activeLocation={activeLocation}
                  setActiveLocation={setActiveLocation}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchInputRef={searchInputRef}
                  activeFilterCount={activeFilterCount}
                  clearAllFilters={clearAllFilters}
                  imageCount={imageCount}
                  videoCount={videoCount}
                  totalCount={filteredItems.length}
                />
              </RevealOnScroll>
            )}

            <GalleryGrid
              items={filteredItems}
              onItemClick={setLightboxItem}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              isFiltered={true}
              key={`${activeProject}-${activeService}-${activeLocation}-${searchQuery}`}
            />

            {filteredItems.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground/50 mb-4 text-sm">No media matches your filters.</p>
                <button onClick={clearAllFilters} className="text-accent/70 hover:text-accent text-xs uppercase tracking-[0.15em] underline underline-offset-4">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          8. FINAL CTA — cinematic full-width image
          ═══════════════════════════════════════════════════ */}
      <section className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
        <img
          src={aberdeenExterior}
          alt="Aberdeen Farm — completed barn exterior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center max-w-lg px-6">
            <RevealOnScroll direction="up" duration={800}>
              <RevealLine className="mx-auto mb-10" width="w-8" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={900} delay={100}>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground font-medium tracking-[0.03em] mb-6">
                Build it properly.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={800} delay={200}>
              <p className="text-xs sm:text-sm text-muted-foreground/35 mb-10 leading-relaxed">
                Every project begins with a site assessment.<br />
                Let's talk about yours.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={700} delay={300}>
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <GalleryLightbox
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
