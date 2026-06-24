import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type AllowlistRow = Database["public"]["Tables"]["staff_role_allowlist"]["Row"];

const ROLES: AppRole[] = ["admin", "moderator", "employee", "trainer", "preview", "user"];

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email")
  .max(255);

export default function HqStaffAllowlist() {
  const { toast } = useToast();
  const [rows, setRows] = useState<AllowlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("employee");
  const [newNotes, setNewNotes] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("staff_role_allowlist")
      .select("*")
      .order("email", { ascending: true });
    if (error) {
      toast({ title: "Could not load allowlist", description: error.message, variant: "destructive" });
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const runSeed = async () => {
    setBusy("seed");
    const { error } = await supabase.rpc("seed_staff_roles");
    setBusy(null);
    if (error) {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Roles synced", description: "user_roles backfilled from allowlist." });
    }
  };

  const addOrUpsert = async () => {
    const parsed = emailSchema.safeParse(newEmail);
    if (!parsed.success) {
      toast({ title: "Invalid email", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setBusy("add");
    const { error } = await supabase
      .from("staff_role_allowlist")
      .upsert(
        { email: parsed.data, role: newRole, notes: newNotes.trim() || null },
        { onConflict: "email" },
      );
    setBusy(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setNewEmail("");
    setNewNotes("");
    setNewRole("employee");
    await load();
    await supabase.rpc("seed_staff_roles");
    toast({ title: "Saved", description: `${parsed.data} → ${newRole}` });
  };

  const updateRole = async (email: string, role: AppRole) => {
    setBusy(email);
    const { error } = await supabase
      .from("staff_role_allowlist")
      .update({ role })
      .eq("email", email);
    setBusy(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    await load();
    await supabase.rpc("seed_staff_roles");
  };

  const removeRow = async (email: string) => {
    if (!confirm(`Remove ${email} from the allowlist? Their existing user_roles row is not touched.`)) return;
    setBusy(email);
    const { error } = await supabase.from("staff_role_allowlist").delete().eq("email", email);
    setBusy(null);
    if (error) {
      toast({ title: "Remove failed", description: error.message, variant: "destructive" });
      return;
    }
    await load();
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-foreground">
      <header className="mb-10">
        <p className="text-[0.6rem] uppercase tracking-[0.45em] text-muted-foreground">HQ · Access</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">Staff Allowlist</h1>
        <p className="mt-3 max-w-xl text-sm font-light text-muted-foreground/80">
          Source of truth for staff access. Adding an email here grants that role on first sign-in;
          a manual sync backfills any user already signed up.
        </p>
      </header>

      <section className="mb-10 border-t border-border/40 pt-6">
        <h2 className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">Add or update</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="name@peninsulaequine.systems"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            maxLength={255}
            className="sm:flex-1"
          />
          <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addOrUpsert} disabled={busy === "add"}>
            {busy === "add" ? "Saving…" : "Save"}
          </Button>
        </div>
        <Input
          placeholder="Notes (optional)"
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          maxLength={500}
          className="mt-3"
        />
      </section>

      <section className="border-t border-border/40 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Current allowlist {rows.length > 0 && <span className="ml-2 opacity-60">{rows.length}</span>}
          </h2>
          <button
            onClick={runSeed}
            disabled={busy === "seed"}
            className="text-xs uppercase tracking-[0.25em] text-muted-foreground/80 underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
          >
            {busy === "seed" ? "Syncing…" : "Sync user_roles"}
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rows yet.</p>
        ) : (
          <ul className="divide-y divide-border/40">
            {rows.map((row) => (
              <li key={row.email} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm">{row.email}</p>
                  {row.notes && <p className="mt-1 text-xs text-muted-foreground/70">{row.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-[0.65rem] uppercase tracking-wider">
                    {row.role}
                  </Badge>
                  <Select
                    value={row.role}
                    onValueChange={(v) => updateRole(row.email, v as AppRole)}
                    disabled={busy === row.email}
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => removeRow(row.email)}
                    disabled={busy === row.email}
                    className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-destructive disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
