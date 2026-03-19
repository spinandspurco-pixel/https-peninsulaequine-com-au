import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Calendar, Clock, MapPin, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_blocked: boolean;
  notes: string | null;
}

interface Assessment {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  location: string;
  project_type: string;
  project_notes: string | null;
  slot_date: string;
  slot_time: string;
  status: string;
  created_at: string;
}

export function AssessmentAvailabilityManager() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Add slot form
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("11:00");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (expanded) fetchData();
  }, [expanded]);

  const fetchData = async () => {
    setLoading(true);
    const [slotsRes, assessmentsRes] = await Promise.all([
      supabase
        .from("assessment_availability")
        .select("*")
        .gte("slot_date", new Date().toISOString().split("T")[0])
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true }),
      supabase
        .from("site_assessments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    setSlots((slotsRes.data as Slot[]) || []);
    setAssessments((assessmentsRes.data as Assessment[]) || []);
    setLoading(false);
  };

  const addSlot = async () => {
    if (!newDate || !newStart || !newEnd) return;
    setAdding(true);
    const { error } = await supabase.from("assessment_availability").insert({
      slot_date: newDate,
      start_time: newStart,
      end_time: newEnd,
      is_blocked: false,
    });
    setAdding(false);
    if (error) {
      toast.error("Failed to add slot");
      return;
    }
    toast.success("Slot added");
    setNewDate("");
    fetchData();
  };

  const toggleBlock = async (slot: Slot) => {
    const { error } = await supabase
      .from("assessment_availability")
      .update({ is_blocked: !slot.is_blocked })
      .eq("id", slot.id);
    if (error) {
      toast.error("Update failed");
      return;
    }
    setSlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, is_blocked: !s.is_blocked } : s))
    );
  };

  const deleteSlot = async (id: string) => {
    const { error } = await supabase.from("assessment_availability").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("site_assessments")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Update failed");
      return;
    }
    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    toast.success(`Status updated to ${status}`);
  };

  return (
    <Card className="bg-card/80 border-border/40">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-accent/60" />
            <div>
              <CardTitle className="text-sm font-medium">Site Assessment Manager</CardTitle>
              <CardDescription className="text-[11px]">
                Manage availability and view bookings
              </CardDescription>
            </div>
          </div>
          <Calendar className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6 border-t border-border/30 pt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
          ) : (
            <>
              {/* Add Slot */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">Add Available Time</p>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Date</Label>
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="mt-1 h-9 bg-background/60 border-border/50 rounded-sm text-sm w-40"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Start</Label>
                    <Input
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="mt-1 h-9 bg-background/60 border-border/50 rounded-sm text-sm w-28"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">End</Label>
                    <Input
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="mt-1 h-9 bg-background/60 border-border/50 rounded-sm text-sm w-28"
                    />
                  </div>
                  <Button size="sm" onClick={addSlot} disabled={adding || !newDate} className="text-[10px] uppercase tracking-wider h-9">
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Available Slots */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
                    Available Slots ({slots.length})
                  </p>
                  <Button variant="ghost" size="sm" onClick={fetchData} className="h-7 text-[10px]">
                    <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                  </Button>
                </div>
                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground/50 text-center py-4">No upcoming slots. Add availability above.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between p-2.5 rounded-sm border transition-all ${
                          slot.is_blocked
                            ? "border-destructive/20 bg-destructive/5 opacity-60"
                            : "border-border/30 bg-background/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              {format(new Date(slot.slot_date + "T00:00:00"), "EEE, MMM d")}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                            </p>
                          </div>
                          {slot.is_blocked && (
                            <Badge variant="secondary" className="text-[9px] uppercase tracking-wider bg-destructive/15 text-destructive">
                              Blocked
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!slot.is_blocked}
                            onCheckedChange={() => toggleBlock(slot)}
                          />
                          <Button variant="ghost" size="sm" onClick={() => deleteSlot(slot.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Bookings */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">
                  Recent Assessment Bookings ({assessments.length})
                </p>
                {assessments.length === 0 ? (
                  <p className="text-sm text-muted-foreground/50 text-center py-4">No bookings yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {assessments.map((a) => (
                      <div key={a.id} className="p-3 rounded-sm border border-border/30 bg-background/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{a.client_name}</p>
                          <Badge
                            variant="secondary"
                            className={`text-[9px] uppercase tracking-wider ${
                              a.status === "confirmed"
                                ? "bg-accent/15 text-accent"
                                : a.status === "completed"
                                ? "bg-emerald-600/15 text-emerald-600"
                                : a.status === "cancelled"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {a.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                          <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(a.slot_date + "T00:00:00"), "MMM d")} at {a.slot_time.slice(0, 5)}</p>
                          <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {a.location}</p>
                          <p>{a.project_type}</p>
                          <p>{a.client_email}</p>
                        </div>
                        {a.project_notes && (
                          <p className="text-[11px] text-muted-foreground/70 italic">"{a.project_notes}"</p>
                        )}
                        {a.status === "confirmed" && (
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "completed")} className="h-7 text-[10px] uppercase tracking-wider">
                              Mark Completed
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, "cancelled")} className="h-7 text-[10px] uppercase tracking-wider text-destructive hover:text-destructive">
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
