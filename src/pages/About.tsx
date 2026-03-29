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
      <section className="pt-48 sm:pt-64 pb-28 sm:pb-40">
        <div className="section-container max-w-2xl mx-auto text-center">
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground/90 tracking-tight leading-[0.95] opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Built with intent.
          </h1>
          <p
            className="mt-12 text-[13px] sm:text-[14px] text-foreground/30 leading-[1.9] max-w-lg mx-auto opacity-0 animate-fade-in"
            style={{ animationDelay: "600ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Peninsula Equine creates equine environments with a focus on structure, performance, and long-term durability. Every build is informed not just by construction, but by an understanding of how horses move, load, and interact with the ground beneath them.
          </p>
          <p
            className="mt-14 font-mono text-[9px] uppercase tracking-[0.45em] text-foreground/12 opacity-0 animate-fade-in"
            style={{ animationDelay: "900ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Engineered infrastructure. Considered execution.
          </p>
        </div>
      </section>

      {/* ═══ IMAGE-LED SECTIONS ═══════════════════════════ */}
      {SECTIONS.map((section, i) => (
        <section key={i} className="py-28 sm:py-36">
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
                style={{ filter: "brightness(1.3) contrast(1.06)" }}
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
