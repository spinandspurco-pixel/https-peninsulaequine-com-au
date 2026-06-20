import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw, ArrowLeft, Star, Pin, ArrowUp, ArrowDown, Download, FileText } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { PreviewNotice } from "@/components/hq/PreviewNotice";

/* ── Export helpers ─────────────────────────────────────────── */

function exportCSV(items: ManagedTestimonial[]) {
  const headers = ["Name", "Role", "Quote", "Rating", "Media Type", "Media URL", "Active", "Pinned", "Service Tags", "Trainer"];
  const rows = items.map((t) => [
    t.client_name,
    t.client_role ?? "",
    `"${t.quote.replace(/"/g, '""')}"`,
    String(t.rating),
    t.media_type ?? "",
    t.media_url ?? "",
    t.active ? "Yes" : "No",
    t.pinned ? "Yes" : "No",
    (t.service_tags ?? []).join("; "),
    t.trainer ?? "",
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pe-testimonials-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV downloaded");
}

function exportPDF(items: ManagedTestimonial[]) {
  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);
  const avgRating = items.length
    ? (items.reduce((s, t) => s + t.rating, 0) / items.length).toFixed(1)
    : "—";
  const videoCount = items.filter((t) => t.media_type === "video").length;

  const html = `
    <html><head><title>Peninsula Equine — Testimonials Report</title>
    <style>
      body{font-family:Georgia,serif;max-width:800px;margin:40px auto;color:#1a1a1a;padding:0 20px}
      h1{font-size:24px;border-bottom:2px solid #c5a55a;padding-bottom:8px;margin-bottom:4px}
      .meta{color:#666;font-size:13px;margin-bottom:28px}
      .stats{display:flex;gap:24px;margin-bottom:28px;padding:12px 16px;background:#f7f5f0;border-radius:8px;font-size:14px}
      .stats b{color:#c5a55a}
      .card{border:1px solid #e0dcd4;border-radius:8px;padding:16px 20px;margin-bottom:16px;page-break-inside:avoid}
      .card h3{margin:0 0 2px;font-size:16px}
      .card .role{color:#888;font-size:12px}
      .card .stars{color:#c5a55a;letter-spacing:2px;margin:6px 0}
      .card blockquote{margin:8px 0 0;font-style:italic;line-height:1.5;color:#333}
      .tags{margin-top:8px;font-size:11px;color:#888}
      @media print{body{margin:20px}}
    </style></head><body>
    <h1>Peninsula Equine — Testimonials Report</h1>
    <p class="meta">Generated ${new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })} · ${items.length} testimonials</p>
    <div class="stats">
      <span><b>${avgRating}</b> avg rating</span>
      <span><b>${items.length}</b> reviews</span>
      <span><b>${videoCount}</b> video testimonials</span>
    </div>
    ${items.map((t) => `
      <div class="card">
        <h3>${t.client_name}</h3>
        ${t.client_role ? `<p class="role">${t.client_role}</p>` : ""}
        <div class="stars">${stars(t.rating)}</div>
        <blockquote>"${t.quote}"</blockquote>
        ${(t.service_tags?.length || t.trainer) ? `<p class="tags">${t.trainer ? `Trainer: ${t.trainer}` : ""}${t.trainer && t.service_tags?.length ? " · " : ""}${(t.service_tags ?? []).join(", ")}</p>` : ""}
      </div>
    `).join("")}
    </body></html>`;

  const w = window.open("", "_blank");
  if (!w) { toast.error("Popup blocked — please allow popups"); return; }
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 400);
  toast.success("PDF report opened for printing");
}

type ManagedTestimonial = Tables<"managed_testimonials">;

