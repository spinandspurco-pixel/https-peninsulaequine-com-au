import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Send, X } from "lucide-react";
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

const quickContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  message: z.string().min(10, "Please enter at least 10 characters").max(500),
});

type QuickContactData = z.infer<typeof quickContactSchema>;

interface QuickContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickContactModal({ open, onOpenChange }: QuickContactModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<QuickContactData>>({
    name: "",
    email: "",
    message: "",
  });

  const updateField = <K extends keyof QuickContactData>(
    field: K,
    value: QuickContactData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const result = quickContactSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("inquiries").insert({
        name: formData.name?.trim() || "",
        email: formData.email?.trim() || "",
        services: ["General Inquiry"],
        project_vision: formData.message?.trim() || null,
        preferred_contact: "email",
      });

      if (error) throw error;

      // Send email notification (don't block on failure)
      try {
        await supabase.functions.invoke("send-inquiry-notification", {
          body: {
            name: formData.name?.trim(),
            email: formData.email?.trim(),
            services: ["General Inquiry"],
            goals: formData.message?.trim(),
          },
        });
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
      }

      setIsSubmitted(true);
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      toast({
        title: "Submission failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after modal closes
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Quick Message</DialogTitle>
          <DialogDescription>
            Send us a quick message and we'll get back to you soon.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Message Sent!
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              We'll review your message and respond within 1-2 business days.
            </p>
            <Button onClick={handleClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-name">Name</Label>
              <Input
                id="quick-name"
                placeholder="Your name"
                value={formData.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                className={cn(
                  "input-glow",
                  errors.name && "border-destructive focus:ring-destructive"
                )}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-email">Email</Label>
              <Input
                id="quick-email"
                type="email"
                placeholder="your@email.com"
                value={formData.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                className={cn(
                  "input-glow",
                  errors.email && "border-destructive focus:ring-destructive"
                )}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-message">Message</Label>
              <Textarea
                id="quick-message"
                placeholder="How can we help you?"
                rows={4}
                value={formData.message || ""}
                onChange={(e) => updateField("message", e.target.value)}
                className={cn(
                  "input-glow resize-none",
                  errors.message && "border-destructive focus:ring-destructive"
                )}
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
              <p className="text-xs text-muted-foreground text-right">
                {formData.message?.length || 0}/500
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-glow-primary"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
