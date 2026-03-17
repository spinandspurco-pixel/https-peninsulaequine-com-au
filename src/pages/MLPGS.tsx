import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { BlueprintScene } from "@/components/BlueprintScene";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import peRopeRing from "@/assets/pe-rope-ring.png";

const FEATURES = [
  { title: "Modular", desc: "Interchangeable panels. Reconfigure in hours, not weeks." },
  { title: "Load-Bearing", desc: "Engineered for equine traffic, vehicles, and heavy machinery." },
  { title: "Permeable", desc: "Natural drainage eliminates pooling and preserves subgrade." },
  { title: "Sustainable", desc: "Recycled-content core with a 25-year design life." },
];

export default function MLPGS() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Animated SVG grid line drawing
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll("path");
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
      p.style.animation = `draw 1.8s ${i * 0.15}s ease-out forwards`;
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("mlpgs_interest").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      message: form.message.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong — please try again.");
      console.error(error);
    } else {
      setSubmitted(true);
      toast.success("You're on the list!", { description: "We'll be in touch soon." });
    }
  };

  return (
    <Layout>
      {/* CSS for SVG draw animation */}
      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.18; }
        }
      `}</style>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-primary/70" />
        <BlueprintScene preset="elevation" className="absolute inset-0" />

        {/* Animated blueprint grid overlay */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* Horizontal grid lines */}
          {[160, 320, 480, 640].map((y) => (
            <path key={`h${y}`} d={`M0 ${y} H1200`} stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" opacity="0.15" />
          ))}
          {/* Vertical grid lines */}
          {[200, 400, 600, 800, 1000].map((x) => (
            <path key={`v${x}`} d={`M${x} 0 V800`} stroke="hsl(var(--accent))" strokeWidth="0.5" fill="none" opacity="0.15" />
          ))}
          {/* Modular panel outline */}
          <path d="M300 200 H900 V600 H300 Z" stroke="hsl(var(--accent))" strokeWidth="1.2" fill="none" opacity="0.25" />
          {/* Internal grid — the 'modular' cells */}
          <path d="M300 400 H900" stroke="hsl(var(--accent))" strokeWidth="0.8" fill="none" opacity="0.2" />
          <path d="M500 200 V600" stroke="hsl(var(--accent))" strokeWidth="0.8" fill="none" opacity="0.2" />
          <path d="M700 200 V600" stroke="hsl(var(--accent))" strokeWidth="0.8" fill="none" opacity="0.2" />
          {/* Dimension arrows */}
          <path d="M300 180 H900" stroke="hsl(var(--accent))" strokeWidth="0.6" fill="none" opacity="0.3" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
          <defs>
            <marker id="arrow" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L6 3 L0 6 Z" fill="hsl(var(--accent))" opacity="0.4" />
            </marker>
          </defs>
        </svg>

        <div className="section-container relative z-10 max-w-3xl mx-auto text-center space-y-6 py-32">
          <p className="text-overline text-accent tracking-[0.3em] animate-fade-in">World First</p>
          <h1 className="heading-display text-primary-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] leading-[1.05] animate-fade-in">
            MLPGS
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 font-serif italic animate-fade-in">
            Modular Load-Bearing Permeable Ground System
          </p>
          <p className="text-primary-foreground/60 max-w-lg mx-auto leading-relaxed animate-fade-in">
            A revolutionary ground system engineered for the equine industry — designed to be reconfigured, not replaced.
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs animate-fade-in"
            onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            Register Interest <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 bg-card">
        <div className="section-container max-w-5xl mx-auto">
          <p className="text-overline text-accent tracking-[0.25em] text-center mb-3">Engineered Different</p>
          <h2 className="heading-section text-center mb-14">Four Pillars of Innovation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group border border-border rounded-lg p-8 bg-background transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent/60 mb-2 font-mono">0{i + 1}</p>
                <h3 className="font-serif text-xl mb-2 group-hover:text-accent transition-colors">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REGISTER INTEREST ─── */}
      <section ref={formRef} className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <BlueprintScene preset="barn" className="absolute inset-0" />
        <div className="section-container relative z-10 max-w-lg mx-auto text-center">
          <img src={peRopeRing} alt="" className="mx-auto h-16 w-16 mb-6 opacity-40 animate-rope-drift" loading="lazy" />
          <p className="text-overline text-accent tracking-[0.25em] mb-2">Be First</p>
          <h2 className="heading-section text-primary-foreground mb-3">Register Your Interest</h2>
          <p className="text-primary-foreground/60 text-sm mb-10 max-w-sm mx-auto">
            Join the waitlist for the world's first modular permeable ground system. We'll notify you before public launch.
          </p>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-10 animate-fade-in">
              <CheckCircle2 className="h-14 w-14 text-accent" />
              <p className="text-lg font-serif">You're on the list.</p>
              <p className="text-primary-foreground/60 text-sm">We'll be in touch with exclusive updates.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  name="name"
                  placeholder="Full name *"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={30}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                />
                <Input
                  name="company"
                  placeholder="Company / Facility"
                  value={form.company}
                  onChange={handleChange}
                  maxLength={150}
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
              <Textarea
                name="message"
                placeholder="Tell us about your project or interest…"
                value={form.message}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 resize-none"
              />
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-[0.12em] text-xs"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Join the Waitlist <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
