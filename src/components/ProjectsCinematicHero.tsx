import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import projectsHeroDrone from "@/assets/projects-hero-drone-goldenhour.jpg";

/* ── Blueprint SVG linework ──────────────────────────── */
function BlueprintLinework() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Horizontal structural lines */}
      <line
        x1="0" y1="300" x2="1600" y2="300"
        stroke="#C6A86B" strokeWidth="0.6" opacity="0"
        className="animate-[blueprintDraw_1.8s_0.1s_ease-out_forwards]"
        strokeDasharray="1600" strokeDashoffset="1600"
        style={{ animation: "blueprintDraw 1.8s 0.1s ease-out forwards" }}
      />
      <line
        x1="0" y1="600" x2="1600" y2="600"
        stroke="#C6A86B" strokeWidth="0.6" opacity="0"
        className="animate-[blueprintDraw_1.8s_0.3s_ease-out_forwards]"
        strokeDasharray="1600" strokeDashoffset="1600"
        style={{ animation: "blueprintDraw 1.8s 0.3s ease-out forwards" }}
      />

      {/* Vertical structural lines */}
      <line
        x1="400" y1="0" x2="400" y2="900"
        stroke="#C6A86B" strokeWidth="0.4" opacity="0"
        strokeDasharray="900" strokeDashoffset="900"
        style={{ animation: "blueprintDraw 1.5s 0.4s ease-out forwards" }}
      />
      <line
        x1="1200" y1="0" x2="1200" y2="900"
        stroke="#C6A86B" strokeWidth="0.4" opacity="0"
        strokeDasharray="900" strokeDashoffset="900"
        style={{ animation: "blueprintDraw 1.5s 0.5s ease-out forwards" }}
      />

      {/* Diagonal structural braces */}
      <line
        x1="0" y1="0" x2="400" y2="300"
        stroke="#C6A86B" strokeWidth="0.5" opacity="0"
        strokeDasharray="500" strokeDashoffset="500"
        style={{ animation: "blueprintDraw 1.4s 0.6s ease-out forwards" }}
      />
      <line
        x1="1600" y1="0" x2="1200" y2="300"
        stroke="#C6A86B" strokeWidth="0.5" opacity="0"
        strokeDasharray="500" strokeDashoffset="500"
        style={{ animation: "blueprintDraw 1.4s 0.7s ease-out forwards" }}
      />

      {/* Roof pitch lines */}
      <path
        d="M 200 600 L 800 200 L 1400 600"
        fill="none"
        stroke="#C6A86B" strokeWidth="0.7" opacity="0"
        strokeDasharray="1400" strokeDashoffset="1400"
        style={{ animation: "blueprintDraw 2s 0.8s ease-out forwards" }}
      />

      {/* Ridge beam */}
      <line
        x1="800" y1="200" x2="800" y2="600"
        stroke="#C6A86B" strokeWidth="0.3" opacity="0"
        strokeDasharray="400" strokeDashoffset="400"
        style={{ animation: "blueprintDraw 0.9s 1.2s ease-out forwards" }}
      />

      {/* Dimension extension lines */}
      <line
        x1="200" y1="640" x2="1400" y2="640"
        stroke="#C6A86B" strokeWidth="0.3" opacity="0"
        strokeDasharray="6 8" strokeDashoffset="1200"
        style={{ animation: "blueprintDraw 2s 2.5s ease-out forwards" }}
      />

      {/* Corner registration marks */}
      {[
        { x: 80, y: 100 }, { x: 1520, y: 100 },
        { x: 80, y: 800 }, { x: 1520, y: 800 },
      ].map((p, i) => (
        <g key={i} opacity="0" style={{ animation: `blueprintFade 0.8s ${2.8 + i * 0.1}s ease-out forwards` }}>
          <line x1={p.x - 12} y1={p.y} x2={p.x + 12} y2={p.y} stroke="#C6A86B" strokeWidth="0.6" />
          <line x1={p.x} y1={p.y - 12} x2={p.x} y2={p.y + 12} stroke="#C6A86B" strokeWidth="0.6" />
        </g>
      ))}

      {/* Annotation dots */}
      {[
        { x: 400, y: 300 }, { x: 1200, y: 300 },
        { x: 800, y: 200 }, { x: 800, y: 600 },
      ].map((p, i) => (
        <circle
          key={`dot-${i}`}
          cx={p.x} cy={p.y} r="3"
          fill="none" stroke="#C6A86B" strokeWidth="0.5"
          opacity="0"
          style={{ animation: `blueprintFade 0.6s ${3 + i * 0.15}s ease-out forwards` }}
        />
      ))}
    </svg>
  );
}

