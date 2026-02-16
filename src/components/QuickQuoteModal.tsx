import { useState } from "react";
import { Send, CheckCircle, X } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const quickQuoteSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
  details: z.string().trim().max(500).optional(),
});

interface QuickQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  serviceTitle: string;
  startingPrice?: string;
}

export function QuickQuoteModal({
  open,
  onOpenChange,
  serviceId,
  serviceTitle,
  startingPrice,
}: QuickQuoteModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    details: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = quickQuoteSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || null,
        services: [serviceId],
        project_details: result.data.details || null,
        project_vision: `Quick quote request for ${serviceTitle}`,
        status: "new",
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Quote request sent!",
        description: "We'll get back to you within 1–2 business days.",
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
    setTimeout(() => {
      setIsSubmitted(false);
      setForm({ name: "", email: "", phone: "", details: "" });
      setErrors({});
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isSubmitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <DialogTitle className="font-serif text-2xl mb-2">Request Sent!</DialogTitle>
            <DialogDescription className="text-muted-foreground mb-6">
              We'll prepare a custom quote for <span className="font-medium text-foreground">{serviceTitle}</span> and get back to you within 1–2 business days.
            </DialogDescription>
            <Button onClick={handleClose} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Quick Quote — {serviceTitle}
              </DialogTitle>
              <DialogDescription>
                {startingPrice && (
                  <span className="inline-flex items-center gap-1.5 mt-1">
                    Starting at <span className="font-semibold text-accent">{startingPrice}</span>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="qq-name">Name *</Label>
                <Input
                  id="qq-name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qq-email">Email *</Label>
                <Input
                  id="qq-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qq-phone">Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="qq-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qq-details">Project details <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea
                  id="qq-details"
                  placeholder="Any specifics — dimensions, timeline, features…"
                  value={form.details}
                  onChange={(e) => updateField("details", e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Request Quote
                  </span>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
