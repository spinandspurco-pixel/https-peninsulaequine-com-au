import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { format, addDays, nextThursday, nextFriday, isThursday, isFriday } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

interface StickyHeroCTAProps {
  showAfter?: number;
  onCtaClick?: () => void;
  progress?: number;
  progressLabel?: string;
}

/** Next available lesson days (Thu/Fri) */
function getQuickDates(): { label: string; date: Date }[] {
  const today = new Date();
  const dates: { label: string; date: Date }[] = [];

  // Next Thursday
  const thu = isThursday(today) ? addDays(today, 7) : nextThursday(today);
  dates.push({ label: `Thu ${format(thu, "MMM d")}`, date: thu });

  // Next Friday
  const fri = isFriday(today) ? addDays(today, 7) : nextFriday(today);
  dates.push({ label: `Fri ${format(fri, "MMM d")}`, date: fri });

  // Following week Thursday
  const thu2 = addDays(thu, 7);
  dates.push({ label: `Thu ${format(thu2, "MMM d")}`, date: thu2 });

  return dates;
}

export function StickyHeroCTA({
  showAfter = 400,
  onCtaClick,
  progress = 0,
  progressLabel = "spots filled",
}: StickyHeroCTAProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const quickDates = getQuickDates();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  const handleBook = (date?: Date) => {
    const d = date || selectedDate;
    if (d) {
      navigate(`/book-lesson?date=${format(d, "yyyy-MM-dd")}`);
    } else if (onCtaClick) {
      onCtaClick();
    } else {
      navigate("/book-lesson");
    }
    setCalOpen(false);
  };

  const handleQuickSelect = (date: Date) => {
    setSelectedDate(date);
    handleBook(date);
  };

  // SVG ring
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="bg-primary/95 backdrop-blur-md border-b border-accent/20 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Progress ring + label */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0 w-10 h-10">
              <svg
                className="w-10 h-10 -rotate-90"
                viewBox="0 0 40 40"
                aria-hidden="true"
              >
                <circle
                  cx="20" cy="20" r={radius}
                  fill="none" stroke="hsl(var(--accent) / 0.15)" strokeWidth="3"
                />
                <circle
                  cx="20" cy="20" r={radius}
                  fill="none" stroke="hsl(var(--accent))" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent">
                {progress}%
              </span>
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs text-primary-foreground/60 truncate">This month</p>
              <p className="text-sm font-medium text-primary-foreground truncate">
                <Sparkles className="inline h-3 w-3 text-accent mr-1" />
                {progress}% {progressLabel}
              </p>
            </div>
          </div>

          {/* Quick date pills (desktop) + CTA */}
          <div className="flex items-center gap-2">
            {/* Quick-select date pills — hidden on mobile */}
            <div className="hidden md:flex items-center gap-1.5">
              {quickDates.map((qd) => (
                <button
                  key={qd.label}
                  onClick={() => handleQuickSelect(qd.date)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                    selectedDate && format(selectedDate, "yyyy-MM-dd") === format(qd.date, "yyyy-MM-dd")
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-primary-foreground/5 text-primary-foreground/70 border-primary-foreground/10 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  )}
                >
                  {qd.label}
                </button>
              ))}
            </div>

            {/* Calendar dropdown toggle */}
            <div className="relative">
              <button
                onClick={() => setCalOpen(!calOpen)}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                  "bg-primary-foreground/5 text-primary-foreground/70 border-primary-foreground/10 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                  calOpen && "bg-primary-foreground/15 text-primary-foreground"
                )}
                aria-label="Open calendar"
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", calOpen && "rotate-180")} />
              </button>

              {/* Calendar dropdown */}
              {calOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCalOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 rounded-xl border border-border bg-card shadow-2xl animate-fade-in">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => {
                        if (d) {
                          setSelectedDate(d);
                          handleBook(d);
                        }
                      }}
                      disabled={(date) => {
                        const day = date.getDay();
                        return date < new Date() || (day !== 4 && day !== 5);
                      }}
                      className="p-3 pointer-events-auto"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Main CTA */}
            <button
              onClick={() => handleBook()}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium",
                "bg-accent text-accent-foreground hover:bg-accent/90",
                "transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_16px_hsl(var(--accent)/0.4)]",
                "whitespace-nowrap flex-shrink-0"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Book a Lesson</span>
              <span className="sm:hidden">Book</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
