import { useState, useEffect, useRef } from "react";
import { Play, CheckSquare, Square } from "lucide-react";
import type { GalleryItem } from "./galleryData";

const ITEMS_PER_PAGE = 20;

function LazyGalleryImage({
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
  const itemRef = useRef<HTMLButtonElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsInView(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={itemRef}
      onClick={onClick}
      className={`group w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-muted relative break-inside-avoid mb-4 sm:mb-5 block transition-all duration-700 ease-out ${
        loaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.97]"
      } ${selectMode && isSelected ? "ring-2 ring-accent ring-offset-2" : ""}`}
      aria-label={selectMode ? `${isSelected ? "Deselect" : "Select"} ${item.alt}` : `View ${item.alt}`}
    >
      {selectMode && (
        <div className="absolute top-2 left-2 z-[5] cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}>
          {isSelected ? <CheckSquare className="h-6 w-6 text-accent drop-shadow-md" /> : <Square className="h-6 w-6 text-primary-foreground/70 drop-shadow-md" />}
        </div>
      )}
      {!loaded && <div className="aspect-[4/3] bg-muted animate-pulse rounded-xl" aria-hidden="true" />}
      {isInView && (
        <img
          src={item.src}
          alt={item.alt}
          className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] relative z-[1]"
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
      <div className="absolute bottom-0 inset-x-0 z-[3] p-4 pt-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
        <div className="w-6 h-px bg-accent mb-2" />
        <p className="text-primary-foreground text-sm font-serif leading-snug line-clamp-2">
          {item.alt.includes(" - ") ? item.alt.split(" - ").slice(1).join(" - ") : item.alt}
        </p>
        <p className="text-primary-foreground/50 text-[10px] uppercase tracking-[0.2em] mt-1.5">
          {item.alt.includes(" - ") ? item.alt.split(" - ")[0] : "Peninsula Equine"}
        </p>
      </div>
    </button>
  );
}

function LazyVideoGridItem({
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
  const itemRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsInView(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {}); }
  };
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  };

  return (
    <button
      ref={itemRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={selectMode ? `${isSelected ? "Deselect" : "Select"} ${item.alt}` : `Play video: ${item.alt}`}
      className={`group aspect-square overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-muted relative break-inside-avoid mb-3 sm:mb-4 block w-full ${selectMode && isSelected ? "ring-2 ring-accent ring-offset-2" : ""}`}
    >
      {selectMode && (
        <div className="absolute top-2 left-2 z-[5] cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}>
          {isSelected ? <CheckSquare className="h-6 w-6 text-accent drop-shadow-md" /> : <Square className="h-6 w-6 text-primary-foreground/70 drop-shadow-md" />}
        </div>
      )}
      {isInView ? (
        <>
          <img
            src={item.thumbnail || item.src}
            alt={item.alt}
            className={`w-full h-full object-cover transition-all duration-500 ${isHovering ? "opacity-0" : "opacity-100"} group-hover:scale-105`}
            loading="lazy"
            decoding="async"
          />
          <video
            ref={videoRef}
            src={item.src}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? "opacity-100" : "opacity-0"}`}
            muted
            playsInline
            loop
            preload="none"
          />
        </>
      ) : (
        <div className="w-full h-full aspect-square bg-muted animate-pulse" />
      )}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovering ? "bg-primary/20" : "bg-primary/30 group-hover:bg-primary/40"}`}>
        <div className={`w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center transition-all duration-300 ${isHovering ? "scale-90 opacity-70" : "group-hover:scale-110"}`}>
          <Play className="w-6 h-6 text-accent-foreground ml-1" fill="currentColor" />
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary/80 to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-primary-foreground text-xs leading-snug line-clamp-1">{item.alt}</p>
      </div>
    </button>
  );
}

export function GalleryGrid({
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
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && displayCount < items.length) setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, items.length)); },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [displayCount, items.length]);

  useEffect(() => { setDisplayCount(ITEMS_PER_PAGE); }, [items]);

  const displayedItems = items.slice(0, displayCount);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-5 [column-fill:_balance]">
        {displayedItems.map((item) =>
          item.type === "video" ? (
            <LazyVideoGridItem
              key={item.id}
              item={item}
              onClick={() => (selectMode ? onToggleSelect?.(item.id) : onItemClick(item))}
              selectMode={selectMode}
              isSelected={selectedIds?.has(item.id)}
              onToggleSelect={() => onToggleSelect?.(item.id)}
            />
          ) : (
            <LazyGalleryImage
              key={item.id}
              item={item}
              onClick={() => (selectMode ? onToggleSelect?.(item.id) : onItemClick(item))}
              selectMode={selectMode}
              isSelected={selectedIds?.has(item.id)}
              onToggleSelect={() => onToggleSelect?.(item.id)}
            />
          )
        )}
      </div>
      {displayCount < items.length && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
