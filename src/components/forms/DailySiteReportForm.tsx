import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function DailySiteReportForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    project_name: "",
    site_address: "",
    date: format(new Date(), "yyyy-MM-dd"),
    reported_by: "",
    weather: "fine",
    start_time: "07:00",
    end_time: "15:30",
    workers_on_site: "",
    subcontractors_on_site: "",
    work_completed: "",
    materials_used: "",
    equipment_used: "",
    delays_issues: "",
    safety_incidents: "none",
    visitors_on_site: "",
    photos_attached: false,
    next_day_plan: "",
    sign_off_name: "",
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Project / Job Name *</Label>
          <Input value={form.project_name} onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} required placeholder="e.g. Arena Build — Red Hill" />
        </div>
        <div className="space-y-2">
          <Label>Site Address *</Label>
          <Input value={form.site_address} onChange={e => setForm(p => ({ ...p, site_address: e.target.value }))} required placeholder="123 Main Rd, Red Hill VIC" />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Reported By *</Label>
          <Input value={form.reported_by} onChange={e => setForm(p => ({ ...p, reported_by: e.target.value }))} required placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label>Weather</Label>
          <Select value={form.weather} onValueChange={v => setForm(p => ({ ...p, weather: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fine">Fine / Clear</SelectItem>
              <SelectItem value="overcast">Overcast</SelectItem>
              <SelectItem value="rain">Rain</SelectItem>
              <SelectItem value="windy">Windy</SelectItem>
              <SelectItem value="hot">Extreme Heat</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Workers on Site</Label>
          <Input type="number" value={form.workers_on_site} onChange={e => setForm(p => ({ ...p, workers_on_site: e.target.value }))} placeholder="e.g. 4" />
        </div>
        <div className="space-y-2">
          <Label>Subcontractors</Label>
          <Input value={form.subcontractors_on_site} onChange={e => setForm(p => ({ ...p, subcontractors_on_site: e.target.value }))} placeholder="e.g. Electrician — ABC Co" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Work Completed Today *</Label>
        <Textarea value={form.work_completed} onChange={e => setForm(p => ({ ...p, work_completed: e.target.value }))} required placeholder="Describe work completed..." rows={3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Materials Used</Label>
          <Textarea value={form.materials_used} onChange={e => setForm(p => ({ ...p, materials_used: e.target.value }))} placeholder="List materials..." rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Equipment Used</Label>
          <Textarea value={form.equipment_used} onChange={e => setForm(p => ({ ...p, equipment_used: e.target.value }))} placeholder="List equipment..." rows={2} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Delays / Issues</Label>
        <Textarea value={form.delays_issues} onChange={e => setForm(p => ({ ...p, delays_issues: e.target.value }))} placeholder="Any delays, issues or concerns..." rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Safety Incidents</Label>
        <Select value={form.safety_incidents} onValueChange={v => setForm(p => ({ ...p, safety_incidents: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">✅ None</SelectItem>
            <SelectItem value="near_miss">⚠️ Near Miss</SelectItem>
            <SelectItem value="minor">🟡 Minor Incident</SelectItem>
            <SelectItem value="serious">🔴 Serious — Report Required</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Plan for Tomorrow</Label>
        <Textarea value={form.next_day_plan} onChange={e => setForm(p => ({ ...p, next_day_plan: e.target.value }))} placeholder="Brief plan for next work day..." rows={2} />
      </div>

      <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
        <div className="space-y-2">
          <Label>Sign-Off Name *</Label>
          <Input value={form.sign_off_name} onChange={e => setForm(p => ({ ...p, sign_off_name: e.target.value }))} required placeholder="Your full name" />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit Daily Site Report
      </Button>
    </form>
  );
}
