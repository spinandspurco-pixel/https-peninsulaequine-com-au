import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import equusRidgeHero from "@/assets/equus-ridge-hero.jpg";

const FRAGMENTS = ["Performance", "Community", "Land", "Experience"];

const EquusRidge = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", interest_type: "general", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("equus_ridge_interest").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      interest_type: form.interest_type,
      message: form.message.trim() || null,
      source_page: "equus-ridge",
    });

    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
      toast.success("Interest registered successfully.");
    }
  };

  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={equusRidgeHero}
            alt="Luxury equine estate at golden hour"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            style={{ filter: "brightness(0.82) contrast(1.1) saturate(0.8)" }}
          />
          <div className="absolute inset-0 bg-background/40" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <p
            className="text-[10px] font-mono uppercase tracking-[0.35em] text-muted-foreground/30 mb-10 opacity-0 animate-fade-in"
            style={{ animationDelay: "300ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Equus Ridge
          </p>
          <h1
            className="heading-display text-foreground mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            A new standard for<br />equine experience.
          </h1>
          <p
            className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/20 opacity-0 animate-fade-in"
            style={{ animationDelay: "1200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            Coming soon.
          </p>
        </div>
      </section>

      {/* ═══ FRAGMENTS ═══════════════════════════════════ */}
      <section className="py-36 sm:py-48 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-xs mx-auto relative z-[1]">
          <div className="space-y-10">
            {FRAGMENTS.map((word, i) => (
              <RevealOnScroll key={word} direction="up" delay={i * 150}>
                <p className="text-[13px] text-primary-foreground/35 tracking-[0.2em] uppercase font-mono text-center">
                  {word}
                </p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MORE THAN A LOCATION ════════════════════════ */}
      <section className="py-36 sm:py-48 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/20 mx-auto mb-14" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <p className="font-serif text-xl sm:text-2xl text-foreground/55 italic tracking-wide leading-[1.4] text-center mb-16">
              More than a location.
            </p>
          </RevealOnScroll>

          <div className="space-y-6">
            {[
              "Built environments",
              "Live performance",
              "Community",
              "High-level equine events",
            ].map((item, i) => (
              <RevealOnScroll key={item} direction="up" delay={200 + i * 100}>
                <p className="flex items-center gap-4 text-[13px] text-foreground/35 leading-[1.7]">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/25 shrink-0" />
                  {item}
                </p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REGISTER INTEREST ═══════════════════════════ */}
      <section className="py-36 sm:py-48 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <p className="font-serif text-xl sm:text-2xl text-primary-foreground/45 italic tracking-wide leading-[1.4] text-center mb-4">
              This is where it all comes together.
            </p>
            <p className="font-serif text-lg text-primary-foreground/30 italic tracking-wide leading-[1.4] text-center mb-14">
              Built on the same principles. Expanded.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-8 h-8 text-accent/50 mx-auto mb-4" />
                <p className="font-serif text-lg text-primary-foreground/50 italic mb-2">Thank you.</p>
                <p className="text-[11px] text-primary-foreground/25 font-mono uppercase tracking-[0.2em]">
                  We'll be in touch when it's time.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary-foreground/20 text-center mb-8">
                  Register Interest
                </p>

                <Input
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="bg-primary-foreground/[0.04] border-primary-foreground/10 text-primary-foreground/70 placeholder:text-primary-foreground/15 text-[13px] h-11"
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-primary-foreground/[0.04] border-primary-foreground/10 text-primary-foreground/70 placeholder:text-primary-foreground/15 text-[13px] h-11"
                />
                <Input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-primary-foreground/[0.04] border-primary-foreground/10 text-primary-foreground/70 placeholder:text-primary-foreground/15 text-[13px] h-11"
                />

                <Select
                  value={form.interest_type}
                  onValueChange={(v) => setForm(prev => ({ ...prev, interest_type: v }))}
                >
                  <SelectTrigger className="bg-primary-foreground/[0.04] border-primary-foreground/10 text-primary-foreground/50 text-[13px] h-11">
                    <SelectValue placeholder="I'm interested in…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Interest</SelectItem>
                    <SelectItem value="visit">Future Visit</SelectItem>
                    <SelectItem value="invest">Investment Opportunity</SelectItem>
                    <SelectItem value="collaborate">Collaboration / Partnership</SelectItem>
                    <SelectItem value="event">Event Hosting</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Tell us a little more (optional)"
                  value={form.message}
                  onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="bg-primary-foreground/[0.04] border-primary-foreground/10 text-primary-foreground/70 placeholder:text-primary-foreground/15 text-[13px] resize-none"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 border border-primary-foreground/10 text-[11px] font-mono uppercase tracking-[0.25em] text-primary-foreground/30 hover:text-primary-foreground/50 hover:border-primary-foreground/20 transition-all duration-500 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {submitting ? "Submitting…" : "Register Interest →"}
                </button>

                <p className="text-[9px] text-primary-foreground/12 font-mono uppercase tracking-[0.2em] text-center mt-4">
                  Early access · No obligation
                </p>
              </form>
            )}
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
};

export default EquusRidge;