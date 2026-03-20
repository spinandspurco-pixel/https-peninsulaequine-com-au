import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ArrowRight, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useParallax } from "@/hooks/useParallax";

// ── 1. ESTABLISHING / HERO ──
import qldAerial1 from "@/assets/qld-facility-aerial-1.jpg";

// ── 2. FEATURE PROJECT (Aberdeen) ──
import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";
import aberdeenStalls from "@/assets/aberdeen-stalls.jpg";
import aberdeenAisle from "@/assets/aberdeen-aisle.jpg";
import aberdeenStonework from "@/assets/aberdeen-stonework.jpg";
import aberdeenExterior from "@/assets/aberdeen-exterior.jpg";

// ── 3. BUILD PROCESS ──
import mainRidgeRebarFoundation from "@/assets/main-ridge-rebar-foundation.jpg";
import mainRidgeFrameTrench from "@/assets/main-ridge-frame-trench.jpg";
import mainRidgeCraneLift from "@/assets/main-ridge-crane-lift.jpg";
import mainRidgeBarnFrame from "@/assets/main-ridge-barn-frame.jpg";
import mainRidgeTimberPosts from "@/assets/main-ridge-timber-posts.jpg";
import mainRidgePostDepth from "@/assets/main-ridge-post-depth.jpg";
import mainRidgeFrameProgress from "@/assets/main-ridge-frame-progress.jpg";
import mainRidgeFoundationPour from "@/assets/main-ridge-foundation-pour.jpg";
import mainRidgeSitePrep from "@/assets/main-ridge-site-prep.jpg";
import mainRidgeFrameAngle from "@/assets/main-ridge-frame-angle.jpg";
import mainRidgeFrameWide from "@/assets/main-ridge-frame-wide.jpg";

// ── 4. GROUNDLOCK / SYSTEM ──
import arenaSandPrep1 from "@/assets/arena-sand-prep-1.jpg";
import arenaSandPrep3 from "@/assets/arena-sand-prep-3.jpg";
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import mainRidgeArenaGrading from "@/assets/main-ridge-arena-grading.jpg";

// ── 5. EDITORIAL / FINISHED RESULTS ──
import aberdeenDeck from "@/assets/aberdeen-deck.jpg";
import stoneworkStables2 from "@/assets/stonework-stables-2.jpg";
import qldExterior3 from "@/assets/qld-facility-exterior-3.jpg";
import qldExterior1 from "@/assets/qld-facility-exterior-1.jpg";
import qldCourtyard from "@/assets/qld-facility-courtyard.jpg";
import equitanaArena3 from "@/assets/equitana-arena-3.jpg";
import equitanaArena5 from "@/assets/equitana-arena-5.jpg";
import equitanaArena6 from "@/assets/equitana-arena-6.jpg";

// ── 6. DETAIL / CRAFT ──
import aberdeenStallsDetail from "@/assets/aberdeen-stalls-detail.jpg";
import mainRidgeBrickwork from "@/assets/main-ridge-brickwork.jpg";
import aberdeenInteriorStonework from "@/assets/aberdeen-interior-stonework.jpg";
import mainRidgeWorker from "@/assets/main-ridge-worker.jpg";
import mainRidgeCiroWoodwork1 from "@/assets/main-ridge-ciro-woodwork-1.jpg";
import mainRidgeCiroWoodwork3 from "@/assets/main-ridge-ciro-woodwork-3.jpg";

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
   CHAPTER DIVIDER — subtle vertical pacing line
   ──────────────────────────────────────────────────────── */
