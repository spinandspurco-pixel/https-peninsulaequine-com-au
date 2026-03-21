import { useState, useEffect, useRef } from "react";
import { Play, CheckSquare, Square } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import type { GalleryItem } from "./galleryData";

const ITEMS_PER_PAGE = 24;

/* ────────────────────────────────────────────────────────
   SERVICE CATEGORIES — maps service tags to display groups
   ──────────────────────────────────────────────────────── */
const CATEGORY_ORDER = [
  { key: "arena", label: "Arenas", overline: "Performance Surfaces" },
  { key: "barn", label: "Stables & Barns", overline: "Equine Structures" },
  { key: "infrastructure", label: "GroundLock & Infrastructure", overline: "Engineered Systems" },
  { key: "stonework", label: "Stonework", overline: "Material Craft" },
  { key: "woodwork", label: "Woodwork", overline: "Timber Detail" },
  { key: "events", label: "Events", overline: "Competition Preparation" },
];

/* ────────────────────────────────────────────────────────
   SINGLE IMAGE CARD — cinematic hover
   ──────────────────────────────────────────────────────── */
function CinematicImage({
  item,
  onClick,
  size = "standard",
  selectMode,
  isSelected,
  onToggleSelect,
}: {
  item: GalleryItem;
  onClick: () => void;
  size?: "hero" | "tall" | "standard";
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setIsInView(true); obs.disconnect(); } },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const aspectClass =
    size === "hero" ? "aspect-[16/10]" :
    size === "tall" ? "aspect-[3/4]" :
    "aspect-[4/3]";

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`group relative w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-background bg-muted/30 transition-all duration-700 ease-out ${aspectClass} ${
        loaded ? "opacity-100" : "opacity-0"
      } ${selectMode && isSelected ? "ring-2 ring-accent" : ""}`}
      aria-label={selectMode ? `${isSelected ? "Deselect" : "Select"} ${item.alt}` : `View ${item.alt}`}
    >
      {selectMode && (
        <div className="absolute top-3 left-3 z-[5]" onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}>
          {isSelected ? <CheckSquare className="h-5 w-5 text-accent" /> : <Square className="h-5 w-5 text-foreground/50" />}
        </div>
      )}

      {!loaded && <div className={`${aspectClass} w-full bg-muted/20`} />}

      {isInView && (
        <img
          src={item.src}
          alt={item.alt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-out group-hover:opacity-90"
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}


    </button>
  );
}

/* ────────────────────────────────────────────────────────
   VIDEO CARD — cinematic
   ──────────────────────────────────────────────────────── */
