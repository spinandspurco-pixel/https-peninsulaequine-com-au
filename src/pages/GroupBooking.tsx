import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { format, isWeekend, isBefore, startOfDay, addDays } from "date-fns";
import {
  Users, CalendarIcon, CheckCircle, ArrowRight, ArrowLeft, Minus, Plus,
  Info, Tag, Sun, Sunrise,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

// ── Pricing Logic ────────────────────────────────────

const BASE_PRICE_PER_PERSON = 120; // weekday rate
const WEEKEND_SURCHARGE = 20;      // extra per person on weekends
const PEAK_MONTHS = [11, 0, 1];    // Dec, Jan, Feb (summer in AU)
const PEAK_SURCHARGE = 15;         // extra per person in peak season

const GROUP_DISCOUNTS: { min: number; max: number; pct: number; label: string }[] = [
  { min: 2, max: 3, pct: 5, label: "Small Group (2–3)" },
  { min: 4, max: 6, pct: 10, label: "Medium Group (4–6)" },
  { min: 7, max: 10, pct: 15, label: "Large Group (7–10)" },
  { min: 11, max: 20, pct: 20, label: "Party / Event (11–20)" },
];

function getGroupDiscount(size: number) {
  return GROUP_DISCOUNTS.find((d) => size >= d.min && size <= d.max) || null;
}

function calculatePrice(groupSize: number, date: Date | undefined) {
  let perPerson = BASE_PRICE_PER_PERSON;

  if (date) {
    if (isWeekend(date)) perPerson += WEEKEND_SURCHARGE;
    if (PEAK_MONTHS.includes(date.getMonth())) perPerson += PEAK_SURCHARGE;
  }

  const discount = getGroupDiscount(groupSize);
  const discountPct = discount?.pct || 0;
  const discountedPerPerson = Math.round(perPerson * (1 - discountPct / 100));
  const total = discountedPerPerson * groupSize;
  const savings = (perPerson - discountedPerPerson) * groupSize;

  return { perPerson, discountedPerPerson, total, savings, discountPct, discountLabel: discount?.label || "" };
}

// ── Group Size Selector ──────────────────────────────

function GroupSizeSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full"
        onClick={() => onChange(Math.max(2, value - 1))}
        disabled={value <= 2}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="text-center min-w-[60px]">
        <span className="text-3xl font-serif font-bold text-foreground">{value}</span>
        <p className="text-xs text-muted-foreground">riders</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full"
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={value >= 20}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Price Summary Card ───────────────────────────────

function PriceSummary({
  groupSize,
  date,
}: {
  groupSize: number;
  date: Date | undefined;
}) {
  const pricing = useMemo(() => calculatePrice(groupSize, date), [groupSize, date]);

  const isWeekendDate = date ? isWeekend(date) : false;
  const isPeak = date ? PEAK_MONTHS.includes(date.getMonth()) : false;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-serif text-base font-semibold text-foreground flex items-center gap-2">
        <Tag className="h-4 w-4 text-accent" />
        Price Estimate
      </h3>

      {/* Rate badges */}
      <div className="flex flex-wrap gap-2">
        {isWeekendDate && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            <Sun className="h-3 w-3" /> Weekend Rate
          </span>
        )}
        {isPeak && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            <Sunrise className="h-3 w-3" /> Peak Season
          </span>
        )}
        {pricing.discountPct > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            <Users className="h-3 w-3" /> {pricing.discountPct}% Group Discount
          </span>
        )}
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Base rate</span>
          <span>${BASE_PRICE_PER_PERSON}/person</span>
        </div>
        {isWeekendDate && (
          <div className="flex justify-between text-muted-foreground">
            <span>Weekend surcharge</span>
            <span>+${WEEKEND_SURCHARGE}/person</span>
          </div>
        )}
        {isPeak && (
          <div className="flex justify-between text-muted-foreground">
            <span>Peak season</span>
            <span>+${PEAK_SURCHARGE}/person</span>
          </div>
        )}
        {pricing.discountPct > 0 && (
          <div className="flex justify-between text-accent font-medium">
            <span>{pricing.discountLabel} discount</span>
            <span>-{pricing.discountPct}%</span>
          </div>
        )}
        <div className="border-t border-border pt-2 flex justify-between text-muted-foreground">
          <span>Per person</span>
          <span className="font-semibold text-foreground">${pricing.discountedPerPerson}</span>
        </div>
      </div>

      {/* Total */}
      <div className="bg-background rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">{groupSize} riders × ${pricing.discountedPerPerson}</p>
        <p className="text-3xl font-serif font-bold text-foreground">${pricing.total}</p>
        {pricing.savings > 0 && (
          <p className="text-xs text-accent font-medium mt-1">You save ${pricing.savings}</p>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
        <Info className="h-3 w-3 shrink-0 mt-0.5" />
        Final pricing confirmed upon booking. Prices include arena &amp; instructor. A 30% deposit is required.
      </p>
    </div>
  );
}

// ── Group Rates Overview (top of page) ───────────────

