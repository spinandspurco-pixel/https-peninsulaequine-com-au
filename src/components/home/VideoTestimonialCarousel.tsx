import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Star, Film } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BlueprintChapter } from "@/components/BlueprintChapter";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { fetchMergedTestimonials, TRAINER_PROFILES, type TestimonialItem } from "@/lib/testimonials";

const AUTO_ADVANCE_MS = 12_000;

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getYouTubeEmbed(url: string) {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0` : null;
}

function isDirectVideo(src: string) {
  return /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(src);
}

interface SlideProps {
  video: TestimonialItem;
  isActive: boolean;
  muted: boolean;
  onEnded: () => void;
}

function VideoSlide({ video, isActive, muted, onEnded }: SlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = video.mediaUrl!;
  const ytEmbed = getYouTubeEmbed(src);
  const isDirect = isDirectVideo(src);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const profile = video.trainer ? TRAINER_PROFILES[video.trainer] : undefined;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      {isDirect ? (
        <video
          ref={videoRef}
          src={src}
          muted={muted}
          playsInline
          preload="metadata"
          onEnded={onEnded}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : ytEmbed ? (
        <iframe
          src={isActive ? ytEmbed + (muted ? "&mute=1" : "&mute=0") : "about:blank"}
          title={`Video testimonial from ${video.name}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/80">
          <Play className="h-12 w-12 text-white/60" />
        </div>
      )}

      {/* Gradient overlay for captions */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Trainer tag */}
      {profile && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full pl-1.5 pr-3 py-1.5 z-10">
          <img src={profile.portrait} alt={video.trainer!} className="w-6 h-6 rounded-full object-cover" />
          <span className="text-xs text-white font-medium">{video.trainer}</span>
        </div>
      )}

      {/* Caption overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10">
        {/* Stars */}
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < video.rating ? "text-accent fill-accent" : "text-white/20"}`} />
          ))}
        </div>

        {/* Quote */}
        <p className="text-white text-sm sm:text-base font-serif italic leading-relaxed line-clamp-3 mb-2">
          "{video.quote.length > 160 ? video.quote.slice(0, 160) + "…" : video.quote}"
        </p>

        {/* Attribution */}
        <div className="flex items-center gap-2">
          <p className="text-white font-semibold text-sm">{video.name}</p>
          {video.role && (
            <>
              <span className="text-white/40">·</span>
              <p className="text-white/70 text-xs">{video.role}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoTestimonialCarousel() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  const { data: allTestimonials = [] } = useQuery<TestimonialItem[]>({
    queryKey: ["home-video-carousel"],
    queryFn: fetchMergedTestimonials,
    staleTime: 60_000,
  });

  const videos = useMemo(
    () => allTestimonials.filter((t) => t.mediaType === "video" && t.mediaUrl).slice(0, 8),
    [allTestimonials]
  );

  const count = videos.length;

  const next = useCallback(() => setActive((p) => (p + 1) % count), [count]);
  const prev = useCallback(() => setActive((p) => (p - 1 + count) % count), [count]);

  // Auto-advance when visible, not paused, muted
  useEffect(() => {
    if (paused || !isVisible || count <= 1 || !muted) return;
    const timer = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, isVisible, count, next, muted]);

  // Touch swipe
  const touchStartRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartRef.current = null;
  };

  if (count === 0) return null;

  return (
    <BlueprintChapter
      chapter="05"
      chapterTitle="Video Stories"
      scenePreset="barn"
      bg="bg-card"
      specLabels={[{ text: "CLIENT VIDEOS", position: "top-right" }]}
      className="section-padding overflow-hidden"
    >
      <div ref={ref} className="section-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <AnimatedDivider className="mx-auto mb-8" />
          <SectionTransition variant="blur-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Film className="h-5 w-5 text-accent" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Video Testimonials
              </p>
            </div>
            <h2 className="heading-editorial mb-3">Hear It From Our Clients</h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">
              Watch real stories from owners who trusted us with their equestrian vision.
            </p>
          </SectionTransition>
        </div>

        {/* Carousel */}
        <div
          className={`max-w-4xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative">
            {/* Video slides */}
            {videos.map((video, i) => (
              <div
                key={video.id}
                className={`transition-opacity duration-700 ${
                  i === active ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"
                }`}
              >
                <VideoSlide
                  video={video}
                  isActive={i === active && isVisible}
                  muted={muted}
                  onEnded={next}
                />
              </div>
            ))}

            {/* Nav arrows */}
            {count > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                  aria-label="Previous video"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                  aria-label="Next video"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Controls: play/pause & mute */}
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              {count > 1 && (
                <button
                  onClick={() => setPaused((p) => !p)}
                  className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                  aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
                >
                  {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
              )}
              <button
                onClick={() => setMuted((m) => !m)}
                className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Progress dots */}
          {count > 1 && (
            <div className="flex justify-center gap-2 mt-5">
              {videos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active
                      ? "bg-accent w-8"
                      : "bg-muted-foreground/25 hover:bg-muted-foreground/50 w-2"
                  }`}
                  aria-label={`Go to video ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </BlueprintChapter>
  );
}
