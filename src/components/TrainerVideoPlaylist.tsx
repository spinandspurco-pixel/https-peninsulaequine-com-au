import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Play, Pause, SkipForward, SkipBack, Film, ListVideo, Repeat, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionTransition } from "@/components/SectionTransition";
import { SERVICE_FILTERS, TRAINER_PROFILES, type TestimonialItem } from "@/lib/testimonials";

function isDirectVideo(url: string): boolean {
  return /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(url);
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function getEmbedUrl(raw: string): string {
  const ytId = getYouTubeId(raw);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
  const vimeoMatch = raw.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return raw;
}

interface Props {
  videos: TestimonialItem[];
  trainerName: string;
}

export function TrainerVideoPlaylist({ videos, trainerName }: Props) {
  const [activeServiceFilter, setActiveServiceFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const profile = TRAINER_PROFILES[trainerName];

  // Derive available service tags from all videos
  const availableServiceTags = useMemo(() => {
    const tagSet = new Set<string>();
    videos.forEach((v) => v.serviceTags.forEach((t) => tagSet.add(t)));
    return SERVICE_FILTERS.filter((s) => tagSet.has(s.id));
  }, [videos]);

  // Filtered videos based on active service filter
  const filteredVideos = useMemo(() => {
    if (!activeServiceFilter) return videos;
    return videos.filter((v) => v.serviceTags.includes(activeServiceFilter));
  }, [videos, activeServiceFilter]);

  // Reset index when filter changes
  useEffect(() => {
    setActiveIndex(0);
    setPlaying(false);
  }, [activeServiceFilter]);

  const current = filteredVideos[activeIndex] ?? null;
  const isNative = current?.mediaUrl ? isDirectVideo(current.mediaUrl) : false;

  const goTo = useCallback((idx: number) => {
    setActiveIndex(idx);
    setPlaying(true);
  }, []);

  const next = useCallback(() => {
    if (activeIndex < filteredVideos.length - 1) {
      goTo(activeIndex + 1);
    } else if (autoPlay) {
      goTo(0);
    }
  }, [activeIndex, filteredVideos.length, autoPlay, goTo]);

  const prev = useCallback(() => {
    if (activeIndex > 0) goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const handleEnded = useCallback(() => {
    if (autoPlay) next();
    else setPlaying(false);
  }, [autoPlay, next]);

  useEffect(() => {
    if (playing && videoRef.current && isNative) {
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex, playing, isNative]);

  if (!current) return null;

  return (
    <section className="section-padding bg-background border-y border-border">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="w-16 h-0.5 bg-accent mx-auto mb-5" />
          <SectionTransition variant="fade-up">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ListVideo className="h-5 w-5 text-accent" />
              <h2 className="heading-section text-foreground">
                {trainerName.split(" ")[0]}'s Training Gallery
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              {videos.length} video{videos.length !== 1 ? "s" : ""} featuring {trainerName}
            </p>
          </SectionTransition>
        </div>

        {/* Service tag filter bar */}
        {availableServiceTags.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>
            <button
              onClick={() => setActiveServiceFilter("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                !activeServiceFilter
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
              }`}
            >
              All ({videos.length})
            </button>
            {availableServiceTags.map((s) => {
              const count = videos.filter((v) => v.serviceTags.includes(s.id)).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveServiceFilter(activeServiceFilter === s.id ? "" : s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activeServiceFilter === s.id
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {s.label} ({count})
                </button>
              );
            })}
            {activeServiceFilter && (
              <button
                onClick={() => setActiveServiceFilter("")}
                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear filter"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {filteredVideos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm">No videos match this filter.</p>
            <button onClick={() => setActiveServiceFilter("")} className="text-accent text-sm mt-2 hover:underline">
              Show all
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main player */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-black">
                {isNative && current.mediaUrl ? (
                  <video
                    ref={videoRef}
                    key={current.id}
                    src={current.mediaUrl}
                    controls
                    autoPlay={playing}
                    playsInline
                    onEnded={handleEnded}
                    className="w-full h-full object-contain"
                  />
                ) : current.mediaUrl && playing ? (
                  <iframe
                    key={current.id}
                    src={getEmbedUrl(current.mediaUrl)}
                    title={`Video by ${current.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <button
                    onClick={() => setPlaying(true)}
                    className="w-full h-full flex items-center justify-center group"
                    aria-label="Play video"
                  >
                    {current.mediaUrl && getYouTubeId(current.mediaUrl) ? (
                      <img
                        src={`https://img.youtube.com/vi/${getYouTubeId(current.mediaUrl)}/maxresdefault.jpg`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-80 shadow-lg z-10">
                      <Play className="h-7 w-7 text-accent-foreground ml-0.5" />
                    </div>
                  </button>
                )}
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    disabled={activeIndex === 0}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous video"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button
                    onClick={next}
                    disabled={activeIndex === filteredVideos.length - 1 && !autoPlay}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next video"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground ml-1">
                    {activeIndex + 1} / {filteredVideos.length}
                  </span>
                </div>

                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    autoPlay
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-transparent text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
                  }`}
                  aria-label={autoPlay ? "Disable auto-play" : "Enable auto-play"}
                >
                  <Repeat className="h-3.5 w-3.5" />
                  Auto-play {autoPlay ? "On" : "Off"}
                </button>
              </div>

              {/* Now playing info */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                {profile && (
                  <img src={profile.portrait} alt={trainerName} className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-serif font-semibold text-foreground truncate">{current.name}</p>
                  {current.role && <p className="text-sm text-muted-foreground mt-0.5">{current.role}</p>}
                  {current.serviceTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {current.serviceTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {SERVICE_FILTERS.find((s) => s.id === tag)?.label ?? tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Playlist sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Film className="h-4 w-4 text-accent" />
                    Playlist
                    {activeServiceFilter && (
                      <Badge variant="secondary" className="text-[10px] ml-auto">
                        {SERVICE_FILTERS.find((s) => s.id === activeServiceFilter)?.label}
                      </Badge>
                    )}
                  </h3>
                </div>
                <div className="max-h-[460px] overflow-y-auto divide-y divide-border">
                  {filteredVideos.map((video, i) => {
                    const isActive = i === activeIndex;
                    const ytId = video.mediaUrl ? getYouTubeId(video.mediaUrl) : null;
                    return (
                      <button
                        key={video.id}
                        onClick={() => goTo(i)}
                        className={`w-full text-left flex items-start gap-3 p-3 transition-colors ${
                          isActive
                            ? "bg-accent/10 border-l-2 border-l-accent"
                            : "hover:bg-muted/50 border-l-2 border-l-transparent"
                        }`}
                      >
                        <div className="relative w-20 aspect-video rounded overflow-hidden bg-muted flex-shrink-0">
                          {ytId ? (
                            <img
                              src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/60 flex items-center justify-center">
                              <Play className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                          {isActive && (
                            <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                              <Pause className="h-3 w-3 text-accent-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-medium truncate ${isActive ? "text-accent" : "text-foreground"}`}>
                            {video.name}
                          </p>
                          {video.role && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{video.role}</p>
                          )}
                          {video.serviceTags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {video.serviceTags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                                  {SERVICE_FILTERS.find((s) => s.id === tag)?.label ?? tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
