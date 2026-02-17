import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calculator, Plus, Minus, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface ServiceOption {
  id: string;
  title: string;
  basePrice: number;
  unit: string;
  unitLabel: string;
  minUnits: number;
  maxUnits: number;
  defaultUnits: number;
  pricePerUnit: number;
  addons?: { id: string; label: string; price: number }[];
}

const calculatorServices: ServiceOption[] = [
  {
    id: "arena-construction",
    title: "Arena Construction",
    basePrice: 60000,
    unit: "sqm",
    unitLabel: "Arena size (m²)",
    minUnits: 400,
    maxUnits: 3000,
    defaultUnits: 1200,
    pricePerUnit: 85,
    addons: [
      { id: "dust-control", label: "Dust control system", price: 12000 },
      { id: "all-weather", label: "All-weather surface", price: 25000 },
      { id: "lighting", label: "Arena lighting", price: 35000 },
      { id: "cover", label: "Full arena cover/roof", price: 150000 },
    ],
  },
  {
    id: "barn-construction",
    title: "Barn & Stable Building",
    basePrice: 80000,
    unit: "stalls",
    unitLabel: "Number of stalls",
    minUnits: 2,
    maxUnits: 24,
    defaultUnits: 6,
    pricePerUnit: 18000,
    addons: [
      { id: "wash-rack", label: "Hot & cold wash rack", price: 15000 },
      { id: "tack-room", label: "Deluxe tack room fit-out", price: 20000 },
      { id: "ventilation", label: "Premium cross-ventilation", price: 12000 },
      { id: "stonework", label: "Custom stonework finish", price: 30000 },
    ],
  },
  {
    id: "fencing",
    title: "Equine Fencing",
    basePrice: 8000,
    unit: "m",
    unitLabel: "Fence length (m)",
    minUnits: 50,
    maxUnits: 2000,
    defaultUnits: 300,
    pricePerUnit: 140,
    addons: [
      { id: "electric", label: "Electric fence system", price: 6000 },
      { id: "custom-gates", label: "Custom entry gates", price: 8500 },
    ],
  },
  {
    id: "round-pens",
    title: "Round Pens & Paddocks",
    basePrice: 15000,
    unit: "m",
    unitLabel: "Diameter (m)",
    minUnits: 12,
    maxUnits: 30,
    defaultUnits: 18,
    pricePerUnit: 950,
    addons: [
      { id: "shade", label: "Shade structure", price: 12000 },
      { id: "footing", label: "Premium footing", price: 8000 },
    ],
  },
];

export function QuoteCalculator() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const [selectedServiceId, setSelectedServiceId] = useState(calculatorServices[0].id);
  const [units, setUnits] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    calculatorServices.forEach((s) => (init[s.id] = s.defaultUnits));
    return init;
  });
  const [enabledAddons, setEnabledAddons] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    calculatorServices.forEach((s) => (init[s.id] = new Set()));
    return init;
  });

  const selectedService = calculatorServices.find((s) => s.id === selectedServiceId)!;
  const currentUnits = units[selectedServiceId] ?? selectedService.defaultUnits;
  const currentAddons = enabledAddons[selectedServiceId] ?? new Set();

  const estimate = useMemo(() => {
    const base = selectedService.basePrice + currentUnits * selectedService.pricePerUnit;
    const addonsTotal = (selectedService.addons ?? [])
      .filter((a) => currentAddons.has(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return base + addonsTotal;
  }, [selectedService, currentUnits, currentAddons]);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);

  const toggleAddon = (addonId: string) => {
    setEnabledAddons((prev) => {
      const next = { ...prev };
      const set = new Set(prev[selectedServiceId]);
      if (set.has(addonId)) set.delete(addonId);
      else set.add(addonId);
      next[selectedServiceId] = set;
      return next;
    });
  };

  return (
    <div
      ref={ref}
      className={`mt-16 max-w-3xl mx-auto transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
          <Calculator className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-accent">Quote Calculator</span>
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground">
          Estimate Your Project
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Adjust the sliders below to get an indicative budget — final pricing after on-site consult.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
        {/* Service selector tabs */}
        <div className="flex overflow-x-auto border-b border-border bg-muted/30">
          {calculatorServices.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedServiceId(s.id)}
              className={cn(
                "flex-1 min-w-[120px] px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-300 border-b-2",
                selectedServiceId === s.id
                  ? "border-accent text-accent bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {s.title.split(" ")[0]}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Size slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-foreground">
                {selectedService.unitLabel}
              </Label>
              <span className="text-lg font-semibold text-accent tabular-nums">
                {currentUnits.toLocaleString()} {selectedService.unit}
              </span>
            </div>
            <Slider
              value={[currentUnits]}
              onValueChange={([val]) =>
                setUnits((prev) => ({ ...prev, [selectedServiceId]: val }))
              }
              min={selectedService.minUnits}
              max={selectedService.maxUnits}
              step={selectedService.unit === "stalls" ? 1 : selectedService.minUnits <= 50 ? 1 : 10}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>
                {selectedService.minUnits} {selectedService.unit}
              </span>
              <span>
                {selectedService.maxUnits} {selectedService.unit}
              </span>
            </div>
          </div>

          {/* Add-ons */}
          {selectedService.addons && selectedService.addons.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">
                Optional Add-ons
              </Label>
              <div className="space-y-3">
                {selectedService.addons.map((addon) => (
                  <div
                    key={addon.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-200",
                      currentAddons.has(addon.id)
                        ? "border-accent/40 bg-accent/5"
                        : "border-border hover:border-accent/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={currentAddons.has(addon.id)}
                        onCheckedChange={() => toggleAddon(addon.id)}
                      />
                      <span className="text-sm text-foreground">{addon.label}</span>
                    </div>
                    <span className="text-sm font-medium text-accent">
                      +{formatPrice(addon.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimate */}
          <div className="border-t border-border pt-6">
            <div className="flex items-end justify-between mb-1">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Estimated Investment
                </p>
                <p className="font-serif text-4xl font-bold text-foreground tabular-nums">
                  {formatPrice(estimate)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                Indicative only
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                asChild
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link
                  to={`/contact?services=${selectedServiceId}&budget=${formatPrice(estimate)}`}
                >
                  Get Exact Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 border-accent/30 text-accent hover:bg-accent/10"
              >
                <Link to="/contact">
                  <Calculator className="mr-2 h-4 w-4" />
                  Free Consultation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
