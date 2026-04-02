import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockHero } from "@/components/groundlock/GroundLockHero";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ── Animated counter ── */
function AnimatedStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (!ref.current || triggered.current) return;
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        triggered.current = true;
        observer.disconnect();
        const duration = 1400;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary-foreground/80 tracking-tight">
        {count}{suffix}
      </p>
      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.35em] text-accent/30">{label}</p>
    </div>
  );
}

/* ── Tessellation Animation ── */
function TessellationAnimation() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.2 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const rows = 3;
  const cols = 7;
  const panels = Array.from({ length: rows * cols }, (_, i) => ({
    row: Math.floor(i / cols),
    col: i % cols,
    inverted: (Math.floor(i / cols) + i % cols) % 2 === 1,
  }));

  return (
    <div ref={ref} className="relative w-full max-w-lg mx-auto py-8">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {panels.map((p, i) => {
          const delay = reducedMotion ? 0 : (p.row * 80 + p.col * 60);
          return (
            <div
              key={i}
              className="aspect-[1/1.4] rounded-t-full border border-accent/15 transition-all"
              style={{
                opacity: visible ? 0.5 + (p.row * 0.15) : 0,
                transform: visible
                  ? `rotate(${p.inverted ? 180 : 0}deg) scale(1)`
                  : `rotate(${p.inverted ? 180 : 0}deg) scale(0.6)`,
                transition: `opacity 600ms ${delay}ms cubic-bezier(0.45,0,0.15,1), transform 600ms ${delay}ms cubic-bezier(0.45,0,0.15,1)`,
                backgroundColor: `hsl(var(--accent) / ${0.04 + p.row * 0.02})`,
              }}
            />
          );
        })}
      </div>
      <p className="mt-6 font-mono text-[8px] uppercase tracking-[0.4em] text-accent/15 text-center">
        Crown-into-U tessellation
      </p>
    </div>
  );
}

