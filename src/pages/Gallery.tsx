import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { InteractiveMasterplan } from "@/components/masterplan/InteractiveMasterplanV2";
import { Link } from "react-router-dom";

export default function Projects() {
  useEffect(() => {
    document.title = "Projects | Peninsula Equine";
    return () => { document.title = "Peninsula Equine"; };
  }, []);

  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-48 sm:pt-56 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 engineering-grid opacity-[0.03]" aria-hidden="true" />
        <div className="section-container max-w-3xl mx-auto text-center relative z-10">
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground/85 tracking-tight leading-[0.9] opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "800ms" }}
          >
            Selected Work
          </h1>
        </div>
      </section>

      {/* ═══ INTERACTIVE MASTERPLAN ═════════════════════ */}
      <InteractiveMasterplan />

      {/* ═══ FINAL CTA ════════════════════════════════ */}
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
            Start a Project →
          </Link>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.35em] text-foreground/10">
            Selected builds only.
          </p>
        </div>
      </section>
    </Layout>
  );
}