function GroupRatesOverview() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div ref={ref} className={cn("transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="text-center mb-10">
            <div className={cn("w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100", isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")} />
            <h2 className="heading-section text-foreground mb-3">Group Discount Tiers</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The bigger the group, the bigger the savings. Perfect for friends, families, team outings, and birthday parties.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {GROUP_DISCOUNTS.map((tier, i) => (
              <div
                key={tier.label}
                className={cn(
                  "rounded-xl border border-border bg-card p-5 text-center transition-all duration-500",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: `${150 + i * 80}ms` }}
              >
                <Users className="h-6 w-6 text-accent mx-auto mb-2" />
                <h3 className="font-serif text-sm font-semibold text-foreground mb-1">{tier.label}</h3>
                <p className="text-2xl font-serif font-bold text-accent">{tier.pct}% off</p>
                <p className="text-xs text-muted-foreground mt-1">
                  From ${Math.round(BASE_PRICE_PER_PERSON * (1 - tier.pct / 100))}/person
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Sun className="h-3.5 w-3.5" /> Weekend: +${WEEKEND_SURCHARGE}/person</span>
            <span className="flex items-center gap-1.5"><Sunrise className="h-3.5 w-3.5" /> Peak season (Dec–Feb): +${PEAK_SURCHARGE}/person</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Booking Form ─────────────────────────────────────

function GroupBookingForm() {
  const { toast } = useToast();
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.05 });

  const [step, setStep] = useState(1);
  const [groupSize, setGroupSize] = useState(4);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const today = startOfDay(new Date());
  const minDate = addDays(today, 3); // at least 3 days ahead for groups

  const pricing = useMemo(() => calculatePrice(groupSize, selectedDate), [groupSize, selectedDate]);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!selectedDate) e.date = "Please select a date";
    if (groupSize < 2) e.groupSize = "Minimum 2 riders";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("inquiries").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        preferred_contact: "email",
        services: ["group-lesson"],
        project_vision: `Group booking for ${groupSize} riders`,
        project_details: [
          `Group size: ${groupSize}`,
          `Date: ${selectedDate ? format(selectedDate, "yyyy-MM-dd (EEEE)") : "TBD"}`,
          `Estimated total: $${pricing.total} ($${pricing.discountedPerPerson}/person)`,
          `Discount tier: ${pricing.discountLabel || "None"}`,
          formData.notes.trim() ? `Notes: ${formData.notes.trim()}` : "",
        ].filter(Boolean).join(" | "),
        preferred_start: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
      });
      if (error) throw error;

      // Fire-and-forget email notification
      supabase.functions.invoke("send-inquiry-notification", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          services: ["group-lesson"],
          goals: `Group booking: ${groupSize} riders on ${selectedDate ? format(selectedDate, "EEEE d MMMM yyyy") : "date TBD"}. Est. $${pricing.total}.`,
          additionalNotes: formData.notes.trim() || "",
        },
      }).catch(() => {});

      setIsSubmitted(true);
      toast({ title: "Group booking request sent!", description: "We'll confirm availability within 1–2 business days." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or call us directly.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="section-padding bg-card border-y border-border">
        <div className="section-container max-w-xl text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-accent" />
          </div>
          <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">Group Booking Requested!</h3>
          <p className="text-muted-foreground mb-2">
            We'll check availability for {groupSize} riders on{" "}
            {selectedDate ? format(selectedDate, "EEEE d MMMM yyyy") : "your preferred date"} and get back to you within 1–2 business days.
          </p>
          <p className="text-sm text-muted-foreground mb-8">Estimated total: <strong className="text-foreground">${pricing.total}</strong></p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => { setIsSubmitted(false); setStep(1); setFormData({ name: "", email: "", phone: "", notes: "" }); setSelectedDate(undefined); setGroupSize(4); }} variant="outline">
              Book Another Group
            </Button>
            <Button asChild>
              <Link to="/pricing">View All Pricing <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="group-booking-form" className="section-padding bg-card border-y border-border">
      <div className="section-container">
        <div ref={ref} className={cn("max-w-4xl mx-auto transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="text-center mb-10">
            <h2 className="heading-section text-foreground mb-3">Book Your Group Session</h2>
            <p className="text-muted-foreground">Select your group size and preferred date to see your price.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all", step >= 1 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
              {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
            </div>
            <div className={cn("h-0.5 w-12 rounded-full transition-all", step > 1 ? "bg-accent" : "bg-muted")} />
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all", step === 2 ? "bg-accent text-accent-foreground ring-2 ring-accent/20" : "bg-muted text-muted-foreground")}>
              2
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-3">
              {step === 1 && (
                <div className="space-y-8">
                  {/* Group Size */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">How many riders?</Label>
                    <GroupSizeSelector value={groupSize} onChange={setGroupSize} />
                    {errors.groupSize && <p className="text-xs text-destructive mt-1">{errors.groupSize}</p>}
                  </div>

                  {/* Date Picker */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">Preferred Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "EEEE, d MMMM yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(d) => isBefore(d, minDate)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
                    {selectedDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {isWeekend(selectedDate) ? "Weekend rates apply." : "Weekday rate."}{" "}
                        {PEAK_MONTHS.includes(selectedDate.getMonth()) && "Peak season surcharge applies."}
                      </p>
                    )}
                  </div>

                  <Button onClick={() => { if (validateStep1()) setStep(2); }} className="w-full sm:w-auto">
                    Continue to Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mb-2">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                  </Button>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gb-name">Your Name *</Label>
                      <Input id="gb-name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="gb-email">Email *</Label>
                      <Input id="gb-email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="you@email.com" />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gb-phone">Phone (optional)</Label>
                    <Input id="gb-phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="0400 000 000" />
                  </div>

                  <div>
                    <Label htmlFor="gb-notes">Additional Notes</Label>
                    <Textarea
                      id="gb-notes"
                      value={formData.notes}
                      onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Experience levels, special requests, birthday details…"
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? "Submitting…" : "Submit Group Booking"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Price Summary (sticky) */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <PriceSummary groupSize={groupSize} date={selectedDate} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────

export default function GroupBooking() {
  return (
    <Layout>
      <PageHeader
        title="Group Rates & Booking"
        description="Bring your friends, family, or team. Group discounts from 5–20% with calendar-aware pricing."
      />
      <GroupRatesOverview />
      <GroupBookingForm />
    </Layout>
  );
}
