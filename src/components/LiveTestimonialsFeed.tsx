import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Star, Quote, ChevronLeft, ChevronRight, Filter, Pause, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { testimonials as staticTestimonials, services } from "@/data/content";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FeedItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  serviceTags: string[];
}

const SERVICE_CHIPS = services.slice(0, 6).map((s) => ({ id: s.id, label: s.title }));

function inferTags(role: string): string[] {
  const l = role.toLowerCase();
  if (l.includes("dressage") || l.includes("trainer") || l.includes("jumping")) return ["arena-construction"];
  if (l.includes("ranch") || l.includes("estate")) return ["barn-construction", "full-facility"];
  if (l.includes("breeding") || l.includes("farm")) return ["fencing", "infrastructure"];
  return [];
}

export function LiveTestimonialsFeed() {
  const [activeFilter, setActiveFilter] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: items = [] } = useQuery<FeedItem[]>({
    queryKey: ["live-testimonials-feed"],
    queryFn: async () => {
      const staticItems: FeedItem[] = staticTestimonials.map((t) => ({
        id: `s-${t.id}`,
        name: t.name,
        role: t.role,
        quote: t.quote,
        rating: t.rating,
        serviceTags: inferTags(t.role),
      }));

      const { data } = await supabase
        .from("managed_testimonials")
        .select("id, client_name, client_role, quote, rating, service_tags")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        const dbItems: FeedItem[] = data.map((t) => ({
          id: t.id,
          name: t.client_name,
          role: t.client_role ?? "",
          quote: t.quote,
          rating: t.rating,
          serviceTags: (t.service_tags as string[]) ?? [],
        }));
        const dbKeys = new Set(dbItems.map((d) => `${d.name}::${d.quote.slice(0, 40)}`));
        const unique = staticItems.filter((s) => !dbKeys.has(`${s.name}::${s.quote.slice(0, 40)}`));
        return [...dbItems, ...unique];
      }
      return staticItems;
    },
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    if (!activeFilter) return items;
    return items.filter((t) => t.serviceTags.includes(activeFilter));
  }, [items, activeFilter]);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeFilter]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % Math.max(filtered.length, 1));
  }, [filtered.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
  }, [filtered.length]);

  // Auto-rotate every 5s
  useEffect(() => {
    if (paused || filtered.length <= 1) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, next, filtered.length]);

  if (items.length === 0) return null;

  const visible = filtered.length > 0 ? filtered[currentIndex % filtered.length] : null;

  return (
    <section className="section-padding bg-card border-y border-border overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Live Client Feed
          </p>
          <h2 className="heading-section text-foreground">What Our Clients Say</h2>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <button
            onClick={() => setActiveFilter("")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              !activeFilter
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-transparent text-muted-foreground border-border hover:border-accent/40"
            )}
          >
            All
          </button>
          {SERVICE_CHIPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveFilter(activeFilter === s.id ? "" : s.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                activeFilter === s.id
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-muted-foreground border-border hover:border-accent/40"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Testimonial card */}
        {visible ? (
          <div className="max-w-2xl mx-auto">
            <div
              key={visible.id}
              className="rounded-xl border border-border bg-background p-8 sm:p-10 text-center animate-fade-in"
            >
              {/* Stars */}
              <div className="flex justify-center gap-0.5 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < visible.rating ? "text-accent fill-accent" : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              <Quote className="h-6 w-6 text-accent/20 mx-auto mb-3" />
              <blockquote className="font-serif text-lg sm:text-xl text-foreground leading-relaxed mb-6 italic">
                "{visible.quote.length > 200 ? visible.quote.slice(0, 200) + "…" : visible.quote}"
              </blockquote>

              {visible.serviceTags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {visible.serviceTags.map((tag) => {
                    const label = SERVICE_CHIPS.find((s) => s.id === tag)?.label ?? tag;
                    return (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              )}

              <p className="font-serif font-semibold text-foreground">{visible.name}</p>
              {visible.role && (
                <p className="text-sm text-muted-foreground mt-0.5">{visible.role}</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setPaused(!paused)}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
                aria-label={paused ? "Resume auto-rotation" : "Pause auto-rotation"}
              >
                {paused ? <Play className="h-3.5 w-3.5 ml-0.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={next}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Dots */}
              <div className="flex gap-1.5 ml-2">
                {filtered.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === currentIndex % filtered.length
                        ? "bg-accent scale-125"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
                {filtered.length > 8 && (
                  <span className="text-[10px] text-muted-foreground ml-1">+{filtered.length - 8}</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No testimonials for this service yet.</p>
        )}

        {/* Link to full page */}
        <div className="text-center mt-8">
          <Link
            to="/testimonials"
            className="text-xs text-accent hover:text-accent/80 underline underline-offset-2 uppercase tracking-wide transition-colors"
          >
            Read all testimonials →
          </Link>
        </div>
      </div>
    </section>
  );
}
