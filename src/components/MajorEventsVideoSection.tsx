import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Award, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

// Import event videos
import equitanaVideo from "@/assets/videos/equitana-arena.mov";
import arenaPrepVideo from "@/assets/videos/arena-prep.mov";
import caulfield1 from "@/assets/videos/caulfield-1.mov";
import caulfield2 from "@/assets/videos/caulfield-2.mov";
import caulfield3 from "@/assets/videos/caulfield-3.mov";

// Import thumbnail images
import equitanaArena1 from "@/assets/equitana-arena-1.jpg";
import caulfieldEvent from "@/assets/caulfield-event.jpg";

interface VideoEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  videos: string[];
  thumbnail: string;
  badgeText: string;
  badgeIcon: React.ReactNode;
}

const majorEventVideos: VideoEvent[] = [
  {
    id: "equitana",
    title: "Equitana Melbourne",
    subtitle: "Australia's Premier Equine Event",
    description:
      "Watch our team prepare world-class arenas for Equitana Melbourne, ensuring perfect footing for thousands of horses and riders across multiple competition surfaces.",
    videos: [equitanaVideo, arenaPrepVideo],
    thumbnail: equitanaArena1,
    badgeText: "Exclusive Partner",
    badgeIcon: <Award className="h-3.5 w-3.5" />,
  },
  {
    id: "melbourne-cup",
    title: "Melbourne Cup",
    subtitle: "Caulfield Racecourse",
    description:
      "Experience our precision arena preparation at Caulfield Racecourse during one of Australia's most prestigious racing events.",
    videos: [caulfield1, caulfield2, caulfield3],
    thumbnail: caulfieldEvent,
    badgeText: "Official Contractor",
    badgeIcon: <Trophy className="h-3.5 w-3.5" />,
  },
];

interface VideoCardProps {
  event: VideoEvent;
  isReversed: boolean;
}

function VideoCard({ event, isReversed }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { ref: cardRef, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.2,
    rootMargin: "0px 0px -100px 0px",
  });

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnd = () => {
    if (currentVideoIndex < event.videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      if (videoRef.current) {
        videoRef.current.play();
      }
    } else {
      setCurrentVideoIndex(0);
      setIsPlaying(false);
    }
  };

  const handleVideoClick = () => {
    handlePlayPause();
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "grid lg:grid-cols-2 gap-8 lg:gap-12 items-center transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}
    >
      {/* Video Section */}
      <div className={cn("relative group", isReversed ? "lg:order-2" : "")}>
        <div className="relative aspect-video overflow-hidden rounded-sm bg-muted">
          {/* Thumbnail/Poster when not playing */}
          {!isPlaying && (
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={handleVideoClick}
            >
              <img
                src={event.thumbnail}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-7 w-7 text-accent-foreground ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          )}

          {/* Video Element */}
          <video
            ref={videoRef}
            src={event.videos[currentVideoIndex]}
            className="w-full h-full object-cover"
            muted={isMuted}
            playsInline
            onEnded={handleVideoEnd}
            onClick={handleVideoClick}
          />

          {/* Video Controls Overlay */}
          {isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <button
                  onClick={handlePlayPause}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white" fill="currentColor" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  {/* Video Indicator Dots */}
                  {event.videos.length > 1 && (
                    <div className="flex gap-1.5 mr-2">
                      {event.videos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentVideoIndex(idx);
                            if (videoRef.current) {
                              videoRef.current.load();
                              videoRef.current.play();
                            }
                          }}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            idx === currentVideoIndex
                              ? "bg-white"
                              : "bg-white/40 hover:bg-white/60"
                          )}
                          aria-label={`Play video ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleMuteToggle}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-white" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Badge */}
          <div className="absolute top-4 left-4 z-20">
            <Badge
              variant="default"
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
            >
              {event.badgeIcon}
              {event.badgeText}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={cn(isReversed ? "lg:order-1" : "")}>
        <p className="text-accent text-sm uppercase tracking-[0.15em] font-medium mb-3">
          {event.subtitle}
        </p>
        <h3 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
          {event.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-lg mb-6">
          {event.description}
        </p>

        {event.videos.length > 1 && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {event.videos.length} videos
            </span>{" "}
            — Click to play through the series
          </p>
        )}
      </div>
    </div>
  );
}

export function MajorEventsVideoSection() {
  const { ref: headerRef, isVisible: headerVisible } =
    useScrollAnimation<HTMLDivElement>({
      threshold: 0.3,
    });

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "text-center max-w-3xl mx-auto mb-16 transition-all duration-700",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div
            className={cn(
              "divider mx-auto mb-8 transition-all duration-500 delay-100",
              headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )}
          />
          <div
            className={cn(
              "flex items-center justify-center gap-3 mb-4 transition-all duration-500 delay-200",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Play className="h-5 w-5 text-accent" />
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm">
              Behind The Scenes
            </p>
          </div>
          <h2
            className={cn(
              "heading-section text-foreground mb-6 transition-all duration-500 delay-300",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Major Events in Action
          </h2>
          <p
            className={cn(
              "text-muted-foreground text-lg leading-relaxed transition-all duration-500 delay-400",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Experience the precision and expertise that goes into preparing
            arenas for Australia's most prestigious equine events.
          </p>
        </div>

        {/* Video Cards */}
        <div className="space-y-16 lg:space-y-24">
          {majorEventVideos.map((event, index) => (
            <VideoCard
              key={event.id}
              event={event}
              isReversed={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
