import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import glIconHero from "@/assets/gl-icon-hero.jpg";
import glAbstractPattern from "@/assets/gl-abstract-pattern.jpg";
import glApplicationHint from "@/assets/gl-application-hint.jpg";

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
            style={{ objectPosition: "52% 48%", transform: "scale(1.15)", filter: "brightness(0.85)" }}
          />


          <div className="relative z-10 text-center px-6" style={{ marginTop: "-10vh", marginLeft: "3vw" }}>
            <h1
              className="font-serif font-semibold text-white tracking-tight leading-[1.1] opacity-0 animate-fade-in"
              style={{
                fontSize: "clamp(1.8rem, 0.9rem + 4.5vw, 4rem)",
                animationDelay: "300ms",
                animationFillMode: "both",
                animationDuration: "1200ms",
              }}
            >
              GroundLock™
            </h1>

            <p
              className="mt-8 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-white/25 opacity-0 animate-fade-in"
              style={{
                animationDelay: "700ms",
                animationFillMode: "both",
                animationDuration: "1200ms",
              }}
            >
              Directional Interlock System
            </p>

            <p
              className="mt-16 font-serif text-[12px] sm:text-[13px] italic text-white/15 opacity-0 animate-fade-in"
              style={{
                animationDelay: "1200ms",
                animationFillMode: "both",
                animationDuration: "1200ms",
              }}
            >
              Built for load. Designed for control.
            </p>

            <p
              className="mt-8 font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/8 opacity-0 animate-fade-in"
              style={{
                animationDelay: "1600ms",
                animationFillMode: "both",
                animationDuration: "1200ms",
              }}
            >
              System in development
            </p>
          </div>
        </section>

        {/* ═══ 2. SYSTEM PRESENCE — Abstract ══════════════ */}
        <section className="py-52 sm:py-64 lg:py-80 relative overflow-hidden bg-black">
          <div className="section-container max-w-5xl mx-auto px-6">
            <img
              src={glAbstractPattern}
              alt="GroundLock system pattern"
              className="w-full aspect-[21/9] object-cover"
              loading="lazy"
              width={1920}
              height={1080}
              style={{ opacity: 0.3, filter: "blur(2px)" }}
            />
            <p className="mt-20 font-serif text-base sm:text-lg text-white/15 text-center tracking-wide italic">
              Directional logic. Structural intent.
            </p>
          </div>
        </section>

        {/* ═══ 3. APPLICATION HINT ════════════════════════ */}
        <section className="py-40 sm:py-52 lg:py-64 relative overflow-hidden bg-black">
          <div className="section-container max-w-5xl mx-auto px-6">
            <img
              src={glApplicationHint}
              alt="Arena surface — GroundLock application"
              className="w-full aspect-[21/9] object-cover"
              loading="lazy"
              width={1920}
              height={1080}
            />
            <div className="mt-16 text-center">
              <p className="font-serif text-base sm:text-lg text-white/20 tracking-wide italic leading-[1.6]">
                Permanent where you need it.
                <br />
                Deployable where you don't.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ CLOSING CTA ═══════════════════════════════ */}
        <section className="py-40 sm:py-52 lg:py-64 relative overflow-hidden bg-black">
          <div className="relative z-[1] text-center max-w-md mx-auto px-6">
            <Button variant="gold" size="lg" onClick={() => setGateOpen(true)}>
              Request Access <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.35em] text-white/12">
              Limited deployment availability
            </p>
          </div>
        </section>
      </Layout>
    </>
  );
}
