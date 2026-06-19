import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RevealLine, RevealOnScroll } from "@/components/RevealOnScroll";

import heroAsset from "@/assets/uploads/approved-aberdeen-rider-exterior-storm.png.asset.json";
import arenaVaulted from "@/assets/uploads/approved-covered-arena-interior-night-v2.png.asset.json";
import stableStallAsset from "@/assets/uploads/approved-stable-stall-interior-symmetric.png.asset.json";
import viewingLoungeAsset from "@/assets/uploads/approved-aberdeen-viewing-lounge.png.asset.json";
import aisleDetailAsset from "@/assets/uploads/approved-stable-aisle-detail-warm-light.png.asset.json";
import tackRoomAsset from "@/assets/uploads/approved-tack-room-joinery.png.asset.json";
...
        <section className="relative min-h-[82vh] overflow-hidden border-b border-accent/10">
          <img
            src={heroAsset.url}
            alt="Aberdeen exterior at dusk with rider passing the completed arena and stable frontage beneath a dramatic storm sky"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 52%", filter: "brightness(0.62) contrast(1.08) saturate(0.76)" }}
          />
...
        {/* ====== SECTION 2 — STABLE FLOW ====== */}
        <section className="border-b border-accent/10 bg-background py-[clamp(5rem,3.5rem+6vw,8.5rem)]">
          <div className="section-container mx-auto max-w-[1480px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
              <RevealOnScroll direction="up" duration={1100} className="lg:col-span-7 order-1 lg:order-2">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={stableStallAsset.url}
                    alt="Aberdeen stable stall interior with black steel framing, timber lower walls and warm overhead light"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: "50% 50%", filter: "brightness(0.8) contrast(1.08) saturate(0.76)" }}
                  />
                </div>
              </RevealOnScroll>

              <div className="lg:col-span-5 order-2 lg:order-1">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.48em] text-accent/55">
                    Stable Flow
                  </p>
                  <h2 className="mt-5 font-serif leading-[1] tracking-[-0.025em] text-foreground/92 text-[clamp(1.85rem,1.2rem+2vw,3rem)]">
                    Black steel, warm timber and practical spacing create a stable environment built for care, movement and daily handling.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-12" delay={200} className="mt-8" />
                <RevealOnScroll direction="up" duration={1000} delay={180}>
                  <p className="mt-8 max-w-xl font-sans font-light leading-[1.8] text-[15px] text-foreground/58">
                    The stable precinct is arranged around the rhythm of daily work — feed, turnout, grooming, tacking up, returning. Every dimension is shaped by what happens at 6am on a Tuesday, not by what photographs well.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>
...
        {/* ====== SECTION 4 — DETAIL & FABRICATION ====== */}
        <section className="border-b border-accent/10 bg-background py-[clamp(5rem,3.5rem+6vw,8.5rem)]">
          <div className="section-container mx-auto max-w-[1320px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.48em] text-accent/55">
                    Detail & Fabrication
                  </p>
                  <h2 className="mt-5 font-serif leading-[1] tracking-[-0.025em] text-foreground/92 text-[clamp(1.85rem,1.2rem+2vw,3rem)]">
                    The smaller details carry the same discipline as the larger structure — hardware, junctions, finishes and daily-use durability.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-10" delay={220} className="mt-8" />
                <RevealOnScroll direction="up" duration={1000} delay={260}>
                  <p className="mt-8 max-w-lg font-sans font-light leading-[1.8] text-[15px] text-foreground/58">
                    Black steel, warm timber, clean lines and practical finishes give the facility a refined but durable character. Every junction is resolved because the early work was done properly.
                  </p>
                </RevealOnScroll>
              </div>

              <RevealOnScroll direction="up" duration={1150} className="lg:col-span-7 order-1 lg:order-2">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={aisleDetailAsset.url}
                    alt="Aberdeen stable aisle detail with black steel posts, timber stall fronts and warm late light across the joinery"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: "50% 50%", filter: "brightness(0.8) contrast(1.08) saturate(0.78)" }}
                  />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ====== SECTION 5 — UTILITY / TACK / CARE SPACES ====== */}
        <section className="border-b border-accent/10 bg-background py-[clamp(5rem,3.5rem+6vw,8.5rem)]">
          <div className="section-container mx-auto max-w-[1480px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[clamp(2rem,1.5rem+2vw,4rem)] items-center">
              <RevealOnScroll direction="up" duration={1100} className="lg:col-span-8">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={tackRoomAsset.url}
                    alt="Aberdeen tack room with timber joinery, bridle storage, saddle organisation and integrated sink bench"
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: "50% 50%", filter: "brightness(0.82) contrast(1.06) saturate(0.78)" }}
                  />
                </div>
              </RevealOnScroll>

              <div className="lg:col-span-4 lg:pt-8">
                <RevealOnScroll direction="up" duration={900}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.48em] text-accent/55">
                    Utility / Tack / Care
                  </p>
                  <h2 className="mt-5 font-serif leading-[1] tracking-[-0.025em] text-foreground/92 text-[clamp(1.85rem,1.2rem+2vw,3rem)]">
                    Support spaces are part of the system, not afterthoughts.
                  </h2>
                </RevealOnScroll>
                <RevealLine width="w-12" delay={200} className="mt-8" />
                <RevealOnScroll direction="up" duration={1000} delay={180}>
                  <p className="mt-8 max-w-xl font-sans font-light leading-[1.8] text-[15px] text-foreground/58">
                    Tack rooms, wash bays, feed storage and utility areas are planned into the layout from the first sketch. When the daily workflow is considered early, the building becomes easier to maintain and more pleasant to use.
                  </p>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* ====== CLOSING CTA ====== */}
        <section className="bg-background py-[clamp(5rem,4rem+5vw,8rem)]">
          <div className="section-container mx-auto max-w-5xl px-6 text-center">
            <RevealOnScroll direction="up" duration={1000}>
              <p className="font-serif text-foreground/88 leading-[1.18] tracking-[-0.022em] text-[clamp(1.7rem,1.2rem+1.7vw,2.6rem)]">
                Start with the ground. Build the legacy.
              </p>
            </RevealOnScroll>
            <RevealOnScroll direction="up" duration={1000} delay={140}>
              <p className="mx-auto mt-6 max-w-xl font-sans font-light leading-[1.7] text-[15px] text-foreground/55">
                Talk to Peninsula Equine about arenas, equine facilities and rural builds that need to perform without compromise.
              </p>
            </RevealOnScroll>
            <RevealLine width="w-12" delay={240} className="mx-auto mt-12" />
            <RevealOnScroll direction="up" duration={1100} delay={260}>
              <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
                <Link
                  to="/selected-works"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-[10px] tracking-[0.42em] text-foreground/62 transition-colors duration-500 hover:text-foreground"
                >
                  <span className="h-px w-8 bg-accent/45 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                  Back to Selected Works
                </Link>
                <Link
                  to="/site-assessment"
                  className="group inline-flex items-center gap-3 font-mono uppercase text-[10px] tracking-[0.42em] text-accent transition-colors duration-500 hover:text-foreground"
                >
                  Request Assessment
                  <span className="h-px w-8 bg-accent transition-all duration-700 group-hover:w-14" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </article>
    </Layout>
  );
}
