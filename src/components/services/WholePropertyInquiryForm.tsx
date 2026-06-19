import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  preferred_start: z.string().trim().max(120).optional().or(z.literal("")),
});

export function WholePropertyInquiryForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      preferred_start: fd.get("preferred_start"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      preferred_start: parsed.data.preferred_start || null,
      services: ["whole-property-planning"],
      preferred_service: "whole-property-planning",
      project_vision: "Whole-Property Planning enquiry (Services band)",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send. Please try again or email us directly.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p className="mt-10 max-w-2xl font-mono text-[11px] uppercase tracking-[0.32em] text-accent/70">
        Received. We'll be in touch shortly.
      </p>
    );
  }

  const fieldClass =
    "w-full bg-transparent border-0 border-b border-accent/20 focus:border-accent/60 focus:outline-none py-3 text-foreground/85 placeholder:text-foreground/30 font-sans font-light text-[14px] transition-colors";

  return (
    <form onSubmit={onSubmit} className="mt-12 max-w-2xl grid gap-6 sm:grid-cols-2" noValidate>
      <label className="block sm:col-span-1">
        <span className="font-mono uppercase text-[9px] tracking-[0.42em] text-foreground/40">Name</span>
        <input name="name" required maxLength={120} autoComplete="name" className={fieldClass} />
      </label>
      <label className="block sm:col-span-1">
        <span className="font-mono uppercase text-[9px] tracking-[0.42em] text-foreground/40">Email</span>
        <input type="email" name="email" required maxLength={255} autoComplete="email" className={fieldClass} />
      </label>
      <label className="block sm:col-span-1">
        <span className="font-mono uppercase text-[9px] tracking-[0.42em] text-foreground/40">Phone</span>
        <input type="tel" name="phone" maxLength={40} autoComplete="tel" className={fieldClass} />
      </label>
      <label className="block sm:col-span-1">
        <span className="font-mono uppercase text-[9px] tracking-[0.42em] text-foreground/40">Preferred dates</span>
        <input
          name="preferred_start"
          maxLength={120}
          placeholder="e.g. autumn 2026"
          className={fieldClass}
        />
      </label>
      <div className="sm:col-span-2 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[10px] tracking-[0.42em] disabled:opacity-40"
        >
          <span className="w-8 h-px bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
          {submitting ? "Sending…" : "Request a planning conversation"}
        </button>
      </div>
    </form>
  );
}