/* ── Interactive Layer Stack ── */
function LayerStack() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  const layers = [
    { label: "Riding Surface", depth: "Variable", color: "hsl(var(--accent) / 0.08)", desc: "Sand, fibre, or composite — tuned to discipline" },
    { label: "GroundLock™ Panel", depth: "15mm wall", color: "hsl(var(--accent) / 0.18)", desc: "Interlocking horseshoe modules — directional load transfer" },
    { label: "Geotextile Membrane", depth: "Separation", color: "hsl(var(--accent) / 0.06)", desc: "Prevents migration between aggregate and surface" },
    { label: "Compacted Aggregate", depth: "150mm+", color: "hsl(var(--accent) / 0.1)", desc: "Engineered drainage layer — graded to fall" },
    { label: "Subgrade", depth: "Native", color: "hsl(var(--accent) / 0.04)", desc: "Prepared and compacted natural ground" },
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-1">
        {layers.map((layer, i) => {
          const isActive = activeLayer === i;
          return (
            <button
              key={i}
              className="w-full text-left transition-all duration-400 focus:outline-none group"
              onMouseEnter={() => setActiveLayer(i)}
              onMouseLeave={() => setActiveLayer(null)}
              onClick={() => setActiveLayer(isActive ? null : i)}
              style={{
                padding: isActive ? "16px 20px" : "10px 20px",
                backgroundColor: isActive ? layer.color : "transparent",
                borderLeft: isActive ? "2px solid hsl(var(--accent) / 0.3)" : "2px solid transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[10px] uppercase tracking-[0.25em] transition-colors duration-300 ${isActive ? "text-primary-foreground/70" : "text-primary-foreground/30"}`}>
                  {layer.label}
                </span>
                <span className={`font-mono text-[9px] tracking-[0.2em] transition-colors duration-300 ${isActive ? "text-accent/50" : "text-accent/15"}`}>
                  {layer.depth}
                </span>
              </div>
              <div
                className="overflow-hidden transition-all duration-400"
                style={{ maxHeight: isActive ? "40px" : "0", opacity: isActive ? 1 : 0 }}
              >
                <p className="mt-2 text-[11px] text-primary-foreground/35 leading-[1.6]">{layer.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Interest Form ── */
function InterestForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", location: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("groundlock_interest" as any).insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        location: form.location.trim() || null,
        message: form.message.trim() || null,
        interest_type: "property",
        source_page: "/groundlock-systems",
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Interest registered successfully");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="font-serif text-lg text-primary-foreground/60 italic">Thank you.</p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-accent/30">
          We'll review your details and respond if aligned.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <Input placeholder="Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="bg-transparent border-accent/15 text-primary-foreground/70 placeholder:text-accent/20 text-sm" />
      <Input placeholder="Email *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className="bg-transparent border-accent/15 text-primary-foreground/70 placeholder:text-accent/20 text-sm" />
      <Input placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-transparent border-accent/15 text-primary-foreground/70 placeholder:text-accent/20 text-sm" />
      <Input placeholder="Property Location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="bg-transparent border-accent/15 text-primary-foreground/70 placeholder:text-accent/20 text-sm" />
      <Textarea placeholder="Tell us about your project" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="bg-transparent border-accent/15 text-primary-foreground/70 placeholder:text-accent/20 text-sm min-h-[80px]" />
      <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Register Interest"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
}

export default function GroundLockSystems() {
  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-36 sm:pt-48 pb-24 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container relative z-10 max-w-2xl mx-auto text-center">
          <div
            className="flex items-center justify-center gap-4 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            <div className="w-8 h-px bg-accent/25" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/40">P.E. GroundLock™</span>
            <div className="w-8 h-px bg-accent/25" />
          </div>
          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-primary-foreground/90 tracking-tight leading-[1.05] mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            The foundation every<br />serious build requires.
          </h1>
          <p
            className="mt-4 font-mono text-[9px] uppercase tracking-[0.35em] text-accent/20 opacity-0 animate-fade-in"
            style={{ animationDelay: "800ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            Currently in development — register interest below
          </p>
          <div
            className="flex justify-center mt-12 opacity-0 animate-fade-in"
            style={{ animationDelay: "900ms", animationFillMode: "both", animationDuration: "1400ms" }}
          >
            <GroundLockHero size="max-w-[200px]" opacity={0.6} />
          </div>
        </div>
      </section>

      {/* ═══ PERFORMANCE STATS ═══════════════════════════ */}
      <section className="py-32 sm:py-44 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-3xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/25 mx-auto mb-12" />
            <p className="text-overline mb-16 text-accent/40 text-center">System Performance</p>
          </RevealOnScroll>
          <div className="grid grid-cols-3 gap-8 sm:gap-12">
            <AnimatedStat value={15} suffix="mm" label="Wall thickness" />
            <AnimatedStat value={100} suffix="%" label="Load transfer" />
            <AnimatedStat value={0} suffix="∞" label="Maintenance cycles" />
          </div>
        </div>
      </section>

      {/* ═══ TESSELLATION ════════════════════════════════ */}
      <section className="py-32 sm:py-44 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <RevealLine className="mb-12 mx-auto" width="w-8" />
            <p className="text-overline mb-6 text-center">How It Locks</p>
            <p className="text-center font-serif text-[13px] italic text-foreground/25 mb-12">
              Inverted rows interlock mechanically — no adhesive, no fasteners.
            </p>
          </RevealOnScroll>
          <TessellationAnimation />
        </div>
      </section>

      {/* ═══ LAYER STACK ═════════════════════════════════ */}
      <section className="py-32 sm:py-44 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/25 mx-auto mb-12" />
            <p className="text-overline mb-6 text-accent/40 text-center">System Layers</p>
            <p className="text-center font-mono text-[8px] uppercase tracking-[0.35em] text-accent/15 mb-16">
              Hover or tap to explore each layer
            </p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <LayerStack />
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ WHERE IT APPLIES ════════════════════════════ */}
      <section className="py-32 sm:py-44 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <RevealLine className="mb-12" width="w-8" />
            <p className="text-overline mb-10">Where It Applies</p>
          </RevealOnScroll>
          <RevealOnScroll direction="up" delay={100}>
            <div className="space-y-8">
              {[
                { zone: "Arenas", note: "Clear-span indoor and outdoor — any discipline" },
                { zone: "Event Sites", note: "Temporary or permanent high-traffic deployment" },
                { zone: "Access Zones", note: "Float access, driveways, stable surrounds" },
              ].map(item => (
                <div key={item.zone} className="group">
                  <div className="flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-accent/25 shrink-0 group-hover:bg-accent/50 transition-colors duration-300" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/50 group-hover:text-foreground/70 transition-colors duration-300">
                      {item.zone}
                    </span>
                  </div>
                  <p className="ml-6 mt-1 text-[12px] text-foreground/20 leading-[1.6]">{item.note}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          {/* Event infrastructure link */}
          <RevealOnScroll direction="up" delay={200}>
            <div className="mt-16 pt-12 border-t border-border/10">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/20 mb-4">For event managers & commercial operators</p>
              <Link
                to="/groundlock/events"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-accent/50 hover:text-accent/80 transition-colors duration-500"
              >
                Event Infrastructure <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ REGISTER INTEREST ═══════════════════════════ */}
      <section className="py-32 sm:py-44 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/25 mx-auto mb-12" />
            <p className="text-overline mb-4 text-accent/40 text-center">Register Interest</p>
            <p className="text-center font-serif text-[13px] italic text-primary-foreground/25 mb-4">
              GroundLock™ is currently in development.
            </p>
            <p className="text-center font-mono text-[8px] uppercase tracking-[0.35em] text-accent/15 mb-12">
              Register below to join the deployment list
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <InterestForm />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <div className="mt-12 text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/15">
                Ready for a full assessment?
              </p>
              <Link
                to="/site-assessment"
                className="inline-flex items-center gap-2 mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-accent/40 hover:text-accent/70 transition-colors duration-500"
              >
                Request Site Assessment <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ CLOSING ═════════════════════════════════════ */}
      <section className="py-28 sm:py-36 bg-background">
        <div className="text-center">
          <RevealOnScroll direction="up">
            <p className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground/60 italic tracking-wide leading-[1.3]">
              Not optional. Foundational.
            </p>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
