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
import { ProjectsCinematicHero } from "@/components/ProjectsCinematicHero";
import { ExperienceTheBuild } from "@/components/ExperienceTheBuild";

import { ViewingLine } from "@/components/ViewingLine";
import { ProjectQualification, type ProjectType } from "@/components/ProjectQualification";
import { BuildOptions } from "@/components/BuildOptions";
import { GuidedEnquiryFlow } from "@/components/GuidedEnquiryFlow";

// ── Project imagery (hero + optional supporting per project) ──
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";
import steelShedDramatic from "@/assets/steel-shed-dramatic.webp";
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
          className={`absolute inset-0 w-full h-full object-cover will-change-transform img-gallery ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ transition: `opacity ${DURATION.slow}ms ${EASE.default}, transform ${DURATION.parallax}ms ${EASE.default}` }}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLImageElement).style.transform = "scale(1.03)"; }}
          onMouseLeave={(e) => { if (onClick) (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
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
          transition: `transform ${DURATION.parallax}ms ${EASE.default} 100ms, opacity ${DURATION.normal}ms ${EASE.default} 100ms`,
          willChange: "transform, opacity",
        }}
      />
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
  const [enquiryType, setEnquiryType] = useState<ProjectType | null>(null);

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
      {/* Global architectural texture — felt, not seen */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-0 grain-texture" style={{ opacity: 0.6 }} />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, hsl(var(--background) / 0.04) 100%)",
            mixBlendMode: "multiply",
          }}
        />
      </div>
      {/* ═══════════════════════════════════════════════════
          1. HERO — cinematic blueprint with gold linework
          ═══════════════════════════════════════════════════ */}
      <ProjectsCinematicHero />


      {/* ═══════════════════════════════════════════════════
          2. EXPERIENCE THE BUILD — unified Main Ridge journey
          ═══════════════════════════════════════════════════ */}
      <ExperienceTheBuild />

      <ChapterDivider />


      {/* ═══════════════════════════════════════════════════
          SELECTED WORK — curated project blocks
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-32 sm:py-40 lg:py-48 relative">
          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up" duration={DURATION.normal}>
              <div className="mb-20 sm:mb-28 lg:mb-32">
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-8 h-px bg-accent/25" />
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">
                    Selected Work
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            {/* ── Project 1: Private Client ── */}
            <div className="mb-32 sm:mb-40 lg:mb-48">
              <RevealOnScroll direction="up" duration={DURATION.normal}>
                <EditorialImage
                  src={aberdeenBarnInterior}
                  alt="Private Client — luxury barn interior"
                  aspect="aspect-[16/10]"
                  onClick={() => openLightbox(aberdeenBarnInterior)}
                />
                <div className="mt-6 sm:mt-8">
                  <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/25 mb-2">Private Client</p>
                  <p className="font-serif text-[13px] sm:text-sm text-foreground/25 italic">Stonework, stalls, and timber throughout.</p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll direction="up" duration={DURATION.slow} delay={200}>
                <div className="mt-8 sm:mt-10 max-w-2xl">
                  <EditorialImage
                    src={aberdeenExterior}
                    alt="Private Client — completed exterior"
                    aspect="aspect-[16/10]"
                    onClick={() => openLightbox(aberdeenExterior)}
                  />
                </div>
              </RevealOnScroll>
            </div>

            {/* ── Project 2: Custom Steel ── */}
            <div className="mb-32 sm:mb-40 lg:mb-48">
              <RevealOnScroll direction="up" duration={DURATION.normal}>
                <EditorialImage
                  src={steelShedDramatic}
                  alt="Custom colorbond barn"
                  aspect="aspect-[16/10]"
                  onClick={() => openLightbox(steelShedDramatic)}
                />
                <div className="mt-6 sm:mt-8">
                  <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/25 mb-2">Custom Build</p>
                  <p className="font-serif text-[13px] sm:text-sm text-foreground/25 italic">Steel structure, resolved to brief.</p>
                </div>
              </RevealOnScroll>
            </div>

            {/* ── Project 3: Craft Detail ── */}
            <div>
              <RevealOnScroll direction="up" duration={DURATION.normal}>
                <EditorialImage
                  src={aberdeenStonework}
                  alt="Hand-laid natural stonework detail"
                  aspect="aspect-[21/9]"
                  onClick={() => openLightbox(aberdeenStonework)}
                />
                <div className="mt-6 sm:mt-8">
                  <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/25 mb-2">Craft Detail</p>
                  <p className="font-serif text-[13px] sm:text-sm text-foreground/25 italic">Hand-laid stone. No shortcuts.</p>
                </div>
              </RevealOnScroll>
            </div>

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
            <RevealOnScroll direction="up" duration={DURATION.normal}>
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
              <RevealOnScroll direction="up" duration={DURATION.normal}>
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
          10. PROJECT QUALIFICATION — guided intake selector
          ═══════════════════════════════════════════════════ */}
      <ProjectQualification onSelect={(type) => setEnquiryType(type)} />

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          10b. BUILD OPTIONS — tiered positioning
          ═══════════════════════════════════════════════════ */}
      <BuildOptions onSelect={() => setEnquiryType("full-property")} />

      <ChapterDivider />

      {/* ─── Bridge to GroundLock ─── */}
      <section className="relative overflow-hidden">
        <div className="py-12 sm:py-16 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container max-w-lg mx-auto text-center relative z-[1]">
            <p className="font-serif text-[13px] sm:text-sm text-muted-foreground/25 italic leading-relaxed">
              What sits underneath every project determines how it performs.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          11. THE VIEWING LINE — cinematic closer / sole CTA
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

      {/* Guided Enquiry Overlay */}
      {enquiryType && (
        <GuidedEnquiryFlow
          projectType={enquiryType}
          onClose={() => setEnquiryType(null)}
        />
      )}
    </Layout>
  );
}
