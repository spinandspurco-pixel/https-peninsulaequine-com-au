import { useRef, useState, useEffect } from "react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { DURATION, EASE, DISTANCE } from "@/lib/motion";

import detailFlooring from "@/assets/detail-stable-flooring.jpg";
import detailTransition from "@/assets/detail-material-transition.jpg";
import detailHardware from "@/assets/detail-hardware.jpg";
import detailRidge from "@/assets/detail-ridge-cap.jpg";

const details = [
  {
    image: detailFlooring,
    title: "Stable Flooring",
    insight: "Designed with fall — for drainage, hygiene, and hoof longevity.",
  },
  {
    image: detailTransition,
    title: "Material Transitions",
    insight: "Where durability meets finish — without compromise.",
  },
  {
    image: detailHardware,
    title: "Hardware & Fixings",
    insight: "Every junction is considered. Nothing is accidental.",
  },
  {
    image: detailRidge,
    title: "Roof & Ridge Lines",
    insight: "Built to manage load, weather, and time.",
  },
];

function DetailCard({
  image,
  title,
  insight,
  index,
}: {
  image: string;
  title: string;
  insight: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delay = index * 100;

  return (
    <div
      ref={ref}
      className="group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${DISTANCE.sm}px)`,
        transition: `opacity ${DURATION.normal}ms ${EASE.default} ${delay}ms, transform ${DURATION.normal}ms ${EASE.default} ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {/* Image — tall editorial crop */}
      <div className="relative aspect-[3/4] overflow-hidden mb-5">
        <img
          src={image}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover will-change-transform"
          style={{
            transition: `transform ${DURATION.parallax}ms ${EASE.default}`,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.03)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
        />
        {/* Subtle bottom vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, hsl(var(--background) / 0.5) 0%, transparent 40%)",
          }}
        />
      </div>

      {/* Text */}
      <h3 className="font-serif text-base sm:text-lg text-foreground tracking-[0.02em] mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-[13px] text-muted-foreground/40 font-serif italic leading-relaxed">
        {insight}
      </p>
    </div>
  );
}

export function DetailMatters() {
  return (
    <section className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
      <div className="absolute inset-0 grain-texture pointer-events-none" />

      <div className="section-container relative z-10">
        <RevealOnScroll direction="up" duration={DURATION.normal} distance={DISTANCE.md}>
          <div className="text-center mb-14 sm:mb-18 lg:mb-20">
            <div className="flex items-center justify-center gap-5 mb-5">
              <div className="w-8 h-px bg-accent/25" />
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-accent/35 font-mono">
                Craftsmanship
              </p>
              <div className="w-8 h-px bg-accent/25" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground/90 tracking-[0.03em]">
              Detail Matters
            </h2>
          </div>
        </RevealOnScroll>

        {/* Editorial grid — first card spans wider for hierarchy */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-8">
          <div className="col-span-2">
            <DetailCard {...details[0]} index={0} />
          </div>
          {details.slice(1).map((d, i) => (
            <DetailCard key={d.title} {...d} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
