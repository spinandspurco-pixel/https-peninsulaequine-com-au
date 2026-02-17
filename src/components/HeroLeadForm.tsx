import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { services } from "@/data/content";

interface HeroLeadFormProps {
  className?: string;
}

export function HeroLeadForm({ className }: HeroLeadFormProps) {
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (name.length > 100 || email.length > 255 || message.length > 1000) {
      setErrorMsg("One or more fields exceed the maximum length.");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      services: form.service ? [form.service] : ["general"],
      notes: message,
    });

    if (error) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    } else {
      setStatus("success");
      // Trigger welcome series step 1 (fire-and-forget)
      supabase.functions.invoke("send-welcome-series", {
        body: { email, name, source: "hero-form" },
      }).catch(() => {});
    }
  };

  if (status === "success") {
    return (
      <div className={cn("flex flex-col items-center gap-3 py-4", className)}>
        <CheckCircle className="h-10 w-10 text-accent animate-scale-in" />
        <p className="text-hero-text font-medium text-lg">Thank you!</p>
        <p className="text-hero-text-muted text-sm text-center max-w-xs">
          We'll get back to you within 1–2 business days.
        </p>
      </div>
    );
  }

  const inputClasses =
    "w-full rounded-lg bg-hero-input-bg border border-hero-input-border px-3.5 py-2.5 text-sm text-hero-text placeholder:text-hero-input-placeholder focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent/40 transition-all";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full max-w-md mx-auto rounded-2xl bg-hero-glass backdrop-blur-md border border-hero-glass-border p-5 sm:p-6 space-y-3",
        className
      )}
    >
      <p className="text-hero-text text-sm font-medium text-center mb-1">
        Quick Inquiry — we'll respond within 1–2 days
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Your name *"
          maxLength={100}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClasses}
          aria-label="Your name"
          aria-required="true"
        />
        <input
          type="email"
          placeholder="Email address *"
          maxLength={255}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClasses}
          aria-label="Email address"
          aria-required="true"
        />
      </div>

      <select
        value={form.service}
        onChange={(e) => setForm({ ...form, service: e.target.value })}
        className={cn(inputClasses, "appearance-none")}
        aria-label="Select a service"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.5)' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
      >
        <option value="" className="bg-primary text-primary-foreground">Select a service (optional)</option>
        {services.map((s) => (
          <option key={s.id} value={s.id} className="bg-primary text-primary-foreground">
            {s.title}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Tell us about your project *"
        maxLength={1000}
        rows={2}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className={cn(inputClasses, "resize-none")}
        aria-label="Project details"
        aria-required="true"
      />

      {errorMsg && (
        <p className="text-destructive-foreground bg-destructive/80 text-xs text-center rounded px-2 py-1" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold",
          "bg-accent text-accent-foreground hover:bg-accent/90",
          "transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_16px_hsl(var(--accent)/0.4)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
          "disabled:opacity-60 disabled:pointer-events-none"
        )}
      >
        {status === "submitting" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {status === "submitting" ? "Sending…" : "Send Inquiry"}
      </button>
    </form>
  );
}
