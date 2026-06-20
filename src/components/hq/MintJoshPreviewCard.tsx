import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Eye, Copy, KeyRound, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

interface MintResult {
  already_exists: boolean;
  email: string;
  user_id: string;
  temp_password?: string;
  message?: string;
}

const TARGET_EMAIL = "josh.dales@peninsulaequine.org";

export function MintJoshPreviewCard() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MintResult | null>(null);
  const [revealed, setRevealed] = useState(false);

  const loginUrl =
    typeof window !== "undefined" ? `${window.location.origin}/login` : "/login";

  const handleMint = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mint-josh-preview", {
        body: {},
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Mint failed");
      setResult({
        already_exists: !!data.already_exists,
        email: data.email,
        user_id: data.user_id,
        temp_password: data.temp_password,
        message: data.message,
      });
      setRevealed(false);
      if (data.already_exists) {
        toast.info("Josh Dales preview account already exists.");
      } else {
        toast.success("Preview account created. Copy the password — it won't be shown again.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Mint failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(
      () => toast.success(`${label} copied`),
      () => toast.error("Copy failed"),
    );
  };

  return (
    <>
      <Card className="border-accent/40">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-accent" />
            Mint Josh Dales Preview Account
          </CardTitle>
          <CardDescription>
            Admin-only. Creates <span className="font-mono">{TARGET_EMAIL}</span> with Client
            Preview role and a one-time temporary password. Write access is blocked by the
            preview-mode trigger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && (
            <Button onClick={() => setConfirmOpen(true)} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4 mr-2" />
              )}
              {loading ? "Working…" : "Mint Preview Account"}
            </Button>
          )}

          {result?.already_exists && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-200">
                Josh Dales preview account already exists.
              </p>
              <p className="text-muted-foreground mt-1">
                No duplicate was created. If a new password is needed, use Supabase auth password
                reset rather than re-minting.
              </p>
              <dl className="mt-3 space-y-1 text-xs font-mono">
                <div>email: {result.email}</div>
                <div>user_id: {result.user_id}</div>
              </dl>
            </div>
          )}

          {result && !result.already_exists && result.temp_password && (
            <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Account created. Shown <em>once</em>.
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <Row
                  label="Login URL"
                  value={loginUrl}
                  onCopy={() => copy(loginUrl, "Login URL")}
                />
                <Row
                  label="Email"
                  value={result.email}
                  onCopy={() => copy(result.email, "Email")}
                />
                <Row
                  label="Temporary password"
                  value={revealed ? result.temp_password : "•".repeat(result.temp_password.length)}
                  onCopy={() => copy(result.temp_password!, "Password")}
                  trailing={
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRevealed((r) => !r)}
                      className="h-7 px-2"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      {revealed ? "Hide" : "Reveal"}
                    </Button>
                  }
                  mono
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="border-accent/40">
                  Role: preview only
                </Badge>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">
                  Write access blocked
                </Badge>
                <Badge variant="outline">No admin / employee / trainer / moderator</Badge>
              </div>

              <p className="text-xs text-muted-foreground">
                Password is not stored anywhere and will not be shown again. Copy it now and share
                it with Josh via a secure channel (not email).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mint preview account for Josh Dales?</AlertDialogTitle>
            <AlertDialogDescription>
              Creates an auth user for <span className="font-mono">{TARGET_EMAIL}</span> with the{" "}
              <strong>Client Preview</strong> role only. No admin/employee/trainer/moderator role
              will be granted. A strong temporary password will be generated and shown once.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMint}>Mint Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Row({
  label,
  value,
  onCopy,
  trailing,
  mono,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  trailing?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
      <div className="text-xs uppercase tracking-wider text-muted-foreground w-32 shrink-0">
        {label}
      </div>
      <div className={`flex-1 truncate text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
      {trailing}
      <Button size="sm" variant="ghost" onClick={onCopy} className="h-7 px-2">
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
