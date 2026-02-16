import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, CheckCircle, Loader2, Send, ArrowRight, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const LESSON_TYPES = [
  { value: "beginner", label: "Foundation (Beginner)", price: "$95" },
  { value: "intermediate", label: "Development (Intermediate)", price: "$120" },
  { value: "advanced", label: "Performance (Advanced)", price: "$150" },
  { value: "clinic", label: "Clinic / Group Session", price: "From $80" },
  { value: "consultation", label: "Free Consultation", price: "Free" },
];

export function RequestLessonInquiry() {
  const { toast } = useToast();
  const { ref, isVisible } = useScrollAnimation<HTMLElement>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lessonType, setLessonType] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    lessonType.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSending(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 255),
        services: [`lesson-${lessonType}`],
        notes: `Lesson request: ${LESSON_TYPES.find((t) => t.value === lessonType)?.label}`,
        status: "new",
      });
      if (error) throw error;

      supabase.functions
        .invoke("send-inquiry-notification", {
          body: {
            name: name.trim(),
            email: email.trim(),
            services: [`lesson-${lessonType}`],
            goals: `Interested in: ${LESSON_TYPES.find((t) => t.value === lessonType)?.label}`,
          },
        })
        .catch(() => {});

      setSubmitted(true);
      toast({ title: "Request sent!", description: "Check your inbox for a confirmation with scheduling options." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or call us.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      ref={ref}
      className={cn(
        "section-padding bg-card border-y border-border transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">You're All Set!</h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
                We've sent a confirmation to <strong className="text-foreground">{email}</strong> with next steps and a scheduling link.
              </p>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/schedule">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Book a Time Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-0.5 bg-accent mx-auto mb-5" />
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-2">
                  Request a Lesson
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Quick and easy — pick your level, drop your details, and we'll send you a confirmation with a link to schedule.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end"
              >
                <div>
                  <label htmlFor="rl-name" className="block text-xs font-medium text-foreground mb-1.5">
                    Name
                  </label>
                  <Input
                    id="rl-name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label htmlFor="rl-email" className="block text-xs font-medium text-foreground mb-1.5">
                    Email
                  </label>
                  <Input
                    id="rl-email"
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                  />
                </div>
                <div>
                  <label htmlFor="rl-type" className="block text-xs font-medium text-foreground mb-1.5">
                    Lesson Type
                  </label>
                  <Select value={lessonType} onValueChange={setLessonType}>
                    <SelectTrigger id="rl-type">
                      <SelectValue placeholder="Choose…" />
                    </SelectTrigger>
                    <SelectContent>
                      {LESSON_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <span className="flex items-center justify-between gap-2 w-full">
                            {t.label}
                            <span className="text-xs text-muted-foreground">{t.price}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={!isValid || sending}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 whitespace-nowrap"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1.5" />
                      Send
                    </>
                  )}
                </Button>
              </form>

              <div className="flex flex-wrap justify-center gap-4 mt-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 text-accent" /> Auto-confirm email
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 text-accent" /> Scheduling link included
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-accent" /> Thurs &amp; Fri availability
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
