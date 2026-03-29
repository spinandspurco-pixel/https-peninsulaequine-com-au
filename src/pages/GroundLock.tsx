import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import glIconHero from "@/assets/gl-icon-hero.jpg";
import glAbstractPattern from "@/assets/gl-abstract-pattern.jpg";

export default function GroundLock() {
  const [gateOpen, setGateOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent className="bg-primary border-accent/10 max-w-md text-center p-10 sm:p-14">
          <div className="space-y-6">
            <p className="font-serif text-base sm:text-lg text-primary-foreground/60 italic leading-relaxed">
              GroundLock projects are assessed based on site conditions, scale, and intended use.
            </p>
            <p className="text-[11px] text-primary-foreground/25 leading-relaxed">
              This ensures every installation performs as intended.
            </p>
            <Button
              variant="gold"
              size="lg"
              className="mt-4"
              onClick={() => {
                setGateOpen(false);
                navigate("/site-assessment");
              }}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Layout>
        {/* ═══ 1. HERO — System Identity ══════════════════ */}
        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-black">
          <img
            src={glIconHero}
            alt="GroundLock system mark"
            className="absolute inset-0 w-full h-full object-cover"
            width={1920}
            height={1080}
            loading="eager"
          />

          <div className="relative z-10 text-center px-6" style={{ marginTop: "-8vh" }}>
            <h1
              className="font-serif font-semibold text-white tracking-tight leading-[1.1] opacity-0 animate-fade-in"
              style={{
                fontSize: "clamp(1.6rem, 0.8rem + 4vw, 3.5rem)",
                animationDelay: "300ms",
                animationFillMode: "both",
                animationDuration: "1200ms",
              }}
            >
              GroundLock™
            </h1>

            <p
              className="mt-10 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-white/25 opacity-0 animate-fade-in"
              style={{
                animationDelay: "800ms",
                animationFillMode: "both",
                animationDuration: "1200ms",
              }}
            >
              Directional Interlock System
            </p>
          </div>
        </section>

        {/* ═══ 2. SYSTEM PATTERN — Abstract ═══════════════ */}
        <section className="py-36 sm:py-48 lg:py-56 relative overflow-hidden bg-black">
          <div className="section-container max-w-5xl mx-auto px-6">
            <img
              src={glAbstractPattern}
              alt="GroundLock system pattern"
              className="w-full aspect-[21/9] object-cover opacity-60"
              loading="lazy"
              width={1920}
              height={1080}
            />
            <div className="mt-14 sm:mt-18">
              <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-white/15 text-center">
                Engineered for performance. Built for scale.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ CLOSING ═══════════════════════════════════ */}
        <section className="py-36 sm:py-48 lg:py-56 relative overflow-hidden bg-black">
          <div className="relative z-[1] text-center max-w-md mx-auto px-6">
            <p
              className="font-serif text-xl sm:text-2xl text-white/30 italic tracking-wide leading-[1.4] mb-14"
            >
              Not optional. Foundational.
            </p>
            <Button variant="gold" size="lg" onClick={() => setGateOpen(true)}>
              Apply to Build <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="mt-10">
              <Link
                to="/groundlock/how-it-works"
                className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/12 hover:text-white/25 transition-colors"
              >
                Request System Specs
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