function CinematicVideo({
  item,
  onClick,
  selectMode,
  isSelected,
  onToggleSelect,
}: {
  item: GalleryItem;
  onClick: () => void;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setIsInView(true); obs.disconnect(); } },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovering(true);
        if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {}); }
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
      }}
      className={`group relative w-full overflow-hidden aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-accent/40 bg-muted/30 transition-all duration-700 ${selectMode && isSelected ? "ring-2 ring-accent" : ""}`}
      aria-label={selectMode ? `${isSelected ? "Deselect" : "Select"} ${item.alt}` : `Play video: ${item.alt}`}
    >
      {selectMode && (
        <div className="absolute top-3 left-3 z-[5]" onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}>
          {isSelected ? <CheckSquare className="h-5 w-5 text-accent" /> : <Square className="h-5 w-5 text-foreground/50" />}
        </div>
      )}

      {isInView ? (
        <>
          <img
            src={item.thumbnail || item.src}
            alt={item.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? "opacity-0" : "opacity-100"}`}
            loading="lazy"
            decoding="async"
          />
          <video
            ref={videoRef}
            src={item.src}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovering ? "opacity-100" : "opacity-0"}`}
            muted playsInline loop preload="none"
          />
        </>
      ) : (
        <div className="w-full h-full bg-muted/20" />
      )}

      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isHovering ? "bg-background/10" : "bg-background/25"}`}>
        <div className={`w-12 h-12 rounded-full border border-foreground/20 flex items-center justify-center transition-all duration-500 backdrop-blur-sm ${isHovering ? "scale-90 opacity-60" : "group-hover:scale-105"}`}>
          <Play className="w-5 h-5 text-foreground/80 ml-0.5" />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <p className="text-foreground text-xs font-serif line-clamp-1">{item.alt}</p>
      </div>
    </button>
  );
}

/* ────────────────────────────────────────────────────────
   CATEGORY SECTION — architectural grouping
   ──────────────────────────────────────────────────────── */
function CategorySection({
  label,
  overline,
  items,
  onItemClick,
  selectMode,
  selectedIds,
  onToggleSelect,
}: {
  label: string;
  overline: string;
  items: GalleryItem[];
  onItemClick: (item: GalleryItem) => void;
  selectMode?: boolean;
  selectedIds?: Set<number>;
  onToggleSelect?: (id: number) => void;
}) {
  if (items.length === 0) return null;

  const images = items.filter(i => i.type === "image");
  const videos = items.filter(i => i.type === "video");

  // First image is hero, rest are supporting
  const heroImage = images[0];
  const supportingImages = images.slice(1);

  return (
    <div className="mb-20 sm:mb-28 lg:mb-36">
      {/* Category header */}
      <RevealOnScroll direction="up" duration={700}>
        <div className="mb-10 sm:mb-14">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-muted-foreground/25 font-mono mb-2">
            {overline}
          </p>
          <h3 className="font-serif text-xl sm:text-2xl text-foreground/80 font-normal tracking-[0.02em]">
            {label}
          </h3>
        </div>
      </RevealOnScroll>

      {/* Hero + first two supporting */}
      {heroImage && (
        <RevealOnScroll direction="up" duration={800}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 mb-3 sm:mb-4 lg:mb-5">
            {/* Hero — spans 8 cols on large */}
            <div className="lg:col-span-8">
              <CinematicImage
                item={heroImage}
                onClick={() => selectMode ? onToggleSelect?.(heroImage.id) : onItemClick(heroImage)}
                size="hero"
                selectMode={selectMode}
                isSelected={selectedIds?.has(heroImage.id)}
                onToggleSelect={() => onToggleSelect?.(heroImage.id)}
              />
            </div>

            {/* Two tall supporting images — span 4 cols */}
            {supportingImages.length > 0 && (
              <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-5">
                {supportingImages.slice(0, 2).map((img) => (
                  <CinematicImage
                    key={img.id}
                    item={img}
                    onClick={() => selectMode ? onToggleSelect?.(img.id) : onItemClick(img)}
                    size="tall"
                    selectMode={selectMode}
                    isSelected={selectedIds?.has(img.id)}
                    onToggleSelect={() => onToggleSelect?.(img.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </RevealOnScroll>
      )}

      {/* Remaining supporting images — asymmetric grid */}
      {supportingImages.length > 2 && (
        <RevealOnScroll direction="up" duration={700} delay={100}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-3 sm:mb-4 lg:mb-5">
            {supportingImages.slice(2).map((img) => (
              <CinematicImage
                key={img.id}
                item={img}
                onClick={() => selectMode ? onToggleSelect?.(img.id) : onItemClick(img)}
                size="standard"
                selectMode={selectMode}
                isSelected={selectedIds?.has(img.id)}
                onToggleSelect={() => onToggleSelect?.(img.id)}
              />
            ))}
          </div>
        </RevealOnScroll>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <RevealOnScroll direction="up" duration={700} delay={150}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {videos.map((vid) => (
              <CinematicVideo
                key={vid.id}
                item={vid}
                onClick={() => selectMode ? onToggleSelect?.(vid.id) : onItemClick(vid)}
                selectMode={selectMode}
                isSelected={selectedIds?.has(vid.id)}
                onToggleSelect={() => onToggleSelect?.(vid.id)}
              />
            ))}
          </div>
        </RevealOnScroll>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   FLAT GRID — used when filters are active
   ──────────────────────────────────────────────────────── */
function FlatGrid({
  items,
  onItemClick,
  selectMode,
  selectedIds,
  onToggleSelect,
}: {
  items: GalleryItem[];
  onItemClick: (item: GalleryItem) => void;
  selectMode?: boolean;
  selectedIds?: Set<number>;
  onToggleSelect?: (id: number) => void;
}) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && displayCount < items.length) setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, items.length)); },
      { rootMargin: "400px" }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [displayCount, items.length]);

  useEffect(() => { setDisplayCount(ITEMS_PER_PAGE); }, [items]);

  const displayed = items.slice(0, displayCount);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {displayed.map((item) =>
          item.type === "video" ? (
            <CinematicVideo
              key={item.id}
              item={item}
              onClick={() => selectMode ? onToggleSelect?.(item.id) : onItemClick(item)}
              selectMode={selectMode}
              isSelected={selectedIds?.has(item.id)}
              onToggleSelect={() => onToggleSelect?.(item.id)}
            />
          ) : (
            <CinematicImage
              key={item.id}
              item={item}
              onClick={() => selectMode ? onToggleSelect?.(item.id) : onItemClick(item)}
              size="standard"
              selectMode={selectMode}
              isSelected={selectedIds?.has(item.id)}
              onToggleSelect={() => onToggleSelect?.(item.id)}
            />
          )
        )}
      </div>
      {displayCount < items.length && (
        <div ref={sentinelRef} className="flex justify-center py-10">
          <div className="w-6 h-6 border border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────
   MAIN EXPORT
   ──────────────────────────────────────────────────────── */
export function GalleryGrid({
  items,
  onItemClick,
  selectMode,
  selectedIds,
  onToggleSelect,
  isFiltered = false,
}: {
  items: GalleryItem[];
  onItemClick: (item: GalleryItem) => void;
  selectMode?: boolean;
  selectedIds?: Set<number>;
  onToggleSelect?: (id: number) => void;
  isFiltered?: boolean;
}) {
  // When filters are active, show flat grid
  if (isFiltered) {
    return (
      <FlatGrid
        items={items}
        onItemClick={onItemClick}
        selectMode={selectMode}
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
      />
    );
  }

  // Portfolio mode — group by service category
  return (
    <div>
      {CATEGORY_ORDER.map((cat) => {
        const catItems = items.filter(i => i.service === cat.key);
        return (
          <CategorySection
            key={cat.key}
            label={cat.label}
            overline={cat.overline}
            items={catItems}
            onItemClick={onItemClick}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
          />
        );
      })}
    </div>
  );
}
