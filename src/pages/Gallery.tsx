import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Download, MousePointerClick } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { PageHeader } from "@/components/PageHeader";
import { GalleryBlueprintOverlay } from "@/components/GalleryBlueprintOverlay";
import { GalleryTourForm } from "@/components/GalleryTourForm";
import { GalleryTestimonialStrip } from "@/components/GalleryTestimonialStrip";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { testimonials } from "@/data/content";

import aberdeenBarnInterior from "@/assets/aberdeen-barn-interior.jpg";

// Extracted gallery modules
import {
  type GalleryItem,
  galleryItems,
  allVideos,
  projects,
  testimonialServiceMap,
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

  // Selection helpers (admin bulk export)
  useEffect(() => { setSelectedIds(new Set()); }, [activeProject, activeService, activeLocation, searchQuery]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }, []);

  const selectAll = useCallback(() => { setSelectedIds(new Set(filteredItems.map((i) => i.id))); }, [filteredItems]);
  const deselectAll = useCallback(() => { setSelectedIds(new Set()); }, []);

  const handleBulkDownload = useCallback(() => {
    const selected = filteredItems.filter((i) => selectedIds.has(i.id));
    selected.forEach((item, idx) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = item.src;
        a.download = `peninsula-equine-${item.id}.${item.type === "video" ? "mp4" : "jpg"}`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }, idx * 300);
    });
  }, [filteredItems, selectedIds]);

  const filteredTestimonials = useMemo(() => {
    if (activeService === "all") return testimonials.slice(0, 3);
    const indices = testimonialServiceMap[activeService] || [];
    const matched = indices.map((i) => testimonials[i]).filter(Boolean);
    return matched.length > 0 ? matched : testimonials.slice(0, 2);
  }, [activeService]);

  const clearAllFilters = () => {
    setActiveProject("all"); setActiveService("all"); setActiveLocation("all"); setSearchQuery("");
  };

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault(); searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // All navigable items for lightbox
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
        title="Our Work"
        description="Explore our portfolio of premium equine facilities, from luxurious barns to competition arenas at Australia's biggest events."
        backgroundImage={aberdeenBarnInterior}
        dividerVariant="structural"
      />

      {/* Photo & Video Gallery */}
      <GalleryBlueprintOverlay layer="elevation" bg="background" className="section-padding">
        <div className="section-container">
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

          <RevealOnScroll direction="up" delay={100}>
            <GalleryTestimonialStrip testimonials={filteredTestimonials} />
          </RevealOnScroll>

          {/* Admin bulk select toolbar */}
          {isAdmin && (
            <div className="flex items-center justify-between mb-6 px-2">
              <Button
                variant={selectMode ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectMode(!selectMode); if (selectMode) setSelectedIds(new Set()); }}
                className="gap-1.5"
              >
                <MousePointerClick className="h-4 w-4" />
                {selectMode ? "Exit Selection" : "Select Items"}
              </Button>
              {selectMode && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                  <Button variant="ghost" size="sm" onClick={selectedIds.size === filteredItems.length ? deselectAll : selectAll}>
                    {selectedIds.size === filteredItems.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Button
                    size="sm"
                    disabled={selectedIds.size === 0}
                    onClick={handleBulkDownload}
                    className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Download className="h-4 w-4" />
                    Export {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
                  </Button>
                </div>
              )}
            </div>
          )}

          <GalleryGrid
            items={filteredItems}
            onItemClick={setLightboxItem}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            key={`${activeProject}-${activeService}-${activeLocation}-${searchQuery}`}
          />

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No media matches your filters.</p>
              <button onClick={clearAllFilters} className="text-accent hover:text-accent/80 text-sm underline underline-offset-2">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </GalleryBlueprintOverlay>

      {/* Gallery Tour Lead Form */}
      <section className="section-padding bg-card border-y border-border">
        <div className="section-container">
          <RevealOnScroll direction="up">
            <GalleryTourForm />
          </RevealOnScroll>
        </div>
      </section>

      <ParallaxCTA
        title="Ready to Start Your Project?"
        description="These projects represent our commitment to excellence. Let's discuss how we can bring your vision to life."
        backgroundImage={aberdeenBarnInterior}
        primaryButtonText="Get in Touch"
        primaryButtonLink="/contact"
        showPhoneButton={false}
      />

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
