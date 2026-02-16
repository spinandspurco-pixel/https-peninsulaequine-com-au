import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight, Sparkles, Users, Sun, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

// ── Config ───────────────────────────────────────────

const LESSON_TYPES = [
  { id: "foundation", label: "Foundation", base: 95, duration: "45 min" },
  { id: "development", label: "Development", base: 120, duration: "60 min" },
  { id: "performance", label: "Performance", base: 150, duration: "60 min" },
];

const CLINIC_TYPES = [
  { id: "half-day", label: "Half-Day Clinic", base: 220, duration: "3 hrs" },
  { id: "full-day", label: "Full-Day Clinic", base: 380, duration: "6 hrs" },
  { id: "intensive", label: "Private Intensive", base: 450, duration: "4 hrs" },
];

const PACKAGE_TIERS = [
  { sessions: 1, discount: 0, label: "Single session" },
  { sessions: 5, discount: 10, label: "5-lesson pack" },
  { sessions: 10, discount: 15, label: "10-lesson pack" },
  { sessions: 20, discount: 20, label: "20-lesson pack" },
];

const ADDONS = [
  { id: "video", label: "Video analysis", price: 25 },
  { id: "arena-hire", label: "Arena hire (extra hour)", price: 40 },
  { id: "groundwork", label: "Groundwork add-on", price: 35 },
];

const WEEKEND_SURCHARGE = 20;
const PEAK_SURCHARGE = 15;

// ── Component ────────────────────────────────────────

