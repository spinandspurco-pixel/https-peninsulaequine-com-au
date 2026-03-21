import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Play, Image as ImageIcon } from "lucide-react";

interface MediaItem {
  type: "image" | "video";
  src: string;
  caption?: string;
}

interface TestimonialLightboxProps {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

export function TestimonialLightbox({ items, initialIndex, onClose }: TestimonialLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  const current = items[index];
  const goNext = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length]);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + items.length) % items.length), [items.length]);

  // Keyboard navigation with Home/End
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Home") { e.preventDefault(); setIndex(0); }
      if (e.key === "End") { e.preventDefault(); setIndex(items.length - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goNext, goPrev, items.length]);

  // Lock scroll, auto-focus, focus trap
  useEffect(() => {
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
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Media ${index + 1} of ${items.length}${current.caption ? `: ${current.caption}` : ""}`}
      onClick={() => { if (ready) onClose(); }}
    >
      {/* Skip links for keyboard users */}
      <nav aria-label="Lightbox skip links" className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-2 focus-within:left-2 focus-within:z-20 focus-within:flex focus-within:flex-col focus-within:gap-1">
        <a href="#testimonial-lightbox-close" className="bg-accent text-accent-foreground px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">
          Skip to close button
        </a>
        <a href="#testimonial-lightbox-media" className="bg-accent text-accent-foreground px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">
          Skip to media content
        </a>
        {items.length > 1 && (
          <a href="#testimonial-lightbox-thumbnails" className="bg-accent text-accent-foreground px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring">
            Skip to thumbnail navigation
          </a>
        )}
      </nav>

      {/* Live region */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Showing {current.type} {index + 1} of {items.length}{current.caption ? `: ${current.caption}` : ""}
      </div>

      <button
        ref={closeButtonRef}
        id="testimonial-lightbox-close"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Close lightbox (Escape)"
      >
        <X className="h-5 w-5" />
      </button>

      {items.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Previous (Left Arrow)">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {items.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Next (Right Arrow)">
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <div id="testimonial-lightbox-media" className="relative max-w-4xl w-full mx-4 sm:mx-8" onClick={(e) => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {current.type === "image" ? (
          <img src={current.src} alt={current.caption || "Testimonial photo"} className="w-full max-h-[80vh] object-contain rounded-lg" />
        ) : /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(current.src) ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            <video
              key={current.src}
              src={current.src}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            <iframe src={current.src} title={current.caption || "Testimonial video"} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-white/70 text-sm px-1">
          <span>{current.caption || ""}</span>
          {items.length > 1 && <span className="font-mono text-xs">{index + 1} / {items.length}</span>}
        </div>
        {items.length > 1 && (
          <div id="testimonial-lightbox-thumbnails" className="mt-4 flex items-center justify-center gap-2 overflow-x-auto pb-2" role="navigation" aria-label="Media thumbnails">
            {items.map((item, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${i === index ? "border-accent scale-110" : "border-white/20 opacity-60 hover:opacity-100"}`} aria-label={`View ${item.type} ${i + 1}${item.caption ? `: ${item.caption}` : ""}`}>
                {item.type === "image" ? (
                  <img src={item.src} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/80 flex items-center justify-center"><Play className="h-5 w-5 text-white" /></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/30 text-xs hidden sm:block">← → navigate · Home/End first/last · Esc close</p>
    </div>,
    document.body
  );
}

export function TestimonialMediaBadge({ type, src, onClick }: { type: "image" | "video"; src: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group relative mt-4 w-full aspect-video rounded-md overflow-hidden bg-muted border border-border hover:border-accent/50 transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2" aria-label={type === "image" ? "View photo" : "Play video"}>
      {type === "image" ? (
        <img src={src} alt="" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90" />
      ) : (
        <div className="w-full h-full bg-primary/90 flex items-center justify-center">
          <Play className="h-8 w-8 text-white/80 group-hover:text-accent transition-opacity duration-300" />
        </div>
      )}
      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
        {type === "image" ? <ImageIcon className="h-3.5 w-3.5 text-white" /> : <Play className="h-3.5 w-3.5 text-white" />}
      </div>
    </button>
  );
}
