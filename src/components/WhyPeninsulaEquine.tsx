import { RevealOnScroll } from "@/components/RevealOnScroll";

const pillars = [
  {
    title: "Horsemanship",
    body: "We understand how horses move, train and perform.",
  },
  {
    title: "Craftsmanship",
    body: "Built with precision and attention to every detail.",
  },
  {
    title: "Performance",
    body: "Designed for longevity, drainage and footing excellence.",
  },
  {
    title: "Trust",
    body: "A partner from concept through completion.",
  },
];

export function WhyPeninsulaEquine() {
  return (
    <section className="relative overflow-hidden cv-auto">
      <div className="py-28 sm:py-36 lg:py-44 bg-background relative">
        {/* Subtle warm ambient glow — centre-weighted */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 50% at 50% 40%, hsl(35 22% 14% / 0.04), transparent)",
          }}
        />

        <div className="section-container relative z-10 max-w-6xl mx-auto">
          {/* Section header */}
          <RevealOnScroll direction="up" distance={24}>
            <div className="text-center mb-20 sm:mb-24 lg:mb-28">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.55em] text-foreground/20 mb-6"
              >
                Why Peninsula Equine
              </p>
              <div
                className="mx-auto h-px w-12"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.35), transparent)",
                }}
              />
            </div>
          </RevealOnScroll>

          {/* Four luxury cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-foreground/[0.04]">
            {pillars.map((pillar, i) => (
              <RevealOnScroll
                key={pillar.title}
                direction="up"
                distance={30}
                stagger={i}
                staggerInterval={120}
              >
                <div
                  className="group relative bg-background px-8 sm:px-10 py-14 sm:py-16 lg:py-20 transition-colors duration-700"
                  style={{
                    transitionTimingFunction:
                      "cubic-bezier(0.45, 0, 0.15, 1)",
                  }}
                >
                  {/* Top gold accent line — grows on hover */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px origin-left transition-transform duration-700 group-hover:scale-x-100"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 5%, hsl(var(--accent) / 0.45) 50%, transparent 95%)",
                      transform: "scaleX(0.35)",
                      transitionTimingFunction:
                        "cubic-bezier(0.45, 0, 0.15, 1)",
                    }}
                  />

                  {/* Index number — architectural */}
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/10 block mb-8"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Title */}
                  <h3
                    className="font-serif font-medium tracking-tight leading-[0.95] mb-6"
                    style={{
                      fontSize: "clamp(1.4rem, 1rem + 1.2vw, 2rem)",
                      color: "hsl(var(--foreground) / 0.88)",
                    }}
                  >
                    {pillar.title}
                  </h3>

                  {/* Divider — expands on hover */}
                  <div
                    className="h-px w-8 mb-6 origin-left transition-all duration-700 group-hover:w-14 group-hover:opacity-60"
                    style={{
                      background: "hsl(var(--accent) / 0.25)",
                      transitionTimingFunction:
                        "cubic-bezier(0.45, 0, 0.15, 1)",
                    }}
                  />

                  {/* Body */}
                  <p
                    className="font-sans font-light leading-[1.85]"
                    style={{
                      fontSize: "clamp(0.82rem, 0.75rem + 0.2vw, 0.92rem)",
                      color: "hsl(var(--muted-foreground) / 0.55)",
                      maxWidth: "16rem",
                    }}
                  >
                    {pillar.body}
                  </p>

                  {/* Bottom faint border — visible only on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.12), transparent)",
                    }}
                  />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
