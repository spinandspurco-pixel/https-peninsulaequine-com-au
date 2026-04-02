import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Clock, Repeat } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { GroundLockHero } from "@/components/groundlock/GroundLockHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function InterestForm({ interestType, sourcePage }: { interestType: string; sourcePage: string }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", location: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("groundlock_interest" as any).insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        location: form.location.trim() || null,
        message: form.message.trim() || null,
        interest_type: interestType,
        source_page: sourcePage,
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
      <Input placeholder="Company / Organisation" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="bg-transparent border-accent/15 text-primary-foreground/70 placeholder:text-accent/20 text-sm" />
      <Input placeholder="Location / Region" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="bg-transparent border-accent/15 text-primary-foreground/70 placeholder:text-accent/20 text-sm" />
      <Textarea placeholder="Tell us about your site or event" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="bg-transparent border-accent/15 text-primary-foreground/70 placeholder:text-accent/20 text-sm min-h-[80px]" />
      <Button type="submit" variant="gold" size="lg" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Register Interest"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
}

export default function GroundLockEvents() {
  return (
    <Layout>
      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="relative pt-40 sm:pt-52 pb-28 sm:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container relative z-10 max-w-2xl mx-auto text-center">
          <div
            className="flex items-center justify-center gap-4 mb-8 opacity-0 animate-fade-in"
            style={{ animationDelay: "200ms", animationFillMode: "both", animationDuration: "1000ms" }}
          >
            <div className="w-8 h-px bg-accent/25" />
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-accent/35">
              GroundLock™ — Event Infrastructure
            </span>
            <div className="w-8 h-px bg-accent/25" />
          </div>

          <h1
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-primary-foreground/90 tracking-tight leading-[1.05] opacity-0 animate-fade-in"
            style={{ animationDelay: "500ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            Protect the ground.<br />Deploy with confidence.
          </h1>

          <p
            className="mt-10 font-serif text-[13px] italic text-primary-foreground/25 opacity-0 animate-fade-in max-w-md mx-auto"
            style={{ animationDelay: "900ms", animationFillMode: "both", animationDuration: "1200ms" }}
          >
            Permanent or temporary ground stabilisation for venues, events, and high-traffic commercial sites.
          </p>

          <div
            className="flex justify-center mt-14 opacity-0 animate-fade-in"
            style={{ animationDelay: "1100ms", animationFillMode: "both", animationDuration: "1400ms" }}
          >
            <GroundLockHero size="max-w-[140px]" opacity={0.45} />
          </div>
        </div>
      </section>

      {/* ═══ THE PROBLEM ═════════════════════════════════ */}
      <section className="py-32 sm:py-44 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-lg mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <RevealLine className="mb-12" width="w-8" />
            <p className="text-overline mb-10">The Problem</p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <p className="text-[14px] text-foreground/40 leading-[1.8]">
              Every major equestrian event tears up the ground it runs on. Post-event remediation costs thousands. Venues lose weeks of availability. The surface never fully recovers.
            </p>
            <p className="mt-6 text-[14px] text-foreground/40 leading-[1.8]">
              GroundLock™ eliminates this cycle — protecting the surface under load and enabling rapid redeployment without remediation.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══ VALUE PILLARS ═══════════════════════════════ */}
      <section className="py-32 sm:py-44 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.02]" />
        <div className="section-container max-w-3xl mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <div className="w-8 h-px bg-accent/25 mx-auto mb-12" />
            <p className="text-overline mb-16 text-accent/40 text-center">Why Event Operators Choose GroundLock</p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
            {[
              { icon: Shield, title: "Ground Protection", desc: "Load is distributed across interlocking panels — not concentrated into the soil." },
              { icon: Clock, title: "Rapid Deployment", desc: "Modular system installs in hours, not days. No adhesives. No curing." },
              { icon: Repeat, title: "Repeatable Use", desc: "Remove, store, redeploy. The surface stays intact season after season." },
            ].map(({ icon: Icon, title, desc }) => (
              <RevealOnScroll key={title} direction="up" delay={100}>
                <div className="text-center">
                  <Icon className="w-5 h-5 text-accent/30 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary-foreground/55 mb-3">{title}</p>
                  <p className="text-[12px] text-primary-foreground/30 leading-[1.7]">{desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHO THIS IS FOR ═════════════════════════════ */}
      <section className="py-32 sm:py-44 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grain-texture opacity-[0.025]" />
        <div className="section-container max-w-md mx-auto relative z-[1]">
          <RevealOnScroll direction="up">
            <RevealLine className="mb-12" width="w-8" />
            <p className="text-overline mb-10">Who This Is For</p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <div className="space-y-6">
              {[
                { label: "Event Managers", note: "Equestrian events, agricultural shows, multi-day festivals" },
                { label: "Venue Operators", note: "Permanent and semi-permanent competition surfaces" },
                { label: "Investors & Developers", note: "Equestrian property development, training facilities" },
                { label: "Councils & Organisations", note: "Public equestrian infrastructure, showgrounds" },
              ].map(item => (
                <div key={item.label} className="group">
                  <div className="flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-accent/25 shrink-0 group-hover:bg-accent/50 transition-colors duration-300" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/50 group-hover:text-foreground/70 transition-colors duration-300">
                      {item.label}
                    </span>
                  </div>
                  <p className="ml-6 mt-1 text-[12px] text-foreground/20 leading-[1.6]">{item.note}</p>
                </div>
              ))}
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
            <p className="text-center font-serif text-[13px] italic text-primary-foreground/25 mb-12">
              GroundLock™ is currently in development. Register below to secure early access.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={100}>
            <InterestForm interestType="event" sourcePage="/groundlock/events" />
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <div className="mt-12 text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.35em] text-accent/15">
                Or request a full site assessment
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
            <p className="font-serif text-lg sm:text-xl text-foreground/40 italic tracking-wide">
              Built to interlock. Not just sit in place.
            </p>
          </RevealOnScroll>
        </div>
      </section>
    </Layout>
  );
}
