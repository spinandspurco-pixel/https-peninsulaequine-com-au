import { useState } from "react";
import { Camera, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function GalleryTourForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("inquiries").insert({
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 255),
        phone: phone.trim().slice(0, 30) || null,
        services: ["gallery-tour"],
        project_details: interest.trim().slice(0, 500) || null,
        status: "new",
      });
      if (error) throw error;

      supabase.functions
        .invoke("send-inquiry-notification", {
          body: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            services: ["gallery-tour"],
            goals: interest.trim() || "Gallery tour request",
          },
        })
        .catch(() => {});

      setSubmitted(true);
      toast({
        title: "Tour request sent!",
        description: "We'll be in touch within 24 hours.",
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
        <h3 className="font-serif text-xl text-foreground mb-2">
          Tour Request Received
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          We'll reach out within 24 hours to arrange your private gallery
          walkthrough and discuss your project vision.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Camera className="h-6 w-6 text-accent" />
        </div>
        <h3 className="font-serif text-2xl text-foreground mb-2">
          Request a Private Gallery Tour
        </h3>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          See our craftsmanship up close. We'll arrange a personalised
          walkthrough of our facilities and share high-resolution project
          galleries tailored to your interests.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
              Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              maxLength={100}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
              Email *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={255}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
              Phone
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
              maxLength={30}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
              What interests you most?
            </label>
            <Input
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="Barns, arenas, stonework…"
              maxLength={500}
            />
          </div>
        </div>
        <div className="text-center pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={!isValid || submitting}
            className="bg-accent text-accent-foreground hover:bg-accent/90 min-w-[220px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Request Tour
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
