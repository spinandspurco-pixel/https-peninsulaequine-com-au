import { useState, useEffect } from "react";
import { X, Gift, ArrowRight, CheckCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const STORAGE_KEY = "pe_lead_popup_dismissed";
const POPUP_DELAY_MS = 12000; // 12s after page load

const emailSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
});

const GUIDE_BENEFITS = [
  "What to wear & bring to your first lesson",
  "How to prep your horse before a session",
  "Choosing the right program level for you",
  "Safety essentials every rider should know",
];

export function LeadMagnetPopup() {
  const { toast } = useToast();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => setVisible(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      localStorage.setItem(STORAGE_KEY, "true");
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = emailSchema.safeParse({ name, email });
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "name" | "email";
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: result.data.name,
        email: result.data.email,
        services: ["lesson-guide-download"],
        notes: "Lead magnet: Free Rider Prep Guide download",
      });

      if (error) throw error;

      setSubmitted(true);
      localStorage.setItem(STORAGE_KEY, "true");
      toast({
        title: "Guide on its way!",
        description: "Check your inbox for the Rider Prep Guide.",
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

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300",
        closing ? "opacity-0" : "opacity-100"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Download free rider prep guide"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden transition-all duration-300",
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        )}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Accent top bar */}
        <div className="h-1.5 bg-gradient-to-r from-accent via-accent/80 to-accent/40" />

        <div className="p-6 sm:p-8">
          {!submitted ? (
            <>
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <Gift className="h-7 w-7 text-accent" />
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground text-center mb-2">
                Free Rider Prep Guide
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs mx-auto">
                Everything you need before your first lesson at Peninsula Equine — delivered straight to your inbox.
              </p>

              {/* Benefits */}
              <ul className="space-y-2 mb-6">
                {GUIDE_BENEFITS.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background border-border"
                    aria-label="Your name"
                    aria-required="true"
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border"
                    aria-label="Email address"
                    aria-required="true"
                    maxLength={255}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                >
                  {submitting ? "Sending…" : "Send Me the Guide"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="text-[10px] text-muted-foreground text-center mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <Mail className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                Check Your Inbox!
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Your free Rider Prep Guide is on its way. In the meantime, why not book your first lesson?
              </p>
              <Button
                onClick={dismiss}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Browse Lessons
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
