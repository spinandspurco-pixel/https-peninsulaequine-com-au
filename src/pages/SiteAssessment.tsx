import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, ArrowRight, ArrowLeft, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

const PROJECT_TYPES = [
  "Arena Construction",
  "Barn / Stable Build",
  "Full Facility",
  "Fencing & Infrastructure",
  "Round Pen",
  "Renovation",
  "GroundLock System",
  "Other",
];

interface AvailableSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
}

export default function SiteAssessment() {
  const [step, setStep] = useState(1);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectNotes, setProjectNotes] = useState("");

  // Step 2
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  useEffect(() => {
    if (step === 2) fetchSlots();
  }, [step]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    const { data } = await supabase
      .from("assessment_availability")
      .select("id, slot_date, start_time, end_time")
      .eq("is_blocked", false)
      .gte("slot_date", new Date().toISOString().split("T")[0])
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(30);
    setSlots((data as AvailableSlot[]) || []);
    setLoadingSlots(false);
  };

  const canProceedStep1 = name.trim() && email.trim() && location.trim() && projectType;

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    const { error } = await supabase.from("site_assessments").insert({
      client_name: name.trim(),
      client_email: email.trim(),
      client_phone: phone.trim() || null,
      location: location.trim(),
      project_type: projectType,
      project_notes: projectNotes.trim() || null,
      slot_id: selectedSlot.id,
      slot_date: selectedSlot.slot_date,
      slot_time: selectedSlot.start_time,
      status: "confirmed",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Booking failed. Please try again.");
      return;
    }
    setStep(3);
  };

  // Group slots by date
  const slotsByDate = slots.reduce<Record<string, AvailableSlot[]>>((acc, s) => {
    (acc[s.slot_date] = acc[s.slot_date] || []).push(s);
    return acc;
  }, {});

  return (
    <Layout>
      <section className="min-h-screen pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-all ${
                  step >= s
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border/40 text-muted-foreground"
                }`}>
                  {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-px transition-all ${step > s ? "bg-accent" : "bg-border/40"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Intake */}
          {step === 1 && (
            <Card className="bg-card/80 border-border/40">
              <CardHeader>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Step 1</p>
                <CardTitle className="font-serif text-xl">Project Details</CardTitle>
                <p className="text-sm text-muted-foreground">Confirm your details so we can prepare for the assessment.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Full Name *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1 h-10 bg-background/60 border-border/50 rounded-sm text-sm" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Email *</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="mt-1 h-10 bg-background/60 border-border/50 rounded-sm text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="04xx xxx xxx" className="mt-1 h-10 bg-background/60 border-border/50 rounded-sm text-sm" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Property Location *</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Suburb, VIC" className="mt-1 h-10 bg-background/60 border-border/50 rounded-sm text-sm" />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Project Type *</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger className="mt-1 h-10 bg-background/60 border-border/50 rounded-sm text-sm">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Additional Notes</Label>
                  <Textarea value={projectNotes} onChange={(e) => setProjectNotes(e.target.value)} placeholder="Anything we should know about the site or project…" className="mt-1 bg-background/60 border-border/50 rounded-sm text-sm" rows={3} />
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="text-[11px] uppercase tracking-wider">
                    Select Time <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Time Selection */}
          {step === 2 && (
            <Card className="bg-card/80 border-border/40">
              <CardHeader>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">Step 2</p>
                <CardTitle className="font-serif text-xl">Select a Time</CardTitle>
                <p className="text-sm text-muted-foreground">Choose a date and time for your site assessment.</p>
              </CardHeader>
              <CardContent>
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Loading available times…</p>
                ) : Object.keys(slotsByDate).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No available times at the moment.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Contact us directly to arrange an assessment.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                      <div key={date}>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-accent/80 font-medium mb-2">
                          {format(new Date(date + "T00:00:00"), "EEEE, MMMM d")}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {dateSlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-sm border text-sm text-center transition-all ${
                                selectedSlot?.id === slot.id
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-border/30 bg-background/40 text-foreground hover:border-accent/30"
                              }`}
                            >
                              {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="text-[11px] uppercase tracking-wider">
                    <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={!selectedSlot || submitting} className="text-[11px] uppercase tracking-wider">
                    {submitting ? "Confirming…" : "Confirm Booking"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && selectedSlot && (
            <Card className="bg-card/80 border-border/40">
              <CardContent className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-7 w-7 text-accent" />
                </div>
                <h2 className="font-serif text-2xl">Assessment Confirmed</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4 text-accent/60" />
                    {format(new Date(selectedSlot.slot_date + "T00:00:00"), "EEEE, MMMM d")} at {selectedSlot.start_time.slice(0, 5)}
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4 text-accent/60" />
                    {location}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/60 pt-4 max-w-sm mx-auto">
                  A confirmation will be sent to {email}. Ciro will attend the assessment to evaluate terrain, access, and site-specific requirements.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
}
