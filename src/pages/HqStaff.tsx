import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { formatDistanceToNowStrict } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { BlueprintField, BronzeRule, StatusLamp } from "@/components/hq/HqPrimitives";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface DirectoryRow {
  user_id: string;
  role: AppRole;
  created_at: string;
  email: string | null;
  display_name: string | null;
  title: string | null;
  phone: string | null;
  timezone: string | null;
  avatar_url: string | null;
  bio: string | null;
  active: boolean;
  last_active: string | null;
  is_test_account: boolean;
}

const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrator",
  moderator: "Moderator",
  employee: "Operations",
  trainer: "Trainer",
  preview: "Client Preview",
  user: "Member",
};

const AVATAR_BUCKET = "staff-avatars";

const profileSchema = z.object({
  display_name: z.string().trim().max(120).optional().or(z.literal("")),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  timezone: z.string().trim().max(80).optional().or(z.literal("")),
  bio: z.string().trim().max(600).optional().or(z.literal("")),
  active: z.boolean(),
});

function initialsFrom(name: string | null | undefined, email: string | null | undefined) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "";
  const parts = source.replace(/[._-]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PE";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatLastActive(value: string | null) {
  if (!value) return "Never signed in";
  try {
    return `Active ${formatDistanceToNowStrict(new Date(value), { addSuffix: true })}`;
  } catch {
    return "Recently active";
  }
}

async function resolveAvatarUrl(rawUrl: string | null): Promise<string | null> {
  if (!rawUrl) return null;
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
  // treat as bucket path
  const { data } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(rawUrl, 60 * 60);
  return data?.signedUrl ?? null;
}

