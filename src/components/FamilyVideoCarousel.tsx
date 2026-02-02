import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import familyPeCaps from "@/assets/videos/family-pe-caps.mp4";
import chickenCoopBuild from "@/assets/videos/chicken-coop-build.mp4";
import mainRidgeWoodwork1 from "@/assets/videos/main-ridge-woodwork-1.mp4";
import mainRidgeWoodwork2 from "@/assets/videos/main-ridge-woodwork-2.mp4";
import ciroJoinUp from "@/assets/videos/ciro-bareback-join-up.mp4";
import ciroJoinUp2 from "@/assets/videos/ciro-bareback-join-up-2.mp4";
import slowMo1 from "@/assets/videos/slow-mo-1.mp4";
import slowMo2 from "@/assets/videos/slow-mo-2.mp4";
import slowMo3 from "@/assets/videos/slow-mo-3.mp4";

const videos = [
  {
    src: familyPeCaps,
    title: "Family Time",
    description: "The Peninsula Equine crew sporting their PE caps",
  },
  {
    src: mainRidgeWoodwork1,
    title: "Main Ridge Woodwork",
    description: "Precision timber craftsmanship in action",
  },
  {
    src: mainRidgeWoodwork2,
    title: "Timber Detailing",
    description: "Hand-finished woodwork for lasting quality",
  },
  {
    src: ciroJoinUp,
    title: "Join-Up Session",
    description: "Ciro connecting with horses through natural horsemanship",
  },
  {
    src: ciroJoinUp2,
    title: "Bareback Connection",
    description: "Building trust and partnership in the round pen",
  },
  {
    src: slowMo1,
    title: "Poetry in Motion",
    description: "The beauty of horse movement captured in slow motion",
  },
  {
    src: slowMo2,
    title: "Graceful Strides",
    description: "Every movement tells a story",
  },
  {
    src: slowMo3,
    title: "Equine Elegance",
    description: "Celebrating the majesty of horses",
  },
  {
    src: chickenCoopBuild,
    title: "Chicken Coop Build",
    description: "Even the chickens get custom-built homes around here",
  },
];

const AUTOPLAY_INTERVAL = 8000; // 8 seconds per video

export function FamilyVideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoPlaying || isPlaying) return;

    // Reset progress
    setProgress(0);

    // Start progress animation
    const startTime = Date.now();
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
      setProgress(newProgress);
    }, 50);

    // Auto-advance timer
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
    }, AUTOPLAY_INTERVAL);

    return () => {
      clearTimeout(timer);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, isPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
    setIsPlaying(false);
    setIsAutoPlaying(true);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
    setIsPlaying(false);
    setIsAutoPlaying(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsAutoPlaying(true);
      } else {
        videoRef.current.play();
        setIsAutoPlaying(false);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setIsAutoPlaying(true);
    // Auto-advance to next video
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    setIsAutoPlaying(true);
  };
  const currentVideo = videos[currentIndex];

  return (
    <div className="relative">
      {/* Video Container */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group">
        <video
          ref={videoRef}
          key={currentVideo.src}
          className="w-full h-full object-cover"
          muted
          playsInline
          onEnded={handleVideoEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={currentVideo.src} type="video/mp4" />
        </video>

        {/* Play/Pause Overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center backdrop-blur-sm">
            {isPlaying ? (
              <Pause className="w-6 h-6 text-accent-foreground" />
            ) : (
              <Play className="w-6 h-6 text-accent-foreground ml-1" />
            )}
          </div>
        </button>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous video"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next video"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Progress Bar */}
        {isAutoPlaying && !isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted-foreground/20">
            <div 
              className="h-full bg-accent transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="mt-4 text-center">
        <h4 className="font-serif text-lg font-semibold text-foreground">
          {currentVideo.title}
        </h4>
        <p className="text-sm text-muted-foreground mt-1">
          {currentVideo.description}
        </p>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "bg-accent w-6"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>

      {/* Autoplay Toggle */}
      <div className="flex justify-center mt-3">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={cn(
            "text-xs uppercase tracking-wider transition-colors",
            isAutoPlaying ? "text-accent" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isAutoPlaying ? "Autoplay On" : "Autoplay Off"}
        </button>
      </div>
    </div>
  );
}
