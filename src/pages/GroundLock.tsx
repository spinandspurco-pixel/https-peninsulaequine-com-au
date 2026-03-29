import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// 4-image system — each distinct in purpose
import glPattern from "@/assets/gl-system-pattern.jpg";
import glDetail from "@/assets/gl-system-detail.jpg";
import glInstall from "@/assets/gl-system-install.jpg";
import systemEvent from "@/assets/system-event.jpg";
import glUnderside from "@/assets/gl-system-underside.jpg";

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
        {/* ═══ 1. HERO — System Pattern ═══════════════════ */}
        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
          <img
            src={glPattern}
            alt="GroundLock directional interlock tessellation pattern"
            className="absolute inset-0 w-full h-full object-cover"
            width={1920}
            height={1080}
            loading="eager"
            style={{ objectPosition: "48% 45%" }}
          />

          <div className="relative z-10 text-center px-6" style={{ marginTop: "-8vh" }}>
            <h1
              className="font-serif font-semibold text-white tracking-tight leading-[1.15] opacity-0 animate-fade-in"
              style={{
                fontSize: "clamp(1.6rem, 0.8rem + 4vw, 3.5rem)",
                animationDelay: "300ms",
                animationFillMode: "both",
                animationDuration: "1200ms",
                textShadow: "0 2px 40px rgba(0,0,0,0.6)",
              }}
            >
              GroundLock™<br />
              <span className="font-light" style={{ fontSize: "0.6em" }}>
                Directional Interlock System
              </span>
            </h1>

            <p
              className="mt-10 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-white/30 opacity-0 animate-fade-in"
              style={{
                animationDelay: "800ms",
                animationFillMode: "both",
                animationDuration: "1200ms",
                textShadow: "0 1px 10px rgba(0,0,0,0.4)",
              }}
            >
              Engineered for performance. Built for scale.
            </p>
          </div>
        </section>

        {/* ═══ 2. DETAIL — Pair Lock ═══════════════════════ */}
        <section className="py-32 sm:py-44 lg:py-52 relative overflow-hidden">
          <div className="section-container max-w-3xl mx-auto px-6">
            <img
              src={glDetail}
              alt="GroundLock directional pair lock — macro detail of interlocking mechanism"
              className="w-full aspect-[4/3] object-cover"
              loading="lazy"
              width={1280}
              height={960}
            />
            <div className="mt-10 sm:mt-14">
              <h2 className="font-serif text-lg sm:text-xl text-foreground/70 tracking-tight">
                Directional Pair Lock
              </h2>
              <p className="mt-3 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-foreground/25">
                Engineered dependency between modules.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ 3. INSTALLATION — Process ══════════════════ */}
        <section className="py-32 sm:py-44 lg:py-52 relative overflow-hidden">
          <div className="section-container max-w-6xl mx-auto">
            <div
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              <img
                src={glInstall}
                alt="GroundLock system installation in progress"
                className="w-full aspect-[21/9] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* ═══ 4. EVENT — Scale ═══════════════════════════ */}
        <section className="py-32 sm:py-44 lg:py-52 relative overflow-hidden">
          <div className="section-container max-w-6xl mx-auto">
            <div
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "800ms" }}
            >
              <img
                src={systemEvent}
                alt="GroundLock deployed at event scale"
                className="w-full aspect-[21/9] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* ═══ CLOSING ═══════════════════════════════════ */}
        <section className="py-36 sm:py-48 lg:py-56 relative overflow-hidden">
          <div className="absolute inset-0 grain-texture opacity-[0.02]" />
          <div className="relative z-[1] text-center max-w-md mx-auto px-6">
            <p
              className="font-serif text-xl sm:text-2xl text-foreground/40 italic tracking-wide leading-[1.4] mb-14"
            >
              Not optional. Foundational.
            </p>
            <Button variant="gold" size="lg" onClick={() => setGateOpen(true)}>
              Apply to Build <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="mt-10">
              <Link
                to="/groundlock/how-it-works"
                className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/15 hover:text-foreground/30 transition-colors"
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
