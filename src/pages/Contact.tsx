import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { siteConfig } from "@/data/content";
import { useToast } from "@/hooks/use-toast";

function PageHeader() {
  return (
    <section className="pt-32 pb-16 bg-primary text-primary-foreground">
      <div className="section-container">
        <div className="max-w-3xl">
          <div className="w-16 h-0.5 bg-accent mb-6" />
          <h1 className="heading-display mb-6">Contact Us</h1>
          <p className="text-lg text-primary-foreground/80">
            Ready to discuss your project? Get in touch and let's start the conversation.
          </p>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-accent" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">
          Thank You!
        </h3>
        <p className="text-muted-foreground mb-6">
          We've received your message and will be in touch within 1-2 business days.
        </p>
        <Button onClick={() => setIsSubmitted(false)} variant="outline">
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service">Service Interested In</Label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select a service</option>
            <option value="arena">Arena Construction</option>
            <option value="barn">Barn & Stable Building</option>
            <option value="fencing">Equine Fencing</option>
            <option value="infrastructure">Site Infrastructure</option>
            <option value="round-pens">Round Pens & Paddocks</option>
            <option value="renovations">Renovations & Repairs</option>
            <option value="lessons">Lessons & Training</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Tell us about your project..."
          rows={6}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Sending..."
        ) : (
          <>
            Send Message
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

function ContactInfo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
          Get in Touch
        </h3>
        <ul className="space-y-4">
          <li>
            <a
              href={`tel:${siteConfig.phone}`}
              className="flex items-start gap-4 text-muted-foreground hover:text-accent transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                <Phone className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Phone</p>
                <p>{siteConfig.phone}</p>
              </div>
            </a>
          </li>
          <li>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-start gap-4 text-muted-foreground hover:text-accent transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p>{siteConfig.email}</p>
              </div>
            </a>
          </li>
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
        </ul>
      </div>

      {/* Map placeholder */}
      <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <MapPin className="h-8 w-8 mr-2" />
          <span>Map Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <Layout>
      <PageHeader />

      <section className="section-padding">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Form */}
            <div>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                Send Us a Message
              </h2>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <ContactInfo />
          </div>
        </div>
      </section>
    </Layout>
  );
}
