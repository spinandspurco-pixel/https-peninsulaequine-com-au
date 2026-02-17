import { useState, useRef, useCallback, useEffect } from "react";
import { RotateCcw, Play, Pause, Eye, EyeOff } from "lucide-react";

const DEFAULT_CLIPS = [
  { start: 3, end: 18 },
  { start: 2, end: 16 },
];
const STORAGE_KEY = "pe_hero_video_clips";
const QUALITY_KEY = "pe_hero_video_quality";

export type VideoQuality = "performance" | "balanced" | "clarity";

export const QUALITY_PROFILES: Record<VideoQuality, {
  label: string;
  playbackRate: number;
  filter: string;
  scale: number;
  description: string;
}> = {
  performance: {
    label: "⚡ Performance",
    playbackRate: 0.75,
    filter: "contrast(1.02) saturate(1.0)",
    scale: 1.08,
    description: "Lighter filters, faster playback",
  },
  balanced: {
    label: "⚖️ Balanced",
    playbackRate: 0.5,
    filter: "contrast(1.08) saturate(1.1) brightness(1.02)",
    scale: 1.15,
    description: "Default slo-mo with detail boost",
  },
  clarity: {
    label: "🔍 Clarity",
    playbackRate: 0.35,
    filter: "contrast(1.12) saturate(1.15) brightness(1.04) sharpen(0)",
    scale: 1.18,
    description: "Max detail, deep slo-mo",
  },
};

