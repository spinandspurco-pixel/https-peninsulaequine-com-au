import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { GalleryBlueprintOverlay } from "@/components/GalleryBlueprintOverlay";
import { allVideos, type GalleryItem } from "./galleryData";

export function VideoGallerySection({ onVideoClick }: { onVideoClick: (item: GalleryItem) => void }) {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1, rootMargin: "50px" });
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (gridVisible) {
      allVideos.forEach((_, index) => {
        setTimeout(() => setVisibleItems((prev) => new Set(prev).add(index)), index * 100);
      });
    }
  }, [gridVisible]);

  return (
    <GalleryBlueprintOverlay layer="facility" bg="background" className="py-20 bg-background">
      <div className="section-container">
        <div
          ref={headerRef}
          className={`text-center mb-12 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className={`w-12 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
          <span className="text-accent text-sm font-medium tracking-wider uppercase">Video Collection</span>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mt-2 mb-4">Behind the Craft</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Watch our construction process and event work come to life — from traditional timber craftsmanship to arena preparation at Australia's biggest equine events.
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allVideos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => onVideoClick(video)}
              aria-label={`Play video: ${video.alt}`}
              className={`group relative aspect-video overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-muted transition-all duration-500 ${visibleItems.has(index) ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <video
                src={video.src}
                muted
                loop
                playsInline
                poster={video.thumbnail}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent transition-all duration-300 shadow-xl backdrop-blur-sm">
                  <Play className="w-6 h-6 text-accent-foreground ml-0.5" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif text-lg text-primary-foreground mb-1">{video.alt}</h3>
                <p className="text-primary-foreground/60 text-xs uppercase tracking-wider">
                  {video.project === "main-ridge" ? "Craftsmanship" : video.project === "equitana" ? "Major Event" : "Event Preparation"}
                </p>
              </div>
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${video.project === "main-ridge" ? "bg-accent/90 text-accent-foreground" : "bg-secondary/90 text-secondary-foreground"}`}>
                  {video.project === "main-ridge" ? "Craftsmanship" : "Events"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </GalleryBlueprintOverlay>
  );
}