/* ── Mouse parallax tracker ──────────────────────────── */
function useMouseParallax(speed = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let raf: number;
    const handle = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        setOffset({
          x: (e.clientX - cx) * speed,
          y: (e.clientY - cy) * speed,
        });
      });
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handle);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return offset;
}

/* ── Main hero component ─────────────────────────────── */
export function ProjectsCinematicHero() {
  const mouse = useMouseParallax(0.015);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight * 0.88, behavior: "smooth" });
  };

  return (
    <section
      className="relative h-[92vh] sm:h-[95vh] overflow-hidden"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      {/* Layer 1: Blueprint linework with mouse parallax */}
      <div
        className="absolute inset-0 transition-transform duration-[800ms] ease-out"
        style={{
          transform: `translate(${mouse.x}px, ${mouse.y}px)`,
          opacity: ready ? 1 : 0,
          transition: "opacity 0.6s ease-out, transform 800ms ease-out",
        }}
      >
        <BlueprintLinework />
      </div>

      {/* Layer 2: Aerial image overlay — fades in after linework */}
      <div
        className="absolute inset-0 transition-all duration-[2000ms] ease-out"
        style={{
          opacity: ready ? 0.18 : 0,
          transitionDelay: "2s",
          transform: `translate(${mouse.x * 0.5}px, ${mouse.y * 0.5}px) scale(1.09)`,
        }}
      >
        <img
          src={projectsHeroDrone}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Layer 3: Gradient overlays */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to right, hsl(var(--background) / 0.85) 0%, hsl(var(--background) / 0.4) 60%, hsl(var(--background) / 0.7) 100%)",
      }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, hsl(var(--background) / 0.3) 0%, hsl(var(--background) / 0.1) 50%, hsl(var(--background) / 0.9) 100%)",
      }} />

      {/* Layer 4: Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, hsl(var(--background) / 0.35) 100%)",
      }} />

      {/* Layer 5: Grain */}
      <div className="absolute inset-0 pointer-events-none grain-texture" />

      {/* Layer 5: Content — center-left */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="section-container max-w-5xl">
          <div className="max-w-xl">
            {/* Label */}
            <div
              className="flex items-center gap-4 mb-8 opacity-0"
              style={{ animation: "blueprintFade 0.8s 2.4s ease-out forwards" }}
            >
              <div className="w-8 h-px" style={{ backgroundColor: "#C6A86B", opacity: 0.5 }} />
              <p
                className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] font-mono"
                style={{ color: "rgba(198,168,107,0.6)" }}
              >
                Current Project
              </p>
            </div>

            {/* Heading */}
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.05] tracking-[0.02em] mb-6 opacity-0"
              style={{
                color: "#F5F0E8",
                animation: "heroHeadingReveal 1.2s 2.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
              }}
            >
              Main Ridge
              <br />
              Estate
            </h1>

            {/* Subtext */}
            <p
              className="text-sm sm:text-base font-serif italic leading-relaxed mb-3 opacity-0"
              style={{
                color: "rgba(198,168,107,0.45)",
                animation: "blueprintFade 1s 3.4s ease-out forwards",
              }}
            >
              A private equine facility engineered for performance, flow, and long-term durability.
            </p>

            {/* Micro line */}
            <p
              className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] mb-10 opacity-0"
              style={{
                color: "rgba(198,168,107,0.3)",
                animation: "blueprintFade 0.8s 3.7s ease-out forwards",
              }}
            >
              Designed from the ground up. Built to hold up.
            </p>

            {/* Trust signal */}
            <p
              className="text-[10px] sm:text-[11px] font-serif italic mb-10 opacity-0"
              style={{
                color: "rgba(198,168,107,0.2)",
                animation: "blueprintFade 0.8s 4s ease-out forwards",
              }}
            >
              Private projects. Discreet builds. Built for long-term ownership.
            </p>

            {/* CTA */}
            <button
              onClick={scrollToContent}
              className="group inline-flex items-center gap-3 opacity-0 cursor-pointer bg-transparent border-0"
              style={{ animation: "blueprintFade 0.8s 3.8s ease-out forwards" }}
            >
              <span
                className="text-xs sm:text-sm uppercase tracking-[0.25em] font-mono transition-colors duration-300"
                style={{ color: "rgba(198,168,107,0.7)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#C6A86B")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(198,168,107,0.7)")}
              >
                Explore the Build
              </span>
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: "rgba(198,168,107,0.5)" }}
              />
              <div
                className="w-12 h-px transition-all duration-500 group-hover:w-20"
                style={{ backgroundColor: "rgba(198,168,107,0.3)" }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom fade into page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[5]"
        style={{
          background: "linear-gradient(to top, hsl(var(--background)), transparent)",
        }}
      />
    </section>
  );
}