export function LessonPricingCalculator({ className }: { className?: string }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  const [mode, setMode] = useState<"lesson" | "clinic">("lesson");
  const [selectedType, setSelectedType] = useState(LESSON_TYPES[1].id);
  const [packageTier, setPackageTier] = useState(0); // index into PACKAGE_TIERS
  const [groupSize, setGroupSize] = useState(1);
  const [isWeekend, setIsWeekend] = useState(false);
  const [isPeak, setIsPeak] = useState(false);
  const [enabledAddons, setEnabledAddons] = useState<Set<string>>(new Set());

  const types = mode === "lesson" ? LESSON_TYPES : CLINIC_TYPES;
  const selected = types.find((t) => t.id === selectedType) || types[0];

  // Reset type when switching mode
  const handleModeSwitch = (m: "lesson" | "clinic") => {
    setMode(m);
    setSelectedType(m === "lesson" ? LESSON_TYPES[1].id : CLINIC_TYPES[0].id);
    setPackageTier(0);
    setGroupSize(1);
  };

  const pricing = useMemo(() => {
    let perSession = selected.base;

    // Weekend / peak surcharges
    if (isWeekend) perSession += WEEKEND_SURCHARGE;
    if (isPeak) perSession += PEAK_SURCHARGE;

    // Package discount (lessons only)
    const tier = mode === "lesson" ? PACKAGE_TIERS[packageTier] : PACKAGE_TIERS[0];
    const discountedPerSession = Math.round(perSession * (1 - tier.discount / 100));

    // Group discount for clinics (simple per-person pricing already baked in)
    const sessions = tier.sessions;

    // Addons (per session)
    const addonTotal = ADDONS.filter((a) => enabledAddons.has(a.id)).reduce((s, a) => s + a.price, 0);
    const perSessionWithAddons = discountedPerSession + addonTotal;

    const riders = Math.max(1, groupSize);
    const total = perSessionWithAddons * sessions * riders;
    const savingsPerSession = perSession - discountedPerSession;
    const totalSavings = savingsPerSession * sessions * riders;

    return { perSession, discountedPerSession, perSessionWithAddons, sessions, total, totalSavings, discount: tier.discount, tierLabel: tier.label, riders };
  }, [selected, isWeekend, isPeak, packageTier, mode, groupSize, enabledAddons]);

  const toggleAddon = (id: string) => {
    setEnabledAddons((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatPrice = (n: number) => `$${n.toLocaleString()}`;

  return (
    <section className={cn("section-padding bg-background", className)}>
      <div className="section-container">
        <div
          ref={ref}
          className={cn("max-w-3xl mx-auto transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Calculator className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">Pricing Calculator</span>
            </div>
            <h2 className="heading-section text-foreground">Build Your Quote</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Customise your session type, package, and extras to see your price.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 space-y-7">
              {/* Mode toggle */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["lesson", "clinic"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeSwitch(m)}
                    className={cn(
                      "flex-1 py-2.5 text-sm font-medium transition-all",
                      mode === m ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m === "lesson" ? "Lessons" : "Clinics"}
                  </button>
                ))}
              </div>

              {/* Type selector */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-3 block">
                  {mode === "lesson" ? "Lesson Level" : "Clinic Type"}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {types.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={cn(
                        "rounded-lg border p-3 text-center transition-all duration-200",
                        selectedType === t.id
                          ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                          : "border-border hover:border-accent/30"
                      )}
                    >
                      <p className="text-sm font-semibold text-foreground">{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.duration} · {formatPrice(t.base)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Package tier (lessons only) */}
              {mode === "lesson" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-foreground">Package Size</Label>
                    <span className="text-sm font-semibold text-accent">
                      {PACKAGE_TIERS[packageTier].label}
                      {PACKAGE_TIERS[packageTier].discount > 0 && ` (${PACKAGE_TIERS[packageTier].discount}% off)`}
                    </span>
                  </div>
                  <Slider
                    value={[packageTier]}
                    onValueChange={([v]) => setPackageTier(v)}
                    min={0}
                    max={PACKAGE_TIERS.length - 1}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Single</span>
                    <span>5-pack</span>
                    <span>10-pack</span>
                    <span>20-pack</span>
                  </div>
                </div>
              )}

              {/* Group size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Riders
                  </Label>
                  <span className="text-sm font-semibold text-foreground">{groupSize}</span>
                </div>
                <Slider
                  value={[groupSize]}
                  onValueChange={([v]) => setGroupSize(v)}
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              {/* Surcharges */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className={cn("flex items-center justify-between flex-1 px-4 py-3 rounded-lg border transition-all", isWeekend ? "border-accent/40 bg-accent/5" : "border-border")}>
                  <div className="flex items-center gap-2">
                    <Switch checked={isWeekend} onCheckedChange={setIsWeekend} />
                    <span className="text-sm text-foreground flex items-center gap-1"><Sun className="h-3.5 w-3.5" /> Weekend</span>
                  </div>
                  <span className="text-xs text-muted-foreground">+${WEEKEND_SURCHARGE}</span>
                </div>
                <div className={cn("flex items-center justify-between flex-1 px-4 py-3 rounded-lg border transition-all", isPeak ? "border-accent/40 bg-accent/5" : "border-border")}>
                  <div className="flex items-center gap-2">
                    <Switch checked={isPeak} onCheckedChange={setIsPeak} />
                    <span className="text-sm text-foreground flex items-center gap-1"><Sunrise className="h-3.5 w-3.5" /> Peak (Dec–Feb)</span>
                  </div>
                  <span className="text-xs text-muted-foreground">+${PEAK_SURCHARGE}</span>
                </div>
              </div>

              {/* Addons */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-3 block">Optional Extras (per session)</Label>
                <div className="space-y-2">
                  {ADDONS.map((a) => (
                    <div
                      key={a.id}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-200",
                        enabledAddons.has(a.id) ? "border-accent/40 bg-accent/5" : "border-border hover:border-accent/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Switch checked={enabledAddons.has(a.id)} onCheckedChange={() => toggleAddon(a.id)} />
                        <span className="text-sm text-foreground">{a.label}</span>
                      </div>
                      <span className="text-sm font-medium text-accent">+{formatPrice(a.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimate */}
              <div className="border-t border-border pt-6">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base rate ({selected.label})</span>
                    <span>{formatPrice(selected.base)}/session</span>
                  </div>
                  {isWeekend && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Weekend surcharge</span>
                      <span>+{formatPrice(WEEKEND_SURCHARGE)}</span>
                    </div>
                  )}
                  {isPeak && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Peak season</span>
                      <span>+{formatPrice(PEAK_SURCHARGE)}</span>
                    </div>
                  )}
                  {pricing.discount > 0 && (
                    <div className="flex justify-between text-accent font-medium">
                      <span>{pricing.tierLabel} discount</span>
                      <span>-{pricing.discount}%</span>
                    </div>
                  )}
                  {enabledAddons.size > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Extras</span>
                      <span>+{formatPrice(ADDONS.filter((a) => enabledAddons.has(a.id)).reduce((s, a) => s + a.price, 0))}/session</span>
                    </div>
                  )}
                  {pricing.riders > 1 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Riders</span>
                      <span>×{pricing.riders}</span>
                    </div>
                  )}
                  {pricing.sessions > 1 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Sessions</span>
                      <span>×{pricing.sessions}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between mb-1">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Estimated Total</p>
                    <p className="font-serif text-4xl font-bold text-foreground tabular-nums">{formatPrice(pricing.total)}</p>
                    {pricing.sessions > 1 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatPrice(pricing.perSessionWithAddons)}/session × {pricing.sessions} sessions{pricing.riders > 1 ? ` × ${pricing.riders} riders` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    {pricing.totalSavings > 0 ? `Save ${formatPrice(pricing.totalSavings)}` : "Starting from"}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button asChild className="flex-1">
                    <Link to="/book-lesson">
                      Book Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to={groupSize > 1 ? "/group-booking" : "/contact"}>
                      {groupSize > 1 ? "Group Booking" : "Ask a Question"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
