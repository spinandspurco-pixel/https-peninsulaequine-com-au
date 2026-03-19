import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { DocumentPhotoUpload } from "./DocumentPhotoUpload";

export function IncidentReportForm({ onSubmit, loading, userId, defaults }: { onSubmit: (data: any) => void; loading: boolean; userId?: string; defaults?: { project_name: string; site_address: string } }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    project_name: defaults?.project_name || "",
    site_address: defaults?.site_address || "",
    incident_date: format(new Date(), "yyyy-MM-dd"),
    incident_time: format(new Date(), "HH:mm"),
    reported_by: "",
    severity: "minor",
    incident_type: "injury",
    persons_involved: "",
    description: "",
    immediate_actions: "",
    injuries_sustained: "",
    medical_treatment: "none",
    witnesses: "",
    root_cause: "",
    corrective_actions: "",
    work_stopped: false,
    authorities_notified: false,
    sign_off_name: "",
    sign_off_agreed: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, photo_urls: photos });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Project / Job Name *</Label>
          <Input value={form.project_name} onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} required placeholder="e.g. Arena Build — Red Hill" />
        </div>
        <div className="space-y-2">
          <Label>Site Address *</Label>
          <Input value={form.site_address} onChange={e => setForm(p => ({ ...p, site_address: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Incident Date *</Label>
          <Input type="date" value={form.incident_date} onChange={e => setForm(p => ({ ...p, incident_date: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Incident Time *</Label>
          <Input type="time" value={form.incident_time} onChange={e => setForm(p => ({ ...p, incident_time: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label>Reported By *</Label>
          <Input value={form.reported_by} onChange={e => setForm(p => ({ ...p, reported_by: e.target.value }))} required placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label>Severity *</Label>
          <Select value={form.severity} onValueChange={v => setForm(p => ({ ...p, severity: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="near_miss">⚠️ Near Miss</SelectItem>
              <SelectItem value="minor">🟡 Minor</SelectItem>
              <SelectItem value="moderate">🟠 Moderate</SelectItem>
              <SelectItem value="serious">🔴 Serious</SelectItem>
              <SelectItem value="critical">⛔ Critical / Notifiable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Incident Type *</Label>
          <Select value={form.incident_type} onValueChange={v => setForm(p => ({ ...p, incident_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="injury">🤕 Personal Injury</SelectItem>
              <SelectItem value="property_damage">🏚️ Property Damage</SelectItem>
              <SelectItem value="environmental">🌿 Environmental</SelectItem>
              <SelectItem value="equipment_failure">⚙️ Equipment Failure</SelectItem>
              <SelectItem value="horse_incident">🐴 Horse / Animal Incident</SelectItem>
              <SelectItem value="vehicle">🚗 Vehicle Incident</SelectItem>
              <SelectItem value="other">📋 Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Persons Involved</Label>
          <Input value={form.persons_involved} onChange={e => setForm(p => ({ ...p, persons_involved: e.target.value }))} placeholder="Names of all involved" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description of Incident *</Label>
        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required placeholder="Describe exactly what happened, where, and how..." rows={4} />
      </div>

      <div className="space-y-2">
        <Label>Immediate Actions Taken *</Label>
        <Textarea value={form.immediate_actions} onChange={e => setForm(p => ({ ...p, immediate_actions: e.target.value }))} required placeholder="What was done immediately after the incident..." rows={3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Injuries Sustained</Label>
          <Textarea value={form.injuries_sustained} onChange={e => setForm(p => ({ ...p, injuries_sustained: e.target.value }))} placeholder="Describe any injuries..." rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Medical Treatment</Label>
          <Select value={form.medical_treatment} onValueChange={v => setForm(p => ({ ...p, medical_treatment: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None Required</SelectItem>
              <SelectItem value="first_aid">First Aid On Site</SelectItem>
              <SelectItem value="doctor">Doctor / GP Visit</SelectItem>
              <SelectItem value="hospital">Hospital / Emergency</SelectItem>
              <SelectItem value="ambulance">Ambulance Called</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Witnesses</Label>
        <Input value={form.witnesses} onChange={e => setForm(p => ({ ...p, witnesses: e.target.value }))} placeholder="Names and contact details of witnesses" />
      </div>

      <div className="space-y-2">
        <Label>Root Cause Analysis</Label>
        <Textarea value={form.root_cause} onChange={e => setForm(p => ({ ...p, root_cause: e.target.value }))} placeholder="What contributed to the incident..." rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Corrective Actions / Recommendations</Label>
        <Textarea value={form.corrective_actions} onChange={e => setForm(p => ({ ...p, corrective_actions: e.target.value }))} placeholder="Steps to prevent recurrence..." rows={3} />
      </div>

      {userId && (
        <DocumentPhotoUpload userId={userId} photos={photos} onPhotosChange={setPhotos} maxPhotos={10} />
      )}

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={form.work_stopped} onCheckedChange={(c) => setForm(p => ({ ...p, work_stopped: !!c }))} />
          <span className="text-sm">Work was stopped following this incident</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={form.authorities_notified} onCheckedChange={(c) => setForm(p => ({ ...p, authorities_notified: !!c }))} />
          <span className="text-sm">Authorities / WorkSafe notified</span>
        </label>
      </div>

      <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
        <Label className="text-base font-semibold">Sign-Off Declaration</Label>
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input value={form.sign_off_name} onChange={e => setForm(p => ({ ...p, sign_off_name: e.target.value }))} required placeholder="Your full name" />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox checked={form.sign_off_agreed} onCheckedChange={(c) => setForm(p => ({ ...p, sign_off_agreed: !!c }))} className="mt-0.5" />
          <span className="text-sm">I confirm this report is accurate and complete to the best of my knowledge.</span>
        </label>
      </div>

      <Button type="submit" disabled={loading || !form.sign_off_agreed} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Submit Incident Report
      </Button>
    </form>
  );
}
