import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, ArrowRight, User, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const SERVICE_OPTIONS = [
  { value: "beginner", label: "Foundation Lesson", price: "$95", duration: "45 min" },
  { value: "intermediate", label: "Development Lesson", price: "$120", duration: "60 min" },
  { value: "advanced", label: "Performance Lesson", price: "$150", duration: "60 min" },
];

export function InlineBookingForm({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState<Date>();

  const isValid = name.trim() && email.trim() && selectedService && date;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      type: selectedService,
      ...(date ? { date: format(date, "yyyy-MM-dd") } : {}),
      name,
      email,
    });
    navigate(`/book-lesson?${params.toString()}`);
  };

  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-primary px-6 py-5 text-primary-foreground">
        <h3 className="font-serif text-xl font-semibold">Book Your Session</h3>
        <p className="text-sm text-primary-foreground/70 mt-1">
          Choose a lesson type, pick a date, and we'll confirm your spot.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Service selection */}
        <fieldset className="mb-6">
          <legend className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">
            Select Lesson Type
          </legend>
          <div className="grid gap-2">
            {SERVICE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedService(opt.value)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 border text-left",
                  selectedService === opt.value
                    ? "bg-accent/10 border-accent ring-1 ring-accent/20"
                    : "bg-background border-border hover:border-accent/30"
                )}
              >
                <div className="flex items-center gap-2.5">
                  {selectedService === opt.value ? (
                    <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                  )}
                  <span className="font-medium text-foreground">{opt.label}</span>
                </div>
                <span className="flex items-center gap-2 text-xs">
                  <span className="text-accent font-semibold">{opt.price}</span>
                  <span className="text-muted-foreground">· {opt.duration}</span>
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Two-column: form fields + calendar */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Name + Email */}
          <div className="space-y-4">
            <div>
              <label htmlFor="booking-name" className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="booking-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label htmlFor="booking-email" className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="booking-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Selected summary */}
            {date && selectedService && (
              <div className="rounded-lg bg-accent/5 border border-accent/15 p-3 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {SERVICE_OPTIONS.find((s) => s.value === selectedService)?.label}
                  </span>{" "}
                  on{" "}
                  <span className="font-medium text-foreground">
                    {format(date, "EEEE, MMMM d")}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Right: Calendar */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5">
              Preferred Date
            </p>
            <div className="rounded-lg border border-border bg-background p-1 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date() || d.getDay() === 0 || d.getDay() === 6}
                className="p-3 pointer-events-auto"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6">
          <Button
            type="submit"
            size="lg"
            disabled={!isValid}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Continue to Book
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            You'll receive a confirmation email once your session is confirmed.
          </p>
        </div>
      </form>
    </div>
  );
}
