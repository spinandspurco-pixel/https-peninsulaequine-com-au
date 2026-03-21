import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ArrowRight, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useParallax } from "@/hooks/useParallax";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";
import { Link } from "react-router-dom";
import { useParallax } from "@/hooks/useParallax";
import { ProjectsCinematicHero } from "@/components/ProjectsCinematicHero";
import { InteractiveMasterplan } from "@/components/InteractiveMasterplan";
import { WalkTheProject } from "@/components/WalkTheProject";
import { BuildIntelligence } from "@/components/BuildIntelligence";
import { DetailMatters } from "@/components/DetailMatters";
import { ViewingLine } from "@/components/ViewingLine";

// ── 2. FEATURE PROJECT (Private Client) ──
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import aberdeenAisle from "@/assets/aberdeen-aisle.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";

// ── 3. FINISHED RESULTS ──
import aberdeenDeck from "@/assets/aberdeen-deck.jpg";
import premiumStableFacade from "@/assets/premium-stable-facade.png";
import westernEntertainingZone from "@/assets/western-entertaining-zone.jpg";

// ── 4. CUSTOM BUILDS ──
import steelShedDramatic from "@/assets/steel-shed-dramatic.webp";
import timberCubbyFront from "@/assets/timber-cubby-front.webp";
import aberdeenStonework from "@/assets/aberdeen-stonework.jpg";

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
          className={`absolute inset-0 w-full h-full object-cover will-change-transform ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ transition: `opacity ${DURATION.slow}ms ${EASE.default}, transform ${DURATION.parallax}ms ${EASE.default}` }}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.03)"; }}
          onMouseLeave={(e) => { if (onClick) (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   CHAPTER DIVIDER — subtle vertical pacing line
   ──────────────────────────────────────────────────────── */
function ChapterDivider() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.5 });

  return (
    <div ref={ref} className="relative py-12 sm:py-16 lg:py-20 flex items-center justify-center overflow-hidden">
      <div
        className="w-px h-12 sm:h-16 bg-accent/15 origin-top"
        style={{
          transform: isVisible ? "scaleY(1)" : "scaleY(0)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 800ms cubic-bezier(0.22, 1, 0.36, 1) 100ms, opacity 600ms ease 100ms",
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   SECTION HEADER — consistent label + heading pattern
   ──────────────────────────────────────────────────────── */
function SectionHeader({
  label,
  heading,
  subtitle,
  align = "center",
}: {
  label: string;
  heading: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const isCenter = align === "center";
  return (
    <div className={`${isCenter ? "text-center" : ""} mb-14 sm:mb-18 lg:mb-20`}>
      <div className={`flex items-center gap-5 mb-5 ${isCenter ? "justify-center" : ""}`}>
        <div className="w-8 h-px bg-accent/25" />
        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">
          {label}
        </p>
        {isCenter && <div className="w-8 h-px bg-accent/25" />}
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/90 tracking-[0.03em] leading-tight">
        {heading}
      </h2>
      {subtitle && (
        <p className="mt-4 text-sm text-muted-foreground/35 font-serif italic max-w-md mx-auto">
          {subtitle}
        </p>
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

  const openLightbox = (src: string) => {
    const item = allNavigableItems.find(i => i.src === src);
    if (item) setLightboxItem(item);
  };

  return (
    <Layout>
      {/* ═══════════════════════════════════════════════════
          1. HERO — cinematic blueprint with gold linework
          ═══════════════════════════════════════════════════ */}
      <ProjectsCinematicHero />

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          2. INTERACTIVE MASTERPLAN
          ═══════════════════════════════════════════════════ */}
      <InteractiveMasterplan />

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          3. WALK THE PROJECT — cinematic scroll panels
          ═══════════════════════════════════════════════════ */}
      <WalkTheProject />

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          4. BUILD INTELLIGENCE — interactive layer toggle
          ═══════════════════════════════════════════════════ */}
      <BuildIntelligence />

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          5. DETAIL MATTERS — editorial craftsmanship cards
          ═══════════════════════════════════════════════════ */}
      <DetailMatters />

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          6. FEATURE PROJECT — Private Client
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-28 sm:py-36 lg:py-44 relative">
          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up" duration={700}>
              <SectionHeader label="Featured Project" heading="Private Client — Mornington Peninsula" />

              {/* Hero + details row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start mb-6 sm:mb-8">
                <div className="lg:col-span-8">
                  <EditorialImage
                    src={aberdeenBarnInterior}
                    alt="Private Client — Mornington Peninsula — luxury barn interior"
                    aspect="aspect-[16/10]"
                    onClick={() => openLightbox(aberdeenBarnInterior)}
                  />
                </div>
                <div className="lg:col-span-4 py-2 lg:py-6">
                  <div className="w-10 h-px bg-accent/20 mb-6" />
                  <dl className="space-y-4 mb-8">
                    <div>
                      <dt className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/25 font-mono">Location</dt>
                      <dd className="text-sm text-muted-foreground/50 mt-1">Mornington Peninsula, Victoria</dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/25 font-mono">Scope</dt>
                      <dd className="text-sm text-muted-foreground/50 mt-1">Stables, stonework, timber joinery</dd>
                    </div>
                  </dl>
                  <p className="text-xs text-muted-foreground/30 leading-[1.8] font-serif italic">
                    Premium equine facility featuring hand-laid stonework, bespoke stall systems, and architectural timber detailing throughout.
                  </p>
                </div>
              </div>

              {/* Supporting images — 3 across */}
              <div className="grid grid-cols-3 gap-3 sm:gap-5">
                <EditorialImage src={aberdeenStalls} alt="Private client — custom stalls" aspect="aspect-[4/3]" onClick={() => openLightbox(aberdeenStalls)} />
                <EditorialImage src={aberdeenAisle} alt="Private client — stone aisle" aspect="aspect-[4/3]" onClick={() => openLightbox(aberdeenAisle)} />
                <EditorialImage src={aberdeenExterior} alt="Private client — completed exterior" aspect="aspect-[4/3]" onClick={() => openLightbox(aberdeenExterior)} />
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          7. FINISHED RESULTS — editorial mixed grid
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-28 sm:py-36 lg:py-44 relative">
          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up" duration={700}>
              <SectionHeader label="Completed Work" heading="The Finished Result" />
            </RevealOnScroll>

            {/* Row 1 — wide deck + tall stable facade */}
            <RevealOnScroll direction="up" duration={800}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 mb-3 sm:mb-5">
                <div className="lg:col-span-7">
                  <EditorialImage src={aberdeenDeck} alt="Private client — outdoor deck" aspect="aspect-[4/3]" onClick={() => openLightbox(aberdeenDeck)} />
                </div>
                <div className="lg:col-span-5">
                  <EditorialImage src={premiumStableFacade} alt="Premium stable — architectural facade" aspect="aspect-[3/4]" className="h-full" onClick={() => openLightbox(premiumStableFacade)} />
                </div>
              </div>
            </RevealOnScroll>

            {/* Row 2 — wide arena exterior */}
            <RevealOnScroll direction="up" duration={700} delay={80}>
              <EditorialImage src={westernEntertainingZone} alt="Western entertaining zone — timber and stone" aspect="aspect-[21/9]" onClick={() => openLightbox(westernEntertainingZone)} />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          8. CUSTOM BUILDS — steel sheds & bespoke timber
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-28 sm:py-36 lg:py-44 relative">
          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up" duration={700}>
              <SectionHeader label="Custom Builds" heading="Steel & Timber — Built to Brief" />
            </RevealOnScroll>

            {/* Row 1 — wide steel shed + tall timber cubby */}
            <RevealOnScroll direction="up" duration={800} delay={80}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 mb-3 sm:mb-5">
                <div className="lg:col-span-7">
                  <EditorialImage src={steelShedDramatic} alt="Custom colorbond barn with dramatic sky" aspect="aspect-[16/10]" onClick={() => openLightbox(steelShedDramatic)} />
                </div>
                <div className="lg:col-span-5">
                  <EditorialImage src={timberCubbyFront} alt="Western-style bespoke timber cubby" aspect="aspect-[3/4]" className="h-full" onClick={() => openLightbox(timberCubbyFront)} />
                </div>
              </div>
            </RevealOnScroll>

            {/* Row 2 — craft detail */}
            <RevealOnScroll direction="up" duration={700} delay={120}>
              <EditorialImage src={aberdeenStonework} alt="Aberdeen — hand-laid natural stonework detail" aspect="aspect-[21/9]" onClick={() => openLightbox(aberdeenStonework)} />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          9. BROWSE ALL — expandable filter grid
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-28 sm:py-36 lg:py-44 relative">
          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up" duration={600}>
              <div className="flex items-center justify-between mb-14 sm:mb-18 lg:mb-20">
                <div>
                  <div className="flex items-center gap-5 mb-5">
                    <div className="w-8 h-px bg-accent/25" />
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">
                      Complete Archive
                    </p>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/90 tracking-[0.03em]">
                    Browse All Work
                  </h2>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/35 hover:text-accent/60 transition-colors duration-500"
                >
                  <Filter className="w-3.5 h-3.5" />
                  {showFilters ? "Hide" : "Filter"}
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

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          10. THE VIEWING LINE — cinematic closer / sole CTA
          ═══════════════════════════════════════════════════ */}
      <ViewingLine />

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
