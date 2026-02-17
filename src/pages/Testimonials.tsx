import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Star, Play, Quote, Filter, X, Film, Expand, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { TestimonialLightbox } from "@/components/TestimonialLightbox";
import { fetchMergedTestimonials, SERVICE_FILTERS, getTrainerFilters, TRAINER_PROFILES, type TestimonialItem } from "@/lib/testimonials";
import ciroWithHorse from "@/assets/ciro-with-horse.png";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(url);
}

function isEmbeddable(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

function VideoEmbed({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);

  const getEmbedUrl = (raw: string): string => {
    const ytMatch = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    const vimeoMatch = raw.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    return raw;
  };

  // Direct video files render as native <video>
  if (isDirectVideo(url)) {
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden border border-border bg-black">
        <video
          src={url}
          controls
          preload="metadata"
          playsInline
          className="w-full h-full object-contain"
          poster=""
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Embeddable URLs (YouTube / Vimeo) — click-to-play
  if (!playing) {
    return (
      <button
        onClick={() => setPlaying(true)}
        className="relative w-full aspect-video rounded-lg bg-muted/50 border border-border flex items-center justify-center group hover:border-accent/40 transition-colors overflow-hidden"
        aria-label="Play video testimonial"
      >
        <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
          <Play className="h-6 w-6 text-accent-foreground ml-0.5" />
        </div>
        <span className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-2 py-1">
          Watch video
        </span>
      </button>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-border">
      <iframe
        src={getEmbedUrl(url)}
        title="Video testimonial"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: TestimonialItem; index: number }) {
  const hasVideo = testimonial.mediaType === "video" && testimonial.mediaUrl;
  const hasImage = testimonial.mediaType === "image" && testimonial.mediaUrl;

  return (
    <SectionTransition variant="fade-up" delay={index * 80}>
      <article className="rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col h-full hover:border-accent/30 transition-colors">
        {hasVideo && <div className="mb-6"><VideoEmbed url={testimonial.mediaUrl!} /></div>}
        {hasImage && (
          <div className="mb-6 rounded-lg overflow-hidden aspect-video">
            <img src={testimonial.mediaUrl!} alt={`Project by ${testimonial.name}`} loading="lazy" className="w-full h-full object-cover" />
          </div>
        )}

        <StarRating rating={testimonial.rating} />

        <div className="relative mt-4 flex-1">
          <Quote className="absolute -top-1 -left-1 h-6 w-6 text-accent/15" />
          <blockquote className="text-foreground leading-relaxed pl-4">
            "{testimonial.quote}"
          </blockquote>
        </div>

        {/* Service tags */}
        {testimonial.serviceTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {testimonial.serviceTags.map((tag) => {
              const label = SERVICE_FILTERS.find((s) => s.id === tag)?.label ?? tag;
              return (
                <Badge key={tag} variant="secondary" className="text-[10px] font-medium">
                  {label}
                </Badge>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-border flex items-center gap-3">
          {testimonial.trainer && TRAINER_PROFILES[testimonial.trainer] && (
            <img
              src={TRAINER_PROFILES[testimonial.trainer].portrait}
              alt={testimonial.trainer}
              className="w-9 h-9 rounded-full object-cover border border-border flex-shrink-0"
            />
          )}
          <div>
            <p className="font-serif font-semibold text-foreground">{testimonial.name}</p>
            {testimonial.role && <p className="text-sm text-muted-foreground mt-0.5">{testimonial.role}</p>}
            {testimonial.trainer && (
              <Link
                to={`/trainers/${testimonial.trainer.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs text-accent hover:underline mt-0.5 inline-block"
              >
                Trainer: {testimonial.trainer}
              </Link>
            )}
          </div>
        </div>
      </article>
    </SectionTransition>
  );
}

function StatsBar({ testimonials }: { testimonials: TestimonialItem[] }) {
  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : "5.0";
  const videoCount = testimonials.filter((t) => t.mediaType === "video").length;

  return (
    <section className="py-10 sm:py-12 bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <div className="flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-accent fill-accent" />
              ))}
            </div>
            <span className="text-2xl font-bold text-accent">{avgRating}</span>
            <span className="text-primary-foreground/60 text-sm">avg rating</span>
          </div>
          <div className="h-6 w-px bg-primary-foreground/20 hidden sm:block" />
          <p className="text-sm text-primary-foreground/70">
            <span className="font-semibold text-primary-foreground">{testimonials.length}</span> client reviews
            {videoCount > 0 && (
              <> · <span className="font-semibold text-primary-foreground">{videoCount}</span> video testimonials</>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function VideoGallerySection({ testimonials }: { testimonials: TestimonialItem[] }) {
  const allVideos = useMemo(
    () => testimonials.filter((t) => t.mediaType === "video" && t.mediaUrl),
    [testimonials]
  );
  const [trainerTag, setTrainerTag] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const trainerOptions = useMemo(() => {
    const set = new Set<string>();
    allVideos.forEach((v) => { if (v.trainer) set.add(v.trainer); });
    return Array.from(set).sort();
  }, [allVideos]);

  const videos = useMemo(
    () => trainerTag ? allVideos.filter((v) => v.trainer === trainerTag) : allVideos,
    [allVideos, trainerTag]
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

  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };

  if (allVideos.length === 0) return null;

  return (
    <section className="section-padding bg-card border-y border-border">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="w-16 h-0.5 bg-accent mx-auto mb-5" />
          <SectionTransition variant="fade-up">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Film className="h-5 w-5 text-accent" />
              <h2 className="heading-section text-foreground">Video Testimonials</h2>
            </div>
            <p className="text-muted-foreground">
              Watch our clients share their experiences in their own words.
            </p>
          </SectionTransition>
        </div>

        {/* Trainer tag filter */}
        {trainerOptions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setTrainerTag("")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !trainerTag
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
              }`}
            >
              All Videos
            </button>
            {trainerOptions.map((name) => {
              const profile = TRAINER_PROFILES[name];
              return (
                <button
                  key={name}
                  onClick={() => setTrainerTag(trainerTag === name ? "" : name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    trainerTag === name
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {profile && (
                    <img src={profile.portrait} alt={name} className="w-5 h-5 rounded-full object-cover" />
                  )}
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {videos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm">No videos for this trainer yet.</p>
            <button onClick={() => setTrainerTag("")} className="text-accent text-sm mt-2 hover:underline">Show all</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, i) => {
              const ytId = getYouTubeId(video.mediaUrl!);
              const thumbnail = ytId
                ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                : null;
              const profile = video.trainer ? TRAINER_PROFILES[video.trainer] : undefined;

              return (
                <SectionTransition key={video.id} variant="fade-up" delay={i * 80}>
                  <button
                    onClick={() => setLightboxIndex(i)}
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

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="h-6 w-6 text-accent-foreground ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Expand className="h-4 w-4 text-white" />
                    </div>

                    {/* Trainer portrait tag */}
                    {profile && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full pl-1 pr-2.5 py-1">
                        <img src={profile.portrait} alt={video.trainer!} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-[10px] text-white font-medium">{video.trainer}</span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white text-sm font-semibold">{video.name}</p>
                      {video.role && (
                        <p className="text-white/70 text-xs mt-0.5">{video.role}</p>
                      )}
                      {video.serviceTags.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {video.serviceTags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white/80">
                              {SERVICE_FILTERS.find((s) => s.id === tag)?.label ?? tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                </SectionTransition>
              );
            })}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <TestimonialLightbox
          items={lightboxItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}

export default function Testimonials() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  const activeFilter = searchParams.get("service") || "";
  const activeTrainer = searchParams.get("trainer") || "";

  const setFilter = (serviceId: string) => {
    const params: Record<string, string> = {};
    if (serviceId) params.service = serviceId;
    if (activeTrainer) params.trainer = activeTrainer;
    setSearchParams(params);
  };

  const setTrainerFilter = (trainer: string) => {
    const params: Record<string, string> = {};
    if (activeFilter) params.service = activeFilter;
    if (trainer) params.trainer = trainer;
    setSearchParams(params);
  };

  useEffect(() => {
    fetchMergedTestimonials().then((items) => {
      setTestimonials(items);
      setLoading(false);
    });
  }, []);

  const trainerOptions = useMemo(() => getTrainerFilters(testimonials), [testimonials]);

  const filtered = useMemo(() => {
    let items = testimonials;
    if (activeFilter) {
      items = items.filter((t) => t.serviceTags.includes(activeFilter));
    }
    if (activeTrainer) {
      items = items.filter((t) => t.trainer === activeTrainer);
    }
    return items;
  }, [testimonials, activeFilter, activeTrainer]);

  return (
    <Layout>
      <PageHeader
        title="Testimonials"
        description="Don't just take our word for it — hear from clients who've trusted Peninsula Equine with their facilities."
      />

      <StatsBar testimonials={testimonials} />
      <VideoGallerySection testimonials={testimonials} />

      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <AnimatedDivider className="mx-auto mb-8" />
            <SectionTransition variant="fade-up">
              <h2 className="heading-section text-foreground">Client Stories</h2>
            </SectionTransition>
          </div>

          {/* Service filter bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Service:
            </span>
            <button
              onClick={() => setFilter("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !activeFilter
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
              }`}
            >
              All
            </button>
            {SERVICE_FILTERS.map((s) => (
              <button
                key={s.id}
                onClick={() => setFilter(activeFilter === s.id ? "" : s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeFilter === s.id
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
            {activeFilter && (
              <button onClick={() => setFilter("")} className="ml-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Clear service filter">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Trainer filter bar */}
          {trainerOptions.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> Trainer:
              </span>
              <button
                onClick={() => setTrainerFilter("")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  !activeTrainer
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
                }`}
              >
                All
              </button>
              {trainerOptions.map((trainer) => {
                const profile = TRAINER_PROFILES[trainer];
                return (
                  <button
                    key={trainer}
                    onClick={() => setTrainerFilter(activeTrainer === trainer ? "" : trainer)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      activeTrainer === trainer
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    {profile && (
                      <img
                        src={profile.portrait}
                        alt={trainer}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    )}
                    {trainer}
                  </button>
                );
              })}
              {activeTrainer && (
                <button onClick={() => setTrainerFilter("")} className="ml-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Clear trainer filter">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {trainerOptions.length === 0 && <div className="mb-12" />}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-8 animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-6" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                    <div className="h-3 bg-muted rounded w-4/6" />
                  </div>
                  <div className="mt-8 pt-5 border-t border-border">
                    <div className="h-4 bg-muted rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No testimonials found for this service yet.</p>
              <Button variant="outline" size="sm" onClick={() => setFilter("")}>
                Show All
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((t, i) => (
                <TestimonialCard key={t.id} testimonial={t} index={i} />
              ))}
            </div>
          )}

          <SectionTransition variant="fade-up" delay={300} className="text-center mt-16">
            <p className="text-muted-foreground mb-4">Ready to become our next success story?</p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/contact">
                Get a Free Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </SectionTransition>
        </div>
      </section>

      <ParallaxCTA
        title="Join Our Satisfied Clients"
        description="Ready to experience the Peninsula Equine difference? Let's discuss your project."
        backgroundImage={ciroWithHorse}
        primaryButtonText="Get a Quote"
        primaryButtonLink="/contact"
        showPhoneButton={true}
      />
    </Layout>
  );
}
