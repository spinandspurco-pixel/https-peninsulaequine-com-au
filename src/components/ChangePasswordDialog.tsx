import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const schema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Use at least 8 characters." })
      .max(128, { message: "Keep it under 128 characters." }),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match.",
  });

type Trigger = "default" | "minimal";

interface Props {
  triggerLabel?: string;
  triggerVariant?: Trigger;
  triggerClassName?: string;
}

/**
 * Self-serve password change. Surfaces Supabase auth error messages directly,
 * including the leaked-password (HIBP) rejection returned as `weak_password`.
 */
export function ChangePasswordDialog({
  triggerLabel = "Change password",
  triggerVariant = "default",
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldError, setFieldError] = useState<{ password?: string; confirm?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setPassword("");
    setConfirm("");
    setFieldError({});
    setServerError(null);
    setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldError({});

    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      const next: { password?: string; confirm?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "password" | "confirm";
        if (!next[key]) next[key] = issue.message;
      }
      setFieldError(next);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setSubmitting(false);

    if (error) {
      // Supabase returns code `weak_password` when HIBP rejects a compromised
      // or weak password. Surface the exact server message so the user
      // understands why it was blocked.
      const code = (error as { code?: string }).code;
      if (code === "weak_password" || /pwned|leaked|compromis/i.test(error.message)) {
        setServerError(
          "This password has appeared in a known data breach and can't be used. Choose a different, unique password.",
        );
      } else if (code === "same_password") {
        setServerError("Your new password must be different from your current one.");
      } else {
        setServerError(error.message || "Could not update password. Please try again.");
      }
      return;
    }

    toast.success("Password updated");
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {triggerVariant === "minimal" ? (
          <button
            type="button"
            className={
              triggerClassName ??
              "text-[11px] font-mono uppercase tracking-[0.2em] text-accent/40 hover:text-accent/60 transition-colors duration-300 border-b border-accent/10 pb-0.5"
            }
          >
            {triggerLabel}
          </button>
        ) : (
          <Button variant="outline" size="sm" className={triggerClassName}>
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Choose a new password. Compromised passwords (found in known data breaches) are
            blocked automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cp-new">New password</Label>
            <Input
              id="cp-new"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldError.password}
              aria-describedby={fieldError.password ? "cp-new-err" : undefined}
              disabled={submitting}
              required
            />
            {fieldError.password && (
              <p id="cp-new-err" className="text-xs text-destructive">
                {fieldError.password}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cp-confirm">Confirm new password</Label>
            <Input
              id="cp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={!!fieldError.confirm}
              aria-describedby={fieldError.confirm ? "cp-confirm-err" : undefined}
              disabled={submitting}
              required
            />
            {fieldError.confirm && (
              <p id="cp-confirm-err" className="text-xs text-destructive">
                {fieldError.confirm}
              </p>
            )}
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent/70" />
            Minimum 8 characters. Passwords are checked against the Have I Been Pwned database.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePasswordDialog;
