import { useState, useRef } from "react";
import { Mail, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
});

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const cooldownRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (cooldownRef.current) {
      setErrorMsg("Please wait before trying again.");
      return;
    }

    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0].message);
      return;
    }

    setStatus("submitting");

    const { data, error } = await supabase.functions.invoke("subscribe-newsletter", {
      body: { email: parsed.data.email },
    });

    if (error) {
      setStatus("error");
      // Check for rate limit
      const body = typeof data === "object" && data ? data : {};
      const msg = body?.error || "Something went wrong. Please try again.";
      if (String(msg).toLowerCase().includes("wait") || String(msg).toLowerCase().includes("too many")) {
        setErrorMsg("Please wait a moment before trying again.");
      } else {
        setErrorMsg(msg);
      }
      return;
    }

    // 30-second client-side cooldown
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, 30_000);

    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle className="h-4 w-4 text-[hsl(var(--footer-hover))]" />
        <span className="text-[hsl(var(--footer-foreground))]">
          Check your inbox to confirm your subscription!
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-xs uppercase tracking-[0.15em] text-[hsl(var(--footer-muted))] font-medium">
        Stay in the Loop
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--footer-muted))]" />
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
            maxLength={255}
            aria-label="Email for newsletter"
            className={cn(
              "w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-[hsl(var(--footer-foreground))]/5 border border-[hsl(var(--footer-foreground))]/10",
              "text-[hsl(var(--footer-foreground))] placeholder:text-[hsl(var(--footer-muted))]",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--footer-hover))]/50 focus:border-[hsl(var(--footer-hover))]/30 transition-all"
            )}
          />
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
            "bg-[hsl(var(--footer-hover))] text-[hsl(var(--footer-bg))]",
            "hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-1.5"
          )}
        >
          {status === "submitting" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Subscribe
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
      {errorMsg && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
      <p className="text-[10px] text-[hsl(var(--footer-muted))]">
        We'll send a confirmation email. No spam, ever.
      </p>
    </form>
  );
}
