import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, RefreshCw, ArrowUp, ArrowDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { CmsTabConfig } from "./types";

interface Props<TRow extends { id: string }, TInsert extends Record<string, unknown>> {
  config: CmsTabConfig<TRow, TInsert>;
}

/**
 * Config-driven CRUD surface for the HQ CMS.
 * Same UI/UX for every entity tab — only the config differs.
 *
 * Behaviour:
 *  - List sorted by config.listOrder (defaults to sort_order asc when present).
 *  - Create / edit / soft-archive (active toggle) / hard delete (confirm).
 *  - Move-up / move-down reordering when config.sortField is set.
 *  - Inline Zod validation. Loading / empty / error states.
 *  - Saves stamp updated_by/created_by = auth.uid().
 */
export function CmsCrudTab<TRow extends { id: string }, TInsert extends Record<string, unknown>>({
  config,
}: Props<TRow, TInsert>) {
  const { user } = useAuth();
  const [items, setItems] = useState<TRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<TRow> | null>(null);
  const [del, setDel] = useState<TRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const orderColumn = (config.listOrder?.column ?? config.sortField ?? "created_at") as string;
  const orderAsc = config.listOrder?.ascending ?? true;

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from(config.table as never)
      .select("*")
      .order(orderColumn, { ascending: orderAsc });
    if (error) {
      setLoadError(error.message);
      setItems([]);
    } else {
      setItems((data ?? []) as TRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table]);

  const openNew = () => {
    setErrors({});
    setEdit({
      ...(config.defaults as Partial<TRow>),
      [config.activeField]: true as never,
      ...(config.sortField ? ({ [config.sortField]: items.length } as Partial<TRow>) : {}),
    });
  };

  const onSave = async () => {
    if (!edit) return;
    const parsed = config.schema.safeParse(edit);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        next[String(i.path[0])] = i.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSaving(true);
    const basePayload = config.toPayload(edit);
    const stampedUpdate = { ...basePayload, updated_by: user?.id ?? null };
    const stampedInsert = { ...stampedUpdate, created_by: user?.id ?? null };

    const id = (edit as { id?: string }).id;
    if (id) {
      const { error } = await supabase
        .from(config.table as never)
        .update(stampedUpdate as never)
        .eq("id", id as never);
      if (error) toast.error(`Save failed: ${error.message}`);
      else toast.success(`${config.entityLabel} updated`);
    } else {
      const { error } = await supabase
        .from(config.table as never)
        .insert(stampedInsert as never);
      if (error) toast.error(`Create failed: ${error.message}`);
      else toast.success(`${config.entityLabel} created`);
    }
    setSaving(false);
    setEdit(null);
    void load();
  };

  const onToggleActive = async (row: TRow) => {
    const next = !(row[config.activeField] as unknown as boolean);
    const { error } = await supabase
      .from(config.table as never)
      .update({ [config.activeField]: next, updated_by: user?.id ?? null } as never)
      .eq("id", row.id as never);
    if (error) {
      toast.error(`Toggle failed: ${error.message}`);
      return;
    }
    toast.success(next ? "Activated" : "Archived");
    void load();
  };

  const onMove = async (row: TRow, dir: -1 | 1) => {
    if (!config.sortField) return;
    const idx = items.findIndex((i) => i.id === row.id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= items.length) return;
    const other = items[swapIdx];
    const a = row[config.sortField] as unknown as number;
    const b = other[config.sortField] as unknown as number;
    const updates = [
      supabase.from(config.table as never).update({ [config.sortField]: b } as never).eq("id", row.id as never),
      supabase.from(config.table as never).update({ [config.sortField]: a } as never).eq("id", other.id as never),
    ];
    const results = await Promise.all(updates);
    const err = results.find((r) => r.error)?.error;
    if (err) toast.error(`Reorder failed: ${err.message}`);
    void load();
  };

  const onDelete = async () => {
    if (!del) return;
    const { error } = await supabase
      .from(config.table as never)
      .delete()
      .eq("id", del.id as never);
    if (error) toast.error(`Delete failed: ${error.message}`);
    else toast.success(`${config.entityLabel} deleted`);
    setDel(null);
    void load();
  };

  const listFields = useMemo(() => config.fields.filter((f) => f.inList), [config.fields]);
  const formFields = useMemo(() => config.fields.filter((f) => f.inForm !== false), [config.fields]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
            {config.entityPlural}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading…" : `${items.length} item${items.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Button onClick={openNew} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1.5" /> New {config.entityLabel.toLowerCase()}
        </Button>
      </div>

      {loadError ? (
        <div className="rounded border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive flex items-start gap-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Couldn't load {config.entityPlural.toLowerCase()}.</p>
            <p className="text-xs font-mono text-destructive/70 mt-1 break-words">{loadError}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => void load()}>Retry</Button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/30 rounded">
          <p className="text-sm text-muted-foreground">No {config.entityPlural.toLowerCase()} yet.</p>
          <Button onClick={openNew} variant="ghost" size="sm" className="mt-3">
            <Plus className="h-4 w-4 mr-1.5" /> Create the first one
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border/10 border-y border-border/10">
          {items.map((row, i) => {
            const isActive = (row[config.activeField] as unknown as boolean) ?? true;
            const title = String(row[config.titleField] ?? "(untitled)");
            const subtitle = config.subtitleField ? String(row[config.subtitleField] ?? "") : "";
            return (
              <li key={row.id} className="py-3 flex items-center gap-3">
                {config.sortField ? (
                  <div className="flex flex-col -my-1">
                    <button
                      type="button"
                      aria-label="Move up"
                      onClick={() => void onMove(row, -1)}
                      disabled={i === 0}
                      className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20 p-0.5"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      onClick={() => void onMove(row, 1)}
                      disabled={i === items.length - 1}
                      className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20 p-0.5"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground truncate">{title}</span>
                    {!isActive && (
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">Archived</Badge>
                    )}
                    {listFields.map((f) => {
                      const v = row[f.key];
                      if (v == null || v === "") return null;
                      return (
                        <Badge key={f.key} variant="outline" className="text-[9px] uppercase tracking-wider">
                          {String(v).slice(0, 40)}
                        </Badge>
                      );
                    })}
                  </div>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => void onToggleActive(row)}
                    aria-label={isActive ? "Archive" : "Activate"}
                  />
                  <Button variant="ghost" size="sm" onClick={() => { setErrors({}); setEdit(row); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDel(row)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Create / edit dialog */}
      <Dialog open={!!edit} onOpenChange={(open) => { if (!open) { setEdit(null); setErrors({}); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {(edit as { id?: string } | null)?.id ? `Edit ${config.entityLabel}` : `New ${config.entityLabel}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {formFields.map((f) => {
              const raw = edit ? (edit as Record<string, unknown>)[f.key] : undefined;
              const err = errors[f.key];
              const setVal = (v: unknown) => setEdit({ ...(edit ?? {}), [f.key]: v } as Partial<TRow>);
              return (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    {f.label}{f.required ? " *" : ""}
                  </Label>
                  {f.type === "textarea" ? (
                    <Textarea value={(raw as string) ?? ""} onChange={(e) => setVal(e.target.value)} rows={4} placeholder={f.placeholder} />
                  ) : f.type === "switch" ? (
                    <div className="flex items-center gap-3">
                      <Switch checked={!!raw} onCheckedChange={(v) => setVal(v)} />
                      <span className="text-sm text-muted-foreground">{f.help ?? ""}</span>
                    </div>
                  ) : f.type === "number" ? (
                    <Input type="number" value={(raw as number | undefined) ?? ""} onChange={(e) => setVal(e.target.value === "" ? null : Number(e.target.value))} placeholder={f.placeholder} />
                  ) : f.type === "date" ? (
                    <Input type="date" value={(raw as string) ?? ""} onChange={(e) => setVal(e.target.value || null)} />
                  ) : f.type === "lines" ? (
                    <Textarea
                      value={Array.isArray(raw) ? (raw as string[]).join("\n") : ""}
                      onChange={(e) => setVal(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                      rows={4}
                      placeholder={f.placeholder ?? "One per line"}
                    />
                  ) : (
                    <Input
                      type={f.type === "url" ? "url" : "text"}
                      value={(raw as string) ?? ""}
                      onChange={(e) => setVal(e.target.value)}
                      placeholder={f.placeholder}
                    />
                  )}
                  {f.help && f.type !== "switch" && (
                    <p className="text-[10px] text-muted-foreground/60">{f.help}</p>
                  )}
                  {err && <p className="text-xs text-destructive">{err}</p>}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setEdit(null); setErrors({}); }}>Cancel</Button>
            <Button onClick={() => void onSave()} disabled={saving}>
              {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {(edit as { id?: string } | null)?.id ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hard-delete confirm */}
      <AlertDialog open={!!del} onOpenChange={(open) => { if (!open) setDel(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{del ? String(del[config.titleField] ?? "(untitled)") : ""}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the {config.entityLabel.toLowerCase()}. To hide it from the site
              without deleting, use the active toggle instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onDelete()} className="bg-destructive text-destructive-foreground">
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
