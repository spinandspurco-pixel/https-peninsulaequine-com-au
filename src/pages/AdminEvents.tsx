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
import { Plus, Pencil, Trash2, RefreshCw, ArrowLeft, CalendarIcon, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import { PreviewNotice } from "@/components/hq/PreviewNotice";

type ManagedEvent = Tables<"managed_events">;

export default function AdminEvents() {
  const { user, isAdmin, loading } = useAuth();
  const { isPreview } = useHqMode();
  const canAccess = isAdmin || isPreview;
  const navigate = useNavigate();
  const [items, setItems] = useState<ManagedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editItem, setEditItem] = useState<Partial<ManagedEvent> | null>(null);
  const [deleteItem, setDeleteItem] = useState<ManagedEvent | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !canAccess)) navigate("/login");
  }, [user, canAccess, loading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("managed_events").select("*").order("event_date", { ascending: true });
    setItems(data || []);
    setIsLoading(false);
  };

  useEffect(() => { if (canAccess) fetchData(); }, [canAccess]);

  const handleSave = async () => {
    if (isPreview) { toast.error("View-only in client preview"); return; }
    if (!editItem?.title?.trim() || !editItem?.event_date) {
      toast.error("Title and date are required");
      return;
    }
    setSaving(true);
    const payload = {
      title: editItem.title.trim(),
      description: editItem.description || null,
      event_date: editItem.event_date,
      event_time: editItem.event_time || null,
      location: editItem.location || null,
      capacity: editItem.capacity ?? null,
      image_url: editItem.image_url || null,
      active: editItem.active ?? true,
    };

    if (editItem.id) {
      const { error } = await supabase.from("managed_events").update(payload).eq("id", editItem.id);
      if (error) toast.error("Failed to update"); else toast.success("Updated");
    } else {
      const { error } = await supabase.from("managed_events").insert(payload);
      if (error) toast.error("Failed to create"); else toast.success("Created");
    }
    setSaving(false);
    setEditItem(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (isPreview) { toast.error("View-only in client preview"); return; }
    if (!deleteItem) return;
    await supabase.from("managed_events").delete().eq("id", deleteItem.id);
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
              <h1 className="font-serif text-3xl font-bold text-foreground">Manage Events</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {items.length} events{isPreview && " · view-only preview"}
              </p>
            </div>
            <Button onClick={() => setEditItem({ active: true, event_date: format(new Date(), "yyyy-MM-dd") })} disabled={isPreview} title={isPreview ? "View-only" : undefined}>
              <Plus className="h-4 w-4 mr-2" /> Add Event
            </Button>
          </div>
          <PreviewNotice />

          {isLoading ? (
            <div className="flex justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No events yet.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {items.map((ev) => (
                <Card key={ev.id} className="group">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{ev.title}</h3>
                        {!ev.active && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{format(new Date(ev.event_date), "MMM d, yyyy")}</span>
                        {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                        {ev.capacity && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{ev.capacity} spots</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => setEditItem(ev)} disabled={isPreview} title={isPreview ? "View-only" : undefined}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteItem(ev)} disabled={isPreview} title={isPreview ? "View-only" : undefined}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editItem?.id ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={editItem?.title || ""} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={editItem?.description || ""} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date *</Label><Input type="date" value={editItem?.event_date || ""} onChange={(e) => setEditItem({ ...editItem, event_date: e.target.value })} /></div>
              <div><Label>Time</Label><Input type="time" value={editItem?.event_time || ""} onChange={(e) => setEditItem({ ...editItem, event_time: e.target.value })} /></div>
            </div>
            <div><Label>Location</Label><Input value={editItem?.location || ""} onChange={(e) => setEditItem({ ...editItem, location: e.target.value })} /></div>
            <div><Label>Capacity</Label><Input type="number" value={editItem?.capacity ?? ""} onChange={(e) => setEditItem({ ...editItem, capacity: e.target.value ? parseInt(e.target.value) : null })} /></div>
            <div><Label>Image URL</Label><Input value={editItem?.image_url || ""} onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} /></div>
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
