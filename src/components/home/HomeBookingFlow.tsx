import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarCheck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LessonAvailabilityCalendar, type LessonSlot } from "@/components/LessonAvailabilityCalendar";
import { CalendarSyncButtons } from "@/components/CalendarSyncButtons";
import { SectionTransition, AnimatedDivider } from "@/components/SectionTransition";
import { format } from "date-fns";

// ── Lesson type data ────────────────────────────────────────

type LessonType = {
  id: string;
  label: string;
  level: string;
  price: string;
  duration: string;
  description: string;
};

const LESSON_TYPES: LessonType[] = [
  {
    id: "beginner",
    label: "Foundation",
    level: "Beginner",
    price: "$95",
    duration: "60 min",
    description: "Perfect first steps — ground work, balance, and basic rein contact.",
  },
  {
    id: "intermediate",
    label: "Development",
    level: "Intermediate",
    price: "$120",
    duration: "60 min",
    description: "Refine your seat, build rhythm and collection across all paces.",
  },
  {
    id: "advanced",
    label: "Performance",
    level: "Advanced",
    price: "$150",
    duration: "60 min",
    description: "Competition-ready work: lateral movements, transitions, advanced test prep.",
  },
];

// ── Step indicators ─────────────────────────────────────────

function StepIndicator({ step, current }: { step: number; current: number }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
          done
            ? "border-accent bg-accent text-accent-foreground"
            : active
            ? "border-accent text-accent bg-accent/10"
            : "border-border text-muted-foreground",
        )}
      >
        {done ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <span
        className={cn(
          "text-xs font-medium tracking-wide uppercase hidden sm:block",
          active ? "text-foreground" : done ? "text-accent" : "text-muted-foreground",
        )}
      >
        {step === 1 ? "Lesson Type" : step === 2 ? "Pick a Slot" : "Confirm"}
      </span>
    </div>
  );
}

function StepDivider({ done }: { done: boolean }) {
  return (
    <div
      className={cn(
        "flex-1 h-px transition-colors",
        done ? "bg-accent/50" : "bg-border",
      )}
    />
  );
}

// ── Confirmation card ───────────────────────────────────────

function ConfirmCard({
  lessonType,
  slot,
  onContinue,
  onBack,
}: {
  lessonType: LessonType;
  slot: LessonSlot;
  onContinue: () => void;
  onBack: () => void;
}) {
  const dateLabel = format(new Date(slot.slot_date + "T00:00:00"), "EEEE, MMMM d, yyyy");
  const [h, m] = slot.start_time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const timeLabel = `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;

  const calEvent = {
    title: `Peninsula Equine — ${lessonType.label} Lesson`,
    date: slot.slot_date,
    startTime: slot.start_time,
    endTime: slot.end_time,
    description: `${lessonType.description}\n\nLesson level: ${lessonType.level}\nPrice: ${lessonType.price}`,
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card border border-accent/30 rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
          <CalendarCheck className="h-6 w-6 text-accent" />
        </div>
        <h3 className="font-serif text-xl text-center text-foreground mb-1">
          Review Your Selection
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Confirm the details below, then proceed to book and pay your deposit.
        </p>

        <div className="space-y-3 mb-6">
          {[
            { label: "Lesson", value: `${lessonType.label} (${lessonType.level})` },
            { label: "Date", value: dateLabel },
            { label: "Time", value: timeLabel },
            { label: "Duration", value: lessonType.duration },
            { label: "Deposit (50%)", value: `${Math.round(parseInt(lessonType.price.replace("$", "")) / 2)} AUD` },
            { label: "Balance on day", value: `${Math.ceil(parseInt(lessonType.price.replace("$", "")) / 2)} AUD` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>

        {/* Calendar sync */}
        <div className="mb-5">
          <p className="text-xs text-muted-foreground text-center mb-2 uppercase tracking-wider">
            Save to calendar
          </p>
          <CalendarSyncButtons event={calEvent} compact className="justify-center" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            ← Back
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Book & Pay Deposit
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────

export function HomeBookingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<LessonType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<LessonSlot | null>(null);

  const handleTypeSelect = (t: LessonType) => {
    setSelectedType(t);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSlotSelect = (slot: LessonSlot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setSelectedSlot(null);
    } else if (step === 2) {
      setStep(1);
      setSelectedType(null);
    }
  };

  const handleConfirm = () => {
    if (!selectedType || !selectedSlot) return;
    navigate(
      `/book-lesson?type=${selectedType.id}&date=${selectedSlot.slot_date}&slot=${selectedSlot.id}#book`,
    );
  };

  return (
    <section
      id="book-lesson"
      className="section-padding bg-secondary/20"
      aria-label="Book a lesson"
    >
      <div className="section-container">
        {/* Header */}
        <SectionTransition variant="fade-up">
          <div className="text-center mb-10">
            <AnimatedDivider className="mx-auto mb-6" />
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-sm mb-3">
              Start Your Journey
            </p>
            <h2 className="heading-section text-foreground">Book a Lesson</h2>
            <p className="text-muted-foreground mt-2 text-base max-w-md mx-auto">
              Choose your level, pick a time that suits you, and secure your spot with a 50%
              deposit.
            </p>
          </div>
        </SectionTransition>

        {/* Step indicator */}
        <SectionTransition variant="fade-up" delay={100}>
          <div className="flex items-center justify-center gap-3 mb-10 max-w-xs mx-auto">
            <StepIndicator step={1} current={step} />
            <StepDivider done={step > 1} />
            <StepIndicator step={2} current={step} />
            <StepDivider done={step > 2} />
            <StepIndicator step={3} current={step} />
          </div>
        </SectionTransition>

        {/* Step 1 — Lesson type selection */}
        {step === 1 && (
          <SectionTransition variant="fade-up" delay={150}>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {LESSON_TYPES.map((lt) => (
                <button
                  key={lt.id}
                  type="button"
                  onClick={() => handleTypeSelect(lt)}
                  className="group text-left rounded-2xl border border-border bg-card p-6 hover:border-accent/50 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-widest text-accent font-medium">
                      {lt.level}
                    </span>
                    <span className="text-xs text-muted-foreground">{lt.duration}</span>
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-2 group-hover:text-accent transition-colors">
                    {lt.label}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {lt.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-accent">{lt.price}</span>
                    <span className="text-xs text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </SectionTransition>
        )}

        {/* Step 2 — Calendar slot picker */}
        {step === 2 && selectedType && (
          <SectionTransition variant="fade-up">
            <div>
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
                  {selectedType.label} — {selectedType.price}
                </span>
              </div>
              <LessonAvailabilityCalendar
                filterType={selectedType.id}
                onSlotSelect={handleSlotSelect}
                selectedSlotId={selectedSlot?.id}
                showHeader={false}
              />
              <div className="text-center mt-6">
                <button
                  onClick={handleBack}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Change lesson type
                </button>
              </div>
            </div>
          </SectionTransition>
        )}

        {/* Step 3 — Confirm + calendar sync */}
        {step === 3 && selectedType && selectedSlot && (
          <SectionTransition variant="fade-up">
            <ConfirmCard
              lessonType={selectedType}
              slot={selectedSlot}
              onContinue={handleConfirm}
              onBack={handleBack}
            />
          </SectionTransition>
        )}
      </div>
    </section>
  );
}
