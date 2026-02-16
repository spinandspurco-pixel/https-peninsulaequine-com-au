import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useCelebrationSound } from "@/hooks/useCelebrationSound";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Send,
  CalendarIcon,
  Check
} from "lucide-react";
import { FileUploadZone, type UploadedFile } from "@/components/FileUploadZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { services } from "@/data/content";

// Custom hook for swipe gestures
function useSwipeGesture(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onSwipeLeft();
    } else if (isRightSwipe) {
      onSwipeRight();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}

// Form validation schema
const inquirySchema = z.object({
  // Step 1: Services
  interestedServices: z.array(z.string()).min(1, "Please select at least one service"),
  
  // Step 2: Horse Details
  horseName: z.string().max(100).optional(),
  horseAge: z.string().max(50).optional(),
  horseBreed: z.string().max(100).optional(),
  numberOfHorses: z.string().max(20).optional(),
  
  // Step 3: Goals (with conditional fields)
  goals: z.string().max(1000, "Please keep your goals under 1000 characters"),
  arenaDimensions: z.string().max(100).optional(),
  arenaFootingPreference: z.string().max(100).optional(),
  arenaCovered: z.string().optional(),
  barnStallCount: z.string().max(20).optional(),
  barnFeatures: z.array(z.string()).optional(),
  fenceLength: z.string().max(100).optional(),
  fenceMaterial: z.string().optional(),
  // Round Pens & Paddocks
  roundPenDiameter: z.string().max(100).optional(),
  roundPenSurface: z.string().optional(),
  roundPenType: z.string().optional(),
  paddockCount: z.string().max(20).optional(),
  propertyAcreage: z.string().max(50).optional(),
  existingStructures: z.string().max(500).optional(),
  // Facility Design & Build
  facilityTotalAcreage: z.string().max(50).optional(),
  facilityComponents: z.array(z.string()).optional(),
  facilityTimeline: z.string().optional(),
  // Clinics & Events
  eventType: z.string().optional(),
  eventCapacity: z.string().max(50).optional(),
  eventFrequency: z.string().optional(),
  eventAmenities: z.array(z.string()).optional(),
  
  // Step 4: Experience & Budget
  experienceLevel: z.string().min(1, "Please select your experience level"),
  budgetRange: z.string().min(1, "Please select a budget range"),
  
  // Step 5: Contact Info
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  phone: z.string().max(20).optional(),
  preferredDate: z.date().optional(),
  additionalNotes: z.string().max(500).optional(),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

const STEPS = [
  { id: 1, title: "Services", description: "What can we help with?" },
  { id: 2, title: "Horse Details", description: "Tell us about your horses" },
  { id: 3, title: "Goals", description: "What do you want to achieve?" },
  { id: 4, title: "Experience", description: "Your background & budget" },
  { id: 5, title: "Contact", description: "How can we reach you?" },
  { id: 6, title: "Review", description: "Confirm your inquiry" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "New to horses or horse ownership" },
  { value: "intermediate", label: "Intermediate", description: "Some experience with horses and facilities" },
  { value: "advanced", label: "Advanced", description: "Experienced owner or professional" },
  { value: "professional", label: "Professional", description: "Trainer, breeder, or facility manager" },
];

const BUDGET_RANGES = [
  { value: "under-25k", label: "Under $25,000" },
  { value: "25k-50k", label: "$25,000 - $50,000" },
  { value: "50k-100k", label: "$50,000 - $100,000" },
  { value: "100k-250k", label: "$100,000 - $250,000" },
  { value: "250k-plus", label: "$250,000+" },
  { value: "not-sure", label: "Not sure yet" },
];

// Conditional field options
const ARENA_FOOTING_OPTIONS = [
  { value: "sand", label: "Sand" },
  { value: "fiber-sand", label: "Fiber-Sand Mix" },
  { value: "rubber", label: "Rubber/Synthetic" },
  { value: "not-sure", label: "Not sure – advise me" },
];

const BARN_FEATURE_OPTIONS = [
  { value: "wash-rack", label: "Wash Rack" },
  { value: "tack-room", label: "Tack Room" },
  { value: "feed-room", label: "Feed/Hay Storage" },
  { value: "office", label: "Office" },
  { value: "bathroom", label: "Bathroom" },
  { value: "loft", label: "Loft/Hay Loft" },
];

// Facility component options
const FACILITY_COMPONENT_OPTIONS = [
  { value: "arena", label: "Arena" },
  { value: "barn", label: "Barn / Stables" },
  { value: "paddocks", label: "Paddocks / Turnout" },
  { value: "round-pen", label: "Round Pen" },
  { value: "wash-bay", label: "Wash Bay" },
  { value: "hay-shed", label: "Hay / Feed Shed" },
  { value: "tack-room", label: "Tack Room" },
  { value: "office", label: "Office / Amenities" },
  { value: "parking", label: "Truck & Float Parking" },
];

const FACILITY_TIMELINE_OPTIONS = [
  { value: "3-6-months", label: "3–6 months" },
  { value: "6-12-months", label: "6–12 months" },
  { value: "12-plus", label: "12+ months" },
  { value: "flexible", label: "Flexible / planning stage" },
];

// Event type options
const EVENT_TYPE_OPTIONS = [
  { value: "clinic", label: "Training Clinic" },
  { value: "competition", label: "Competition / Show" },
  { value: "multi-day", label: "Multi-Day Event" },
  { value: "expo", label: "Equine Expo / Trade Show" },
  { value: "other", label: "Other" },
];

const EVENT_FREQUENCY_OPTIONS = [
  { value: "one-off", label: "One-off build" },
  { value: "monthly", label: "Monthly events" },
  { value: "seasonal", label: "Seasonal (a few per year)" },
  { value: "weekly", label: "Weekly use" },
];

const EVENT_AMENITY_OPTIONS = [
  { value: "spectator-seating", label: "Spectator Seating" },
  { value: "pa-system", label: "PA / Sound System" },
  { value: "lighting", label: "Arena Lighting" },
  { value: "warm-up-ring", label: "Warm-Up Ring" },
  { value: "temp-stabling", label: "Temporary Stabling" },
  { value: "food-vendor", label: "Food / Vendor Area" },
  { value: "parking", label: "Parking / Truck Access" },
  { value: "scoring", label: "Scoring / Judges Box" },
];

const ROUND_PEN_SURFACE_OPTIONS = [
  { value: "sand", label: "Sand" },
  { value: "fiber-sand", label: "Fiber-Sand Mix" },
  { value: "rubber", label: "Rubber/Synthetic" },
  { value: "dirt", label: "Compacted Dirt" },
  { value: "not-sure", label: "Not sure – advise me" },
];

const ROUND_PEN_TYPE_OPTIONS = [
  { value: "permanent", label: "Permanent" },
  { value: "portable", label: "Portable Panels" },
  { value: "not-sure", label: "Not sure yet" },
];

const FENCE_MATERIAL_OPTIONS = [
  { value: "wood-post-rail", label: "Wood Post & Rail" },
  { value: "pipe", label: "Pipe Fencing" },
  { value: "no-climb", label: "No-Climb Wire" },
  { value: "flex", label: "Flex Fencing" },
  { value: "electric", label: "Electric" },
  { value: "not-sure", label: "Not sure – advise me" },
];

// Horseshoe confetti particle component
function ConfettiParticle({ delay, color, size }: { delay: number; color: string; size: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 14, md: 18, lg: 22 };
  const px = sizeMap[size];
  
  return (
    <div
      className="absolute animate-confetti"
      style={{
        left: `${10 + Math.random() * 80}%`,
        animationDelay: `${delay}ms`,
        animationDuration: `${1200 + Math.random() * 800}ms`,
        opacity: 0.85,
      }}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        style={{ transform: `rotate(${Math.random() * 360}deg)` }}
      >
        <path
          d="M5 2C3.3 2 2 3.8 2 6c0 2.5 1 4.5 2 6l1.5 2.5c.3.5.5 1 .5 1.5v2a1 1 0 0 0 2 0v-2.5L7 14l-1-2C4.8 10.2 4 8.2 4 6c0-1.5.6-2 1-2s1 .5 1 2v1h2V6c0-2.2-1.3-4-3-4zm14 0c-1.7 0-3 1.8-3 4v1h2V6c0-1.5.6-2 1-2s1 .5 1 2c0 2.2-.8 4.2-2 6l-1 2-1 1.5V16a1 1 0 0 0 2 0v-2c0-.5.2-1 .5-1.5L20 12c1-1.5 2-3.5 2-6 0-2.2-1.3-4-3-4z"
          fill={color}
        />
      </svg>
    </div>
  );
}

// Celebration confetti burst
function CelebrationConfetti({ show }: { show: boolean }) {
  const [particles, setParticles] = useState<{ id: number; delay: number; color: string; size: 'sm' | 'md' | 'lg' }[]>([]);

  useEffect(() => {
    if (show) {
      // Warm, festive color palette matching the brand
      const colors = [
        'hsl(var(--accent))',           // Copper accent
        'hsl(28 50% 60%)',              // Light copper
        'hsl(28 65% 35%)',              // Dark copper
        '#D4A574',                       // Warm gold
        '#C4956A',                       // Antique brass
        'hsl(40 30% 96%)',              // Linen highlight
      ];
      const sizes: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg'];
      
      // Reduced particle count for subtlety (16 instead of 24)
      const newParticles = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        delay: Math.random() * 400,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
      }));
      setParticles(newParticles);

      // Clear particles after animation
      const timer = setTimeout(() => setParticles([]), 2500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} delay={particle.delay} color={particle.color} size={particle.size} />
      ))}
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevStep, setPrevStep] = useState(currentStep);
  const { playCelebration } = useCelebrationSound();

  // Trigger confetti and sound when reaching the final step
  useEffect(() => {
    if (currentStep === STEPS.length && prevStep < STEPS.length) {
      setShowConfetti(true);
      playCelebration();
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
    setPrevStep(currentStep);
  }, [currentStep, prevStep, playCelebration]);

  return (
    <div className="mb-8 relative">
      {/* Celebration Confetti */}
      <CelebrationConfetti show={showConfetti} />

      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className={cn(
            "text-xs font-medium transition-all duration-300",
            currentStep === STEPS.length 
              ? "text-accent scale-110" 
              : "text-accent"
          )}>
            {Math.round(progressPercentage)}% Complete
            {currentStep === STEPS.length && " 🎉"}
          </span>
        </div>
      </div>

      {/* Step Circles - Touch-friendly with larger tap targets */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              {/* Larger tap target wrapper for mobile */}
              <div className="p-1 -m-1">
                <div
                  className={cn(
                    "w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    currentStep > step.id
                      ? "bg-accent text-accent-foreground scale-100"
                      : currentStep === step.id
                      ? "bg-accent text-accent-foreground ring-4 ring-accent/20 scale-110 animate-pulse-subtle"
                      : "bg-muted text-muted-foreground scale-100"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5 animate-scale-in" />
                  ) : (
                    step.id
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "hidden sm:block text-xs mt-2 transition-colors duration-300",
                  currentStep >= step.id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="relative h-0.5 w-6 sm:w-16 lg:w-24 mx-1 sm:mx-2 bg-muted overflow-hidden rounded-full">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 bg-accent transition-all duration-500 ease-out",
                    currentStep > step.id ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Swipe hint for mobile */}
      <p className="text-center text-xs text-muted-foreground mt-4 sm:hidden">
        Swipe left or right to navigate
      </p>
    </div>
  );
}
function ReviewBlock({ label, stepNum, onEdit, children }: { label: string; stepNum: number; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{label}</span>
        <button type="button" onClick={onEdit} className="text-xs text-accent hover:underline">Edit (Step {stepNum})</button>
      </div>
      {children}
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

export function InquiryForm() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  // Read pre-selected services from URL params (e.g., ?services=arena-construction,fencing)
  const preSelectedServices = searchParams.get("services")?.split(",").filter(Boolean) || [];

  // Read pre-selected date from URL params (e.g., ?date=2026-03-15)
  const preSelectedDateStr = searchParams.get("date");
  const preSelectedDate = preSelectedDateStr ? new Date(preSelectedDateStr) : undefined;
  const validPreSelectedDate = preSelectedDate && !isNaN(preSelectedDate.getTime()) ? preSelectedDate : undefined;

  const [formData, setFormData] = useState<Partial<InquiryFormData>>({
    interestedServices: preSelectedServices,
    horseName: "",
    horseAge: "",
    horseBreed: "",
    numberOfHorses: "",
    goals: "",
    arenaDimensions: "",
    arenaFootingPreference: "",
    arenaCovered: "",
    barnStallCount: "",
    barnFeatures: [],
    fenceLength: "",
    fenceMaterial: "",
    roundPenDiameter: "",
    roundPenSurface: "",
    roundPenType: "",
    paddockCount: "",
    propertyAcreage: "",
    existingStructures: "",
    facilityTotalAcreage: "",
    facilityComponents: [],
    facilityTimeline: "",
    eventType: "",
    eventCapacity: "",
    eventFrequency: "",
    eventAmenities: [],
    experienceLevel: "",
    budgetRange: "",
    name: "",
    email: "",
    phone: "",
    preferredDate: validPreSelectedDate,
    additionalNotes: "",
  });

  // Auto-advance to the Goals step (step 3) if services were pre-selected via URL,
  // so users land directly on the service-specific fields (arena dims, barn stalls, etc.)
  useEffect(() => {
    if (preSelectedServices.length > 0) {
      setCurrentStep(3);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = <K extends keyof InquiryFormData>(
    field: K,
    value: InquiryFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleService = (serviceId: string) => {
    const current = formData.interestedServices || [];
    const updated = current.includes(serviceId)
      ? current.filter((s) => s !== serviceId)
      : [...current, serviceId];
    updateField("interestedServices", updated);
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!formData.interestedServices?.length) {
          newErrors.interestedServices = "Please select at least one service";
        }
        break;
      case 2:
        // Horse details are optional
        break;
      case 3:
        if (!formData.goals?.trim()) {
          newErrors.goals = "Please describe your goals";
        }
        break;
      case 4:
        if (!formData.experienceLevel) {
          newErrors.experienceLevel = "Please select your experience level";
        }
        if (!formData.budgetRange) {
          newErrors.budgetRange = "Please select a budget range";
        }
        break;
      case 5:
        if (!formData.name?.trim()) {
          newErrors.name = "Name is required";
        }
        if (!formData.email?.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = useCallback(() => {
    if (validateStep() && currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Swipe gesture handlers
  const swipeHandlers = useSwipeGesture(nextStep, prevStep);

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      // Build conditional project details string from service-specific fields
      const detailParts: string[] = [];
      if (formData.arenaDimensions) detailParts.push(`Arena dimensions: ${formData.arenaDimensions}`);
      if (formData.arenaCovered) detailParts.push(`Arena type: ${formData.arenaCovered}`);
      if (formData.arenaFootingPreference) detailParts.push(`Footing: ${formData.arenaFootingPreference}`);
      if (formData.barnStallCount) detailParts.push(`Stalls: ${formData.barnStallCount}`);
      if (formData.barnFeatures?.length) detailParts.push(`Barn features: ${formData.barnFeatures.join(", ")}`);
      if (formData.fenceLength) detailParts.push(`Fence length: ${formData.fenceLength}`);
      if (formData.fenceMaterial) detailParts.push(`Fence material: ${formData.fenceMaterial}`);
      if (formData.roundPenDiameter) detailParts.push(`Round pen diameter: ${formData.roundPenDiameter}`);
      if (formData.roundPenSurface) detailParts.push(`Round pen surface: ${formData.roundPenSurface}`);
      if (formData.roundPenType) detailParts.push(`Round pen type: ${formData.roundPenType}`);
      if (formData.paddockCount) detailParts.push(`Paddock count: ${formData.paddockCount}`);
      if (formData.propertyAcreage) detailParts.push(`Acreage: ${formData.propertyAcreage}`);
      if (formData.existingStructures) detailParts.push(`Existing structures: ${formData.existingStructures}`);
      if (formData.facilityTotalAcreage) detailParts.push(`Facility acreage: ${formData.facilityTotalAcreage}`);
      if (formData.facilityTimeline) detailParts.push(`Timeline: ${formData.facilityTimeline}`);
      if (formData.facilityComponents?.length) detailParts.push(`Facility components: ${formData.facilityComponents.join(", ")}`);
      if (formData.eventType) detailParts.push(`Event type: ${formData.eventType}`);
      if (formData.eventCapacity) detailParts.push(`Event capacity: ${formData.eventCapacity}`);
      if (formData.eventFrequency) detailParts.push(`Event frequency: ${formData.eventFrequency}`);
      if (formData.eventAmenities?.length) detailParts.push(`Event amenities: ${formData.eventAmenities.join(", ")}`);
      const combinedDetails = [detailParts.join("; "), formData.additionalNotes?.trim()].filter(Boolean).join("\n\n");

      const { error } = await supabase.from("inquiries").insert({
        name: formData.name?.trim() || "",
        email: formData.email?.trim() || "",
        phone: formData.phone?.trim() || null,
        preferred_contact: "email",
        services: formData.interestedServices || [],
        horse_name: formData.horseName?.trim() || null,
        horse_age: formData.horseAge?.trim() || null,
        horse_breed: formData.horseBreed?.trim() || null,
        project_vision: formData.goals?.trim() || null,
        project_details: combinedDetails || null,
        experience_level: formData.experienceLevel || null,
        budget_range: formData.budgetRange || null,
        preferred_start: formData.preferredDate 
          ? format(formData.preferredDate, "yyyy-MM-dd") 
          : null,
        attachment_urls: attachments.map((a) => a.url),
      });

      if (error) throw error;

      // Send email notification (don't block on failure)
      try {
        await supabase.functions.invoke("send-inquiry-notification", {
          body: {
            name: formData.name?.trim(),
            email: formData.email?.trim(),
            phone: formData.phone?.trim(),
            services: formData.interestedServices || [],
            horseName: formData.horseName?.trim(),
            horseAge: formData.horseAge?.trim(),
            horseBreed: formData.horseBreed?.trim(),
            goals: formData.goals?.trim(),
            experienceLevel: formData.experienceLevel,
            budgetRange: formData.budgetRange,
            preferredDate: formData.preferredDate 
              ? format(formData.preferredDate, "yyyy-MM-dd") 
              : undefined,
            additionalNotes: formData.additionalNotes?.trim(),
          },
        });
      } catch (emailError) {
        // Log but don't fail the submission
        console.error("Failed to send notification email:", emailError);
      }

      setIsSubmitted(true);
      toast({
        title: "Inquiry submitted!",
        description: "We'll review your project details and get back to you soon.",
      });
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-accent" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">
          Thank You for Your Inquiry!
        </h3>
        <p className="text-muted-foreground mb-2 max-w-md mx-auto">
          We've received your project details and will review them carefully.
        </p>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Expect to hear from us within 1-2 business days.
        </p>
        <Button
          onClick={() => {
            setIsSubmitted(false);
            setCurrentStep(1);
            setFormData({
              interestedServices: [],
              horseName: "",
              horseAge: "",
              horseBreed: "",
              numberOfHorses: "",
              goals: "",
              arenaDimensions: "",
              arenaFootingPreference: "",
              arenaCovered: "",
              barnStallCount: "",
              barnFeatures: [],
              fenceLength: "",
              fenceMaterial: "",
              roundPenDiameter: "",
              roundPenSurface: "",
              roundPenType: "",
              paddockCount: "",
              propertyAcreage: "",
              existingStructures: "",
              facilityTotalAcreage: "",
              facilityComponents: [],
              facilityTimeline: "",
              eventType: "",
              eventCapacity: "",
              eventFrequency: "",
              eventAmenities: [],
              experienceLevel: "",
              budgetRange: "",
              name: "",
              email: "",
              phone: "",
              preferredDate: undefined,
              additionalNotes: "",
            });
            setAttachments([]);
          }}
          variant="outline"
        >
          Submit Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator currentStep={currentStep} />

      {/* Swipeable form container */}
      <div 
        className="min-h-[400px] touch-pan-y"
        {...swipeHandlers}
      >
        {/* Step 1: Services */}
        {currentStep === 1 && (
          <div className="animate-fade-in">
            {/* Pre-fill banner when services come from URL */}
            {preSelectedServices.length > 0 && (
              <div className="mb-6 rounded-lg bg-accent/5 border border-accent/20 p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Pre-selected from your service choice
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {preSelectedServices.map(id => services.find(s => s.id === id)?.title).filter(Boolean).join(", ")}
                    {" "}— feel free to add or remove services below.
                  </p>
                </div>
              </div>
            )}
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              What services are you interested in?
            </h3>
            <p className="text-muted-foreground mb-6">
              Select all that apply to your project.
            </p>
            
            {/* Touch-friendly service cards with larger tap targets */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {services.map((service) => {
                const isSelected = formData.interestedServices?.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={cn(
                      "p-5 sm:p-4 rounded-lg border text-left transition-all min-h-[80px] active:scale-[0.98]",
                      isSelected
                        ? "border-accent bg-accent/5 shadow-sm"
                        : "border-border hover:border-accent/50 active:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-6 h-6 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                          isSelected
                            ? "bg-accent border-accent text-accent-foreground scale-110"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-base sm:text-sm">{service.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {service.shortDescription}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {errors.interestedServices && (
              <p className="text-destructive text-sm mt-4">{errors.interestedServices}</p>
            )}
          </div>
        )}

        {/* Step 2: Horse Details */}
        {currentStep === 2 && (
          <div className="animate-fade-in">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Tell us about your horses
            </h3>
            <p className="text-muted-foreground mb-6">
              This helps us understand your needs better. All fields are optional.
            </p>
            
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horseName" className="text-base sm:text-sm">Horse Name(s)</Label>
                  <Input
                    id="horseName"
                    value={formData.horseName || ""}
                    onChange={(e) => updateField("horseName", e.target.value)}
                    placeholder="e.g., Star, Bella"
                    maxLength={100}
                    className="h-12 sm:h-10 text-base sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfHorses" className="text-base sm:text-sm">Number of Horses</Label>
                  <Input
                    id="numberOfHorses"
                    value={formData.numberOfHorses || ""}
                    onChange={(e) => updateField("numberOfHorses", e.target.value)}
                    placeholder="e.g., 3"
                    maxLength={20}
                    className="h-12 sm:h-10 text-base sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horseAge" className="text-base sm:text-sm">Age(s)</Label>
                  <Input
                    id="horseAge"
                    value={formData.horseAge || ""}
                    onChange={(e) => updateField("horseAge", e.target.value)}
                    placeholder="e.g., 8 years, 12 years"
                    maxLength={50}
                    className="h-12 sm:h-10 text-base sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horseBreed" className="text-base sm:text-sm">Breed(s)</Label>
                  <Input
                    id="horseBreed"
                    value={formData.horseBreed || ""}
                    onChange={(e) => updateField("horseBreed", e.target.value)}
                    placeholder="e.g., Quarter Horse, Warmblood"
                    maxLength={100}
                    className="h-12 sm:h-10 text-base sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals + Conditional Fields */}
        {currentStep === 3 && (
          <div className="animate-fade-in">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Project details & goals
            </h3>
            <p className="text-muted-foreground mb-6">
              Tell us about your vision. Fields below adapt to your selected services.
            </p>
            
            <div className="space-y-6">
              {/* Arena-specific fields */}
              {formData.interestedServices?.includes("arena-construction") && (
                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-4">
                  <p className="text-sm font-medium text-accent">Arena Details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Desired Dimensions</Label>
                      <Input
                        value={formData.arenaDimensions || ""}
                        onChange={(e) => updateField("arenaDimensions", e.target.value)}
                        placeholder="e.g., 60m × 20m, 200' × 100'"
                        maxLength={100}
                        className="h-12 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Covered or Open?</Label>
                      <Select value={formData.arenaCovered} onValueChange={(v) => updateField("arenaCovered", v)}>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="covered">Covered Arena</SelectItem>
                          <SelectItem value="open">Open Arena</SelectItem>
                          <SelectItem value="not-sure">Not sure yet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base sm:text-sm">Footing Preference</Label>
                    <Select value={formData.arenaFootingPreference} onValueChange={(v) => updateField("arenaFootingPreference", v)}>
                      <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="Select footing type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ARENA_FOOTING_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Barn-specific fields */}
              {formData.interestedServices?.includes("barn-construction") && (
                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-4">
                  <p className="text-sm font-medium text-accent">Barn Details</p>
                  <div className="space-y-2">
                    <Label className="text-base sm:text-sm">Number of Stalls</Label>
                    <Input
                      value={formData.barnStallCount || ""}
                      onChange={(e) => updateField("barnStallCount", e.target.value)}
                      placeholder="e.g., 6, 12, 20"
                      maxLength={20}
                      className="h-12 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base sm:text-sm">Desired Features</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BARN_FEATURE_OPTIONS.map((feat) => {
                        const isChecked = formData.barnFeatures?.includes(feat.value);
                        return (
                          <button
                            key={feat.value}
                            type="button"
                            onClick={() => {
                              const current = formData.barnFeatures || [];
                              const updated = isChecked
                                ? current.filter((f) => f !== feat.value)
                                : [...current, feat.value];
                              updateField("barnFeatures", updated);
                            }}
                            className={cn(
                              "px-3 py-2 rounded-md border text-sm transition-all active:scale-[0.98]",
                              isChecked
                                ? "border-accent bg-accent/10 text-foreground"
                                : "border-border text-muted-foreground hover:border-accent/50"
                            )}
                          >
                            {isChecked && <Check className="w-3 h-3 inline mr-1" />}
                            {feat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Fencing-specific fields */}
              {formData.interestedServices?.includes("fencing") && (
                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-4">
                  <p className="text-sm font-medium text-accent">Fencing Details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Approx. Length</Label>
                      <Input
                        value={formData.fenceLength || ""}
                        onChange={(e) => updateField("fenceLength", e.target.value)}
                        placeholder="e.g., 500m, 1500 feet"
                        maxLength={100}
                        className="h-12 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Preferred Material</Label>
                      <Select value={formData.fenceMaterial} onValueChange={(v) => updateField("fenceMaterial", v)}>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                          <SelectValue placeholder="Select material..." />
                        </SelectTrigger>
                        <SelectContent>
                          {FENCE_MATERIAL_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Round Pens & Paddocks fields */}
              {formData.interestedServices?.includes("round-pens") && (
                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-4">
                  <p className="text-sm font-medium text-accent">Round Pen & Paddock Details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Pen Diameter</Label>
                      <Input
                        value={formData.roundPenDiameter || ""}
                        onChange={(e) => updateField("roundPenDiameter", e.target.value)}
                        placeholder="e.g., 18m, 60 feet"
                        maxLength={100}
                        className="h-12 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Number of Paddocks</Label>
                      <Input
                        value={formData.paddockCount || ""}
                        onChange={(e) => updateField("paddockCount", e.target.value)}
                        placeholder="e.g., 4, 8"
                        maxLength={20}
                        className="h-12 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Surface Material</Label>
                      <Select value={formData.roundPenSurface} onValueChange={(v) => updateField("roundPenSurface", v)}>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                          <SelectValue placeholder="Select surface..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ROUND_PEN_SURFACE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Permanent or Portable?</Label>
                      <Select value={formData.roundPenType} onValueChange={(v) => updateField("roundPenType", v)}>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ROUND_PEN_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Infrastructure / Renovations fields */}
              {(formData.interestedServices?.includes("infrastructure") || formData.interestedServices?.includes("renovations")) && (
                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-4">
                  <p className="text-sm font-medium text-accent">
                    {formData.interestedServices?.includes("infrastructure") ? "Site Details" : "Renovation Details"}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Property Acreage</Label>
                      <Input
                        value={formData.propertyAcreage || ""}
                        onChange={(e) => updateField("propertyAcreage", e.target.value)}
                        placeholder="e.g., 5 acres, 20 hectares"
                        maxLength={50}
                        className="h-12 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Existing Structures</Label>
                      <Input
                        value={formData.existingStructures || ""}
                        onChange={(e) => updateField("existingStructures", e.target.value)}
                        placeholder="e.g., Old barn, partial arena"
                        maxLength={500}
                        className="h-12 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Full Facility Design & Build fields */}
              {formData.interestedServices?.includes("full-facility") && (
                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-4">
                  <p className="text-sm font-medium text-accent">Facility Design Details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Total Property Acreage</Label>
                      <Input
                        value={formData.facilityTotalAcreage || ""}
                        onChange={(e) => updateField("facilityTotalAcreage", e.target.value)}
                        placeholder="e.g., 10 acres, 40 hectares"
                        maxLength={50}
                        className="h-12 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Desired Timeline</Label>
                      <Select value={formData.facilityTimeline} onValueChange={(v) => updateField("facilityTimeline", v)}>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                          <SelectValue placeholder="Select timeline..." />
                        </SelectTrigger>
                        <SelectContent>
                          {FACILITY_TIMELINE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base sm:text-sm">Components Needed</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FACILITY_COMPONENT_OPTIONS.map((comp) => {
                        const isChecked = formData.facilityComponents?.includes(comp.value);
                        return (
                          <button
                            key={comp.value}
                            type="button"
                            onClick={() => {
                              const current = formData.facilityComponents || [];
                              const updated = isChecked
                                ? current.filter((c) => c !== comp.value)
                                : [...current, comp.value];
                              updateField("facilityComponents", updated);
                            }}
                            className={cn(
                              "px-3 py-2 rounded-md border text-sm transition-all active:scale-[0.98]",
                              isChecked
                                ? "border-accent bg-accent/10 text-foreground"
                                : "border-border text-muted-foreground hover:border-accent/50"
                            )}
                          >
                            {isChecked && <Check className="w-3 h-3 inline mr-1" />}
                            {comp.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Clinics & Events fields */}
              {formData.interestedServices?.includes("clinics-events") && (
                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-4">
                  <p className="text-sm font-medium text-accent">Clinic & Event Details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Event Type</Label>
                      <Select value={formData.eventType} onValueChange={(v) => updateField("eventType", v)}>
                        <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                          <SelectValue placeholder="Select event type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base sm:text-sm">Expected Capacity</Label>
                      <Input
                        value={formData.eventCapacity || ""}
                        onChange={(e) => updateField("eventCapacity", e.target.value)}
                        placeholder="e.g., 50 riders, 200 spectators"
                        maxLength={50}
                        className="h-12 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base sm:text-sm">Event Frequency</Label>
                    <Select value={formData.eventFrequency} onValueChange={(v) => updateField("eventFrequency", v)}>
                      <SelectTrigger className="h-12 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="How often will events run?" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_FREQUENCY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base sm:text-sm">Required Amenities</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {EVENT_AMENITY_OPTIONS.map((amenity) => {
                        const isChecked = formData.eventAmenities?.includes(amenity.value);
                        return (
                          <button
                            key={amenity.value}
                            type="button"
                            onClick={() => {
                              const current = formData.eventAmenities || [];
                              const updated = isChecked
                                ? current.filter((a) => a !== amenity.value)
                                : [...current, amenity.value];
                              updateField("eventAmenities", updated);
                            }}
                            className={cn(
                              "px-3 py-2 rounded-md border text-sm transition-all active:scale-[0.98]",
                              isChecked
                                ? "border-accent bg-accent/10 text-foreground"
                                : "border-border text-muted-foreground hover:border-accent/50"
                            )}
                          >
                            {isChecked && <Check className="w-3 h-3 inline mr-1" />}
                            {amenity.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="goals" className="text-base sm:text-sm">Project Goals *</Label>
                <Textarea
                  id="goals"
                  value={formData.goals || ""}
                  onChange={(e) => updateField("goals", e.target.value)}
                  placeholder="Tell us about your vision... Are you building a training facility? Want to improve your current arena footing? Need better turnout space for your horses?"
                  rows={4}
                  maxLength={1000}
                  className={cn(
                    "text-base sm:text-sm min-h-[120px]",
                    errors.goals ? "border-destructive" : ""
                  )}
                />
                <div className="flex justify-between text-sm">
                  {errors.goals ? (
                    <p className="text-destructive">{errors.goals}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-muted-foreground">
                    {formData.goals?.length || 0}/1000
                  </span>
                </div>
              </div>

              {/* File upload zone */}
              <div className="space-y-2">
                <Label className="text-base sm:text-sm">Attachments (optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload site photos, sketches, inspiration images, or PDFs to help us understand your project.
                </p>
                <FileUploadZone files={attachments} onFilesChange={setAttachments} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Experience & Budget */}
        {currentStep === 4 && (
          <div className="animate-fade-in">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Your experience & budget
            </h3>
            <p className="text-muted-foreground mb-6">
              This helps us tailor our recommendations to your situation.
            </p>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base">Experience Level *</Label>
                <RadioGroup
                  value={formData.experienceLevel}
                  onValueChange={(value) => updateField("experienceLevel", value)}
                  className="grid sm:grid-cols-2 gap-3 sm:gap-4"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <Label
                      key={level.value}
                      htmlFor={level.value}
                      className={cn(
                        "flex items-start gap-3 p-5 sm:p-4 rounded-lg border cursor-pointer transition-all min-h-[80px] active:scale-[0.98]",
                        formData.experienceLevel === level.value
                          ? "border-accent bg-accent/5 shadow-sm"
                          : "border-border hover:border-accent/50 active:bg-muted/50"
                      )}
                    >
                      <RadioGroupItem value={level.value} id={level.value} className="mt-0.5 w-5 h-5 sm:w-4 sm:h-4" />
                      <div>
                        <p className="font-medium text-foreground text-base sm:text-sm">{level.label}</p>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
                {errors.experienceLevel && (
                  <p className="text-destructive text-sm">{errors.experienceLevel}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="budget" className="text-base">Budget Range *</Label>
                <Select
                  value={formData.budgetRange}
                  onValueChange={(value) => updateField("budgetRange", value)}
                >
                  <SelectTrigger className={cn(
                    "h-12 sm:h-10 text-base sm:text-sm",
                    errors.budgetRange ? "border-destructive" : ""
                  )}>
                    <SelectValue placeholder="Select a budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.budgetRange && (
                  <p className="text-destructive text-sm">{errors.budgetRange}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Contact Info */}
        {currentStep === 5 && (
          <div className="animate-fade-in">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              How can we reach you?
            </h3>
            <p className="text-muted-foreground mb-6">
              We'll use this information to follow up on your inquiry.
            </p>
            
            <div className="space-y-4 sm:space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base sm:text-sm">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                    className={cn(
                      "h-12 sm:h-10 text-base sm:text-sm",
                      errors.name ? "border-destructive" : ""
                    )}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base sm:text-sm">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="your@email.com"
                    maxLength={255}
                    className={cn(
                      "h-12 sm:h-10 text-base sm:text-sm",
                      errors.email ? "border-destructive" : ""
                    )}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email}</p>
                  )}
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base sm:text-sm">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                    maxLength={20}
                    className="h-12 sm:h-10 text-base sm:text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base sm:text-sm">Preferred Contact Date (optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 sm:h-10 justify-start text-left font-normal text-base sm:text-sm",
                          !formData.preferredDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5 sm:h-4 sm:w-4" />
                        {formData.preferredDate
                          ? format(formData.preferredDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.preferredDate}
                        onSelect={(date) => updateField("preferredDate", date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes (optional)</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes || ""}
                  onChange={(e) => updateField("additionalNotes", e.target.value)}
                  placeholder="Anything else you'd like us to know?"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review Summary */}
        {currentStep === 6 && (
          <div className="animate-fade-in">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Review Your Inquiry
            </h3>
            <p className="text-muted-foreground mb-6">
              Please confirm everything looks correct before submitting.
            </p>

            <div className="space-y-4">
              {/* Services */}
              <ReviewBlock
                label="Services"
                stepNum={1}
                onEdit={() => setCurrentStep(1)}
              >
                <div className="flex flex-wrap gap-2">
                  {(formData.interestedServices || []).map((id) => {
                    const svc = services.find((s) => s.id === id);
                    return svc ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                        <CheckCircle className="h-3 w-3" />
                        {svc.title}
                      </span>
                    ) : null;
                  })}
                </div>
              </ReviewBlock>

              {/* Horse Details */}
              {(formData.horseName || formData.horseBreed || formData.numberOfHorses) && (
                <ReviewBlock label="Horse Details" stepNum={2} onEdit={() => setCurrentStep(2)}>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {formData.horseName && <ReviewField label="Name" value={formData.horseName} />}
                    {formData.horseBreed && <ReviewField label="Breed" value={formData.horseBreed} />}
                    {formData.horseAge && <ReviewField label="Age" value={formData.horseAge} />}
                    {formData.numberOfHorses && <ReviewField label="No. of Horses" value={formData.numberOfHorses} />}
                  </div>
                </ReviewBlock>
              )}

              {/* Goals */}
              {formData.goals && (
                <ReviewBlock label="Project Goals" stepNum={3} onEdit={() => setCurrentStep(3)}>
                  <p className="text-sm text-foreground/80 line-clamp-3">{formData.goals}</p>
                </ReviewBlock>
              )}

              {/* Experience & Budget */}
              <ReviewBlock label="Experience & Budget" stepNum={4} onEdit={() => setCurrentStep(4)}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {formData.experienceLevel && <ReviewField label="Level" value={formData.experienceLevel} />}
                  {formData.budgetRange && <ReviewField label="Budget" value={formData.budgetRange} />}
                  
                </div>
              </ReviewBlock>

              {/* Contact */}
              <ReviewBlock label="Contact Info" stepNum={5} onEdit={() => setCurrentStep(5)}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {formData.name && <ReviewField label="Name" value={formData.name} />}
                  {formData.email && <ReviewField label="Email" value={formData.email} />}
                  {formData.phone && <ReviewField label="Phone" value={formData.phone} />}
                  {formData.preferredDate && <ReviewField label="Preferred Date" value={format(formData.preferredDate, "PPP")} />}
                </div>
              </ReviewBlock>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons - Touch-friendly with larger tap targets */}
      <div className="flex justify-between mt-8 pt-6 border-t border-border gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={cn(
            "h-12 sm:h-10 px-6 sm:px-4 text-base sm:text-sm min-w-[100px] active:scale-[0.98] transition-transform",
            currentStep === 1 ? "invisible" : ""
          )}
        >
          <ArrowLeft className="mr-2 h-5 w-5 sm:h-4 sm:w-4" />
          Back
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            type="button"
            onClick={nextStep}
            className="h-12 sm:h-10 px-6 sm:px-4 text-base sm:text-sm min-w-[120px] bg-accent hover:bg-accent/90 text-accent-foreground active:scale-[0.98] transition-transform"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 sm:h-10 px-6 sm:px-4 text-base sm:text-sm min-w-[140px] bg-accent hover:bg-accent/90 text-accent-foreground active:scale-[0.98] transition-transform"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Inquiry
                <Send className="ml-2 h-5 w-5 sm:h-4 sm:w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
