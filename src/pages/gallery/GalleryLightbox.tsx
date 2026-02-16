import { useState, useEffect, useRef, useCallback } from "react";
import { X, Play, ZoomIn, Download } from "lucide-react";
import { triggerHaptic } from "@/hooks/useHapticFeedback";
import { usePinchZoom } from "@/hooks/usePinchZoom";
import { SwipeIndicator } from "@/components/SwipeIndicator";
import type { GalleryItem } from "./galleryData";

interface LightboxProps {
  item: GalleryItem | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCount: number;
  allItems: GalleryItem[];
  onNavigateTo: (index: number) => void;
}

export function GalleryLightbox({
  item,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
  allItems,
  onNavigateTo,
}: LightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const pinchZoom = usePinchZoom({
    minScale: 1,
    maxScale: 4,
    onZoomStart: () => {},
    onZoomEnd: () => {},
  });

  useEffect(() => {
    pinchZoom.reset();
  }, [item?.id]);

  // Lock body scroll, auto-focus, and focus trap
  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleTab);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleTab);
    };
  }, [item]);

  useEffect(() => {
    if (item?.type === "video" && videoRef.current) {
      videoRef.current.play();
    }
    if (item?.type === "image") {
      setIsImageLoading(true);
    }
  }, [item]);

  // Keyboard navigation
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": onClose(); break;
        case "ArrowLeft": if (hasPrevious) onPrevious(); break;
        case "ArrowRight": if (hasNext) onNext(); break;
        case "Home": e.preventDefault(); onNavigateTo(0); break;
        case "End": e.preventDefault(); onNavigateTo(totalCount - 1); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose, onPrevious, onNext, hasPrevious, hasNext, onNavigateTo, totalCount]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (pinchZoom.isZoomed || e.touches.length > 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (pinchZoom.isZoomed || e.touches.length > 1) return;
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (pinchZoom.isZoomed) return;
    if (touchStartX.current === null || touchEndX.current === null) return;
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (swipeDistance > 50 && hasNext) { triggerHaptic("light"); onNext(); }
    else if (swipeDistance < -50 && hasPrevious) { triggerHaptic("light"); onPrevious(); }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Desktop drag-to-pan when zoomed
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!pinchZoom.isZoomed) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pinchZoom.translateX, y: e.clientY - pinchZoom.translateY };
  }, [pinchZoom.isZoomed, pinchZoom.translateX, pinchZoom.translateY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    e.preventDefault();
    pinchZoom.setTranslate(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
  }, [isDragging, pinchZoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pinchZoom.isZoomed) {
      pinchZoom.reset();
    } else {
      const rect = pinchZoom.containerRef.current?.getBoundingClientRect();
      if (rect) {
        pinchZoom.zoomTo(2, rect.left + rect.width / 2 - e.clientX, rect.top + rect.height / 2 - e.clientY);
      } else {
        pinchZoom.zoomTo(2, 0, 0);
      }
    }
  }, [pinchZoom]);

  if (!item) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-roledescription="Image lightbox"
      aria-label={`${item.alt} — ${currentIndex + 1} of ${totalCount}`}
      className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center p-4"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip links */}
      <nav aria-label="Lightbox skip links" className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-2 focus-within:left-2 focus-within:z-20 focus-within:flex focus-within:flex-col focus-within:gap-1">
        <a href="#lightbox-close" className="bg-accent text-accent-foreground px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">Skip to close button</a>
        <a href="#lightbox-media" className="bg-accent text-accent-foreground px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">Skip to media content</a>
        <a href="#lightbox-thumbnails" className="bg-accent text-accent-foreground px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">Skip to thumbnail navigation</a>
      </nav>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing {item.type === "video" ? "video" : "image"} {currentIndex + 1} of {totalCount}: {item.alt}
      </div>

      <SwipeIndicator show={!!item && totalCount > 1} />

      {/* Download */}
      <a
        href={item.src}
        download={`peninsula-equine-${item.id}.${item.type === "video" ? "mp4" : "jpg"}`}
        className="absolute top-6 right-20 text-primary-foreground/60 hover:text-primary-foreground z-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-1"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Download high-res ${item.type === "video" ? "video" : "image"}`}
      >
        <Download className="h-7 w-7" />
      </a>

      {/* Close */}
      <button
        ref={closeButtonRef}
        id="lightbox-close"
        className="absolute top-6 right-6 text-primary-foreground/80 hover:text-primary-foreground z-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-full p-1"
        onClick={onClose}
        aria-label="Close lightbox (Escape)"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Previous */}
      {hasPrevious && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/60 hover:text-primary-foreground z-10 p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
          onClick={(e) => { e.stopPropagation(); onPrevious(); }}
          aria-label={`Previous ${item.type === "video" ? "video" : "image"} (Left Arrow)`}
        >
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/60 hover:text-primary-foreground z-10 p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label={`Next ${item.type === "video" ? "video" : "image"} (Right Arrow)`}
        >
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div id="lightbox-media" className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
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
          <div
            ref={pinchZoom.containerRef}
            className={`relative overflow-hidden touch-none ${pinchZoom.isZoomed ? "cursor-grab" : ""} ${isDragging ? "cursor-grabbing" : ""}`}
            {...pinchZoom.handlers}
            onTouchEnd={(e) => { pinchZoom.handlers.onTouchEnd(e); pinchZoom.handleDoubleTap(e); }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          >
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={item.src}
              alt={item.alt}
              className={`max-w-full max-h-[85vh] object-contain rounded-lg mx-auto transition-all duration-200 select-none ${isImageLoading ? "opacity-0" : "opacity-100"}`}
              style={{ transform: pinchZoom.transform }}
              onLoad={() => setIsImageLoading(false)}
              draggable={false}
            />
            {pinchZoom.isZoomed && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/80 text-primary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <ZoomIn className="w-3 h-3" />
                {Math.round(pinchZoom.scale * 100)}%
              </div>
            )}
            {!pinchZoom.isZoomed && !isImageLoading && (
              <>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/60 text-primary-foreground/70 text-xs px-3 py-1.5 rounded-full sm:hidden">
                  Pinch to zoom • Double-tap to zoom
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary/60 text-primary-foreground/70 text-xs px-3 py-1.5 rounded-full hidden sm:block">
                  Double-click to zoom • Drag to pan
                </div>
              </>
            )}
          </div>
        )}

        {/* Caption */}
        <div className="text-center mt-4 space-y-1">
          {item.alt.includes(" - ") ? (
            <>
              <p className="text-primary-foreground/90 text-sm font-serif">{item.alt.split(" - ").slice(1).join(" - ")}</p>
              <p className="text-primary-foreground/50 text-xs uppercase tracking-widest">{item.alt.split(" - ")[0]}</p>
            </>
          ) : (
            <p className="text-primary-foreground/70 text-sm">{item.alt}</p>
          )}
        </div>

        {/* Thumbnail strip */}
        <div id="lightbox-thumbnails" className="mt-6 px-4" role="navigation" aria-label="Image thumbnails">
          <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent">
            {allItems.map((thumbItem, index) => (
              <button
                key={thumbItem.id}
                onClick={() => onNavigateTo(index)}
                className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden transition-all duration-300 ${
                  index === currentIndex
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-primary scale-105"
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                }`}
                aria-label={`Go to ${thumbItem.type === "video" ? "video" : "image"} ${index + 1}: ${thumbItem.alt}`}
              >
                <img
                  src={thumbItem.type === "video" ? thumbItem.thumbnail : thumbItem.src}
                  alt={thumbItem.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {thumbItem.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                )}
                {index === currentIndex && <div className="absolute inset-0 bg-accent/10" />}
              </button>
            ))}
          </div>
        </div>

        <p className="text-primary-foreground/40 text-xs mt-4 text-center">
          <span className="hidden sm:inline">← → navigate · Home/End first/last · Esc close</span>
          <span className="sm:hidden">Swipe to navigate · Tap outside to close</span>
        </p>
      </div>
    </div>
  );
}
