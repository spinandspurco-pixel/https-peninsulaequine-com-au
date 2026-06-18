import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  name: z.string().trim().max(120).optional().or(z.literal("")),
  property_context: z.string().trim().max(600).optional().or(z.literal("")),
});

type Props = {
  open: boolean;
  onClose: () => void;
};

export function LumenArcBriefingDialog({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "confirmed">("idle");
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => emailRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      // Reset after close animation
      const t = setTimeout(() => {
        setEmail("");
        setName("");
        setContext("");
        setError(null);
        setStatus("idle");
      }, 400);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, name, property_context: context });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the form");
      return;
    }
    setStatus("submitting");
    const { error: insertError } = await supabase
      .from("lumenarc_briefing_requests")
      .insert({
        email: parsed.data.email,
        name: parsed.data.name || null,
        property_context: parsed.data.property_context || null,
        source: "lumenarc_teaser",
      });
    if (insertError) {
      setStatus("idle");
      setError("Submission could not be completed. Please try again.");
      return;
    }
    setStatus("confirmed");
  };

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[120] transition-opacity duration-500 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
      />

      {/* Drafting grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lumenarc-briefing-title"
        className={`relative h-full w-full overflow-y-auto flex items-center justify-center px-6 py-16 transition-all duration-700 ${
          open ? "translate-y-0" : "translate-y-4"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.45, 0.15, 0.45, 1)" }}
      >
        <div className="relative w-full max-w-lg">
          {/* Thin gold rule top */}
          <div className="h-px w-12 bg-accent/60 mb-10" />

          <div className="flex items-center justify-between mb-8">
            <p className="font-mono uppercase text-accent/60 text-[0.6rem] tracking-[0.5em]">
              LumenArc · Advance Briefing
            </p>
            <button
              type="button"
              onClick={onClose}
              className="font-mono uppercase text-foreground/45 hover:text-foreground/85 transition-colors duration-500 text-[0.6rem] tracking-[0.4em]"
            >
              Close
            </button>
          </div>

          {status === "confirmed" ? (
            <div className="space-y-7">
              <h2
                id="lumenarc-briefing-title"
                className="font-serif text-foreground/92 leading-[1.05] tracking-[0.01em] text-[clamp(1.7rem,1.2rem+1.6vw,2.4rem)]"
              >
                Briefing reserved.
              </h2>
              <div className="h-px w-10 bg-accent/55" />
              <p className="font-sans font-light text-foreground/55 leading-[1.9] text-[0.88rem] max-w-md">
                Your request has been received. The next LumenArc dossier — covering specification, infrastructure
                requirements and release windows — will be issued to you directly ahead of public availability.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[0.64rem] tracking-[0.42em] pt-2"
              >
                <span className="h-px w-8 bg-accent/50 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-9" noValidate>
              <div className="space-y-4">
                <h2
                  id="lumenarc-briefing-title"
                  className="font-serif text-foreground/92 leading-[1.05] tracking-[0.01em] text-[clamp(1.7rem,1.2rem+1.6vw,2.4rem)]"
                >
                  Request the advance briefing.
                </h2>
                <p className="font-sans font-light text-foreground/52 leading-[1.85] text-[0.84rem] max-w-md">
                  A limited dossier issued to qualified property holders ahead of LumenArc release. Specification,
                  infrastructure and indicative timing.
                </p>
              </div>

              <div className="space-y-7">
                <Field label="Email" htmlFor="briefing-email" required>
                  <input
                    ref={emailRef}
                    id="briefing-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-border/30 focus:border-accent/70 focus:outline-none transition-colors duration-500 py-2 font-sans text-[0.95rem] text-foreground placeholder:text-foreground/25"
                    placeholder="you@domain.com"
                  />
                </Field>

                <Field label="Name" htmlFor="briefing-name">
                  <input
                    id="briefing-name"
                    type="text"
                    autoComplete="name"
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-border/30 focus:border-accent/70 focus:outline-none transition-colors duration-500 py-2 font-sans text-[0.95rem] text-foreground placeholder:text-foreground/25"
                    placeholder="Optional"
                  />
                </Field>

                <Field label="Property context" htmlFor="briefing-context">
                  <textarea
                    id="briefing-context"
                    rows={2}
                    maxLength={600}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full resize-none bg-transparent border-0 border-b border-border/30 focus:border-accent/70 focus:outline-none transition-colors duration-500 py-2 font-sans text-[0.95rem] text-foreground placeholder:text-foreground/25"
                    placeholder="Region, scale, intent — optional"
                  />
                </Field>
              </div>

              {error && (
                <p className="font-mono uppercase text-destructive/85 text-[0.6rem] tracking-[0.32em]">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/80 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-500 text-[0.64rem] tracking-[0.42em]"
                >
                  <span className="h-px w-8 bg-accent/55 transition-all duration-700 group-hover:w-14 group-hover:bg-accent" />
                  {status === "submitting" ? "Submitting" : "Submit Request"}
                </button>
                <p className="font-mono uppercase text-foreground/30 text-[0.55rem] tracking-[0.38em]">
                  Private · Held in confidence
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block font-mono uppercase text-foreground/45 text-[0.58rem] tracking-[0.45em]"
      >
        {label}
        {required && <span className="text-accent/70 ml-2">·</span>}
      </label>
      {children}
    </div>
  );
}
