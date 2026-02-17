import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";

type LessonSlot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  slot_type: string;
  max_bookings: number;
  current_bookings: number;
  notes: string | null;
  trainer_id: string | null;
};

const SLOT_TYPES = [
  { value: "lesson", label: "Lesson" },
  { value: "beginner", label: "Foundation" },
  { value: "intermediate", label: "Development" },
  { value: "advanced", label: "Performance" },
];

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export function TrainerAvailabilityManager() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<LessonSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<LessonSlot | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formDate, setFormDate] = useState<Date | undefined>();
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("10:00");
  const [formType, setFormType] = useState("lesson");
  const [formMaxBookings, setFormMaxBookings] = useState("1");
  const [formNotes, setFormNotes] = useState("");

  const fetchSlots = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const today = format(new Date(), "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("lesson_slots")
      .select("*")
      .eq("trainer_id", user.id)
      .gte("slot_date", today)
      .order("slot_date")
      .order("start_time");

    if (error) {
      toast.error("Failed to load slots");
    } else {
      setSlots((data as LessonSlot[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const resetForm = () => {
    setFormDate(undefined);
    setFormStartTime("09:00");
    setFormEndTime("10:00");
    setFormType("lesson");
    setFormMaxBookings("1");
    setFormNotes("");
    setEditingSlot(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (slot: LessonSlot) => {
    setEditingSlot(slot);
    setFormDate(new Date(slot.slot_date + "T00:00:00"));
    setFormStartTime(slot.start_time.slice(0, 5));
    setFormEndTime(slot.end_time.slice(0, 5));
    setFormType(slot.slot_type);
    setFormMaxBookings(String(slot.max_bookings));
    setFormNotes(slot.notes || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !formDate) {
      toast.error("Please select a date");
      return;
    }
    if (formStartTime >= formEndTime) {
      toast.error("End time must be after start time");
      return;
    }

    setSaving(true);
    const payload = {
      slot_date: format(formDate, "yyyy-MM-dd"),
      start_time: formStartTime,
      end_time: formEndTime,
      slot_type: formType,
      max_bookings: parseInt(formMaxBookings) || 1,
      notes: formNotes || null,
      trainer_id: user.id,
    };

    if (editingSlot) {
      const { error } = await supabase
        .from("lesson_slots")
        .update(payload)
        .eq("id", editingSlot.id);
      if (error) {
        toast.error("Failed to update slot");
      } else {
        toast.success("Slot updated");
      }
    } else {
      const { error } = await supabase
        .from("lesson_slots")
        .insert(payload);
      if (error) {
        toast.error("Failed to create slot");
      } else {
        toast.success("Slot created");
      }
    }

    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchSlots();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("lesson_slots")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete slot");
    } else {
      toast.success("Slot deleted");
      fetchSlots();
    }
    setDeleteConfirm(null);
  };

  // Group slots by date
  const groupedSlots: Record<string, LessonSlot[]> = {};
  for (const slot of slots) {
    if (!groupedSlots[slot.slot_date]) groupedSlots[slot.slot_date] = [];
    groupedSlots[slot.slot_date].push(slot);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            My Availability
          </CardTitle>
          <CardDescription>Create and manage your lesson time slots</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchSlots} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-1" />
            Add Slot
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading slots...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-3">📅</div>
            <p className="font-medium">No upcoming slots</p>
            <p className="text-sm mt-1">Tap "Add Slot" to publish your availability.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, dateSlots]) => (
              <div key={date}>
                <h4 className="font-serif text-sm font-semibold text-foreground mb-2">
                  {format(new Date(date + "T00:00:00"), "EEEE, MMMM d, yyyy")}
                </h4>
                <div className="space-y-2">
                  {dateSlots.map((slot) => {
                    const spotsLeft = slot.max_bookings - slot.current_bookings;
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            <Clock className="h-3.5 w-3.5 text-accent" />
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                          </div>
                          <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                            {SLOT_TYPES.find((t) => t.value === slot.slot_type)?.label || slot.slot_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {spotsLeft}/{slot.max_bookings} spots
                          </span>
                          {slot.notes && (
                            <span className="text-xs text-muted-foreground italic hidden sm:inline">
                              — {slot.notes}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(slot)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {slot.current_bookings === 0 ? (
                            deleteConfirm === slot.id ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => handleDelete(slot.id)}
                              >
                                Confirm
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteConfirm(slot.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )
                          ) : (
                            <span className="text-[10px] text-muted-foreground flex items-center px-2">
                              Has bookings
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingSlot ? "Edit Slot" : "Add Availability Slot"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDate ? format(formDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate}
                    onSelect={setFormDate}
                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Lesson Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max bookings */}
            <div className="space-y-2">
              <Label>Max Students</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formMaxBookings}
                onChange={(e) => setFormMaxBookings(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="e.g. Outdoor arena, bring own helmet"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingSlot ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
