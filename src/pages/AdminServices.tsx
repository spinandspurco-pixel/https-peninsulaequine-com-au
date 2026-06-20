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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw, ArrowLeft, GripVertical } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type ManagedService = Tables<"managed_services">;

export default function AdminServices() {
  const { user, isAdmin, loading } = useAuth();
  const { isPreview } = useHqMode();
  const canAccess = isAdmin || isPreview;
  const navigate = useNavigate();
  const [services, setServices] = useState<ManagedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editItem, setEditItem] = useState<Partial<ManagedService> | null>(null);
  const [deleteItem, setDeleteItem] = useState<ManagedService | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !canAccess)) navigate("/login");
  }, [user, canAccess, loading, navigate]);

  const fetch = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("managed_services")
      .select("*")
      .order("sort_order", { ascending: true });
    setServices(data || []);
    setIsLoading(false);
  };

  useEffect(() => { if (canAccess) fetch(); }, [canAccess]);

  const handleSave = async () => {
    if (isPreview) { toast.error("View-only in client preview"); return; }
    if (!editItem?.title?.trim() || !editItem?.slug?.trim()) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    const payload = {
      title: editItem.title.trim(),
      slug: editItem.slug.trim(),
      short_description: editItem.short_description || null,
      description: editItem.description || null,
      features: editItem.features || [],
      starting_price: editItem.starting_price || null,
      icon: editItem.icon || "arena",
      image_url: editItem.image_url || null,
      sort_order: editItem.sort_order ?? 0,
      active: editItem.active ?? true,
    };

    if (editItem.id) {
      const { error } = await supabase.from("managed_services").update(payload).eq("id", editItem.id);
      if (error) toast.error("Failed to update"); else toast.success("Service updated");
    } else {
      const { error } = await supabase.from("managed_services").insert(payload);
      if (error) toast.error("Failed to create"); else toast.success("Service created");
    }
    setSaving(false);
    setEditItem(null);
    fetch();
  };

  const handleDelete = async () => {
    if (isPreview) { toast.error("View-only in client preview"); return; }
    if (!deleteItem) return;
    const { error } = await supabase.from("managed_services").delete().eq("id", deleteItem.id);
    if (error) toast.error("Failed to delete"); else toast.success("Deleted");
    setDeleteItem(null);
    fetch();
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
              <h1 className="font-serif text-3xl font-bold text-foreground">Manage Services</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {services.length} services{isPreview && " · view-only preview"}
              </p>
            </div>
            <Button
              onClick={() => setEditItem({ active: true, features: [], sort_order: services.length })}
              disabled={isPreview}
              title={isPreview ? "View-only in client preview" : undefined}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : services.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No services yet. Click "Add Service" to create one.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {services.map((s) => (
                <Card key={s.id} className="group">
                  <CardContent className="flex items-center gap-4 py-4">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{s.title}</h3>
                        {!s.active && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                        {s.starting_price && (
                          <Badge variant="outline" className="text-xs text-accent border-accent/30">
                            From {s.starting_price}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{s.short_description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => setEditItem(s)} disabled={isPreview} title={isPreview ? "View-only" : undefined}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteItem(s)} disabled={isPreview} title={isPreview ? "View-only" : undefined}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => { if (!open) setEditItem(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem?.id ? "Edit Service" : "New Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={editItem?.title || ""} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} /></div>
            <div><Label>Slug *</Label><Input value={editItem?.slug || ""} onChange={(e) => setEditItem({ ...editItem, slug: e.target.value })} placeholder="arena-construction" /></div>
            <div><Label>Short Description</Label><Input value={editItem?.short_description || ""} onChange={(e) => setEditItem({ ...editItem, short_description: e.target.value })} /></div>
            <div><Label>Full Description</Label><Textarea value={editItem?.description || ""} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} rows={3} /></div>
            <div><Label>Starting Price</Label><Input value={editItem?.starting_price || ""} onChange={(e) => setEditItem({ ...editItem, starting_price: e.target.value })} placeholder="$25,000" /></div>
            <div><Label>Features (one per line)</Label><Textarea value={(editItem?.features || []).join("\n")} onChange={(e) => setEditItem({ ...editItem, features: e.target.value.split("\n").filter(Boolean) })} rows={4} placeholder="Custom base preparation&#10;Premium footing" /></div>
            <div><Label>Image URL</Label><Input value={editItem?.image_url || ""} onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} /></div>
            <div><Label>Sort Order</Label><Input type="number" value={editItem?.sort_order ?? 0} onChange={(e) => setEditItem({ ...editItem, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex items-center gap-3">
              <Switch checked={editItem?.active ?? true} onCheckedChange={(v) => setEditItem({ ...editItem, active: v })} />
              <Label>Active (visible on site)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {editItem?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={(open) => { if (!open) setDeleteItem(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteItem?.title}"?</AlertDialogTitle>
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
