import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Hammer, Heart, Film, Users, Trophy } from "lucide-react";
import { triggerHaptic } from "@/hooks/useHapticFeedback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
// Major events videos
import arenaPrepVideo from "@/assets/videos/arena-prep.mov";
import equitanaArenaVideo from "@/assets/videos/equitana-arena.mov";
import caulfield1 from "@/assets/videos/caulfield-1.mov";
import caulfield2 from "@/assets/videos/caulfield-2.mov";
import caulfield3 from "@/assets/videos/caulfield-3.mov";

type VideoCategory = "family" | "craftsmanship" | "horsemanship" | "cinematic" | "events";

interface VideoItem {
  src: string;
  title: string;
  description: string;
  category: VideoCategory;
}

const categoryConfig: Record<VideoCategory, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "outline" }> = {
  family: { label: "Family", icon: <Users className="h-3 w-3" />, variant: "secondary" },
  craftsmanship: { label: "Craftsmanship", icon: <Hammer className="h-3 w-3" />, variant: "default" },
  horsemanship: { label: "Horsemanship", icon: <Heart className="h-3 w-3" />, variant: "default" },
  cinematic: { label: "Slow Motion", icon: <Film className="h-3 w-3" />, variant: "outline" },
  events: { label: "Major Events", icon: <Trophy className="h-3 w-3" />, variant: "default" },
};

const videos: VideoItem[] = [
  {
    src: familyPeCaps,
    title: "Family Time",
    description: "The Peninsula Equine crew sporting their PE caps",
    category: "family",
  },
  {
    src: equitanaArenaVideo,
    title: "Equitana Arena Prep",
    description: "Behind the scenes at Australia's premier equine event",
    category: "events",
  },
  {
    src: mainRidgeWoodwork1,
    title: "Main Ridge Woodwork",
    description: "Precision timber craftsmanship in action",
    category: "craftsmanship",
  },
  {
    src: caulfield1,
    title: "Melbourne Cup Day 1",
    description: "Arena preparation at Caulfield Racecourse",
    category: "events",
  },
  {
    src: ciroJoinUp,
    title: "Join-Up Session",
    description: "Ciro connecting with horses through natural horsemanship",
    category: "horsemanship",
  },
  {
    src: arenaPrepVideo,
    title: "Arena Surface Work",
    description: "Precision grading for competition-ready footing",
    category: "events",
  },
  {
    src: mainRidgeWoodwork2,
    title: "Timber Detailing",
    description: "Hand-finished woodwork for lasting quality",
    category: "craftsmanship",
  },
  {
    src: caulfield2,
    title: "Melbourne Cup Day 2",
    description: "Race-day surface maintenance in action",
    category: "events",
  },
  {
    src: ciroJoinUp2,
    title: "Bareback Connection",
    description: "Building trust and partnership in the round pen",
    category: "horsemanship",
  },
  {
    src: slowMo1,
    title: "Poetry in Motion",
    description: "The beauty of horse movement captured in slow motion",
    category: "cinematic",
  },
  {
    src: caulfield3,
    title: "Melbourne Cup Day 3",
    description: "Final touches for world-class racing surfaces",
    category: "events",
  },
  {
    src: slowMo2,
    title: "Graceful Strides",
    description: "Every movement tells a story",
    category: "cinematic",
  },
  {
    src: slowMo3,
    title: "Equine Elegance",
    description: "Celebrating the majesty of horses",
    category: "cinematic",
  },
  {
    src: chickenCoopBuild,
    title: "Chicken Coop Build",
    description: "Even the chickens get custom-built homes around here",
    category: "craftsmanship",
  },
];

const AUTOPLAY_INTERVAL = 8000; // 8 seconds per video

export function FamilyVideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
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
    triggerHaptic("light");
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
    setIsPlaying(false);
    setIsAutoPlaying(true);
  };

  const goToNext = () => {
    triggerHaptic("light");
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

        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <Badge
            variant={categoryConfig[currentVideo.category].variant}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm"
          >
            {categoryConfig[currentVideo.category].icon}
            {categoryConfig[currentVideo.category].label}
          </Badge>
        </div>

        {/* Video Counter */}
        <div className="absolute top-4 right-4 z-20">
          <span className="text-xs font-medium text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
            {currentIndex + 1} / {videos.length}
          </span>
        </div>

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

      {/* Thumbnail Strip with Hover Preview */}
      <div className="mt-6">
        <div className="flex justify-center gap-2 overflow-x-auto pb-2 px-2 scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent">
          {videos.map((video, index) => {
            const isActive = index === currentIndex;
            const isHovered = hoveredIndex === index;
            
            return (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                  // Play the thumbnail video on hover
                  const thumbVideo = thumbnailVideoRefs.current.get(index);
                  if (thumbVideo) {
                    thumbVideo.currentTime = 0;
                    thumbVideo.play().catch(() => {});
                  }
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  // Pause the thumbnail video
                  const thumbVideo = thumbnailVideoRefs.current.get(index);
                  if (thumbVideo) {
                    thumbVideo.pause();
                  }
                }}
                className={cn(
                  "relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-md overflow-hidden transition-all duration-300",
                  isActive 
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-background scale-105" 
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                )}
                aria-label={`Go to video ${index + 1}: ${video.title}`}
              >
                {/* Thumbnail Video (plays on hover) */}
                <video
                  ref={(el) => {
                    if (el) thumbnailVideoRefs.current.set(index, el);
                  }}
                  src={video.src}
                  muted
                  playsInline
                  loop
                  className="w-full h-full object-cover"
                />
                
                {/* Hover overlay with title */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end justify-center p-1 transition-opacity duration-300",
                  isHovered ? "opacity-100" : "opacity-0"
                )}>
                  <span className="text-[9px] sm:text-[10px] text-white font-medium text-center leading-tight line-clamp-2">
                    {video.title}
                  </span>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 bg-accent/10" />
                )}
                
                {/* Category color indicator */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-0.5",
                  categoryConfig[video.category].variant === "secondary" ? "bg-secondary" : "bg-accent"
                )} />
              </button>
            );
          })}
        </div>
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
