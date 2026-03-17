import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { PageHeader } from "@/components/PageHeader";
import { InquiryForm } from "@/components/InquiryForm";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { RevealOnScroll, RevealLine } from "@/components/RevealOnScroll";
import { siteConfig } from "@/data/content";
import { PolicyDownloadCenter } from "@/components/PolicyDownloadCenter";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { InteractiveMap } from "@/components/InteractiveMap";

// Background image for header parallax
import aberdeenInterior from "@/assets/aberdeen-barn-interior.jpg";
import blueprintFacility from "@/assets/blueprint-facility.png";

function ContactInfo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
          Get in Touch
        </h3>
        <ul className="space-y-4">
          {[
            {
              icon: Phone,
              label: "Phone",
              value: siteConfig.phone,
              href: `tel:${siteConfig.phone}`,
            },
            {
              icon: Mail,
              label: "Email",
              value: siteConfig.email,
              href: `mailto:${siteConfig.email}`,
            },
          ].map((item, i) => (
            <RevealOnScroll key={item.label} direction="left" stagger={i} staggerInterval={120}>
              <li>
                <a
                  href={item.href}
                  className="flex items-start gap-4 text-muted-foreground hover:text-accent transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <item.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p>{item.value}</p>
                  </div>
                </a>
              </li>
            </RevealOnScroll>
          ))}
          <RevealOnScroll direction="left" stagger={2} staggerInterval={120}>
            <li className="flex items-start gap-4 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p>
                  {siteConfig.address.street}<br />
                  {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
                </p>
              </div>
            </li>
          </RevealOnScroll>
          <RevealOnScroll direction="left" stagger={3} staggerInterval={120}>
            <li className="flex items-start gap-4 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Hours</p>
                <p>{siteConfig.hours.weekdays}</p>
                <p>{siteConfig.hours.saturday}</p>
              </div>
            </li>
          </RevealOnScroll>
        </ul>
      </div>
    </div>
  );
}

function QuickInquiryBlock() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isValid = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && message.trim().length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSending(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 255),
        services: ["quick-inquiry"],
        notes: message.trim().slice(0, 500),
        status: "new",
      });
      if (error) throw error;

      supabase.functions.invoke("send-inquiry-notification", {
        body: { name: name.trim(), email: email.trim(), services: ["quick-inquiry"], goals: message.trim() },
      }).catch(() => {});

      setSent(true);
      toast({ title: "Message sent!", description: "We'll get back to you within 1–2 business days." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or call us.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-primary text-primary-foreground py-12 sm:py-16">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <RevealOnScroll direction="left" duration={800}>
              <div>
                <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">Quick Inquiry</p>
                <h2 className="font-serif text-2xl sm:text-3xl mb-4">Have a Quick Question?</h2>
                <p className="text-primary-foreground/60 leading-relaxed mb-6">
                  Drop us a message and we'll respond within 24 hours. For detailed project inquiries, use our full form below.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-all hover:scale-105"
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </a>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary-foreground/20 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/10 transition-all"
                  >
                    <Mail className="h-4 w-4" />
                    Email Us
                  </a>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="right" duration={800} delay={150}>
              <div>
                {sent ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl bg-primary-foreground/[0.06] border border-primary-foreground/10 px-6">
                    <CheckCircle className="h-8 w-8 text-accent mb-3" />
                    <p className="font-serif text-xl font-semibold mb-1">Message Sent!</p>
                    <p className="text-primary-foreground/60 text-sm mb-4">Check your inbox — we've sent a confirmation with next steps.</p>
                    <Link
                      to="/schedule"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-all"
                    >
                      <Clock className="h-4 w-4" />
                      Schedule a Call Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-primary-foreground/[0.06] border border-primary-foreground/10 p-6">
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                      className="bg-primary-foreground/10 border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/40"
                    />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={255}
                      className="bg-primary-foreground/10 border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/40"
                    />
                    <Input
                      placeholder="Your question or message…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={500}
                      className="bg-primary-foreground/10 border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/40"
                    />
                    <Button
                      type="submit"
                      disabled={!isValid || sending}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {sending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</>
                      ) : (
                        <><Send className="mr-2 h-4 w-4" />Send Quick Inquiry</>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Contact() {
  return (
    <Layout>
      <StickySubpageCTA
        ctaLabel="Call Us Now"
        ctaIcon={<Phone className="h-4 w-4" />}
        onCtaClick={() => window.location.href = `tel:${siteConfig.phone}`}
      />
      <PageHeader 
        title="Start Your Project"
        description="Tell us about your vision and we'll help you bring it to life. Complete our inquiry form to get started."
        backgroundImage={aberdeenInterior}
        dividerVariant="contact"
      />

      <QuickInquiryBlock />

      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintFacility} opacity={0.03} direction="right-to-left" duration={2000} parallaxSpeed={0.06} />
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Form - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-10">
              <RevealOnScroll direction="up">
                <LeadCaptureForm />
              </RevealOnScroll>

              <RevealOnScroll direction="up" delay={150}>
                <div className="bg-card rounded-xl p-6 sm:p-8 border border-border">
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    Detailed Project Inquiry
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Have a bigger project in mind? Complete this form for a personalised consultation.
                  </p>
                  <InquiryForm />
                </div>
              </RevealOnScroll>
            </div>

            {/* Contact Info - Takes 1 column */}
            <div className="space-y-8">
              <ContactInfo />
              <RevealOnScroll direction="up" delay={200}>
                <InteractiveMap />
              </RevealOnScroll>
              <RevealOnScroll direction="up" delay={300}>
                <PolicyDownloadCenter />
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
