import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";

import {
  type GalleryItem,
  galleryItems,
  allVideos,
} from "./gallery/galleryData";
import { GalleryLightbox } from "./gallery/GalleryLightbox";
import { GalleryGrid } from "./gallery/GalleryGrid";
import { GalleryFilters } from "./gallery/GalleryFilters";

export default function Gallery() {
  const { isAdmin } = useAuth();
  const [activeProject, setActiveProject] = useState("all");
  const [activeService, setActiveService] = useState("all");
  const [activeLocation, setActiveLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement>();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const videoGalleryItems: GalleryItem[] = allVideos.map((v) => ({
    id: v.id, src: v.src, alt: v.alt, project: v.project, type: v.type,
    thumbnail: v.thumbnail, service: v.service, location: v.location,
  }));

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
        e.preventDefault(); searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const allNavigableItems: GalleryItem[] = useMemo(() => [
    ...galleryItems,
    ...videoGalleryItems,
  ], [videoGalleryItems]);

  const currentIndex = lightboxItem ? allNavigableItems.findIndex((item) => item.id === lightboxItem.id) : -1;
  const handlePrevious = () => { if (currentIndex > 0) setLightboxItem(allNavigableItems[currentIndex - 1]); };
  const handleNext = () => { if (currentIndex < allNavigableItems.length - 1) setLightboxItem(allNavigableItems[currentIndex + 1]); };

  const videoCount = filteredItems.filter((i) => i.type === "video").length;
  const imageCount = filteredItems.filter((i) => i.type === "image").length;

  return (
    <Layout>
      <PageHeader
        title="Selected Work"
        overline="Portfolio"
        subtitle="A curated collection of outcomes that demonstrate long-term value and considered execution."
        backgroundImage={aberdeenBarnInterior}
      />

      {/* Gallery */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 grain-texture" />
          <div className="section-container relative z-[1]">
            <RevealOnScroll direction="up" duration={600}>
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

            <GalleryGrid
              items={filteredItems}
              onItemClick={setLightboxItem}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              isFiltered={activeProject !== "all" || activeService !== "all" || activeLocation !== "all" || searchQuery.trim() !== ""}
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

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="divider-grid" />
        <div className="py-28 sm:py-40 relative">
          <div className="absolute inset-0 grain-texture" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 20%, hsl(222 20% 3% / 0.5) 100%)" }}
          />
          <div className="section-container relative z-10 text-center max-w-lg mx-auto">
            <RevealOnScroll direction="up">
              <RevealLine className="mx-auto mb-14" width="w-10" />
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={80}>
              <h2 className="heading-section text-foreground mb-8">
                Discuss Your Project
              </h2>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={150}>
              <p className="text-sm text-muted-foreground/40 mb-10 leading-relaxed">
                Each project is assessed individually to ensure correct<br />
                system specification and long-term performance.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" delay={250}>
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  Request Site Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </RevealOnScroll>
          </div>
        </div>
      </section>

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