export default function HqStaff() {
  const { user, isAdmin, isPreview } = useAuth();
  const { toast } = useToast();

  const [rows, setRows] = useState<DirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedAvatars, setSignedAvatars] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<DirectoryRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("list_staff_directory");
    if (error) {
      toast({ title: "Could not load directory", description: error.message, variant: "destructive" });
      setRows([]);
    } else {
      setRows((data ?? []) as DirectoryRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Resolve signed URLs for bucket-stored avatars
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Record<string, string> = {};
      await Promise.all(
        rows.map(async (r) => {
          if (!r.avatar_url) return;
          const url = await resolveAvatarUrl(r.avatar_url);
          if (url) next[r.user_id] = url;
        }),
      );
      if (!cancelled) setSignedAvatars(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [rows]);

  const visible = useMemo(
    () => rows.filter((r) => isAdmin || r.active),
    [rows, isAdmin],
  );

  const canEdit = (row: DirectoryRow) =>
    !isPreview && (isAdmin || (user?.id && row.user_id === user.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HqBreadcrumbs current="Staff" />
      <BlueprintField intensity="soft" className="border-b border-border/40">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.45em] text-accent/60">
            HQ · Identity
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            Staff Directory
          </h1>
          <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-muted-foreground/75">
            The people behind every build. Roles, contact, and presence — the
            spine of every other surface inside the Command Centre.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <StatusLamp state={loading ? "verify" : "nominal"} />
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/70">
              {loading ? "Loading directory…" : `${visible.length} on roster`}
            </span>
          </div>
        </div>
      </BlueprintField>

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <BronzeRule label="Roster" className="mb-10" />

        {loading ? (
          <p className="text-sm text-muted-foreground/70">Reading the wire…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground/70">No staff profiles to display.</p>
        ) : (
          <ul className="grid gap-px bg-border/30 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((row) => {
              const avatar = signedAvatars[row.user_id];
              const name = row.display_name?.trim() || row.email?.split("@")[0] || "Unnamed";
              const title = row.title?.trim() || ROLE_LABEL[row.role];
              return (
                <li
                  key={row.user_id}
                  className="group relative flex flex-col gap-5 bg-background p-6 transition-colors hover:bg-accent/[0.03]"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-border/60">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={`${name} portrait`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted/30 font-serif text-base tracking-wide text-muted-foreground/80">
                          {initialsFrom(row.display_name, row.email)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-accent/60">
                        {ROLE_LABEL[row.role]}
                      </p>
                      <h2 className="mt-1 truncate font-serif text-xl leading-tight">{name}</h2>
                      <p className="mt-1 truncate text-xs font-light text-muted-foreground/70">
                        {title}
                      </p>
                    </div>
                    {!row.active && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50">
                        Dormant
                      </span>
                    )}
                  </div>

                  {row.bio && (
                    <p className="line-clamp-3 text-xs font-light leading-relaxed text-muted-foreground/65">
                      {row.bio}
                    </p>
                  )}

                  <dl className="grid gap-1.5 text-xs font-light text-muted-foreground/70">
                    {row.email && (
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/45">
                          Email
                        </dt>
                        <dd className="truncate text-foreground/80">{row.email}</dd>
                      </div>
                    )}
                    {row.phone && (
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/45">
                          Phone
                        </dt>
                        <dd className="truncate text-foreground/80">{row.phone}</dd>
                      </div>
                    )}
                    {row.timezone && (
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/45">
                          Zone
                        </dt>
                        <dd className="truncate text-foreground/80">{row.timezone}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-auto flex items-center justify-between border-t border-border/30 pt-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/55">
                      {formatLastActive(row.last_active)}
                    </span>
                    {canEdit(row) && (
                      <button
                        onClick={() => setEditing(row)}
                        className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {editing && (
        <EditProfileSheet
          row={editing}
          isAdmin={isAdmin}
          existingAvatarUrl={signedAvatars[editing.user_id] ?? null}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Edit drawer
// ─────────────────────────────────────────────────────

function EditProfileSheet({
  row,
  isAdmin,
  existingAvatarUrl,
  onClose,
  onSaved,
}: {
  row: DirectoryRow;
  isAdmin: boolean;
  existingAvatarUrl: string | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    display_name: row.display_name ?? "",
    title: row.title ?? "",
    phone: row.phone ?? "",
    timezone: row.timezone ?? "Australia/Melbourne",
    bio: row.bio ?? "",
    active: row.active,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(existingAvatarUrl);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickFile = (file: File | null) => {
    if (!file) return;
    if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) {
      toast({ title: "Unsupported file", description: "Use JPG, PNG, or WebP.", variant: "destructive" });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 4 MB.", variant: "destructive" });
      return;
    }
    setAvatarFile(file);
    setRemoveAvatar(false);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const save = async () => {
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Check the form", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSaving(true);

    let avatar_url: string | null | undefined = undefined; // undefined = don't change
    let avatar_path: string | null | undefined = undefined;

    try {
      if (isAdmin && avatarFile) {
        const ext = (avatarFile.name.split(".").pop() ?? "jpg").toLowerCase();
        const path = `${row.user_id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
        if (upErr) throw upErr;
        avatar_url = path; // store the bucket path; signed URL is resolved on read
        avatar_path = path;
      } else if (isAdmin && removeAvatar) {
        avatar_url = null;
        avatar_path = null;
      }

      const payload: Record<string, unknown> = {
        user_id: row.user_id,
        display_name: parsed.data.display_name || null,
        title: parsed.data.title || null,
        phone: parsed.data.phone || null,
        timezone: parsed.data.timezone || null,
        bio: parsed.data.bio || null,
      };
      // active flag is admin-only
      if (isAdmin) payload.active = parsed.data.active;
      if (avatar_url !== undefined) payload.avatar_url = avatar_url;
      if (avatar_path !== undefined) payload.avatar_path = avatar_path;

      const { error } = await supabase
        .from("staff_profiles")
        .upsert(payload as never, { onConflict: "user_id" });
      if (error) throw error;

      toast({ title: "Profile saved" });
      await onSaved();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">Edit profile</SheetTitle>
          <SheetDescription className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
            {row.email}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <section className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
              Portrait
            </Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden border border-border/60">
                {avatarPreview && !removeAvatar ? (
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/30 font-serif text-muted-foreground/80">
                    {initialsFrom(form.display_name || row.display_name, row.email)}
                  </div>
                )}
              </div>
              {isAdmin ? (
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    {avatarPreview ? "Replace" : "Upload"}
                  </Button>
                  {existingAvatarUrl && !removeAvatar && (
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveAvatar(true);
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 hover:text-destructive"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/60">
                  Avatar uploads are admin-managed.
                </p>
              )}
            </div>
          </section>

          <div className="grid gap-4">
            <Field label="Display name">
              <Input
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                maxLength={120}
                placeholder="Jordynn Oakley"
              />
            </Field>
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={120}
                placeholder="Operations & Creative Director"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                maxLength={40}
                placeholder="+61 …"
              />
            </Field>
            <Field label="Timezone">
              <Input
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                maxLength={80}
                placeholder="Australia/Melbourne"
              />
            </Field>
            <Field label="Bio">
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                maxLength={600}
                rows={4}
                placeholder="One quiet line about this person's role on the team."
              />
            </Field>

            {isAdmin && (
              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <div>
                  <p className="text-sm">Active</p>
                  <p className="text-xs text-muted-foreground/70">
                    Inactive profiles are hidden from non-admin views.
                  </p>
                </div>
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
        {label}
      </Label>
      {children}
    </div>
  );
}