export function saveClips(clips: { start: number; end: number }[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
}

export function loadClips(): { start: number; end: number }[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_CLIPS;
}

export function loadQuality(): VideoQuality {
  try {
    const raw = localStorage.getItem(QUALITY_KEY);
    if (raw && raw in QUALITY_PROFILES) return raw as VideoQuality;
  } catch {}
  return "balanced";
}

export function saveQuality(q: VideoQuality) {
  localStorage.setItem(QUALITY_KEY, q);
}

export { DEFAULT_CLIPS };

// ── Mini preview player ─────────────────────────────────────
function MiniPreview({
  src,
  clip,
  visible,
}: {
  src: string;
  clip: { start: number; end: number };
  visible: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(clip.start);

  const play = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = clip.start;
    v.playbackRate = 0.5;
    v.play().catch(() => {});
    setPlaying(true);
  }, [clip.start]);

  const pause = useCallback(() => {
    ref.current?.pause();
    setPlaying(false);
  }, []);

  // Stop at trim end
  const handleTimeUpdate = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    setTime(v.currentTime);
    if (v.currentTime >= clip.end) {
      v.pause();
      v.currentTime = clip.start;
      setPlaying(false);
    }
  }, [clip.start, clip.end]);

  // Reset when clip changes
  useEffect(() => {
    const v = ref.current;
    if (v) {
      v.currentTime = clip.start;
      setTime(clip.start);
      if (playing) {
        v.playbackRate = 0.5;
        v.play().catch(() => {});
      }
    }
  }, [clip.start, clip.end]);

  if (!visible) return null;

  const progress = clip.end > clip.start
    ? ((time - clip.start) / (clip.end - clip.start)) * 100
    : 0;

  return (
    <div className="relative rounded-lg overflow-hidden border border-border bg-primary/90 aspect-video">
      <video
        ref={ref}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-cover"
        style={{ filter: "contrast(1.08) saturate(1.1) brightness(1.02)" }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Playback overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={playing ? pause : play}
          className="w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/90 transition-colors"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>
      </div>

      {/* Timecode */}
      <div className="absolute bottom-0 left-0 right-0 bg-primary/80 backdrop-blur-sm px-2 py-1 flex items-center gap-2">
        <span className="text-[10px] font-mono text-primary-foreground/70">
          {time.toFixed(1)}s / {clip.end.toFixed(1)}s
        </span>
        <div className="flex-1 h-1 bg-primary-foreground/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main editor panel ───────────────────────────────────────
export function HeroClipEditor({
  clips,
  activeIdx,
  videoRefs,
  videoSrcs,
  quality,
  onChange,
  onQualityChange,
  onReset,
  onClose,
}: {
  clips: { start: number; end: number }[];
  activeIdx: number;
  videoRefs: React.RefObject<HTMLVideoElement | null>[];
  videoSrcs: string[];
  quality: VideoQuality;
  onChange: (clips: { start: number; end: number }[]) => void;
  onQualityChange: (q: VideoQuality) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const currentTime = (idx: number) => videoRefs[idx]?.current?.currentTime?.toFixed(1) ?? "—";

  const update = (idx: number, field: "start" | "end", value: number) => {
    const next = clips.map((c, i) => (i === idx ? { ...c, [field]: value } : c));
    onChange(next);
    saveClips(next);
  };

  return (
    <div className="absolute top-4 left-4 z-50 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-4 w-80 text-sm animate-fade-in max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif font-semibold text-foreground text-xs tracking-wider uppercase">Hero Video Sandbox</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => {
            const preset = [{ start: 3, end: 22 }, { start: 2, end: 20 }];
            onChange(preset);
            saveClips(preset);
            videoRefs.forEach((ref) => {
              if (ref.current) { ref.current.playbackRate = 0.35; }
            });
          }}
          className="flex-1 px-2 py-1.5 rounded-md border border-accent/40 bg-accent/10 text-accent text-[11px] font-medium tracking-wider uppercase hover:bg-accent/20 transition-colors"
        >
          🎬 Cinematic
        </button>
        <button
          onClick={() => {
            onChange(DEFAULT_CLIPS);
            saveClips(DEFAULT_CLIPS);
            videoRefs.forEach((ref) => {
              if (ref.current) { ref.current.playbackRate = 0.5; }
            });
          }}
          className="flex-1 px-2 py-1.5 rounded-md border border-border bg-card text-muted-foreground text-[11px] font-medium tracking-wider uppercase hover:bg-muted transition-colors"
        >
          Standard
        </button>
      </div>

      {/* Video Quality toggle */}
      <div className="mb-3">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Video Quality</span>
        <div className="grid grid-cols-3 gap-1 bg-muted/50 rounded-lg p-1">
          {(Object.keys(QUALITY_PROFILES) as VideoQuality[]).map((q) => {
            const profile = QUALITY_PROFILES[q];
            const active = quality === q;
            return (
              <button
                key={q}
                onClick={() => onQualityChange(q)}
                className={`px-1.5 py-2 rounded-md text-[10px] font-medium tracking-wider transition-all ${
                  active
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={profile.description}
              >
                {profile.label}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground/70 mt-1 leading-snug">
          {QUALITY_PROFILES[quality].description}
        </p>
      </div>

      {clips.map((clip, i) => (
        <div key={i} className="mb-3">
          <div
            className={`rounded-lg border p-3 ${
              i === activeIdx ? "border-accent bg-accent/5" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground text-xs">Video {i + 1}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-mono">
                  Now: {currentTime(i)}s
                </span>
                <button
                  onClick={() => setPreviewIdx(previewIdx === i ? null : i)}
                  className={`p-1 rounded transition-colors ${
                    previewIdx === i
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={previewIdx === i ? "Hide preview" : "Show preview"}
                >
                  {previewIdx === i ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Start (s)</span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={clip.start}
                  onChange={(e) => update(i, "start", parseFloat(e.target.value) || 0)}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <label className="block">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">End (s)</span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={clip.end}
                  onChange={(e) => update(i, "end", parseFloat(e.target.value) || 0)}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
            </div>
          </div>

          {/* Inline mini preview */}
          {previewIdx === i && (
            <div className="mt-2 animate-fade-in">
              <MiniPreview src={videoSrcs[i]} clip={clip} visible />
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => { onReset(); saveClips(DEFAULT_CLIPS); }}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mt-1 transition-colors"
      >
        <RotateCcw className="h-3 w-3" /> Reset to defaults
      </button>
    </div>
  );
}
