import { useState } from "react";
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

// Form validation schema
const inquirySchema = z.object({
  // Step 1: Services
  interestedServices: z.array(z.string()).min(1, "Please select at least one service"),
  
  // Step 2: Horse Details
  horseName: z.string().max(100).optional(),
  horseAge: z.string().max(50).optional(),
  horseBreed: z.string().max(100).optional(),
  numberOfHorses: z.string().max(20).optional(),
  
  // Step 3: Goals
  goals: z.string().max(1000, "Please keep your goals under 1000 characters"),
  
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

function StepIndicator({ currentStep }: { currentStep: number }) {
  const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-8">
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
          <span className="text-xs text-accent font-medium">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
      </div>

      {/* Step Circles */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  currentStep > step.id
                    ? "bg-accent text-accent-foreground scale-100"
                    : currentStep === step.id
                    ? "bg-accent text-accent-foreground ring-4 ring-accent/20 scale-110"
                    : "bg-muted text-muted-foreground scale-100"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5 animate-scale-in" />
                ) : (
                  step.id
                )}
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
              <div className="relative h-0.5 w-8 sm:w-16 lg:w-24 mx-2 bg-muted overflow-hidden rounded-full">
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
    </div>
  );
}

export function InquiryForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<InquiryFormData>>({
    interestedServices: [],
    horseName: "",
    horseAge: "",
    horseBreed: "",
    numberOfHorses: "",
    goals: "",
    experienceLevel: "",
    budgetRange: "",
    name: "",
    email: "",
    phone: "",
    preferredDate: undefined,
    additionalNotes: "",
  });

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

  const nextStep = () => {
    if (validateStep() && currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
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
        project_details: formData.additionalNotes?.trim() || null,
        experience_level: formData.experienceLevel || null,
        budget_range: formData.budgetRange || null,
        preferred_start: formData.preferredDate 
          ? format(formData.preferredDate, "yyyy-MM-dd") 
          : null,
      });

      if (error) throw error;

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
              experienceLevel: "",
              budgetRange: "",
              name: "",
              email: "",
              phone: "",
              preferredDate: undefined,
              additionalNotes: "",
            });
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

      <div className="min-h-[400px]">
        {/* Step 1: Services */}
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              What services are you interested in?
            </h3>
            <p className="text-muted-foreground mb-6">
              Select all that apply to your project.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((service) => {
                const isSelected = formData.interestedServices?.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5",
                          isSelected
                            ? "bg-accent border-accent text-accent-foreground"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{service.title}</p>
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
                  <Label htmlFor="horseName">Horse Name(s)</Label>
                  <Input
                    id="horseName"
                    value={formData.horseName || ""}
                    onChange={(e) => updateField("horseName", e.target.value)}
                    placeholder="e.g., Star, Bella"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfHorses">Number of Horses</Label>
                  <Input
                    id="numberOfHorses"
                    value={formData.numberOfHorses || ""}
                    onChange={(e) => updateField("numberOfHorses", e.target.value)}
                    placeholder="e.g., 3"
                    maxLength={20}
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horseAge">Age(s)</Label>
                  <Input
                    id="horseAge"
                    value={formData.horseAge || ""}
                    onChange={(e) => updateField("horseAge", e.target.value)}
                    placeholder="e.g., 8 years, 12 years"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horseBreed">Breed(s)</Label>
                  <Input
                    id="horseBreed"
                    value={formData.horseBreed || ""}
                    onChange={(e) => updateField("horseBreed", e.target.value)}
                    placeholder="e.g., Quarter Horse, Warmblood"
                    maxLength={100}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {currentStep === 3 && (
          <div className="animate-fade-in">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              What are your goals for this project?
            </h3>
            <p className="text-muted-foreground mb-6">
              Describe what you hope to achieve with your new facility.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="goals">Project Goals *</Label>
              <Textarea
                id="goals"
                value={formData.goals || ""}
                onChange={(e) => updateField("goals", e.target.value)}
                placeholder="Tell us about your vision... Are you building a training facility? Want to improve your current arena footing? Need better turnout space for your horses?"
                rows={6}
                maxLength={1000}
                className={errors.goals ? "border-destructive" : ""}
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
                  className="grid sm:grid-cols-2 gap-3"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <Label
                      key={level.value}
                      htmlFor={level.value}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                        formData.experienceLevel === level.value
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <RadioGroupItem value={level.value} id={level.value} className="mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{level.label}</p>
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
                  <SelectTrigger className={errors.budgetRange ? "border-destructive" : ""}>
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
            
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="your@email.com"
                    maxLength={255}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email}</p>
                  )}
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Contact Date (optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.preferredDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
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
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={currentStep === 1 ? "invisible" : ""}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            type="button"
            onClick={nextStep}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Inquiry
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
