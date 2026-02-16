import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Clock, CheckCircle, Loader2, ArrowRight, Phone, Info } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig, services as allServices } from "@/data/content";
import { cn } from "@/lib/utils";

const SERVICE_DURATIONS: Record<string, { label: string; minutes: number }> = {
  "arena-construction": { label: "Arena Consultation", minutes: 60 },
  "barn-construction": { label: "Barn & Stables Consultation", minutes: 60 },
  "full-facility": { label: "Full Facility Planning", minutes: 90 },
  "fencing": { label: "Fencing Consultation", minutes: 45 },
  "round-pens": { label: "Round Pen Consultation", minutes: 45 },
  "infrastructure": { label: "Infrastructure Review", minutes: 60 },
  "renovations": { label: "Renovation Assessment", minutes: 45 },
  "riding-lessons": { label: "Lesson Introduction", minutes: 30 },
  "clinics-events": { label: "Event Planning", minutes: 60 },
  "follow-up-consultation": { label: "Follow-Up Consultation", minutes: 45 },
};

export default function Schedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Read service context from URL
  const serviceIds = searchParams.get("services")?.split(",").filter(Boolean) || [];
  const prefilledName = searchParams.get("name") || "";
  const prefilledEmail = searchParams.get("email") || "";
  const primaryServiceId = serviceIds[0] || "follow-up-consultation";
  const serviceMeta = SERVICE_DURATIONS[primaryServiceId] || SERVICE_DURATIONS["follow-up-consultation"];
  const serviceTitle = allServices.find((s) => s.id === primaryServiceId)?.title;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState(prefilledName);
  const [email, setEmail] = useState(prefilledEmail);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState(serviceIds.length > 0 ? `Interested in: ${serviceIds.map((id) => allServices.find((s) => s.id === id)?.title || id).join(", ")}` : "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ["schedule-slots", dateStr],
    queryFn: async () => {
      if (!dateStr) return [];
      const { data } = await supabase
        .from("lesson_slots")
        .select("*")
        .eq("slot_date", dateStr)
        .order("start_time");
      return (data || []).filter((s) => s.current_bookings < s.max_bookings);
    },
    enabled: !!dateStr,
  });

  // Dates with available slots (next 60 days)
  const { data: availableDates = [] } = useQuery({
    queryKey: ["schedule-available-dates"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("lesson_slots")
        .select("slot_date, max_bookings, current_bookings")
        .gte("slot_date", today)
        .order("slot_date")
        .limit(200);
      if (!data) return [];
      const dateMap = new Map<string, boolean>();
      data.forEach((s) => {
        if (s.current_bookings < s.max_bookings) dateMap.set(s.slot_date, true);
      });
      return Array.from(dateMap.keys());
    },
    staleTime: 60_000,
  });
  // Real-time updates for slot availability
  useEffect(() => {
    const channel = supabase
      .channel("schedule-slots-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_slots" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["schedule-slots"] });
          queryClient.invalidateQueries({ queryKey: ["schedule-available-dates"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const isValid = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && selectedSlot;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !dateStr) return;
    setSubmitting(true);

    try {
      const slot = slots.find((s) => s.id === selectedSlot);
      const { error } = await supabase.from("inquiries").insert({
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 255),
        phone: phone.trim().slice(0, 30) || null,
        services: serviceIds.length > 0 ? serviceIds : ["follow-up-consultation"],
        preferred_service: primaryServiceId || null,
        project_details: `Follow-up scheduled: ${dateStr} ${slot ? `${slot.start_time.slice(0, 5)}–${slot.end_time.slice(0, 5)}` : ""} | Est. ${serviceMeta.minutes} min`,
        notes: notes.trim().slice(0, 500) || null,
        status: "new",
      });
      if (error) throw error;

      supabase.functions.invoke("send-inquiry-notification", {
        body: {
          name: name.trim(),
          email: email.trim(),
          services: serviceIds.length > 0 ? serviceIds : ["follow-up-consultation"],
          goals: `Follow-up consultation on ${dateStr} (${serviceMeta.label})`,
          preferredDate: dateStr,
        },
      }).catch(() => {});

      setSubmitted(true);
      toast({ title: "Follow-up scheduled!", description: "We'll confirm your appointment within 24 hours." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or call us.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const availableDateSet = new Set(availableDates);

  return (
    <Layout>
      <PageHeader
        title={serviceTitle ? `Schedule: ${serviceTitle}` : "Schedule a Follow-Up"}
        description={serviceTitle
          ? `Book your ${serviceMeta.minutes}-minute ${serviceMeta.label.toLowerCase()} with Ciro`
          : "Pick a convenient date and time for your consultation with Ciro"
        }
      />

      {/* Service context banner */}
      {serviceIds.length > 0 && (
        <div className="bg-accent/5 border-b border-accent/20">
          <div className="section-container py-4">
            <div className="flex items-center gap-3 max-w-3xl mx-auto">
              <Info className="h-4 w-4 text-accent shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-medium">Consultation for:</span>{" "}
                {serviceIds.map((id) => allServices.find((s) => s.id === id)?.title || id).join(", ")}
                <span className="text-muted-foreground"> · Est. {serviceMeta.minutes} min</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="section-padding bg-background">
        <div className="section-container">
          {submitted ? (
            <div className="max-w-lg mx-auto text-center py-16">
              <CheckCircle className="h-16 w-16 text-accent mx-auto mb-6" />
              <h2 className="font-serif text-2xl text-foreground mb-3">You're All Set!</h2>
              <p className="text-muted-foreground mb-6">
                We'll confirm your consultation within 24 hours. Check your email for details.
              </p>
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="/">Back to Home <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* Calendar */}
              <div>
                <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-accent" />
                  Select a Date
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
                  disabled={(date) => {
                    const ds = format(date, "yyyy-MM-dd");
                    return date < new Date() || !availableDateSet.has(ds);
                  }}
                  className={cn("p-3 pointer-events-auto rounded-xl border border-border bg-card")}
                />

                {/* Slots for selected date */}
                {dateStr && (
                  <div className="mt-6">
                    <h4 className="text-sm uppercase tracking-widest text-muted-foreground font-medium mb-3">
                      Available Times — {selectedDate && format(selectedDate, "EEE d MMM")}
                    </h4>
                    {slotsLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                      </div>
                    ) : slots.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No slots available on this date.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((slot) => {
                          const spotsLeft = slot.max_bookings - slot.current_bookings;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlot(slot.id)}
                              className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-all ${
                                selectedSlot === slot.id
                                  ? "border-accent bg-accent/10 text-foreground ring-1 ring-accent/30"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/40"
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                              </span>
                              <span className={`text-xs font-medium ${spotsLeft <= 1 ? "text-destructive" : "text-accent"}`}>
                                {spotsLeft} left
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form */}
              <div>
                <h3 className="font-serif text-xl text-foreground mb-4">Your Details</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Name *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" maxLength={100} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Email *</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={255} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">Phone</label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" maxLength={30} />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1.5 block">What would you like to discuss?</label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Arena build, barn renovation, general questions…" maxLength={500} />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={!isValid || submitting}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {submitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                    ) : (
                      <><CalendarIcon className="mr-2 h-4 w-4" />Confirm Follow-Up</>
                    )}
                  </Button>

                  <p className="text-center text-muted-foreground text-xs mt-3">
                    Prefer to call? <a href={`tel:${siteConfig.phone}`} className="text-accent hover:underline inline-flex items-center gap-1"><Phone className="h-3 w-3" />{siteConfig.phone}</a>
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