export default function AdminTestimonials() {
  const { user, isAdmin, loading } = useAuth();
  const { isPreview } = useHqMode();
  const canAccess = isAdmin || isPreview;
  const navigate = useNavigate();
  const [items, setItems] = useState<ManagedTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editItem, setEditItem] = useState<Partial<ManagedTestimonial> | null>(null);
  const [deleteItem, setDeleteItem] = useState<ManagedTestimonial | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !canAccess)) navigate("/login");
  }, [user, canAccess, loading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("managed_testimonials").select("*").order("pinned", { ascending: false }).order("sort_order");
    setItems(data || []);
    setIsLoading(false);
  };

  const togglePin = async (item: ManagedTestimonial) => {
    if (isPreview) { toast.error("View-only in client preview"); return; }
    await supabase.from("managed_testimonials").update({ pinned: !(item as any).pinned }).eq("id", item.id);
    fetchData();
  };

  const moveItem = async (item: ManagedTestimonial, direction: "up" | "down") => {
    if (isPreview) { toast.error("View-only in client preview"); return; }
    const idx = items.findIndex((i) => i.id === item.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const other = items[swapIdx];
    await Promise.all([
      supabase.from("managed_testimonials").update({ sort_order: other.sort_order }).eq("id", item.id),
      supabase.from("managed_testimonials").update({ sort_order: item.sort_order }).eq("id", other.id),
    ]);
    fetchData();
  };

  useEffect(() => { if (canAccess) fetchData(); }, [canAccess]);

  const handleSave = async () => {
    if (isPreview) { toast.error("View-only in client preview"); return; }
    if (!editItem?.client_name?.trim() || !editItem?.quote?.trim()) {
      toast.error("Name and quote are required");
      return;
    }
    setSaving(true);
    const payload = {
      client_name: editItem.client_name.trim(),
      client_role: editItem.client_role || null,
      quote: editItem.quote.trim(),
      rating: editItem.rating ?? 5,
      media_type: editItem.media_type || null,
      media_url: editItem.media_url || null,
      sort_order: editItem.sort_order ?? 0,
      active: editItem.active ?? true,
    };

    if (editItem.id) {
      const { error } = await supabase.from("managed_testimonials").update(payload).eq("id", editItem.id);
      if (error) toast.error("Failed to update"); else toast.success("Updated");
    } else {
      const { error } = await supabase.from("managed_testimonials").insert(payload);
      if (error) toast.error("Failed to create"); else toast.success("Created");
    }
    setSaving(false);
    setEditItem(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (isPreview) { toast.error("View-only in client preview"); return; }
    if (!deleteItem) return;
    await supabase.from("managed_testimonials").delete().eq("id", deleteItem.id);
    toast.success("Deleted");
    setDeleteItem(null);
    fetchData();
  };

  if (loading || !canAccess) return null;

  return (
    <Layout>
      <div className="section-padding">
        <div className="section-container max-w-5xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => navigate(isPreview ? "/hq?view=preview" : "/hq")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold text-foreground">Manage Testimonials</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {items.length} testimonials{isPreview && " · view-only preview"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportCSV(items)} disabled={items.length === 0}>
                <Download className="h-4 w-4 mr-1" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportPDF(items)} disabled={items.length === 0}>
                <FileText className="h-4 w-4 mr-1" /> PDF
              </Button>
              <Button onClick={() => setEditItem({ active: true, rating: 5, sort_order: items.length })} disabled={isPreview} title={isPreview ? "View-only" : undefined}>
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>
          <PreviewNotice />

          {isLoading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No testimonials yet.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {items.map((t, idx) => (
                <Card key={t.id} className={`group ${(t as any).pinned ? "ring-1 ring-accent/30 bg-accent/5" : ""}`}>
                  <CardContent className="flex items-start gap-4 py-4">
                    {/* Reorder arrows */}
                    <div className="flex flex-col gap-0.5 shrink-0 pt-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0 || isPreview} onClick={() => moveItem(t, "up")}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === items.length - 1 || isPreview} onClick={() => moveItem(t, "down")}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{t.client_name}</h3>
                        {t.client_role && <span className="text-xs text-muted-foreground">· {t.client_role}</span>}
                        {!t.active && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                        {(t as any).pinned && <Badge className="text-[10px] bg-accent text-accent-foreground">Pinned</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 italic">"{t.quote}"</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">Order: {t.sort_order}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(t)}
                        disabled={isPreview}
                        title={isPreview ? "View-only" : ((t as any).pinned ? "Unpin" : "Pin to top")}
                        className={(t as any).pinned ? "text-accent" : ""}
                      >
                        <Pin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditItem(t)} disabled={isPreview} title={isPreview ? "View-only" : undefined}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteItem(t)} disabled={isPreview} title={isPreview ? "View-only" : undefined}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? "Edit Testimonial" : "New Testimonial"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Client Name *</Label><Input value={editItem?.client_name || ""} onChange={(e) => setEditItem({ ...editItem, client_name: e.target.value })} /></div>
            <div><Label>Role / Title</Label><Input value={editItem?.client_role || ""} onChange={(e) => setEditItem({ ...editItem, client_role: e.target.value })} placeholder="Ranch Owner, Woodside" /></div>
            <div><Label>Quote *</Label><Textarea value={editItem?.quote || ""} onChange={(e) => setEditItem({ ...editItem, quote: e.target.value })} rows={4} /></div>
            <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={editItem?.rating ?? 5} onChange={(e) => setEditItem({ ...editItem, rating: Math.min(5, Math.max(1, parseInt(e.target.value) || 5)) })} /></div>
            <div><Label>Media Type</Label><Input value={editItem?.media_type || ""} onChange={(e) => setEditItem({ ...editItem, media_type: e.target.value })} placeholder="image or video" /></div>
            <div><Label>Media URL</Label><Input value={editItem?.media_url || ""} onChange={(e) => setEditItem({ ...editItem, media_url: e.target.value })} /></div>
            <div><Label>Sort Order</Label><Input type="number" value={editItem?.sort_order ?? 0} onChange={(e) => setEditItem({ ...editItem, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex items-center gap-3">
              <Switch checked={editItem?.active ?? true} onCheckedChange={(v) => setEditItem({ ...editItem, active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
              {editItem?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => { if (!open) setDeleteItem(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete testimonial from "{deleteItem?.client_name}"?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
