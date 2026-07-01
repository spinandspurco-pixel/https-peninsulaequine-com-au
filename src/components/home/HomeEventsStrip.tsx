import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { fetchFeaturedEvents, type ManagedEvent } from "@/lib/events";

function formatEventDate(iso: string): string {
  try {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function HomeEventsStrip() {
  const [items, setItems] = useState<ManagedEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchFeaturedEvents(3)
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loaded && items.length === 0) return null;

  return (
    <section className="relative py-[clamp(4rem,2.5rem+6vw,9rem)] bg-background overflow-hidden border-t border-accent/10">
      <div className="section-container">
        <RevealOnScroll direction="up" duration={900}>
          <div className="flex items-baseline gap-5 mb-[clamp(2.5rem,1.5rem+2vw,4rem)]">
            <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">
              06
            </span>
            <span className="h-px w-12 bg-accent/30" />
            <span className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.5em]">
              Upcoming
            </span>
          </div>
        </RevealOnScroll>

        <ul className="divide-y divide-accent/10 border-y border-accent/10">
          {items.map((ev, i) => (
            <RevealOnScroll key={ev.id} direction="up" duration={900} delay={120 + i * 100}>
              <li className="grid grid-cols-12 gap-4 py-[clamp(1.25rem,0.75rem+1vw,2rem)] items-baseline">
                <div className="col-span-12 md:col-span-3 font-mono uppercase text-foreground/60 text-[10px] tracking-[0.32em] tabular-nums">
                  {formatEventDate(ev.event_date)}
                  {ev.event_time && (
                    <span className="ml-2 text-foreground/40">{ev.event_time}</span>
                  )}
                </div>
                <div className="col-span-12 md:col-span-6 space-y-1">
                  <h3 className="font-serif text-foreground/90 leading-[1.15] text-[clamp(1.15rem,0.95rem+0.5vw,1.5rem)] tracking-[-0.01em]">
                    {ev.title}
                  </h3>
                  {ev.summary && (
                    <p className="font-sans font-light text-foreground/55 leading-[1.6] text-[13px] max-w-xl">
                      {ev.summary}
                    </p>
                  )}
                </div>
                <div className="col-span-12 md:col-span-3 md:text-right font-mono uppercase text-foreground/55 text-[10px] tracking-[0.32em]">
                  {ev.location ?? ""}
                </div>
              </li>
            </RevealOnScroll>
          ))}
        </ul>

        <RevealOnScroll direction="none" duration={1100} delay={500}>
          <div className="mt-[clamp(2.5rem,1.5rem+2vw,4rem)] flex justify-end">
            <Link
              to="/events"
              className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/72 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em]"
            >
              <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
              All events
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
