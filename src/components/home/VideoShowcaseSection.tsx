import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Play, Film, ArrowRight, Expand, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BlueprintChapter } from "@/components/BlueprintChapter";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { TestimonialLightbox } from "@/components/TestimonialLightbox";
import { fetchMergedTestimonials, TRAINER_PROFILES, SERVICE_FILTERS, type TestimonialItem } from "@/lib/testimonials";
import { trackCtaClick } from "@/hooks/useCtaTracking";

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function VideoCard({
  video,
  index,
  onPlay,
}: {
  video: TestimonialItem;
  index: number;
  onPlay: () => void;
}) {
  const ytId = getYouTubeId(video.mediaUrl!);
  const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
  const profile = video.trainer ? TRAINER_PROFILES[video.trainer] : undefined;

  return (
    <SectionTransition variant="fade-up" delay={index * 100}>
      <button
        onClick={onPlay}
        className="group relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted hover:border-accent/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label={`Play video testimonial from ${video.name}`}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-primary/80" />
        )}

        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <Play className="h-6 w-6 text-accent-foreground ml-0.5" />
          </div>
        </div>

        {/* Expand hint */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Expand className="h-4 w-4 text-white" />
        </div>

        {/* Trainer tag */}
        {profile && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full pl-1 pr-2.5 py-1">
            <img src={profile.portrait} alt={video.trainer!} className="w-5 h-5 rounded-full object-cover" />
            <span className="text-[10px] text-white font-medium">{video.trainer}</span>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < video.rating ? "text-accent fill-accent" : "text-white/30"}`} />
            ))}
          </div>
          <p className="text-white text-sm font-semibold">{video.name}</p>
          {video.role && <p className="text-white/70 text-xs mt-0.5">{video.role}</p>}
        </div>
      </button>
    </SectionTransition>
  );
}

export function VideoShowcaseSection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: allTestimonials = [] } = useQuery<TestimonialItem[]>({
    queryKey: ["home-video-showcase"],
    queryFn: fetchMergedTestimonials,
    staleTime: 60_000,
  });

  const videos = useMemo(
    () => allTestimonials.filter((t) => t.mediaType === "video" && t.mediaUrl).slice(0, 6),
    [allTestimonials]
  );

  const lightboxItems = useMemo(
    () =>
      videos.map((v) => ({
        type: "video" as const,
        src: v.mediaUrl!,
        caption: `${v.name}${v.role ? ` — ${v.role}` : ""}`,
      })),
    [videos]
  );

  if (videos.length === 0) return null;

  return (
    <BlueprintChapter
      chapter="05"
      chapterTitle="Video Stories"
      scenePreset="barn"
      bg="bg-card"
      specLabels={[{ text: "CLIENT VIDEOS", position: "top-right" }]}
      className="section-padding overflow-hidden"
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
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
              Watch real stories from owners who trusted us to build their equestrian facilities.
            </p>
          </SectionTransition>
        </div>

        {/* Video grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {videos.map((video, i) => (
            <VideoCard
              key={video.id}
              video={video}
              index={i}
              onPlay={() => setLightboxIndex(i)}
            />
          ))}
        </div>

        {/* Dual CTA */}
        <SectionTransition variant="fade-up" delay={300} className="text-center mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gold"
              size="lg"
              className="text-sm px-10"
              onClick={() => {
                trackCtaClick("video_showcase_book_consult");
                document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Book a Free Consult
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/testimonials">
                View All Testimonials <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </SectionTransition>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <TestimonialLightbox
          items={lightboxItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </BlueprintChapter>
  );
}
