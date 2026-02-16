import { useState, useRef } from "react";
import { Play } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { GalleryBlueprintOverlay } from "@/components/GalleryBlueprintOverlay";
import { allVideos, type GalleryItem } from "./galleryData";

export function FeaturedVideoSection({ onVideoClick }: { onVideoClick: (item: GalleryItem) => void }) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.1, rootMargin: "0px" });
  const [activeVideo, setActiveVideo] = useState(0);

  const featuredVideos = allVideos.slice(0, 3);

  const handleVideoClick = (index: number) => {
    const video = featuredVideos[index];
    onVideoClick({
      id: video.id,
      src: video.src,
      alt: video.alt,
      project: video.project,
      type: "video",
      thumbnail: video.thumbnail,
    });
  };

  return (
    <GalleryBlueprintOverlay layer="barn" bg="card" className="py-16 bg-card">
      <div ref={ref as React.RefObject<HTMLDivElement>} />
      <div className="section-container">
        <div className="text-center mb-10">
          <span className="text-accent text-sm font-medium tracking-wider uppercase">Featured</span>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mt-2">
            Horse Training in Slow Motion
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Experience the beauty and precision of natural horsemanship captured in stunning slow motion.
          </p>
        </div>

        <div className={`grid lg:grid-cols-3 gap-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {featuredVideos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => handleVideoClick(index)}
              aria-label={`Play video: ${video.alt}`}
              className={`group relative aspect-[4/3] overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <video
                src={video.src}
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent group-hover:from-primary/70 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent transition-all duration-300 shadow-lg">
                  <Play className="w-7 h-7 text-accent-foreground ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                <h3 className="font-serif text-xl text-primary-foreground mb-1">{video.alt}</h3>
                <p className="text-primary-foreground/70 text-sm">{video.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </GalleryBlueprintOverlay>
  );
}
