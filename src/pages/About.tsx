import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

// Locked image system — 3 distinct images, no repeats from hero
import systemProcess from "@/assets/system-process.jpg";
import systemStructure from "@/assets/system-structure.jpg";
import systemOutcome from "@/assets/system-outcome.jpg";

const SECTIONS = [
  { src: systemProcess, line: "Built by those who understand the ground.", aspect: "aspect-[4/5]" },
  { src: systemStructure, line: "Precision in every layer.", aspect: "aspect-[21/9]" },
  { src: systemOutcome, line: "Environments designed to perform.", aspect: "aspect-[16/9]" },
];

export default function About() {
  useEffect(() => {
    document.title = "About | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);

  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="pt-40 sm:pt-52 pb-20 sm:pb-28">
        <div className="section-container max-w-2xl mx-auto text-center">
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground/85 tracking-tight leading-[1.05] opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Peninsula Equine
          </h1>
          <p
            className="mt-6 font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/20 opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            From Dirt to Dynasty.
          </p>
        </div>
      </section>

      {/* ═══ IMAGE-LED SECTIONS ═══════════════════════════ */}
      {SECTIONS.map((section, i) => (
        <section key={i} className="py-20 sm:py-28">
          <div className="section-container max-w-5xl mx-auto">
            <div
              className="opacity-0 animate-fade-in"
              style={{
                animationDelay: "200ms",
                animationFillMode: "both",
                animationDuration: "800ms",
              }}
            >
              <img
                src={section.src}
                alt={section.line}
                className={`w-full ${section.aspect} object-cover`}
                loading="lazy"
              />
            </div>
            <p
              className="mt-6 font-serif text-lg sm:text-xl text-foreground/40 italic tracking-wide opacity-0 animate-fade-in"
              style={{
                animationDelay: "500ms",
                animationFillMode: "both",
                animationDuration: "800ms",
              }}
            >
              {section.line}
            </p>
          </div>
        </section>
      ))}

      {/* ═══ FINAL CTA ═══════════════════════════════════ */}
      <section className="py-36 sm:py-48">
        <div className="text-center">
          <Link
            to="/contact"
            className="inline-block px-12 py-4 border text-[11px] font-mono uppercase tracking-[0.3em] hover:bg-accent/[0.03] transition-colors duration-500"
            style={{
              borderColor: "hsl(var(--accent) / 0.08)",
              color: "hsl(var(--foreground) / 0.35)",
            }}
          >
            Apply to Build →
          </Link>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/10">
            Selected projects only.
          </p>
        </div>
      </section>
    </Layout>
  );
}
