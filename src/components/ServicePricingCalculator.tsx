import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Addon {
  id: string;
  label: string;
  price: number;
}

export interface ServiceCalculatorConfig {
  basePrice: number;
  unit: string;
  unitLabel: string;
  minUnits: number;
  maxUnits: number;
  defaultUnits: number;
  pricePerUnit: number;
  addons?: Addon[];
}

// Config per service slug
export const serviceCalculatorConfigs: Record<string, ServiceCalculatorConfig> = {
  "arena-construction": {
    basePrice: 25000,
    unit: "m²",
    unitLabel: "Arena size (m²)",
    minUnits: 200,
    maxUnits: 2000,
    defaultUnits: 600,
    pricePerUnit: 35,
    addons: [
      { id: "dust-control", label: "Dust control system", price: 4500 },
      { id: "all-weather", label: "All-weather surface", price: 8000 },
      { id: "lighting", label: "Arena lighting", price: 12000 },
      { id: "covered", label: "Covered structure", price: 45000 },
    ],
  },
  "barn-construction": {
    basePrice: 40000,
    unit: "stalls",
    unitLabel: "Number of stalls",
    minUnits: 2,
    maxUnits: 24,
    defaultUnits: 6,
    pricePerUnit: 6500,
    addons: [
      { id: "wash-rack", label: "Wash rack", price: 5500 },
      { id: "tack-room", label: "Deluxe tack room", price: 7000 },
      { id: "ventilation", label: "Premium ventilation", price: 4000 },
      { id: "rubber-matting", label: "Rubber stall matting", price: 1200 },
    ],
  },
  fencing: {
    basePrice: 5000,
    unit: "m",
    unitLabel: "Fence length (m)",
    minUnits: 50,
    maxUnits: 2000,
    defaultUnits: 300,
    pricePerUnit: 18,
    addons: [
      { id: "electric", label: "Electric fence system", price: 2500 },
      { id: "custom-gates", label: "Custom entry gates", price: 3500 },
      { id: "solar", label: "Solar-powered energiser", price: 1800 },
    ],
  },
  "round-pens": {
    basePrice: 8000,
    unit: "m",
    unitLabel: "Diameter (m)",
    minUnits: 12,
    maxUnits: 30,
    defaultUnits: 18,
    pricePerUnit: 350,
    addons: [
      { id: "shade", label: "Shade structure", price: 4000 },
      { id: "footing", label: "Premium footing", price: 3000 },
      { id: "holding-yard", label: "Adjacent holding yard", price: 5500 },
    ],
  },
  infrastructure: {
    basePrice: 15000,
    unit: "m²",
    unitLabel: "Site area (m²)",
    minUnits: 500,
    maxUnits: 20000,
    defaultUnits: 5000,
    pricePerUnit: 5,
    addons: [
      { id: "bore", label: "Bore / well installation", price: 12000 },
      { id: "electrical", label: "Full electrical conduit", price: 8000 },
      { id: "access-road", label: "Gravel access road", price: 6000 },
    ],
  },
  renovations: {
    basePrice: 3000,
    unit: "items",
    unitLabel: "Scope of work (areas)",
    minUnits: 1,
    maxUnits: 10,
    defaultUnits: 3,
    pricePerUnit: 4000,
    addons: [
      { id: "assessment", label: "Full structural assessment", price: 2500 },
      { id: "compliance", label: "Code compliance audit", price: 3000 },
      { id: "design", label: "Design consultation", price: 2000 },
    ],
  },
  "full-facility": {
    basePrice: 150000,
    unit: "zones",
    unitLabel: "Facility zones",
    minUnits: 2,
    maxUnits: 8,
    defaultUnits: 4,
    pricePerUnit: 40000,
    addons: [
      { id: "renders", label: "3D concept renders", price: 5000 },
      { id: "project-mgmt", label: "Full project management", price: 15000 },
      { id: "landscaping", label: "Landscaping & revegetation", price: 12000 },
    ],
  },
  "clinics-events": {
    basePrice: 50000,
    unit: "areas",
    unitLabel: "Event areas",
    minUnits: 1,
    maxUnits: 6,
    defaultUnits: 2,
    pricePerUnit: 30000,
    addons: [
      { id: "lighting", label: "Night event lighting", price: 15000 },
      { id: "pa-scoring", label: "PA & scoring system", price: 8000 },
      { id: "spectator", label: "Covered spectator seating", price: 20000 },
    ],
  },
};

interface ServicePricingCalculatorProps {
  serviceId: string;
  className?: string;
}

export function ServicePricingCalculator({ serviceId, className }: ServicePricingCalculatorProps) {
  const config = serviceCalculatorConfigs[serviceId];

  const [units, setUnits] = useState(config?.defaultUnits ?? 0);
  const [enabledAddons, setEnabledAddons] = useState<Set<string>>(new Set());

  const estimate = useMemo(() => {
    if (!config) return 0;
    const base = config.basePrice + units * config.pricePerUnit;
    const addonsTotal = (config.addons ?? [])
      .filter((a) => enabledAddons.has(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return base + addonsTotal;
  }, [config, units, enabledAddons]);

  if (!config) return null;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(n);

  const toggleAddon = (addonId: string) => {
    setEnabledAddons((prev) => {
      const next = new Set(prev);
      if (next.has(addonId)) next.delete(addonId);
      else next.add(addonId);
      return next;
    });
  };

  const step =
    config.unit === "stalls" || config.unit === "items" || config.unit === "zones" || config.unit === "areas"
      ? 1
      : config.minUnits <= 50
      ? 1
      : 10;

  return (
    <div className={cn("max-w-3xl mx-auto", className)}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
          <Calculator className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-accent">Pricing Calculator</span>
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground">
          Estimate Your Investment
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Adjust to match your project — final pricing after on-site consultation.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          {/* Size slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-foreground">
                {config.unitLabel}
              </Label>
              <span className="text-lg font-semibold text-accent tabular-nums">
                {units.toLocaleString()} {config.unit}
              </span>
            </div>
            <Slider
              value={[units]}
              onValueChange={([val]) => setUnits(val)}
              min={config.minUnits}
              max={config.maxUnits}
              step={step}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>
                {config.minUnits} {config.unit}
              </span>
              <span>
                {config.maxUnits.toLocaleString()} {config.unit}
              </span>
            </div>
          </div>

          {/* Add-ons */}
          {config.addons && config.addons.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">
                Optional Add-ons
              </Label>
              <div className="space-y-3">
                {config.addons.map((addon) => (
                  <div
                    key={addon.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-200",
                      enabledAddons.has(addon.id)
                        ? "border-accent/40 bg-accent/5"
                        : "border-border hover:border-accent/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={enabledAddons.has(addon.id)}
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
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Link to={`/contact?services=${serviceId}&budget=${formatPrice(estimate)}`}>
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