function ChapterDivider() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.5 });

  return (
    <div ref={ref} className="relative py-10 sm:py-14 lg:py-16 flex items-center justify-center overflow-hidden">
      <div
        className="w-px h-10 sm:h-14 bg-accent/20 origin-top"
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

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          2. FEATURE PROJECT — Private Client — Mornington Peninsula (5 images)
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-20 sm:py-28 lg:py-36 relative">
          <div className="section-container-wide relative z-[1]">
            <RevealOnScroll direction="up" duration={700}>
              {/* Hero + details row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center mb-6 sm:mb-8">
                <div className="lg:col-span-8">
                  <EditorialImage
                    src={aberdeenBarnInterior}
                    alt="Private Client — Mornington Peninsula — luxury barn interior"
                    aspect="aspect-[16/10]"
                    onClick={() => openLightbox(aberdeenBarnInterior)}
                  />
                </div>
                <div className="lg:col-span-4 py-4 lg:py-8">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-accent/40 font-mono mb-4">
                    Featured Project
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl text-foreground/90 font-normal tracking-[0.02em] mb-4">
                    Private Client — Mornington Peninsula
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
                  </dl>
                  <p className="text-xs text-muted-foreground/30 leading-[1.8] font-serif italic">
                    Premium equine facility featuring hand-laid stonework, bespoke stall systems, and architectural timber detailing throughout.
                  </p>
                </div>
              </div>
              {/* Supporting images — 4 across */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <EditorialImage src={aberdeenStalls} alt="Private client — custom stalls" aspect="aspect-[4/3]" onClick={() => openLightbox(aberdeenStalls)} />
                <EditorialImage src={aberdeenAisle} alt="Private client — stone aisle" aspect="aspect-[4/3]" onClick={() => openLightbox(aberdeenAisle)} />
                <EditorialImage src={aberdeenStonework} alt="Private client — stonework masonry" aspect="aspect-[4/3]" onClick={() => openLightbox(aberdeenStonework)} />
                <EditorialImage src={aberdeenExterior} alt="Private client — completed exterior" aspect="aspect-[4/3]" onClick={() => openLightbox(aberdeenExterior)} />
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          3. BUILD PROCESS — construction sequence strip
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-20 sm:py-28 relative">
          <div className="section-container-wide relative z-[1]">
            <RevealOnScroll direction="up" duration={700}>
              <div className="text-center max-w-md mx-auto mb-12">
                <p className="text-[9px] uppercase tracking-[0.4em] text-accent/40 font-mono mb-3">The Process</p>
                <h2 className="font-serif text-xl sm:text-2xl text-foreground/80 font-normal tracking-[0.02em]">
                  From Ground to Structure
                </h2>
              </div>
            </RevealOnScroll>

            {/* Row 1 — wide establishing + tall detail */}
            <RevealOnScroll direction="up" duration={800} delay={80}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div className="lg:col-span-8">
                  <EditorialImage src={mainRidgeFrameWide} alt="Main Ridge timber frame build phase" aspect="aspect-[16/10]" onClick={() => openLightbox(mainRidgeFrameWide)} />
                </div>
                <div className="lg:col-span-4">
                  <EditorialImage src={mainRidgePostDepth} alt="Post hole depth measurement" aspect="aspect-[3/4]" className="h-full" onClick={() => openLightbox(mainRidgePostDepth)} />
                </div>
              </div>
            </RevealOnScroll>

            {/* Row 2 — four process shots */}
            <RevealOnScroll direction="up" duration={700} delay={120}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <EditorialImage src={mainRidgeRebarFoundation} alt="Reinforced rebar foundation" aspect="aspect-[4/3]" onClick={() => openLightbox(mainRidgeRebarFoundation)} />
                <EditorialImage src={mainRidgeFoundationPour} alt="Concrete foundation pour" aspect="aspect-[4/3]" onClick={() => openLightbox(mainRidgeFoundationPour)} />
                <EditorialImage src={mainRidgeFrameAngle} alt="Timber frame angle detail" aspect="aspect-[4/3]" onClick={() => openLightbox(mainRidgeFrameAngle)} />
                <EditorialImage src={mainRidgeFrameProgress} alt="Frame progress — structural assembly" aspect="aspect-[4/3]" onClick={() => openLightbox(mainRidgeFrameProgress)} />
              </div>
            </RevealOnScroll>

            {/* Row 3 — three process shots */}
            <RevealOnScroll direction="up" duration={700} delay={160}>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <EditorialImage src={mainRidgeFrameTrench} alt="Foundation trench with frame" aspect="aspect-[4/3]" onClick={() => openLightbox(mainRidgeFrameTrench)} />
                <EditorialImage src={mainRidgeCraneLift} alt="Crane lifting timber frame" aspect="aspect-[4/3]" onClick={() => openLightbox(mainRidgeCraneLift)} />
                <div className="col-span-2 lg:col-span-1">
                  <EditorialImage src={mainRidgeSitePrep} alt="Site preparation and groundwork" aspect="aspect-[4/3]" onClick={() => openLightbox(mainRidgeSitePrep)} />
                </div>
              </div>
            </RevealOnScroll>

            {/* Row 4 — wide completed frame */}
            <RevealOnScroll direction="up" duration={700} delay={200}>
              <EditorialImage src={mainRidgeBarnFrame} alt="Complete barn timber frame" aspect="aspect-[21/9]" onClick={() => openLightbox(mainRidgeBarnFrame)} />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          4. GROUNDLOCK / SYSTEM STRIP
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
        {/* System supporting images */}
        <div className="section-container-wide py-10 sm:py-14">
          <RevealOnScroll direction="up" duration={700}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <EditorialImage src={arenaSandPrep1} alt="Arena sand distribution" aspect="aspect-[4/3]" onClick={() => openLightbox(arenaSandPrep1)} />
              <EditorialImage src={mainRidgeArenaGrading} alt="Arena surface grading" aspect="aspect-[4/3]" onClick={() => openLightbox(mainRidgeArenaGrading)} />
              <EditorialImage src={equitanaArena1} alt="Equitana competition arena" aspect="aspect-[4/3]" onClick={() => openLightbox(equitanaArena1)} />
              <EditorialImage src={equitanaArena3} alt="Equitana arena with seating" aspect="aspect-[4/3]" onClick={() => openLightbox(equitanaArena3)} />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          5. FINISHED RESULTS — editorial mixed grid
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain-texture" />
        <div className="py-20 sm:py-28 lg:py-36 relative">
          <div className="section-container-wide relative z-[1]">
            <RevealOnScroll direction="up" duration={700}>
              <div className="text-center max-w-md mx-auto mb-12">
                <p className="text-[9px] uppercase tracking-[0.4em] text-accent/40 font-mono mb-3">Completed Work</p>
                <h2 className="font-serif text-xl sm:text-2xl text-foreground/80 font-normal tracking-[0.02em]">
                  The Finished Result
                </h2>
              </div>
            </RevealOnScroll>

            {/* Row 1 — wide interior + tall stone detail */}
            <RevealOnScroll direction="up" duration={800}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div className="lg:col-span-7">
                  <EditorialImage src={aberdeenDeck} alt="Private client — outdoor deck" aspect="aspect-[4/3]" onClick={() => openLightbox(aberdeenDeck)} />
                </div>
                <div className="lg:col-span-5">
                  <EditorialImage src={stoneworkStables2} alt="Stonework stables detail" aspect="aspect-[3/4]" className="h-full" onClick={() => openLightbox(stoneworkStables2)} />
                </div>
              </div>
            </RevealOnScroll>

            {/* Row 2 — offset pair */}
            <RevealOnScroll direction="up" duration={700} delay={80}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div className="lg:col-span-5 lg:mt-8">
                  <EditorialImage src={qldExterior3} alt="Queensland — exterior detail" aspect="aspect-[3/4]" onClick={() => openLightbox(qldExterior3)} />
                </div>
                <div className="lg:col-span-7 lg:-mt-6">
                  <EditorialImage src={equitanaArena5} alt="Equitana — completed competition arena" aspect="aspect-[16/9]" onClick={() => openLightbox(equitanaArena5)} />
                </div>
              </div>
            </RevealOnScroll>

            {/* Row 3 — three polished results */}
            <RevealOnScroll direction="up" duration={700} delay={120}>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <EditorialImage src={qldExterior1} alt="Queensland — barn exterior" aspect="aspect-[4/3]" onClick={() => openLightbox(qldExterior1)} />
                <EditorialImage src={equitanaArena6} alt="Equitana — arena surface detail" aspect="aspect-[4/3]" onClick={() => openLightbox(equitanaArena6)} />
                <div className="col-span-2 lg:col-span-1">
                  <EditorialImage src={qldCourtyard} alt="Queensland — central courtyard" aspect="aspect-[4/3]" onClick={() => openLightbox(qldCourtyard)} />
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          6. CRAFT & LIFE — detail + human moments
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <RevealOnScroll direction="up" duration={700}>
          <div className="grid grid-cols-3 sm:grid-cols-6">
            {[
              { src: mainRidgeCiroWoodwork1, alt: "Hand-crafting timber posts" },
              { src: aberdeenStallsDetail, alt: "Stall ironwork detail" },
              { src: mainRidgeWorker, alt: "Ciro on-site" },
              { src: aberdeenInteriorStonework, alt: "Interior stone feature" },
              { src: mainRidgeCiroWoodwork3, alt: "Timber finishing" },
              { src: mainRidgeBrickwork, alt: "Reclaimed brick detail" },
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

      <ChapterDivider />

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

      <ChapterDivider />

      {/* ═══════════════════════════════════════════════════
          8. FINAL CTA — cinematic full-width image
          ═══════════════════════════════════════════════════ */}
      <section className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
        <img
          src={aberdeenExterior}
          alt="Private Client — Mornington Peninsula — completed barn exterior"
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
